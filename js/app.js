/**
 * Kalori Hesaplama - Ana Uygulama
 * Haftalık yemek planlama, kalori hesaplama, yemek yönetimi
 */

// ─── State ──────────────────────────────
let currentWeekId = null;
let currentWeek = null;
let searchTarget = null;
let selectedSearchIndex = -1;
let clipboard = null; // { lunch, dinner, lunchPortions, dinnerPortions }
let activeTab = 'planner';
let foodMgmtFilter = { query: '', category: 'all' };
let editingFoodId = null;

const PORTION_OPTIONS = [0.5, 1, 1.5, 2];

// ─── DOM Cache ──────────────────────────
const DOM = {};

// ─── Init ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  cacheDOM();
  initApp();
  bindEvents();
});

function cacheDOM() {
  DOM.menuGrid = document.getElementById('menu-grid');
  DOM.searchOverlay = document.getElementById('search-overlay');
  DOM.searchInput = document.getElementById('search-input');
  DOM.searchResults = document.getElementById('search-results');
  DOM.searchContext = document.getElementById('search-context');
  DOM.weekLabel = document.getElementById('week-label');
  DOM.weekDateInput = document.getElementById('week-date-input');
  DOM.toastContainer = document.getElementById('toast-container');
  DOM.statWeeklyCal = document.getElementById('stat-weekly-cal');
  DOM.statDailyCal = document.getElementById('stat-daily-cal');
  DOM.statMealCount = document.getElementById('stat-meal-count');
  DOM.statFoodCount = document.getElementById('stat-food-count');
  DOM.weeksDropdown = document.getElementById('weeks-dropdown');
  DOM.weeksList = document.getElementById('weeks-list');
  DOM.goalInput = document.getElementById('goal-input');
  DOM.goalDisplay = document.getElementById('goal-display');
  DOM.tabPlanner = document.getElementById('tab-planner');
  DOM.tabFoods = document.getElementById('tab-foods');
  DOM.foodSearch = document.getElementById('food-mgmt-search');
  DOM.foodList = document.getElementById('food-mgmt-list');
  DOM.foodAddForm = document.getElementById('food-add-form');
  DOM.foodCount = document.getElementById('food-total-count');
}

function initApp() {
  const settings = Storage.getSettings();
  if (settings.lastWeekId) {
    const saved = Storage.getWeek(settings.lastWeekId);
    if (saved) { currentWeekId = settings.lastWeekId; currentWeek = saved; }
  }
  if (!currentWeek) createNewWeekFromDate(new Date());

  // Set goal
  if (DOM.goalInput) {
    DOM.goalInput.value = settings.dailyCalorieGoal || 2000;
  }

  renderWeek();
  updateStats();
}

function bindEvents() {
  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Week navigation
  document.getElementById('btn-prev-week').addEventListener('click', () => navigateWeek(-1));
  document.getElementById('btn-next-week').addEventListener('click', () => navigateWeek(1));
  document.getElementById('btn-new-week').addEventListener('click', () => {
    createNewWeekFromDate(new Date());
    renderWeek(); updateStats();
    showToast('Yeni hafta oluşturuldu', 'success');
  });
  DOM.weekDateInput.addEventListener('change', (e) => {
    if (e.target.value) {
      createNewWeekFromDate(getMonday(new Date(e.target.value)));
      renderWeek(); updateStats();
    }
  });

  // Saved weeks
  document.getElementById('btn-saved-weeks').addEventListener('click', toggleWeeksDropdown);

  // Search
  DOM.searchOverlay.addEventListener('click', (e) => { if (e.target === DOM.searchOverlay) closeSearch(); });
  DOM.searchInput.addEventListener('input', (e) => { selectedSearchIndex = -1; renderSearchResults(e.target.value); });
  DOM.searchInput.addEventListener('keydown', handleSearchKeydown);

  // Calorie goal
  if (DOM.goalInput) {
    DOM.goalInput.addEventListener('change', (e) => {
      const val = parseInt(e.target.value) || 2000;
      Storage.saveSettings({ dailyCalorieGoal: val });
      renderWeek(); updateStats();
      showToast(`Günlük hedef: ${val} kcal`, 'success');
    });
  }

  // Auto-fill
  document.getElementById('btn-auto-fill')?.addEventListener('click', autoFillWeek);

  // Print / Export / Import
  document.getElementById('btn-print')?.addEventListener('click', () => window.print());
  document.getElementById('btn-export')?.addEventListener('click', exportCurrentWeek);
  document.getElementById('btn-export-excel')?.addEventListener('click', exportExcel);
  document.getElementById('btn-import')?.addEventListener('click', importWeek);

  // Food management
  DOM.foodSearch?.addEventListener('input', (e) => {
    foodMgmtFilter.query = e.target.value;
    renderFoodList();
  });
  document.getElementById('btn-add-food')?.addEventListener('click', toggleAddFoodForm);

  // Food category filter buttons
  document.querySelectorAll('.food-cat-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.food-cat-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      foodMgmtFilter.category = btn.dataset.category;
      renderFoodList();
    });
  });

  // Add food form
  document.getElementById('food-form-save')?.addEventListener('click', saveNewFood);
  document.getElementById('food-form-cancel')?.addEventListener('click', () => {
    DOM.foodAddForm.classList.add('hidden');
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeSearch(); closeWeeksDropdown(); }
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.saved-weeks-wrapper')) closeWeeksDropdown();
  });
}

