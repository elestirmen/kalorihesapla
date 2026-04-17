/**
 * Yemek Veritabanı - Türk Mutfağı Kalori Tablosu
 * Porsiyon başına kalori değerleri (kcal)
 */

const FOOD_CATEGORIES = {
  corba: { name: "Çorbalar", icon: "🍲", color: "#d97016" },
  ana_et: { name: "Et / Tavuk Yemekleri", icon: "🍗", color: "#c0392b" },
  ana_sebze: { name: "Sebze Yemekleri", icon: "🥘", color: "#3a8a5c" },
  pilav: { name: "Pilavlar", icon: "🍚", color: "#7c54b8" },
  makarna: { name: "Makarnalar", icon: "🍝", color: "#d46a1a" },
  borek: { name: "Börekler", icon: "🥟", color: "#b84575" },
  salata: { name: "Salatalar", icon: "🥗", color: "#2d8a6e" },
  icecek: { name: "İçecekler", icon: "🥛", color: "#2e6ea6" },
  tatli: { name: "Tatlılar", icon: "🍮", color: "#a61838" },
  meyve: { name: "Meyveler", icon: "🍎", color: "#5a8c1a" },
  diger: { name: "Diğer", icon: "🍽️", color: "#7a7060" }
};

const BASE_FOODS = [
  // ═══ ÇORBALAR ═══
  { id: "tarhana_corbasi", name: "Tarhana Çorbası", category: "corba", calories: 110, portion: "1 kase" },
  { id: "mercimek_corbasi", name: "Mercimek Çorbası", category: "corba", calories: 140, portion: "1 kase" },
  { id: "suzme_mercimek_corbasi", name: "Süzme Mercimek Çorbası", category: "corba", calories: 120, portion: "1 kase" },
  { id: "ezogelin_corbasi", name: "Ezogelin Çorbası", category: "corba", calories: 150, portion: "1 kase" },
  { id: "toyga_corbasi", name: "Toyga Çorbası", category: "corba", calories: 110, portion: "1 kase" },
  { id: "lebeniye_corbasi", name: "Lebeniye Çorbası", category: "corba", calories: 170, portion: "1 kase" },
  { id: "yayla_corbasi", name: "Yayla Çorbası", category: "corba", calories: 100, portion: "1 kase" },
  { id: "mantar_corbasi_kremali", name: "Mantar Çorbası (Kremalı)", category: "corba", calories: 180, portion: "1 kase" },
  { id: "mantar_corbasi", name: "Mantar Çorbası", category: "corba", calories: 90, portion: "1 kase" },
  { id: "domates_corbasi", name: "Domates Çorbası", category: "corba", calories: 90, portion: "1 kase" },
  { id: "brokoli_corbasi", name: "Brokoli Çorbası", category: "corba", calories: 110, portion: "1 kase" },
  { id: "kremali_sebze_corbasi", name: "Kremalı Sebze Çorbası", category: "corba", calories: 180, portion: "1 kase" },
  { id: "sebze_corbasi", name: "Sebze Çorbası", category: "corba", calories: 70, portion: "1 kase" },
  { id: "havuclu_kremali_corba", name: "Havuçlu Kremalı Çorba", category: "corba", calories: 150, portion: "1 kase" },
  { id: "tavuk_suyu_corbasi", name: "Tavuk Suyu Çorbası", category: "corba", calories: 60, portion: "1 kase" },
  { id: "tavuk_corbasi", name: "Tavuk Çorbası", category: "corba", calories: 120, portion: "1 kase" },
  { id: "sehriyeli_tavuk_corbasi", name: "Şehriyeli Tavuk Suyu Çorbası", category: "corba", calories: 140, portion: "1 kase" },
  { id: "tel_sehriye_corbasi", name: "Tel Şehriye Çorbası", category: "corba", calories: 130, portion: "1 kase" },
  { id: "sehriye_corbasi", name: "Şehriye Çorbası", category: "corba", calories: 120, portion: "1 kase" },
  { id: "mahluta_corbasi", name: "Mahluta Çorbası", category: "corba", calories: 150, portion: "1 kase" },
  { id: "iskembe_corbasi", name: "İşkembe Çorbası", category: "corba", calories: 180, portion: "1 kase" },
  { id: "tutmac_corbasi", name: "Tutmaç Çorbası", category: "corba", calories: 200, portion: "1 kase" },
  { id: "dugun_corbasi", name: "Düğün Çorbası", category: "corba", calories: 160, portion: "1 kase" },

  // ═══ ET / TAVUK YEMEKLERİ ═══
  { id: "firinda_sebzeli_tavuk_sarma", name: "Fırında Sebzeli Tavuk Sarma", category: "ana_et", calories: 300, portion: "1 porsiyon" },
  { id: "firinda_sebzeli_tavuk", name: "Fırında Sebzeli Tavuk", category: "ana_et", calories: 380, portion: "1 porsiyon" },
  { id: "baharatli_tavuk_sis", name: "Baharatlı Tavuk Şiş", category: "ana_et", calories: 270, portion: "1 porsiyon" },
  { id: "tavuk_tantuni", name: "Tavuk Tantuni (Lavaşta)", category: "ana_et", calories: 450, portion: "1 porsiyon" },
  { id: "tavuklu_bezelye", name: "Tavuklu Bezelye", category: "ana_et", calories: 520, portion: "1 porsiyon" },
  { id: "tavuk_doner", name: "Tavuk Döner (Ekmek Arası)", category: "ana_et", calories: 550, portion: "1 porsiyon" },
  { id: "izgara_tavuk_kanat", name: "Izgara Tavuk Kanat", category: "ana_et", calories: 400, portion: "1 porsiyon" },
  { id: "tavuk_but", name: "Tavuk But (Fırın)", category: "ana_et", calories: 450, portion: "1 porsiyon" },
  { id: "tavuklu_saray_sarma", name: "Tavuklu Saray Sarma", category: "ana_et", calories: 380, portion: "1 porsiyon" },
  { id: "tavuk_sote", name: "Tavuk Sote", category: "ana_et", calories: 300, portion: "1 porsiyon" },
  { id: "tavuk_kagit_kebabi", name: "Tavuk Kağıt Kebabı", category: "ana_et", calories: 320, portion: "1 porsiyon" },
  { id: "tavuk_kulbasti_begendi", name: "Tavuk Külbastı ve Beğendi", category: "ana_et", calories: 480, portion: "1 porsiyon" },
  { id: "tavuk_sinitzel", name: "Tavuk Şinitzel (Fırın)", category: "ana_et", calories: 320, portion: "1 porsiyon" },
  { id: "tavuk_fajita", name: "Tavuk Fajita", category: "ana_et", calories: 320, portion: "1 porsiyon" },
  { id: "firin_tavuk_baget", name: "Fırın Tavuk Baget - Sebze", category: "ana_et", calories: 400, portion: "1 porsiyon" },
  { id: "ekmek_arasi_tantuni", name: "Ekmek Arası Tantuni", category: "ana_et", calories: 500, portion: "1 porsiyon" },
  { id: "inegol_kofte", name: "İnegöl Köfte", category: "ana_et", calories: 450, portion: "1 porsiyon" },
  { id: "kadinbudu_kofte", name: "Kadınbudu Köfte", category: "ana_et", calories: 550, portion: "1 porsiyon" },
  { id: "hasanpasa_kofte", name: "Hasanpaşa Köfte", category: "ana_et", calories: 550, portion: "1 porsiyon" },
  { id: "ciftlik_kebabi", name: "Çiftlik Kebabı", category: "ana_et", calories: 400, portion: "1 porsiyon" },
  { id: "sebzeli_kebap", name: "Sebzeli Kebap", category: "ana_et", calories: 500, portion: "1 porsiyon" },
  { id: "tas_kebabi", name: "Tas Kebabı", category: "ana_et", calories: 400, portion: "1 porsiyon" },
  { id: "orman_kebabi", name: "Orman Kebabı", category: "ana_et", calories: 450, portion: "1 porsiyon" },
  { id: "sac_tava", name: "Saç Tava", category: "ana_et", calories: 600, portion: "1 porsiyon" },
  { id: "belen_tava", name: "Belen Tava", category: "ana_et", calories: 650, portion: "1 porsiyon" },
  { id: "hunkar_begendi", name: "Hünkar Beğendi", category: "ana_et", calories: 600, portion: "1 porsiyon" },
  { id: "etli_mevsim_turlusu", name: "Etli Mevsim Türlüsü", category: "ana_et", calories: 350, portion: "1 porsiyon" },
  { id: "et_sote", name: "Et Sote", category: "ana_et", calories: 500, portion: "1 porsiyon" },
  { id: "kofte_izgara", name: "Köfte (Izgara)", category: "ana_et", calories: 400, portion: "1 porsiyon" },
  { id: "kiymali_patates_oturtma", name: "Kıymalı Patates Oturtma", category: "ana_et", calories: 450, portion: "1 porsiyon" },
  { id: "kiymali_yesil_mercimek", name: "Kıymalı Yeşil Mercimek", category: "ana_et", calories: 350, portion: "1 porsiyon" },
  { id: "kiymali_kopoglu", name: "Kıymalı Köpoğlu", category: "ana_et", calories: 300, portion: "1 porsiyon" },
  { id: "kiymali_bezelye", name: "Kıymalı Bezelye", category: "ana_et", calories: 350, portion: "1 porsiyon" },
  { id: "kiymali_semizotu", name: "Kıymalı Semizotu", category: "ana_et", calories: 280, portion: "1 porsiyon" },
  { id: "mantu", name: "Mantı (Yoğurt + Sos)", category: "ana_et", calories: 500, portion: "1 porsiyon" },
  { id: "ispanakli_cilbir", name: "Ispanaklı Çılbır", category: "ana_et", calories: 280, portion: "1 porsiyon" },
  { id: "firinda_kofte", name: "Fırında Köfte", category: "ana_et", calories: 420, portion: "1 porsiyon" },
  { id: "guvec", name: "Güveç", category: "ana_et", calories: 450, portion: "1 porsiyon" },
  { id: "kuzu_tandir", name: "Kuzu Tandır", category: "ana_et", calories: 550, portion: "1 porsiyon" },
  { id: "coban_kavurma", name: "Çoban Kavurma", category: "ana_et", calories: 500, portion: "1 porsiyon" },
  { id: "alman_usulu_patates", name: "Alman Usulü Patates Salatası", category: "ana_et", calories: 350, portion: "1 porsiyon" },

  // ═══ SEBZE YEMEKLERİ ═══
  { id: "kuru_fasulye", name: "Kuru Fasulye", category: "ana_sebze", calories: 400, portion: "1 porsiyon" },
  { id: "patlican_musakka", name: "Patlıcan Musakka", category: "ana_sebze", calories: 400, portion: "1 porsiyon" },
  { id: "barbunya_pilaki", name: "Barbunya Pilaki", category: "ana_sebze", calories: 300, portion: "1 porsiyon" },
  { id: "zeytinyagli_barbunya", name: "Zeytinyağlı Barbunya", category: "ana_sebze", calories: 280, portion: "1 porsiyon" },
  { id: "yesil_mercimek_yemegi", name: "Yeşil Mercimek Yemeği", category: "ana_sebze", calories: 350, portion: "1 porsiyon" },
  { id: "zeytinyagli_pirasa", name: "Zeytinyağlı Pırasa", category: "ana_sebze", calories: 200, portion: "1 porsiyon" },
  { id: "ispanak_graten", name: "Ispanak Graten", category: "ana_sebze", calories: 300, portion: "1 porsiyon" },
  { id: "zeytinyagli_ispanak", name: "Zeytinyağlı Ispanak", category: "ana_sebze", calories: 180, portion: "1 porsiyon" },
  { id: "zeytinyagli_kabak", name: "Zeytinyağlı Kabak", category: "ana_sebze", calories: 150, portion: "1 porsiyon" },
  { id: "zeytinyagli_taze_fasulye", name: "Zeytinyağlı Taze Fasulye", category: "ana_sebze", calories: 180, portion: "1 porsiyon" },
  { id: "zeytinyagli_karisik_kizartma", name: "Zeytinyağlı Karışık Kızartma", category: "ana_sebze", calories: 350, portion: "1 porsiyon" },
  { id: "karnabahar_graten", name: "Karnabahar Graten", category: "ana_sebze", calories: 300, portion: "1 porsiyon" },
  { id: "firinda_sebzeler", name: "Fırında Sebzeler", category: "ana_sebze", calories: 200, portion: "1 porsiyon" },
  { id: "sebze_turlu", name: "Sebze Türlü", category: "ana_sebze", calories: 250, portion: "1 porsiyon" },
  { id: "imam_bayildi", name: "İmam Bayıldı", category: "ana_sebze", calories: 300, portion: "1 porsiyon" },
  { id: "biber_dolmasi", name: "Biber Dolması", category: "ana_sebze", calories: 350, portion: "1 porsiyon" },
  { id: "kabak_dolmasi", name: "Kabak Dolması", category: "ana_sebze", calories: 320, portion: "1 porsiyon" },
  { id: "yaprak_sarmasi", name: "Yaprak Sarması", category: "ana_sebze", calories: 350, portion: "1 porsiyon" },
  { id: "nohut_yemegi", name: "Nohut Yemeği", category: "ana_sebze", calories: 380, portion: "1 porsiyon" },
  { id: "etli_nohut", name: "Etli Nohut", category: "ana_sebze", calories: 450, portion: "1 porsiyon" },
  { id: "sebzeli_patates_oturtma", name: "Sebzeli Patates Oturtma", category: "ana_sebze", calories: 350, portion: "1 porsiyon" },
  { id: "patates_puresi", name: "Patates Püresi", category: "ana_sebze", calories: 200, portion: "1 porsiyon" },
  { id: "elma_dilim_patates", name: "Elma Dilim Patates", category: "ana_sebze", calories: 300, portion: "1 porsiyon" },
  { id: "piyaz", name: "Piyaz", category: "ana_sebze", calories: 350, portion: "1 porsiyon" },
  { id: "zeytinyagli_enginar", name: "Zeytinyağlı Enginar", category: "ana_sebze", calories: 220, portion: "1 porsiyon" },
  { id: "zeytinyagli_kereviz", name: "Zeytinyağlı Kereviz", category: "ana_sebze", calories: 200, portion: "1 porsiyon" },

  // ═══ PİLAVLAR ═══
  { id: "pirinc_pilavi", name: "Pirinç Pilavı", category: "pilav", calories: 280, portion: "1 porsiyon" },
  { id: "sade_pirinc_pilavi", name: "Sade Pirinç Pilavı", category: "pilav", calories: 280, portion: "1 porsiyon" },
  { id: "sebzeli_pirinc_pilavi", name: "Sebzeli Pirinç Pilavı", category: "pilav", calories: 320, portion: "1 porsiyon" },
  { id: "bulgur_pilavi", name: "Bulgur Pilavı", category: "pilav", calories: 270, portion: "1 porsiyon" },
  { id: "siyez_bulgur_pilavi", name: "Siyez Bulgur Pilavı", category: "pilav", calories: 300, portion: "1 porsiyon" },
  { id: "sehriyeli_siyez_bulgur", name: "Şehriyeli Siyez Bulgur Pilavı", category: "pilav", calories: 270, portion: "1 porsiyon" },
  { id: "sebzeli_bulgur_pilavi", name: "Sebzeli Bulgur Pilavı", category: "pilav", calories: 290, portion: "1 porsiyon" },
  { id: "firik_pilavi", name: "Firik Pilavı", category: "pilav", calories: 300, portion: "1 porsiyon" },
  { id: "domatesli_sebzeli_pilav", name: "Domatesli Sebzeli Pilav", category: "pilav", calories: 300, portion: "1 porsiyon" },
  { id: "meyhane_pilavi", name: "Meyhane Pilavı", category: "pilav", calories: 320, portion: "1 porsiyon" },
  { id: "havuclu_arpa_sehriye", name: "Havuçlu Arpa Şehriye Pilavı", category: "pilav", calories: 320, portion: "1 porsiyon" },
  { id: "sehriyeli_pirinc_pilavi", name: "Şehriyeli Pirinç Pilavı", category: "pilav", calories: 300, portion: "1 porsiyon" },
  { id: "ic_pilav", name: "İç Pilav", category: "pilav", calories: 350, portion: "1 porsiyon" },
  { id: "nohutlu_pilav", name: "Nohutlu Pilav", category: "pilav", calories: 320, portion: "1 porsiyon" },
  { id: "sebzeli_siyez_bulgur_pilavi", name: "Sebzeli Siyez Bulgur Pilavı", category: "pilav", calories: 300, portion: "1 porsiyon" },

  // ═══ MAKARNALAR ═══
  { id: "domates_soslu_penne", name: "Domates Soslu Penne Makarna", category: "makarna", calories: 350, portion: "1 porsiyon" },
  { id: "makarna_sade", name: "Makarna (Sade)", category: "makarna", calories: 300, portion: "1 porsiyon" },
  { id: "peynirli_tam_bugday_makarna", name: "Peynirli Tam Buğday Makarna", category: "makarna", calories: 350, portion: "1 porsiyon" },
  { id: "domates_soslu_spagetti", name: "Domates Soslu Tam Buğday Spagetti", category: "makarna", calories: 320, portion: "1 porsiyon" },
  { id: "yogurtlu_makarna", name: "Yoğurtlu Makarna", category: "makarna", calories: 350, portion: "1 porsiyon" },
  { id: "cevizli_eriste", name: "Cevizli Erişte", category: "makarna", calories: 400, portion: "1 porsiyon" },
  { id: "sebzeli_eriste", name: "Sebzeli Erişte", category: "makarna", calories: 320, portion: "1 porsiyon" },
  { id: "peynirli_eriste", name: "Peynirli Erişte", category: "makarna", calories: 320, portion: "1 porsiyon" },
  { id: "domatesli_makarna", name: "Domatesli Makarna", category: "makarna", calories: 350, portion: "1 porsiyon" },
  { id: "firin_makarna", name: "Fırın Makarna", category: "makarna", calories: 380, portion: "1 porsiyon" },

  // ═══ BÖREKLER ═══
  { id: "peynirli_borek", name: "Peynirli Börek", category: "borek", calories: 400, portion: "1 porsiyon" },
  { id: "ispanakli_borek", name: "Ispanaklı Börek", category: "borek", calories: 350, portion: "1 porsiyon" },
  { id: "su_boregi", name: "Su Böreği", category: "borek", calories: 500, portion: "1 porsiyon" },
  { id: "kiymali_borek", name: "Kıymalı Börek", category: "borek", calories: 450, portion: "1 porsiyon" },
  { id: "patatesli_borek", name: "Patatesli Börek", category: "borek", calories: 380, portion: "1 porsiyon" },
  { id: "sigara_boregi", name: "Sigara Böreği", category: "borek", calories: 300, portion: "3 adet" },
  { id: "gozleme", name: "Gözleme", category: "borek", calories: 350, portion: "1 porsiyon" },

  // ═══ SALATALAR ═══
  { id: "mevsim_salatasi", name: "Mevsim Salatası", category: "salata", calories: 50, portion: "1 porsiyon" },
  { id: "mevsim_salatasi_yogurt", name: "Mevsim Salatası (Yoğurtlu)", category: "salata", calories: 80, portion: "1 porsiyon" },
  { id: "akdeniz_salatasi", name: "Akdeniz Salatası", category: "salata", calories: 200, portion: "1 porsiyon" },
  { id: "gavurdagi_salatasi", name: "Gavurdağı Salatası", category: "salata", calories: 200, portion: "1 porsiyon" },
  { id: "meksika_fasulye_salata", name: "Meksika Fasulyeli Salata", category: "salata", calories: 250, portion: "1 porsiyon" },
  { id: "sumakli_sogan_salatasi", name: "Sumaklı Soğan Salatası", category: "salata", calories: 60, portion: "1 porsiyon" },
  { id: "coleslaw_salatasi", name: "Coleslaw Salatası", category: "salata", calories: 180, portion: "1 porsiyon" },
  { id: "cacik", name: "Cacık", category: "salata", calories: 80, portion: "1 porsiyon" },
  { id: "coban_salatasi", name: "Çoban Salatası", category: "salata", calories: 80, portion: "1 porsiyon" },
  { id: "sogus_salatasi", name: "Söğüş Salatası", category: "salata", calories: 50, portion: "1 porsiyon" },
  { id: "yesil_salata", name: "Yeşil Salata", category: "salata", calories: 30, portion: "1 porsiyon" },
  { id: "kis_patates_salatasi", name: "Kış Patates Salatası", category: "salata", calories: 250, portion: "1 porsiyon" },
  { id: "pancar_tursusu", name: "Pancar Turşusu", category: "salata", calories: 50, portion: "1 porsiyon" },
  { id: "karisik_tursu", name: "Karışık Turşu", category: "salata", calories: 20, portion: "1 porsiyon" },
  { id: "yesillik", name: "Yeşillik", category: "salata", calories: 30, portion: "1 porsiyon" },

  // ═══ İÇECEKLER ═══
  { id: "ayran", name: "Ayran", category: "icecek", calories: 60, portion: "1 bardak" },
  { id: "yogurt", name: "Yoğurt", category: "icecek", calories: 120, portion: "1 porsiyon" },
  { id: "az_sekerli_komposto", name: "Az Şekerli Komposto", category: "icecek", calories: 100, portion: "1 porsiyon" },
  { id: "salgam", name: "Şalgam", category: "icecek", calories: 20, portion: "1 bardak" },
  { id: "limonata", name: "Limonata", category: "icecek", calories: 80, portion: "1 bardak" },
  { id: "su", name: "Su", category: "icecek", calories: 0, portion: "1 bardak" },

  // ═══ TATLILAR ═══
  { id: "sutlac", name: "Sütlaç", category: "tatli", calories: 180, portion: "1 porsiyon" },
  { id: "baklava", name: "Baklava (1 Dilim)", category: "tatli", calories: 300, portion: "1 dilim" },
  { id: "kazandibi", name: "Kazandibi", category: "tatli", calories: 220, portion: "1 porsiyon" },
  { id: "keskul", name: "Keşkül", category: "tatli", calories: 180, portion: "1 porsiyon" },
  { id: "supangle", name: "Supangle", category: "tatli", calories: 250, portion: "1 porsiyon" },
  { id: "kek", name: "Kek", category: "tatli", calories: 150, portion: "1 dilim" },
  { id: "dondurma", name: "Dondurma (1 Top)", category: "tatli", calories: 120, portion: "1 top" },
  { id: "revani", name: "Revani", category: "tatli", calories: 280, portion: "1 porsiyon" },
  { id: "trilece", name: "Trileçe", category: "tatli", calories: 300, portion: "1 porsiyon" },
  { id: "profiterol", name: "Profiterol", category: "tatli", calories: 350, portion: "1 porsiyon" },
  { id: "muhallebi", name: "Muhallebi", category: "tatli", calories: 160, portion: "1 porsiyon" },

  // ═══ MEYVELER ═══
  { id: "elma", name: "Elma", category: "meyve", calories: 80, portion: "1 adet" },
  { id: "muz", name: "Muz", category: "meyve", calories: 105, portion: "1 adet" },
  { id: "portakal", name: "Portakal", category: "meyve", calories: 70, portion: "1 adet" },
  { id: "uzum", name: "Üzüm", category: "meyve", calories: 70, portion: "1 porsiyon" },
  { id: "cilek", name: "Çilek", category: "meyve", calories: 30, portion: "1 porsiyon" },
  { id: "karpuz", name: "Karpuz", category: "meyve", calories: 60, portion: "1 dilim" },
  { id: "kavun", name: "Kavun", category: "meyve", calories: 55, portion: "1 dilim" },
  { id: "seftali", name: "Şeftali", category: "meyve", calories: 60, portion: "1 adet" },

  // ═══ DİĞER ═══
  { id: "roll_ekmek_beyaz", name: "Roll Ekmek (Beyaz)", category: "diger", calories: 128, portion: "1 adet" },
  { id: "roll_ekmek_tam_bugday", name: "Roll Ekmek (Tam Buğday)", category: "diger", calories: 123, portion: "1 adet" },
  { id: "ekmek", name: "Ekmek (1 Dilim)", category: "diger", calories: 80, portion: "1 dilim" },
  { id: "tursu", name: "Turşu", category: "diger", calories: 20, portion: "1 porsiyon" },
];

