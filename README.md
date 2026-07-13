# Kalori Hesapla

Haftalık yemek menüsü planlama ve porsiyon bazlı kalori takibi yapan, tarayıcıda çalışan tek sayfalık bir uygulamadır. Türk mutfağına yönelik geniş bir yemek listesi ve günlük kalori hedefiyle öğün öğün takip sunar; veriler sunucuya gönderilmez, cihazınızda saklanır.

## Özellikler

### Menü planlama

- **Haftalık görünüm**: Hafta Pazartesi’den başlar; önceki / sonraki hafta ve tarih seçici ile gezinme.
- **Öğün yapısı**: Her gün için **öğle** ve **akşam**; her öğünde **4 yemek slotu** (çorba, ana yemek, yan ürün vb. için uygun).
- **Kalori hesabı**: Her yemek için tanımlı porsiyon başına kcal; slot başına **0,5x / 1x / 1,5x / 2x** porsiyon döngüsü.
- **İstatistikler**: Haftalık toplam kcal, günlük ortalama (sadece yemek girilmiş günlere göre), öğün ve yemek sayısı.
- **Günlük hedef**: 500–5000 kcal aralığında ayarlanabilir; gün kartında hedefe göre yüzde ve renkli ilerleme çubuğu.
- **Otomatik doldurma**: Haftanın tamamı veya tek bir gün için, Türk mutfağına uygun örnek şablonlarla (gün ve öğüne göre değişen desenler) menü önerisi. **Pazar** günü örnek düzende bilinçli olarak boş bırakılır.
- **Alerjen tercihleri**: AB’nin 14 ana alerjen grubu için kaçınma tercihleri; tarife göre bulunabilecek alerjen, çapraz temas uyarısı ve bilinmeyen profil davranışları ayrı ayrı ayarlanabilir.
- **Alerjen filtreli otomatik doldurma**: Tercihlerle çakışan veya ayara göre bilgisi bilinmeyen kayıtlar aday havuzuna alınmaz. Uygun aday yoksa slot boş bırakılır; kısıtlamalar otomatik gevşetilmez.
- **Kopyala / yapıştır**: Bir günün menüsünü panoya alıp başka bir güne uygulama.
- **Favoriler**: Sık kullanılan yemekleri işaretleme; arama ekranında üstte listelenir.

### Yemek veritabanı ve özelleştirme

- **Yerleşik liste**: `js/data.js` içinde **yüzlerce** Türk yemeği; kategoriler: çorba, et/tavuk, sebze, pilav, makarna, börek, salata, içecek, tatlı, meyve, diğer.
- **Özel yemek**: Ad, kcal, kategori ve porsiyon metni ile kendi kayıtlarınızı ekleme.
- **Kalori düzenleme**: Yerleşik yemeklerde kaloriyi **override** edebilir veya özel yemeklerde doğrudan güncelleyebilirsiniz; override’lar “orijinale dön” ile sıfırlanabilir.
- **Alerjen profilleri**: Her kayıtta `contains`, `possibleContains`, `mayContain`, `status` ve `note` alanları bulunur. Özel yemeklerin profili kendi kaydında tutulur; yerleşik yemek düzenlemeleri ayrı bir override kaydına yazılır ve kaynak profile döndürülebilir.
- **Yemek yönetimi ve arama**: Kısa rozetler, profil durumu, alerjen filtresi ve kullanıcı tercihiyle çakışma işareti gösterilir. Manuel seçimde çakışma veya bilinmeyen profil için onay istenir.

### Dışa aktarma ve yedekleme

