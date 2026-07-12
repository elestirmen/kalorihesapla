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
let foodMgmtFilter = { query: '', category: 'all', allergenId: '', allergenMode: 'all' };
let editingAllergenFoodId = null;
let saveTimeout = null;

const PORTION_OPTIONS = [0.5, 1, 1.5, 2];
const AUTO_FILL_SLOT_COUNT = 4;
const AUTO_FILL_TEMPLATES = {
  classic_legume: {
    mainPools: ['legumeMains', 'vegetableMains'],
    thirdPools: ['grainSides', 'pastaSides'],
    fourthPools: ['pickleSides', 'dairySides', 'saladSides', 'fruitSides']
  },
  veggie_pasta: {
    mainPools: ['vegetableMains'],
    thirdPools: ['pastaSides', 'grainSides', 'borekSides'],
    fourthPools: ['dairySides', 'saladSides', 'fruitSides', 'dessertSides', 'pickleSides']
  },
  meat_grain: {
    mainPools: ['meatMains'],
    thirdPools: ['grainSides', 'pastaSides', 'borekSides'],
    fourthPools: ['saladSides', 'dairySides', 'fruitSides', 'pickleSides']
  },
  meat_potato: {
    mainPools: ['meatMains'],
    thirdPools: ['potatoSides', 'vegetableSides', 'saladSides', 'grainSides'],
    fourthPools: ['saladSides', 'dairySides', 'drinkSides', 'fruitSides']
  },
  sandwich_plate: {
    mainPools: ['breadMains'],
    thirdPools: ['saladSides', 'vegetableSides', 'potatoSides'],
    fourthPools: ['dairySides', 'drinkSides', 'saladSides'],
    allowThreeSlots: true
  },
  single_plate: {
    mainPools: ['singlePlateMains'],
    thirdPools: ['saladSides', 'dairySides'],
    fourthPools: ['fruitSides', 'dessertSides', 'drinkSides'],
    allowThreeSlots: true
  },
  light_dinner: {
    mainPools: ['vegetableMains', 'legumeMains'],
    thirdPools: ['pastaSides', 'grainSides', 'borekSides'],
    fourthPools: ['dairySides', 'pickleSides', 'saladSides', 'dessertSides', 'fruitSides']
  }
};
const AUTO_FILL_DAY_PATTERNS = {
  Pazartesi: {
    lunch: ['classic_legume', 'veggie_pasta', 'meat_grain'],
    dinner: ['veggie_pasta', 'light_dinner', 'meat_grain']
  },
  Salı: {
    lunch: ['meat_potato', 'meat_grain', 'classic_legume'],
    dinner: ['meat_grain', 'light_dinner', 'veggie_pasta']
  },
  Çarşamba: {
    lunch: ['meat_grain', 'meat_potato', 'single_plate'],
    dinner: ['meat_grain', 'light_dinner', 'meat_potato']
  },
  Perşembe: {
    lunch: ['veggie_pasta', 'meat_potato', 'sandwich_plate'],
    dinner: ['sandwich_plate', 'meat_grain', 'light_dinner']
  },
  Cuma: {
    lunch: ['meat_grain', 'classic_legume', 'meat_potato'],
    dinner: ['light_dinner', 'veggie_pasta', 'meat_grain']
  },
  Cumartesi: {
    lunch: ['meat_potato', 'classic_legume', 'meat_grain'],
    dinner: ['meat_potato', 'sandwich_plate', 'meat_grain']
  },
  default: {
    lunch: ['classic_legume', 'meat_grain', 'veggie_pasta'],
    dinner: ['light_dinner', 'meat_grain', 'veggie_pasta']
  }
};
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
  DOM.plannerControls = document.getElementById('planner-controls');
  DOM.plannerActions = document.getElementById('planner-actions');
  DOM.foodSearch = document.getElementById('food-mgmt-search');
  DOM.foodList = document.getElementById('food-mgmt-list');
  DOM.foodAddForm = document.getElementById('food-add-form');
  DOM.foodCount = document.getElementById('food-total-count');
  DOM.allergenPreferencesGrid = document.getElementById('allergen-preferences-grid');
  DOM.prefPossibleUnsafe = document.getElementById('pref-possible-unsafe');
  DOM.prefMayContainUnsafe = document.getElementById('pref-may-contain-unsafe');
  DOM.prefExcludeUnknown = document.getElementById('pref-exclude-unknown');
  DOM.allergenSettingsSummaryValue = document.getElementById('allergen-settings-summary-value');
  DOM.newFoodAllergenEditor = document.getElementById('new-food-allergen-editor');
  DOM.foodCategoryFilter = document.getElementById('food-category-filter');
  DOM.foodAllergenFilterId = document.getElementById('food-allergen-filter-id');
  DOM.foodAllergenFilterMode = document.getElementById('food-allergen-filter-mode');
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

  renderAllergenPreferences();
  renderFoodAllergenFilterOptions();
  renderNewFoodAllergenEditor();

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
  document.getElementById('btn-clear-week')?.addEventListener('click', clearWeekMeals);
  document.getElementById('btn-print')?.addEventListener('click', () => window.print());
  document.getElementById('btn-export')?.addEventListener('click', exportCurrentWeek);
  document.getElementById('btn-export-excel')?.addEventListener('click', exportExcel);
  document.getElementById('btn-import')?.addEventListener('click', importWeek);

  DOM.foodSearch?.addEventListener('input', event => {
    foodMgmtFilter.query = event.target.value;
    renderFoodList();
  });

  DOM.foodCategoryFilter?.addEventListener('change', event => {
    foodMgmtFilter.category = event.target.value;
    renderFoodList();
  });

  DOM.foodAllergenFilterId?.addEventListener('change', event => {
    foodMgmtFilter.allergenId = event.target.value;
    renderFoodList();
  });
  DOM.foodAllergenFilterMode?.addEventListener('change', event => {
    foodMgmtFilter.allergenMode = event.target.value;
    renderFoodList();
  });

  DOM.allergenPreferencesGrid?.addEventListener('change', event => {
    const allergenId = event.target.dataset.avoidedAllergen;
    if (allergenId) updateAvoidedAllergen(allergenId, event.target.checked);
  });
  DOM.prefPossibleUnsafe?.addEventListener('change', saveAllergenPreferenceOptions);
  DOM.prefMayContainUnsafe?.addEventListener('change', saveAllergenPreferenceOptions);
  DOM.prefExcludeUnknown?.addEventListener('change', saveAllergenPreferenceOptions);
  document.getElementById('btn-reset-allergen-preferences')?.addEventListener('click', resetAllergenPreferences);

  document.getElementById('btn-add-food')?.addEventListener('click', toggleAddFoodForm);

  document.getElementById('food-form-save')?.addEventListener('click', saveNewFood);
  document.getElementById('food-form-cancel')?.addEventListener('click', () => {
    DOM.foodAddForm?.classList.add('hidden');
    renderNewFoodAllergenEditor();
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

  document.addEventListener('change', event => {
    if (event.target.matches('[data-allergen-editor-status]')) {
      delete event.target.dataset.allergenAutoStatus;
      return;
    }
    if (event.target.matches('input[data-allergen-editor-group]')) {
      syncAllergenEditorPriorities(event.target);
    }
  });
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  DOM.tabPlanner?.classList.toggle('hidden', tab !== 'planner');
  DOM.tabFoods?.classList.toggle('hidden', tab !== 'foods');
  DOM.plannerControls?.classList.toggle('hidden', tab !== 'planner');
  DOM.plannerActions?.classList.toggle('hidden', tab !== 'planner');

  if (tab === 'foods') renderFoodList();
  if (tab === 'planner') {
    renderWeek();
    updateStats();
  }
}

function getCurrentAllergenPreferences() {
  return normalizeAllergenPreferences(Storage.getSettings());
}

function renderAllergenPreferences() {
  const preferences = getCurrentAllergenPreferences();
  const avoided = new Set(preferences.avoidedAllergens);

  if (DOM.allergenPreferencesGrid) {
    DOM.allergenPreferencesGrid.innerHTML = Object.entries(ALLERGENS).map(([id, allergen]) => {
      const label = `${allergen.icon} ${allergen.name}`;
      return `<label class="allergen-preference" title="${escapeHtml(label)}">
        <input type="checkbox" data-avoided-allergen="${escapeHtml(id)}" aria-label="${escapeHtml(`${allergen.name} alerjeninden kaçın`)}" ${avoided.has(id) ? 'checked' : ''}>
        <span>${allergen.icon} ${escapeHtml(allergen.name)}</span>
      </label>`;
    }).join('');
  }

  if (DOM.prefPossibleUnsafe) DOM.prefPossibleUnsafe.checked = preferences.treatPossibleContainsAsUnsafe;
  if (DOM.prefMayContainUnsafe) DOM.prefMayContainUnsafe.checked = preferences.treatMayContainAsUnsafe;
  if (DOM.prefExcludeUnknown) DOM.prefExcludeUnknown.checked = preferences.excludeUnknownAllergens;
  if (DOM.allergenSettingsSummaryValue) {
    const selected = formatCompactAllergenNames(preferences.avoidedAllergens, 3);
    DOM.allergenSettingsSummaryValue.textContent = selected || 'Alerjen seçilmedi';
  }
}

function updateAvoidedAllergen(allergenId, shouldAvoid) {
  const preferences = getCurrentAllergenPreferences();
  const avoided = new Set(preferences.avoidedAllergens);
  if (shouldAvoid) avoided.add(allergenId);
  else avoided.delete(allergenId);
  Storage.saveSettings({ avoidedAllergens: normalizeAllergenIds([...avoided]) });
  refreshAllergenDependentViews();
}

function saveAllergenPreferenceOptions() {
  Storage.saveSettings({
    treatPossibleContainsAsUnsafe: DOM.prefPossibleUnsafe?.checked !== false,
    treatMayContainAsUnsafe: DOM.prefMayContainUnsafe?.checked !== false,
    excludeUnknownAllergens: DOM.prefExcludeUnknown?.checked !== false
  });
  refreshAllergenDependentViews();
}

function resetAllergenPreferences() {
  Storage.saveSettings({ ...DEFAULT_ALLERGEN_PREFERENCES });
  renderAllergenPreferences();
  refreshAllergenDependentViews();
  showToast('Alerjen tercihleri sıfırlandı', 'info');
}

function refreshAllergenDependentViews() {
  if (activeTab === 'planner') renderWeek();
  if (activeTab === 'foods') renderFoodList();
}

function renderFoodAllergenFilterOptions() {
  if (!DOM.foodAllergenFilterId) return;
  DOM.foodAllergenFilterId.innerHTML = [
    '<option value="">Alerjen seçin</option>',
    ...Object.entries(ALLERGENS).map(([id, allergen]) => (
      `<option value="${escapeHtml(id)}">${allergen.icon} ${escapeHtml(allergen.name)}</option>`
    ))
  ].join('');
  DOM.foodAllergenFilterId.value = foodMgmtFilter.allergenId;
  if (DOM.foodAllergenFilterMode) DOM.foodAllergenFilterMode.value = foodMgmtFilter.allergenMode;
}

function getFoodAllergenEditorId(foodId) {
  return `allergen-editor-${String(foodId ?? '')}`;
}

function renderAllergenCheckboxGroup(editorId, group, label, selectedIds, modifierClass) {
  const selected = new Set(selectedIds);
  return `<fieldset class="allergen-editor-group ${modifierClass}">
    <legend>${escapeHtml(label)}</legend>
    <div class="allergen-editor-options">
      ${Object.entries(ALLERGENS).map(([allergenId, allergen]) => {
        const inputId = `${editorId}-${group}-${allergenId}`;
        const fullLabel = `${label}: ${allergen.name}`;
        return `<label class="allergen-editor-choice" for="${escapeHtml(inputId)}" title="${escapeHtml(fullLabel)}">
          <input id="${escapeHtml(inputId)}" type="checkbox" data-allergen-editor-group="${group}" data-allergen-id="${allergenId}" aria-label="${escapeHtml(fullLabel)}" ${selected.has(allergenId) ? 'checked' : ''}>
          <span>${allergen.icon} ${escapeHtml(allergen.shortName)}</span>
        </label>`;
      }).join('')}
    </div>
  </fieldset>`;
}

function getAllergenEditorMarkup(editorId, allergenInfo, actionHtml = '') {
  const info = normalizeAllergenInfo(allergenInfo);
  const statusOptions = Object.entries(ALLERGEN_STATUS_LABELS).map(([status, label]) => (
    `<option value="${status}" ${info.status === status ? 'selected' : ''}>${escapeHtml(label)}</option>`
  )).join('');
  const statusId = `${editorId}-status`;
  const noteId = `${editorId}-note`;
  const advancedCount = info.possibleContains.length + info.mayContain.length + (info.note ? 1 : 0);

  return `<div class="allergen-editor-content" data-allergen-editor-id="${escapeHtml(editorId)}">
    <p class="allergen-editor-help">Yemeğin içerdiğini bildiğiniz alerjenleri seçin. Bilgi yoksa boş bırakın.</p>
    <div class="allergen-editor-primary">
      ${renderAllergenCheckboxGroup(editorId, 'contains', 'İçerdiği Alerjenler', info.contains, 'contains')}
    </div>
    <details class="allergen-editor-advanced">
      <summary>Tarif, çapraz temas ve not${advancedCount ? ` (${advancedCount})` : ''}</summary>
      <div class="allergen-editor-groups">
        ${renderAllergenCheckboxGroup(editorId, 'possibleContains', 'Tarife Göre Bulunabilir', info.possibleContains, 'possible')}
        ${renderAllergenCheckboxGroup(editorId, 'mayContain', 'Çapraz Temas Uyarısı', info.mayContain, 'may-contain')}
      </div>
      <div class="allergen-editor-meta">
        <label class="allergen-status" for="${escapeHtml(statusId)}">Bilgi Durumu
          <select id="${escapeHtml(statusId)}" data-allergen-editor-status class="form-input">${statusOptions}</select>
        </label>
        <label class="allergen-note" for="${escapeHtml(noteId)}">Açıklama veya Not
          <textarea id="${escapeHtml(noteId)}" data-allergen-editor-note class="form-input" maxlength="${ALLERGEN_NOTE_MAX_LENGTH}" rows="3">${escapeHtml(info.note)}</textarea>
        </label>
      </div>
    </details>
    ${actionHtml}
  </div>`;
}

function renderNewFoodAllergenEditor() {
  if (!DOM.newFoodAllergenEditor) return;
  DOM.newFoodAllergenEditor.innerHTML = getAllergenEditorMarkup('new-food-allergen-editor', DEFAULT_ALLERGEN_INFO);
}

function getAllergenInfoFromEditor(editorId) {
  const editor = document.getElementById(editorId);
  if (!editor) return normalizeAllergenInfo(DEFAULT_ALLERGEN_INFO);
  const selected = group => [...editor.querySelectorAll(`input[data-allergen-editor-group="${group}"]:checked`)]
    .map(input => input.dataset.allergenId);
  return normalizeAllergenInfo({
    contains: selected('contains'),
    possibleContains: selected('possibleContains'),
    mayContain: selected('mayContain'),
    status: editor.querySelector('[data-allergen-editor-status]')?.value,
    note: editor.querySelector('[data-allergen-editor-note]')?.value
  });
}

function getAllergenEditorInput(editor, group, allergenId) {
  return editor.querySelector(`input[data-allergen-editor-group="${group}"][data-allergen-id="${allergenId}"]`);
}

function syncAllergenEditorPriorities(input) {
  const editor = input.closest('.allergen-editor');
  const group = input.dataset.allergenEditorGroup;
  const allergenId = input.dataset.allergenId;
  if (!editor || !group || !allergenId) return;

  const statusSelect = editor.querySelector('[data-allergen-editor-status]');
  if (!input.checked) {
    const hasSelectedAllergen = editor.querySelector('input[data-allergen-editor-group]:checked');
    if (!hasSelectedAllergen && statusSelect?.dataset.allergenAutoStatus === 'true') {
      statusSelect.value = ALLERGEN_INFO_STATUS.unknown;
      delete statusSelect.dataset.allergenAutoStatus;
    }
    return;
  }

  if (input.checked && statusSelect?.value === ALLERGEN_INFO_STATUS.unknown) {
    statusSelect.value = ALLERGEN_INFO_STATUS.verified;
    statusSelect.dataset.allergenAutoStatus = 'true';
  }

  const uncheck = targetGroup => {
    const target = getAllergenEditorInput(editor, targetGroup, allergenId);
    if (target) target.checked = false;
  };
  const isChecked = targetGroup => Boolean(getAllergenEditorInput(editor, targetGroup, allergenId)?.checked);

  if (group === 'contains') {
    uncheck('possibleContains');
    uncheck('mayContain');
  } else if (group === 'possibleContains') {
    if (isChecked('contains')) input.checked = false;
    else uncheck('mayContain');
  } else if (group === 'mayContain' && (isChecked('contains') || isChecked('possibleContains'))) {
    input.checked = false;
  }
}

function formatCompactAllergenNames(ids, limit = 2) {
  const names = ids.map(id => ALLERGENS[id]?.shortName).filter(Boolean);
  if (names.length <= limit) return names.join(', ');
  return `${names.slice(0, limit).join(', ')} +${names.length - limit}`;
}

function renderFoodAllergenSummary(food) {
  const info = getFoodAllergenInfo(food);
  const detailText = formatAllergenInfo(info);
  const parts = [];
  if (info.contains.length) parts.push(formatCompactAllergenNames(info.contains, 3));
  if (info.possibleContains.length) parts.push(`${formatCompactAllergenNames(info.possibleContains, 2)} olabilir`);
  if (info.mayContain.length) parts.push(`${formatCompactAllergenNames(info.mayContain, 2)} çapraz temas`);

  let text = parts.length ? `Alerjen: ${parts.join(' · ')}` : 'Kayıtlı profilde alerjen belirtilmemiş';
  let className = info.contains.length ? 'has-contains' : info.possibleContains.length ? 'has-possible' : info.mayContain.length ? 'has-may-contain' : '';
  if (!parts.length && info.status === ALLERGEN_INFO_STATUS.unknown) {
    text = '? Alerjen bilgisi girilmemiş';
    className = 'is-unknown';
  }

  return `<div class="food-allergen-summary" title="${escapeHtml(detailText)}" aria-label="${escapeHtml(detailText)}"><span class="allergen-profile-summary ${className}">${escapeHtml(text)}</span></div>`;
}

function renderSearchAllergenSummary(food) {
  const info = getFoodAllergenInfo(food);
  const details = getAllergenConflictDetails(food, getCurrentAllergenPreferences());
  const hasExplicitConflict = details.contains.length > 0 || details.possibleContains.length > 0 || details.mayContain.length > 0;
  const summary = formatAllergenInfo(info, { compact: true, short: true });
  const profileText = summary || 'Kayıtlı profilde AB 14 grubu belirtilmemiş';
  return `<div class="search-allergen-summary">
    <span class="allergen-search-text" title="${escapeHtml(formatAllergenInfo(info))}">${escapeHtml(profileText)}</span>
    ${hasExplicitConflict ? '<span class="allergen-warning allergen-conflict">Tercihle çakışıyor</span>' : ''}
  </div>`;
}

function renderMealSlotAllergenIndicator(food) {
  const info = getFoodAllergenInfo(food);
  const details = getAllergenConflictDetails(food, getCurrentAllergenPreferences());
  const hasExplicitConflict = details.contains.length > 0 || details.possibleContains.length > 0 || details.mayContain.length > 0;
  const detailText = formatAllergenInfo(info);
  const segments = [];
  if (info.contains.length) segments.push(`⚠ ${formatCompactAllergenNames(info.contains, 2)}`);
  if (info.possibleContains.length) segments.push(`~ ${formatCompactAllergenNames(info.possibleContains, 1)} olabilir`);
  if (info.mayContain.length) segments.push(`↔ ${formatCompactAllergenNames(info.mayContain, 1)} çapraz temas`);

  let text = segments.join(' · ');
  let className = info.contains.length ? 'allergen-chip-contains' : info.possibleContains.length ? 'allergen-chip-possible' : 'allergen-chip-may-contain';
  if (hasExplicitConflict) className += ' allergen-conflict';
  if (!text && info.status === ALLERGEN_INFO_STATUS.unknown) {
    text = '? Alerjen bilgisi yok';
    className = 'allergen-badge-unknown';
  }

  if (!text) return '';
  const ariaLabel = hasExplicitConflict ? `Alerjen tercihiyle çakışıyor: ${text}` : text;
  return `<span class="allergen-slot-indicator ${className}" aria-label="${escapeHtml(ariaLabel)}" title="${escapeHtml(detailText)}">${escapeHtml(text)}</span>`;
}

function getManualAllergenWarning(food) {
  const info = getFoodAllergenInfo(food);
  const details = getAllergenConflictDetails(food, getCurrentAllergenPreferences());
  const labelList = ids => ids.map(getAllergenLabel).filter(Boolean).join(', ');
  const sections = [];

  if (details.contains.length) sections.push(`Bu yemek seçtiğiniz alerjenlerden birini içeriyor:\n\n${labelList(details.contains)}`);
  if (details.possibleContains.length) sections.push(`Tarife göre bulunabilir:\n\n${labelList(details.possibleContains)}`);
  if (details.mayContain.length) sections.push(`Çapraz temas uyarısı:\n\n${labelList(details.mayContain)}`);
  if (info.status === ALLERGEN_INFO_STATUS.unknown) {
    sections.push('Bu yemeğin alerjen bilgisi doğrulanmamıştır.\n\nTarifi, kullanılan ürünleri ve çapraz temas riskini kontrol etmeden güvenli kabul etmeyin.');
  }

  return sections.length ? `${sections.join('\n\n')}\n\nYine de eklemek istiyor musunuz?` : '';
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
    const allergenInfo = getFoodAllergenInfo(food);
    const conflictDetails = getAllergenConflictDetails(food, getCurrentAllergenPreferences());
    const conflict = conflictDetails.contains.length > 0 || conflictDetails.possibleContains.length > 0 || conflictDetails.mayContain.length > 0;
    const title = `${food.portion}${portion !== 1 ? ` - ${portionLabel} porsiyon` : ''}\n${formatAllergenInfo(allergenInfo)}`;
    const foodIdArg = toInlineHandlerArg(foodId);

    return `
      <div class="food-slot filled ${conflict ? 'allergen-conflict' : ''}" title="${escapeHtml(title)}">
        <span class="food-cat-dot" style="background:${catColor}"></span>
        <span class="food-slot-name" onclick="openSearch(${dayIndex},${mealTypeArg},${index})">${escapeHtml(food.name)}</span>
        ${renderMealSlotAllergenIndicator(food)}
        <button class="food-slot-portion ${portion === 1 ? 'dim' : ''}" onclick="cyclePortion(${dayIndex},${mealTypeArg},${index})" title="Porsiyon değiştir">${portionLabel}</button>
        <span class="food-slot-cal">${calories} kcal</span>
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
  const conflictDetails = getAllergenConflictDetails(food, getCurrentAllergenPreferences());
  const conflict = conflictDetails.contains.length > 0 || conflictDetails.possibleContains.length > 0 || conflictDetails.mayContain.length > 0;

  return `
    <div class="search-result-item${selected}${conflict ? ' allergen-conflict' : ''}" data-index="${index}" data-food-id="${escapeHtml(food.id)}" onclick="selectFood(${foodIdArg})">
      <button class="search-fav-btn ${isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); toggleSearchFav(${foodIdArg})" title="Favori">${isFavorite ? '★' : '☆'}</button>
      <span class="search-result-dot" style="background:${catColor}"></span>
      <div class="search-result-info">
        <span class="search-result-name">${escapeHtml(food.name)}</span>
        ${renderSearchAllergenSummary(food)}
      </div>
      <span class="search-result-portion">${escapeHtml(food.portion)}</span>
      <span class="search-result-cal">${food.calories} kcal</span>
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

  const warning = getManualAllergenWarning(food);
  if (warning && !confirm(warning)) return;

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
  const exportPreferences = getCurrentAllergenPreferences();
  const allergenSeverityRank = Object.freeze({
    none: 0,
    unknown: 1,
    mayContain: 2,
    possible: 3,
    contains: 4,
    conflict: 5
  });

  function getExportAllergenSeverity(food) {
    if (!food) return 'none';
    const info = getFoodAllergenInfo(food);
    const conflict = getAllergenConflictDetails(food, exportPreferences);
    if (conflict.contains.length || conflict.possibleContains.length || conflict.mayContain.length) return 'conflict';
    if (info.contains.length) return 'contains';
    if (info.possibleContains.length) return 'possible';
    if (info.mayContain.length) return 'mayContain';
    if (info.status === ALLERGEN_INFO_STATUS.unknown) return 'unknown';
    return 'none';
  }

  function getMealAllergenSeverity(items) {
    return items.reduce((highest, item) => {
      const severity = getExportAllergenSeverity(item.food);
      return allergenSeverityRank[severity] > allergenSeverityRank[highest] ? severity : highest;
    }, 'none');
  }

  function formatFoodAllergenWarning(food) {
    if (!food) return '';
    const info = getFoodAllergenInfo(food);
    const conflict = getAllergenConflictDetails(food, exportPreferences);
    const labels = ids => ids.map(getAllergenShortLabel).filter(Boolean).join(', ');
    const conflictIds = normalizeAllergenIds([
      ...conflict.contains,
      ...conflict.possibleContains,
      ...conflict.mayContain
    ]);
    const lines = [];

    if (conflictIds.length) lines.push(`⚠ TERCİHLERLE ÇAKIŞIYOR: ${labels(conflictIds)}`);
    if (info.contains.length) lines.push(`İÇERİR: ${labels(info.contains)}`);
    if (info.possibleContains.length) lines.push(`TARİFE GÖRE BULUNABİLİR: ${labels(info.possibleContains)}`);
    if (info.mayContain.length) lines.push(`ÇAPRAZ TEMAS: ${labels(info.mayContain)}`);
    if (info.status === ALLERGEN_INFO_STATUS.unknown) lines.push('? ALERJEN BİLGİSİ DOĞRULANMAMIŞ');
    if (!lines.length) lines.push('Kayıtlı profilde alerjen belirtilmemiş');
    return lines.join('\n');
  }

  function formatCompactFoodAllergenWarning(food) {
    if (!food) return '';
    const info = getFoodAllergenInfo(food);
    const conflict = getAllergenConflictDetails(food, exportPreferences);
    const labels = ids => ids.map(getAllergenShortLabel).filter(Boolean).join(', ');
    const conflictIds = normalizeAllergenIds([
      ...conflict.contains,
      ...conflict.possibleContains,
      ...conflict.mayContain
    ]);
    const parts = [];

    if (conflictIds.length) parts.push(`[TERCİH ÇAKIŞMASI] ${labels(conflictIds)}`);
    if (info.contains.length) parts.push(`[İÇERİR] ${labels(info.contains)}`);
    if (info.possibleContains.length) parts.push(`[OLABİLİR] ${labels(info.possibleContains)}`);
    if (info.mayContain.length) parts.push(`[ÇAPRAZ TEMAS] ${labels(info.mayContain)}`);
    if (info.status === ALLERGEN_INFO_STATUS.unknown) parts.push('[BİLGİ YOK] Doğrulanmamış');
    return parts.join(' · ');
  }

  function describeExportMealAllergens(items) {
    if (!items.length) return '-';
    const warningItems = items.filter(item => getExportAllergenSeverity(item.food) !== 'none');
    if (!warningItems.length) return 'Kayıtlı profilde alerjen uyarısı bulunmuyor';
    return warningItems.map(item => (
      `${sanitizeExcelText(item.rawName || item.name)}\n${sanitizeExcelText(formatFoodAllergenWarning(item.food))}`
    )).join('\n\n');
  }

  const xlsx = window.XLSX;
  if (xlsx?.utils?.book_new && typeof xlsx.writeFile === 'function') {

    const exportGoal = Storage.getSettings().dailyCalorieGoal || 2000;
    const weekLabel = sanitizeExcelText(currentWeek.label || currentWeekId);
    const exportedAt = new Date().toLocaleString('tr-TR');
    const workbook = xlsx.utils.book_new();
    workbook.Props = {
      Title: 'Haftalik Yemek Menusu',
      Subject: weekLabel,
      Author: 'Kalori Hesapla'
    };

    const palette = {
      inkDark: '332A1D',
      inkSoft: '6F5C48',
      cream: 'FCF6EE',
      creamAlt: 'F6EEE4',
      line: 'DCCDBE',
      accent: 'D97016',
      accentDark: 'B85C0A',
      accentSoft: 'F7E2CE',
      okBg: 'EAF6EC',
      okText: '1F7A39',
      warnBg: 'FFF2DF',
      warnText: 'C46A00',
      overBg: 'FBE8E7',
      overText: 'B3332E',
      allergenDanger: '9F2D28',
      allergenDangerBg: 'FDE8E7',
      allergenPossibleBg: 'FFF0DA',
      allergenMayBg: 'FFF7D6',
      allergenMayText: '755B00',
      allergenUnknownBg: 'ECEFF1',
      allergenUnknownText: '59636B',
      allergenNoneBg: 'F4F6F5',
      teal: '2F7467',
      tealSoft: 'E6F3F0',
      white: 'FFFFFF'
    };

    const baseBorder = {
      top: { style: 'thin', color: { rgb: palette.line } },
      bottom: { style: 'thin', color: { rgb: palette.line } },
      left: { style: 'thin', color: { rgb: palette.line } },
      right: { style: 'thin', color: { rgb: palette.line } }
    };

    const styles = {
      title: {
        font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: palette.white } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.accent } },
        alignment: { horizontal: 'center', vertical: 'center' }
      },
      subtitle: {
        font: { name: 'Calibri', sz: 10, color: { rgb: palette.inkSoft } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.creamAlt } },
        alignment: { horizontal: 'center', vertical: 'center' }
      },
      spacer: {
        fill: { patternType: 'solid', fgColor: { rgb: palette.white } }
      },
      metricLabel: {
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: palette.inkDark } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.accentSoft } },
        alignment: { horizontal: 'left', vertical: 'center' },
        border: baseBorder
      },
      metricValue: {
        font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: palette.accentDark } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.white } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: baseBorder,
        numFmt: '0 "kcal"'
      },
      note: {
        font: { name: 'Calibri', sz: 9, italic: true, color: { rgb: palette.inkSoft } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.creamAlt } },
        alignment: { horizontal: 'left', vertical: 'center' },
        border: baseBorder
      },
      header: {
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: palette.white } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.inkDark } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: baseBorder
      },
      allergenHeader: {
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: palette.white } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.allergenDanger } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: baseBorder
      },
      allergenLegend: {
        font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: palette.allergenMayText } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.allergenMayBg } },
        alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
        border: baseBorder
      },
      dayCell: {
        font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: palette.accentDark } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.accentSoft } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: baseBorder
      },
      dateCell: {
        font: { name: 'Calibri', sz: 10, color: { rgb: palette.inkDark } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.creamAlt } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: baseBorder
      },
      menuText: {
        font: { name: 'Calibri', sz: 10, color: { rgb: palette.inkDark } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.white } },
        alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
        border: baseBorder
      },
      kcal: {
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: palette.accentDark } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.white } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: baseBorder,
        numFmt: '0 "kcal"'
      },
      dayTotal: {
        font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: palette.accentDark } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.cream } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: baseBorder,
        numFmt: '0 "kcal"'
      },
      wallDayTotal: {
        font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: palette.accentDark } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.cream } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: baseBorder
      },
      detailDay: {
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: palette.white } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.accent } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: baseBorder
      },
      detailMeal: {
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: palette.inkDark } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.creamAlt } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: baseBorder
      },
      detailFood: {
        font: { name: 'Calibri', sz: 10, color: { rgb: palette.inkDark } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.white } },
        alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
        border: baseBorder
      },
      allergenConflict: {
        font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: palette.allergenDanger } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.allergenDangerBg } },
        alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
        border: {
          ...baseBorder,
          left: { style: 'medium', color: { rgb: palette.allergenDanger } }
        }
      },
      allergenContains: {
        font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: palette.allergenDanger } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.allergenDangerBg } },
        alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
        border: baseBorder
      },
      allergenPossible: {
        font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: palette.warnText } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.allergenPossibleBg } },
        alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
        border: baseBorder
      },
      allergenMayContain: {
        font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: palette.allergenMayText } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.allergenMayBg } },
        alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
        border: baseBorder
      },
      allergenUnknown: {
        font: { name: 'Calibri', sz: 9, bold: true, color: { rgb: palette.allergenUnknownText } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.allergenUnknownBg } },
        alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
        border: baseBorder
      },
      allergenNone: {
        font: { name: 'Calibri', sz: 9, color: { rgb: palette.inkSoft } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.allergenNoneBg } },
        alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
        border: baseBorder
      },
      allergenSheetTitle: {
        font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: palette.white } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.allergenDanger } },
        alignment: { horizontal: 'center', vertical: 'center' }
      },
      detailTotalLabel: {
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: palette.inkDark } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.cream } },
        alignment: { horizontal: 'right', vertical: 'center' },
        border: baseBorder
      },
      detailTotalValue: {
        font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: palette.accentDark } },
        fill: { patternType: 'solid', fgColor: { rgb: palette.cream } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: baseBorder,
        numFmt: '0 "kcal"'
      }
    };

    function cell(value, style, type) {
      const cellType = type || (typeof value === 'number' ? 'n' : 's');
      return { v: value, t: cellType, s: style };
    }

    function blank(style = styles.spacer) {
      return cell('', style, 's');
    }

    function getAllergenCellStyle(items) {
      const severity = Array.isArray(items) ? getMealAllergenSeverity(items) : getExportAllergenSeverity(items);
      return {
        conflict: styles.allergenConflict,
        contains: styles.allergenContains,
        possible: styles.allergenPossible,
        mayContain: styles.allergenMayContain,
        unknown: styles.allergenUnknown,
        none: styles.allergenNone
      }[severity];
    }

    function formatPortion(portion) {
      const numericPortion = Number(portion || 1);
      return Number.isInteger(numericPortion)
        ? String(numericPortion)
        : String(numericPortion).replace('.', ',');
    }

    function getMealItems(foodIds, portions) {
      return [0, 1, 2, 3]
        .map(index => {
          const foodId = foodIds?.[index];
          const food = foodId ? getFoodById(foodId) : null;
          if (!food) return null;

          const portion = Number(portions?.[index] ?? 1);
          return {
            name: sanitizeExcelText(food.name),
            rawName: food.name,
            calories: Math.round(food.calories * portion),
            portion,
            food,
            allergenInfo: getFoodAllergenInfo(food)
          };
        })
        .filter(Boolean);
    }

    function describeMeal(items) {
      if (!items.length) return '-';
      return items
        .map((item, index) => `${index + 1}. ${item.name}${item.portion !== 1 ? ` (${formatPortion(item.portion)}x)` : ''}`)
        .join('\n');
    }

    function describeWallMeal(items, mealTotal) {
      if (!items.length) return '-';
      const foods = items.map((item, index) => (
        `${index + 1}. ${item.name}${item.portion !== 1 ? ` (${formatPortion(item.portion)}x)` : ''} · ${item.calories} kcal`
      ));
      foods.push(`Öğün toplamı: ${mealTotal} kcal`);
      return foods.join('\n');
    }

    function describeWallMealAllergens(items) {
      const warningItems = items.filter(item => getExportAllergenSeverity(item.food) !== 'none');
      if (!warningItems.length) return 'Kayıtlı profilde uyarı yok';
      return warningItems.map(item => (
        `${item.name}: ${sanitizeExcelText(formatCompactFoodAllergenWarning(item.food))}`
      )).join('\n');
    }

    function describeMealAllergens(items) {
      return describeExportMealAllergens(items);
    }

    const dayExports = currentWeek.days.map((day, dayIndex) => {
      const lunchItems = getMealItems(day.lunch || [], day.lunchPortions || [1, 1, 1, 1]);
      const dinnerItems = getMealItems(day.dinner || [], day.dinnerPortions || [1, 1, 1, 1]);
      const lunchCal = lunchItems.reduce((sum, item) => sum + item.calories, 0);
      const dinnerCal = dinnerItems.reduce((sum, item) => sum + item.calories, 0);
      const dayTotal = lunchCal + dinnerCal;
      const ratio = exportGoal > 0 ? dayTotal / exportGoal : 0;

      return {
        day,
        dayIndex,
        lunchItems,
        dinnerItems,
        lunchCal,
        dinnerCal,
        dayTotal,
        ratio
      };
    });

    const weekTotal = dayExports.reduce((sum, entry) => sum + entry.dayTotal, 0);
    const avgDaily = Math.round(weekTotal / 7);
    const allergenEntries = dayExports.flatMap(entry => [
      ...entry.lunchItems.map(item => ({ ...item, day: entry.day, meal: 'Öğle' })),
      ...entry.dinnerItems.map(item => ({ ...item, day: entry.day, meal: 'Akşam' }))
    ]);
    const unknownAllergenCount = allergenEntries.filter(entry => entry.allergenInfo.status === ALLERGEN_INFO_STATUS.unknown).length;

    const planRows = [
      [
        cell('HAFTALIK MENÜ', styles.title),
        ...Array.from({ length: 5 }, () => blank(styles.title))
      ],
      [
        cell(`${weekLabel} · Oluşturma: ${exportedAt}`, styles.subtitle),
        ...Array.from({ length: 5 }, () => blank(styles.subtitle))
      ],
      [
        cell('Haftalık toplam', styles.metricLabel),
        cell(weekTotal, styles.metricValue),
        cell('Günlük ortalama', styles.metricLabel),
        cell(avgDaily, styles.metricValue),
        cell('Günlük hedef', styles.metricLabel),
        cell(exportGoal, styles.metricValue)
      ],
      [
        cell('ALERJEN: Kırmızı = içerir veya tercih uyarısı · Turuncu = tarife göre bulunabilir · Sarı = çapraz temas · Gri = bilgi doğrulanmamış', styles.allergenLegend),
        ...Array.from({ length: 5 }, () => blank(styles.allergenLegend))
      ]
    ];

    const planHeaderRowIndex = planRows.length;
    planRows.push([
      cell('GÜN / TARİH', styles.header),
      cell('ÖĞLE MENÜSÜ', styles.header),
      cell('Öğle Alerjen Uyarısı', styles.allergenHeader),
      cell('AKŞAM MENÜSÜ', styles.header),
      cell('Akşam Alerjen Uyarısı', styles.allergenHeader),
      cell('GÜNLÜK TOPLAM', styles.header)
    ]);

    const detailRows = [
      [
        cell('YEMEK DETAYLARI', styles.title),
        ...Array.from({ length: 12 }, () => blank(styles.title))
      ],
      [
        cell(`${weekLabel} · Her ogun tek satirda listelenmistir`, styles.subtitle),
        ...Array.from({ length: 12 }, () => blank(styles.subtitle))
      ],
      [
        cell('ALERJEN UYARISI: Kırmızı = içerir veya tercihle çakışır · Turuncu = tarife göre bulunabilir · Sarı = çapraz temas · Gri = bilgi doğrulanmamış. Bu bilgiler ürün etiketi ve profesyonel değerlendirme yerine geçmez.', styles.allergenLegend),
        ...Array.from({ length: 12 }, () => blank(styles.allergenLegend))
      ],
      [
        cell('Gun', styles.header),
        cell('Tarih', styles.header),
        cell('Ogun', styles.header),
        cell('1. Yemek', styles.header),
        cell('kcal', styles.header),
        cell('2. Yemek', styles.header),
        cell('kcal', styles.header),
        cell('3. Yemek', styles.header),
        cell('kcal', styles.header),
        cell('4. Yemek', styles.header),
        cell('kcal', styles.header),
        cell('Ogun toplami', styles.header),
        cell('ALERJEN UYARISI / BİLGİSİ', styles.allergenHeader)
      ]
    ];
    const detailHeaderRowIndex = 3;

    const detailMerges = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 12 } }
    ];

    dayExports.forEach(entry => {
      const altFill = entry.dayIndex % 2 === 0 ? palette.white : palette.creamAlt;
      const planTextStyle = { ...styles.menuText, fill: { patternType: 'solid', fgColor: { rgb: altFill } } };

      planRows.push([
        cell(`${sanitizeExcelText(entry.day.dayName)}\n${formatDate(entry.day.date)}`, styles.dayCell),
        cell(describeWallMeal(entry.lunchItems, entry.lunchCal), planTextStyle),
        cell(describeWallMealAllergens(entry.lunchItems), getAllergenCellStyle(entry.lunchItems)),
        cell(describeWallMeal(entry.dinnerItems, entry.dinnerCal), planTextStyle),
        cell(describeWallMealAllergens(entry.dinnerItems), getAllergenCellStyle(entry.dinnerItems)),
        cell(`${entry.dayTotal} kcal\nHedef: %${Math.round(entry.ratio * 100)}`, styles.wallDayTotal)
      ]);

      const lunchRow = [
        cell(sanitizeExcelText(entry.day.dayName), styles.detailDay),
        cell(formatDate(entry.day.date), styles.dateCell),
        cell('Ogle', styles.detailMeal)
      ];
      const dinnerRow = [
        cell(sanitizeExcelText(entry.day.dayName), styles.detailDay),
        cell(formatDate(entry.day.date), styles.dateCell),
        cell('Aksam', styles.detailMeal)
      ];

      [0, 1, 2, 3].forEach(index => {
        const lunchItem = entry.lunchItems[index];
        lunchRow.push(cell(lunchItem ? `${lunchItem.name}${lunchItem.portion !== 1 ? ` (${formatPortion(lunchItem.portion)}x)` : ''}` : '-', styles.detailFood));
        lunchRow.push(cell(lunchItem ? lunchItem.calories : 0, styles.kcal));

        const dinnerItem = entry.dinnerItems[index];
        dinnerRow.push(cell(dinnerItem ? `${dinnerItem.name}${dinnerItem.portion !== 1 ? ` (${formatPortion(dinnerItem.portion)}x)` : ''}` : '-', styles.detailFood));
        dinnerRow.push(cell(dinnerItem ? dinnerItem.calories : 0, styles.kcal));
      });

      lunchRow.push(cell(entry.lunchCal, styles.detailTotalValue));
      dinnerRow.push(cell(entry.dinnerCal, styles.detailTotalValue));
      lunchRow.push(cell(describeMealAllergens(entry.lunchItems), getAllergenCellStyle(entry.lunchItems)));
      dinnerRow.push(cell(describeMealAllergens(entry.dinnerItems), getAllergenCellStyle(entry.dinnerItems)));

      const totalRowIndex = detailRows.length + 2;
      const dayItems = [...entry.lunchItems, ...entry.dinnerItems];
      const dayWarningCount = dayItems.filter(item => getExportAllergenSeverity(item.food) !== 'none').length;
      detailRows.push(
        lunchRow,
        dinnerRow,
        [
          cell(`${sanitizeExcelText(entry.day.dayName)} toplam`, styles.detailTotalLabel),
          ...Array.from({ length: 10 }, () => blank(styles.detailTotalLabel)),
          cell(entry.dayTotal, styles.dayTotal),
          cell(`${dayWarningCount} uyarılı yemek`, getAllergenCellStyle(dayItems))
        ]
      );
      detailMerges.push({ s: { r: totalRowIndex, c: 0 }, e: { r: totalRowIndex, c: 10 } });
    });

    const planHealthRowIndex = planRows.length;
    planRows.push([
      cell('Alerjen bilgileri genel bilgilendirme amaçlıdır. Ciddi alerjilerde malzeme listesi, ürün etiketi ve çapraz temas riski ayrıca kontrol edilmelidir.', styles.note),
      ...Array.from({ length: 5 }, () => blank(styles.note))
    ]);

    const allergenRows = [
      [
        cell('ALERJEN UYARILARI', styles.allergenSheetTitle),
        ...Array.from({ length: 9 }, () => blank(styles.allergenSheetTitle))
      ],
      [
        cell(`${weekLabel} · Menüdeki ${allergenEntries.length} yemek kaydı · ${unknownAllergenCount} doğrulanmamış profil`, styles.subtitle),
        ...Array.from({ length: 9 }, () => blank(styles.subtitle))
      ],
      [
        cell('Bu liste genel bilgilendirme amaçlıdır. Tarif, ürün etiketi ve çapraz temas koşulları ayrıca kontrol edilmelidir. Boş alerjen alanları güvenlik garantisi değildir.', styles.allergenLegend),
        ...Array.from({ length: 9 }, () => blank(styles.allergenLegend))
      ],
      Array.from({ length: 10 }, () => blank()),
      [
        cell('Gün', styles.header),
        cell('Tarih', styles.header),
        cell('Öğün', styles.header),
        cell('Yemek', styles.header),
        cell('Porsiyon', styles.header),
        cell('İÇERİR', styles.allergenHeader),
        cell('TARİFE GÖRE BULUNABİLİR', styles.allergenHeader),
        cell('ÇAPRAZ TEMAS', styles.allergenHeader),
        cell('BİLGİ DURUMU', styles.allergenHeader),
        cell('TERCİH UYARISI', styles.allergenHeader)
      ]
    ];
    const allergenHeaderRowIndex = 4;

    allergenEntries.forEach(entry => {
      const info = entry.allergenInfo;
      const conflict = getAllergenConflictDetails(entry.food, exportPreferences);
      const conflictIds = normalizeAllergenIds([
        ...conflict.contains,
        ...conflict.possibleContains,
        ...conflict.mayContain
      ]);
      const groupText = ids => ids.length
        ? ids.map(getAllergenLabel).filter(Boolean).join(', ')
        : 'Kayıt yok';
      const emptyGroupStyle = info.status === ALLERGEN_INFO_STATUS.unknown
        ? styles.allergenUnknown
        : styles.allergenNone;
      const preferenceText = conflictIds.length
        ? `⚠ TERCİHLERLE ÇAKIŞIYOR: ${conflictIds.map(getAllergenShortLabel).filter(Boolean).join(', ')}`
        : info.status === ALLERGEN_INFO_STATUS.unknown
          ? '? ALERJEN BİLGİSİ DOĞRULANMAMIŞ'
          : '-';

      allergenRows.push([
        cell(sanitizeExcelText(entry.day.dayName), styles.dayCell),
        cell(formatDate(entry.day.date), styles.dateCell),
        cell(entry.meal, styles.detailMeal),
        cell(entry.name, styles.detailFood),
        cell(`${formatPortion(entry.portion)}x`, styles.detailFood),
        cell(groupText(info.contains), info.contains.length ? styles.allergenContains : emptyGroupStyle),
        cell(groupText(info.possibleContains), info.possibleContains.length ? styles.allergenPossible : emptyGroupStyle),
        cell(groupText(info.mayContain), info.mayContain.length ? styles.allergenMayContain : emptyGroupStyle),
        cell(ALLERGEN_STATUS_LABELS[info.status], getAllergenCellStyle(entry.food)),
        cell(preferenceText, conflictIds.length ? styles.allergenConflict : getAllergenCellStyle(entry.food))
      ]);
    });

    const planSheet = xlsx.utils.aoa_to_sheet(planRows);
    planSheet['!cols'] = [
      { wch: 16 },
      { wch: 38 },
      { wch: 34 },
      { wch: 38 },
      { wch: 34 },
      { wch: 16 }
    ];
    planSheet['!rows'] = planRows.map((row, index) => {
      if (index === 0) return { hpt: 28 };
      if (index === 1) return { hpt: 20 };
      if (index === 2) return { hpt: 26 };
      if (index === 3) return { hpt: 30 };
      if (index === planHeaderRowIndex) return { hpt: 28 };
      if (index === planHealthRowIndex) return { hpt: 30 };
      if (index > planHeaderRowIndex && index < planHealthRowIndex) return { hpt: 70 };
      return { hpt: 20 };
    });
    planSheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 5 } },
      { s: { r: planHealthRowIndex, c: 0 }, e: { r: planHealthRowIndex, c: 5 } }
    ];
    planSheet['!margins'] = {
      left: 0.2,
      right: 0.2,
      top: 0.2,
      bottom: 0.2,
      header: 0.1,
      footer: 0.1
    };

    const detailSheet = xlsx.utils.aoa_to_sheet(detailRows);
    detailSheet['!cols'] = [
      { wch: 12 },
      { wch: 14 },
      { wch: 10 },
      { wch: 24 },
      { wch: 9 },
      { wch: 24 },
      { wch: 9 },
      { wch: 24 },
      { wch: 9 },
      { wch: 24 },
      { wch: 9 },
      { wch: 13 },
      { wch: 56 }
    ];
    detailSheet['!rows'] = detailRows.map((row, index) => {
      if (index === 0) return { hpt: 24 };
      if (index === 1) return { hpt: 20 };
      if (index === 2) return { hpt: 34 };
      if (index === detailHeaderRowIndex) return { hpt: 28 };
      if (row[2]?.v === 'Ogle' || row[2]?.v === 'Aksam') return { hpt: 110 };
      return { hpt: 22 };
    });
    detailSheet['!merges'] = detailMerges;
    detailSheet['!autofilter'] = {
      ref: xlsx.utils.encode_range({ s: { r: detailHeaderRowIndex, c: 0 }, e: { r: detailRows.length - 1, c: 12 } })
    };

    const allergenSheet = xlsx.utils.aoa_to_sheet(allergenRows);
    allergenSheet['!cols'] = [
      { wch: 12 },
      { wch: 14 },
      { wch: 10 },
      { wch: 28 },
      { wch: 10 },
      { wch: 28 },
      { wch: 30 },
      { wch: 26 },
      { wch: 30 },
      { wch: 38 }
    ];
    allergenSheet['!rows'] = allergenRows.map((row, index) => {
      if (index === 0) return { hpt: 26 };
      if (index === 1) return { hpt: 20 };
      if (index === 2) return { hpt: 34 };
      if (index === allergenHeaderRowIndex) return { hpt: 30 };
      if (index > allergenHeaderRowIndex) return { hpt: 42 };
      return { hpt: 20 };
    });
    allergenSheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } }
    ];
    allergenSheet['!autofilter'] = {
      ref: xlsx.utils.encode_range({ s: { r: allergenHeaderRowIndex, c: 0 }, e: { r: allergenRows.length - 1, c: 9 } })
    };

    xlsx.utils.book_append_sheet(workbook, planSheet, 'Plan');
    xlsx.utils.book_append_sheet(workbook, allergenSheet, 'Alerjenler');
    xlsx.utils.book_append_sheet(workbook, detailSheet, 'Detay');
    workbook.Workbook = workbook.Workbook || {};
    workbook.Workbook.Names = [
      ...(workbook.Workbook.Names || []).filter(name => name.Name !== '_xlnm.Print_Area' || name.Sheet !== 0),
      { Name: '_xlnm.Print_Area', Sheet: 0, Ref: `'Plan'!$A$1:$F$${planRows.length}` }
    ];
    xlsx.writeFile(workbook, `menu_${currentWeek.startDate}.xlsx`, { bookType: 'xlsx', compression: true });
    showToast('Excel olarak indirildi', 'success');
    return;
  }
  const goal = Storage.getSettings().dailyCalorieGoal || 2000;
  const BOM = '\uFEFF';

  const styles = {
    title: 'background:#d97016;color:#fff;font-size:16pt;font-weight:bold;font-family:Calibri;text-align:center;padding:12px;',
    subtitle: 'background:#f5f1ea;color:#6b5f50;font-size:10pt;font-family:Calibri;text-align:center;padding:6px;',
    colHead: 'background:#2c2418;color:#faf8f4;font-size:9pt;font-weight:bold;font-family:Calibri;text-align:center;padding:6px 8px;border:1px solid #1a1610;',
    allergenHead: 'background:#9f2d28;color:#fff;font-size:9pt;font-weight:bold;font-family:Calibri;text-align:center;padding:7px 8px;border:1px solid #7e231f;',
    allergenNotice: 'background:#fff7d6;color:#755b00;font-size:9pt;font-weight:bold;font-family:Calibri;text-align:left;padding:8px 10px;border:1px solid #e5cf72;',
    dayCell: 'background:#e8940b;color:#fff;font-size:11pt;font-weight:bold;font-family:Calibri;padding:6px 10px;border:1px solid #c2610a;vertical-align:middle;',
    mealCell: 'font-size:9pt;font-weight:bold;font-family:Calibri;padding:5px 8px;text-align:center;vertical-align:middle;',
    foodCell: 'font-size:10pt;font-family:Calibri;padding:4px 8px;',
    allergenCell: 'font-size:9pt;font-family:Calibri;padding:7px 9px;vertical-align:top;line-height:1.45;',
    allergenConflict: 'background:#fde8e7;color:#9f2d28;font-weight:bold;border-left:4px solid #9f2d28;',
    allergenContains: 'background:#fde8e7;color:#9f2d28;font-weight:bold;',
    allergenPossible: 'background:#fff0da;color:#a85800;font-weight:bold;',
    allergenMayContain: 'background:#fff7d6;color:#755b00;font-weight:bold;',
    allergenUnknown: 'background:#eceff1;color:#59636b;font-weight:bold;',
    allergenNone: 'background:#f4f6f5;color:#6b5f50;',
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
    if (!food) return { name: '', rawName: '', cal: 0, food: null, allergenInfo: null };

    const calories = Math.round(food.calories * portion);
    const portionText = portion !== 1 ? ` (${portion}x)` : '';

    return {
      name: escapeHtml(sanitizeExcelText(food.name + portionText)),
      rawName: food.name + portionText,
      cal: calories,
      food,
      allergenInfo: getFoodAllergenInfo(food)
    };
  }

  function formatAllergenHtml(food) {
    if (!food) return '';
    return escapeHtml(sanitizeExcelText(formatCompactFoodAllergenWarning(food)))
      .replace(/\n/g, '<br>');
  }

  function formatWallMealHtml(items, mealTotal) {
    const withFood = items.filter(item => item.food);
    if (!withFood.length) return '&mdash;';
    const foods = withFood.map((item, index) => (
      `${index + 1}. ${item.name} <span style="color:#b85c0a;font-weight:bold">· ${item.cal} kcal</span>`
    ));
    foods.push(`<strong>Öğün toplamı: ${mealTotal} kcal</strong>`);
    return foods.join('<br>');
  }

  function formatMealAllergenHtml(items) {
    const withFood = items.filter(item => item.food);
    if (!withFood.length) return '&mdash;';
    const warningItems = withFood.filter(item => getExportAllergenSeverity(item.food) !== 'none');
    if (!warningItems.length) return 'Kayıtlı profilde alerjen uyarısı bulunmuyor';
    return warningItems.map(item => `<strong>${item.name}</strong><br>${formatAllergenHtml(item.food)}`).join('<br><br>');
  }

  function getHtmlAllergenCellStyle(items) {
    return {
      conflict: styles.allergenConflict,
      contains: styles.allergenContains,
      possible: styles.allergenPossible,
      mayContain: styles.allergenMayContain,
      unknown: styles.allergenUnknown,
      none: styles.allergenNone
    }[getMealAllergenSeverity(items)];
  }

  const htmlDayExports = currentWeek.days.map((day, dayIndex) => {
    if (!day.lunchPortions) day.lunchPortions = [1, 1, 1, 1];
    if (!day.dinnerPortions) day.dinnerPortions = [1, 1, 1, 1];
    const lunchItems = [0, 1, 2, 3].map(index => foodInfo(day.lunch[index], day.lunchPortions, index));
    const dinnerItems = [0, 1, 2, 3].map(index => foodInfo(day.dinner[index], day.dinnerPortions, index));
    const lunchCal = lunchItems.reduce((sum, item) => sum + item.cal, 0);
    const dinnerCal = dinnerItems.reduce((sum, item) => sum + item.cal, 0);
    const dayTotal = lunchCal + dinnerCal;
    const pct = goal > 0 ? Math.round((dayTotal / goal) * 100) : 0;
    return { day, dayIndex, lunchItems, dinnerItems, lunchCal, dinnerCal, dayTotal, pct };
  });

  const weekTotal = htmlDayExports.reduce((sum, entry) => sum + entry.dayTotal, 0);
  const avgDaily = Math.round(weekTotal / 7);

  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><style>@page { size: A4 landscape; margin: 8mm; } table { border-collapse: collapse; }</style>
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>Haftalık Menü</x:Name>
<x:WorksheetOptions><x:PageSetup><x:Layout x:Orientation="Landscape"/></x:PageSetup><x:DisplayGridlines/><x:FitToPage/><x:Print><x:FitWidth>1</x:FitWidth><x:FitHeight>1</x:FitHeight></x:Print></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
</head><body>
<table border="0" cellpadding="0" cellspacing="0">`;

  html += `<tr><td colspan="6" style="${styles.title}">HAFTALIK MENÜ</td></tr>`;
  html += `<tr><td colspan="6" style="${styles.subtitle}">${escapeHtml(sanitizeExcelText(currentWeek.label || currentWeekId))}</td></tr>`;
  html += `<tr>
    <td style="${styles.summLabel}">HAFTALIK TOPLAM</td><td style="${styles.summVal}">${weekTotal} kcal</td>
    <td style="${styles.summLabel}">GÜNLÜK ORTALAMA</td><td style="${styles.summVal}">${avgDaily} kcal</td>
    <td style="${styles.summLabel}">GÜNLÜK HEDEF</td><td style="${styles.summVal}">${goal} kcal</td>
  </tr>`;
  html += `<tr><td colspan="6" style="${styles.allergenNotice}">ALERJEN: [İÇERİR] kırmızı · [OLABİLİR] turuncu · [ÇAPRAZ TEMAS] sarı · [BİLGİ YOK] gri</td></tr>`;
  html += `<tr>
    <td style="${styles.colHead}" width="110">GÜN / TARİH</td>
    <td style="${styles.colHead}" width="270">ÖĞLE MENÜSÜ</td>
    <td style="${styles.allergenHead}" width="230">ÖĞLE ALERJEN UYARISI / BİLGİSİ</td>
    <td style="${styles.colHead}" width="270">AKŞAM MENÜSÜ</td>
    <td style="${styles.allergenHead}" width="230">AKŞAM ALERJEN UYARISI / BİLGİSİ</td>
    <td style="${styles.colHead}" width="110">GÜNLÜK TOPLAM</td>
  </tr>`;

  htmlDayExports.forEach(entry => {
    const bgRow = rowColor(entry.dayIndex);
    const pctStyle = entry.pct > 100 ? styles.pctOver : entry.pct > 85 ? styles.pctWarn : styles.pctOk;
    html += `<tr>
      <td style="${styles.dayCell}">${escapeHtml(sanitizeExcelText(entry.day.dayName))}<br><span style="font-size:8pt;font-weight:normal">${escapeHtml(sanitizeExcelText(formatDate(entry.day.date)))}</span></td>
      <td style="${styles.foodCell}${bgRow}${styles.border}vertical-align:top;line-height:1.45;">${formatWallMealHtml(entry.lunchItems, entry.lunchCal)}</td>
      <td style="${styles.allergenCell}${styles.border}${getHtmlAllergenCellStyle(entry.lunchItems)}">${formatMealAllergenHtml(entry.lunchItems)}</td>
      <td style="${styles.foodCell}${bgRow}${styles.border}vertical-align:top;line-height:1.45;">${formatWallMealHtml(entry.dinnerItems, entry.dinnerCal)}</td>
      <td style="${styles.allergenCell}${styles.border}${getHtmlAllergenCellStyle(entry.dinnerItems)}">${formatMealAllergenHtml(entry.dinnerItems)}</td>
      <td style="${styles.dayTot}${pctStyle}${styles.border}font-size:11pt;text-align:center;">${entry.dayTotal} kcal<br><span style="font-size:8pt">Hedef: %${entry.pct}</span></td>
    </tr>`;
  });

  html += `<tr><td colspan="6" style="${styles.allergenNotice}">Alerjen bilgileri genel bilgilendirme amaçlıdır. Ciddi alerjilerde malzeme listesi, ürün etiketi ve çapraz temas riski ayrıca kontrol edilmelidir.</td></tr>`;
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
      if (result.importedAllergenOverrides) summary.push(`${result.importedAllergenOverrides} alerjen override`);
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

function matchesFoodAllergenFilter(food) {
  const mode = foodMgmtFilter.allergenMode;
  const allergenId = foodMgmtFilter.allergenId;
  if (!mode || mode === 'all') return true;

  const info = getFoodAllergenInfo(food);
  if (mode === 'unknown') return info.status === ALLERGEN_INFO_STATUS.unknown;
  if (mode === 'conflict') {
    const details = getAllergenConflictDetails(food, getCurrentAllergenPreferences());
    return details.contains.length > 0 || details.possibleContains.length > 0 || details.mayContain.length > 0;
  }
  if (mode === 'profileWithout') {
    if (!allergenId || info.status === ALLERGEN_INFO_STATUS.unknown) return false;
    return ![...info.contains, ...info.possibleContains, ...info.mayContain].includes(allergenId);
  }
  if (!allergenId || !['contains', 'possibleContains', 'mayContain'].includes(mode)) return false;
  return info[mode].includes(allergenId);
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

  filteredFoods = filteredFoods.filter(matchesFoodAllergenFilter);

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
  const allergenOverrides = Storage.getAllergenOverrides();
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
      const isAllergenOverridden = allergenOverrides[food.id] !== undefined && !isCustom;
      const originalCalories = isOverridden ? getOriginalCalories(food.id) : null;
      const isFavorite = Storage.isFavorite(food.id);
      const foodIdArg = toInlineHandlerArg(food.id);
      const editorId = getFoodAllergenEditorId(food.id);
      const isEditingAllergens = editingAllergenFoodId === food.id;
      const editorActions = `<div class="allergen-editor-actions">
        <button class="btn btn-sm btn-primary" type="button" onclick="saveFoodAllergenInfo(${foodIdArg})">Kaydet</button>
        <button class="btn btn-sm" type="button" onclick="toggleAllergenEditor(${foodIdArg})">İptal</button>
        ${isAllergenOverridden ? `<button class="btn btn-sm" type="button" onclick="resetFoodAllergenInfo(${foodIdArg})">Orijinal alerjen profiline dön</button>` : ''}
      </div>`;

      html += `
        <div class="food-mgmt-item">
          <div class="food-mgmt-name-col">
            <span class="food-mgmt-name">${escapeHtml(food.name)}</span>
            ${isCustom ? '<span class="food-mgmt-badge custom">Özel</span>' : ''}
            ${isOverridden ? '<span class="food-mgmt-badge edited">Kalori düzenlendi</span>' : ''}
            ${isAllergenOverridden ? '<span class="food-mgmt-badge allergen-edited">Alerjen düzenlendi</span>' : ''}
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
            <button class="food-mgmt-allergen-edit" type="button" onclick="toggleAllergenEditor(${foodIdArg})" title="Alerjen bilgisini düzenle">Alerjenleri düzenle</button>
            ${isCustom ? `<button class="food-mgmt-del" onclick="deleteFood(${foodIdArg})" title="Sil">&#128465;</button>` : ''}
          </div>
          <div class="food-mgmt-allergen-col">${renderFoodAllergenSummary(food)}</div>
          ${isEditingAllergens ? `<div id="${escapeHtml(editorId)}" class="allergen-editor allergen-editor-inline">${getAllergenEditorMarkup(editorId, getFoodAllergenInfo(food), editorActions)}</div>` : ''}
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

