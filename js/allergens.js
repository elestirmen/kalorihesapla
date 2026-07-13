/**
 * AB 14 ana alerjen grubu ve alerjen profil yardimcilari.
 * Bu dosya data.js dosyasindan once yuklenir; food ve Storage bagimliliklari
 * sadece fonksiyonlar cagirildiginda kullanilir.
 */

const ALLERGENS = Object.freeze({
  gluten_cereals: {
    name: "Gluten İçeren Tahıllar",
    shortName: "Gluten",
    icon: "🌾"
  },
  crustaceans: {
    name: "Kabuklular",
    shortName: "Kabuklu",
    icon: "🦐"
  },
  egg: {
    name: "Yumurta",
    shortName: "Yumurta",
    icon: "🥚"
  },
  fish: {
    name: "Balık",
    shortName: "Balık",
    icon: "🐟"
  },
  peanut: {
    name: "Yer Fıstığı",
    shortName: "Yer Fıstığı",
    icon: "🥜"
  },
  soy: {
    name: "Soya",
    shortName: "Soya",
    icon: "🫘"
  },
  milk: {
    name: "Süt ve Süt Ürünleri",
    shortName: "Süt",
    icon: "🥛"
  },
  tree_nuts: {
    name: "Sert Kabuklu Yemişler",
    shortName: "Kuruyemiş",
    icon: "🌰"
  },
  celery: {
    name: "Kereviz",
    shortName: "Kereviz",
    icon: "🌿"
  },
  mustard: {
    name: "Hardal",
    shortName: "Hardal",
    icon: "🟡"
  },
  sesame: {
    name: "Susam",
    shortName: "Susam",
    icon: "⚪"
  },
  sulphites: {
    name: "Kükürt Dioksit ve Sülfitler",
    shortName: "Sülfit",
    icon: "⚗️"
  },
  lupin: {
    name: "Acı Bakla (Lupin)",
    shortName: "Lupin",
    icon: "🫘"
  },
  molluscs: {
    name: "Yumuşakçalar",
    shortName: "Yumuşakça",
    icon: "🦪"
  }
});

const ALLERGEN_INFO_STATUS = Object.freeze({
  verified: "verified",
  typical_recipe: "typical_recipe",
  unknown: "unknown"
});

const ALLERGEN_STATUS_LABELS = Object.freeze({
  verified: "Tarif veya ürün bilgisi doğrulandı",
  typical_recipe: "Genel tarife göre",
  unknown: "Alerjen bilgisi bilinmiyor"
});

const DEFAULT_ALLERGEN_INFO = Object.freeze({
  contains: [],
  possibleContains: [],
  mayContain: [],
  status: ALLERGEN_INFO_STATUS.unknown,
  note: ""
});

const DEFAULT_ALLERGEN_PREFERENCES = Object.freeze({
  avoidedAllergens: [],
  treatPossibleContainsAsUnsafe: true,
  treatMayContainAsUnsafe: true,
  excludeUnknownAllergens: true
});

const ALLERGEN_NOTE_MAX_LENGTH = 500;
const CURRENT_FOOD_LIST_NOTE = "Güncel enerji listesindeki malzemelere göre kontrol edilmiştir; kullanılan paketli ürünlerin etiketleri ayrıca incelenmelidir.";
const CURRENT_FOOD_LIST_SAFE_PROFILE = Object.freeze({
  contains: [],
  possibleContains: [],
  mayContain: [],
  status: "verified",
  note: CURRENT_FOOD_LIST_NOTE
});

/*
 * Yerlesik yemekler icin statik olarak incelenmis profiller. Uretici veya
 * mutfak bilgisi olmadigi icin mayContain alani bilerek bos birakilir.
 */
