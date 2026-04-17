/**
 * Kalori Hesaplama - Ana Uygulama
 * Haftalık yemek planlama, kalori hesaplama, yemek yönetimi
 */

let currentWeekId = null;
let currentWeek = null;
let searchTarget = null;
let selectedSearchIndex = -1;
let clipboard = null; // { lunch, dinner, lunchPortions, dinnerPortions }
let activeTab = 'planner';
let foodMgmtFilter = { query: '', category: 'all' };
let saveTimeout = null;

const PORTION_OPTIONS = [0.5, 1, 1.5, 2];
const DOM = {};

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
    const savedWeek = Storage.getWeek(settings.lastWeekId);
    if (savedWeek) {
      currentWeekId = settings.lastWeekId;
      currentWeek = savedWeek;
    }
  }

  if (!currentWeek) createNewWeekFromDate(new Date());

  if (DOM.goalInput) {
    DOM.goalInput.value = settings.dailyCalorieGoal || 2000;
  }

  renderWeek();
  updateStats();
}

function bindEvents() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.getElementById('btn-prev-week')?.addEventListener('click', () => navigateWeek(-1));
  document.getElementById('btn-next-week')?.addEventListener('click', () => navigateWeek(1));
  document.getElementById('btn-new-week')?.addEventListener('click', () => {
    createNewWeekFromDate(new Date());
    renderWeek();
    updateStats();
    showToast('Yeni hafta oluşturuldu', 'success');
  });

  DOM.weekDateInput?.addEventListener('change', event => {
    if (!event.target.value) return;
    createNewWeekFromDate(getMonday(new Date(event.target.value)));
    renderWeek();
    updateStats();
  });

  document.getElementById('btn-saved-weeks')?.addEventListener('click', toggleWeeksDropdown);

  DOM.searchOverlay?.addEventListener('click', event => {
    if (event.target === DOM.searchOverlay) closeSearch();
  });
  DOM.searchInput?.addEventListener('input', event => {
    selectedSearchIndex = -1;
    renderSearchResults(event.target.value);
  });
  DOM.searchInput?.addEventListener('keydown', handleSearchKeydown);

  DOM.goalInput?.addEventListener('change', event => {
    const value = Number.parseInt(event.target.value, 10) || 2000;
    Storage.saveSettings({ dailyCalorieGoal: value });
    renderWeek();
    updateStats();
    showToast(`Günlük hedef: ${value} kcal`, 'success');
  });

  document.getElementById('btn-auto-fill')?.addEventListener('click', autoFillWeek);
  document.getElementById('btn-print')?.addEventListener('click', () => window.print());
  document.getElementById('btn-export')?.addEventListener('click', exportCurrentWeek);
  document.getElementById('btn-export-excel')?.addEventListener('click', exportExcel);
  document.getElementById('btn-import')?.addEventListener('click', importWeek);

  DOM.foodSearch?.addEventListener('input', event => {
    foodMgmtFilter.query = event.target.value;
    renderFoodList();
  });

  document.getElementById('btn-add-food')?.addEventListener('click', toggleAddFoodForm);

  document.querySelectorAll('.food-cat-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.food-cat-filter-btn').forEach(item => item.classList.remove('active'));
      btn.classList.add('active');
      foodMgmtFilter.category = btn.dataset.category;
      renderFoodList();
    });
  });

  document.getElementById('food-form-save')?.addEventListener('click', saveNewFood);
  document.getElementById('food-form-cancel')?.addEventListener('click', () => {
    DOM.foodAddForm?.classList.add('hidden');
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeSearch();
      closeWeeksDropdown();
    }
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('.saved-weeks-wrapper')) closeWeeksDropdown();
  });
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  DOM.tabPlanner?.classList.toggle('hidden', tab !== 'planner');
  DOM.tabFoods?.classList.toggle('hidden', tab !== 'foods');

  if (tab === 'foods') renderFoodList();
  if (tab === 'planner') {
    renderWeek();
    updateStats();
  }
}

function createNewWeekFromDate(date) {
  const monday = getMonday(date);
  const weekId = getWeekId(monday);
  const existingWeek = Storage.getWeek(weekId);

  if (existingWeek) {
    currentWeekId = weekId;
    currentWeek = existingWeek;
  } else {
    currentWeek = Storage.createEmptyWeek(monday);
    currentWeekId = weekId;
    Storage.saveWeek(weekId, currentWeek);
  }

  Storage.saveSettings({ lastWeekId: currentWeekId });
}

function navigateWeek(direction) {
  persistCurrentWeek();
  const startDate = new Date(`${currentWeek.startDate}T12:00:00`);
  startDate.setDate(startDate.getDate() + (direction * 7));
  createNewWeekFromDate(startDate);
  renderWeek();
  updateStats();
}

function loadWeek(weekId) {
  persistCurrentWeek();
  const week = Storage.getWeek(weekId);
  if (!week) return;

  currentWeekId = weekId;
  currentWeek = week;
  Storage.saveSettings({ lastWeekId: weekId });
  renderWeek();
  updateStats();
  closeWeeksDropdown();
  showToast('Hafta yüklendi', 'success');
}

