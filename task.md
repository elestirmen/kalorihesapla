# Kalori Hesapla - Geliştirme Task Listesi

## 1. Amaç

Bu belge, `Kalori Hesapla` projesini daha kullanışlı, daha tutarlı ve daha sürdürülebilir hale getirmek için yapılabilecek geliştirmeleri detaylandırır.

Ana hedefler:

1. Otomatik menü oluşturmayı gerçek yemek listesi pratiklerine daha yakın hale getirmek.
2. Haftalık menü planlamayı daha kontrollü ve daha hızlı kullanılabilir yapmak.
3. Kod tabanını yeni özellik eklemeye uygun şekilde sadeleştirmek.
4. Veriyi ileride analiz, içe aktarma ve dışa aktarma için daha zengin bir yapıya taşımak.

## 2. Mevcut Durum Özeti

Proje şu anda:

- Statik bir web uygulaması olarak çalışıyor.
- Veriyi `localStorage` içinde tutuyor.
- Yemekleri temel kategorilere ayırıyor.
- Haftalık planlama, manuel ekleme, favori, içe/dışa aktarma ve Excel çıktısı sunuyor.
- Otomatik doldurma mantığında temel kategori ve kalori hedefi kullanıyor.

Mevcut güçlü yanlar:

- Kurulumu çok kolay.
- Tek dosya yapısına rağmen işlevsel.
- Kullanıcı arayüzü hızlı ve doğrudan kullanılabilir.
- Haftalık planlama mantığı anlaşılır.

Mevcut zayıf yanlar:

- Otomatik doldurma, örnek gerçek menü paternlerini tam olarak yansıtmıyor.
- Yemek veri modeli sadece kategori odaklı; rol bilgisi eksik.
- Tüm uygulama mantığı büyük ölçüde `js/app.js` içinde toplanmış durumda.
- Test altyapısı yok.
- Çok kullanıcılı veya cihazlar arası senaryo düşünülmemiş.

## 3. Ürün Vizyonu

Bu uygulama sadece "kalori hesaplayan basit menü sayfası" olmaktan çıkıp şu kimliğe yaklaşmalı:

"Kurumsal veya yarı kurumsal haftalık yemek planı hazırlamayı kolaylaştıran, örnek geçmiş menülerden öğrenebilen, açıklanabilir ve kontrollü öneri üreten bir menü planlama aracı."

Bu vizyon doğrultusunda sistemin şu sorulara iyi cevap verebilmesi gerekir:

- Bu öğün neden böyle dolduruldu?
- Neden bu yemek bu gün seçildi?
- Aynı desen geçmiş haftalarda nasıl kullanılmış?
- Kullanıcı belirli slotları sabitleyip kalanını otomatik tamamlayabilir mi?
- Belirli yemeklerden kaçınma veya belirli yemekleri tercih etme desteği var mı?

## 4. Önceliklendirilmiş Yol Haritası

### P0 - En Kritik İyileştirmeler

#### 4.1. Yemek veri modelini rol bazlı zenginleştirme

Mevcut sorun:

- Şu an her yemek çoğunlukla tek bir `category` ile tanımlı.
- Oysa otomatik doldurma için kategori yeterli değil.
- Aynı kategori içindeki yemeklerin öğündeki rolü farklı olabiliyor.

Öneri:

Her yemeğe aşağıdaki gibi ek alanlar eklenmeli:

- `mealRole`
- `subRole`
- `tags`
- `isLight`
- `isBreadBased`
- `isSinglePlate`
- `isLegume`
- `isDairyBased`
- `isFreshSide`

Örnek rol grupları:

- `soup`
- `main_meat`
- `main_vegetable`
- `main_legume`
- `main_bread`
- `main_single_plate`
- `side_grain`
- `side_pasta`
- `side_borek`
- `side_potato`
- `side_vegetable`
- `side_salad`
- `side_pickle`
- `side_dairy`
- `side_drink`
- `side_dessert`
- `side_fruit`

Beklenen çıktı:

- Otomatik doldurma artık sadece kategoriye değil, öğün rolüne göre karar verir.
- Veri modelinde hangi yemeğin hangi slot için uygun olduğu açıkça tanımlanır.

Kabul kriterleri:

- Her temel yemek için en az bir `mealRole` tanımlanmış olmalı.
- Yanlış rol verilen mevcut yemekler düzeltilmiş olmalı.
- Otomatik doldurma kodunda kategori bağımlılığı azaltılmalı.