function toggleAllergenEditor(foodId) {
  editingAllergenFoodId = editingAllergenFoodId === foodId ? null : foodId;
  renderFoodList();
}

function saveFoodAllergenInfo(foodId) {
  const food = getFoodById(foodId);
  if (!food) return;
  const editorId = getFoodAllergenEditorId(foodId);
  const allergenInfo = getAllergenInfoFromEditor(editorId);
  const isCustom = food.isCustom || isCustomFood(foodId);
  const saved = isCustom
    ? Storage.updateCustomFood(foodId, { allergenInfo })
    : Storage.setAllergenOverride(foodId, allergenInfo);

  if (!saved) {
    showToast('Alerjen bilgisi kaydedilemedi', 'error');
    return;
  }

  editingAllergenFoodId = null;
  renderFoodList();
  renderWeek();
  showToast('Alerjen bilgisi kaydedildi', 'success');
}

function resetFoodAllergenInfo(foodId) {
  if (!Storage.removeAllergenOverride(foodId)) return;
  editingAllergenFoodId = null;
  renderFoodList();
  renderWeek();
  showToast('Orijinal alerjen profiline dönüldü', 'info');
}

function deleteFood(foodId) {
  if (!confirm('Bu yemeği silmek istediğinize emin misiniz?')) return;

  clearTimeout(saveTimeout);
  if (editingAllergenFoodId === foodId) editingAllergenFoodId = null;
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

  const allergenInfo = getAllergenInfoFromEditor('new-food-allergen-editor');
  Storage.addCustomFood({ name, calories, category: safeCategory, portion, allergenInfo });
  DOM.foodAddForm.classList.add('hidden');

  document.getElementById('new-food-name').value = '';
  document.getElementById('new-food-cal').value = '';
  document.getElementById('new-food-portion').value = '';
  renderNewFoodAllergenEditor();

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
    if (autoFillIsSunday(day)) {
      clearDayMeals(day);
      return;
    }

    const target = day.dayName === 'Cumartesi' ? Math.round(mealGoal * 1.05) : mealGoal;

    const lunch = buildMeal(context, target, 'lunch', day);
    day.lunch = lunch.ids;
    day.lunchPortions = lunch.portions;

    const dinner = buildMeal(context, target, 'dinner', day);
    day.dinner = dinner.ids;
    day.dinnerPortions = dinner.portions;
  });

  autoSave();
  renderWeek();
  updateStats();
  const filledDayCount = currentWeek.days.filter(autoFillHasAnyFood).length || 1;
  showAutoFillResult(context, currentWeek.days, `Hafta örnek menü paternine göre dolduruldu! Günlük ort: ${Math.round(calcWeekCalories() / filledDayCount)} kcal`);
}