function deleteWeek(weekId, event) {
  event.stopPropagation();
  if (!confirm('Bu haftayı silmek istediğinize emin misiniz?')) return;

  persistCurrentWeek();
  Storage.deleteWeek(weekId);
  if (weekId === currentWeekId) {
    createNewWeekFromDate(new Date());
    renderWeek();
    updateStats();
  }

  renderWeeksList();
  showToast('Hafta silindi', 'info');
}

function renderWeek() {
  if (!currentWeek || !DOM.menuGrid) return;

  DOM.weekLabel.textContent = currentWeek.label || currentWeekId;
  DOM.weekDateInput.value = currentWeek.startDate;
  DOM.menuGrid.innerHTML = '';

  currentWeek.days.forEach((day, index) => {
    DOM.menuGrid.appendChild(renderDayCard(day, index));
  });
}

function renderDayCard(day, dayIndex) {
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
        <span class="day-name">${escapeHtml(day.dayName)}</span>
        <span class="day-date">${escapeHtml(formatDate(day.date))}</span>
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
  const mealTypeArg = toInlineHandlerArg(mealType);

  return slots.map((foodId, index) => {
    const portion = (portions && portions[index]) || 1;

    if (!foodId) {
      return `<div class="food-slot empty" onclick="openSearch(${dayIndex},${mealTypeArg},${index})"></div>`;
    }

    const food = getFoodById(foodId);
    if (!food) {
      return `<div class="food-slot empty" onclick="openSearch(${dayIndex},${mealTypeArg},${index})"></div>`;
    }

    const calories = Math.round(food.calories * portion);
    const catColor = FOOD_CATEGORIES[food.category]?.color || '#7a7060';
    const isFav = Storage.isFavorite(foodId);
    const portionLabel = portion !== 1 ? `${portion}x` : '1x';
    const title = `${food.portion}${portion !== 1 ? ` - ${portionLabel} porsiyon` : ''}`;
    const foodIdArg = toInlineHandlerArg(foodId);

    return `
      <div class="food-slot filled" title="${escapeHtml(title)}">
        <span class="food-cat-dot" style="background:${catColor}"></span>
        <span class="food-slot-name" onclick="openSearch(${dayIndex},${mealTypeArg},${index})">${escapeHtml(food.name)}</span>
        <button class="food-slot-portion ${portion === 1 ? 'dim' : ''}" onclick="cyclePortion(${dayIndex},${mealTypeArg},${index})" title="Porsiyon değiştir">${portionLabel}</button>
        <span class="food-slot-cal">${calories}</span>
        <button class="food-slot-fav ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFoodFav(${foodIdArg}, ${dayIndex})" title="Favori">★</button>
        <button class="food-slot-remove" onclick="event.stopPropagation(); removeFood(${dayIndex},${mealTypeArg},${index})" title="Kaldır">✕</button>
      </div>`;
  }).join('');
}

function cyclePortion(dayIndex, mealType, slotIndex) {
  const portionsKey = `${mealType}Portions`;
  if (!currentWeek.days[dayIndex][portionsKey]) currentWeek.days[dayIndex][portionsKey] = [1, 1, 1, 1];

  const currentValue = currentWeek.days[dayIndex][portionsKey][slotIndex] || 1;
  const currentIndex = PORTION_OPTIONS.indexOf(currentValue);
  const nextValue = PORTION_OPTIONS[(currentIndex + 1) % PORTION_OPTIONS.length];

  currentWeek.days[dayIndex][portionsKey][slotIndex] = nextValue;
  autoSave();
  renderWeek();
  updateStats();
}