#### 4.2. Otomatik doldurma motorunu kural tabanlı hale getirme

Mevcut sorun:

- Sistem bazı iyileştirmeler alsa da halen "tam açıklanabilir öneri motoru" seviyesinde değil.
- Kullanıcı, öğünün neden o şekilde kurulduğunu anlamıyor.

Öneri:

Otomatik doldurma motoru aşağıdaki yapı ile yeniden kurgulanmalı:

1. Gün tipi seçimi
2. Öğün tipi seçimi
3. Şablon seçimi
4. Slot bazlı rol yerleşimi
5. Kısıt kontrolü
6. Kalori dengelemesi
7. Açıklama üretimi

Örnek kurallar:

- Pazar varsayılan olarak boş bırakılabilir.
- Kurubaklagil ana yemeklerinde pilav veya makarna öncelikli olsun.
- Ekmek arası ana yemeklerde pilav seçilmesin.
- Yoğurtlu/peynirli yan yemek varsa ikinci bir sütlü eşlikçi önceliği düşsün.
- Aynı haftada aynı ana yemek tekrar etmesin.
- Aynı gün öğle ve akşam benzer ana yemek tipi gelmesin.
- Akşam öğünleri öğleye göre daha hafif olma eğiliminde olsun.

Beklenen çıktı:

- Menü önerileri paylaşılan örnek listelere daha çok yaklaşır.
- Menü oluşturma tekrar üretilebilir ve açıklanabilir hale gelir.

Kabul kriterleri:

- En az 10 temel kural merkezi bir yapıdan yönetiliyor olmalı.
- Aynı haftada tekrar kontrolü çalışmalı.
- Kullanıcıya üretim mantığını gösterecek teknik altyapı hazır olmalı.

#### 4.3. Geçmiş menülerden desen öğrenme altyapısı

Mevcut sorun:

- Geçmiş menüler örnek olarak var ama sistem bunları doğrudan öğrenme kaynağı olarak kullanmıyor.

Öneri:

Sisteme şu analiz katmanları eklenmeli:

- Gün bazlı pattern sayımı
- Öğün bazlı pattern sayımı
- Ana yemek ile yan yemek eşleşme frekansı
- Çorba ile ana yemek eşleşme frekansı
- Sık tekrar eden 4-slot dizilimi

Beklenen çıktı:

- "Pazartesi öğle" için en sık görülen desenler çıkarılabilir.
- "Nohut yemeği" geldiğinde en sık eşlik eden yanlar önerilebilir.

Kabul kriterleri:

- Uygulama örnek menü veri setinden frekans üretmeli.
- Bu frekanslar otomatik doldurma puanlamasında kullanılmalı.

### P1 - Kullanıcı Deneyimi İyileştirmeleri

#### 4.4. Slot kilitleme özelliği

Öneri:

- Kullanıcı bir slotu kilitleyebilsin.
- Otomatik doldurma kilitli alanlara dokunmasın.

Kabul kriterleri:

- Öğün bazında tekil slotlar kilitlenebilmeli.
- Hafta doldurma ve gün doldurma kilitli slotları korumalı.

#### 4.5. Slot bazlı yeniden öner

Öneri:

- Kullanıcı sadece bir slotu değiştirmek isteyebilsin.
- "Bu slotu yeniden öner" aksiyonu olmalı.

Kabul kriterleri:

- Çorba, ana yemek, yan, hafif eşlikçi bağımsız yenilenebilmeli.
- Yeni öneri mevcut öğünle uyumlu olmalı.

#### 4.6. Önizleme modunda otomatik doldurma

Öneri:

- Sistem öneriyi önce taslak olarak göstersin.
- Kullanıcı kabul etmeden kalıcı kaydetmesin.

Kabul kriterleri:

- "Öneriyi uygula" ve "iptal et" akışı olmalı.
- Taslak ile mevcut haftanın farkı görülebilmeli.

#### 4.7. Kullanıcı tercihleri ve yasaklar

Öneri:

- "Sevilen yemekler"
- "İstenmeyen yemekler"
- "Sık gelsin"
- "Asla gelmesin"
- "Akşam hafif olsun"
- "Cuma daha klasik olsun"

Kabul kriterleri:

- Tercihler ayarlarda kaydedilmeli.
- Otomatik doldurma bunları puanlamada dikkate almalı.