const FOOD_ALLERGEN_PROFILES = Object.freeze({
  tarhana_corbasi: {
    contains: ["gluten_cereals"],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Geleneksel tarhanada buğday unu; bazı tariflerde yoğurt bulunur."
  },
  mercimek_corbasi: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  suzme_mercimek_corbasi: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  ezogelin_corbasi: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  toyga_corbasi: {
    contains: ["gluten_cereals", "milk", "egg"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  lebeniye_corbasi: {
    contains: ["gluten_cereals", "milk", "egg"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  yayla_corbasi: {
    contains: ["gluten_cereals", "milk", "egg"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  mantar_corbasi_kremali: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  mantar_corbasi: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  domates_corbasi: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  kozlenmis_domates_corbasi: {
    contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  brokoli_corbasi: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  kremali_sebze_corbasi: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  misirli_kremali_sebze_corbasi: {
    contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  sebze_corbasi: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  havuclu_kremali_corba: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  zencefilli_havuclu_kremali_corba: {
    contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  tavuk_suyu_corbasi: {
    contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  tavuk_corbasi: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  sehriyeli_tavuk_corbasi: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  tel_sehriye_corbasi: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  sehriye_corbasi: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  mahluta_corbasi: {
    contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  iskembe_corbasi: {
    contains: ["gluten_cereals", "egg"], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  tutmac_corbasi: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  dugun_corbasi: {
    contains: [],
    possibleContains: ["gluten_cereals", "milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Terbiye, un veya tereyağı kullanılan tarifler bulunabilir."
  },

  firinda_sebzeli_tavuk_sarma: {
    contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  tatli_eksi_soslu_tavuk: {
    contains: ["mustard"], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  tavuklu_bezelye: {
    contains: ["gluten_cereals"], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  izgara_tavuk_kanat: {
    contains: ["mustard"], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  tavuk_but: {
    contains: ["milk"], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  tavuk_tantuni: {
    contains: ["gluten_cereals"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: "Lavaşta servis edilen tavuk tantuni tanımına göre."
  },
  tavuk_doner: {
    contains: ["gluten_cereals"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: "Ekmek arası tavuk döner tanımına göre."
  },
  tavuk_kulbasti_begendi: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  tavuk_sinitzel: {
    contains: ["gluten_cereals"],
    possibleContains: ["egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Pane harcı ve yaygın yumurtalı kaplama tarifine göre."
  },
  ekmek_arasi_tantuni: {
    contains: ["gluten_cereals"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: "Ekmek arası servis tanımına göre."
  },
  ekmek_arasi_kofte: {
    contains: ["gluten_cereals", "egg"], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  izmir_kofte: {
    contains: ["gluten_cereals", "egg"], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  inegol_kofte: {
    contains: [],
    possibleContains: ["gluten_cereals", "egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Köfte harcında ekmek veya yumurta kullanılan tarifler bulunabilir."
  },
  kadinbudu_kofte: {
    contains: ["gluten_cereals", "egg"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  hasanpasa_kofte: {
    contains: ["gluten_cereals", "egg", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  hunkar_begendi: {
    contains: ["gluten_cereals"],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  kofte_izgara: {
    contains: [],
    possibleContains: ["gluten_cereals", "egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Köfte harcında ekmek veya yumurta kullanılan tarifler bulunabilir."
  },
  kiymali_kopoglu: {
    contains: [],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yoğurtla servis edilen köpoğlu tarifleri bulunabilir."
  },
  mantu: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: ["egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yoğurtlu mantı tanımına ve yaygın hamur tarifine göre."
  },
  ispanakli_cilbir: {
    contains: ["egg", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: "Yumurtalı ve yoğurtlu yaygın çılbır tarifine göre."
  },
  firinda_kofte: {
    contains: [],
    possibleContains: ["gluten_cereals", "egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Köfte harcında ekmek veya yumurta kullanılan tarifler bulunabilir."
  },
  alman_usulu_patates: {
    contains: ["egg", "mustard"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  kiymali_kapuska: {
    contains: [], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },

  firinlanmis_ispanak_graten: {
    contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  ispanak_graten: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  karnabahar_graten: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  patates_puresi: {
    contains: ["milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  baharatli_elma_dilim_patates: {
    contains: [], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  piyaz: {
    contains: ["sesame"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  patates_piyazi: {
    contains: [], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  zeytinyagli_kereviz: {
    contains: ["celery"],
    possibleContains: [],
    mayContain: [],
    status: "verified",
    note: "Kereviz yemek kimliğinin ayrılmaz parçasıdır."
  },

  pirinc_pilavi: {
    contains: ["milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  sade_pirinc_pilavi: {
    contains: ["milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  sebzeli_pirinc_pilavi: {
    contains: ["milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  bulgur_pilavi: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  siyez_bulgur_pilavi: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  sehriyeli_siyez_bulgur: {
    contains: ["gluten_cereals"],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Siyez bulguru ve şehriye buğday temelli ürünlerdir."
  },
  sebzeli_bulgur_pilavi: {
    contains: ["gluten_cereals"],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Bulgur buğday ürünüdür; tereyağı tariften tarife değişebilir."
  },
  firik_pilavi: {
    contains: ["gluten_cereals"],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Firik, buğdaydan elde edilen geleneksel bir tahıldır."
  },
  domatesli_sebzeli_pilav: {
    contains: [],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Tereyağı kullanılan pilav tarifleri bulunabilir."
  },
  meyhane_pilavi: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  havuclu_arpa_sehriye: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  sehriyeli_pirinc_pilavi: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  ic_pilav: {
    contains: [],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Tereyağı kullanılan iç pilav tarifleri bulunabilir."
  },
  nohutlu_pilav: {
    contains: [],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Tereyağı kullanılan nohutlu pilav tarifleri bulunabilir."
  },
  sebzeli_siyez_bulgur_pilavi: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  zerdecalli_misirli_pirinc_pilavi: {
    contains: ["milk"], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  domatesli_sehriye_pilavi: {
    contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  sehriyeli_bulgur_pilavi: {
    contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  sebzeli_meyhane_pilavi: {
    contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  sebzeli_kuskus_pilavi: {
    contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },

  domates_soslu_penne: {
    contains: ["gluten_cereals"],
    possibleContains: ["egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yaygın buğday makarnası ve bazı yumurtalı makarna tariflerine göre."
  },
  makarna_sade: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: ["egg"],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  peynirli_tam_bugday_makarna: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: ["egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Tam buğday makarnası ve peynirli yemek tanımına göre."
  },
  domates_soslu_spagetti: {
    contains: ["gluten_cereals"],
    possibleContains: ["egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yaygın buğday spagetti ve bazı yumurtalı makarna tariflerine göre."
  },
  yogurtlu_makarna: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: ["egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yoğurtlu makarna tanımına ve yaygın hamur tarifine göre."
  },
  cevizli_eriste: {
    contains: ["gluten_cereals", "milk", "tree_nuts"],
    possibleContains: ["egg"],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  sebzeli_eriste: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: ["egg"],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  peynirli_eriste: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: ["egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Peynirli erişte tanımına ve yaygın yumurtalı hamur tarifine göre."
  },
  domatesli_makarna: {
    contains: ["gluten_cereals"],
    possibleContains: ["egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yaygın buğday makarnası ve bazı yumurtalı makarna tariflerine göre."
  },
  firin_makarna: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: ["egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Beşamel veya peynirli fırın makarna tarifine göre."
  },

  peynirli_borek: {
    contains: ["gluten_cereals", "milk", "egg"],
    possibleContains: ["sesame"],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  ispanakli_borek: {
    contains: ["gluten_cereals", "milk", "egg"],
    possibleContains: ["sesame"],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  su_boregi: {
    contains: ["gluten_cereals"],
    possibleContains: ["egg", "milk", "sesame"],
    mayContain: [],
    status: "typical_recipe",
    note: "Hamur, peynir ve üzerindeki malzemeler tariften tarife değişebilir."
  },
  kiymali_borek: {
    contains: ["gluten_cereals", "milk", "egg"],
    possibleContains: ["sesame"],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  patatesli_borek: {
    contains: ["gluten_cereals"],
    possibleContains: ["egg", "milk", "sesame"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yufkalı börek ve üzerindeki malzemeler tariften tarife değişebilir."
  },
  sigara_boregi: {
    contains: ["gluten_cereals"],
    possibleContains: ["egg", "milk", "sesame"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yufkalı börek ve üzerindeki malzemeler tariften tarife değişebilir."
  },
  gozleme: {
    contains: ["gluten_cereals"],
    possibleContains: ["egg", "milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Hamur ve iç malzemeler gözleme çeşidine göre değişebilir."
  },

  mevsim_salatasi_yagli: {
    contains: [], possibleContains: ["mustard"], mayContain: [], status: "typical_recipe",
    note: "Salata sosunda hardal kullanılıp kullanılmadığı ayrıca kontrol edilmelidir."
  },
  mevsim_salatasi_yogurt: {
    contains: ["milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: "Yoğurtlu salata tanımına göre."
  },
  akdeniz_salatasi: {
    contains: ["milk"], possibleContains: [], mayContain: [], status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  gavurdagi_salatasi: {
    contains: ["tree_nuts"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  coleslaw_salatasi: {
    contains: ["egg"],
    possibleContains: ["mustard"],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  cacik: {
    contains: ["milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: "Yoğurt içeren yaygın cacık tarifine göre."
  },
  kis_patates_salatasi: {
    contains: [],
    possibleContains: [],
    mayContain: [],
    status: "verified",
    note: CURRENT_FOOD_LIST_NOTE
  },
  salatalik_tursusu: {
    contains: [], possibleContains: ["sulphites"], mayContain: [], status: "typical_recipe",
    note: "Sirke ve koruyucu içeriği kullanılan ürüne göre değişebileceğinden etiket kontrol edilmelidir."
  },

  // Güncel dosyada malzemeleri açıkça verilen ve AB 14 alerjeni içermeyen tarifler.
  baharatli_tavuk_sis: CURRENT_FOOD_LIST_SAFE_PROFILE,
  tavuk_sote: CURRENT_FOOD_LIST_SAFE_PROFILE,
  tavuk_fajita: CURRENT_FOOD_LIST_SAFE_PROFILE,
  firin_tavuk_baget: CURRENT_FOOD_LIST_SAFE_PROFILE,
  ciftlik_kebabi: CURRENT_FOOD_LIST_SAFE_PROFILE,
  sebzeli_kebap: CURRENT_FOOD_LIST_SAFE_PROFILE,
  tas_kebabi: CURRENT_FOOD_LIST_SAFE_PROFILE,
  orman_kebabi: CURRENT_FOOD_LIST_SAFE_PROFILE,
  sac_tava: CURRENT_FOOD_LIST_SAFE_PROFILE,
  belen_tava: CURRENT_FOOD_LIST_SAFE_PROFILE,
  etli_mevsim_turlusu: CURRENT_FOOD_LIST_SAFE_PROFILE,
  coban_kavurma: CURRENT_FOOD_LIST_SAFE_PROFILE,
  kiymali_patates_oturtma: CURRENT_FOOD_LIST_SAFE_PROFILE,
  kiymali_yesil_mercimek: CURRENT_FOOD_LIST_SAFE_PROFILE,
  kiymali_bezelye: CURRENT_FOOD_LIST_SAFE_PROFILE,
  kiymali_semizotu: CURRENT_FOOD_LIST_SAFE_PROFILE,
  kuru_fasulye: CURRENT_FOOD_LIST_SAFE_PROFILE,
  patlican_musakka: CURRENT_FOOD_LIST_SAFE_PROFILE,
  barbunya_pilaki: CURRENT_FOOD_LIST_SAFE_PROFILE,
  zeytinyagli_barbunya: CURRENT_FOOD_LIST_SAFE_PROFILE,
  yesil_mercimek_yemegi: CURRENT_FOOD_LIST_SAFE_PROFILE,
  zeytinyagli_pirasa: CURRENT_FOOD_LIST_SAFE_PROFILE,
  zeytinyagli_ispanak: CURRENT_FOOD_LIST_SAFE_PROFILE,
  zeytinyagli_kabak: CURRENT_FOOD_LIST_SAFE_PROFILE,
  zeytinyagli_taze_fasulye: CURRENT_FOOD_LIST_SAFE_PROFILE,
  zeytinyagli_karisik_kizartma: CURRENT_FOOD_LIST_SAFE_PROFILE,
  firinda_sebzeler: CURRENT_FOOD_LIST_SAFE_PROFILE,
  nohut_yemegi: CURRENT_FOOD_LIST_SAFE_PROFILE,
  sebzeli_patates_oturtma: CURRENT_FOOD_LIST_SAFE_PROFILE,
  elma_dilim_patates: CURRENT_FOOD_LIST_SAFE_PROFILE,
  sumakli_sogan_salatasi: CURRENT_FOOD_LIST_SAFE_PROFILE,
  sogus_salatasi: CURRENT_FOOD_LIST_SAFE_PROFILE,
  pancar_tursusu: CURRENT_FOOD_LIST_SAFE_PROFILE,
  yesillik: CURRENT_FOOD_LIST_SAFE_PROFILE,

  ayran: {
    contains: ["milk"],
    possibleContains: [],
    mayContain: [],
    status: "verified",
    note: "Ayran süt ürünü olan yoğurttan hazırlanır."
  },
  yogurt: {
    contains: ["milk"],
    possibleContains: [],
    mayContain: [],
    status: "verified",
    note: "Yoğurt süt ürünüdür."
  },
  sutlac: {
    contains: ["milk"],
    possibleContains: ["egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Sütlaç sütlü tatlıdır; yumurta kullanılan tarifler bulunabilir."
  },
  baklava: {
    contains: ["gluten_cereals", "tree_nuts"],
    possibleContains: ["milk", "egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yufka ve sert kabuklu yemiş içeren yaygın tarife göre."
  },
  kazandibi: {
    contains: ["milk"],
    possibleContains: ["gluten_cereals"],
    mayContain: [],
    status: "typical_recipe",
    note: "Sütlü tatlı tanımına ve nişasta ya da unla yapılan tariflere göre."
  },
  keskul: {
    contains: ["milk", "tree_nuts"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  supangle: {
    contains: ["milk"],
    possibleContains: ["tree_nuts"],
    mayContain: [],
    status: "typical_recipe",
    note: "Güncel listede süt ve pralin belirtilmiştir; pralinin sert kabuklu yemiş içeriği ürün etiketinden doğrulanmalıdır."
  },
  kek: {
    contains: ["gluten_cereals", "egg", "milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: CURRENT_FOOD_LIST_NOTE
  },
  dondurma: {
    contains: [],
    possibleContains: ["milk", "egg", "tree_nuts"],
    mayContain: [],
    status: "typical_recipe",
    note: "Dondurma türü, ürün etiketi ve tarifi belirleyicidir."
  },
  revani: {
    contains: ["gluten_cereals", "egg"],
    possibleContains: ["milk", "tree_nuts"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yaygın revani hamuru ve malzeme çeşitlerine göre."
  },
  trilece: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: ["egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Sütlü kek tabanlı yaygın trileçe tarifine göre."
  },
  profiterol: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: ["egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Hamur ve sütlü krema içeren yaygın profiterol tarifine göre."
  },
  muhallebi: {
    contains: ["milk"],
    possibleContains: ["gluten_cereals"],
    mayContain: [],
    status: "typical_recipe",
    note: "Muhallebi sütlü tatlıdır; un kullanılan tarifler bulunabilir."
  },

  elma: {
    contains: [], possibleContains: [], mayContain: [], status: "verified",
    note: "Tek bileşenli elma kaydı için AB 14 kataloğunda bir alerjen belirtilmemiştir."
  },
  muz: {
    contains: [], possibleContains: [], mayContain: [], status: "verified",
    note: "Tek bileşenli muz kaydı için AB 14 kataloğunda bir alerjen belirtilmemiştir."
  },
  portakal: {
    contains: [], possibleContains: [], mayContain: [], status: "verified",
    note: "Tek bileşenli portakal kaydı için AB 14 kataloğunda bir alerjen belirtilmemiştir."
  },
  uzum: {
    contains: [], possibleContains: [], mayContain: [], status: "verified",
    note: "Tek bileşenli üzüm kaydı için AB 14 kataloğunda bir alerjen belirtilmemiştir."
  },
  cilek: {
    contains: [], possibleContains: [], mayContain: [], status: "verified",
    note: "Tek bileşenli çilek kaydı için AB 14 kataloğunda bir alerjen belirtilmemiştir."
  },
  karpuz: {
    contains: [], possibleContains: [], mayContain: [], status: "verified",
    note: "Tek bileşenli karpuz kaydı için AB 14 kataloğunda bir alerjen belirtilmemiştir."
  },
  kavun: {
    contains: [], possibleContains: [], mayContain: [], status: "verified",
    note: "Tek bileşenli kavun kaydı için AB 14 kataloğunda bir alerjen belirtilmemiştir."
  },
  seftali: {
    contains: [], possibleContains: [], mayContain: [], status: "verified",
    note: "Tek bileşenli şeftali kaydı için AB 14 kataloğunda bir alerjen belirtilmemiştir."
  },
  roll_ekmek_beyaz: {
    contains: ["gluten_cereals"], possibleContains: [], mayContain: [], status: "verified",
    note: "Beyaz ekmek buğday temelli bir üründür."
  },
  roll_ekmek_tam_bugday: {
    contains: ["gluten_cereals"], possibleContains: [], mayContain: [], status: "verified",
    note: "Tam buğday ekmeği buğday temelli bir üründür."
  },
  ekmek: {
    contains: ["gluten_cereals"], possibleContains: [], mayContain: [], status: "verified",
    note: "Ekmek kaydı buğday ekmeği porsiyonunu ifade eder."
  }
});

function getAllergenSafeText(value, maxLength = ALLERGEN_NOTE_MAX_LENGTH) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeAllergenIds(value) {
  const values = Array.isArray(value) ? value : [];
  const seen = new Set();
  return values.reduce((ids, item) => {
    const id = typeof item === "string" ? item.trim() : "";
    if (!Object.prototype.hasOwnProperty.call(ALLERGENS, id) || seen.has(id)) return ids;
    seen.add(id);
    ids.push(id);
    return ids;
  }, []);
}

function normalizeAllergenInfo(info) {
  const source = info && typeof info === "object" && !Array.isArray(info) ? info : {};
  const contains = normalizeAllergenIds(source.contains);
  const containsSet = new Set(contains);
  const possibleContains = normalizeAllergenIds(source.possibleContains)
    .filter(id => !containsSet.has(id));
  const possibleSet = new Set(possibleContains);
  const mayContain = normalizeAllergenIds(source.mayContain)
    .filter(id => !containsSet.has(id) && !possibleSet.has(id));
  const status = Object.prototype.hasOwnProperty.call(ALLERGEN_STATUS_LABELS, source.status)
    ? source.status
    : ALLERGEN_INFO_STATUS.unknown;

  return {
    contains,
    possibleContains,
    mayContain,
    status,
    note: getAllergenSafeText(source.note)
  };
}

function normalizeAllergenPreferences(preferences) {
  const source = preferences && typeof preferences === "object" && !Array.isArray(preferences)
    ? preferences
    : {};
  return {
    avoidedAllergens: normalizeAllergenIds(source.avoidedAllergens),
    treatPossibleContainsAsUnsafe: source.treatPossibleContainsAsUnsafe !== false,
    treatMayContainAsUnsafe: source.treatMayContainAsUnsafe !== false,
    excludeUnknownAllergens: source.excludeUnknownAllergens !== false
  };
}

function getAllergenLabel(allergenId) {
  const allergen = ALLERGENS[allergenId];
  return allergen ? `${allergen.name} [${allergenId}]` : "";
}

function getAllergenShortLabel(allergenId) {
  const allergen = ALLERGENS[allergenId];
  return allergen ? `${allergen.icon} ${allergen.shortName} [${allergenId}]` : "";
}

function getFoodAllergenInfo(food, knownOverrides) {
  const foodId = typeof food?.id === "string" ? food.id.trim() : "";
  const overrides = knownOverrides || (typeof Storage !== "undefined" && Storage.getAllergenOverrides
    ? Storage.getAllergenOverrides()
    : {});

  if (foodId && overrides[foodId]) return normalizeAllergenInfo(overrides[foodId]);
  if (food?.isCustom && Object.prototype.hasOwnProperty.call(food, "allergenInfo")) {
    return normalizeAllergenInfo(food.allergenInfo);
  }
  if (foodId && FOOD_ALLERGEN_PROFILES[foodId]) return normalizeAllergenInfo(FOOD_ALLERGEN_PROFILES[foodId]);
  if (food && Object.prototype.hasOwnProperty.call(food, "allergenInfo")) {
    return normalizeAllergenInfo(food.allergenInfo);
  }
  return normalizeAllergenInfo(DEFAULT_ALLERGEN_INFO);
}

function formatAllergenInfo(info, options = {}) {
  const normalized = normalizeAllergenInfo(info);
  const labelList = ids => ids.map(id => options.short ? getAllergenShortLabel(id) : getAllergenLabel(id)).filter(Boolean);
  const contains = labelList(normalized.contains);
  const possible = labelList(normalized.possibleContains);
  const mayContain = labelList(normalized.mayContain);

  if (options.compact) {
    const parts = [];
    if (contains.length) parts.push(contains.join(", "));
    if (possible.length) parts.push(`⚠️ ${possible.join(", ")} olabilir`);
    if (mayContain.length) parts.push(`⚠️ ${mayContain.join(", ")} çapraz temas`);
    if (!parts.length && normalized.status === ALLERGEN_INFO_STATUS.unknown) {
      parts.push("? Alerjen bilgisi bilinmiyor");
    }
    return parts.join(" · ");
  }

  const emptyLabel = normalized.status === ALLERGEN_INFO_STATUS.unknown ? "Kayıt yok" : "Yok";
  const lines = [
    `İçerir: ${contains.length ? contains.join(", ") : emptyLabel}`,
    `Tarife Göre Bulunabilir: ${possible.length ? possible.join(", ") : emptyLabel}`,
    `Çapraz Temas Uyarısı: ${mayContain.length ? mayContain.join(", ") : emptyLabel}`,
    `Durum: ${ALLERGEN_STATUS_LABELS[normalized.status]}`
  ];
  if (normalized.note && options.includeNote !== false) lines.push(`Not: ${normalized.note}`);
  return lines.join(options.separator || "\n");
}

function getAllergenConflictDetails(food, preferences) {
  const info = getFoodAllergenInfo(food);
  const normalizedPreferences = normalizeAllergenPreferences(preferences);
  const avoided = new Set(normalizedPreferences.avoidedAllergens);
  const matching = ids => ids.filter(id => avoided.has(id));
  const contains = matching(info.contains);
  const possibleContains = normalizedPreferences.treatPossibleContainsAsUnsafe
    ? matching(info.possibleContains)
    : [];
  const mayContain = normalizedPreferences.treatMayContainAsUnsafe
    ? matching(info.mayContain)
    : [];
  const unknown = normalizedPreferences.excludeUnknownAllergens
    && info.status === ALLERGEN_INFO_STATUS.unknown;

  return {
    info,
    contains,
    possibleContains,
    mayContain,
    unknown,
    hasConflict: contains.length > 0 || possibleContains.length > 0 || mayContain.length > 0 || unknown
  };
}

function hasAllergenConflict(food, preferences) {
  return getAllergenConflictDetails(food, preferences).hasConflict;
}

function isFoodAllowedByAllergenPreferences(food, preferences) {
  return !hasAllergenConflict(food, preferences);
}

function inspectAllergenProfile(profile, profileId, knownFoodIds) {
  const errors = [];
  const warnings = [];
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
    errors.push(`${profileId}: profil nesne olmalıdır.`);
    return { errors, warnings };
  }
  if (!knownFoodIds.has(profileId)) errors.push(`${profileId}: var olmayan yemek kimliği için profil var.`);

  const fields = ["contains", "possibleContains", "mayContain"];
  const seen = new Map();
  fields.forEach(field => {
    if (!Array.isArray(profile[field])) {
      errors.push(`${profileId}: ${field} alanı dizi olmalıdır.`);
      return;
    }
    const fieldSeen = new Set();
    profile[field].forEach(id => {
      if (!Object.prototype.hasOwnProperty.call(ALLERGENS, id)) {
        errors.push(`${profileId}: geçersiz alerjen kimliği (${String(id)}).`);
        return;
      }
      if (fieldSeen.has(id)) errors.push(`${profileId}: ${field} alanında yinelenen alerjen (${id}).`);
      fieldSeen.add(id);
      if (seen.has(id) && seen.get(id) !== field) {
        errors.push(`${profileId}: ${id} birden fazla alerjen alanında bulunuyor.`);
      }
      seen.set(id, field);
    });
  });
  if (!Object.prototype.hasOwnProperty.call(ALLERGEN_STATUS_LABELS, profile.status)) {
    errors.push(`${profileId}: geçersiz alerjen bilgi durumu.`);
  }
  if (typeof profile.note !== "string") {
    errors.push(`${profileId}: not metin olmalıdır.`);
  } else if (profile.note.trim().length > ALLERGEN_NOTE_MAX_LENGTH) {
    errors.push(`${profileId}: not en fazla ${ALLERGEN_NOTE_MAX_LENGTH} karakter olmalıdır.`);
  }
  if (profile.status === ALLERGEN_INFO_STATUS.verified && !getAllergenSafeText(profile.note)) {
    warnings.push(`${profileId}: doğrulanmış profil için gerekçe notu yok.`);
  }
  return { errors, warnings };
}

function validateAllergenDataset() {
  const errors = [];
  const warnings = [];
  const foods = typeof BASE_FOODS !== "undefined" && Array.isArray(BASE_FOODS) ? BASE_FOODS : [];
  const foodIds = new Set();
  const duplicateFoodIds = new Set();
  foods.forEach(food => {
    if (!food?.id) return;
    if (foodIds.has(food.id)) duplicateFoodIds.add(food.id);
    foodIds.add(food.id);
  });
  duplicateFoodIds.forEach(id => errors.push(`Yinelenen yemek kimliği: ${id}`));

  Object.entries(FOOD_ALLERGEN_PROFILES).forEach(([foodId, profile]) => {
    const report = inspectAllergenProfile(profile, foodId, foodIds);
    errors.push(...report.errors);
    warnings.push(...report.warnings);
  });

  const stats = {
    totalFoods: foods.length,
    verified: 0,
    typicalRecipe: 0,
    unknown: 0,
    withContains: 0,
    withPossibleContains: 0,
    withMayContain: 0
  };
  foods.forEach(food => {
    const sourceProfile = FOOD_ALLERGEN_PROFILES[food.id];
    if (!sourceProfile) warnings.push(`${food.id}: alerjen profili bulunmuyor; unknown kullanılacak.`);
    const info = normalizeAllergenInfo(sourceProfile);
    if (info.status === ALLERGEN_INFO_STATUS.verified) stats.verified += 1;
    else if (info.status === ALLERGEN_INFO_STATUS.typical_recipe) stats.typicalRecipe += 1;
    else stats.unknown += 1;
    if (info.contains.length) stats.withContains += 1;
    if (info.possibleContains.length) stats.withPossibleContains += 1;
    if (info.mayContain.length) stats.withMayContain += 1;
  });

  return { errors, warnings, stats };
}