// ─── Tab Switching ──────────────────────
function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  DOM.tabPlanner.classList.toggle('hidden', tab !== 'planner');
  DOM.tabFoods.classList.toggle('hidden', tab !== 'foods');

  if (tab === 'foods') renderFoodList();
}

// ─── Week Management ────────────────────
function createNewWeekFromDate(date) {
  const monday = getMonday(date);
  const weekId = getWeekId(monday);
  const existing = Storage.getWeek(weekId);
  if (existing) { currentWeekId = weekId; currentWeek = existing; }
  else {
    currentWeek = Storage.createEmptyWeek(monday);
    currentWeekId = weekId;
    Storage.saveWeek(weekId, currentWeek);
  }
  Storage.saveSettings({ lastWeekId: currentWeekId });
}

function navigateWeek(dir) {
  const start = new Date(currentWeek.startDate + 'T12:00:00');
  start.setDate(start.getDate() + (dir * 7));
  createNewWeekFromDate(start);
  renderWeek(); updateStats();
}

function loadWeek(weekId) {
  const week = Storage.getWeek(weekId);
  if (week) {
    currentWeekId = weekId; currentWeek = week;
    Storage.saveSettings({ lastWeekId: weekId });
    renderWeek(); updateStats(); closeWeeksDropdown();
    showToast('Hafta yüklendi', 'success');
  }
}

function deleteWeek(weekId, e) {
  e.stopPropagation();
  if (confirm('Bu haftayı silmek istediğinize emin misiniz?')) {
    Storage.deleteWeek(weekId);
    if (weekId === currentWeekId) { createNewWeekFromDate(new Date()); renderWeek(); updateStats(); }
    renderWeeksList();
    showToast('Hafta silindi', 'info');
  }
}

// ─── Rendering: Week ────────────────────
function renderWeek() {
  DOM.weekLabel.textContent = currentWeek.label || currentWeekId;
  DOM.weekDateInput.value = currentWeek.startDate;
  DOM.menuGrid.innerHTML = '';
  currentWeek.days.forEach((day, i) => DOM.menuGrid.appendChild(renderDayCard(day, i)));
}

function renderDayCard(day, dayIndex) {
  // Ensure portions arrays exist (backward compatibility)
  if (!day.lunchPortions) day.lunchPortions = [1, 1, 1, 1];
  if (!day.dinnerPortions) day.dinnerPortions = [1, 1, 1, 1];

  const card = document.createElement('div');
  card.className = 'day-card';
  card.id = `day-${dayIndex}`;

  const lunchCal = calcMealCalories(day.lunch, day.lunchPortions);
  const dinnerCal = calcMealCalories(day.dinner, day.dinnerPortions);
  const dayCal = lunchCal + dinnerCal;
  const goal = Storage.getSettings().dailyCalorieGoal || 2000;
  const pct = goal > 0 ? (dayCal / goal) * 100 : 0;
  const pctClamped = Math.min(pct, 100);
  const progressClass = dayCal === 0 ? 'empty' : pct > 100 ? 'over' : pct > 85 ? 'warn' : 'ok';

  card.innerHTML = `
    <div class="day-header">
      <div class="day-info">
        <span class="day-name">${day.dayName}</span>
        <span class="day-date">${formatDate(day.date)}</span>
      </div>
      <div class="day-header-actions">
        <button class="btn btn-sm" onclick="autoFillDay(${dayIndex})" title="Bu günü otomatik doldur">Doldur</button>
        ${clipboard ? `<button class="btn btn-sm" onclick="pasteDay(${dayIndex})" title="Yapıştır">Yapıştır</button>` : ''}
        <button class="btn btn-sm" onclick="copyDay(${dayIndex})" title="Bu günü kopyala">Kopyala</button>
        <div class="day-calories">
          <span class="day-calories-icon">🔥</span>
          <span>${dayCal} kcal</span>
        </div>
      </div>
    </div>
    <div class="day-progress-bar">
      <div class="day-progress-fill ${progressClass}" style="width:${pctClamped}%"></div>
      <span class="day-progress-label">${dayCal > 0 ? `${Math.round(pct)}% / ${goal} kcal hedef` : ''}</span>
    </div>
    <div class="day-body">
      <div class="meal-column">
        <div class="meal-title">
          <span class="meal-title-text">☀️ Öğle Yemeği</span>
          ${lunchCal > 0 ? `<span class="meal-calories-total">${lunchCal} kcal</span>` : ''}
        </div>
        <div class="meal-slots">${renderMealSlots(day.lunch, day.lunchPortions, dayIndex, 'lunch')}</div>
      </div>
      <div class="meal-column">
        <div class="meal-title">
          <span class="meal-title-text">🌙 Akşam Yemeği</span>
          ${dinnerCal > 0 ? `<span class="meal-calories-total">${dinnerCal} kcal</span>` : ''}
        </div>
        <div class="meal-slots">${renderMealSlots(day.dinner, day.dinnerPortions, dayIndex, 'dinner')}</div>
      </div>
    </div>`;
  return card;
}