### P2 - Veri ve Entegrasyon Geliştirmeleri

#### 4.8. Excel menü içe aktarma

Öneri:

- Kullanıcının elindeki yemek listesi tabloları içe alınabilsin.
- Özellikle tarih, gün, öğle ve akşam formatını tanıyabilsin.

Beklenen çıktı:

- Örnek haftalar sisteme kolayca yüklenebilir.
- Pattern motoru için eğitim verisi artar.

Kabul kriterleri:

- En az bir standart tablo düzeni başarıyla parse edilmeli.
- Eşleşmeyen yemek adları için kullanıcıya seçim ekranı sunulmalı.

#### 4.9. Yemek eşanlam ve isim normalizasyonu

Mevcut sorun:

- Aynı yemek farklı yazımlarla gelebilir.

Öneri:

- Normalizasyon katmanı eklenmeli.
- Eşanlam sözlüğü tanımlanmalı.

Örnek:

- `yoğurtlu makarna` ile `yogurtlu makarna`
- `domates soslu tam buğday spagetti` ile benzer varyantlar

Kabul kriterleri:

- İçe aktarma ve arama sonuçları daha sağlam çalışmalı.

#### 4.10. Besin değeri modelini genişletme

Öneri:

- Kalori dışında şu alanlar düşünülebilir:
  - protein
  - karbonhidrat
  - yağ
  - lif
  - alerjen
  - vejetaryen bilgisi
  - mevsimsellik
  - maliyet

Kabul kriterleri:

- Yeni alanlar veri modeline eklendiğinde mevcut uygulama bozulmamalı.

## 5. Teknik Borç ve Mimari İyileştirmeleri

### 5.1. `js/app.js` dosyasını modüllere ayırma

Mevcut sorun:

- Çok büyük tek dosya yapısı bakım maliyetini artırıyor.

Önerilen ayrım:

- `planner.js`
- `autofill.js`
- `food-data.js`
- `food-management.js`
- `export.js`
- `ui.js`
- `stats.js`
- `storage.js`

Kabul kriterleri:

- Ana uygulama dosyası ciddi biçimde küçülmeli.
- Otomatik doldurma mantığı ayrı modülde test edilebilir hale gelmeli.

### 5.2. Test altyapısı kurma

Öneri:

- Basit bir test altyapısı eklenmeli.

Öncelikli test alanları:

- storage normalize işlemleri
- hafta oluşturma mantığı
- otomatik doldurma kural testleri
- pazar boş kalma davranışı
- aynı haftada tekrar kontrolü
- slot kilitleme davranışı

Kabul kriterleri:

- En az temel iş kurallarını güvence altına alan otomatik testler olmalı.

### 5.3. Açıklanabilir öneri kayıtları

Öneri:

- Sistem öneri üretirken hangi kural nedeniyle seçim yaptığını içsel olarak kaydetsin.

Örnek:

- `Ana yemek kurubaklagil olduğu için 3. slotta pilav tercih edildi`
- `Bu öğünde yoğurtlu eşlikçi olduğu için 4. slotta turşu seçildi`

Kabul kriterleri:

- Geliştirici modu veya debug çıktısı ile bu bilgi görülebilmeli.

## 6. Ürünleştirme Fırsatları

### 6.1. Çok cihazlı kullanım

Orta vadede düşünülebilir:

- küçük bir backend
- kullanıcı oturumu
- bulut senkronizasyonu
- yedekleme

### 6.2. Çok kullanıcılı ortak menü yönetimi

Olası senaryo:

- okul
- yurt
- kurum mutfağı
- küçük restoran

Bu durumda gerekli olur:

- kullanıcı rolleri
- onay akışı
- yayınlanan menü versiyonları

### 6.3. Menü arşivi ve raporlama

Öneri:

- geçmiş haftaları raporlayabilme
- belirli yemek kaç kez çıkmış
- aylık kalori ortalaması
- en sık kullanılan ana yemekler

## 7. Önerilen Uygulama Sırası

### Faz 1

- yemek veri modelini rol bazlı genişlet
- otomatik doldurma motorunu kural tabanlı hale getir
- pazar, ekmek arası, kurubaklagil, hafif akşam gibi ana desenleri netleştir

### Faz 2

- slot kilitleme
- slot bazlı yeniden öner
- önizleme modu
- kullanıcı tercihleri

