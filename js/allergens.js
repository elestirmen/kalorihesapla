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
function getAllergenSafeText(value, maxLength = ALLERGEN_NOTE_MAX_LENGTH) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, maxLength);
}

/*
 * Excel'deki "ENERJİ DEĞERLERİ" sayfası bu veri setinin tek kaynağıdır.
 * Boş alerjen hücreleri ve listede bulunmayan yemekler için kayıt eklenmez;
 * getFoodAllergenInfo bunları boş/unknown varsayılanıyla döndürür.
 */
const FOOD_ALLERGEN_PROFILES = Object.freeze({
  tarhana_corbasi: { contains: [], possibleContains: ["milk"], mayContain: ["gluten_cereals", "mustard", "egg", "soy"], status: "typical_recipe", note: "Yoğurt ve hazır ürün etiketine bağlı alerjen bilgisi kaynak Excel’de koşullu belirtilmiştir." },
  firinda_sebzeli_tavuk_sarma: { contains: ["milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  mercimek_corbasi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  tatli_eksi_soslu_tavuk: { contains: ["mustard"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  sehriyeli_pirinc_pilavi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  suzme_mercimek_corbasi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  zerdecalli_misirli_pirinc_pilavi: { contains: ["milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  akdeniz_salatasi: { contains: ["milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  ezogelin_corbasi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  domatesli_sehriye_pilavi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  gavurdagi_salatasi: { contains: ["tree_nuts"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  toyga_corbasi: { contains: ["gluten_cereals", "egg", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  tavuklu_bezelye: { contains: ["gluten_cereals"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  sebzeli_pirinc_pilavi: { contains: ["milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  lebeniye_corbasi: { contains: ["gluten_cereals", "egg", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  tavuk_doner: { contains: ["gluten_cereals"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  sade_pirinc_pilavi: { contains: ["milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  yayla_corbasi: { contains: ["gluten_cereals", "egg", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  izgara_tavuk_kanat: { contains: ["mustard"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  siyez_bulgur_pilavi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  mantar_corbasi_kremali: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  tavuk_but: { contains: ["milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  sehriyeli_bulgur_pilavi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  mantar_corbasi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  sebzeli_siyez_bulgur_pilavi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  domates_corbasi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  sebzeli_meyhane_pilavi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  cacik: { contains: ["milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  kozlenmis_domates_corbasi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  meyhane_pilavi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  brokoli_corbasi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  tavuk_kulbasti_begendi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  bulgur_pilavi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  misirli_kremali_sebze_corbasi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  tavuk_sinitzel: { contains: [], possibleContains: [], mayContain: ["gluten_cereals", "mustard", "soy", "egg"], status: "typical_recipe", note: "Paket içeriği kaynak Excel’de kontrol edilmesi gereken eser miktar uyarısı olarak belirtilmiştir." },
  sebze_corbasi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  havuclu_arpa_sehriye: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  zencefilli_havuclu_kremali_corba: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  cevizli_eriste: { contains: ["gluten_cereals", "milk", "tree_nuts"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  tavuk_suyu_corbasi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  ekmek_arasi_tantuni: { contains: ["gluten_cereals"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  sebzeli_eriste: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  tavuk_corbasi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  ekmek_arasi_kofte: { contains: ["gluten_cereals", "egg"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  peynirli_eriste: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  keskul: { contains: ["milk"], possibleContains: ["gluten_cereals"], mayContain: [], status: "typical_recipe", note: "Nişasta türüne bağlı gluten bilgisi kaynak Excel’de koşullu belirtilmiştir." },
  sehriyeli_tavuk_corbasi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  izmir_kofte: { contains: ["gluten_cereals", "egg"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  sebzeli_kuskus_pilavi: { contains: ["milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  supangle: { contains: ["milk"], possibleContains: ["gluten_cereals"], mayContain: [], status: "typical_recipe", note: "Nişasta türüne bağlı gluten bilgisi kaynak Excel’de koşullu belirtilmiştir." },
  tel_sehriye_corbasi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  kadinbudu_kofte: { contains: ["gluten_cereals", "egg"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  makarna_sade: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  sehriye_corbasi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  hasanpasa_kofte: { contains: ["gluten_cereals", "egg", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  domates_soslu_penne: { contains: ["gluten_cereals"], possibleContains: ["milk"], mayContain: [], status: "typical_recipe", note: "Tereyağı kullanımına bağlı süt bilgisi kaynak Excel’de koşullu belirtilmiştir." },
  sutlac: { contains: ["milk"], possibleContains: ["gluten_cereals"], mayContain: [], status: "typical_recipe", note: "Nişasta türüne bağlı gluten bilgisi kaynak Excel’de koşullu belirtilmiştir." },
  mahluta_corbasi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  kazandibi: { contains: ["milk"], possibleContains: ["gluten_cereals"], mayContain: [], status: "typical_recipe", note: "Nişasta türüne bağlı gluten bilgisi kaynak Excel’de koşullu belirtilmiştir." },
  iskembe_corbasi: { contains: ["gluten_cereals", "egg", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  tutmac_corbasi: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  yogurtlu_makarna: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  kek: { contains: ["gluten_cereals", "egg", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  patates_puresi: { contains: ["milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  roll_ekmek_beyaz: { contains: ["gluten_cereals"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  roll_ekmek_tam_bugday: { contains: ["gluten_cereals"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  coban_kavurma: { contains: ["gluten_cereals", "egg", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  alman_usulu_patates: { contains: ["egg", "mustard"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  hunkar_begendi: { contains: ["gluten_cereals"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  karnabahar_graten: { contains: ["gluten_cereals", "milk"], possibleContains: ["egg"], mayContain: [], status: "typical_recipe", note: "Yumurta kullanımı kaynak Excel’de tarife bağlı belirtilmiştir." },
  kiymali_borek: { contains: ["egg", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  peynirli_borek: { contains: ["egg", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  ispanakli_borek: { contains: ["egg", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  mantu: { contains: ["gluten_cereals", "egg", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  firinlanmis_ispanak_graten: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" },
  ispanak_graten: { contains: ["gluten_cereals", "milk"], possibleContains: [], mayContain: [], status: "verified", note: "" }
});

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