- **JSON**: Seçili haftayı `menu_YYYY-MM-DD.json` formatında indirir; içe aktarma ile geri yüklenir. Sürüm 3 şeması, yalnızca kullanılan özel yemekleri, kalori override’larını ve yerleşik alerjen override’larını içerir. Eski sürüm 1/2 dosyaları da içe aktarılabilir.
- **Excel**: Menü Planlama başlığındaki görünür **Excel'e Aktar** düğmesiyle indirilir. İlk **Plan** sayfası duvara asılabilecek altı sütunlu haftalık görünüm olarak düzenlenir; yemek kalorileri, öğün toplamları, günlük toplamlar ve kısa alerjen uyarıları aynı satırda okunur. Filtrelenebilir **Alerjenler** ve **Detay** sayfaları kapsamlı denetim bilgilerini korur. Kesin içerik, tarif değişkenliği, çapraz temas, bilinmeyen profil ve tercih çakışmaları metin ve ayrı uyarı renkleriyle gösterilir. Kütüphane yüklenemezse aynı sade görünümü koruyan HTML tabanlı **.xls** yedeği oluşturulur.
- **Teknik alerjen kodları**: Arayüz ve Excel çıktılarında Türkçe alerjen adlarının yanında `milk`, `egg`, `gluten_cereals` gibi kararlı uygulama kodları gösterilir. Bu anahtarlar uygulama içi veri kodlarıdır; resmî AB sınıflandırmasının yerine geçmez.
- **Yardım menüsü**: Üst başlıktaki **Yardım** düğmesi; yemek ve kalori yönetimi, haftalık menü hazırlama, alerjen girişi, Excel/yazdırma ve JSON yedekleme adımlarını uygulama içinde açıklar.
- **Tam veri yedeği**: Üst başlıktaki **Yedek** menüsü bütün haftaları, özel yemekleri, kalori ve alerjen düzenlemelerini, favorileri ve cihaz ayarlarını tek bir JSON dosyasında dışa aktarır. Dosya başka bir bilgisayarda aynı menüden geri yüklenebilir; içe aktarma mevcut kayıtlarla birleşir ve aynı kimlikteki haftalarda yedek sürümü kullanılır.
- **Yazdır**: Tarayıcının yazdırma / PDF kaydetme özelliği; yemek kartlarında alerjen göstergeleri ve tercih çakışmaları görünür.

### Depolama

Tüm kalıcı veri **localStorage** üzerindedir:

| Anahtar | İçerik |
|--------|--------|
| `kalori_haftalik_menuler` | Haftalık menü kayıtları |
| `kalori_ayarlar` | Son açılan hafta, günlük kalori hedefi ve alerjen tercihleri |
| `kalori_custom_foods` | Özel yemekler |
| `kalori_favorites` | Favori yemek ID’leri |
| `kalori_calorie_overrides` | Yerleşik yemekler için kalori düzeltmeleri |
| `kalori_allergen_overrides` | Yerleşik yemekler için kullanıcı alerjen profili düzenlemeleri |

Tarayıcı verilerini temizlerseniz bu kayıtlar silinir; yedek için düzenli **JSON dışa aktarma** önerilir.

## Teknolojiler

- **HTML5**, **CSS3**, **Vanilla JavaScript** (derleme veya paket yöneticisi yok).
- **localStorage** (istemci tarafı kalıcılık).
- **SheetJS / xlsx-js-style** (`js/xlsx-js-style.min.js`) — Excel üretimi. Lisans: `js/xlsx-js-style.LICENSE.txt`.

## Proje yapısı

```
kalorihesapla/
├── index.html          # Ana sayfa, sekmeler, şablon
├── css/
│   └── style.css       # Arayüz stilleri
├── js/
│   ├── allergens.js     # AB 14 kataloğu, profiller, normalizasyon ve doğrulama
│   ├── app.js          # Menü mantığı, arama, otomatik doldurma, Excel/JSON
│   ├── data.js         # FOOD_CATEGORIES, BASE_FOODS, arama yardımcıları
│   ├── storage.js      # Storage API, hafta normalizasyonu, import/export
│   ├── xlsx-js-style.min.js
│   └── xlsx-js-style.LICENSE.txt
├── tests/
│   ├── allergens.test.html # Tarayıcıda çalışan alerjen regresyon testleri
│   └── allergens.test.js
└── README.md
```

## Çalıştırma

Uygulama statik dosyalardan oluşur. `index.html` dosyasını doğrudan dosya sisteminden açmak bazı tarayıcılarda `localStorage` veya modül güvenlik kısıtlarına takılabilir; **yerel bir HTTP sunucusu** kullanmanız önerilir.

Örnek (Python 3):

```bash
cd /path/to/kalorihesapla
python3 -m http.server 8080
```