### Faz 3

- örnek menü tablolarını içe aktarma
- geçmiş menü analizleri
- frekans tabanlı öğrenme

### Faz 4

- modüler mimari
- test altyapısı
- açıklanabilir öneri günlükleri

## 8. Hemen Başlanabilecek Somut İşler

İlk sprint için önerilen somut işler:

1. Tüm yemeklere `mealRole` ve `tags` alanı eklenmesi.
2. Otomatik doldurma için merkezi kural yapısının tanımlanması.
3. `ekmek arası`, `kurubaklagil`, `tek tabak`, `hafif akşam` kurallarının netleştirilmesi.
4. `Pazar boş` davranışının ayar yapılabilir hale getirilmesi.
5. Otomatik doldur sonrası öneri özeti gösterilmesi.
6. `app.js` içinden otomatik doldurma kodunun ayrı modüle çıkarılması.

## 9. Karar Bekleyen Konular

Geliştirmeye başlamadan önce netleştirilmesi faydalı olacak noktalar:

- Pazar her zaman boş mu kalacak, yoksa ayarlanabilir mi?
- Akşam öğünü her zaman öğleden hafif mi olmalı?
- Aynı yemek kaç hafta içinde tekrar edebilir?
- Otomatik doldurma ne kadar rastgele, ne kadar deterministik olmalı?
- Kullanıcı sistemin neden bu öneriyi verdiğini ekranda görmek istiyor mu?

## 10. Başarı Ölçütleri

Bu proje iyileştirmeleri başarılı sayılmalıysa şu sonuçlar görülebilmeli:

- Otomatik oluşturulan menüler, gerçek örnek listelere gözle görünür biçimde yaklaşmalı.
- Kullanıcı tek tek çok az müdahaleyle haftalık plan çıkarabilmeli.
- Aynı öğünde anlamsız kombinasyonlar ciddi ölçüde azalmalı.
- Yeni özellik eklemek için büyük tek dosyada riskli değişiklik yapma ihtiyacı düşmeli.
- Kod tabanı test edilebilir ve sürdürülebilir hale gelmeli.

## 11. Codex Yürütme Planı

Bu bölüm, bu belgeyi bir ürün vizyon dokümanı olmaktan çıkarıp doğrudan bir coding agent için uygulanabilir görev sırasına dönüştürmek amacıyla eklenmiştir.

Bu bölümdeki mantık:

- Üstteki bölümler "ne yapılmalı"yı anlatır.
- Bu bölüm ise "hangi sırayla yapılmalı" ve "Codex'e nasıl söylenmeli" kısmını netleştirir.

### 11.1. Codex için genel çalışma kuralları

Codex veya benzeri bir coding agent çalıştırılırken şu kurallar esas alınmalı:

1. Tek seferde tüm projeyi dönüştürmeye çalışma.
2. Her turda tek bir fazı bitir.
3. Kod değişikliği yapmadan önce mevcut dosyaları incele.
4. Mevcut çalışan özellikleri gereksiz yere bozma.
5. UI değişikliği istenmiyorsa önce veri modeli ve iş mantığını düzelt.
6. Her faz sonunda doğrulama yap.
7. Eğer bir faz başka bir faza bağımlıysa sırayı bozma.
8. Kullanıcı açıkça istemedikçe kapsam dışı refactor yapma.

### 11.2. Önerilen uygulama sırası

Bu proje için önerilen gerçek uygulama sırası:

1. Yemek veri modelini rol bazlı zenginleştir.
2. Otomatik doldurma mantığını ayrı bir kurallı motora taşı.
3. Gerçek menü paternlerini ve kısıtları uygula.
4. Kullanıcı kontrol araçlarını ekle.
5. Menü içe aktarma ve geçmiş menü analizini ekle.
6. Kod tabanını modüllere ayır ve test altyapısı kur.

### 11.3. Faz bazlı uygulama planı

#### Faz 1 - Veri modelini hazırlama

Amaç:

- Yemeklerin sadece kategoriyle değil, öğündeki rolüyle tanımlanmasını sağlamak.

Beklenen dosyalar:

- `js/data.js`
- gerekiyorsa `js/app.js`

Bu fazda yapılacak işler:

1. Her yemek için rol sistemi tasarla.
2. Mevcut yemekleri bu role göre etiketle.
3. Yanlış sınıflanmış yemekleri düzelt.
4. Mevcut arama ve listeleme davranışını bozmadan yeni alanları ekle.