function clearWeekMeals() {
  const hasFood = currentWeek.days.some(day => day.lunch.some(Boolean) || day.dinner.some(Boolean));
  if (!hasFood) {
    showToast('Bu haftada temizlenecek yemek yok', 'info');
    return;
  }

  if (!confirm('Bu haftadaki tüm eklenmiş yemekler kaldırılacak. Devam edilsin mi?')) return;

  currentWeek.days.forEach(clearDayMeals);

  autoSave();
  renderWeek();
  updateStats();
  showToast('Haftadaki tüm yemekler temizlendi', 'info');
}

function autoFillDay(dayIndex) {
  const day = currentWeek.days[dayIndex];
  const hasFood = day.lunch.some(Boolean) || day.dinner.some(Boolean);
  if (hasFood && !confirm(`${day.dayName} menüsünün üzerine yazılsın mı?`)) return;

  if (autoFillIsSunday(day)) {
    clearDayMeals(day);
    autoSave();
    renderWeek();
    updateStats();
    showToast('Pazar, örnek menü düzenine göre boş bırakıldı', 'info');
    return;
  }

  const goal = Storage.getSettings().dailyCalorieGoal || 2000;
  const mealGoal = Math.round(goal / 2);
  const context = createAutoFillContext();
  autoFillSeedContext(context, dayIndex);

  const target = day.dayName === 'Cumartesi' ? Math.round(mealGoal * 1.05) : mealGoal;
  const lunch = buildMeal(context, target, 'lunch', day);
  day.lunch = lunch.ids;
  day.lunchPortions = lunch.portions;

  const dinner = buildMeal(context, target, 'dinner', day);
  day.dinner = dinner.ids;
  day.dinnerPortions = dinner.portions;

  autoSave();
  renderWeek();
  updateStats();
  showAutoFillResult(context, [day], `${day.dayName} dolduruldu! (${calcDayCalories(day)} kcal)`);
}