Tarayıcıda `http://localhost:8080` adresine gidin.

Alternatif olarak Node.js ile:

```bash
npx --yes serve .
```

## Kullanım özeti

1. **Menü Planlama** sekmesinde haftayı seçin; boş slota tıklayarak yemek arayın veya kategoriye göz atın.
2. Porsiyon düğmesiyle çarpanı değiştirin; yıldız ile favori ekleyin veya ✕ ile slotu boşaltın.
3. Üst bardan **Otomatik Doldur** veya gün kartındaki **Doldur** ile örnek menü üretin; **Temizle** ile haftayı sıfırlayın.
4. **Kayıtlı** menüsünden geçmiş haftalara geçin veya silin; **Yeni Hafta** ile bugünün haftasına geçiş.
5. **Yemek Yönetimi** sekmesinde arama, kategori filtresi, yeni yemek ekleme ve kalori düzenleme.
6. Menü Planlama ekranındaki **Alerjen Tercihleri** bölümünden kaçındığınız grupları ve otomatik menü kurallarını seçin.
7. Yemek Yönetimi ekranından yerleşik veya özel yemeklerin alerjen profilini düzenleyin; yerleşik kayıtta gerekirse kaynak profile dönün.
8. Yedek için **Dışa Aktar (JSON)**; paylaşım veya başka cihaz için **İçe Aktar**.

## Klavye kısayolları

- Arama paneli açıkken **Escape** ile kapanır.
- Arama sonuçlarında **ok tuşları** ve **Enter** ile seçim (uygulama içi davranış).

## Önemli notlar

- **Kalori değerleri** referans amaçlıdır; pişirme yöntemi, marka ve porsiyon farklılıklarına göre değişir. Tıbbi veya diyet uzmanlığı gerektiren durumlarda profesyonel destek alın.
- **Alerjen bilgileri** genel bilgilendirme amaçlıdır. Tarifler, kullanılan ürünler ve hazırlama koşulları değişebilir. Ciddi alerjisi bulunan kullanıcılar malzeme listesini, ürün etiketini ve çapraz temas riskini ayrıca kontrol etmelidir.
- `contains`, incelenen tarifte veya ürün kimliğinde bilinen alerjenleri; `possibleContains`, tarif veya hazırlama değişkenliğine bağlı olabilecek alerjenleri; `mayContain` ise yalnızca üretim ya da mutfak kaynaklı çapraz temas uyarılarını ifade eder. Tarif belirsizliği `mayContain` olarak kaydedilmez.
- `status: "unknown"` olan kayıtta boş diziler, kayıtlı bir alerjen bilgisi olmadığı anlamına gelmez. Bu kayıtlar varsayılan olarak otomatik menüden çıkarılır; kullanıcı ayarından bu davranışı değiştirebilir.
- Yerleşik profiller genel yemek tanımına dayanır; profesyonel tarif, ürün etiketi veya üretim hattı doğrulamasının yerine geçmez.
- Uygulama **çevrimdışı** çalışabilir (sayfa ve scriptler yüklendikten sonra); harici API çağrısı yoktur.

## Katkı ve geliştirme

- Yeni yemekler `js/data.js` içindeki `BASE_FOODS` dizisine, mevcut `id` ve `category` sözleşmesine uygun eklenebilir.
- Yerleşik alerjen profilleri `js/allergens.js` içindeki `FOOD_ALLERGEN_PROFILES` eşlemesinde tutulur; kaynak `BASE_FOODS` kayıtlarına eklenmez.
- `tests/allergens.test.html` yerel HTTP sunucusunda açılarak normalizasyon, localStorage, JSON ve Excel çıktı regresyonları çalıştırılabilir.
- Hafta kimliği `YYYY-Www` (ISO hafta numarası) formatındadır; `storage.js` içindeki normalizasyon bunu zorunlu kılar.

## Lisans

Proje kod tabanı için depoda ayrı bir lisans dosyası yoksa, kullanım koşulları depo sahibi tarafından belirlenmelidir. **xlsx-js-style** bileşeni için `js/xlsx-js-style.LICENSE.txt` dosyasına bakın.