// ─── Food Access Layer ──────────────────
// Merges base foods with custom foods and applies calorie overrides

function getAllFoods() {
  const customFoods = Storage.getCustomFoods();
  const overrides = Storage.getCalorieOverrides();
  const merged = [...BASE_FOODS, ...customFoods].map(f => {
    if (overrides[f.id] !== undefined) {
      return { ...f, calories: overrides[f.id] };
    }
    return f;
  });
  return merged;
}

function getFoodById(id) {
  return getAllFoods().find(f => f.id === id);
}

function getFoodsByCategory(category) {
  return getAllFoods().filter(f => f.category === category).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
}

function searchFoods(query) {
  if (!query || query.trim().length === 0) return [];
  const normalizedQuery = normalizeTurkish(query.toLowerCase().trim());
  const words = normalizedQuery.split(/\s+/);
  const foods = getAllFoods();
  return foods.filter(food => {
    const normalizedName = normalizeTurkish(food.name.toLowerCase());
    return words.every(word => normalizedName.includes(word));
  }).sort((a, b) => {
    const aStarts = normalizeTurkish(a.name.toLowerCase()).startsWith(normalizedQuery);
    const bStarts = normalizeTurkish(b.name.toLowerCase()).startsWith(normalizedQuery);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return a.name.localeCompare(b.name, 'tr');
  });
}

function normalizeTurkish(str) {
  return str
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u').replace(/Ü/g, 'U')
    .replace(/ş/g, 's').replace(/Ş/g, 'S')
    .replace(/ı/g, 'i').replace(/İ/g, 'I')
    .replace(/ö/g, 'o').replace(/Ö/g, 'O')
    .replace(/ç/g, 'c').replace(/Ç/g, 'C');
}

function isCustomFood(id) {
  return Storage.getCustomFoods().some(f => f.id === id);
}

function getOriginalCalories(id) {
  const base = BASE_FOODS.find(f => f.id === id);
  if (base) return base.calories;
  const custom = Storage.getCustomFoods().find(f => f.id === id);
  return custom ? custom.calories : null;
}