function createAutoFillContext() {
  const allFoods = getAllFoods();
  const preferences = getCurrentAllergenPreferences();
  const eligibleFoods = allFoods.filter(food => isFoodAllowedByAllergenPreferences(food, preferences));
  return {
    preferences,
    excludedFoodCount: allFoods.length - eligibleFoods.length,
    pools: {
      soups: eligibleFoods.filter(autoFillIsSoup),
      meatMains: eligibleFoods.filter(autoFillIsMeatMain),
      vegetableMains: eligibleFoods.filter(autoFillIsVegetableMain),
      legumeMains: eligibleFoods.filter(autoFillIsLegumeMain),
      breadMains: eligibleFoods.filter(autoFillIsBreadMain),
      singlePlateMains: eligibleFoods.filter(autoFillIsSinglePlateMain),
      grainSides: eligibleFoods.filter(autoFillIsGrainSide),
      pastaSides: eligibleFoods.filter(autoFillIsPastaSide),
      borekSides: eligibleFoods.filter(autoFillIsBorekSide),
      potatoSides: eligibleFoods.filter(autoFillIsPotatoSide),
      vegetableSides: eligibleFoods.filter(autoFillIsVegetableSide),
      saladSides: eligibleFoods.filter(autoFillIsSaladSide),
      pickleSides: eligibleFoods.filter(autoFillIsPickleSide),
      dairySides: eligibleFoods.filter(autoFillIsDairySide),
      drinkSides: eligibleFoods.filter(autoFillIsDrinkSide),
      dessertSides: eligibleFoods.filter(autoFillIsDessertSide),
      fruitSides: eligibleFoods.filter(autoFillIsFruitSide)
    },
    used: {
      exact: new Set()
    }
  };
}

