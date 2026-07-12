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
    contains: [],
    possibleContains: ["gluten_cereals", "milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yaygın tariflerde un, tereyağı veya süt ürünü kullanılabilir."
  },
  suzme_mercimek_corbasi: {
    contains: [],
    possibleContains: ["gluten_cereals", "milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yaygın tariflerde un, tereyağı veya süt ürünü kullanılabilir."
  },
  ezogelin_corbasi: {
    contains: [],
    possibleContains: ["gluten_cereals", "milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Bulgur, un ve tereyağı tariften tarife değişebilir."
  },
  toyga_corbasi: {
    contains: ["milk"],
    possibleContains: ["gluten_cereals", "egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yoğurtlu yaygın toyga çorbası tarifine göre."
  },
  lebeniye_corbasi: {
    contains: ["milk"],
    possibleContains: ["gluten_cereals", "egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yoğurtlu yaygın lebeniye çorbası tarifine göre."
  },
  yayla_corbasi: {
    contains: ["milk"],
    possibleContains: ["gluten_cereals", "egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yoğurtlu yayla çorbasının yaygın tarifine göre."
  },
  mantar_corbasi_kremali: {
    contains: ["milk"],
    possibleContains: ["gluten_cereals"],
    mayContain: [],
    status: "typical_recipe",
    note: "Kremalı çorba tanımına ve yaygın unlu kıvamlandırmaya göre."
  },
  mantar_corbasi: {
    contains: [],
    possibleContains: ["gluten_cereals", "milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Un, süt veya krema kullanılan tarifler bulunabilir."
  },
  domates_corbasi: {
    contains: [],
    possibleContains: ["gluten_cereals", "milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Un, tereyağı veya süt kullanılan tarifler bulunabilir."
  },
  brokoli_corbasi: {
    contains: [],
    possibleContains: ["gluten_cereals", "milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Un, süt veya krema kullanılan tarifler bulunabilir."
  },
  kremali_sebze_corbasi: {
    contains: ["milk"],
    possibleContains: ["gluten_cereals"],
    mayContain: [],
    status: "typical_recipe",
    note: "Kremalı çorba tanımına ve yaygın unlu kıvamlandırmaya göre."
  },
  sebze_corbasi: {
    contains: [],
    possibleContains: ["gluten_cereals", "milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Un, tereyağı veya süt kullanılan tarifler bulunabilir."
  },
  havuclu_kremali_corba: {
    contains: ["milk"],
    possibleContains: ["gluten_cereals"],
    mayContain: [],
    status: "typical_recipe",
    note: "Kremalı çorba tanımına ve yaygın unlu kıvamlandırmaya göre."
  },
  tavuk_corbasi: {
    contains: [],
    possibleContains: ["gluten_cereals", "milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Un veya süt ürünü eklenen tavuk çorbası tarifleri bulunabilir."
  },
  sehriyeli_tavuk_corbasi: {
    contains: ["gluten_cereals"],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Şehriye buğday temelli yaygın bir makarna ürünüdür."
  },
  tel_sehriye_corbasi: {
    contains: ["gluten_cereals"],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Tel şehriye buğday temelli yaygın bir makarna ürünüdür."
  },
  sehriye_corbasi: {
    contains: ["gluten_cereals"],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Şehriye buğday temelli yaygın bir makarna ürünüdür."
  },
  tutmac_corbasi: {
    contains: ["gluten_cereals", "milk"],
    possibleContains: ["egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yoğurtlu ve hamurlu yaygın tutmaç çorbası tarifine göre."
  },
  dugun_corbasi: {
    contains: [],
    possibleContains: ["gluten_cereals", "milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Terbiye, un veya tereyağı kullanılan tarifler bulunabilir."
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
    contains: [],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Beğendide süt veya tereyağı kullanılan yaygın tariflere göre."
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
  inegol_kofte: {
    contains: [],
    possibleContains: ["gluten_cereals", "egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Köfte harcında ekmek veya yumurta kullanılan tarifler bulunabilir."
  },
  kadinbudu_kofte: {
    contains: ["egg"],
    possibleContains: ["gluten_cereals"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yumurtalı ve pane kaplamalı yaygın kadınbudu köfte tarifine göre."
  },
  hasanpasa_kofte: {
    contains: [],
    possibleContains: ["gluten_cereals", "egg", "milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Köfte harcı ve patates püresi tariften tarife değişebilir."
  },
  hunkar_begendi: {
    contains: [],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Beğendide süt veya tereyağı kullanılan yaygın tariflere göre."
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
    contains: [],
    possibleContains: ["egg", "mustard"],
    mayContain: [],
    status: "typical_recipe",
    note: "Mayonez veya hardal kullanılan patates salatası tarifleri bulunabilir."
  },

  ispanak_graten: {
    contains: ["milk"],
    possibleContains: ["gluten_cereals"],
    mayContain: [],
    status: "typical_recipe",
    note: "Beşamel veya peynirli yaygın graten tarifine göre."
  },
  karnabahar_graten: {
    contains: ["milk"],
    possibleContains: ["gluten_cereals"],
    mayContain: [],
    status: "typical_recipe",
    note: "Beşamel veya peynirli yaygın graten tarifine göre."
  },
  patates_puresi: {
    contains: [],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Süt veya tereyağı kullanılan patates püresi tarifleri bulunabilir."
  },
  piyaz: {
    contains: [],
    possibleContains: ["egg", "mustard"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yumurta veya hardallı sos kullanılan piyaz tarifleri bulunabilir."
  },
  zeytinyagli_kereviz: {
    contains: ["celery"],
    possibleContains: [],
    mayContain: [],
    status: "verified",
    note: "Kereviz yemek kimliğinin ayrılmaz parçasıdır."
  },

  pirinc_pilavi: {
    contains: [],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Tereyağı kullanılan pilav tarifleri bulunabilir."
  },
  sade_pirinc_pilavi: {
    contains: [],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Tereyağı kullanılan pilav tarifleri bulunabilir."
  },
  sebzeli_pirinc_pilavi: {
    contains: [],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Tereyağı kullanılan pilav tarifleri bulunabilir."
  },
  bulgur_pilavi: {
    contains: ["gluten_cereals"],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Bulgur buğday ürünüdür. Bazı tariflerde tereyağı kullanılabilir."
  },
  siyez_bulgur_pilavi: {
    contains: ["gluten_cereals"],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Siyez bulguru buğday ürünüdür; tereyağı tariften tarife değişebilir."
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
    contains: ["gluten_cereals"],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yaygın meyhane pilavı tarifinde bulgur bulunur."
  },
  havuclu_arpa_sehriye: {
    contains: ["gluten_cereals"],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Arpa şehriye buğday temelli yaygın bir makarna ürünüdür."
  },
  sehriyeli_pirinc_pilavi: {
    contains: ["gluten_cereals"],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Şehriye buğday temelli yaygın bir makarna ürünüdür."
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
    contains: ["gluten_cereals"],
    possibleContains: ["milk"],
    mayContain: [],
    status: "typical_recipe",
    note: "Siyez bulguru buğday ürünüdür; tereyağı tariften tarife değişebilir."
  },

  domates_soslu_penne: {
    contains: ["gluten_cereals"],
    possibleContains: ["egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yaygın buğday makarnası ve bazı yumurtalı makarna tariflerine göre."
  },
  makarna_sade: {
    contains: ["gluten_cereals"],
    possibleContains: ["egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yaygın buğday makarnası ve bazı yumurtalı makarna tariflerine göre."
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
    contains: ["gluten_cereals", "tree_nuts"],
    possibleContains: ["egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Erişte ve ceviz içeren yemek tanımına göre."
  },
  sebzeli_eriste: {
    contains: ["gluten_cereals"],
    possibleContains: ["egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Erişte ve yaygın yumurtalı hamur tarifine göre."
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
    contains: ["gluten_cereals", "milk"],
    possibleContains: ["egg", "sesame"],
    mayContain: [],
    status: "typical_recipe",
    note: "Hamur ve peynir içeren yaygın tarife göre."
  },
  ispanakli_borek: {
    contains: ["gluten_cereals"],
    possibleContains: ["egg", "milk", "sesame"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yufkalı börek ve üzerindeki malzemeler tariften tarife değişebilir."
  },
  su_boregi: {
    contains: ["gluten_cereals"],
    possibleContains: ["egg", "milk", "sesame"],
    mayContain: [],
    status: "typical_recipe",
    note: "Hamur, peynir ve üzerindeki malzemeler tariften tarife değişebilir."
  },
  kiymali_borek: {
    contains: ["gluten_cereals"],
    possibleContains: ["egg", "milk", "sesame"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yufkalı börek ve üzerindeki malzemeler tariften tarife değişebilir."
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

  mevsim_salatasi_yogurt: {
    contains: ["milk"],
    possibleContains: [],
    mayContain: [],
    status: "typical_recipe",
    note: "Yoğurtlu salata tanımına göre."
  },
  gavurdagi_salatasi: {
    contains: [],
    possibleContains: ["tree_nuts"],
    mayContain: [],
    status: "typical_recipe",
    note: "Ceviz eklenen Gavurdağı salatası tarifleri bulunabilir."
  },
  coleslaw_salatasi: {
    contains: [],
    possibleContains: ["egg", "milk", "mustard"],
    mayContain: [],
    status: "typical_recipe",
    note: "Mayonezli veya hardallı coleslaw sosu tariften tarife değişebilir."
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
    possibleContains: ["egg", "mustard"],
    mayContain: [],
    status: "typical_recipe",
    note: "Mayonez veya hardal kullanılan patates salatası tarifleri bulunabilir."
  },

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
    contains: ["milk"],
    possibleContains: ["tree_nuts"],
    mayContain: [],
    status: "typical_recipe",
    note: "Sütlü keşkül ve bademli tarif çeşitlerine göre."
  },
  supangle: {
    contains: ["milk"],
    possibleContains: ["gluten_cereals", "egg"],
    mayContain: [],
    status: "typical_recipe",
    note: "Sütlü çikolatalı tatlı ve tarif değişkenliğine göre."
  },
  kek: {
    contains: ["gluten_cereals", "egg"],
    possibleContains: ["milk", "tree_nuts"],
    mayContain: [],
    status: "typical_recipe",
    note: "Yaygın kek hamuru ve malzeme çeşitlerine göre."
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
  return ALLERGENS[allergenId]?.name || "";
}

function getAllergenShortLabel(allergenId) {
  const allergen = ALLERGENS[allergenId];
  return allergen ? `${allergen.icon} ${allergen.shortName}` : "";
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