function copyDay(dayIndex) {
  const day = currentWeek.days[dayIndex];
  clipboard = {
    lunch: [...day.lunch],
    dinner: [...day.dinner],
    lunchPortions: [...(day.lunchPortions || [1, 1, 1, 1])],
    dinnerPortions: [...(day.dinnerPortions || [1, 1, 1, 1])]
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

  autoSave();
  renderWeek();
  updateStats();
  showToast(`${day.dayName} yapıştırıldı`, 'success');
}

function toggleFoodFav(foodId) {
  const added = Storage.toggleFavorite(foodId);
  renderWeek();
  showToast(added ? 'Favorilere eklendi ★' : 'Favorilerden çıkarıldı', 'info');
}

function openSearch(dayIndex, mealType, slotIndex) {
  searchTarget = { dayIndex, mealType, slotIndex };
  const day = currentWeek.days[dayIndex];
  const mealLabel = mealType === 'lunch' ? 'Öğle' : 'Akşam';

  DOM.searchContext.innerHTML = `<span>${escapeHtml(day.dayName)}</span> - ${escapeHtml(mealLabel)} Yemeği, Slot ${slotIndex + 1}`;
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
  const favorites = Storage.getFavorites();
  const allFoods = getAllFoods();
  let html = '';

  if (favorites.length > 0) {
    html += '<div class="search-category-header">★ Favoriler</div>';
    let index = 0;
    favorites.forEach(foodId => {
      const food = getFoodById(foodId);
      if (food) html += renderSearchItem(food, index++);
    });
    html += '<div style="height:8px"></div>';
  }

  html += '<div class="category-grid">';
  Object.entries(FOOD_CATEGORIES).forEach(([key, category]) => {
    const count = allFoods.filter(food => food.category === key).length;
    html += `
      <div class="category-btn" onclick="browseCategory(${toInlineHandlerArg(key)})">
        <span class="category-btn-icon">${category.icon}</span>
        <span class="category-btn-name">${escapeHtml(category.name)} (${count})</span>
      </div>`;
  });
  html += '</div>';

  DOM.searchResults.innerHTML = html;
}

function browseCategory(categoryKey) {
  const foods = getFoodsByCategory(categoryKey);
  const category = FOOD_CATEGORIES[categoryKey];
  if (!category) return;

  let html = `<div class="search-category-header">${category.icon} ${escapeHtml(category.name)}</div>`;
  foods.forEach((food, index) => {
    html += renderSearchItem(food, index);
  });

  DOM.searchResults.innerHTML = html;
  DOM.searchInput.focus();
}

function renderSearchResults(query) {
  if (!query || !query.trim()) {
    renderSearchHome();
    return;
  }

  const results = searchFoods(query);
  if (results.length === 0) {
    DOM.searchResults.innerHTML = `<div class="search-empty"><div class="search-empty-icon">🔍</div>"${escapeHtml(query)}" için sonuç bulunamadı</div>`;
    return;
  }

  const groups = {};
  results.forEach(food => {
    if (!groups[food.category]) groups[food.category] = [];
    groups[food.category].push(food);
  });

  let html = '';
  let globalIndex = 0;

  Object.keys(FOOD_CATEGORIES).forEach(categoryKey => {
    if (!groups[categoryKey]) return;
    const category = FOOD_CATEGORIES[categoryKey];
    html += `<div class="search-category-header">${category.icon} ${escapeHtml(category.name)}</div>`;
    groups[categoryKey].forEach(food => {
      html += renderSearchItem(food, globalIndex++);
    });
  });

  DOM.searchResults.innerHTML = html;
}

function renderSearchItem(food, index) {
  const catColor = FOOD_CATEGORIES[food.category]?.color || '#7a7060';
  const selected = index === selectedSearchIndex ? ' selected' : '';
  const isFavorite = Storage.isFavorite(food.id);
  const foodIdArg = toInlineHandlerArg(food.id);

  return `
    <div class="search-result-item${selected}" data-index="${index}" data-food-id="${escapeHtml(food.id)}">
      <button class="search-fav-btn ${isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); toggleSearchFav(${foodIdArg})" title="Favori">${isFavorite ? '★' : '☆'}</button>
      <span class="search-result-dot" style="background:${catColor}"></span>
      <span class="search-result-name" onclick="selectFood(${foodIdArg})">${escapeHtml(food.name)}</span>
      <span class="search-result-portion">${escapeHtml(food.portion)}</span>
      <span class="search-result-cal" onclick="selectFood(${foodIdArg})">${food.calories} kcal</span>
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

  const food = getFoodById(foodId);
  if (!food) {
    showToast('Yemek bulunamadı', 'error');
    return;
  }

  const { dayIndex, mealType, slotIndex } = searchTarget;
  currentWeek.days[dayIndex][mealType][slotIndex] = foodId;

  const portionsKey = `${mealType}Portions`;
  if (!currentWeek.days[dayIndex][portionsKey]) currentWeek.days[dayIndex][portionsKey] = [1, 1, 1, 1];
  currentWeek.days[dayIndex][portionsKey][slotIndex] = 1;

  autoSave();
  closeSearch();
  renderWeek();
  updateStats();
  showToast(`${food.name} eklendi (${food.calories} kcal)`, 'success');
}

function removeFood(dayIndex, mealType, slotIndex) {
  const foodId = currentWeek.days[dayIndex][mealType][slotIndex];
  const food = getFoodById(foodId);

  currentWeek.days[dayIndex][mealType][slotIndex] = null;
  const portionsKey = `${mealType}Portions`;
  if (currentWeek.days[dayIndex][portionsKey]) {
    currentWeek.days[dayIndex][portionsKey][slotIndex] = 1;
  }

  autoSave();
  renderWeek();
  updateStats();
  if (food) showToast(`${food.name} kaldırıldı`, 'info');
}

function handleSearchKeydown(event) {
  const items = DOM.searchResults.querySelectorAll('.search-result-item');
  if (!items.length) return;

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    selectedSearchIndex = Math.min(selectedSearchIndex + 1, items.length - 1);
    updateSearchSelection(items);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    selectedSearchIndex = Math.max(selectedSearchIndex - 1, 0);
    updateSearchSelection(items);
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const target = items[selectedSearchIndex];
    if (selectedSearchIndex >= 0 && target) selectFood(target.dataset.foodId);
  }
}

function updateSearchSelection(items) {
  items.forEach((item, index) => {
    item.classList.toggle('selected', index === selectedSearchIndex);
    if (index === selectedSearchIndex) item.scrollIntoView({ block: 'nearest' });
  });
}

function calcMealCalories(slots, portions) {
  return slots.reduce((total, foodId, index) => {
    if (!foodId) return total;

    const food = getFoodById(foodId);
    const portion = (portions && portions[index]) || 1;
    return total + (food ? Math.round(food.calories * portion) : 0);
  }, 0);
}

function calcDayCalories(day) {
  return calcMealCalories(day.lunch, day.lunchPortions) + calcMealCalories(day.dinner, day.dinnerPortions);
}

function calcWeekCalories() {
  return currentWeek.days.reduce((total, day) => total + calcDayCalories(day), 0);
}

function countMeals() {
  let count = 0;
  currentWeek.days.forEach(day => {
    if (day.lunch.some(Boolean)) count += 1;
    if (day.dinner.some(Boolean)) count += 1;
  });
  return count;
}

function countFoods() {
  let count = 0;
  currentWeek.days.forEach(day => {
    count += day.lunch.filter(Boolean).length;
    count += day.dinner.filter(Boolean).length;
  });
  return count;
}

function updateStats() {
  const weekCalories = calcWeekCalories();
  const daysWithFood = currentWeek.days.filter(day => calcDayCalories(day) > 0).length;
  const avgDaily = daysWithFood > 0 ? Math.round(weekCalories / daysWithFood) : 0;

  animateNumber(DOM.statWeeklyCal, weekCalories);
  animateNumber(DOM.statDailyCal, avgDaily);
  if (DOM.statMealCount) DOM.statMealCount.textContent = countMeals();
  if (DOM.statFoodCount) DOM.statFoodCount.textContent = countFoods();
}

function animateNumber(element, target) {
  if (!element) return;

  const current = Number.parseInt(element.textContent.replace(/\./g, ''), 10) || 0;
  if (current === target) return;

  const duration = 400;
  const start = performance.now();

  function step(timestamp) {
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(current + (target - current) * eased).toLocaleString('tr-TR');
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function autoSave() {
  clearTimeout(saveTimeout);
  const weekIdSnapshot = currentWeekId;
  const weekSnapshot = JSON.parse(JSON.stringify(currentWeek));
  saveTimeout = setTimeout(() => {
    Storage.saveWeek(weekIdSnapshot, weekSnapshot);
  }, 300);
}

function exportCurrentWeek() {
  persistCurrentWeek();
  const json = Storage.exportWeek(currentWeekId);
  if (!json) return;

  downloadBlob(new Blob([json], { type: 'application/json' }), `menu_${currentWeek.startDate}.json`);
  showToast('JSON olarak dışa aktarıldı', 'success');
}

function exportExcel() {
  persistCurrentWeek();
  const goal = Storage.getSettings().dailyCalorieGoal || 2000;
  const BOM = '\uFEFF';

  const styles = {
    title: 'background:#d97016;color:#fff;font-size:16pt;font-weight:bold;font-family:Calibri;text-align:center;padding:12px;',
    subtitle: 'background:#f5f1ea;color:#6b5f50;font-size:10pt;font-family:Calibri;text-align:center;padding:6px;',
    colHead: 'background:#2c2418;color:#faf8f4;font-size:9pt;font-weight:bold;font-family:Calibri;text-align:center;padding:6px 8px;border:1px solid #1a1610;',
    dayCell: 'background:#e8940b;color:#fff;font-size:11pt;font-weight:bold;font-family:Calibri;padding:6px 10px;border:1px solid #c2610a;vertical-align:middle;',
    mealCell: 'font-size:9pt;font-weight:bold;font-family:Calibri;padding:5px 8px;text-align:center;vertical-align:middle;',
    foodCell: 'font-size:10pt;font-family:Calibri;padding:4px 8px;',
    calCell: 'font-size:10pt;font-family:Calibri;padding:4px 6px;text-align:right;color:#b85c0a;font-weight:bold;',
    mealTot: 'font-size:10pt;font-family:Calibri;font-weight:bold;padding:4px 8px;text-align:right;',
    dayTot: 'background:#fdf6e8;font-size:10pt;font-family:Calibri;font-weight:bold;padding:6px 8px;border:1px solid #e0d8cc;',
    pctOk: 'background:#e8f5e9;color:#2e7d32;font-weight:bold;text-align:center;font-family:Calibri;font-size:10pt;padding:4px;',
    pctWarn: 'background:#fff3e0;color:#e65100;font-weight:bold;text-align:center;font-family:Calibri;font-size:10pt;padding:4px;',
    pctOver: 'background:#ffebee;color:#c62828;font-weight:bold;text-align:center;font-family:Calibri;font-size:10pt;padding:4px;',
    summLabel: 'background:#2c2418;color:#faf8f4;font-size:11pt;font-weight:bold;font-family:Calibri;padding:8px 12px;text-align:right;border:1px solid #1a1610;',
    summVal: 'background:#d97016;color:#fff;font-size:12pt;font-weight:bold;font-family:Calibri;padding:8px 12px;text-align:center;border:1px solid #c2610a;',
    empty: 'border:none;padding:2px;',
    border: 'border:1px solid #e0d8cc;'
  };

  const rowColor = index => (index % 2 === 0 ? 'background:#faf8f4;' : 'background:#f0ece4;');

  function foodInfo(foodId, portions, index) {
    const food = foodId ? getFoodById(foodId) : null;
    const portion = (portions && portions[index]) || 1;
    if (!food) return { name: '', cal: 0 };

    const calories = Math.round(food.calories * portion);
    const portionText = portion !== 1 ? ` (${portion}x)` : '';

    return {
      name: sanitizeExcelText(food.name + portionText),
      cal: calories
    };
  }

  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8">
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>Haftalık Menü</x:Name>
<x:WorksheetOptions><x:DisplayGridlines/><x:FitToPage/><x:Print><x:FitWidth>1</x:FitWidth></x:Print></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
</head><body>
<table border="0" cellpadding="0" cellspacing="0">`;

  html += `<tr><td colspan="11" style="${styles.title}">HAFTALIK YEMEK MENÜSÜ</td></tr>`;
  html += `<tr><td colspan="11" style="${styles.subtitle}">${sanitizeExcelText(currentWeek.label || currentWeekId)} · Günlük Hedef: ${goal} kcal</td></tr>`;
  html += `<tr><td colspan="11" style="${styles.empty}">&nbsp;</td></tr>`;

  html += `<tr>
    <td style="${styles.colHead}" width="100">GÜN</td>
    <td style="${styles.colHead}" width="65">ÖĞÜN</td>
    <td style="${styles.colHead}" width="180">1. Yemek</td>
    <td style="${styles.colHead}" width="55">kcal</td>
    <td style="${styles.colHead}" width="180">2. Yemek</td>
    <td style="${styles.colHead}" width="55">kcal</td>
    <td style="${styles.colHead}" width="180">3. Yemek</td>
    <td style="${styles.colHead}" width="55">kcal</td>
    <td style="${styles.colHead}" width="180">4. Yemek</td>
    <td style="${styles.colHead}" width="55">kcal</td>
    <td style="${styles.colHead}" width="80">TOPLAM</td>
  </tr>`;

  let weekTotal = 0;

  currentWeek.days.forEach((day, dayIndex) => {
    if (!day.lunchPortions) day.lunchPortions = [1, 1, 1, 1];
    if (!day.dinnerPortions) day.dinnerPortions = [1, 1, 1, 1];

    const bgRow = rowColor(dayIndex);
    const lunchItems = [0, 1, 2, 3].map(index => foodInfo(day.lunch[index], day.lunchPortions, index));
    const dinnerItems = [0, 1, 2, 3].map(index => foodInfo(day.dinner[index], day.dinnerPortions, index));
    const lunchCal = lunchItems.reduce((sum, item) => sum + item.cal, 0);
    const dinnerCal = dinnerItems.reduce((sum, item) => sum + item.cal, 0);
    const dayTotal = lunchCal + dinnerCal;
    const pct = goal > 0 ? Math.round((dayTotal / goal) * 100) : 0;
    const pctStyle = pct > 100 ? styles.pctOver : pct > 85 ? styles.pctWarn : styles.pctOk;

    weekTotal += dayTotal;

    html += `<tr>
      <td rowspan="2" style="${styles.dayCell}">${sanitizeExcelText(day.dayName)}<br><span style="font-size:8pt;font-weight:normal">${sanitizeExcelText(formatDate(day.date))}</span></td>
      <td style="${styles.mealCell}${bgRow}border:1px solid #e0d8cc;">Öğle</td>`;
    lunchItems.forEach(item => {
      html += `<td style="${styles.foodCell}${bgRow}${styles.border}">${item.name || '&mdash;'}</td>`;
      html += `<td style="${styles.calCell}${bgRow}${styles.border}">${item.cal || ''}</td>`;
    });
    html += `<td style="${styles.mealTot}${bgRow}${styles.border}color:#b85c0a;">${lunchCal}</td></tr>`;

    html += `<tr>
      <td style="${styles.mealCell}${bgRow}border:1px solid #e0d8cc;">Akşam</td>`;
    dinnerItems.forEach(item => {
      html += `<td style="${styles.foodCell}${bgRow}${styles.border}">${item.name || '&mdash;'}</td>`;
      html += `<td style="${styles.calCell}${bgRow}${styles.border}">${item.cal || ''}</td>`;
    });
    html += `<td style="${styles.mealTot}${bgRow}${styles.border}color:#b85c0a;">${dinnerCal}</td></tr>`;

    html += `<tr>
      <td colspan="9" style="${styles.dayTot}text-align:right;">${sanitizeExcelText(day.dayName)} Toplam</td>
      <td style="${pctStyle}${styles.border}">%${pct}</td>
      <td style="${styles.dayTot}text-align:center;color:#b85c0a;font-size:11pt;">${dayTotal} kcal</td>
    </tr>`;

    html += `<tr><td colspan="11" style="${styles.empty};height:4px"></td></tr>`;
  });

  const avgDaily = Math.round(weekTotal / 7);
  const daysWithFood = currentWeek.days.filter(day => calcDayCalories(day) > 0).length;
  const activeAvg = daysWithFood > 0 ? Math.round(weekTotal / daysWithFood) : 0;

  html += `<tr><td colspan="11" style="${styles.empty}">&nbsp;</td></tr>`;
  html += `<tr><td colspan="9" style="${styles.summLabel}">HAFTALIK TOPLAM</td><td colspan="2" style="${styles.summVal}">${weekTotal} kcal</td></tr>`;
  html += `<tr><td colspan="9" style="${styles.summLabel}">GÜNLÜK ORTALAMA (7 gün)</td><td colspan="2" style="${styles.summVal}">${avgDaily} kcal</td></tr>`;
  if (daysWithFood > 0 && daysWithFood < 7) {
    html += `<tr><td colspan="9" style="${styles.summLabel}">GÜNLÜK ORTALAMA (${daysWithFood} aktif gün)</td><td colspan="2" style="${styles.summVal}">${activeAvg} kcal</td></tr>`;
  }
  html += `<tr><td colspan="9" style="${styles.summLabel}">GÜNLÜK HEDEF</td><td colspan="2" style="${styles.summVal}">${goal} kcal</td></tr>`;
  html += '</table></body></html>';

  downloadBlob(new Blob([BOM + html], { type: 'application/vnd.ms-excel;charset=utf-8' }), `menu_${currentWeek.startDate}.xls`);
  showToast('Excel olarak indirildi', 'success');
}

function importWeek() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = loadEvent => {
      clearTimeout(saveTimeout);
      const result = Storage.importWeek(loadEvent.target.result);
      if (!result.success) {
        showToast(`Hata: ${result.error}`, 'error');
        return;
      }

      loadWeek(result.weekId);
      const summary = [];
      if (result.importedCustomFoods) summary.push(`${result.importedCustomFoods} özel yemek`);
      if (result.importedOverrides) summary.push(`${result.importedOverrides} kalori override`);
      showToast(summary.length ? `Menü içe aktarıldı (${summary.join(', ')})` : 'Menü içe aktarıldı', 'success');
    };
    reader.readAsText(file);
  };
  input.click();
}