function countAutoFillEmptySlots(days) {
  return days
    .filter(day => !autoFillIsSunday(day))
    .reduce((total, day) => total + day.lunch.filter(id => !id).length + day.dinner.filter(id => !id).length, 0);
}

function showAutoFillResult(context, days, successMessage) {
  const emptySlots = countAutoFillEmptySlots(days);
  if (context.excludedFoodCount > 0 && emptySlots > 0) {
    showToast(`Seçtiğiniz alerjen kısıtlamalarına uygun yeterli yemek bulunamadı. Bazı öğünler boş bırakıldı. (${emptySlots} slot)`, 'warning');
    return;
  }
  showToast(successMessage, 'success');
}

function autoFillSeedContext(context, skipDayIndex) {
  currentWeek.days.forEach((day, index) => {
    if (index === skipDayIndex) return;
    [...day.lunch, ...day.dinner].filter(Boolean).forEach(foodId => {
      context.used.exact.add(foodId);
    });
  });
}

function autoFillHasAnyFood(day) {
  return day.lunch.some(Boolean) || day.dinner.some(Boolean);
}

function autoFillIsSunday(day) {
  return day?.dayName === 'Pazar';
}

function autoFillFoodText(food) {
  return normalizeTurkish(String(food?.name || '').toLowerCase());
}