function renderMealSlots(slots, portions, dayIndex, mealType) {
  return slots.map((foodId, i) => {
    const portion = (portions && portions[i]) || 1;
    if (foodId) {
      const food = getFoodById(foodId);
      if (food) {
        const cal = Math.round(food.calories * portion);
        const catColor = FOOD_CATEGORIES[food.category]?.color || '#7a7060';
        const isFav = Storage.isFavorite(foodId);
        const portionLabel = portion !== 1 ? `${portion}x` : '';
        return `
          <div class="food-slot filled" title="${food.portion}${portionLabel ? ' — ' + portionLabel + ' porsiyon' : ''}">
            <span class="food-cat-dot" style="background:${catColor}"></span>
            <span class="food-slot-name" onclick="openSearch(${dayIndex},'${mealType}',${i})">${food.name}</span>
            ${portionLabel ? `<button class="food-slot-portion" onclick="cyclePortion(${dayIndex},'${mealType}',${i})" title="Porsiyon değiştir">${portionLabel}</button>` : 
              `<button class="food-slot-portion dim" onclick="cyclePortion(${dayIndex},'${mealType}',${i})" title="Porsiyon değiştir">1x</button>`}
            <span class="food-slot-cal">${cal}</span>
            <button class="food-slot-fav ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFoodFav('${foodId}', ${dayIndex})" title="Favori">★</button>
            <button class="food-slot-remove" onclick="event.stopPropagation(); removeFood(${dayIndex},'${mealType}',${i})" title="Kaldır">✕</button>
          </div>`;
      }
    }
    return `<div class="food-slot empty" onclick="openSearch(${dayIndex},'${mealType}',${i})"></div>`;
  }).join('');
}

// ─── Portion ────────────────────────────
function cyclePortion(dayIndex, mealType, slotIndex) {
  const portionsKey = mealType + 'Portions';
  if (!currentWeek.days[dayIndex][portionsKey]) currentWeek.days[dayIndex][portionsKey] = [1, 1, 1, 1];
  const current = currentWeek.days[dayIndex][portionsKey][slotIndex] || 1;
  const idx = PORTION_OPTIONS.indexOf(current);
  const next = PORTION_OPTIONS[(idx + 1) % PORTION_OPTIONS.length];
  currentWeek.days[dayIndex][portionsKey][slotIndex] = next;
  autoSave(); renderWeek(); updateStats();
}

// ─── Copy / Paste Day ───────────────────
function copyDay(dayIndex) {
  const day = currentWeek.days[dayIndex];
  clipboard = {
    lunch: [...day.lunch], dinner: [...day.dinner],
    lunchPortions: [...(day.lunchPortions || [1,1,1,1])],
    dinnerPortions: [...(day.dinnerPortions || [1,1,1,1])]
  };
  renderWeek();
  showToast(`${day.dayName} kopyalandı`, 'success');
}

function pasteDay(dayIndex) {
  if (!clipboard) return;
  const day = currentWeek.days[dayIndex];
  day.lunch = [...clipboard.lunch];
  day.dinner = [...clipboard.dinner];
  day.lunchPortions = [...clipboard.lunchPortions];
  day.dinnerPortions = [...clipboard.dinnerPortions];
  autoSave(); renderWeek(); updateStats();
  showToast(`${day.dayName} yapıştırıldı`, 'success');
}

// ─── Favorites ──────────────────────────
function toggleFoodFav(foodId, dayIndex) {
  const added = Storage.toggleFavorite(foodId);
  renderWeek();
  showToast(added ? 'Favorilere eklendi ⭐' : 'Favorilerden çıkarıldı', 'info');
}

// ─── Search ─────────────────────────────
function openSearch(dayIndex, mealType, slotIndex) {
  searchTarget = { dayIndex, mealType, slotIndex };
  const day = currentWeek.days[dayIndex];
  const mealLabel = mealType === 'lunch' ? 'Öğle' : 'Akşam';
  DOM.searchContext.innerHTML = `<span>${day.dayName}</span> — ${mealLabel} Yemeği, Slot ${slotIndex + 1}`;
  DOM.searchOverlay.classList.add('active');
  DOM.searchInput.value = '';
  selectedSearchIndex = -1;
  renderSearchHome();
  setTimeout(() => DOM.searchInput.focus(), 100);
}

function closeSearch() {
  DOM.searchOverlay.classList.remove('active');
  searchTarget = null;
}

function renderSearchHome() {
  const favIds = Storage.getFavorites();
  let html = '';

  // Favorites section
  if (favIds.length > 0) {
    html += '<div class="search-category-header">⭐ Favoriler</div>';
    let idx = 0;
    favIds.forEach(id => {
      const food = getFoodById(id);
      if (food) { html += renderSearchItem(food, idx++, true); }
    });
    html += '<div style="height:8px"></div>';
  }

  // Category grid
  html += '<div class="category-grid">';
  for (const [key, cat] of Object.entries(FOOD_CATEGORIES)) {
    const count = getAllFoods().filter(f => f.category === key).length;
    html += `
      <div class="category-btn" onclick="browseCategory('${key}')">
        <span class="category-btn-icon">${cat.icon}</span>
        <span class="category-btn-name">${cat.name} (${count})</span>
      </div>`;
  }
  html += '</div>';
  DOM.searchResults.innerHTML = html;
}

function browseCategory(category) {
  const foods = getFoodsByCategory(category);
  const cat = FOOD_CATEGORIES[category];
  let html = `<div class="search-category-header">${cat.icon} ${cat.name}</div>`;
  foods.forEach((food, i) => { html += renderSearchItem(food, i); });
  DOM.searchResults.innerHTML = html;
  DOM.searchInput.focus();
}