function toggleWeeksDropdown() {
  const active = DOM.weeksDropdown.classList.contains('active');
  if (active) closeWeeksDropdown();
  else {
    renderWeeksList();
    DOM.weeksDropdown.classList.add('active');
  }
}

function closeWeeksDropdown() {
  DOM.weeksDropdown.classList.remove('active');
}

function renderWeeksList() {
  const weeks = Storage.getWeekList();
  if (!weeks.length) {
    DOM.weeksList.innerHTML = '<div style="padding:16px;color:var(--text-muted);text-align:center">Kayıtlı hafta yok</div>';
    return;
  }

  DOM.weeksList.innerHTML = weeks.map(week => `
    <div class="week-item ${week.id === currentWeekId ? 'active' : ''}" onclick="loadWeek(${toInlineHandlerArg(week.id)})">
      <span class="week-item-label">${escapeHtml(week.label)}</span>
      <button class="week-item-delete" onclick="deleteWeek(${toInlineHandlerArg(week.id)}, event)" title="Sil">🗑️</button>
    </div>`).join('');
}

function renderFoodList() {
  const allFoods = getAllFoods();
  let filteredFoods = allFoods;

  if (foodMgmtFilter.category !== 'all') {
    filteredFoods = filteredFoods.filter(food => food.category === foodMgmtFilter.category);
  }

  if (foodMgmtFilter.query) {
    const normalizedQuery = normalizeTurkish(foodMgmtFilter.query.toLowerCase());
    filteredFoods = filteredFoods.filter(food => normalizeTurkish(food.name.toLowerCase()).includes(normalizedQuery));
  }

  filteredFoods = [...filteredFoods].sort((a, b) => a.name.localeCompare(b.name, 'tr'));

  if (DOM.foodCount) {
    DOM.foodCount.textContent = `${filteredFoods.length} / ${allFoods.length} yemek`;
  }

  if (!filteredFoods.length) {
    DOM.foodList.innerHTML = '<div class="food-mgmt-empty">Aramanızla eşleşen yemek bulunamadı</div>';
    return;
  }

  const groups = {};
  filteredFoods.forEach(food => {
    if (!groups[food.category]) groups[food.category] = [];
    groups[food.category].push(food);
  });

  const overrides = Storage.getCalorieOverrides();
  let html = '';

  Object.keys(FOOD_CATEGORIES).forEach(categoryKey => {
    const foods = groups[categoryKey];
    if (!foods || foods.length === 0) return;

    const category = FOOD_CATEGORIES[categoryKey];
    html += `<div class="food-mgmt-cat-section">
      <div class="food-mgmt-cat-header">
        <span class="food-mgmt-cat-icon">${category.icon}</span>
        <span class="food-mgmt-cat-name">${escapeHtml(category.name)}</span>
        <span class="food-mgmt-cat-count">${foods.length} yemek</span>
      </div>
      <div class="food-mgmt-cat-items">`;

    foods.forEach(food => {
      const isCustom = food.isCustom || isCustomFood(food.id);
      const isOverridden = overrides[food.id] !== undefined && !isCustom;
      const originalCalories = isOverridden ? getOriginalCalories(food.id) : null;
      const isFavorite = Storage.isFavorite(food.id);
      const foodIdArg = toInlineHandlerArg(food.id);

      html += `
        <div class="food-mgmt-item">
          <div class="food-mgmt-name-col">
            <span class="food-mgmt-name">${escapeHtml(food.name)}</span>
            ${isCustom ? '<span class="food-mgmt-badge custom">Özel</span>' : ''}
            ${isOverridden ? '<span class="food-mgmt-badge edited">Düzenlendi</span>' : ''}
          </div>
          <span class="food-mgmt-portion">${escapeHtml(food.portion)}</span>
          <div class="food-mgmt-cal-edit">
            <input type="number" class="food-mgmt-cal-input" value="${food.calories}" min="0" max="9999"
                   onchange="updateFoodCalorie(${foodIdArg}, this.value, ${isCustom})"
                   title="Kalori değerini düzenle">
            <span class="food-mgmt-cal-unit">kcal</span>
            ${isOverridden ? `<button class="food-mgmt-reset" onclick="resetFoodCalorie(${foodIdArg})" title="${escapeHtml(`Orijinale döndür (${originalCalories} kcal)`)}">&#8634; ${originalCalories}</button>` : ''}
          </div>
          <div class="food-mgmt-actions">
            <button class="food-mgmt-fav ${isFavorite ? 'active' : ''}" onclick="toggleMgmtFav(${foodIdArg})" title="Favori">&#9733;</button>
            ${isCustom ? `<button class="food-mgmt-del" onclick="deleteFood(${foodIdArg})" title="Sil">&#128465;</button>` : ''}
          </div>
        </div>`;
    });

    html += '</div></div>';
  });

  DOM.foodList.innerHTML = html;
}

function updateFoodCalorie(foodId, newCal, isCustom) {
  const calories = Number.parseInt(newCal, 10);
  if (Number.isNaN(calories) || calories < 0) return;

  if (isCustom) Storage.updateCustomFood(foodId, { calories });
  else Storage.setCalorieOverride(foodId, calories);

  renderFoodList();
  if (activeTab === 'planner') {
    renderWeek();
    updateStats();
  }
  showToast('Kalori güncellendi', 'success');
}

function resetFoodCalorie(foodId) {
  Storage.removeCalorieOverride(foodId);
  renderFoodList();
  if (activeTab === 'planner') {
    renderWeek();
    updateStats();
  }
  showToast('Orijinal değere döndürüldü', 'info');
}

function deleteFood(foodId) {
  if (!confirm('Bu yemeği silmek istediğinize emin misiniz?')) return;

  clearTimeout(saveTimeout);
  Storage.deleteCustomFood(foodId);
  const refreshedWeek = Storage.getWeek(currentWeekId);
  if (refreshedWeek) currentWeek = refreshedWeek;

  renderFoodList();
  if (activeTab === 'planner') {
    renderWeek();
    updateStats();
  }
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
  const calories = Number.parseInt(document.getElementById('new-food-cal')?.value, 10);
  const category = document.getElementById('new-food-cat')?.value;
  const portion = document.getElementById('new-food-portion')?.value?.trim() || '1 porsiyon';
  const safeCategory = FOOD_CATEGORIES[category] ? category : 'diger';

  if (!name) {
    showToast('Yemek adı gerekli', 'error');
    return;
  }

  if (Number.isNaN(calories) || calories < 0) {
    showToast('Geçerli bir kalori değeri girin', 'error');
    return;
  }

  Storage.addCustomFood({ name, calories, category: safeCategory, portion });
  DOM.foodAddForm.classList.add('hidden');

  document.getElementById('new-food-name').value = '';
  document.getElementById('new-food-cal').value = '';
  document.getElementById('new-food-portion').value = '';

  renderFoodList();
  showToast(`"${name}" eklendi`, 'success');
}

function autoFillWeek() {
  const hasFood = currentWeek.days.some(day => day.lunch.some(Boolean) || day.dinner.some(Boolean));
  if (hasFood && !confirm('Mevcut menünün üzerine yazılacak. Devam edilsin mi?')) return;

  const goal = Storage.getSettings().dailyCalorieGoal || 2000;
  const mealGoal = Math.round(goal / 2);
  const context = createAutoFillContext();

  currentWeek.days.forEach(day => {
    const isWeekend = day.dayName === 'Cumartesi' || day.dayName === 'Pazar';
    const target = isWeekend ? Math.round(mealGoal * 1.05) : mealGoal;

    const lunch = buildMeal(context, target);
    day.lunch = lunch.ids;
    day.lunchPortions = lunch.portions;

    const dinner = buildMeal(context, target);
    day.dinner = dinner.ids;
    day.dinnerPortions = dinner.portions;
  });

  autoSave();
  renderWeek();
  updateStats();
  showToast(`Hafta dolduruldu! Günlük ort: ${Math.round(calcWeekCalories() / 7)} kcal`, 'success');
}

function autoFillDay(dayIndex) {
  const day = currentWeek.days[dayIndex];
  const hasFood = day.lunch.some(Boolean) || day.dinner.some(Boolean);
  if (hasFood && !confirm(`${day.dayName} menüsünün üzerine yazılsın mı?`)) return;

  const goal = Storage.getSettings().dailyCalorieGoal || 2000;
  const mealGoal = Math.round(goal / 2);
  const context = createAutoFillContext();

  currentWeek.days.forEach((currentDay, index) => {
    if (index === dayIndex) return;

    [...currentDay.lunch, ...currentDay.dinner].filter(Boolean).forEach(foodId => {
      const food = getFoodById(foodId);
      if (!food) return;

      if (food.category === 'corba') context.used.corba.add(foodId);
      else if (food.category === 'ana_et' || food.category === 'ana_sebze') context.used.anaYemek.add(foodId);
      else if (food.category === 'pilav' || food.category === 'makarna' || food.category === 'borek') context.used.yan.add(foodId);
      else context.used.hafif.add(foodId);
    });
  });

  const lunch = buildMeal(context, mealGoal);
  day.lunch = lunch.ids;
  day.lunchPortions = lunch.portions;

  const dinner = buildMeal(context, mealGoal);
  day.dinner = dinner.ids;
  day.dinnerPortions = dinner.portions;

  autoSave();
  renderWeek();
  updateStats();
  showToast(`${day.dayName} dolduruldu! (${calcDayCalories(day)} kcal)`, 'success');
}

function createAutoFillContext() {
  const allFoods = getAllFoods();
  return {
    pools: {
      corba: allFoods.filter(food => food.category === 'corba'),
      anaYemek: allFoods.filter(food => food.category === 'ana_et' || food.category === 'ana_sebze'),
      yan: allFoods.filter(food => food.category === 'pilav' || food.category === 'makarna' || food.category === 'borek'),
      hafif: allFoods.filter(food => food.category === 'salata' || food.category === 'icecek' || food.category === 'meyve' || food.category === 'diger')
    },
    used: {
      corba: new Set(),
      anaYemek: new Set(),
      yan: new Set(),
      hafif: new Set()
    }
  };
}

function pickRandom(pool, usedSet) {
  const available = pool.filter(food => !usedSet.has(food.id));
  const source = available.length > 0 ? available : pool;
  if (source.length === 0) return null;

  const picked = source[Math.floor(Math.random() * source.length)];
  usedSet.add(picked.id);
  return picked;
}

function buildMeal(context, targetCal) {
  const soup = pickRandom(context.pools.corba, context.used.corba);
  const main = pickRandom(context.pools.anaYemek, context.used.anaYemek);
  const side = pickRandom(context.pools.yan, context.used.yan);
  const light = pickRandom(context.pools.hafif, context.used.hafif);

  const items = [soup, main, side, light];
  const ids = items.map(item => item?.id || null);
  const portions = [1, 1, 1, 1];

  const totalCal = items.reduce((sum, item) => sum + (item?.calories || 0), 0);
  if (totalCal > targetCal * 1.3 && main) portions[1] = 0.5;
  else if (totalCal < targetCal * 0.6 && main) portions[1] = 1.5;

  return { ids, portions };
}

function persistCurrentWeek() {
  if (!currentWeekId || !currentWeek) return false;
  clearTimeout(saveTimeout);
  saveTimeout = null;
  return Storage.saveWeek(currentWeekId, currentWeek);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toInlineHandlerArg(value) {
  return escapeHtml(JSON.stringify(String(value ?? '')));
}

function sanitizeExcelText(value) {
  const text = String(value ?? '');
  const guarded = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return escapeHtml(guarded);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function formatDate(dateStr) {
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(dateStr || '');
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function showToast(message, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = document.createElement('span');
  icon.textContent = icons[type] || '';
  toast.appendChild(icon);
  toast.appendChild(document.createTextNode(` ${message}`));

  DOM.toastContainer.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 3000);
}