function autoFillFoodHasKeywords(food, keywords) {
  const text = autoFillFoodText(food);
  return keywords.some(keyword => text.includes(normalizeTurkish(String(keyword).toLowerCase())));
}

function autoFillIsSoup(food) {
  return food.category === 'corba';
}

function autoFillIsSideLikeMain(food) {
  return ['patates_puresi', 'elma_dilim_patates', 'piyaz', 'firinda_sebzeler', 'alman_usulu_patates'].includes(food.id);
}

function autoFillIsBreadMain(food) {
  return (food.category === 'ana_et' || food.category === 'ana_sebze')
    && autoFillFoodHasKeywords(food, ['ekmek arasi', 'döner', 'doner', 'tantuni']);
}

function autoFillIsSinglePlateMain(food) {
  return autoFillFoodHasKeywords(food, ['mantı', 'manti']);
}

function autoFillIsLegumeMain(food) {
  return food.category === 'ana_sebze'
    && !autoFillIsSideLikeMain(food)
    && autoFillFoodHasKeywords(food, ['fasulye', 'nohut', 'mercimek', 'barbunya']);
}

function autoFillIsVegetableMain(food) {
  return food.category === 'ana_sebze'
    && !autoFillIsSideLikeMain(food)
    && !autoFillIsLegumeMain(food)
    && !autoFillIsBreadMain(food);
}

