/**
 * localStorage Yönetim Modülü
 * Haftalık menüler, özel yemekler, favoriler, kalori hedefi
 */

const STORAGE_KEY = 'kalori_haftalik_menuler';
const SETTINGS_KEY = 'kalori_ayarlar';
const CUSTOM_FOODS_KEY = 'kalori_custom_foods';
const FAVORITES_KEY = 'kalori_favorites';
const CALORIE_OVERRIDES_KEY = 'kalori_calorie_overrides';

const Storage = {
  // ─── Weekly Menus ─────────────────────
  getAllWeeks() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  },
  getWeek(weekId) { return this.getAllWeeks()[weekId] || null; },
  saveWeek(weekId, weekData) {
    try {
      const weeks = this.getAllWeeks();
      weeks[weekId] = { ...weekData, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(weeks));
      return true;
    } catch { return false; }
  },
  deleteWeek(weekId) {
    try {
      const weeks = this.getAllWeeks();
      delete weeks[weekId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(weeks));
      return true;
    } catch { return false; }
  },
  getWeekList() {
    const weeks = this.getAllWeeks();
    return Object.entries(weeks).map(([id, data]) => ({
      id, startDate: data.startDate, endDate: data.endDate,
      label: data.label || id, updatedAt: data.updatedAt
    })).sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
  },

  // ─── Settings ─────────────────────────
  saveSettings(settings) {
    try {
      const current = this.getSettings();
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...settings }));
    } catch {}
  },
  getSettings() {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { lastWeekId: null, dailyCalorieGoal: 2000 }; }
    catch { return { lastWeekId: null, dailyCalorieGoal: 2000 }; }
  },

  // ─── Custom Foods ─────────────────────
  getCustomFoods() {
    try { return JSON.parse(localStorage.getItem(CUSTOM_FOODS_KEY)) || []; }
    catch { return []; }
  },
  addCustomFood(food) {
    const foods = this.getCustomFoods();
    food.id = 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    food.isCustom = true;
    foods.push(food);
    localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(foods));
    return food;
  },
  updateCustomFood(id, updates) {
    const foods = this.getCustomFoods();
    const idx = foods.findIndex(f => f.id === id);
    if (idx >= 0) {
      foods[idx] = { ...foods[idx], ...updates };
      localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(foods));
      return true;
    }
    return false;
  },
  deleteCustomFood(id) {
    const foods = this.getCustomFoods().filter(f => f.id !== id);
    localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(foods));
  },

  // ─── Calorie Overrides (for base foods) ──
  getCalorieOverrides() {
    try { return JSON.parse(localStorage.getItem(CALORIE_OVERRIDES_KEY)) || {}; }
    catch { return {}; }
  },
  setCalorieOverride(foodId, calories) {
    const overrides = this.getCalorieOverrides();
    overrides[foodId] = calories;
    localStorage.setItem(CALORIE_OVERRIDES_KEY, JSON.stringify(overrides));
  },
  removeCalorieOverride(foodId) {
    const overrides = this.getCalorieOverrides();
    delete overrides[foodId];
    localStorage.setItem(CALORIE_OVERRIDES_KEY, JSON.stringify(overrides));
  },

  // ─── Favorites ────────────────────────
  getFavorites() {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []; }
    catch { return []; }
  },
  toggleFavorite(foodId) {
    const favs = this.getFavorites();
    const idx = favs.indexOf(foodId);
    if (idx >= 0) { favs.splice(idx, 1); } else { favs.push(foodId); }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    return idx < 0; // returns true if added
  },
  isFavorite(foodId) {
    return this.getFavorites().includes(foodId);
  },

  // ─── Import / Export ──────────────────
  exportWeek(weekId) {
    const week = this.getWeek(weekId);
    if (!week) return null;
    return JSON.stringify({ weekId, ...week }, null, 2);
  },
  importWeek(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      const weekId = data.weekId;
      if (!weekId) throw new Error('Geçersiz format');
      delete data.weekId;
      this.saveWeek(weekId, data);
      return { success: true, weekId };
    } catch (e) { return { success: false, error: e.message }; }
  },

  // ─── Empty Week Template ─────────────
  createEmptyWeek(startDate) {
    const days = [];
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push({
        date: toLocalDateStr(date),
        dayName: dayNames[date.getDay()],
        lunch: [null, null, null, null],
        dinner: [null, null, null, null],
        lunchPortions: [1, 1, 1, 1],
        dinnerPortions: [1, 1, 1, 1]
      });
    }
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    return {
      startDate: toLocalDateStr(startDate),
      endDate: toLocalDateStr(endDate),
      label: formatDateRange(startDate, endDate),
      days,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
};

// ─── Utility Functions ──────────────────
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
