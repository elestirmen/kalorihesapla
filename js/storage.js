/**
 * localStorage Yonetim Modulu
 * Haftalik menuler, ozel yemekler, favoriler, kalori hedefi
 */

const STORAGE_KEY = 'kalori_haftalik_menuler';
const SETTINGS_KEY = 'kalori_ayarlar';
const CUSTOM_FOODS_KEY = 'kalori_custom_foods';
const FAVORITES_KEY = 'kalori_favorites';
const CALORIE_OVERRIDES_KEY = 'kalori_calorie_overrides';
const WEEK_ID_PATTERN = /^\d{4}-W\d{2}$/;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const WEEK_DAY_COUNT = 7;
const MEAL_SLOT_COUNT = 4;
const DEFAULT_PORTION = 1;
const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

const Storage = {
  // Weekly Menus
  getAllWeeks() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  },

  getWeek(weekId) {
    const rawWeek = this.getAllWeeks()[weekId];
    return rawWeek ? normalizeWeekData(rawWeek, weekId) : null;
  },

  saveWeek(weekId, weekData) {
    try {
      const normalizedWeekId = getTrimmedString(weekId);
      if (!WEEK_ID_PATTERN.test(normalizedWeekId)) return false;

      const normalizedWeek = normalizeWeekData(weekData, normalizedWeekId);
      if (!normalizedWeek) return false;

      const weeks = this.getAllWeeks();
      weeks[normalizedWeekId] = { ...normalizedWeek, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(weeks));
      return true;
    } catch {
      return false;
    }
  },

  deleteWeek(weekId) {
    try {
      const weeks = this.getAllWeeks();
      delete weeks[weekId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(weeks));
      return true;
    } catch {
      return false;
    }
  },

  getWeekList() {
    const weeks = this.getAllWeeks();
    return Object.entries(weeks)
      .map(([id, data]) => {
        const normalized = normalizeWeekData(data, id);
        if (!normalized) return null;

        return {
          id,
          startDate: normalized.startDate,
          endDate: normalized.endDate,
          label: normalized.label || id,
          updatedAt: normalized.updatedAt
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
  },

  // Settings
  saveSettings(settings) {
    try {
      const current = this.getSettings();
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...settings }));
    } catch {}
  },

  getSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
      return {
        lastWeekId: WEEK_ID_PATTERN.test(getTrimmedString(settings.lastWeekId)) ? settings.lastWeekId : null,
        dailyCalorieGoal: normalizeInteger(settings.dailyCalorieGoal, 500, 5000, 2000)
      };
    } catch {
      return { lastWeekId: null, dailyCalorieGoal: 2000 };
    }
  },

  // Custom Foods
  getCustomFoods() {
    try { return normalizeCustomFoodList(JSON.parse(localStorage.getItem(CUSTOM_FOODS_KEY)) || []); }
    catch { return []; }
  },

  addCustomFood(food) {
    const foods = this.getCustomFoods();
    const customFood = normalizeCustomFood({
      ...food,
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      isCustom: true
    });

    if (!customFood) return null;

    foods.push(customFood);
    localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(foods));
    return customFood;
  },

  updateCustomFood(id, updates) {
    const foods = this.getCustomFoods();
    const idx = foods.findIndex(food => food.id === id);
    if (idx < 0) return false;

    const updatedFood = normalizeCustomFood({ ...foods[idx], ...updates, id, isCustom: true });
    if (!updatedFood) return false;

    foods[idx] = updatedFood;
    localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(foods));
    return true;
  },

  deleteCustomFood(id) {
    const foodId = getTrimmedString(id);
    if (!foodId) return false;

    const foods = this.getCustomFoods().filter(food => food.id !== foodId);
    localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(foods));
    this.removeFavorite(foodId);
    this.removeCalorieOverride(foodId);
    this.removeFoodReferencesFromWeeks(foodId);
    return true;
  },

  mergeCustomFoods(customFoods) {
    const currentFoods = new Map(this.getCustomFoods().map(food => [food.id, food]));
    const normalizedFoods = normalizeCustomFoodList(customFoods);

    normalizedFoods.forEach(food => currentFoods.set(food.id, food));
    localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify([...currentFoods.values()]));
    return normalizedFoods.length;
  },

  // Calorie Overrides
  getCalorieOverrides() {
    try { return normalizeCalorieOverrides(JSON.parse(localStorage.getItem(CALORIE_OVERRIDES_KEY)) || {}); }
    catch { return {}; }
  },

  setCalorieOverride(foodId, calories) {
    const normalizedId = getTrimmedString(foodId);
    const normalizedCalories = normalizeInteger(calories, 0, 9999, null);
    if (!normalizedId || normalizedCalories === null) return false;

    const overrides = this.getCalorieOverrides();
    overrides[normalizedId] = normalizedCalories;
    localStorage.setItem(CALORIE_OVERRIDES_KEY, JSON.stringify(overrides));
    return true;
  },

  removeCalorieOverride(foodId) {
    const normalizedId = getTrimmedString(foodId);
    if (!normalizedId) return false;

    const overrides = this.getCalorieOverrides();
    delete overrides[normalizedId];
    localStorage.setItem(CALORIE_OVERRIDES_KEY, JSON.stringify(overrides));
    return true;
  },

  mergeCalorieOverrides(incomingOverrides) {
    const normalizedOverrides = normalizeCalorieOverrides(incomingOverrides);
    const overrides = { ...this.getCalorieOverrides(), ...normalizedOverrides };
    localStorage.setItem(CALORIE_OVERRIDES_KEY, JSON.stringify(overrides));
    return Object.keys(normalizedOverrides).length;
  },

  // Favorites
  getFavorites() {
    try { return normalizeFavoriteIds(JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []); }
    catch { return []; }
  },

  toggleFavorite(foodId) {
    const normalizedId = getTrimmedString(foodId);
    if (!normalizedId) return false;

    const favs = this.getFavorites();
    const idx = favs.indexOf(normalizedId);
    if (idx >= 0) favs.splice(idx, 1);
    else favs.push(normalizedId);

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    return idx < 0;
  },

  isFavorite(foodId) {
    return this.getFavorites().includes(foodId);
  },

  removeFavorite(foodId) {
    const normalizedId = getTrimmedString(foodId);
    if (!normalizedId) return false;

    const favs = this.getFavorites().filter(id => id !== normalizedId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    return true;
  },

  // Import / Export
  exportWeek(weekId) {
    const week = this.getWeek(weekId);
    if (!week) return null;

    const referencedFoodIds = collectReferencedFoodIds(week);
    const customFoods = this.getCustomFoods().filter(food => referencedFoodIds.has(food.id));
    const calorieOverrides = {};

    Object.entries(this.getCalorieOverrides()).forEach(([foodId, calories]) => {
      if (referencedFoodIds.has(foodId)) calorieOverrides[foodId] = calories;
    });

    return JSON.stringify({
      version: 2,
      exportedAt: new Date().toISOString(),
      weekId,
      week,
      dependencies: {
        customFoods,
        calorieOverrides
      }
    }, null, 2);
  },

  importWeek(jsonStr) {
    try {
      const payload = JSON.parse(jsonStr);
      const imported = normalizeImportPayload(payload);

      const importedCustomFoods = this.mergeCustomFoods(imported.dependencies.customFoods);
      const importedOverrides = this.mergeCalorieOverrides(imported.dependencies.calorieOverrides);
      const saved = this.saveWeek(imported.weekId, imported.week);
      if (!saved) throw new Error('Hafta kaydedilemedi');

      return {
        success: true,
        weekId: imported.weekId,
        importedCustomFoods,
        importedOverrides
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  removeFoodReferencesFromWeeks(foodId) {
    const normalizedId = getTrimmedString(foodId);
    if (!normalizedId) return [];

    const weeks = this.getAllWeeks();
    const updatedWeekIds = [];

    Object.entries(weeks).forEach(([weekId, rawWeek]) => {
      const week = normalizeWeekData(rawWeek, weekId);
      if (!week) return;

      let changed = false;

      week.days.forEach(day => {
        ['lunch', 'dinner'].forEach(mealType => {
          const portionsKey = `${mealType}Portions`;
          day[mealType] = day[mealType].map((slot, index) => {
            if (slot !== normalizedId) return slot;
            changed = true;
            day[portionsKey][index] = DEFAULT_PORTION;
            return null;
          });
        });
      });

      if (changed) {
        weeks[weekId] = { ...week, updatedAt: new Date().toISOString() };
        updatedWeekIds.push(weekId);
      }
    });

    if (updatedWeekIds.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(weeks));
    }

    return updatedWeekIds;
  },

  // Empty Week Template
  createEmptyWeek(startDate) {
    return buildEmptyWeekData(startDate);
  }
};

function getTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeInteger(value, min, max, fallback) {
  const num = Number.parseInt(value, 10);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

function normalizeDateOnly(value) {
  const dateStr = getTrimmedString(value);
  if (!DATE_ONLY_PATTERN.test(dateStr)) return null;

  const date = new Date(`${dateStr}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : dateStr;
}

function normalizeFoodSlots(slots) {
  if (!Array.isArray(slots)) return Array(MEAL_SLOT_COUNT).fill(null);

  return Array.from({ length: MEAL_SLOT_COUNT }, (_, index) => {
    const foodId = getTrimmedString(slots[index]);
    return foodId || null;
  });
}

function normalizePortions(portions) {
  if (!Array.isArray(portions)) return Array(MEAL_SLOT_COUNT).fill(DEFAULT_PORTION);

  return Array.from({ length: MEAL_SLOT_COUNT }, (_, index) => {
    const portion = Number.parseFloat(portions[index]);
    if (!Number.isFinite(portion) || portion <= 0) return DEFAULT_PORTION;
    return Math.round(portion * 100) / 100;
  });
}

function createEmptyDay(date) {
  return {
    date: toLocalDateStr(date),
    dayName: DAY_NAMES[date.getDay()],
    lunch: Array(MEAL_SLOT_COUNT).fill(null),
    dinner: Array(MEAL_SLOT_COUNT).fill(null),
    lunchPortions: Array(MEAL_SLOT_COUNT).fill(DEFAULT_PORTION),
    dinnerPortions: Array(MEAL_SLOT_COUNT).fill(DEFAULT_PORTION)
  };
}

function buildEmptyWeekData(startDate) {
  const monday = getMonday(new Date(startDate));
  const days = [];

  for (let i = 0; i < WEEK_DAY_COUNT; i++) {
    const date = new Date(monday);
    date.setDate(date.getDate() + i);
    days.push(createEmptyDay(date));
  }

  const endDate = new Date(monday);
  endDate.setDate(endDate.getDate() + (WEEK_DAY_COUNT - 1));

  return {
    startDate: toLocalDateStr(monday),
    endDate: toLocalDateStr(endDate),
    label: formatDateRange(monday, endDate),
    days,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function normalizeDayData(dayData, fallbackDay) {
  const rawDay = dayData && typeof dayData === 'object' ? dayData : {};
  return {
    date: normalizeDateOnly(rawDay.date) || fallbackDay.date,
    dayName: getTrimmedString(rawDay.dayName) || fallbackDay.dayName,
    lunch: normalizeFoodSlots(rawDay.lunch),
    dinner: normalizeFoodSlots(rawDay.dinner),
    lunchPortions: normalizePortions(rawDay.lunchPortions),
    dinnerPortions: normalizePortions(rawDay.dinnerPortions)
  };
}

function normalizeWeekData(weekData, weekId) {
  if (!weekData || typeof weekData !== 'object') return null;

  const normalizedWeekId = getTrimmedString(weekId);
  if (!WEEK_ID_PATTERN.test(normalizedWeekId)) return null;

  const startDate = normalizeDateOnly(weekData.startDate);
  if (!startDate) return null;

  const baseWeek = buildEmptyWeekData(new Date(`${startDate}T12:00:00`));
  const rawDays = Array.isArray(weekData.days) ? weekData.days : [];

  return {
    startDate: baseWeek.startDate,
    endDate: baseWeek.endDate,
    label: getTrimmedString(weekData.label) || baseWeek.label,
    days: baseWeek.days.map((fallbackDay, index) => normalizeDayData(rawDays[index], fallbackDay)),
    createdAt: getTrimmedString(weekData.createdAt) || new Date().toISOString(),
    updatedAt: getTrimmedString(weekData.updatedAt) || new Date().toISOString()
  };
}

function normalizeCustomFood(food) {
  if (!food || typeof food !== 'object') return null;

  const id = getTrimmedString(food.id);
  const name = getTrimmedString(food.name);
  if (!id || !name) return null;

  const category = FOOD_CATEGORIES[food.category] ? food.category : 'diger';
  const calories = normalizeInteger(food.calories, 0, 9999, null);
  if (calories === null) return null;

  return {
    id,
    name,
    category,
    calories,
    portion: getTrimmedString(food.portion) || '1 porsiyon',
    isCustom: true
  };
}

function normalizeCustomFoodList(customFoods) {
  if (!Array.isArray(customFoods)) return [];

  const seen = new Set();
  return customFoods
    .map(normalizeCustomFood)
    .filter(food => {
      if (!food || seen.has(food.id)) return false;
      seen.add(food.id);
      return true;
    });
}

function normalizeCalorieOverrides(overrides) {
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) return {};

  return Object.entries(overrides).reduce((acc, [foodId, calories]) => {
    const id = getTrimmedString(foodId);
    const normalizedCalories = normalizeInteger(calories, 0, 9999, null);
    if (id && normalizedCalories !== null) acc[id] = normalizedCalories;
    return acc;
  }, {});
}

function normalizeFavoriteIds(favorites) {
  if (!Array.isArray(favorites)) return [];

  const seen = new Set();
  return favorites.filter(foodId => {
    const id = getTrimmedString(foodId);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function collectReferencedFoodIds(week) {
  const foodIds = new Set();
  week.days.forEach(day => {
    [...day.lunch, ...day.dinner].forEach(foodId => {
      if (foodId) foodIds.add(foodId);
    });
  });
  return foodIds;
}

function normalizeImportPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Geçersiz format');
  }

  const legacyPayload = { ...payload };
  const weekId = getTrimmedString(payload.weekId);
  let week = payload.week;
  let dependencies = payload.dependencies;

  if (!week || typeof week !== 'object') {
    delete legacyPayload.weekId;
    week = legacyPayload;
    dependencies = {
      customFoods: payload.customFoods,
      calorieOverrides: payload.calorieOverrides
    };
  }

  if (!WEEK_ID_PATTERN.test(weekId)) {
    throw new Error('Geçersiz hafta kimliği');
  }

  const normalizedWeek = normalizeWeekData(week, weekId);
  if (!normalizedWeek) {
    throw new Error('Geçersiz hafta verisi');
  }

  return {
    weekId,
    week: normalizedWeek,
    dependencies: {
      customFoods: normalizeCustomFoodList(dependencies?.customFoods),
      calorieOverrides: normalizeCalorieOverrides(dependencies?.calorieOverrides)
    }
  };
}

function toLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateRange(start, end) {
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const s = new Date(start);
  const e = new Date(end);
  if (s.getMonth() === e.getMonth()) {
    return `${s.getDate()} - ${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
  }
  return `${s.getDate()} ${months[s.getMonth()]} - ${e.getDate()} ${months[e.getMonth()]} ${s.getFullYear()}`;
}

function getWeekId(date) {
  const d = new Date(date);
  const day = d.getDay();
  const dayNum = day === 0 ? 7 : day;
  d.setDate(d.getDate() + 4 - dayNum);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(12, 0, 0, 0);
  return d;
}