function renderSearchResults(query) {
  if (!query || !query.trim()) { renderSearchHome(); return; }
  const results = searchFoods(query);
  if (results.length === 0) {
    DOM.searchResults.innerHTML = `<div class="search-empty"><div class="search-empty-icon">🔍</div>"${query}" için sonuç bulunamadı</div>`;
    return;
  }
  const grouped = {};
  results.forEach(f => { if (!grouped[f.category]) grouped[f.category] = []; grouped[f.category].push(f); });
  let html = '', gi = 0;
  for (const [ck, foods] of Object.entries(grouped)) {
    const cat = FOOD_CATEGORIES[ck];
    html += `<div class="search-category-header">${cat?.icon || '🍽️'} ${cat?.name || ck}</div>`;
    foods.forEach(f => { html += renderSearchItem(f, gi++); });
  }
  DOM.searchResults.innerHTML = html;
}

function renderSearchItem(food, index, isFav = false) {
  const catColor = FOOD_CATEGORIES[food.category]?.color || '#7a7060';
  const selected = index === selectedSearchIndex ? ' selected' : '';
  const favStar = Storage.isFavorite(food.id) ? '★' : '☆';
  return `
    <div class="search-result-item${selected}" data-index="${index}" data-food-id="${food.id}">
      <button class="search-fav-btn ${Storage.isFavorite(food.id) ? 'active' : ''}" 
              onclick="event.stopPropagation(); toggleSearchFav('${food.id}')" title="Favori">${favStar}</button>
      <span class="search-result-dot" style="background:${catColor}"></span>
      <span class="search-result-name" onclick="selectFood('${food.id}')">${food.name}</span>
      <span class="search-result-portion">${food.portion}</span>
      <span class="search-result-cal" onclick="selectFood('${food.id}')">${food.calories} kcal</span>
    </div>`;
}

function toggleSearchFav(foodId) {
  Storage.toggleFavorite(foodId);
  const query = DOM.searchInput.value;
  if (query) renderSearchResults(query);
  else renderSearchHome();
}

function selectFood(foodId) {
  if (!searchTarget) return;
  const { dayIndex, mealType, slotIndex } = searchTarget;
  currentWeek.days[dayIndex][mealType][slotIndex] = foodId;
  // Reset portion to 1
  const pk = mealType + 'Portions';
  if (!currentWeek.days[dayIndex][pk]) currentWeek.days[dayIndex][pk] = [1,1,1,1];
  currentWeek.days[dayIndex][pk][slotIndex] = 1;

  autoSave(); closeSearch(); renderWeek(); updateStats();
  const food = getFoodById(foodId);
  showToast(`${food.name} eklendi (${food.calories} kcal)`, 'success');
}

function removeFood(dayIndex, mealType, slotIndex) {
  const food = getFoodById(currentWeek.days[dayIndex][mealType][slotIndex]);
  currentWeek.days[dayIndex][mealType][slotIndex] = null;
  autoSave(); renderWeek(); updateStats();
  if (food) showToast(`${food.name} kaldırıldı`, 'info');
}

function handleSearchKeydown(e) {
  const items = DOM.searchResults.querySelectorAll('.search-result-item');
  if (!items.length) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); selectedSearchIndex = Math.min(selectedSearchIndex + 1, items.length - 1); updateSearchSel(items); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); selectedSearchIndex = Math.max(selectedSearchIndex - 1, 0); updateSearchSel(items); }
  else if (e.key === 'Enter') { e.preventDefault(); if (selectedSearchIndex >= 0 && items[selectedSearchIndex]) selectFood(items[selectedSearchIndex].dataset.foodId); }
}

function updateSearchSel(items) {
  items.forEach((item, i) => {
    item.classList.toggle('selected', i === selectedSearchIndex);
    if (i === selectedSearchIndex) item.scrollIntoView({ block: 'nearest' });
  });
}

// ─── Calorie Calculations ───────────────
function calcMealCalories(slots, portions) {
  return slots.reduce((total, foodId, i) => {
    if (foodId) {
      const food = getFoodById(foodId);
      const portion = (portions && portions[i]) || 1;
      return total + (food ? Math.round(food.calories * portion) : 0);
    }
    return total;
  }, 0);
}

function calcDayCalories(day) {
  return calcMealCalories(day.lunch, day.lunchPortions) + calcMealCalories(day.dinner, day.dinnerPortions);
}

function calcWeekCalories() {
  return currentWeek.days.reduce((t, d) => t + calcDayCalories(d), 0);
}

function countMeals() {
  let c = 0;
  currentWeek.days.forEach(d => { if (d.lunch.some(f => f)) c++; if (d.dinner.some(f => f)) c++; });
  return c;
}

function countFoods() {
  let c = 0;
  currentWeek.days.forEach(d => { c += d.lunch.filter(f => f).length + d.dinner.filter(f => f).length; });
  return c;
}

function updateStats() {
  const weekCal = calcWeekCalories();
  const daysWithFood = currentWeek.days.filter(d => calcDayCalories(d) > 0).length;
  const avgDaily = daysWithFood > 0 ? Math.round(weekCal / daysWithFood) : 0;
  const goal = Storage.getSettings().dailyCalorieGoal || 2000;

  animateNumber(DOM.statWeeklyCal, weekCal);
  animateNumber(DOM.statDailyCal, avgDaily);
  if (DOM.statMealCount) DOM.statMealCount.textContent = countMeals();
  if (DOM.statFoodCount) DOM.statFoodCount.textContent = countFoods();
}

