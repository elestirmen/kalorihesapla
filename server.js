const crypto = require('crypto');
const fs = require('fs');
const http = require('http');
const path = require('path');
const vm = require('vm');
const { createPublicMenuWorkbook } = require('./public-excel');

const PORT = Number(process.env.PORT) || 8080;
const ROOT = __dirname;
const DATABASE_PATH = process.env.DATABASE_PATH || path.join(ROOT, 'data', 'users.json');
const AUDIT_LOG_PATH = process.env.AUDIT_LOG_PATH || path.join(ROOT, 'data', 'audit-log.jsonl');
const PUBLIC_MENU_USERNAME = 'kun';
const sessions = new Map();
const MAX_STATE_BYTES = 5 * 1024 * 1024;
const PUBLIC_API_VERSION = '1';
const MAX_AUDIT_ENTRIES = 5000;
const CLIENT_AUDIT_ACTIONS = Object.freeze({
  export_json: 'Hafta JSON olarak indirildi',
  export_excel: 'Excel dosyası indirildi',
  backup_export: 'Tam yedek indirildi',
  print: 'Yazdırma ekranı açıldı'
});

function loadXlsx() {
  const context = {};
  context.window = context;
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(ROOT, 'js', 'xlsx-js-style.min.js'), 'utf8'),
    context,
    { filename: 'xlsx-js-style.min.js' }
  );
  return context.XLSX;
}

function loadPublicCatalog() {
  const context = {};
  vm.createContext(context);
  const source = [
    fs.readFileSync(path.join(ROOT, 'js', 'allergens.js'), 'utf8'),
    fs.readFileSync(path.join(ROOT, 'js', 'data.js'), 'utf8'),
    'this.catalog = { ALLERGENS, ALLERGEN_STATUS_LABELS, DEFAULT_ALLERGEN_INFO, FOOD_ALLERGEN_PROFILES, FOOD_CATEGORIES, BASE_FOODS };'
  ].join('\n');
  vm.runInContext(source, context, { filename: 'public-menu-catalog.js' });
  return context.catalog;
}

const PUBLIC_CATALOG = loadPublicCatalog();
const XLSX = loadXlsx();

function readDatabase() {
  try { return JSON.parse(fs.readFileSync(DATABASE_PATH, 'utf8')); }
  catch { return { users: {} }; }
}