Kabul kriterleri:

- Her temel yemek için en az bir rol bilgisi bulunmalı.
- Ana yemek, yan yemek, çorba ve hafif eşlikçi ayrımı kod içinde açık olmalı.
- Uygulama açıldığında mevcut ekranlar bozulmamalı.

#### Faz 2 - Otomatik doldurma motorunu ayırma

Amaç:

- Otomatik doldurmayı büyük UI dosyasından ayırmak ve test edilebilir hale getirmek.

Beklenen dosyalar:

- `js/app.js`
- yeni bir `js/autofill.js` veya benzer modül

Bu fazda yapılacak işler:

1. Mevcut otomatik doldurma kodunu ayır.
2. Yeni modülde saf fonksiyonlar kullan.
3. Hafta doldurma ve gün doldurma aynı çekirdek motoru kullansın.
4. Pazar boş bırakma gibi temel kural davranışlarını koru.

Kabul kriterleri:

- `app.js` içindeki otomatik doldurma kodu küçülmüş olmalı.
- Haftalık ve günlük doldurma halen çalışmalı.
- Yeni motor dışarıdan okunabilir ve geliştirilebilir olmalı.

#### Faz 3 - Gerçek menü paternlerini uygulama

Amaç:

- Paylaşılan örnek yemek listelerine benzeyen sonuçlar üretmek.

Beklenen dosyalar:

- `js/autofill.js`
- `js/data.js`

Bu fazda yapılacak işler:

1. Gün bazlı şablonları tanımla.
2. Kurubaklagil, ekmek arası, tek tabak, hafif akşam gibi desenleri ekle.
3. Slot bazlı kısıt motoru oluştur.
4. Aynı hafta içi tekrar kontrolü ekle.
5. Kalori dengesi ile menü paternini birlikte değerlendir.

Kabul kriterleri:

- Oluşan 4 slotlu öğünler mantıklı görünmeli.
- Ekmek arası yanına pilav gibi zayıf kombinasyonlar belirgin şekilde azalmalı.
- Aynı ana yemek gereksiz tekrar etmemeli.

#### Faz 4 - Kullanıcı kontrol araçları

Amaç:

- Kullanıcının otomatik doldurma üzerinde ince ayar yapabilmesini sağlamak.

Beklenen dosyalar:

- `index.html`
- `css/style.css`
- `js/app.js`
- gerekirse `js/autofill.js`

Bu fazda yapılacak işler:

1. Slot kilitleme ekle.
2. Tek slot yeniden öner özelliği ekle.
3. Önizleme veya taslak doldurma akışı tasarla.
4. Tercih edilen ve istenmeyen yemekler ayarını hazırla.

Kabul kriterleri:

- Kullanıcı tüm haftayı baştan kurmak zorunda kalmadan menüyü ince ayar yapabilmeli.

#### Faz 5 - Geçmiş menüler ve içe aktarma

Amaç:

- Sistemin örnek yemek listelerinden öğrenebilmesi.

Beklenen dosyalar:

- yeni bir `js/import.js` veya benzer modül
- `js/storage.js`
- `js/autofill.js`

Bu fazda yapılacak işler:

1. Excel veya tablo formatı içe aktarımı tasarla.
2. Menü verisini normalize et.
3. Geçmiş menü pattern analizlerini üret.
4. Bu analizleri öneri puanlamasında kullan.

Kabul kriterleri:

- Örnek listeler sisteme veri olarak kazandırılabilmeli.
- Sistem sık eşleşen kombinasyonları kullanabilmeli.

#### Faz 6 - Teknik düzenleme ve test

Amaç:

- Projeyi sürdürülebilir hale getirmek.

Beklenen dosyalar:

- `js/app.js`
- `js/autofill.js`
- `js/data.js`
- test dosyaları

Bu fazda yapılacak işler:

1. Kod modülerliğini artır.
2. Temel iş kuralları için test ekle.
3. Storage ve autofill davranışlarını güvence altına al.
4. Kod içi teknik borçları temizle.

Kabul kriterleri:

- Temel davranışlar testle korunmalı.
- Yeni özellik eklemek daha az riskli hale gelmeli.

### 11.4. Codex'e verilebilecek prompt sırası

Bu bölüm, coding agent ile iteratif çalışırken kullanılabilecek hazır prompt sırasını içerir.

