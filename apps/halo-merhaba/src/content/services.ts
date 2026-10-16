import type { Locale } from "@/lib/i18n";
import source from "./launch-catalog.json";
import type { LocalText } from "./catalog";
export type LeadKind =
  | "marriage"
  | "documents"
  | "translation"
  | "interpreter"
  | "consultation"
  | "course"
  | "precheck"
  | "product_interest";
export type Service = {
  slug: string;
  kind: Exclude<LeadKind, "product_interest">;
  icon: string;
  name: LocalText;
  short: LocalText;
  audience: LocalText;
  problem: LocalText;
  help: Record<Locale, string[]>;
  cta: LocalText;
  limitations: LocalText;
  seoTitle: LocalText;
  whatsappCta: LocalText;
  provisionalPrice?: number;
};
export const services: Service[] = [
  {
    slug: "menikah-di-turkiye",
    kind: "marriage",
    icon: "rings",
    name: {
      id: "Menikah di Türkiye",
      tr: "Türkiye’de evlilik",
      en: "Menikah di Türkiye",
    },
    short: {
      id: "Bingung memulai persiapan pernikahan di Türkiye? Kami membantu menata rencana, dokumen, dan kebutuhan komunikasi Anda.",
      tr: "Türkiye’de evlilik hazırlığına nereden başlayacağınızı mı düşünüyorsunuz? Planınızı, belgelerinizi ve iletişim ihtiyacınızı düzenlemenize yardımcı oluyoruz.",
      en: "Bingung memulai persiapan pernikahan di Türkiye? Kami membantu menata rencana, dokumen, dan kebutuhan komunikasi Anda.",
    },
    audience: {
      id: "WNI dan pasangan yang berencana menikah di Türkiye serta ingin mempersiapkan proses dengan lebih terarah.",
      tr: "Türkiye’de evlenmeyi planlayan ve hazırlık sürecini daha anlaşılır hale getirmek isteyen Endonezya vatandaşları ve çiftler.",
      en: "WNI dan pasangan yang berencana menikah di Türkiye serta ingin mempersiapkan proses dengan lebih terarah.",
    },
    problem: {
      id: "Informasi dari keluarga, media sosial, dan instansi bisa terasa berbeda. Anda mungkin belum tahu urutan persiapan, dokumen yang perlu dikonfirmasi, atau cara menyampaikan pertanyaan dalam bahasa Turki.",
      tr: "Aileden, sosyal medyadan ve kurumlardan gelen bilgiler farklı görünebilir. Hazırlık sırası, teyit edilecek belgeler veya Türkçe soru sorma konusunda desteğe ihtiyaç duyabilirsiniz.",
      en: "Informasi dari keluarga, media sosial, dan instansi bisa terasa berbeda. Anda mungkin belum tahu urutan persiapan, dokumen yang perlu dikonfirmasi, atau cara menyampaikan pertanyaan dalam bahasa Turki.",
    },
    help: {
      id: [
        "Menyusun rencana persiapan berdasarkan situasi pasangan",
        "Mengorganisasi daftar dokumen dan pertanyaan untuk instansi terkait",
        "Membantu koordinasi kebutuhan dokumen dan terjemahan sesuai cakupan yang disepakati",
        "Membantu komunikasi Indonesia–Türkiye dan membahas kebutuhan interpreter bila diperlukan",
      ],
      tr: [
        "Çiftin durumuna göre hazırlık planını düzenleme",
        "Belge listesini ve ilgili kuruma yöneltilecek soruları toparlama",
        "Kararlaştırılan kapsamda belge ve çeviri ihtiyacını koordine etme",
        "Endonezce–Türkçe iletişime destek olma ve gerekirse tercüman ihtiyacını görüşme",
      ],
      en: [],
    },
    cta: {
      id: "Ceritakan rencana pernikahan Anda",
      tr: "Evlilik planınızı anlatın",
      en: "Ceritakan rencana pernikahan Anda",
    },
    limitations: {
      id: "Persyaratan pernikahan dapat berbeda menurut kewarganegaraan, kota, kondisi pasangan, dan instansi yang menangani. Selalu lakukan verifikasi akhir kepada instansi resmi terkait.",
      tr: "Evlilik şartları vatandaşlığa, şehre, çiftin durumuna ve işlemi yürüten kuruma göre değişebilir. Son teyidi her zaman ilgili resmi kurumdan alın.",
      en: "Persyaratan pernikahan dapat berbeda menurut kewarganegaraan, kota, kondisi pasangan, dan instansi yang menangani. Selalu lakukan verifikasi akhir kepada instansi resmi terkait.",
    },
    seoTitle: {
      id: "Menikah di Turki untuk WNI: Dukungan Persiapan",
      tr: "Endonezya Vatandaşları için Türkiye’de Evlilik Hazırlığı",
      en: "Menikah di Turki untuk WNI: Dukungan Persiapan",
    },
    whatsappCta: {
      id: "Tanya persiapan pernikahan",
      tr: "Evlilik hazırlığını sor",
      en: "Tanya persiapan pernikahan",
    },
  },
  {
    slug: "dokumen",
    kind: "documents",
    icon: "file",
    name: {
      id: "Dokumen & Persiapan Berkas",
      tr: "Belge ve dosya hazırlığı",
      en: "Dokumen & Persiapan Berkas",
    },
    short: {
      id: "Belum yakin berkas mana yang sudah siap? Kami membantu menyusun daftar, menandai hal yang perlu dicek, dan merencanakan langkah berikutnya.",
      tr: "Hangi belgelerin hazır olduğundan emin değil misiniz? Listeyi düzenlemenize, kontrol edilecek noktaları ayırmanıza ve sonraki adımı planlamanıza yardımcı oluyoruz.",
      en: "Belum yakin berkas mana yang sudah siap? Kami membantu menyusun daftar, menandai hal yang perlu dicek, dan merencanakan langkah berikutnya.",
    },
    audience: {
      id: "Anda yang menyiapkan dokumen untuk kebutuhan Indonesia–Türkiye dan ingin mengelola berkas dengan lebih rapi.",
      tr: "Endonezya–Türkiye işlemleri için belge hazırlayan ve dosyasını daha düzenli yönetmek isteyenler.",
      en: "Anda yang menyiapkan dokumen untuk kebutuhan Indonesia–Türkiye dan ingin mengelola berkas dengan lebih rapi.",
    },
    problem: {
      id: "Daftar dokumen, terjemahan, dan pertanyaan tentang apostille sering bercampur. Yang dibutuhkan adalah gambaran jelas tentang berkas yang ada dan hal yang harus ditanyakan kepada instansi penerima.",
      tr: "Belge listesi, çeviri ve apostil soruları birbirine karışabilir. Elinizdeki belgeleri ve alıcı kuruma sorulacak konuları netleştirmek hazırlığı kolaylaştırır.",
      en: "Daftar dokumen, terjemahan, dan pertanyaan tentang apostille sering bercampur. Yang dibutuhkan adalah gambaran jelas tentang berkas yang ada dan hal yang harus ditanyakan kepada instansi penerima.",
    },
    help: {
      id: [
        "Mengorganisasi daftar dokumen berdasarkan informasi dari instansi terkait",
        "Meninjau kelengkapan secara praktis berdasarkan penjelasan awal Anda",
        "Menyusun pertanyaan yang perlu dikonfirmasi kepada instansi penerima",
        "Mengoordinasikan kebutuhan terjemahan atau pertanyaan terkait apostille bila relevan",
      ],
      tr: [
        "İlgili kurumun verdiği bilgiye göre belge listesini düzenleme",
        "İlk açıklamanıza göre pratik açıdan eksik görünenleri belirleme",
        "Alıcı kuruma teyit ettirilecek soruları hazırlama",
        "Gerektiğinde çeviri ihtiyacını veya apostil sorularını koordine etme",
      ],
      en: [],
    },
    cta: {
      id: "Bahas dokumen Anda",
      tr: "Belgelerinizi görüşelim",
      en: "Bahas dokumen Anda",
    },
    limitations: {
      id: "Dukungan ini bukan validasi hukum atau persetujuan pemerintah. Kelengkapan dan penerimaan akhir dokumen harus dikonfirmasi kepada instansi yang berwenang.",
      tr: "Bu destek hukuki geçerlilik incelemesi veya kamu onayı değildir. Belgelerin yeterliliğini ve kabulünü yetkili kurum teyit etmelidir.",
      en: "Dukungan ini bukan validasi hukum atau persetujuan pemerintah. Kelengkapan dan penerimaan akhir dokumen harus dikonfirmasi kepada instansi yang berwenang.",
    },
    seoTitle: {
      id: "Dokumen Indonesia–Turki: Dukungan Persiapan Berkas",
      tr: "Endonezya–Türkiye Belge Hazırlığı",
      en: "Dokumen Indonesia–Turki: Dukungan Persiapan Berkas",
    },
    whatsappCta: {
      id: "Tanya tentang dokumen",
      tr: "Belge desteğini sor",
      en: "Tanya tentang dokumen",
    },
  },
  {
    slug: "terjemahan",
    kind: "translation",
    icon: "language",
    name: {
      id: "Terjemahan Indonesia ↔ Türkçe",
      tr: "Endonezce ↔ Türkçe çeviri",
      en: "Terjemahan Indonesia ↔ Türkçe",
    },
    short: {
      id: "Perlu menerjemahkan dokumen atau tulisan Indonesia–Turki? Jelaskan jenis, jumlah halaman, dan tenggat untuk membahas layanan yang sesuai.",
      tr: "Endonezce–Türkçe belge veya metin çevirisi mi gerekiyor? Uygun desteği görüşmek için türünü, sayfa sayısını ve istediğiniz süreyi belirtin.",
      en: "Perlu menerjemahkan dokumen atau tulisan Indonesia–Turki? Jelaskan jenis, jumlah halaman, dan tenggat untuk membahas layanan yang sesuai.",
    },
    audience: {
      id: "Perorangan atau organisasi yang membutuhkan terjemahan dokumen pribadi, dokumen terkait pernikahan, korespondensi, atau materi tertulis umum.",
      tr: "Kişisel belgeler, evlilikle ilgili evrak, yazışmalar veya genel metinler için çeviri ihtiyacı olan kişiler ve kuruluşlar.",
      en: "Perorangan atau organisasi yang membutuhkan terjemahan dokumen pribadi, dokumen terkait pernikahan, korespondensi, atau materi tertulis umum.",
    },
    problem: {
      id: "Kebutuhan terjemahan berbeda menurut tujuan penggunaan dan instansi penerima. Bahasa, jenis dokumen, jumlah halaman, serta tenggat membantu menentukan cakupan sebelum penawaran diberikan.",
      tr: "Çeviri ihtiyacı kullanım amacına ve alıcı kuruma göre değişir. Kaynak/hedef dil, belge türü, sayfa sayısı ve süre teklif öncesinde kapsamı netleştirir.",
      en: "Kebutuhan terjemahan berbeda menurut tujuan penggunaan dan instansi penerima. Bahasa, jenis dokumen, jumlah halaman, serta tenggat membantu menentukan cakupan sebelum penawaran diberikan.",
    },
    help: {
      id: [
        "Membahas bahasa sumber dan tujuan untuk dokumen praktis Indonesia–Türkiye",
        "Meninjau jenis dokumen, perkiraan halaman, dan tenggat yang Anda inginkan",
        "Mengklarifikasi apakah instansi penerima meminta jenis terjemahan resmi tertentu",
        "Untuk kebutuhan tertentu, Halo Merhaba dapat mengoordinasikan penerjemahan melalui penerjemah yang sesuai",
      ],
      tr: [
        "Endonezya–Türkiye belgelerinde kaynak ve hedef dili belirleme",
        "Belge türünü, yaklaşık sayfa sayısını ve istediğiniz süreyi değerlendirme",
        "Alıcı kurumun belirli bir resmi çeviri türü isteyip istemediğini netleştirme",
        "Bazı ihtiyaçlarda uygun çevirmen aracılığıyla çeviriyi koordine etme",
      ],
      en: [],
    },
    cta: {
      id: "Minta penawaran terjemahan",
      tr: "Çeviri teklifi isteyin",
      en: "Minta penawaran terjemahan",
    },
    limitations: {
      id: "Terjemahan tersumpah atau bersertifikat tidak diasumsikan tersedia. Konfirmasikan jenis terjemahan yang diterima kepada instansi tujuan; cakupan, penyedia, biaya, dan tenggat disepakati terlebih dahulu.",
      tr: "Yeminli veya onaylı çevirinin mevcut olduğu varsayılmamalıdır. Kabul edilen çeviri türünü alıcı kurumdan teyit edin; kapsam, sağlayıcı, ücret ve süre önceden kararlaştırılır.",
      en: "Terjemahan tersumpah atau bersertifikat tidak diasumsikan tersedia. Konfirmasikan jenis terjemahan yang diterima kepada instansi tujuan; cakupan, penyedia, biaya, dan tenggat disepakati terlebih dahulu.",
    },
    seoTitle: {
      id: "Terjemahan Indonesia–Turki: Permintaan Penawaran",
      tr: "Endonezce–Türkçe Çeviri Teklifi",
      en: "Terjemahan Indonesia–Turki: Permintaan Penawaran",
    },
    whatsappCta: {
      id: "Tanya kebutuhan terjemahan",
      tr: "Çeviri ihtiyacını sor",
      en: "Tanya kebutuhan terjemahan",
    },
  },
  {
    slug: "interpreter",
    kind: "interpreter",
    icon: "chat",
    name: {
      id: "Interpreter",
      tr: "Sözlü tercüman desteği",
      en: "Interpreter",
    },
    short: {
      id: "Ingin percakapan lintas bahasa lebih mudah dipahami? Bahas dukungan interpreter untuk pertemuan keluarga, konsultasi, atau janji temu.",
      tr: "İki dil arasındaki konuşmayı daha rahat anlamak mı istiyorsunuz? Aile görüşmesi, danışma veya randevu için sözlü tercüman ihtiyacınızı görüşelim.",
      en: "Ingin percakapan lintas bahasa lebih mudah dipahami? Bahas dukungan interpreter untuk pertemuan keluarga, konsultasi, atau janji temu.",
    },
    audience: {
      id: "Anda yang membutuhkan bantuan komunikasi lisan Indonesia–Turki, secara online atau tatap muka sesuai ketersediaan layanan.",
      tr: "Hizmetin uygunluğuna göre çevrimiçi veya yüz yüze Endonezce–Türkçe sözlü iletişim desteği arayanlar.",
      en: "Anda yang membutuhkan bantuan komunikasi lisan Indonesia–Turki, secara online atau tatap muka sesuai ketersediaan layanan.",
    },
    problem: {
      id: "Pertemuan keluarga, pembicaraan pernikahan, konsultasi, dan janji temu dapat menjadi sulit ketika kedua pihak menggunakan bahasa berbeda. Interpreter membantu komunikasi lisan; layanan ini berbeda dari penerjemahan dokumen tertulis.",
      tr: "Aile ve evlilik görüşmeleri, danışmalar ve randevular iki taraf farklı dil konuştuğunda zorlaşabilir. Tercüman sözlü iletişime destek olur; bu hizmet yazılı belge çevirisinden farklıdır.",
      en: "Pertemuan keluarga, pembicaraan pernikahan, konsultasi, dan janji temu dapat menjadi sulit ketika kedua pihak menggunakan bahasa berbeda. Interpreter membantu komunikasi lisan; layanan ini berbeda dari penerjemahan dokumen tertulis.",
    },
    help: {
      id: [
        "Memahami topik pertemuan dan bahasa yang dibutuhkan",
        "Membahas komunikasi keluarga, konsultasi, atau janji temu Indonesia–Türkiye",
        "Mencatat pilihan online atau tatap muka, kota/negara, tanggal, dan perkiraan durasi",
        "Mengonfirmasi kecocokan penyedia, cakupan, dan ketersediaan sebelum kesepakatan",
      ],
      tr: [
        "Görüşme konusunu ve gerekli dilleri anlama",
        "Aile iletişimi, danışma veya Endonezya–Türkiye randevularını görüşme",
        "Çevrimiçi/yüz yüze tercihini, şehir/ülke, tarih ve yaklaşık süreyi kaydetme",
        "Anlaşma öncesinde uygun sağlayıcıyı, kapsamı ve müsaitliği teyit etme",
      ],
      en: [],
    },
    cta: {
      id: "Cek kebutuhan interpreter",
      tr: "Tercüman ihtiyacını görüşün",
      en: "Cek kebutuhan interpreter",
    },
    limitations: {
      id: "Ketersediaan interpreter dan penerimaan pendamping pada suatu instansi perlu dikonfirmasi. Dukungan komunikasi tidak menjamin hasil pertemuan atau keputusan instansi.",
      tr: "Tercümanın müsaitliği ve ilgili kurumun refakatçi kabulü teyit edilmelidir. İletişim desteği görüşme sonucunu veya kurum kararını garanti etmez.",
      en: "Ketersediaan interpreter dan penerimaan pendamping pada suatu instansi perlu dikonfirmasi. Dukungan komunikasi tidak menjamin hasil pertemuan atau keputusan instansi.",
    },
    seoTitle: {
      id: "Interpreter Indonesia–Turki: Online & Tatap Muka",
      tr: "Endonezce–Türkçe Tercüman: Çevrimiçi ve Yüz Yüze",
      en: "Interpreter Indonesia–Turki: Online & Tatap Muka",
    },
    whatsappCta: {
      id: "Tanya layanan interpreter",
      tr: "Tercüman desteğini sor",
      en: "Tanya layanan interpreter",
    },
  },
  {
    slug: "konsultasi",
    kind: "consultation",
    icon: "compass",
    name: {
      id: "Konsultasi",
      tr: "Danışmanlık",
      en: "Konsultasi",
    },
    short: {
      id: "Banyak pertanyaan, belum tahu mana yang didahulukan? Kami membantu menata topik dan pilihan langkah sesuai situasi Anda.",
      tr: "Sorularınız çok ve nereden başlayacağınızı bilmiyor musunuz? Konuları ve sonraki adım seçeneklerini durumunuza göre düzenlemenize yardımcı oluyoruz.",
      en: "Banyak pertanyaan, belum tahu mana yang didahulukan? Kami membantu menata topik dan pilihan langkah sesuai situasi Anda.",
    },
    audience: {
      id: "WNI yang ingin membahas persiapan pernikahan, dokumen, kehidupan sehari-hari di Türkiye, komunikasi lintas bahasa, atau perencanaan proses.",
      tr: "Evlilik hazırlığı, belgeler, Türkiye’de günlük yaşam, iki dil arasında iletişim veya süreç planını görüşmek isteyen Endonezya vatandaşları.",
      en: "WNI yang ingin membahas persiapan pernikahan, dokumen, kehidupan sehari-hari di Türkiye, komunikasi lintas bahasa, atau perencanaan proses.",
    },
    problem: {
      id: "Jawaban umum belum tentu menjelaskan apa yang relevan untuk Anda. Konsultasi dimulai dengan memahami konteks, mengelompokkan pertanyaan, dan menentukan hal yang perlu dikonfirmasi lebih lanjut.",
      tr: "Genel yanıtlar sizin durumunuz için neyin uygun olduğunu açıklamayabilir. Görüşme; bağlamı anlama, soruları gruplandırma ve teyit gerektiren konuları ayırmayla başlar.",
      en: "Jawaban umum belum tentu menjelaskan apa yang relevan untuk Anda. Konsultasi dimulai dengan memahami konteks, mengelompokkan pertanyaan, dan menentukan hal yang perlu dikonfirmasi lebih lanjut.",
    },
    help: {
      id: [
        "Membahas persiapan pernikahan dan kebutuhan dokumen secara praktis",
        "Menata pertanyaan tentang kehidupan di Türkiye dan komunikasi Indonesia–Türkiye",
        "Menyusun prioritas serta rencana tindak lanjut",
        "Menunjukkan kapan pertanyaan perlu dibawa kepada instansi atau profesional yang berwenang",
      ],
      tr: [
        "Evlilik hazırlığını ve belge ihtiyacını pratik açıdan görüşme",
        "Türkiye’de yaşam ve Endonezya–Türkiye iletişimiyle ilgili soruları düzenleme",
        "Öncelikleri ve takip planını oluşturma",
        "Hangi soruların yetkili kuruma veya uzmana yöneltilmesi gerektiğini ayırma",
      ],
      en: [],
    },
    cta: {
      id: "Ajukan konsultasi",
      tr: "Danışmanlık talep edin",
      en: "Ajukan konsultasi",
    },
    limitations: {
      id: "Konsultasi tidak menggantikan nasihat hukum, keputusan instansi, atau layanan resmi pemerintah. Cakupan, biaya, dan waktu dibahas sebelum layanan dimulai.",
      tr: "Danışmanlık hukuki görüşün, kurum kararının veya resmi kamu hizmetinin yerini tutmaz. Kapsam, ücret ve zaman hizmet başlamadan önce görüşülür.",
      en: "Konsultasi tidak menggantikan nasihat hukum, keputusan instansi, atau layanan resmi pemerintah. Cakupan, biaya, dan waktu dibahas sebelum layanan dimulai.",
    },
    seoTitle: {
      id: "Konsultasi Turki untuk WNI: Rencanakan Langkah Anda",
      tr: "Endonezya Vatandaşları için Türkiye Danışmanlığı",
      en: "Konsultasi Turki untuk WNI: Rencanakan Langkah Anda",
    },
    whatsappCta: {
      id: "Konsultasi via WhatsApp",
      tr: "WhatsApp ile danış",
      en: "Konsultasi via WhatsApp",
    },
  },
  {
    slug: "kursus-bahasa-turki",
    kind: "course",
    icon: "book",
    name: {
      id: "Kursus Bahasa Turki",
      tr: "Türkçe kursu",
      en: "Kursus Bahasa Turki",
    },
    short: {
      id: "Ingin mulai belajar atau lebih percaya diri berbicara bahasa Turki? Sampaikan minat Anda untuk A1, A2, percakapan, atau les privat.",
      tr: "Türkçeye başlamak veya daha rahat konuşmak mı istiyorsunuz? A1, A2, konuşma ya da özel ders için ilginizi belirtin.",
      en: "Ingin mulai belajar atau lebih percaya diri berbicara bahasa Turki? Sampaikan minat Anda untuk A1, A2, percakapan, atau les privat.",
    },
    audience: {
      id: "Orang Indonesia yang ingin mempelajari bahasa Turki untuk kehidupan sehari-hari, komunikasi keluarga, atau kebutuhan pribadi.",
      tr: "Günlük yaşam, aile iletişimi veya kişisel ihtiyaçları için Türkçe öğrenmek isteyen Endonezyalılar.",
      en: "Orang Indonesia yang ingin mempelajari bahasa Turki untuk kehidupan sehari-hari, komunikasi keluarga, atau kebutuhan pribadi.",
    },
    problem: {
      id: "Tujuan belajar dan pengalaman setiap orang berbeda. Ceritakan level serta tujuan Anda agar informasi program yang diberikan lebih relevan.",
      tr: "Herkesin öğrenme hedefi ve deneyimi farklıdır. Program bilgisinin ihtiyacınıza uygun olması için seviyenizi ve hedefinizi paylaşın.",
      en: "Tujuan belajar dan pengalaman setiap orang berbeda. Ceritakan level serta tujuan Anda agar informasi program yang diberikan lebih relevan.",
    },
    help: {
      id: [
        "Mencatat minat untuk A1, A2, percakapan, atau les privat",
        "Memahami tujuan belajar dan bahasa pengantar yang Anda pilih",
        "Memberikan informasi sesuai program yang tersedia dan persetujuan kontak Anda",
      ],
      tr: [
        "A1, A2, konuşma veya özel ders ilginizi kaydetme",
        "Öğrenme hedefinizi ve tercih ettiğiniz eğitim dilini anlama",
        "İletişim izniniz kapsamında mevcut programa uygun bilgi paylaşma",
      ],
      en: [],
    },
    cta: {
      id: "Saya tertarik belajar bahasa Turki",
      tr: "Türkçe öğrenmek istiyorum",
      en: "Saya tertarik belajar bahasa Turki",
    },
    limitations: {
      id: "Jadwal dan format kelas akan diinformasikan sesuai program yang tersedia. Formulir ini bukan konfirmasi pendaftaran, tempat, pengajar, atau biaya.",
      tr: "Ders takvimi ve biçimi, mevcut programa göre bildirilecektir. Bu form kayıt, kontenjan, eğitmen veya ücret onayı değildir.",
      en: "Jadwal dan format kelas akan diinformasikan sesuai program yang tersedia. Formulir ini bukan konfirmasi pendaftaran, tempat, pengajar, atau biaya.",
    },
    seoTitle: {
      id: "Kursus Bahasa Turki untuk Orang Indonesia",
      tr: "Endonezyalılar için Türkçe Kursu",
      en: "Kursus Bahasa Turki untuk Orang Indonesia",
    },
    whatsappCta: {
      id: "Tanya kelas bahasa Turki",
      tr: "Türkçe derslerini sor",
      en: "Tanya kelas bahasa Turki",
    },
  },
  {
    slug: "pemeriksaan-dokumen",
    kind: "precheck",
    provisionalPrice: source.services.find((s) => s.id === "document-precheck")
      ?.proposed_test_price?.amount,
    icon: "check",
    name: {
      id: "Pemeriksaan Awal Dokumen",
      tr: "Belge Ön Kontrol",
      en: "Pemeriksaan Awal Dokumen",
    },
    short: {
      id: "Ingin mengecek persiapan sebelum melanjutkan proses? Mulai dengan pemeriksaan awal secara praktis berdasarkan daftar dan penjelasan Anda.",
      tr: "Sürecin sonraki adımına geçmeden hazırlığınızı gözden geçirmek mi istiyorsunuz? Liste ve açıklamanıza dayalı pratik bir ön değerlendirmeyle başlayın.",
      en: "Ingin mengecek persiapan sebelum melanjutkan proses? Mulai dengan pemeriksaan awal secara praktis berdasarkan daftar dan penjelasan Anda.",
    },
    audience: {
      id: "Anda yang ingin memperjelas kelengkapan awal sebelum dokumen dibawa ke tahap berikutnya, tanpa mengirim berkas sensitif melalui formulir.",
      tr: "Belgelerini sonraki aşamaya taşımadan önce ilk hazırlığını netleştirmek isteyenler; formda hassas dosya gönderilmez.",
      en: "Anda yang ingin memperjelas kelengkapan awal sebelum dokumen dibawa ke tahap berikutnya, tanpa mengirim berkas sensitif melalui formulir.",
    },
    problem: {
      id: "Anda mungkin sudah memiliki daftar dokumen, tetapi belum yakin apa yang tampak kurang atau pertanyaan apa yang harus diajukan. Pemeriksaan awal membantu menata hal tersebut sesuai cakupan yang disepakati.",
      tr: "Belge listeniz olabilir; yine de nelerin eksik göründüğü veya hangi soruların sorulacağı belirsiz kalabilir. Ön değerlendirme, bunları kararlaştırılan kapsamda düzenlemenize yardımcı olur.",
      en: "Anda mungkin sudah memiliki daftar dokumen, tetapi belum yakin apa yang tampak kurang atau pertanyaan apa yang harus diajukan. Pemeriksaan awal membantu menata hal tersebut sesuai cakupan yang disepakati.",
    },
    help: {
      id: [
        "Ringkasan dokumen atau informasi yang tampak belum lengkap berdasarkan penjelasan Anda",
        "Pertanyaan yang sebaiknya dikonfirmasi kepada instansi terkait",
        "Langkah berikutnya yang disarankan sesuai cakupan penilaian awal",
      ],
      tr: [
        "Açıklamanıza göre eksik görünen belge veya bilgilerin özeti",
        "İlgili kurumdan teyit edilmesi önerilen sorular",
        "İlk değerlendirme kapsamında önerilen sonraki adımlar",
      ],
      en: [],
    },
    cta: {
      id: "Bahas pemeriksaan awal dokumen",
      tr: "Belge ön kontrolünü görüşün",
      en: "Bahas pemeriksaan awal dokumen",
    },
    limitations: {
      id: "Ini bukan pemeriksaan hukum dan bukan jaminan dokumen akan diterima oleh instansi. Jangan kirim paspor, kartu identitas, izin tinggal, atau dokumen sensitif melalui form ini.",
      tr: "Bu bir hukuki inceleme değildir ve belgenin kurum tarafından kabulünü garanti etmez. Bu formdan pasaport, kimlik, ikamet kartı veya hassas belge göndermeyin.",
      en: "Ini bukan pemeriksaan hukum dan bukan jaminan dokumen akan diterima oleh instansi. Jangan kirim paspor, kartu identitas, izin tinggal, atau dokumen sensitif melalui form ini.",
    },
    seoTitle: {
      id: "Pemeriksaan Awal Dokumen Indonesia–Türkiye",
      tr: "Endonezya–Türkiye Belge Ön Kontrolü",
      en: "Pemeriksaan Awal Dokumen Indonesia–Türkiye",
    },
    whatsappCta: {
      id: "Tanya pemeriksaan awal dokumen",
      tr: "Belge ön kontrolünü sor",
      en: "Tanya pemeriksaan awal dokumen",
    },
  },
];
export const serviceBySlug = (slug: string) =>
  services.find((s) => s.slug === slug);
export const serviceByKind = (kind: LeadKind) =>
  services.find((s) => s.kind === kind);
export function localizedList(
  values: Record<Locale, string[]>,
  locale: Locale,
) {
  return values[locale].length ? values[locale] : values.id;
}