function animateNumber(el, target) {
  const current = parseInt(el.textContent.replace(/\./g, '')) || 0;
  if (current === target) return;
  const duration = 400, start = performance.now();
  function step(ts) {
    const p = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(current + (target - current) * eased).toLocaleString('tr-TR');
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ─── Save ───────────────────────────────
let saveTimeout;
function autoSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => Storage.saveWeek(currentWeekId, currentWeek), 300);
}

// ─── Export / Import ────────────────────
function exportCurrentWeek() {
  const json = Storage.exportWeek(currentWeekId);
  if (!json) return;
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `menu_${currentWeek.startDate}.json`;
  a.click(); URL.revokeObjectURL(url);
  showToast('JSON olarak dışa aktarıldı', 'success');
}

function exportExcel() {
  const goal = Storage.getSettings().dailyCalorieGoal || 2000;
  const BOM = '\uFEFF'; // UTF-8 BOM for Turkish characters

  const S = {
    title:    'background:#d97016;color:#fff;font-size:16pt;font-weight:bold;font-family:Calibri;text-align:center;padding:12px;',
    subtitle: 'background:#f5f1ea;color:#6b5f50;font-size:10pt;font-family:Calibri;text-align:center;padding:6px;',
    colHead:  'background:#2c2418;color:#faf8f4;font-size:9pt;font-weight:bold;font-family:Calibri;text-align:center;padding:6px 8px;border:1px solid #1a1610;',
    dayCell:  'background:#e8940b;color:#fff;font-size:11pt;font-weight:bold;font-family:Calibri;padding:6px 10px;border:1px solid #c2610a;vertical-align:middle;',
    mealCell: 'font-size:9pt;font-weight:bold;font-family:Calibri;padding:5px 8px;text-align:center;vertical-align:middle;',
    foodCell: 'font-size:10pt;font-family:Calibri;padding:4px 8px;',
    calCell:  'font-size:10pt;font-family:Calibri;padding:4px 6px;text-align:right;color:#b85c0a;font-weight:bold;',
    mealTot:  'font-size:10pt;font-family:Calibri;font-weight:bold;padding:4px 8px;text-align:right;',
    dayTot:   'background:#fdf6e8;font-size:10pt;font-family:Calibri;font-weight:bold;padding:6px 8px;border:1px solid #e0d8cc;',
    pctOk:    'background:#e8f5e9;color:#2e7d32;font-weight:bold;text-align:center;font-family:Calibri;font-size:10pt;padding:4px;',
    pctWarn:  'background:#fff3e0;color:#e65100;font-weight:bold;text-align:center;font-family:Calibri;font-size:10pt;padding:4px;',
    pctOver:  'background:#ffebee;color:#c62828;font-weight:bold;text-align:center;font-family:Calibri;font-size:10pt;padding:4px;',
    summLabel:'background:#2c2418;color:#faf8f4;font-size:11pt;font-weight:bold;font-family:Calibri;padding:8px 12px;text-align:right;border:1px solid #1a1610;',
    summVal:  'background:#d97016;color:#fff;font-size:12pt;font-weight:bold;font-family:Calibri;padding:8px 12px;text-align:center;border:1px solid #c2610a;',
    empty:    'border:none;padding:2px;',
    border:   'border:1px solid #e0d8cc;',
  };

  const rc = (i) => i % 2 === 0
    ? 'background:#faf8f4;' // açık krem
    : 'background:#f0ece4;'; // koyu krem

  function foodInfo(foodId, portionArr, idx) {
    const food = foodId ? getFoodById(foodId) : null;
    const portion = (portionArr && portionArr[idx]) || 1;
    if (!food) return { name: '', cal: 0, portionTxt: '' };
    const cal = Math.round(food.calories * portion);
    const pTxt = portion !== 1 ? ` (${portion}x)` : '';
    return { name: food.name + pTxt, cal, portionTxt: food.portion };
  }

  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8">
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>Haftalık Menü</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/><x:FitToPage/><x:Print><x:FitWidth>1</x:FitWidth></x:Print></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
</head><body>
<table border="0" cellpadding="0" cellspacing="0">`;

  // ── BAŞLIK ──
  html += `<tr><td colspan="11" style="${S.title}">HAFTALIK YEMEK MENÜSÜ</td></tr>`;
  html += `<tr><td colspan="11" style="${S.subtitle}">${currentWeek.label || currentWeekId}  ·  Günlük Hedef: ${goal} kcal</td></tr>`;
  html += `<tr><td colspan="11" style="${S.empty}">&nbsp;</td></tr>`;

  // ── SÜTUN BAŞLIKLARI ──
  html += `<tr>
    <td style="${S.colHead}" width="100">GÜN</td>
    <td style="${S.colHead}" width="65">ÖĞÜN</td>
    <td style="${S.colHead}" width="180">1. Yemek</td>
    <td style="${S.colHead}" width="55">kcal</td>
    <td style="${S.colHead}" width="180">2. Yemek</td>
    <td style="${S.colHead}" width="55">kcal</td>
    <td style="${S.colHead}" width="180">3. Yemek</td>
    <td style="${S.colHead}" width="55">kcal</td>
    <td style="${S.colHead}" width="180">4. Yemek</td>
    <td style="${S.colHead}" width="55">kcal</td>
    <td style="${S.colHead}" width="80">TOPLAM</td>
  </tr>`;

  let weekTotal = 0;

  currentWeek.days.forEach((day, di) => {
    if (!day.lunchPortions) day.lunchPortions = [1,1,1,1];
    if (!day.dinnerPortions) day.dinnerPortions = [1,1,1,1];

    const bgRow = rc(di);

    // Öğle bilgileri
    const l = [0,1,2,3].map(i => foodInfo(day.lunch[i], day.lunchPortions, i));
    const lunchCal = l.reduce((s,f) => s + f.cal, 0);

    // Akşam bilgileri
    const d = [0,1,2,3].map(i => foodInfo(day.dinner[i], day.dinnerPortions, i));
    const dinnerCal = d.reduce((s,f) => s + f.cal, 0);

    const dayTotal = lunchCal + dinnerCal;
    weekTotal += dayTotal;

    // ÖĞLE SATIRI
    html += `<tr>
      <td rowspan="2" style="${S.dayCell}">${day.dayName}<br><span style="font-size:8pt;font-weight:normal">${formatDate(day.date)}</span></td>
      <td style="${S.mealCell}${bgRow}border:1px solid #e0d8cc;">Öğle</td>`;
    l.forEach(f => {
      html += `<td style="${S.foodCell}${bgRow}${S.border}">${f.name || '—'}</td>`;
      html += `<td style="${S.calCell}${bgRow}${S.border}">${f.cal || ''}</td>`;
    });
    html += `<td style="${S.mealTot}${bgRow}${S.border}color:#b85c0a;">${lunchCal}</td></tr>`;

    // AKŞAM SATIRI
    html += `<tr>
      <td style="${S.mealCell}${bgRow}border:1px solid #e0d8cc;">Akşam</td>`;
    d.forEach(f => {
      html += `<td style="${S.foodCell}${bgRow}${S.border}">${f.name || '—'}</td>`;
      html += `<td style="${S.calCell}${bgRow}${S.border}">${f.cal || ''}</td>`;
    });
    html += `<td style="${S.mealTot}${bgRow}${S.border}color:#b85c0a;">${dinnerCal}</td></tr>`;

    // GÜN TOPLAM SATIRI
    const pct = goal > 0 ? Math.round((dayTotal / goal) * 100) : 0;
    const pctStyle = pct > 100 ? S.pctOver : pct > 85 ? S.pctWarn : S.pctOk;
    html += `<tr>
      <td colspan="9" style="${S.dayTot}text-align:right;">${day.dayName} Toplam</td>
      <td style="${pctStyle}${S.border}">%${pct}</td>
      <td style="${S.dayTot}text-align:center;color:#b85c0a;font-size:11pt;">${dayTotal} kcal</td>
    </tr>`;

    // Ayırıcı
    html += `<tr><td colspan="11" style="${S.empty};height:4px"></td></tr>`;
  });

  // HAFTALIK OZET
  html += `<tr><td colspan="11" style="${S.empty}">&nbsp;</td></tr>`;
  const avgDaily = Math.round(weekTotal / 7);
  const daysWithFood = currentWeek.days.filter(d => calcDayCalories(d) > 0).length;
  const realAvg = daysWithFood > 0 ? Math.round(weekTotal / daysWithFood) : 0;

  html += `<tr><td colspan="9" style="${S.summLabel}">HAFTALIK TOPLAM</td><td colspan="2" style="${S.summVal}">${weekTotal} kcal</td></tr>`;
  html += `<tr><td colspan="9" style="${S.summLabel}">GÜNLÜK ORTALAMA (7 gün)</td><td colspan="2" style="${S.summVal}">${avgDaily} kcal</td></tr>`;
  if (daysWithFood > 0 && daysWithFood < 7) {
    html += `<tr><td colspan="9" style="${S.summLabel}">GÜNLÜK ORTALAMA (${daysWithFood} aktif gün)</td><td colspan="2" style="${S.summVal}">${realAvg} kcal</td></tr>`;
  }
  html += `<tr><td colspan="9" style="${S.summLabel}">GÜNLÜK HEDEF</td><td colspan="2" style="${S.summVal}">${goal} kcal</td></tr>`;

  html += `</table></body></html>`;

  const blob = new Blob([BOM + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `menu_${currentWeek.startDate}.xls`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Excel olarak indirildi', 'success');
}

function importWeek() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = Storage.importWeek(ev.target.result);
      if (result.success) { loadWeek(result.weekId); showToast('Menü içe aktarıldı', 'success'); }
      else showToast('Hata: ' + result.error, 'error');
    };
    reader.readAsText(file);
  };
  input.click();
}

// ─── Weeks Dropdown ─────────────────────
function toggleWeeksDropdown() {
  const active = DOM.weeksDropdown.classList.contains('active');
  if (active) closeWeeksDropdown();
  else { renderWeeksList(); DOM.weeksDropdown.classList.add('active'); }
}
function closeWeeksDropdown() { DOM.weeksDropdown.classList.remove('active'); }
function renderWeeksList() {
  const weeks = Storage.getWeekList();
  if (!weeks.length) { DOM.weeksList.innerHTML = '<div style="padding:16px;color:var(--text-muted);text-align:center">Kayıtlı hafta yok</div>'; return; }
  DOM.weeksList.innerHTML = weeks.map(w => `
    <div class="week-item ${w.id === currentWeekId ? 'active' : ''}" onclick="loadWeek('${w.id}')">
      <span class="week-item-label">${w.label}</span>
      <button class="week-item-delete" onclick="deleteWeek('${w.id}', event)" title="Sil">🗑️</button>
    </div>`).join('');
}

// ════════════════════════════════════════
//  FOOD MANAGEMENT PAGE
// ════════════════════════════════════════

function renderFoodList() {
  const allFoods = getAllFoods();
  let filtered = allFoods;

  // Category filter
  if (foodMgmtFilter.category !== 'all') {
    filtered = filtered.filter(f => f.category === foodMgmtFilter.category);
  }

  // Text search
  if (foodMgmtFilter.query) {
    const q = normalizeTurkish(foodMgmtFilter.query.toLowerCase());
    filtered = filtered.filter(f => normalizeTurkish(f.name.toLowerCase()).includes(q));
  }

  // Sort by category then name
  filtered.sort((a, b) => {
    const catCmp = (a.category || '').localeCompare(b.category || '');
    return catCmp !== 0 ? catCmp : a.name.localeCompare(b.name, 'tr');
  });

  if (DOM.foodCount) DOM.foodCount.textContent = `${filtered.length} / ${allFoods.length} yemek`;

  if (!filtered.length) {
    DOM.foodList.innerHTML = '<div class="food-mgmt-empty">Yemek bulunamadı</div>';
    return;
  }

  let currentCat = '';
  let html = '';
  filtered.forEach(food => {
    if (food.category !== currentCat) {
      currentCat = food.category;
      const cat = FOOD_CATEGORIES[currentCat];
      html += `<div class="food-mgmt-cat-header">${cat?.icon || '🍽️'} ${cat?.name || currentCat}</div>`;
    }
    const catColor = FOOD_CATEGORIES[food.category]?.color || '#7a7060';
    const isCustom = food.isCustom || isCustomFood(food.id);
    const overrides = Storage.getCalorieOverrides();
    const isOverridden = overrides[food.id] !== undefined && !isCustom;
    const originalCal = isOverridden ? getOriginalCalories(food.id) : null;
    const isFav = Storage.isFavorite(food.id);

    html += `
      <div class="food-mgmt-item" id="food-item-${food.id}">
        <span class="food-cat-dot" style="background:${catColor}"></span>
        <span class="food-mgmt-name">${food.name}</span>
        ${isCustom ? '<span class="food-mgmt-badge custom">Özel</span>' : ''}
        ${isOverridden ? '<span class="food-mgmt-badge edited">Düzenlendi</span>' : ''}
        <span class="food-mgmt-portion">${food.portion}</span>
        <div class="food-mgmt-cal-edit">
          <input type="number" class="food-mgmt-cal-input" value="${food.calories}" min="0" max="9999"
                 onchange="updateFoodCalorie('${food.id}', this.value, ${isCustom})"
                 title="Kalori değerini düzenle">
          <span class="food-mgmt-cal-unit">kcal</span>
          ${isOverridden ? `<button class="btn btn-sm" onclick="resetFoodCalorie('${food.id}')" title="Orijinale döndür (${originalCal})">↺</button>` : ''}
        </div>
        <button class="food-mgmt-fav ${isFav ? 'active' : ''}" onclick="toggleMgmtFav('${food.id}')" title="Favori">★</button>
        ${isCustom ? `<button class="food-mgmt-del" onclick="deleteFood('${food.id}')" title="Sil">🗑️</button>` : ''}
      </div>`;
  });

  DOM.foodList.innerHTML = html;
}

function updateFoodCalorie(foodId, newCal, isCustom) {
  const cal = parseInt(newCal);
  if (isNaN(cal) || cal < 0) return;

  if (isCustom) {
    Storage.updateCustomFood(foodId, { calories: cal });
  } else {
    Storage.setCalorieOverride(foodId, cal);
  }
  renderFoodList();
  // Re-render week if planner is showing
  if (activeTab === 'planner') { renderWeek(); updateStats(); }
  showToast('Kalori güncellendi', 'success');
}

function resetFoodCalorie(foodId) {
  Storage.removeCalorieOverride(foodId);
  renderFoodList();
  if (activeTab === 'planner') { renderWeek(); updateStats(); }
  showToast('Orijinal değere döndürüldü', 'info');
}

function deleteFood(foodId) {
  if (!confirm('Bu yemeği silmek istediğinize emin misiniz?')) return;
  Storage.deleteCustomFood(foodId);
  renderFoodList();
  showToast('Yemek silindi', 'info');
}

function toggleMgmtFav(foodId) {
  Storage.toggleFavorite(foodId);
  renderFoodList();
}

function toggleAddFoodForm() {
  DOM.foodAddForm.classList.toggle('hidden');
  if (!DOM.foodAddForm.classList.contains('hidden')) {
    document.getElementById('new-food-name')?.focus();
  }
}

function saveNewFood() {
  const name = document.getElementById('new-food-name')?.value?.trim();
  const cal = parseInt(document.getElementById('new-food-cal')?.value);
  const cat = document.getElementById('new-food-cat')?.value;
  const portion = document.getElementById('new-food-portion')?.value?.trim() || '1 porsiyon';

  if (!name) { showToast('Yemek adı gerekli', 'error'); return; }
  if (isNaN(cal) || cal < 0) { showToast('Geçerli bir kalori değeri girin', 'error'); return; }

  Storage.addCustomFood({ name, calories: cal, category: cat, portion });
  DOM.foodAddForm.classList.add('hidden');

  // Clear form
  document.getElementById('new-food-name').value = '';
  document.getElementById('new-food-cal').value = '';
  document.getElementById('new-food-portion').value = '';

  renderFoodList();
  showToast(`"${name}" eklendi`, 'success');
}

// ════════════════════════════════════════
//  AUTO-FILL (Otomatik Doldur)
// ════════════════════════════════════════

function autoFillWeek() {
  const hasFood = currentWeek.days.some(d => d.lunch.some(f => f) || d.dinner.some(f => f));
  if (hasFood && !confirm('Mevcut menünün üzerine yazılacak. Devam edilsin mi?')) return;

  const goal = Storage.getSettings().dailyCalorieGoal || 2000;
  const mealGoal = Math.round(goal / 2);
  const ctx = createAutoFillContext();

  currentWeek.days.forEach((day) => {
    const isWeekend = (day.dayName === 'Cumartesi' || day.dayName === 'Pazar');
    const mTarget = isWeekend ? Math.round(mealGoal * 1.05) : mealGoal;

    const lunch = buildMeal(ctx, mTarget);
    day.lunch = lunch.ids;
    day.lunchPortions = lunch.portions;

    const dinner = buildMeal(ctx, mTarget);
    day.dinner = dinner.ids;
    day.dinnerPortions = dinner.portions;
  });

  autoSave(); renderWeek(); updateStats();
  const avgDay = Math.round(calcWeekCalories() / 7);
  showToast(`Hafta dolduruldu! Günlük ort: ${avgDay} kcal`, 'success');
}

function autoFillDay(dayIndex) {
  const day = currentWeek.days[dayIndex];
  const hasFood = day.lunch.some(f => f) || day.dinner.some(f => f);
  if (hasFood && !confirm(`${day.dayName} menüsünün üzerine yazılsın mı?`)) return;

  const goal = Storage.getSettings().dailyCalorieGoal || 2000;
  const mealGoal = Math.round(goal / 2);
  const ctx = createAutoFillContext();

  // Bu haftada zaten kullanılan yemekleri used set'e ekle (tekrar önleme)
  currentWeek.days.forEach((d, i) => {
    if (i === dayIndex) return;
    [...d.lunch, ...d.dinner].filter(Boolean).forEach(id => {
      const food = getFoodById(id);
      if (!food) return;
      if (food.category === 'corba') ctx.used.corba.add(id);
      else if (food.category === 'ana_et' || food.category === 'ana_sebze') ctx.used.anaYemek.add(id);
      else if (food.category === 'pilav' || food.category === 'makarna' || food.category === 'borek') ctx.used.yan.add(id);
      else ctx.used.hafif.add(id);
    });
  });

  const lunch = buildMeal(ctx, mealGoal);
  day.lunch = lunch.ids;
  day.lunchPortions = lunch.portions;

  const dinner = buildMeal(ctx, mealGoal);
  day.dinner = dinner.ids;
  day.dinnerPortions = dinner.portions;

  autoSave(); renderWeek(); updateStats();
  const dayCal = calcDayCalories(day);
  showToast(`${day.dayName} dolduruldu! (${dayCal} kcal)`, 'success');
}

function createAutoFillContext() {
  const allFoods = getAllFoods();
  return {
    pools: {
      corba: allFoods.filter(f => f.category === 'corba'),
      anaYemek: allFoods.filter(f => f.category === 'ana_et' || f.category === 'ana_sebze'),
      yan: allFoods.filter(f => f.category === 'pilav' || f.category === 'makarna' || f.category === 'borek'),
      hafif: allFoods.filter(f => f.category === 'salata' || f.category === 'icecek' || f.category === 'meyve' || f.category === 'diger')
    },
    used: { corba: new Set(), anaYemek: new Set(), yan: new Set(), hafif: new Set() }
  };
}

function pickRandom(pool, usedSet) {
  const available = pool.filter(f => !usedSet.has(f.id));
  const source = available.length > 0 ? available : pool;
  if (source.length === 0) return null;
  const pick = source[Math.floor(Math.random() * source.length)];
  usedSet.add(pick.id);
  return pick;
}

function buildMeal(ctx, targetCal) {
  const soup = pickRandom(ctx.pools.corba, ctx.used.corba);
  const main = pickRandom(ctx.pools.anaYemek, ctx.used.anaYemek);
  const side = pickRandom(ctx.pools.yan, ctx.used.yan);
  const light = pickRandom(ctx.pools.hafif, ctx.used.hafif);

  const items = [soup, main, side, light];
  const ids = items.map(f => f?.id || null);
  const portions = [1, 1, 1, 1];

  const totalCal = items.reduce((s, f) => s + (f?.calories || 0), 0);
  if (totalCal > targetCal * 1.3 && main) {
    portions[1] = 0.5;
  } else if (totalCal < targetCal * 0.6 && main) {
    portions[1] = 1.5;
  }

  return { ids, portions };
}

// ─── Utilities ──────────────────────────
function formatDate(dateStr) {
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function showToast(message, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
  DOM.toastContainer.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
}