#### Prompt 1 - Veri modeli fazı

Amaç:

- Yemek veri modelini rol bazlı hale getirmek.

Önerilen prompt:

`Bu projede otomatik doldurma mantığını geliştireceğim. Önce sadece veri modeline odaklan. js/data.js dosyasını incele ve mevcut category yapısını bozmadan her yemeğe öğün rolü için kullanılabilecek alanlar ekle. Ana yemek, çorba, kurubaklagil, pilav, makarna, börek, salata, turşu, sütlü eşlikçi, içecek, meyve, tatlı gibi roller net olsun. UI davranışını değiştirme. İş bittiğinde hangi dosyada ne yaptığını ve veri modelinin nasıl kullanılacağını özetle.`

#### Prompt 2 - Autofill motorunu ayırma

Amaç:

- Otomatik doldurma kodunu UI katmanından ayırmak.

Önerilen prompt:

`Şimdi sadece otomatik doldurma kodunu düzenle. Mevcut çalışan davranışı mümkün olduğunca koruyarak bu mantığı app.js içinden çıkar ve ayrı bir modüle taşı. Hafta doldurma ve gün doldurma aynı çekirdek motoru kullansın. UI tarafında sadece bağlantıları güncelle. Faz sonunda sözdizimi ve temel davranış doğrulaması yap.`

#### Prompt 3 - Pattern ve kural motoru

Amaç:

- Gerçek örnek yemek listesi desenlerini kurala dökmek.

Önerilen prompt:

`Otomatik doldurma motorunu gerçek menü paternlerine göre iyileştir. Pazar boş, kurubaklagil + pilav + turşu/cacık, ekmek arası + salata + ayran, etli yemek + pilav/patates + hafif eşlikçi gibi desenleri uygula. Aynı haftada gereksiz tekrarları azalt. Kod değişikliklerinden sonra örnek üretim senaryolarını kontrol et.`

#### Prompt 4 - Kullanıcı kontrol özellikleri

Amaç:

- Kullanıcının önerileri yönetebilmesi.

Önerilen prompt:

`Şimdi UI kontrol araçlarına odaklan. Slot kilitleme, tek slot yeniden önerme ve mümkünse taslak önizleme akışı ekle. Mevcut görünümü bozma, sadece mevcut tasarım dili içinde ilerle. Özellik çalışmasını temel senaryolarla doğrula.`

#### Prompt 5 - Geçmiş menü öğrenme

Amaç:

- Örnek listelerden pattern üretmek.

Önerilen prompt:

`Bu fazda geçmiş menü verisini kullanmaya odaklan. İçe aktarılan veya sağlanan örnek menülerden gün bazlı ve öğün bazlı pattern çıkaran bir yapı ekle. Otomatik doldurma bu patternleri puanlamada kullansın. Gerekirse yeni yardımcı modül oluştur. Açıklayıcı şekilde ne öğrendiğini özetle.`

#### Prompt 6 - Test ve temizlik

Amaç:

- Yapılanları sürdürülebilir hale getirmek.

Önerilen prompt:

`Son aşamada kod tabanını temizle ve kritik davranışlar için test ekle. Özellikle storage, otomatik doldurma kuralları, pazar davranışı ve tekrar kontrolünü güvence altına al. Gereksiz büyük refactor yapma, sadece bakım maliyetini düşüren net düzenlemeler yap.`

### 11.5. Codex için kısa görev şablonu

Gelecekte hızlı başlatmak için şu kısa format kullanılabilir:

1. Amaç
2. Kapsam
3. Dokunulacak dosyalar
4. Kabul kriterleri
5. Doğrulama adımları
6. Yapılmayacaklar

Örnek:

- Amaç: Otomatik doldurmanın kurubaklagil öğünlerinde daha mantıklı seçim yapmasını sağla.
- Kapsam: Sadece autofill motoru ve gerekirse veri etiketi güncellenecek.
- Dokunulacak dosyalar: `js/data.js`, `js/autofill.js`, `js/app.js`
- Kabul kriterleri: Kurubaklagil ana yemeklerde 3. slot çoğunlukla pilav/makarna, 4. slot hafif eşlikçi olsun.
- Doğrulama: Haftalık örnek üretim çıktısını kontrol et.
- Yapılmayacaklar: Yeni tasarım, yeni storage formatı, büyük refactor yok.
