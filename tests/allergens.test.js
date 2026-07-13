(function () {
  const ORIGINAL_BASE_FOOD_IDS = `tarhana_corbasi,mercimek_corbasi,suzme_mercimek_corbasi,ezogelin_corbasi,toyga_corbasi,lebeniye_corbasi,yayla_corbasi,mantar_corbasi_kremali,mantar_corbasi,domates_corbasi,brokoli_corbasi,kremali_sebze_corbasi,sebze_corbasi,havuclu_kremali_corba,tavuk_suyu_corbasi,tavuk_corbasi,sehriyeli_tavuk_corbasi,tel_sehriye_corbasi,sehriye_corbasi,mahluta_corbasi,iskembe_corbasi,tutmac_corbasi,dugun_corbasi,firinda_sebzeli_tavuk_sarma,firinda_sebzeli_tavuk,baharatli_tavuk_sis,tavuk_tantuni,tavuklu_bezelye,tavuk_doner,izgara_tavuk_kanat,tavuk_but,tavuklu_saray_sarma,tavuk_sote,tavuk_kagit_kebabi,tavuk_kulbasti_begendi,tavuk_sinitzel,tavuk_fajita,firin_tavuk_baget,ekmek_arasi_tantuni,inegol_kofte,kadinbudu_kofte,hasanpasa_kofte,ciftlik_kebabi,sebzeli_kebap,tas_kebabi,orman_kebabi,sac_tava,belen_tava,hunkar_begendi,etli_mevsim_turlusu,et_sote,kofte_izgara,kiymali_patates_oturtma,kiymali_yesil_mercimek,kiymali_kopoglu,kiymali_bezelye,kiymali_semizotu,mantu,ispanakli_cilbir,firinda_kofte,guvec,kuzu_tandir,coban_kavurma,alman_usulu_patates,kuru_fasulye,patlican_musakka,barbunya_pilaki,zeytinyagli_barbunya,yesil_mercimek_yemegi,zeytinyagli_pirasa,ispanak_graten,zeytinyagli_ispanak,zeytinyagli_kabak,zeytinyagli_taze_fasulye,zeytinyagli_karisik_kizartma,karnabahar_graten,firinda_sebzeler,sebze_turlu,imam_bayildi,biber_dolmasi,kabak_dolmasi,yaprak_sarmasi,nohut_yemegi,etli_nohut,sebzeli_patates_oturtma,patates_puresi,elma_dilim_patates,piyaz,zeytinyagli_enginar,zeytinyagli_kereviz,pirinc_pilavi,sade_pirinc_pilavi,sebzeli_pirinc_pilavi,bulgur_pilavi,siyez_bulgur_pilavi,sehriyeli_siyez_bulgur,sebzeli_bulgur_pilavi,firik_pilavi,domatesli_sebzeli_pilav,meyhane_pilavi,havuclu_arpa_sehriye,sehriyeli_pirinc_pilavi,ic_pilav,nohutlu_pilav,sebzeli_siyez_bulgur_pilavi,domates_soslu_penne,makarna_sade,peynirli_tam_bugday_makarna,domates_soslu_spagetti,yogurtlu_makarna,cevizli_eriste,sebzeli_eriste,peynirli_eriste,domatesli_makarna,firin_makarna,peynirli_borek,ispanakli_borek,su_boregi,kiymali_borek,patatesli_borek,sigara_boregi,gozleme,mevsim_salatasi,mevsim_salatasi_yogurt,akdeniz_salatasi,gavurdagi_salatasi,meksika_fasulye_salata,sumakli_sogan_salatasi,coleslaw_salatasi,cacik,coban_salatasi,sogus_salatasi,yesil_salata,kis_patates_salatasi,pancar_tursusu,karisik_tursu,yesillik,ayran,yogurt,az_sekerli_komposto,salgam,limonata,su,sutlac,baklava,kazandibi,keskul,supangle,kek,dondurma,revani,trilece,profiterol,muhallebi,elma,muz,portakal,uzum,cilek,karpuz,kavun,seftali,roll_ekmek_beyaz,roll_ekmek_tam_bugday,ekmek,tursu`.split(',');
  const ADDED_BASE_FOOD_IDS = `kozlenmis_domates_corbasi,misirli_kremali_sebze_corbasi,zencefilli_havuclu_kremali_corba,tatli_eksi_soslu_tavuk,ekmek_arasi_kofte,izmir_kofte,kiymali_kapuska,firinlanmis_ispanak_graten,baharatli_elma_dilim_patates,patates_piyazi,zerdecalli_misirli_pirinc_pilavi,domatesli_sehriye_pilavi,sehriyeli_bulgur_pilavi,sebzeli_meyhane_pilavi,sebzeli_kuskus_pilavi,mevsim_salatasi_yagli,salatalik_tursusu`.split(',');

  const results = [];
  const output = document.getElementById('test-results');
  const summary = document.getElementById('test-summary');

  function assert(condition, message) {
    if (!condition) throw new Error(message || 'Beklenen koşul sağlanmadı.');
  }

  function clearAppStorage() {
    window.__allergenTestKeys.forEach(key => localStorage.removeItem(key));
  }

  function restoreAppStorage() {
    window.__allergenTestKeys.forEach(key => {
      const value = window.__allergenTestSnapshot[key];
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    });
  }

  async function test(name, run) {
    try {
      await run();
      results.push({ name, pass: true });
    } catch (error) {
      results.push({ name, pass: false, error: error.message || String(error) });
    }
  }

  function renderResults() {
    const passed = results.filter(result => result.pass).length;
    const failed = results.length - passed;
    summary.textContent = `${passed}/${results.length} test geçti${failed ? `, ${failed} test başarısız` : ''}.`;
    output.innerHTML = results.map(result => (
      `<div class="test-result ${result.pass ? 'pass' : 'fail'}"><strong>${result.pass ? 'GEÇTİ' : 'HATA'}</strong> - ${escapeHtml(result.name)}${result.error ? `<br><span>${escapeHtml(result.error)}</span>` : ''}</div>`
    )).join('');
  }

  function makeEmptyPools() {
    return Object.keys(createAutoFillContext().pools).reduce((pools, key) => {
      pools[key] = [];
      return pools;
    }, {});
  }

  async function runTests() {
    clearAppStorage();
    try {
      await test('Geçersiz alerjen kimlikleri temizlenir', () => {
        const info = normalizeAllergenInfo({ contains: ['milk', 'invalid'] });
        assert(info.contains.length === 1 && info.contains[0] === 'milk');
      });

      await test('Yinelenen alerjen kimlikleri kaldırılır', () => {
        const info = normalizeAllergenInfo({ contains: ['milk', 'milk', 'egg'] });
        assert(info.contains.join(',') === 'milk,egg');
      });

      await test('contains alanı diğer alanlara göre önceliklidir', () => {
        const info = normalizeAllergenInfo({ contains: ['milk'], possibleContains: ['milk'], mayContain: ['milk'] });
        assert(info.contains.includes('milk') && !info.possibleContains.includes('milk') && !info.mayContain.includes('milk'));
      });

      await test('possibleContains alanı mayContain alanına göre önceliklidir', () => {
        const info = normalizeAllergenInfo({ possibleContains: ['egg'], mayContain: ['egg'] });
        assert(info.possibleContains.includes('egg') && !info.mayContain.includes('egg'));
      });

      await test('Eksik profil unknown olarak normalize edilir', () => {
        const info = normalizeAllergenInfo();
        assert(info.status === 'unknown' && info.contains.length === 0 && info.possibleContains.length === 0);
      });

      await test('Eski özel yemekler kaybolmadan unknown profil alır', () => {
        const food = normalizeCustomFood({ id: 'custom_old', name: 'Eski Yemek', category: 'diger', calories: 120 });
        assert(food && food.allergenInfo.status === 'unknown');
      });

      await test('Eski ayarlar güvenli alerjen varsayılanlarıyla birleşir', () => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ dailyCalorieGoal: 2300 }));
        const settings = Storage.getSettings();
        assert(settings.dailyCalorieGoal === 2300 && settings.excludeUnknownAllergens === true && settings.treatMayContainAsUnsafe === true);
      });

      await test('Yerleşik yemek alerjen override kaydı çalışır', () => {
        assert(Storage.setAllergenOverride('mantu', { contains: ['egg'], status: 'verified', note: 'Test' }));
        const info = getFoodAllergenInfo(getFoodById('mantu'));
        assert(info.contains.join(',') === 'egg' && info.status === 'verified');
      });

      await test('Yerleşik yemek override sıfırlaması çalışır', () => {
        assert(Storage.removeAllergenOverride('mantu'));
        const info = getFoodAllergenInfo(getFoodById('mantu'));
        assert(info.contains.includes('milk') && info.contains.includes('gluten_cereals'));
      });

      await test('Özel yemek alerjen bilgisi saklamada korunur', () => {
        const created = Storage.addCustomFood({ name: 'Test Özel', calories: 100, category: 'diger', allergenInfo: { contains: ['sesame'], status: 'verified', note: 'Etiket' } });
        const stored = Storage.getCustomFoods().find(food => food.id === created.id);
        assert(stored?.allergenInfo.contains.includes('sesame') && stored.allergenInfo.note === 'Etiket');
      });

      await test('Kullanıcı alerjen tercihleri localStorage içinde korunur', () => {
        Storage.saveSettings({ avoidedAllergens: ['milk', 'invalid'], treatPossibleContainsAsUnsafe: false });
        const settings = Storage.getSettings();
        assert(settings.avoidedAllergens.join(',') === 'milk' && settings.treatPossibleContainsAsUnsafe === false);
      });

      await test('Otomatik filtre kaçınılan contains alerjenlerini dışlar', () => {
        const preferences = { ...DEFAULT_ALLERGEN_PREFERENCES, avoidedAllergens: ['milk'] };
        assert(!isFoodAllowedByAllergenPreferences(getFoodById('mantu'), preferences));
      });

      await test('possibleContains tercihe göre dikkate alınır', () => {
        const food = getFoodById('bulgur_pilavi');
        assert(!isFoodAllowedByAllergenPreferences(food, { ...DEFAULT_ALLERGEN_PREFERENCES, avoidedAllergens: ['milk'] }));
        assert(isFoodAllowedByAllergenPreferences(food, { ...DEFAULT_ALLERGEN_PREFERENCES, avoidedAllergens: ['milk'], treatPossibleContainsAsUnsafe: false }));
      });

      await test('mayContain tercihe göre dikkate alınır', () => {
        const food = { id: 'custom_may', isCustom: true, allergenInfo: { mayContain: ['sesame'], status: 'verified', note: 'Etiket' } };
        assert(!isFoodAllowedByAllergenPreferences(food, { ...DEFAULT_ALLERGEN_PREFERENCES, avoidedAllergens: ['sesame'] }));
        assert(isFoodAllowedByAllergenPreferences(food, { ...DEFAULT_ALLERGEN_PREFERENCES, avoidedAllergens: ['sesame'], treatMayContainAsUnsafe: false }));
      });

      await test('Bilinmeyen kayıtlar varsayılan olarak otomatik havuza alınmaz', () => {
        const unknown = getFoodById('su');
        assert(unknown.allergenInfo.status === 'unknown');
        assert(!isFoodAllowedByAllergenPreferences(unknown, DEFAULT_ALLERGEN_PREFERENCES));
      });

      await test('Uygun aday yoksa otomatik öğün slotları boş kalır', () => {
        const context = { pools: makeEmptyPools(), used: { exact: new Set() } };
        const meal = buildMeal(context, 900, 'lunch', { dayName: 'Pazartesi' });
        assert(meal.ids.every(id => id === null));
      });

      await test('Manuel riskli seçim için uyarı metni üretilir', () => {
        Storage.saveSettings({ avoidedAllergens: ['milk'] });
        assert(getManualAllergenWarning(getFoodById('mantu')).includes('içeriyor'));
      });

      await test('Manuel bilinmeyen seçim için uyarı metni üretilir', () => {
        assert(getManualAllergenWarning(getFoodById('su')).includes('doğrulanmamıştır'));
      });

      await test('Menü uyarısında alerjen adları görünür', () => {
        const indicator = renderMealSlotAllergenIndicator(getFoodById('mantu'));
        assert(indicator.includes('Gluten') && indicator.includes('[gluten_cereals]'));
        assert(indicator.includes('Süt') && indicator.includes('[milk]'));
        assert(indicator.includes('Yumurta') && indicator.includes('[egg]'));
      });

      await test('Yemek yönetiminde planlama kontrolleri gizlenir', () => {
        switchTab('foods');
        assert(document.getElementById('planner-controls').classList.contains('hidden'));
        assert(document.getElementById('planner-actions').classList.contains('hidden'));
        switchTab('planner');
      });

      await test('Yardım menüsü açılıp kapanır', () => {
        openHelp();
        const overlay = document.getElementById('help-overlay');
        assert(overlay.classList.contains('active') && overlay.getAttribute('aria-hidden') === 'false');
        closeHelp();
        assert(!overlay.classList.contains('active') && overlay.getAttribute('aria-hidden') === 'true');
      });

      await test('JSON sürüm 2 içe aktarılabilir', () => {
        const week = Storage.createEmptyWeek(new Date('2026-01-05T12:00:00'));
        const result = Storage.importWeek(JSON.stringify({ version: 2, weekId: '2026-W02', week, dependencies: { customFoods: [], calorieOverrides: {} } }));
        assert(result.success && result.weekId === '2026-W02');
      });

      await test('JSON sürüm 3 özel yemek alerjen bilgisini korur', () => {
        const week = Storage.createEmptyWeek(new Date('2026-01-12T12:00:00'));
        const customFood = { id: 'custom_json_v3', name: 'JSON Özel', category: 'diger', calories: 100, portion: '1 porsiyon', allergenInfo: { contains: ['peanut'], status: 'verified', note: 'Etiket' } };
        week.days[0].lunch[0] = customFood.id;
        const result = Storage.importWeek(JSON.stringify({ version: 3, weekId: '2026-W03', week, dependencies: { customFoods: [customFood], calorieOverrides: {}, allergenOverrides: {} } }));
        const stored = Storage.getCustomFoods().find(food => food.id === customFood.id);
        assert(result.success && stored?.allergenInfo.contains.includes('peanut'));
      });

      await test('JSON sürüm 3 yerleşik alerjen override bilgisini korur', () => {
        const week = Storage.createEmptyWeek(new Date('2026-01-19T12:00:00'));
        week.days[0].lunch[0] = 'mantu';
        const result = Storage.importWeek(JSON.stringify({ version: 3, weekId: '2026-W04', week, dependencies: { customFoods: [], calorieOverrides: {}, allergenOverrides: { mantu: { contains: ['egg'], status: 'verified', note: 'İçe aktarıldı' } } } }));
        assert(result.success && Storage.getAllergenOverrides().mantu.contains.includes('egg'));
      });

      await test('Tam JSON yedeği başka tarayıcıya bütün verileri taşır', () => {
        const testWeek = Storage.createEmptyWeek(new Date('2026-02-02T12:00:00'));
        const customFood = Storage.addCustomFood({
          name: 'Taşınan Yemek',
          category: 'diger',
          calories: 321,
          portion: '1 porsiyon',
          allergenInfo: { contains: ['sesame'], status: 'verified', note: 'Yedek testi' }
        });
        testWeek.days[0].lunch[0] = customFood.id;
        Storage.saveWeek('2026-W06', testWeek);
        Storage.setCalorieOverride('mantu', 555);
        Storage.setAllergenOverride('mantu', { contains: ['egg'], status: 'verified', note: 'Yedek testi' });
        Storage.toggleFavorite('mantu');
        Storage.saveSettings({ lastWeekId: '2026-W06', dailyCalorieGoal: 2450, avoidedAllergens: ['milk'] });

        const backup = Storage.exportBackup();
        clearAppStorage();
        const result = Storage.importBackup(backup);
        const restoredCustomFood = Storage.getCustomFoods().find(food => food.id === customFood.id);

        assert(result.success && result.importedWeeks > 0);
        assert(Storage.getWeek('2026-W06')?.days[0].lunch[0] === customFood.id);
        assert(restoredCustomFood?.calories === 321 && restoredCustomFood.allergenInfo.contains.includes('sesame'));
        assert(Storage.getCalorieOverrides().mantu === 555);
        assert(Storage.getAllergenOverrides().mantu.contains.includes('egg'));
        assert(Storage.isFavorite('mantu'));
        assert(Storage.getSettings().dailyCalorieGoal === 2450 && Storage.getSettings().avoidedAllergens.includes('milk'));
        Storage.removeCalorieOverride('mantu');
        Storage.removeAllergenOverride('mantu');
        Storage.removeFavorite('mantu');
      });

      await test('Menü değişikliği yenileme beklenmeden localStorage içine yazılır', () => {
        const previousWeekId = currentWeekId;
        const previousWeek = currentWeek;
        currentWeekId = '2026-W07';
        currentWeek = Storage.createEmptyWeek(new Date('2026-02-09T12:00:00'));
        currentWeek.days[0].dinner[0] = 'mantu';
        autoSave();
        assert(Storage.getWeek(currentWeekId)?.days[0].dinner[0] === 'mantu');
        currentWeekId = previousWeekId;
        currentWeek = previousWeek;
      });

      await test('XLSX Plan, Alerjenler ve Detay sayfalarında belirgin uyarılar bulunur', () => {
        currentWeekId = '2026-W05';
        currentWeek = Storage.createEmptyWeek(new Date('2026-01-26T12:00:00'));
        Storage.removeAllergenOverride('mantu');
        Storage.saveSettings({ avoidedAllergens: ['milk'] });
        currentWeek.days[0].lunch[0] = 'mantu';
        currentWeek.days[0].lunch[1] = 'su';
        const originalXlsx = window.XLSX;
        const captured = { sheets: {}, workbook: null };
        window.XLSX = {
          utils: {
            book_new: () => ({}),
            aoa_to_sheet: rows => ({ rows }),
            encode_range: () => 'A1:A1',
            book_append_sheet: (book, sheet, name) => { captured.sheets[name] = sheet; }
          },
          writeFile: workbook => { captured.workbook = workbook; }
        };
        exportExcel();
        const planRows = captured.sheets.Plan?.rows || [];
        const allergenRows = captured.sheets.Alerjenler?.rows || [];
        const detailRows = captured.sheets.Detay?.rows || [];
        assert(planRows.some(row => row.some(cell => cell?.v === 'Öğle Alerjen Uyarısı')));
        assert(planRows.every(row => row.length === 6));
        assert(captured.sheets.Plan['!cols'].length === 6);
        assert(planRows.some(row => row.some(cell => String(cell?.v || '').includes('[TERCİH ÇAKIŞMASI]'))));
        assert(planRows.some(row => row.some(cell => String(cell?.v || '').includes('[milk]'))));
        assert(!planRows.some(row => row.some(cell => cell?.v === 'Hedef %' || cell?.v === 'Durum')));
        assert(captured.workbook?.Workbook?.Names?.some(name => name.Name === '_xlnm.Print_Area' && name.Ref.includes('$A$1:$F$')));
        assert(allergenRows.some(row => row.some(cell => cell?.v === 'TERCİH UYARISI')));
        assert(allergenRows.some(row => row.some(cell => String(cell?.v || '').includes('ALERJEN BİLGİSİ DOĞRULANMAMIŞ'))));
        assert(detailRows.some(row => row.some(cell => cell?.v === 'ALERJEN UYARISI / BİLGİSİ')));
        const totalRow = detailRows.find(row => String(row[0]?.v || '').includes('toplam'));
        assert(totalRow?.[11]?.v === 500 && String(totalRow?.[12]?.v || '').includes('uyarılı yemek'));
        window.XLSX = originalXlsx;
      });

      await test('HTML tabanlı XLS çıktısında alerjen bilgisi bulunur', async () => {
        const originalXlsx = window.XLSX;
        const originalDownload = downloadBlob;
        let capturedBlob = null;
        window.XLSX = undefined;
        downloadBlob = blob => { capturedBlob = blob; };
        exportExcel();
        const html = await capturedBlob.text();
        assert(html.includes('ALERJEN UYARISI / BİLGİSİ'));
        assert(html.includes('[TERCİH ÇAKIŞMASI]') && html.includes('[İÇERİR]'));
        assert(html.includes('[BİLGİ YOK]'));
        assert(html.includes('colspan="6"') && html.includes('A4 landscape'));
        assert(html.includes('background:#fde8e7'));
        downloadBlob = originalDownload;
        window.XLSX = originalXlsx;
      });

      await test('Mevcut yemek kimlikleri değişmeden kalır ve yinelenmez', () => {
        const ids = BASE_FOODS.map(food => food.id);
        const originalIds = ids.filter(id => !ADDED_BASE_FOOD_IDS.includes(id));
        assert(originalIds.join(',') === ORIGINAL_BASE_FOOD_IDS.join(','));
        assert(ADDED_BASE_FOOD_IDS.every(id => ids.includes(id)));
        assert(new Set(ids).size === ids.length);
      });

      await test('Güncel enerji listesindeki kalori düzeltmeleri uygulanır', () => {
        assert(getFoodById('tavuklu_bezelye').calories === 320);
        assert(getFoodById('kadinbudu_kofte').calories === 500);
        assert(getFoodById('sehriyeli_pirinc_pilavi').calories === 320);
        assert(getFoodById('kazandibi').calories === 150);
        assert(getFoodById('kek').calories === 350);
        assert(getFoodById('tatli_eksi_soslu_tavuk').calories === 380);
      });

      await test('Güncel malzeme listesindeki kesin alerjenler işaretlenir', () => {
        assert(getFoodAllergenInfo(getFoodById('piyaz')).contains.includes('sesame'));
        assert(getFoodAllergenInfo(getFoodById('gavurdagi_salatasi')).contains.includes('tree_nuts'));
        assert(getFoodAllergenInfo(getFoodById('izgara_tavuk_kanat')).contains.includes('mustard'));
        assert(getFoodAllergenInfo(getFoodById('toyga_corbasi')).contains.includes('egg'));
        assert(getFoodAllergenInfo(getFoodById('sebzeli_kuskus_pilavi')).contains.includes('gluten_cereals'));
      });

      await test('Mevcut kalori hesabı çalışır', () => {
        assert(calcMealCalories(['mantu'], [1]) === 500);
      });

      await test('Favoriler çalışır', () => {
        Storage.toggleFavorite('mantu');
        assert(Storage.isFavorite('mantu'));
      });

      await test('Alerjen kısıtları kapalıyken bilinmeyen kayıt eski davranışla adaydır', () => {
        const preferences = { avoidedAllergens: [], treatPossibleContainsAsUnsafe: false, treatMayContainAsUnsafe: false, excludeUnknownAllergens: false };
        assert(isFoodAllowedByAllergenPreferences(getFoodById('su'), preferences));
        Storage.saveSettings(preferences);
        assert(createAutoFillContext().excludedFoodCount === 0);
      });

      await test('Veri doğrulama kritik hata döndürmez', () => {
        const report = validateAllergenDataset();
        assert(report.errors.length === 0 && report.stats.totalFoods === ORIGINAL_BASE_FOOD_IDS.length + ADDED_BASE_FOOD_IDS.length);
      });

      await test('Mobil alerjen düzeni için responsive CSS kuralları bulunur', async () => {
        const response = await fetch('../css/style.css');
        assert(response.ok, 'CSS dosyası okunamadı');
        const css = await response.text();
        assert(css.includes('@media (max-width: 900px)') && css.includes('.allergen-editor-groups') && css.includes('.allergen-settings-grid'));
      });

      await test('Tarayıcı çalışma sırasında JavaScript hatası oluşmaz', () => {
        assert(window.__allergenTestErrors.length === 0, window.__allergenTestErrors.join(' | '));
      });
    } finally {
      restoreAppStorage();
      renderResults();
    }
  }

  document.addEventListener('DOMContentLoaded', runTests);
}());