function writeDatabase(database) {
  fs.mkdirSync(path.dirname(DATABASE_PATH), { recursive: true });
  const temporaryPath = `${DATABASE_PATH}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(database, null, 2), { mode: 0o600 });
  fs.renameSync(temporaryPath, DATABASE_PATH);
}

function compactAuditValue(value) {
  if (value === undefined) return null;
  if (value === null || typeof value === 'boolean' || typeof value === 'number') return value;
  if (typeof value === 'string') return value.slice(0, 500);
  try {
    const serialized = JSON.stringify(value);
    return serialized.length <= 5000 ? value : `${serialized.slice(0, 4997)}...`;
  } catch {
    return String(value).slice(0, 500);
  }
}

function maskIp(request) {
  const forwarded = String(request.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const raw = forwarded || request.socket.remoteAddress || '';
  const ipv4 = raw.replace(/^::ffff:/, '').match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4) return `${ipv4[1]}.${ipv4[2]}.${ipv4[3]}.0`;
  const groups = raw.split(':').filter(Boolean);
  return groups.length ? `${groups.slice(0, 3).join(':')}::` : '';
}

function createAuditRecord(entry, request) {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    owner: String(entry.owner || entry.actor || 'system').slice(0, 32),
    actor: String(entry.actor || 'system').slice(0, 32),
    action: String(entry.action || 'İşlem').slice(0, 120),
    category: String(entry.category || 'system').slice(0, 40),
    target: String(entry.target || '').slice(0, 160),
    detail: String(entry.detail || '').slice(0, 500),
    before: compactAuditValue(entry.before),
    after: compactAuditValue(entry.after),
    ip: request ? maskIp(request) : '',
    userAgent: request ? String(request.headers['user-agent'] || '').slice(0, 300) : ''
  };
}

function appendAuditLogs(entries, request) {
  const records = entries.map(entry => createAuditRecord(entry, request));
  fs.mkdirSync(path.dirname(AUDIT_LOG_PATH), { recursive: true });
  let lines = [];
  try { lines = fs.readFileSync(AUDIT_LOG_PATH, 'utf8').trim().split('\n').filter(Boolean); } catch {}
  lines.push(...records.map(record => JSON.stringify(record)));
  const temporaryPath = `${AUDIT_LOG_PATH}.tmp`;
  fs.writeFileSync(temporaryPath, `${lines.slice(-MAX_AUDIT_ENTRIES).join('\n')}\n`, { mode: 0o600 });
  fs.renameSync(temporaryPath, AUDIT_LOG_PATH);
  return records;
}

function appendAuditLog(entry, request) {
  return appendAuditLogs([entry], request)[0];
}

function readAuditLogs(owner, query = {}) {
  let records = [];
  try {
    records = fs.readFileSync(AUDIT_LOG_PATH, 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => {
        try { return JSON.parse(line); } catch { return null; }
      })
      .filter(record => record && record.owner === owner);
  } catch {}

  const category = String(query.category || '');
  const from = String(query.from || '');
  const to = String(query.to || '');
  const search = String(query.search || '').toLocaleLowerCase('tr-TR').slice(0, 100);
  if (category) records = records.filter(record => record.category === category);
  if (/^\d{4}-\d{2}-\d{2}$/.test(from)) records = records.filter(record => record.timestamp >= `${from}T00:00:00.000Z`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(to)) records = records.filter(record => record.timestamp <= `${to}T23:59:59.999Z`);
  if (search) {
    records = records.filter(record => (
      `${record.actor} ${record.action} ${record.target} ${record.detail}`.toLocaleLowerCase('tr-TR').includes(search)
    ));
  }
  const limit = Math.min(Math.max(Number(query.limit) || 250, 1), 500);
  return records.slice(-limit).reverse();
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((result, key) => {
    if (key !== 'updatedAt') result[key] = stableValue(value[key]);
    return result;
  }, {});
}

function equalStateValue(left, right) {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));
}

function parsedStateValue(state, key, fallback) {
  return safeJsonParse(state?.[key], fallback);
}

function summarizeWeek(week) {
  const days = Array.isArray(week?.days) ? week.days : [];
  const foodCount = days.reduce((total, day) => (
    total + (Array.isArray(day?.lunch) ? day.lunch.filter(Boolean).length : 0)
    + (Array.isArray(day?.dinner) ? day.dinner.filter(Boolean).length : 0)
  ), 0);
  return {
    label: String(week?.label || ''),
    startDate: String(week?.startDate || ''),
    endDate: String(week?.endDate || ''),
    foodCount,
    days: days.map(day => ({
      date: String(day?.date || ''),
      lunch: Array.isArray(day?.lunch) ? day.lunch : [],
      lunchPortions: Array.isArray(day?.lunchPortions) ? day.lunchPortions : [],
      dinner: Array.isArray(day?.dinner) ? day.dinner : [],
      dinnerPortions: Array.isArray(day?.dinnerPortions) ? day.dinnerPortions : []
    }))
  };
}

function diffObjectRecords(before, after, config) {
  const entries = [];
  const beforeMap = before && typeof before === 'object' && !Array.isArray(before) ? before : {};
  const afterMap = after && typeof after === 'object' && !Array.isArray(after) ? after : {};
  const keys = new Set([...Object.keys(beforeMap), ...Object.keys(afterMap)]);
  keys.forEach(key => {
    if (!Object.prototype.hasOwnProperty.call(beforeMap, key)) {
      entries.push({ action: config.added, target: key, before: null, after: config.summary(afterMap[key]) });
    } else if (!Object.prototype.hasOwnProperty.call(afterMap, key)) {
      entries.push({ action: config.removed, target: key, before: config.summary(beforeMap[key]), after: null });
    } else if (!equalStateValue(beforeMap[key], afterMap[key])) {
      entries.push({
        action: config.changed,
        target: key,
        before: config.summary(beforeMap[key]),
        after: config.summary(afterMap[key])
      });
    }
  });
  return entries;
}

function buildStateAuditEntries(username, beforeState, afterState) {
  const entries = [];
  const addEntries = (category, items) => items.forEach(item => entries.push({
    owner: username,
    actor: username,
    category,
    ...item
  }));

  addEntries('menu', diffObjectRecords(
    parsedStateValue(beforeState, 'kalori_haftalik_menuler', {}),
    parsedStateValue(afterState, 'kalori_haftalik_menuler', {}),
    {
      added: 'Hafta oluşturuldu',
      removed: 'Hafta silindi',
      changed: 'Haftalık menü güncellendi',
      summary: summarizeWeek
    }
  ));

  const beforeFoods = parsedStateValue(beforeState, 'kalori_custom_foods', []);
  const afterFoods = parsedStateValue(afterState, 'kalori_custom_foods', []);
  const foodMap = foods => Object.fromEntries((Array.isArray(foods) ? foods : []).filter(food => food?.id).map(food => [food.id, food]));
  addEntries('food', diffObjectRecords(foodMap(beforeFoods), foodMap(afterFoods), {
    added: 'Özel yemek eklendi',
    removed: 'Özel yemek silindi',
    changed: 'Özel yemek güncellendi',
    summary: food => ({ name: food?.name || '', calories: food?.calories ?? null, category: food?.category || '' })
  }));

  [
    ['kalori_calorie_overrides', 'calorie', 'Kalori değeri eklendi', 'Kalori değeri sıfırlandı', 'Kalori değeri değiştirildi'],
    ['kalori_allergen_overrides', 'allergen', 'Alerjen profili eklendi', 'Alerjen profili sıfırlandı', 'Alerjen profili değiştirildi']
  ].forEach(([key, category, added, removed, changed]) => {
    addEntries(category, diffObjectRecords(
      parsedStateValue(beforeState, key, {}),
      parsedStateValue(afterState, key, {}),
      { added, removed, changed, summary: value => value }
    ));
  });

  const beforeFavorites = parsedStateValue(beforeState, 'kalori_favorites', []);
  const afterFavorites = parsedStateValue(afterState, 'kalori_favorites', []);
  if (!equalStateValue(beforeFavorites, afterFavorites)) {
    entries.push({
      owner: username,
      actor: username,
      category: 'favorite',
      action: 'Favoriler güncellendi',
      target: 'Yemek favorileri',
      before: { count: Array.isArray(beforeFavorites) ? beforeFavorites.length : 0 },
      after: { count: Array.isArray(afterFavorites) ? afterFavorites.length : 0 }
    });
  }

  const beforeSettings = parsedStateValue(beforeState, 'kalori_ayarlar', {});
  const afterSettings = parsedStateValue(afterState, 'kalori_ayarlar', {});
  const settingLabels = {
    dailyCalorieGoal: 'Günlük kalori hedefi değiştirildi',
    lastWeekId: 'Aktif hafta değiştirildi',
    avoidedAllergens: 'Kaçınılan alerjenler değiştirildi',
    possibleContainsUnsafe: 'Olası alerjen tercihi değiştirildi',
    mayContainUnsafe: 'Çapraz temas tercihi değiştirildi',
    excludeUnknownAllergens: 'Bilinmeyen alerjen tercihi değiştirildi'
  };
  new Set([...Object.keys(beforeSettings || {}), ...Object.keys(afterSettings || {})]).forEach(key => {
    if (!equalStateValue(beforeSettings?.[key], afterSettings?.[key])) {
      entries.push({
        owner: username,
        actor: username,
        category: 'settings',
        action: settingLabels[key] || 'Ayar değiştirildi',
        target: key,
        before: beforeSettings?.[key] ?? null,
        after: afterSettings?.[key] ?? null
      });
    }
  });
  return entries;
}

function ensureDefaultUser() {
  const database = readDatabase();
  if (!database.users.kun) {
    database.users.kun = { ...passwordHash('kun2026'), state: {}, createdAt: new Date().toISOString() };
    writeDatabase(database);
  }
}

function normalizeUsername(value) {
  return String(value || '').trim().toLocaleLowerCase('tr-TR');
}

function passwordHash(password, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(String(password), salt, 32).toString('hex') };
}

function send(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(payload));
}

function sendPublic(request, response, status, payload) {
  const body = JSON.stringify(payload);
  const etag = `"${crypto.createHash('sha256').update(body).digest('base64url')}"`;
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'Content-Type': 'application/json; charset=utf-8',
    ETag: etag
  };
  if (request.headers['if-none-match'] === etag) {
    response.writeHead(304, headers);
    return response.end();
  }
  response.writeHead(status, headers);
  response.end(body);
}

function sendPublicExcel(request, response, menu) {
  const workbook = createPublicMenuWorkbook(XLSX, menu);
  const body = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer', compression: true });
  const etag = `"${crypto.createHash('sha256').update(body).digest('base64url')}"`;
  const filename = `menu_${menu.startDate || menu.weekId}.xlsx`;
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Expose-Headers': 'Content-Disposition, ETag',
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length': body.length,
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ETag: etag
  };
  if (request.headers['if-none-match'] === etag) {
    response.writeHead(304, headers);
    return response.end();
  }
  appendAuditLog({
    owner: PUBLIC_MENU_USERNAME,
    actor: 'anonymous',
    action: 'Herkese açık Excel indirildi',
    category: 'export',
    target: menu.weekId,
    detail: filename
  }, request);
  response.writeHead(200, headers);
  response.end(body);
}

function safeJsonParse(value, fallback) {
  try { return typeof value === 'string' ? JSON.parse(value) : fallback; }
  catch { return fallback; }
}

function normalizePublicAllergenInfo(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : PUBLIC_CATALOG.DEFAULT_ALLERGEN_INFO;
  const used = new Set();
  const normalizeGroup = group => (Array.isArray(group) ? group : []).reduce((items, id) => {
    if (typeof id !== 'string' || used.has(id) || !PUBLIC_CATALOG.ALLERGENS[id]) return items;
    used.add(id);
    const allergen = PUBLIC_CATALOG.ALLERGENS[id];
    items.push({ id, name: allergen.name, shortName: allergen.shortName });
    return items;
  }, []);
  const status = Object.prototype.hasOwnProperty.call(PUBLIC_CATALOG.ALLERGEN_STATUS_LABELS, source.status)
    ? source.status
    : 'unknown';
  return {
    contains: normalizeGroup(source.contains),
    possibleContains: normalizeGroup(source.possibleContains),
    mayContain: normalizeGroup(source.mayContain),
    status,
    statusLabel: PUBLIC_CATALOG.ALLERGEN_STATUS_LABELS[status],
    note: typeof source.note === 'string' ? source.note.trim().slice(0, 500) : ''
  };
}

function buildPublicFoodMap(state) {
  const customFoods = safeJsonParse(state.kalori_custom_foods, []);
  const calorieOverrides = safeJsonParse(state.kalori_calorie_overrides, {});
  const allergenOverrides = safeJsonParse(state.kalori_allergen_overrides, {});
  const foods = new Map();

  [...PUBLIC_CATALOG.BASE_FOODS, ...(Array.isArray(customFoods) ? customFoods : [])].forEach(food => {
    if (!food || typeof food.id !== 'string' || foods.has(food.id)) return;
    const originalCalories = Number(food.calories);
    if (!food.name || !Number.isFinite(originalCalories) || originalCalories < 0) return;
    const hasCalorieOverride = Object.prototype.hasOwnProperty.call(calorieOverrides || {}, food.id);
    const overriddenCalories = Number(calorieOverrides?.[food.id]);
    const validCalorieOverride = hasCalorieOverride && Number.isFinite(overriddenCalories) && overriddenCalories >= 0;
    const calories = validCalorieOverride
      ? Math.round(overriddenCalories)
      : Math.round(originalCalories);
    const hasAllergenOverride = Object.prototype.hasOwnProperty.call(allergenOverrides || {}, food.id);
    const allergenSource = allergenOverrides?.[food.id]
      || (food.isCustom ? food.allergenInfo : PUBLIC_CATALOG.FOOD_ALLERGEN_PROFILES[food.id])
      || food.allergenInfo
      || PUBLIC_CATALOG.DEFAULT_ALLERGEN_INFO;
    foods.set(food.id, {
      id: food.id,
      name: String(food.name).trim(),
      category: food.category,
      categoryName: PUBLIC_CATALOG.FOOD_CATEGORIES[food.category]?.name || 'Diğer',
      portionLabel: typeof food.portion === 'string' && food.portion.trim() ? food.portion.trim() : '1 porsiyon',
      caloriesPerPortion: calories,
      baseCalories: calories,
      originalCalories: Math.round(originalCalories),
      isCalorieOverridden: validCalorieOverride,
      isAllergenOverridden: hasAllergenOverride,
      isCustom: food.isCustom === true,
      allergens: normalizePublicAllergenInfo(allergenSource)
    });
  });

  return foods;
}

function materializePublicFoods(state, updatedAt = null) {
  const foods = [...buildPublicFoodMap(state || {}).values()]
    .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  const categories = Object.entries(PUBLIC_CATALOG.FOOD_CATEGORIES).map(([id, category]) => ({
    id,
    name: category.name
  }));
  const allergenDefinitions = Object.entries(PUBLIC_CATALOG.ALLERGENS).map(([id, allergen]) => ({
    id,
    name: allergen.name,
    shortName: allergen.shortName
  }));
  return {
    apiVersion: PUBLIC_API_VERSION,
    updatedAt,
    count: foods.length,
    categories,
    allergenDefinitions,
    foods,
    disclaimer: 'Kalori ve alerjen bilgileri genel bilgilendirme amaçlıdır; tarif, ürün etiketi ve çapraz temas koşulları ayrıca kontrol edilmelidir.'
  };
}

function buildPublicMeal(foodIds, portions, foods) {
  const ids = Array.isArray(foodIds) ? foodIds : [];
  const multipliers = Array.isArray(portions) ? portions : [];
  const items = ids.reduce((mealItems, foodId, slotIndex) => {
    const food = foods.get(foodId);
    if (!food) return mealItems;
    const candidate = Number(multipliers[slotIndex]);
    const portionMultiplier = Number.isFinite(candidate) && candidate > 0
      ? Math.round(candidate * 100) / 100
      : 1;
    mealItems.push({
      slot: slotIndex + 1,
      ...food,
      portionMultiplier,
      calories: Math.round(food.baseCalories * portionMultiplier)
    });
    return mealItems;
  }, []);
  return {
    totalCalories: items.reduce((total, item) => total + item.calories, 0),
    items
  };
}

function materializePublicMenus(state) {
  const weeks = safeJsonParse(state?.kalori_haftalik_menuler, {});
  if (!weeks || typeof weeks !== 'object' || Array.isArray(weeks)) return [];
  const foods = buildPublicFoodMap(state || {});

  return Object.entries(weeks).reduce((menus, [weekId, week]) => {
    if (!/^\d{4}-W\d{2}$/.test(weekId) || !week || typeof week !== 'object' || !Array.isArray(week.days)) {
      return menus;
    }
    const days = week.days.map(day => {
      const lunch = buildPublicMeal(day?.lunch, day?.lunchPortions, foods);
      const dinner = buildPublicMeal(day?.dinner, day?.dinnerPortions, foods);
      return {
        date: typeof day?.date === 'string' ? day.date : '',
        dayName: typeof day?.dayName === 'string' ? day.dayName : '',
        meals: { lunch, dinner },
        totalCalories: lunch.totalCalories + dinner.totalCalories
      };
    });
    const totalCalories = days.reduce((total, day) => total + day.totalCalories, 0);
    menus.push({
      apiVersion: PUBLIC_API_VERSION,
      weekId,
      startDate: typeof week.startDate === 'string' ? week.startDate : days[0]?.date || '',
      endDate: typeof week.endDate === 'string' ? week.endDate : days.at(-1)?.date || '',
      label: typeof week.label === 'string' ? week.label : weekId,
      updatedAt: typeof week.updatedAt === 'string' ? week.updatedAt : null,
      totalCalories,
      averageDailyCalories: days.length ? Math.round(totalCalories / days.length) : 0,
      days,
      disclaimer: 'Kalori ve alerjen bilgileri genel bilgilendirme amaçlıdır; tarif, ürün etiketi ve çapraz temas koşulları ayrıca kontrol edilmelidir.'
    });
    return menus;
  }, []).sort((a, b) => b.startDate.localeCompare(a.startDate));
}

function getPublicMenus() {
  const state = readDatabase().users?.[PUBLIC_MENU_USERNAME]?.state || {};
  return materializePublicMenus(state);
}

function getPublicFoods() {
  const user = readDatabase().users?.[PUBLIC_MENU_USERNAME];
  return materializePublicFoods(user?.state || {}, user?.updatedAt || null);
}

function getIstanbulDate() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date()).reduce((values, part) => {
    values[part.type] = part.value;
    return values;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => {
      body += chunk;
      if (body.length > MAX_STATE_BYTES) reject(new Error('İstek çok büyük.'));
    });
    request.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(new Error('Geçersiz JSON.')); }
    });
  });
}

function createSession(username) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, username);
  return token;
}

function getSessionUser(request) {
  const token = String(request.headers.authorization || '').replace(/^Bearer\s+/i, '');
  return sessions.get(token) || null;
}

async function api(request, response, pathname) {
  const query = Object.fromEntries(new URL(request.url, `http://${request.headers.host}`).searchParams);
  if (pathname.startsWith('/api/public/v1/')) {
    if (request.method === 'OPTIONS') {
      response.writeHead(204, {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Max-Age': '86400'
      });
      return response.end();
    }

    if (request.method === 'GET' && pathname === '/api/public/v1/menus') {
      const menus = getPublicMenus();
      return sendPublic(request, response, 200, {
        apiVersion: PUBLIC_API_VERSION,
        count: menus.length,
        menus
      });
    }

    if (request.method === 'GET' && pathname === '/api/public/v1/foods') {
      return sendPublic(request, response, 200, getPublicFoods());
    }

    if (request.method === 'GET' && pathname === '/api/public/v1/menu/current.xlsx') {
      const today = getIstanbulDate();
      const menu = getPublicMenus().find(item => item.startDate <= today && item.endDate >= today);
      return menu
        ? sendPublicExcel(request, response, menu)
        : sendPublic(request, response, 404, { error: 'Bu hafta için yayımlanmış menü bulunamadı.' });
    }

    if (request.method === 'GET' && pathname === '/api/public/v1/menu/current') {
      const today = getIstanbulDate();
      const menu = getPublicMenus().find(item => item.startDate <= today && item.endDate >= today);
      return menu
        ? sendPublic(request, response, 200, menu)
        : sendPublic(request, response, 404, { error: 'Bu hafta için yayımlanmış menü bulunamadı.' });
    }

    const excelWeekMatch = pathname.match(/^\/api\/public\/v1\/menus\/(\d{4}-W\d{2})\.xlsx$/);
    if (request.method === 'GET' && excelWeekMatch) {
      const menu = getPublicMenus().find(item => item.weekId === excelWeekMatch[1]);
      return menu
        ? sendPublicExcel(request, response, menu)
        : sendPublic(request, response, 404, { error: 'Menü bulunamadı.' });
    }

    const weekMatch = pathname.match(/^\/api\/public\/v1\/menus\/(\d{4}-W\d{2})$/);
    if (request.method === 'GET' && weekMatch) {
      const menu = getPublicMenus().find(item => item.weekId === weekMatch[1]);
      return menu
        ? sendPublic(request, response, 200, menu)
        : sendPublic(request, response, 404, { error: 'Menü bulunamadı.' });
    }

    return sendPublic(request, response, 404, { error: 'Bulunamadı.' });
  }

  if (request.method === 'POST' && pathname === '/api/auth/register') {
    const { username: rawUsername, password } = await readJson(request);
    const username = normalizeUsername(rawUsername);
    if (!/^[a-z0-9çğıöşü_-]{3,32}$/i.test(username) || String(password || '').length < 4) {
      return send(response, 400, { error: 'Kullanıcı adı 3-32 karakter, parola en az 4 karakter olmalıdır.' });
    }
    const database = readDatabase();
    if (database.users[username]) return send(response, 409, { error: 'Bu kullanıcı adı zaten kullanılıyor.' });
    const credentials = passwordHash(password);
    database.users[username] = { ...credentials, state: {}, createdAt: new Date().toISOString() };
    writeDatabase(database);
    try {
      appendAuditLog({
        owner: username,
        actor: username,
        action: 'Kullanıcı hesabı oluşturuldu',
        category: 'auth',
        target: username
      }, request);
    } catch (error) {
      delete database.users[username];
      writeDatabase(database);
      throw error;
    }
    return send(response, 201, { token: createSession(username), username });
  }

  if (request.method === 'POST' && pathname === '/api/auth/login') {
    const { username: rawUsername, password } = await readJson(request);
    const username = normalizeUsername(rawUsername);
    const user = readDatabase().users[username];
    if (!user) return send(response, 401, { error: 'Kullanıcı adı veya parola hatalı.' });
    const candidate = passwordHash(password, user.salt).hash;
    if (!crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(user.hash, 'hex'))) {
      return send(response, 401, { error: 'Kullanıcı adı veya parola hatalı.' });
    }
    appendAuditLog({
      owner: username,
      actor: username,
      action: 'Oturum açıldı',
      category: 'auth',
      target: username
    }, request);
    return send(response, 200, { token: createSession(username), username });
  }

  const username = getSessionUser(request);
  if (!username) return send(response, 401, { error: 'Oturum gerekli.' });

  if (request.method === 'POST' && pathname === '/api/auth/logout') {
    const token = String(request.headers.authorization || '').replace(/^Bearer\s+/i, '');
    appendAuditLog({
      owner: username,
      actor: username,
      action: 'Oturum kapatıldı',
      category: 'auth',
      target: username
    }, request);
    sessions.delete(token);
    return send(response, 200, { ok: true });
  }

  if (request.method === 'GET' && pathname === '/api/audit-logs') {
    const logs = readAuditLogs(username, query);
    return send(response, 200, { count: logs.length, logs });
  }

  if (request.method === 'POST' && pathname === '/api/audit-logs/event') {
    const { type, target, detail } = await readJson(request);
    const action = CLIENT_AUDIT_ACTIONS[type];
    if (!action) return send(response, 400, { error: 'Geçersiz işlem türü.' });
    const log = appendAuditLog({
      owner: username,
      actor: username,
      action,
      category: 'export',
      target,
      detail
    }, request);
    return send(response, 201, { ok: true, id: log.id });
  }

  if (pathname === '/api/state' && request.method === 'GET') {
    const user = readDatabase().users[username];
    return send(response, 200, { state: user?.state || {} });
  }

  if (pathname === '/api/state' && request.method === 'PUT') {
    const { state } = await readJson(request);
    if (!state || typeof state !== 'object' || Array.isArray(state)) return send(response, 400, { error: 'Geçersiz veri.' });
    const serialized = JSON.stringify(state);
    if (Buffer.byteLength(serialized) > MAX_STATE_BYTES) return send(response, 413, { error: 'Veri çok büyük.' });
    const database = readDatabase();
    if (!database.users[username]) return send(response, 401, { error: 'Kullanıcı bulunamadı.' });
    const previousState = database.users[username].state || {};
    const auditEntries = buildStateAuditEntries(username, previousState, state);
    database.users[username].state = state;
    database.users[username].updatedAt = new Date().toISOString();
    writeDatabase(database);
    try {
      if (auditEntries.length) appendAuditLogs(auditEntries, request);
    } catch (error) {
      database.users[username].state = previousState;
      writeDatabase(database);
      throw error;
    }
    return send(response, 200, { ok: true });
  }

  return send(response, 404, { error: 'Bulunamadı.' });
}

const MIME_TYPES = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };
const server = http.createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  try {
    if (pathname.startsWith('/api/')) return await api(request, response, pathname);
    const requestedFile = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const isPublicFile = requestedFile === 'index.html'
      || requestedFile.startsWith('css/')
      || requestedFile.startsWith('js/');
    if (!isPublicFile) return send(response, 404, { error: 'Bulunamadı.' });
    const filePath = path.resolve(ROOT, requestedFile);
    if (!filePath.startsWith(`${ROOT}${path.sep}`)) return send(response, 403, { error: 'Yasak.' });
    const content = fs.readFileSync(filePath);
    response.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    response.end(content);
  } catch (error) {
    if (pathname.startsWith('/api/')) return send(response, 400, { error: error.message || 'İstek işlenemedi.' });
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Bulunamadı');
  }
});

if (require.main === module) {
  ensureDefaultUser();
  server.listen(PORT, () => console.log(`Kalori Hesapla: http://localhost:${PORT}`));
}

module.exports = { materializePublicFoods, materializePublicMenus, server };