function autoFillIsMeatMain(food) {
  return food.category === 'ana_et'
    && !autoFillIsBreadMain(food)
    && !autoFillIsSinglePlateMain(food)
    && !autoFillIsSideLikeMain(food);
}

function autoFillIsGrainSide(food) {
  return food.category === 'pilav';
}

function autoFillIsPastaSide(food) {
  return food.category === 'makarna';
}

function autoFillIsBorekSide(food) {
  return food.category === 'borek';
}

function autoFillIsPotatoSide(food) {
  return ['patates_puresi', 'elma_dilim_patates', 'alman_usulu_patates'].includes(food.id);
}

function autoFillIsVegetableSide(food) {
  return ['firinda_sebzeler', 'piyaz'].includes(food.id);
}

function autoFillIsSaladSide(food) {
  return food.category === 'salata' || ['piyaz', 'alman_usulu_patates'].includes(food.id);
}

function autoFillIsPickleSide(food) {
  return food.id === 'tursu' || autoFillFoodHasKeywords(food, ['turşu', 'tursu']);
}

function autoFillIsDairySide(food) {
  return food.id === 'ayran' || food.id === 'yogurt' || food.id === 'cacik';
}

function autoFillIsDrinkSide(food) {
  return food.category === 'icecek' && !autoFillIsDairySide(food);
}

