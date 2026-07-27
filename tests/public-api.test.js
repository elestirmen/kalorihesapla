const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const testDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'kalori-public-api-'));
process.env.DATABASE_PATH = path.join(testDirectory, 'users.json');
process.env.AUDIT_LOG_PATH = path.join(testDirectory, 'audit-log.jsonl');
const { materializePublicFoods, materializePublicMenus } = require('../server');

test('yemek kataloğu geçerli kalori ve alerjen değerlerini içerir', () => {
  const catalog = materializePublicFoods({
    kalori_custom_foods: JSON.stringify([{
      id: 'custom_test',
      name: 'Deneme Yemeği',
      category: 'diger',
      calories: 200,
      portion: '1 tabak',
      isCustom: true,
      allergenInfo: {
        contains: ['egg'],
        possibleContains: [],
        mayContain: [],
        status: 'verified',
        note: ''
      }
    }]),
    kalori_calorie_overrides: JSON.stringify({ mercimek_corbasi: 160 }),
    kalori_allergen_overrides: JSON.stringify({})
  }, '2026-07-26T10:00:00.000Z');

  const soup = catalog.foods.find(food => food.id === 'mercimek_corbasi');
  const customFood = catalog.foods.find(food => food.id === 'custom_test');
  assert.equal(catalog.updatedAt, '2026-07-26T10:00:00.000Z');
  assert.equal(catalog.allergenDefinitions.length, 14);
  assert.equal(soup.caloriesPerPortion, 160);
  assert.equal(soup.originalCalories, 140);
  assert.equal(soup.isCalorieOverridden, true);
  assert.equal(customFood.isCustom, true);
  assert.equal(customFood.allergens.contains[0].id, 'egg');
});

test('kun durumu herkese açık, zenginleştirilmiş menüye dönüştürülür', () => {
  const state = {
    kalori_haftalik_menuler: JSON.stringify({
      '2026-W30': {
        startDate: '2026-07-20',
        endDate: '2026-07-26',
        label: '20 - 26 Temmuz 2026',
        updatedAt: '2026-07-26T10:00:00.000Z',
        days: [{
          date: '2026-07-20',
          dayName: 'Pazartesi',
          lunch: ['mercimek_corbasi', 'custom_test', null, null],
          lunchPortions: [1.5, 1, 1, 1],
          dinner: [],
          dinnerPortions: []
        }]
      }
    }),
    kalori_custom_foods: JSON.stringify([{
      id: 'custom_test',
      name: 'Deneme Yemeği',
      category: 'diger',
      calories: 200,
      portion: '1 tabak',
      isCustom: true,
      allergenInfo: {
        contains: ['egg'],
        possibleContains: [],
        mayContain: [],
        status: 'verified',
        note: ''
      }
    }]),
    kalori_calorie_overrides: JSON.stringify({ mercimek_corbasi: 160 }),
    kalori_allergen_overrides: JSON.stringify({})
  };

  const [menu] = materializePublicMenus(state);
  assert.equal(menu.weekId, '2026-W30');
  assert.equal(menu.days[0].meals.lunch.items[0].name, 'Mercimek Çorbası');
  assert.equal(menu.days[0].meals.lunch.items[0].baseCalories, 160);
  assert.equal(menu.days[0].meals.lunch.items[0].calories, 240);
  assert.equal(menu.days[0].meals.lunch.items[0].allergens.contains[0].id, 'gluten_cereals');
  assert.equal(menu.days[0].meals.lunch.items[1].allergens.contains[0].name, 'Yumurta');
  assert.equal(menu.days[0].totalCalories, 440);
  assert.equal(menu.totalCalories, 440);
});

test('bozuk hafta kayıtları anonim çıktıya alınmaz', () => {
  const menus = materializePublicMenus({
    kalori_haftalik_menuler: JSON.stringify({
      wrong: { days: [] },
      '2026-W31': null
    })
  });
  assert.deepEqual(menus, []);
});

