# 🔊 Rasyonel Evren: Ses Dosyaları ve Efekt Kütüphanesi

Bu dizin, oyunda kullanılan tüm ses efektlerinin yapılandırmasını ve ses mimarisini içerir.

### Neden Web Audio API Sentezleyici Kullanıldı?
1. **%100 Çevrimdışı Çalışma Güvencesi:** Akıllı tahtalarda veya yerel dosya sisteminde (`file://`) çalışırken tarayıcıların harici `.mp3` veya `.wav` dosyalarına uyguladığı CORS/güvenlik kısıtlamalarını tamamen aşar.
2. **Sıfır Yükleme Süresi ve Gecikmesiz Tepki:** Sesler tarayıcının ses çipi tarafından milisaniye gecikmeyle gerçek zamanlı üretilir.
3. **Düşük Bellek Kullanımı:** Sıfır megabayt dosya transferi ile eski nesil Fatih Projesi tahtalarında dahi kasma yapmaz.

---

### 🎵 Ses Efektleri Kataloğu

| Ses Adı | Açıklama | Frekans & Dalga Türü | Tetiklendiği Yer |
| :--- | :--- | :--- | :--- |
| **`click`** | Yumuşak dokunma / pop sesi | 600 Hz Sinüs Dalgası (80ms) | Butonlara, kartlara dokunulduğunda |
| **`correct`** | Başarı melodisi (Do Majör Akoru) | C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz) | Doğru adım, bayrak dikme, doğru sembol |
| **`error`** | Hatalı işlem uyarısı | 200 Hz & 150 Hz Testere Dalgası | Yanlış şık veya yanlış nokta seçildiğinde |
| **`alarm`** | Devir Alarmı | 880 Hz Kare Dalga (Çift Bip) | Bölmede kalan tekrar ettiğinde |
| **`laser`** | Mutlak Değer Lazer Taraması | 880 Hz $\rightarrow$ 220 Hz Frekans Kayması | 0'a olan uzaklık ölçülürken |
| **`tilt`** | Terazi Denge Tıkırtısı | 320 Hz Üçgen Dalga | Terazinin kefeleri eğildiğinde |
| **`fanfare`** | Zafer ve Kutlama Melodisi | 5 Notalı Coşkulu Zafer Akoru | Bölüm veya problem tamamlandığında |

Tüm bu sesler [js/audio.js](file:///Users/izmirinovasyon-3/Desktop/bbbaysalOyun/js/audio.js) dosyasındaki `SoundFX` sınıfı tarafından yönetilmektedir.