function autoFillIsDessertSide(food) {
  return food.category === 'tatli';
}

function autoFillIsFruitSide(food) {
  return food.category === 'meyve';
}

function autoFillIsFreshSide(food) {
  return autoFillIsSaladSide(food)
    || autoFillIsPickleSide(food)
    || autoFillIsFruitSide(food)
    || autoFillIsDairySide(food)
    || autoFillIsDrinkSide(food);
}

function autoFillHasDairyFlavor(food) {
  return autoFillIsDairySide(food) || autoFillFoodHasKeywords(food, ['yoğurt', 'yogurt', 'peynir', 'kremalı', 'kremali']);
}

function autoFillUniqueFoods(foods) {
  return [...new Map(foods.map(food => [food.id, food])).values()];
}

function autoFillPoolHasCandidate(context, poolNames, unusedOnly = false) {
  const foods = autoFillUniqueFoods(poolNames.flatMap(poolName => context.pools[poolName] || []));
  if (!unusedOnly) return foods.length > 0;
  return foods.some(food => !context.used.exact.has(food.id));
}

function autoFillPatternIds(dayName, mealType) {
  const dayPattern = AUTO_FILL_DAY_PATTERNS[dayName] || AUTO_FILL_DAY_PATTERNS.default;
  return [...new Set([...(dayPattern[mealType] || []), ...AUTO_FILL_DAY_PATTERNS.default[mealType]])];
}

function autoFillPickTemplate(context, dayName, mealType) {
  const preferred = autoFillPatternIds(dayName, mealType);
  const withUnused = preferred.filter(templateId => autoFillPoolHasCandidate(context, AUTO_FILL_TEMPLATES[templateId].mainPools, true));
  const withAny = preferred.filter(templateId => autoFillPoolHasCandidate(context, AUTO_FILL_TEMPLATES[templateId].mainPools));
  const source = withUnused.length > 0 ? withUnused : withAny;

  if (source.length <= 1) return source[0] || preferred[0];
  return Math.random() < 0.84 ? source[0] : source[1];
}

function autoFillScoreCandidate(food, targetRemaining, options = {}) {
  const desired = Math.max(targetRemaining || food.calories, 40);
  let score = Math.abs(desired - food.calories);

  if (options.preferLowCal) score += food.calories * 0.25;
  if (options.preferHighCal && food.calories < desired * 0.55) score += 80;
  if (options.preferFresh) score += autoFillIsFreshSide(food) ? -55 : 25;
  if (options.preferDairy) score += autoFillIsDairySide(food) ? -45 : 10;
  if (options.avoidDairy && autoFillHasDairyFlavor(food)) score += 80;
  if (options.avoidDessert && autoFillIsDessertSide(food)) score += 90;
  if (desired < 140 && food.calories > 220) score += 90;

  return score + (Math.random() * 18);
}

function autoFillPickFood(context, poolNames, blockedIds, targetRemaining, options = {}) {
  let source = [];

  poolNames.forEach(poolName => {
    if (source.length > 0) return;
    const candidates = autoFillUniqueFoods(context.pools[poolName] || [])
      .filter(food => !blockedIds.has(food.id));
    const unused = candidates.filter(food => !context.used.exact.has(food.id));
    if (unused.length > 0) source = unused;
  });

  if (source.length === 0) {
    for (const poolName of poolNames) {
      const candidates = autoFillUniqueFoods(context.pools[poolName] || [])
        .filter(food => !blockedIds.has(food.id));
      if (candidates.length > 0) {
        source = candidates;
        break;
      }
    }
  }

  if (source.length === 0) return null;

  const picked = source
    .map(food => ({ food, score: autoFillScoreCandidate(food, targetRemaining, options) }))
    .sort((a, b) => a.score - b.score)[0]?.food || null;

  if (picked) context.used.exact.add(picked.id);
  return picked;
}

function autoFillMealCalories(items) {
  return items.reduce((sum, item) => sum + (item?.calories || 0), 0);
}

function buildMeal(context, targetCal, mealType, day) {
  if (autoFillIsSunday(day)) {
    return {
      ids: Array(AUTO_FILL_SLOT_COUNT).fill(null),
      portions: Array(AUTO_FILL_SLOT_COUNT).fill(1)
    };
  }

  const templateId = autoFillPickTemplate(context, day.dayName, mealType);
  const template = AUTO_FILL_TEMPLATES[templateId] || AUTO_FILL_TEMPLATES.classic_legume;
  const mealItems = [];
  const blockedIds = new Set();

  const soup = autoFillPickFood(context, ['soups'], blockedIds, Math.min(targetCal * 0.22, 160), { preferLowCal: true });
  if (soup) {
    mealItems.push(soup);
    blockedIds.add(soup.id);
  }

  const mainTarget = Math.max(targetCal - autoFillMealCalories(mealItems) - 180, 220);
  const main = autoFillPickFood(context, template.mainPools, blockedIds, mainTarget, { preferHighCal: true });
  if (main) {
    mealItems.push(main);
    blockedIds.add(main.id);
  }

  const thirdTarget = Math.max(targetCal - autoFillMealCalories(mealItems) - 110, 70);
  const third = autoFillPickFood(context, template.thirdPools, blockedIds, thirdTarget, {
    preferFresh: templateId === 'sandwich_plate',
    preferLowCal: templateId === 'single_plate'
  });
  if (third) {
    mealItems.push(third);
    blockedIds.add(third.id);
  }

  const remainingForFourth = targetCal - autoFillMealCalories(mealItems);
  const shouldSkipFourth = template.allowThreeSlots && mealItems.length >= 3 && remainingForFourth < 140;
  const mealAlreadyHasDairy = mealItems.some(autoFillHasDairyFlavor);
  const fourthPools = mealAlreadyHasDairy && templateId !== 'sandwich_plate'
    ? [...template.fourthPools.filter(poolName => poolName !== 'dairySides'), 'dairySides']
    : template.fourthPools;
  const fourth = shouldSkipFourth
    ? null
    : autoFillPickFood(context, fourthPools, blockedIds, Math.max(remainingForFourth, 50), {
        preferFresh: mealType === 'dinner' || templateId === 'sandwich_plate' || templateId === 'meat_potato',
        preferDairy: templateId === 'sandwich_plate',
        avoidDairy: mealAlreadyHasDairy && templateId !== 'sandwich_plate',
        preferLowCal: remainingForFourth < 160,
        avoidDessert: mealType === 'lunch' && remainingForFourth < 180
      });
  if (fourth) mealItems.push(fourth);

  const ids = Array(AUTO_FILL_SLOT_COUNT).fill(null);
  const portions = Array(AUTO_FILL_SLOT_COUNT).fill(1);
  mealItems.slice(0, AUTO_FILL_SLOT_COUNT).forEach((item, index) => {
    ids[index] = item.id;
  });

  const totalCal = autoFillMealCalories(mealItems);
  if (main) {
    if (totalCal > targetCal * 1.18 && main.calories >= 320 && !autoFillIsBreadMain(main) && !autoFillIsSinglePlateMain(main)) {
      portions[1] = 0.5;
    } else if (totalCal < targetCal * 0.72 && main.calories < 380 && !autoFillIsBreadMain(main)) {
      portions[1] = 1.5;
    }
  }

  return { ids, portions };
}

function clearDayMeals(day) {
  day.lunch = Array(AUTO_FILL_SLOT_COUNT).fill(null);
  day.dinner = Array(AUTO_FILL_SLOT_COUNT).fill(null);
  day.lunchPortions = Array(AUTO_FILL_SLOT_COUNT).fill(1);
  day.dinnerPortions = Array(AUTO_FILL_SLOT_COUNT).fill(1);
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
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ');
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
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
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
