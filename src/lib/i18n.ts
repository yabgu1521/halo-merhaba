export const locales = ["en", "tr", "id"] as const;
export type Locale = (typeof locales)[number];
export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
export const copy = {
  en: {
    skip: "Skip to content",
    nav: ["Meet people", "How it works", "Marriage Center"],
    join: "Join free",
    eyebrow: "TWO CULTURES. A WORLD OF POSSIBILITY.",
    title: "Meaningful connections.\nShared beginnings.",
    intro:
      "Find friendship, exchange languages, or build a serious relationship between Türkiye and Indonesia. Your journey starts with understanding.",
    explore: "Explore our community",
    how: "See how it works",
    note: "For adults 18+ · Thoughtful connections, at your pace",
    cardLabel: "A BRIDGE BETWEEN TWO WORLDS",
    cardTitle: "Different cultures.\nCommon ground.",
    cardText:
      "A little curiosity can be the beginning of something meaningful.",
    paths: "MORE THAN ONE WAY TO CONNECT",
    pathsTitle: "What brings you here?",
    pathsIntro:
      "There is no single story. Choose the connections that feel right for you.",
    cards: [
      [
        "01",
        "Serious relationships",
        "Meet people who value intention, respect, and the possibility of a shared future.",
      ],
      [
        "02",
        "Friendship & community",
        "Find common interests and new perspectives across two welcoming cultures.",
      ],
      [
        "03",
        "Language & culture",
        "Practice Turkish or Bahasa Indonesia and learn about the everyday life behind the words.",
      ],
    ],
    stepsTitle: "Good connections take a little care.",
    steps: [
      [
        "Define who you want to meet",
        "Create your profile and choose your preferred age range, countries and relationship intention.",
      ],
      [
        "Search real candidates",
        "Use clear filters and understand shared compatibility separately from your preference fit.",
      ],
      [
        "Connect with mutual interest",
        "Express interest, match and start a private conversation. Take your time building trust.",
      ],
    ],
    safetyTitle: "Trust is a practice. Not a promise.",
    safetyText:
      "Our planned safety tools include reporting, blocking, and human moderation. No platform can guarantee someone’s identity or intentions.",
    safetyRules: [
      "Never send money to someone you have not independently verified.",
      "Never share banking credentials or passwords. Be cautious about urgent money requests.",
      "Use video communication before major commitments, meet safely, and report suspicious behavior.",
    ],
    marriageLabel: "THE NEXT CHAPTER",
    marriageTitle: "When your connection\nbecomes a shared future.",
    marriageText:
      "Our Marriage Center will bring together educational country guides, document checklists, and optional support from a professional team.",
    services: [
      "Document translation",
      "Marriage-document consultation",
      "Interpreter & preparation support",
    ],
    warning:
      "Requirements may change. Confirm current requirements with the relevant official authority or our professional team before taking action.",
    legal: "Educational information is not legal advice.",
    founderLabel: "BUILT FROM A SHARED EXPERIENCE",
    founderTitle: "Two cultures. One personal perspective.",
    founderText:
      "Founded by a Turkish–Indonesian married couple, with a professional team offering translation and marriage-document support.",
    founderNote: "Built around a shared cross-cultural experience.",
    media: "Stories, conversations & everyday culture",
    mediaText:
      "Language, family life and everyday culture are natural places to begin a conversation.",
    pricingTitle: "Start with connection.",
    pricingText:
      "Free membership is planned for the essential community experience. Optional Premium benefits and professional services will have clearly published prices before purchase.",
    plans: [
      "Free · Essential connections",
      "Premium · Additional discovery tools",
      "Professional services · Individual quotations",
    ],
    faqTitle: "A few things you may be wondering",
    faqs: [
      [
        "Is this only for dating?",
        "No. Friendship, language exchange, cultural exchange, serious relationships, and marriage are separate purposes.",
      ],
      [
        "Who can join?",
        "The platform is intended exclusively for adults aged 18 and over in Türkiye and Indonesia. Registration requires email verification and adult confirmation.",
      ],
      [
        "Can I book a professional service now?",
        "Not yet. Service requests, secure document intake, and billing will open after operational and security checks.",
      ],
      [
        "Are members guaranteed to be verified?",
        "No. Verification labels will describe specific checks and cannot guarantee identity, intentions, or safety.",
      ],
    ],
    launchTitle: "A thoughtful beginning is on its way.",
    launchText:
      "Create your adult member profile to start connecting. Professional service requests are coming in a later phase.",
    back: "Back to top",
    footer: "Meaningful connections between Türkiye and Indonesia.",
    policies: ["Privacy", "Terms", "Community guidelines", "Cookies"],
    policyText:
      "Members must be adults. Respect privacy, do not solicit money, and report suspicious behavior.",
  },
  tr: {
    skip: "İçeriğe geç",
    nav: ["İnsanlarla tanış", "Nasıl çalışır", "Evlilik Merkezi"],
    join: "Ücretsiz katıl",
    eyebrow: "İKİ KÜLTÜR. YENİ OLASILIKLAR.",
    title: "Anlamlı bağlar.\nOrtak başlangıçlar.",
    intro:
      "Türkiye ve Endonezya arasında arkadaşlık kurun, dil öğrenin veya ciddi bir ilişkiye adım atın. Yolculuğunuz birbirinizi anlamakla başlar.",
    explore: "Topluluğu keşfet",
    how: "Nasıl çalışır?",
    note: "Yalnızca 18+ · Kendi hızınızda anlamlı bağlar",
    cardLabel: "İKİ DÜNYA ARASINDA BİR KÖPRÜ",
    cardTitle: "Farklı kültürler.\nOrtak noktalar.",
    cardText: "Biraz merak, anlamlı bir başlangıca dönüşebilir.",
    paths: "BAĞ KURMANIN BİRDEN FAZLA YOLU VAR",
    pathsTitle: "Sizi buraya ne getiriyor?",
    pathsIntro: "Herkesin hikâyesi farklı. Size uygun bağları seçin.",
    cards: [
      [
        "01",
        "Ciddi ilişkiler",
        "Saygıya, samimiyete ve ortak bir geleceğe önem veren insanlarla tanışın.",
      ],
      [
        "02",
        "Arkadaşlık ve topluluk",
        "İki kültür arasında ortak ilgi alanları ve yeni bakış açıları keşfedin.",
      ],
      [
        "03",
        "Dil ve kültür",
        "Türkçe veya Endonezce pratiği yapın; kelimelerin ardındaki günlük hayatı tanıyın.",
      ],
    ],
    stepsTitle: "Güzel bağlar özen ister.",
    steps: [
      [
        "Kimi tanımak istediğinizi belirleyin",
        "Profilinizi oluşturun; yaş aralığı, ülke ve ilişki niyeti tercihlerinizi seçin.",
      ],
      [
        "Gerçek adayları arayın",
        "Açık filtreler kullanın; ortak uyumluluk ile tercihlerinize uygunluğu ayrı ayrı görün.",
      ],
      [
        "Karşılıklı ilgiyle bağ kurun",
        "İlgi gösterin, eşleşin ve özel bir sohbet başlatın. Güven oluştururken acele etmeyin.",
      ],
    ],
    safetyTitle: "Güven bir süreçtir, garanti değil.",
    safetyText:
      "Planlanan araçlarımız arasında engelleme, bildirim ve insan moderasyonu bulunur. Hiçbir platform kimliği veya niyeti garanti edemez.",
    safetyRules: [
      "Bağımsız olarak doğrulamadığınız birine para göndermeyin.",
      "Banka bilgilerinizi ve şifrelerinizi paylaşmayın. Acil para taleplerine dikkat edin.",
      "Önemli kararlardan önce görüntülü konuşun, güvenli buluşun ve şüpheli davranışları bildirin.",
    ],
    marriageLabel: "BİR SONRAKİ BÖLÜM",
    marriageTitle: "Bağınız ortak bir\ngeleceğe dönüşürken.",
    marriageText:
      "Evlilik Merkezi; ülke rehberlerini, belge listelerini ve isteğe bağlı profesyonel desteği bir araya getirecek.",
    services: [
      "Belge çevirisi",
      "Evlilik belgeleri danışmanlığı",
      "Tercüman ve hazırlık desteği",
    ],
    warning:
      "Gereklilikler değişebilir. İşlem yapmadan önce güncel gereklilikleri ilgili resmî makamdan veya profesyonel ekibimizden doğrulayın.",
    legal: "Bilgilendirici içerikler hukuki danışmanlık değildir.",
    founderLabel: "ORTAK BİR DENEYİMDEN DOĞDU",
    founderTitle: "İki kültür. Kişisel bir bakış.",
    founderText:
      "Türk–Endonezyalı evli bir çift tarafından, çeviri ve evlilik belgeleri desteği sağlayan profesyonel bir ekiple kuruldu.",
    founderNote: "Ortak bir kültürler arası deneyim üzerine kuruldu.",
    media: "Hikâyeler, sohbetler ve günlük kültür",
    mediaText:
      "Dil, aile yaşamı ve günlük kültür, sohbet başlatmak için doğal ortak noktalardır.",
    pricingTitle: "Bağ kurarak başlayın.",
    pricingText:
      "Temel topluluk deneyimi için ücretsiz üyelik planlanıyor. Premium ve profesyonel hizmet fiyatları satın almadan önce açıkça sunulacak.",
    plans: [
      "Ücretsiz · Temel bağlantılar",
      "Premium · Ek keşif araçları",
      "Profesyonel hizmetler · Özel teklifler",
    ],
    faqTitle: "Merak edebileceğiniz birkaç şey",
    faqs: [
      [
        "Burası sadece flört için mi?",
        "Hayır. Arkadaşlık, dil, kültür, ciddi ilişki ve evlilik ayrı katılım amaçlarıdır.",
      ],
      [
        "Kimler katılabilir?",
        "Platform Türkiye ve Endonezya’daki 18 yaş ve üzeri yetişkinler içindir. Kayıt için e-posta doğrulaması ve yetişkinlik onayı gerekir.",
      ],
      [
        "Şimdi hizmet alabilir miyim?",
        "Henüz değil. Güvenli belge alımı ve ödeme işlemleri gerekli kontrollerden sonra açılacak.",
      ],
      [
        "Üyelerin kimliği garanti edilir mi?",
        "Hayır. Doğrulama durumları belirli kontrolleri gösterir; kimliği, niyeti veya güvenliği garanti etmez.",
      ],
    ],
    launchTitle: "Özenli bir başlangıç yakında.",
    launchText:
      "Bağ kurmaya başlamak için yetişkin üye profilinizi oluşturun. Profesyonel hizmet talepleri ilerleyen aşamada açılacak.",
    back: "Başa dön",
    footer: "Türkiye ve Endonezya arasında anlamlı bağlar.",
    policies: ["Gizlilik", "Koşullar", "Topluluk kuralları", "Çerezler"],
    policyText:
      "Üyeler yetişkin olmalıdır. Gizliliğe saygı gösterin, para talep etmeyin ve şüpheli davranışları bildirin.",
  },
  id: {
    skip: "Langsung ke konten",
    nav: ["Kenali orang", "Cara kerja", "Pusat Pernnikahan"],
    join: "Gabung gratis",
    eyebrow: "DUA BUDAYA. BERAGAM KEMUNGKINAN.",
    title: "Koneksi bermakna.\nAwal bersama.",
    intro:
      "Temukan persahabatan, bertukar bahasa, atau bangun hubungan serius antara Türkiye dan Indonesia. Perjalanan Anda dimulai dari saling memahami.",
    explore: "Jelajahi komunitas",
    how: "Lihat cara kerjanya",
    note: "Khusus dewasa 18+ · Sesuai kenyamanan Anda",
    cardLabel: "JEMBATAN ANTARA DUA DUNIA",
    cardTitle: "Budaya berbeda.\nKesamaan yang berarti.",
    cardText: "Sedikit rasa ingin tahu bisa menjadi awal yang bermakna.",
    paths: "BANYAK CARA UNTUK TERHUBUNG",
    pathsTitle: "Apa tujuan Anda?",
    pathsIntro:
      "Setiap orang punya cerita. Pilih koneksi yang sesuai untuk Anda.",
    cards: [
      [
        "01",
        "Hubungan serius",
        "Kenali orang yang menghargai ketulusan, rasa hormat, dan masa depan bersama.",
      ],
      [
        "02",
        "Persahabatan & komunitas",
        "Temukan minat yang sama dan perspektif baru dari dua budaya.",
      ],
      [
        "03",
        "Bahasa & budaya",
        "Latih bahasa Turki atau Indonesia dan kenali kehidupan di balik kata-kata.",
      ],
    ],
    stepsTitle: "Koneksi yang baik membutuhkan perhatian.",
    steps: [
      [
        "Tentukan siapa yang ingin ditemui",
        "Buat profil dan pilih rentang usia, negara, serta tujuan hubungan.",
      ],
      [
        "Cari calon nyata",
        "Gunakan filter yang jelas dan pahami kesamaan secara terpisah dari kesesuaian preferensimu.",
      ],
      [
        "Terhubung melalui minat bersama",
        "Tunjukkan minat, cocokkan, lalu mulai percakapan pribadi. Bangun kepercayaan tanpa terburu-buru.",
      ],
    ],
    safetyTitle: "Kepercayaan adalah proses, bukan jaminan.",
    safetyText:
      "Fitur yang direncanakan mencakup blokir, pelaporan, dan moderasi manusia. Tidak ada platform yang menjamin identitas atau niat seseorang.",
    safetyRules: [
      "Jangan kirim uang kepada orang yang belum Anda verifikasi secara mandiri.",
      "Jangan bagikan informasi bank atau kata sandi. Waspadai permintaan uang mendesak.",
      "Lakukan panggilan video sebelum keputusan besar, bertemu dengan aman, dan laporkan perilaku mencurigakan.",
    ],
    marriageLabel: "BAB SELANJUTNYA",
    marriageTitle: "Saat koneksi menjadi\nmasa depan bersama.",
    marriageText:
      "Pusat Pernikahan akan menyediakan panduan negara, daftar dokumen, serta dukungan profesional opsional.",
    services: [
      "Penerjemahan dokumen",
      "Konsultasi dokumen pernikahan",
      "Juru bahasa & bantuan persiapan",
    ],
    warning:
      "Persyaratan dapat berubah. Konfirmasikan persyaratan terbaru dengan otoritas resmi terkait atau tim profesional kami sebelum bertindak.",
    legal: "Informasi edukasi bukan nasihat hukum.",
    founderLabel: "BERAWAL DARI PENGALAMAN BERSAMA",
    founderTitle: "Dua budaya. Perspektif pribadi.",
    founderText:
      "Didirikan oleh pasangan menikah Turki–Indonesia, bersama tim profesional untuk penerjemahan dan dukungan dokumen pernikahan.",
    founderNote: "Dibangun dari pengalaman lintas budaya bersama.",
    media: "Cerita, percakapan & budaya sehari-hari",
    mediaText:
      "Bahasa, kehidupan keluarga, dan budaya sehari-hari adalah awal percakapan yang alami.",
    pricingTitle: "Mulai dengan koneksi.",
    pricingText:
      "Keanggotaan gratis direncanakan untuk pengalaman dasar komunitas. Harga Premium dan layanan profesional akan ditampilkan dengan jelas sebelum pembelian.",
    plans: [
      "Gratis · Koneksi dasar",
      "Premium · Fitur penemuan tambahan",
      "Layanan profesional · Penawaran khusus",
    ],
    faqTitle: "Beberapa hal yang mungkin Anda tanyakan",
    faqs: [
      [
        "Apakah ini hanya untuk berkencan?",
        "Tidak. Persahabatan, bahasa, budaya, hubungan serius, dan pernikahan adalah tujuan yang berbeda.",
      ],
      [
        "Siapa yang dapat bergabung?",
        "Khusus orang dewasa berusia 18 tahun ke atas di Türkiye dan Indonesia. Pendaftaran memerlukan verifikasi email dan konfirmasi usia dewasa.",
      ],
      [
        "Bisakah saya memesan layanan sekarang?",
        "Belum. Permintaan layanan, unggahan dokumen, dan pembayaran dibuka setelah pemeriksaan operasional dan keamanan.",
      ],
      [
        "Apakah identitas anggota dijamin?",
        "Tidak. Status verifikasi hanya menjelaskan pemeriksaan tertentu, bukan jaminan identitas, niat, atau keselamatan.",
      ],
    ],
    launchTitle: "Awal yang penuh perhatian segera hadir.",
    launchText:
      "Buat profil anggota dewasa untuk mulai terhubung. Permintaan layanan profesional akan hadir pada tahap berikutnya.",
    back: "Kembali ke atas",
    footer: "Koneksi bermakna antara Türkiye dan Indonesia.",
    policies: ["Privasi", "Ketentuan", "Pedoman komunitas", "Kuki"],
    policyText:
      "Anggota harus dewasa. Hormati privasi, jangan meminta uang, dan laporkan perilaku mencurigakan.",
  },
} as const;