test('anonim GET uç noktası kun hesabının kaydını döndürür', async t => {
  const week = {
    startDate: '2026-07-20',
    endDate: '2026-07-26',
    label: '20 - 26 Temmuz 2026',
    days: [{
      date: '2026-07-20',
      dayName: 'Pazartesi',
      lunch: ['mercimek_corbasi'],
      lunchPortions: [1],
      dinner: [],
      dinnerPortions: []
    }]
  };
  fs.writeFileSync(process.env.DATABASE_PATH, JSON.stringify({
    users: {
      kun: {
        updatedAt: '2026-07-26T10:00:00.000Z',
        state: {
          kalori_haftalik_menuler: JSON.stringify({ '2026-W30': week }),
          kalori_calorie_overrides: JSON.stringify({ mercimek_corbasi: 160 })
        }
      },
      baskasi: {
        state: {
          kalori_haftalik_menuler: JSON.stringify({
            '2026-W31': { ...week, label: 'Yayımlanmamalı' }
          })
        }
      }
    }
  }));

  const { server } = require('../server');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => {
    server.close();
    fs.rmSync(testDirectory, { recursive: true, force: true });
  });

  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/public/v1/menus`);
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), '*');
  assert.equal(payload.count, 1);
  assert.equal(payload.menus[0].weekId, '2026-W30');
  assert.equal(payload.menus[0].days[0].meals.lunch.items[0].name, 'Mercimek Çorbası');

  const foodsResponse = await fetch(`http://127.0.0.1:${address.port}/api/public/v1/foods`);
  const foodsPayload = await foodsResponse.json();
  const publicSoup = foodsPayload.foods.find(food => food.id === 'mercimek_corbasi');
  assert.equal(foodsResponse.status, 200);
  assert.equal(foodsPayload.updatedAt, '2026-07-26T10:00:00.000Z');
  assert.equal(foodsPayload.count > 100, true);
  assert.equal(foodsPayload.allergenDefinitions.length, 14);
  assert.equal(publicSoup.caloriesPerPortion, 160);
  assert.equal(publicSoup.allergens.contains[0].id, 'gluten_cereals');

  const weekResponse = await fetch(`http://127.0.0.1:${address.port}/api/public/v1/menus/2026-W30`);
  const weekPayload = await weekResponse.json();
  assert.equal(weekResponse.status, 200);
  assert.equal(weekPayload.weekId, '2026-W30');

  const cachedResponse = await fetch(`http://127.0.0.1:${address.port}/api/public/v1/menus/2026-W30`, {
    headers: { 'If-None-Match': weekResponse.headers.get('etag') }
  });
  assert.equal(cachedResponse.status, 304);

  const excelResponse = await fetch(`http://127.0.0.1:${address.port}/api/public/v1/menus/2026-W30.xlsx`);
  const excelBuffer = Buffer.from(await excelResponse.arrayBuffer());
  assert.equal(excelResponse.status, 200);
  assert.equal(excelResponse.headers.get('access-control-allow-origin'), '*');
  assert.equal(
    excelResponse.headers.get('content-type'),
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  assert.match(excelResponse.headers.get('content-disposition'), /menu_2026-07-20\.xlsx/);
  assert.equal(excelBuffer.subarray(0, 2).toString(), 'PK');

  const xlsxContext = {};
  xlsxContext.window = xlsxContext;
  vm.createContext(xlsxContext);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, '..', 'js', 'xlsx-js-style.min.js'), 'utf8'),
    xlsxContext
  );
  const workbook = xlsxContext.XLSX.read(excelBuffer, { type: 'buffer' });
  assert.deepEqual(Array.from(workbook.SheetNames), ['Mobil', 'Plan', 'Alerjenler', 'Detay']);
  const mobileRows = xlsxContext.XLSX.utils.sheet_to_json(workbook.Sheets.Mobil, { header: 1 });
  assert.deepEqual(
    Array.from(mobileRows[0]),
    ['TARİH', 'GÜN', 'ÖĞLE', 'kalori', 'alerjen', 'AKŞAM', 'kalori', 'alerjen']
  );

  const excelCachedResponse = await fetch(`http://127.0.0.1:${address.port}/api/public/v1/menus/2026-W30.xlsx`, {
    headers: { 'If-None-Match': excelResponse.headers.get('etag') }
  });
  assert.equal(excelCachedResponse.status, 304);

  const publicAuditRecords = fs.readFileSync(process.env.AUDIT_LOG_PATH, 'utf8')
    .trim().split('\n').map(line => JSON.parse(line));
  assert.equal(publicAuditRecords.filter(record => record.action === 'Herkese açık Excel indirildi').length, 1);
  assert.equal(publicAuditRecords.find(record => record.action === 'Herkese açık Excel indirildi').actor, 'anonymous');
  assert.equal(publicAuditRecords.find(record => record.action === 'Herkese açık Excel indirildi').ip, '127.0.0.0');

  const unauthorizedAuditResponse = await fetch(`http://127.0.0.1:${address.port}/api/audit-logs`);
  assert.equal(unauthorizedAuditResponse.status, 401);

  const registerResponse = await fetch(`http://127.0.0.1:${address.port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'logtest', password: 'test1234' })
  });
  const registerPayload = await registerResponse.json();
  assert.equal(registerResponse.status, 201);
  const authHeaders = {
    Authorization: `Bearer ${registerPayload.token}`,
    'Content-Type': 'application/json'
  };
  const loggedWeek = {
    ...week,
    label: 'Loglanan hafta',
    days: [{ ...week.days[0], lunch: [] }]
  };
  const firstState = {
    kalori_haftalik_menuler: JSON.stringify({ '2026-W30': loggedWeek })
  };
  const firstStateResponse = await fetch(`http://127.0.0.1:${address.port}/api/state`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ state: firstState })
  });
  assert.equal(firstStateResponse.status, 200);

  loggedWeek.days[0].lunch = ['mercimek_corbasi'];
  const secondStateResponse = await fetch(`http://127.0.0.1:${address.port}/api/state`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      state: { kalori_haftalik_menuler: JSON.stringify({ '2026-W30': loggedWeek }) }
    })
  });
  assert.equal(secondStateResponse.status, 200);

  const clientLogResponse = await fetch(`http://127.0.0.1:${address.port}/api/audit-logs/event`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ type: 'export_excel', target: '2026-W30', detail: 'menu.xlsx' })
  });
  assert.equal(clientLogResponse.status, 201);

  const auditResponse = await fetch(`http://127.0.0.1:${address.port}/api/audit-logs?limit=50`, {
    headers: authHeaders
  });
  const auditPayload = await auditResponse.json();
  assert.equal(auditResponse.status, 200);
  assert.equal(auditPayload.logs.some(record => record.action === 'Kullanıcı hesabı oluşturuldu'), true);
  assert.equal(auditPayload.logs.some(record => record.action === 'Hafta oluşturuldu'), true);
  assert.equal(auditPayload.logs.some(record => record.action === 'Haftalık menü güncellendi'), true);
  assert.equal(auditPayload.logs.some(record => record.action === 'Excel dosyası indirildi'), true);
  assert.equal(auditPayload.logs.every(record => record.owner === 'logtest'), true);
});
