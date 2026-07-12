# Kalori Hesapla - Codex Çalışma Planı

Bu belge, `task.md` içindeki ürün/backlog düşüncelerinden ayrı olarak, doğrudan bir coding agent ile iteratif çalışmak için hazırlanmıştır.

Amaç:

- Codex'e neyin hangi sırayla yaptırılacağını netleştirmek
- Fazları birbirine karıştırmadan ilerlemek
- Her turda ölçülebilir kabul kriterleriyle çalışmak
- Kapsam taşmasını azaltmak

## 1. Genel Çalışma Kuralları

Bu projede Codex çalıştırılırken şu kurallar uygulanmalı:

1. Tek seferde tüm projeyi dönüştürmeye çalışma.
2. Her turda sadece tek bir fazı veya tek bir net hedefi tamamla.
3. Kod değişikliği yapmadan önce mevcut dosyaları incele.
4. Kullanıcı açıkça istemedikçe kapsam dışı refactor yapma.
5. UI istenmiyorsa önce veri modeli ve iş mantığını düzelt.
6. Her faz sonunda doğrulama yap.
7. Mevcut çalışan davranışı gereksiz yere bozma.
8. Bir sonraki faz, önceki fazın çıktısına dayanıyorsa sırayı bozma.

## 2. Uygulama Sırası

Bu proje için önerilen gerçek uygulama sırası:

1. Yemek veri modelini rol bazlı zenginleştir.
2. Otomatik doldurma mantığını ayrı bir kurallı motora taşı.
3. Gerçek menü paternlerini ve kısıtları uygula.
4. Kullanıcı kontrol araçlarını ekle.
5. Menü içe aktarma ve geçmiş menü analizini ekle.
6. Kod tabanını modüllere ayır ve test altyapısı kur.

## 3. Faz Bazlı Plan

### Faz 1 - Veri modelini hazırlama

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

### Faz 2 - Otomatik doldurma motorunu ayırma

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

### Faz 3 - Gerçek menü paternlerini uygulama

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

### Faz 4 - Kullanıcı kontrol araçları

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

### Faz 5 - Geçmiş menüler ve içe aktarma

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

### Faz 6 - Teknik düzenleme ve test

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

## 4. Codex'e Verilebilecek Prompt Sırası

### Prompt 1 - Veri modeli fazı

Amaç:

- Yemek veri modelini rol bazlı hale getirmek.

Önerilen prompt:

`Bu projede otomatik doldurma mantığını geliştireceğim. Önce sadece veri modeline odaklan. js/data.js dosyasını incele ve mevcut category yapısını bozmadan her yemeğe öğün rolü için kullanılabilecek alanlar ekle. Ana yemek, çorba, kurubaklagil, pilav, makarna, börek, salata, turşu, sütlü eşlikçi, içecek, meyve, tatlı gibi roller net olsun. UI davranışını değiştirme. İş bittiğinde hangi dosyada ne yaptığını ve veri modelinin nasıl kullanılacağını özetle.`

### Prompt 2 - Autofill motorunu ayırma

Amaç:

- Otomatik doldurma kodunu UI katmanından ayırmak.

Önerilen prompt:

`Şimdi sadece otomatik doldurma kodunu düzenle. Mevcut çalışan davranışı mümkün olduğunca koruyarak bu mantığı app.js içinden çıkar ve ayrı bir modüle taşı. Hafta doldurma ve gün doldurma aynı çekirdek motoru kullansın. UI tarafında sadece bağlantıları güncelle. Faz sonunda sözdizimi ve temel davranış doğrulaması yap.`

### Prompt 3 - Pattern ve kural motoru

Amaç:

- Gerçek örnek yemek listesi desenlerini kurala dökmek.

Önerilen prompt:

`Otomatik doldurma motorunu gerçek menü paternlerine göre iyileştir. Pazar boş, kurubaklagil + pilav + turşu/cacık, ekmek arası + salata + ayran, etli yemek + pilav/patates + hafif eşlikçi gibi desenleri uygula. Aynı haftada gereksiz tekrarları azalt. Kod değişikliklerinden sonra örnek üretim senaryolarını kontrol et.`

### Prompt 4 - Kullanıcı kontrol özellikleri

Amaç:

- Kullanıcının önerileri yönetebilmesi.

Önerilen prompt:

`Şimdi UI kontrol araçlarına odaklan. Slot kilitleme, tek slot yeniden önerme ve mümkünse taslak önizleme akışı ekle. Mevcut görünümü bozma, sadece mevcut tasarım dili içinde ilerle. Özellik çalışmasını temel senaryolarla doğrula.`

### Prompt 5 - Geçmiş menü öğrenme

Amaç:

- Örnek listelerden pattern üretmek.

Önerilen prompt:

`Bu fazda geçmiş menü verisini kullanmaya odaklan. İçe aktarılan veya sağlanan örnek menülerden gün bazlı ve öğün bazlı pattern çıkaran bir yapı ekle. Otomatik doldurma bu patternleri puanlamada kullansın. Gerekirse yeni yardımcı modül oluştur. Açıklayıcı şekilde ne öğrendiğini özetle.`

### Prompt 6 - Test ve temizlik

Amaç:

- Yapılanları sürdürülebilir hale getirmek.

Önerilen prompt:

`Son aşamada kod tabanını temizle ve kritik davranışlar için test ekle. Özellikle storage, otomatik doldurma kuralları, pazar davranışı ve tekrar kontrolünü güvence altına al. Gereksiz büyük refactor yapma, sadece bakım maliyetini düşüren net düzenlemeler yap.`

## 5. Kısa Görev Şablonu

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
