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
- **Kopyala / yapıştır**: Bir günün menüsünü panoya alıp başka bir güne uygulama.
- **Favoriler**: Sık kullanılan yemekleri işaretleme; arama ekranında üstte listelenir.

### Yemek veritabanı ve özelleştirme

- **Yerleşik liste**: `js/data.js` içinde **yüzlerce** Türk yemeği; kategoriler: çorba, et/tavuk, sebze, pilav, makarna, börek, salata, içecek, tatlı, meyve, diğer.
- **Özel yemek**: Ad, kcal, kategori ve porsiyon metni ile kendi kayıtlarınızı ekleme.
- **Kalori düzenleme**: Yerleşik yemeklerde kaloriyi **override** edebilir veya özel yemeklerde doğrudan güncelleyebilirsiniz; override’lar “orijinale dön” ile sıfırlanabilir.

### Dışa aktarma ve yedekleme

- **JSON**: Seçili haftayı `menu_YYYY-MM-DD.json` formatında indirir; içe aktarma ile geri yüklenir. Dışa aktarılan dosyada, menüde kullanılan **özel yemekler** ve ilgili **kalori override**’ları da paketlenir (sürüm 2 şeması).
- **Excel**: `xlsx-js-style` ile **.xlsx** (Plan + Detay sayfaları, biçimlendirme) veya kütüphane yüklenemezse **.xls** (HTML tablo) yedeği.
- **Yazdır**: Tarayıcının yazdırma / PDF kaydetme özelliği.

### Depolama

Tüm kalıcı veri **localStorage** üzerindedir:

| Anahtar | İçerik |
|--------|--------|
| `kalori_haftalik_menuler` | Haftalık menü kayıtları |
| `kalori_ayarlar` | Son açılan hafta, günlük kalori hedefi |
| `kalori_custom_foods` | Özel yemekler |
| `kalori_favorites` | Favori yemek ID’leri |
| `kalori_calorie_overrides` | Yerleşik yemekler için kalori düzeltmeleri |

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
│   ├── app.js          # Menü mantığı, arama, otomatik doldurma, Excel/JSON
│   ├── data.js         # FOOD_CATEGORIES, BASE_FOODS, arama yardımcıları
│   ├── storage.js      # Storage API, hafta normalizasyonu, import/export
│   ├── xlsx-js-style.min.js
│   └── xlsx-js-style.LICENSE.txt
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
6. Yedek için **Dışa Aktar (JSON)**; paylaşım veya başka cihaz için **İçe Aktar**.

## Klavye kısayolları

- Arama paneli açıkken **Escape** ile kapanır.
- Arama sonuçlarında **ok tuşları** ve **Enter** ile seçim (uygulama içi davranış).

## Önemli notlar

- **Kalori değerleri** referans amaçlıdır; pişirme yöntemi, marka ve porsiyon farklılıklarına göre değişir. Tıbbi veya diyet uzmanlığı gerektiren durumlarda profesyonel destek alın.
- Uygulama **çevrimdışı** çalışabilir (sayfa ve scriptler yüklendikten sonra); harici API çağrısı yoktur.

## Katkı ve geliştirme

- Yeni yemekler `js/data.js` içindeki `BASE_FOODS` dizisine, mevcut `id` ve `category` sözleşmesine uygun eklenebilir.
- Hafta kimliği `YYYY-Www` (ISO hafta numarası) formatındadır; `storage.js` içindeki normalizasyon bunu zorunlu kılar.

## Lisans

Proje kod tabanı için depoda ayrı bir lisans dosyası yoksa, kullanım koşulları depo sahibi tarafından belirlenmelidir. **xlsx-js-style** bileşeni için `js/xlsx-js-style.LICENSE.txt` dosyasına bakın.
