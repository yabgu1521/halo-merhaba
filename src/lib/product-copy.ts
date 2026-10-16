import type { Locale } from "./i18n";
const en = {
  joinTitle: "A little curiosity can go a long way.",
  joinText:
    "Create your adult member profile. Share what matters to you and start with a respectful conversation.",
  heroLabel: "TÜRKİYE ↔ INDONESIA · A WORLD OF COMMON GROUND",
  heroTitle: "A shared future starts\nwith understanding.",
  heroText:
    "Meet adults across cultures for serious relationships, marriage, friendship and language exchange. Discover the person behind the profile.",
  create: "Create your profile",
  signin: "Sign in",
  how: "Discover how it works",
  hello: "Two languages. A new beginning.",
  helloText:
    "Different backgrounds. Shared intentions. Space to get to know each other.",
  understand: "Understand the person, not only the photo.",
  understandText:
    "Clear intentions, shared interests and languages help you find a natural place to begin. No compatibility percentages. Just understandable reasons to connect.",
  intentions: "Start with what matters to you",
  insights: "Your common ground",
  insightsHelp:
    "Based on what you both chose to share. These are conversation points, not predictions about a relationship.",
  noInsights:
    "Every connection starts somewhere. Read their introduction and ask what matters to them.",
  sharedPurpose: "A shared intention",
  sharedInterest: "Interests in common",
  commonLanguage: "A language you both speak",
  learning: "A language bridge",
  theyLearn: "They are learning a language you speak",
  youLearn: "You are learning a language they speak",
  forYou: "For you",
  newMembers: "New members",
  forYouHelp:
    "Ordered by shared intentions, interests and languages. No paid boosts.",
  newHelp:
    "Profiles ordered by when onboarding was completed. This does not indicate recent activity.",
  discoverTitle: "Find a little common ground.",
  discoverText:
    "People, perspectives, and possibilities across cultures. Take your time.",
  filters: "Refine your connections",
  basics: "Where & when",
  connection: "What brings you together",
  search: "Find someone",
  results: "People to get to know",
  starterTitle: "A thoughtful first message",
  starterHelp:
    "Suggestions from shared profile details. Choose one to edit; nothing is sent automatically.",
  interestPrompt: "What first got you interested in {value}?",
  languagePrompt: "Would you like to practise {value} together?",
  culturePrompt: "What is something you love about life in {value}?",
  story: "Their story",
  international: "Life across cultures",
  optional: "A little more about your world",
  optionalHelp:
    "Optional. Leave anything blank. These details stay private unless you choose to share them with permitted members.",
  nationality: "Nationality / citizenship",
  relocate: "Open to relocating",
  future: "Preferred future country",
  destinations: "Countries you would consider",
  education: "Education",
  profession: "Profession",
  children: "Thoughts on children",
  share: "Share these optional details with permitted members",
  privateNote:
    "Hidden by default. Turning sharing off removes these details from other members’ profiles.",
  unspecified: "Prefer not to say",
  yes: "Open to it",
  maybe: "Would discuss it",
  no: "Not planning to",
  childrenYes: "Would like children",
  childrenNo: "Do not plan to have children",
  childrenDiscuss: "Would like to discuss privately",
  saveContext: "Save optional details",
  setupRequired:
    "Optional profile details and new discovery ordering need the reviewed product migration. Your existing profile and connections still work.",
  more: "More",
  menu: "Your space",
  marriage: "Marriage Center",
  marriageTitle: "From a connection to a shared life.",
  marriageIntro:
    "When you both decide marriage is your next step, make room for practical conversations, reliable information, and professional support.",
  journey: "Your next chapter",
  journeySteps: [
    "Talk about your future together",
    "Choose where you plan to marry",
    "Confirm requirements with official authorities",
    "Prepare documents and translations",
    "Arrange appointments and language support",
  ],
  services: "Professional support, when you need it",
  serviceNames: [
    "Marriage preparation consultation",
    "Document guidance & translation",
    "Interpreter assistance",
  ],
  serviceTexts: [
    "Discuss your plans, questions and practical next steps.",
    "Understand what to confirm, and where professional document help may be useful.",
    "Prepare for important conversations and appointments across languages.",
  ],
  notAvailable:
    "Service booking and document uploads are not available yet. This area explains the intended support; it does not place an order.",
  guidance:
    "Educational information, not legal advice. No marriage, visa or government approval is guaranteed.",
  requirementWarning:
    "Requirements may change. Confirm current requirements with the relevant official authority or our professional team before taking action.",
  premium: "Premium",
  premiumTitle: "More choice. The same respect.",
  premiumText:
    "Core connections remain free: create a profile, discover people, express interest, match and communicate. Future Premium options will add convenience, not sell access to people.",
  free: "Free · available now",
  planned: "Premium · planned",
  freeBenefits: [
    "Member discovery and saved favorites",
    "Mutual matches and private text conversations",
    "Privacy, blocking and reporting",
  ],
  premiumBenefits: [
    "More detailed discovery controls",
    "Additional visibility preferences",
    "Potential professional-service benefits",
  ],
  premiumNotice:
    "Premium is not available for purchase. Prices and final benefits have not been set.",
  safety: "Take your time. Build trust.",
  safetyText:
    "An email-verified badge confirms an email address, not someone’s identity or intentions. Never send money to an unverified connection.",
  chapter: "THE NEXT CHAPTER",
  viewPlans: "Explore future membership",
  onboardNote:
    "Your profile is yours to shape. Begin with the essentials, then share more when you feel ready.",
  membersOnly: "Adults only · Private member photos · Mutual-match messaging",
  sharedWith: "Shared with permitted members",
  returnDiscover: "Back to discovery",
} as const;
const tr: {
  [K in keyof typeof en]: (typeof en)[K] extends readonly string[]
    ? readonly string[]
    : string;
} = {
  joinTitle: "Biraz merak, yeni bir başlangıç.",
  joinText:
    "Yetişkin üye profilinizi oluşturun. Sizin için önemli olanı paylaşın ve saygılı bir sohbetle başlayın.",
  heroLabel: "TÜRKİYE ↔ ENDONEZYA · ORTAK BİR DÜNYA",
  heroTitle: "Ortak bir gelecek,\nanlayışla başlar.",
  heroText:
    "Ciddi ilişki, evlilik, arkadaşlık ve dil paylaşımı için kültürler arasında bağ kurun. Profilin arkasındaki insanı tanıyın.",
  create: "Profilini oluştur",
  signin: "Giriş yap",
  how: "Nasıl çalıştığını keşfet",
  hello: "İki dil. Yeni bir başlangıç.",
  helloText: "Farklı geçmişler. Ortak niyetler. Birbirinizi tanımak için alan.",
  understand: "Yalnızca fotoğrafı değil, insanı tanıyın.",
  understandText:
    "Açık niyetler, ortak ilgi alanları ve diller doğal bir başlangıç sunar. Uyumluluk yüzdeleri değil, anlaşılır bağlantı nedenleri.",
  intentions: "Sizin için önemli olandan başlayın",
  insights: "Ortak noktalarınız",
  insightsHelp:
    "İkinizin de paylaşmayı seçtiği bilgilere dayanır. Bunlar sohbet için başlangıç noktalarıdır; ilişkinin geleceğini öngörmez.",
  noInsights:
    "Her bağ bir yerden başlar. Tanıtımını okuyun, onun için neyin önemli olduğunu sorun.",
  sharedPurpose: "Ortak bir niyet",
  sharedInterest: "Ortak ilgi alanları",
  commonLanguage: "İkinizin de konuştuğu bir dil",
  learning: "Diller arasında bir köprü",
  theyLearn: "Konuştuğunuz bir dili öğreniyor",
  youLearn: "Konuştuğu bir dili öğreniyorsunuz",
  forYou: "Senin için",
  newMembers: "Yeni katılanlar",
  forYouHelp:
    "Ortak niyet, ilgi alanı ve dillere göre sıralanır. Ücretli öne çıkarma yoktur.",
  newHelp:
    "Profil kurulumunun tamamlandığı tarihe göre sıralanır. Son etkinlik göstergesi değildir.",
  discoverTitle: "Ortak bir nokta bulun.",
  discoverText:
    "Kültürler arasında insanlar, bakış açıları ve olasılıklar. Acele etmeyin.",
  filters: "Bağlantılarınızı daraltın",
  basics: "Yer ve yaş",
  connection: "Sizi bir araya getirenler",
  search: "Birini ara",
  results: "Tanımaya değer insanlar",
  starterTitle: "Özenli bir ilk mesaj",
  starterHelp:
    "Paylaşılan profil bilgilerinden öneriler. Düzenlemek için birini seçin; otomatik mesaj gönderilmez.",
  interestPrompt: "{value} ilgin ilk nasıl başladı?",
  languagePrompt: "Birlikte {value} pratiği yapmak ister misin?",
  culturePrompt: "{value} ülkesinde yaşamın en sevdiğin yanı ne?",
  story: "Kendi hikâyesi",
  international: "Kültürler arasında yaşam",
  optional: "Dünyanı biraz daha anlat",
  optionalHelp:
    "İsteğe bağlıdır. Alanları boş bırakabilirsiniz. İzin verilen üyelerle paylaşmayı seçmedikçe gizli kalır.",
  nationality: "Uyruk / vatandaşlık",
  relocate: "Taşınmaya açıklık",
  future: "Gelecekte yaşamak istenen ülke",
  destinations: "Düşünebileceğiniz ülkeler",
  education: "Eğitim",
  profession: "Meslek",
  children: "Çocuk sahibi olmaya bakış",
  share: "Bu isteğe bağlı bilgileri izin verilen üyelerle paylaş",
  privateNote:
    "Varsayılan olarak gizlidir. Paylaşımı kapattığınızda diğer üyeler bu bilgileri göremez.",
  unspecified: "Belirtmek istemiyorum",
  yes: "Açığım",
  maybe: "Konuşabiliriz",
  no: "Planlamıyorum",
  childrenYes: "Çocuk sahibi olmak istiyorum",
  childrenNo: "Çocuk sahibi olmayı planlamıyorum",
  childrenDiscuss: "Özel olarak konuşmak isterim",
  saveContext: "İsteğe bağlı bilgileri kaydet",
  setupRequired:
    "İsteğe bağlı profil alanları ve yeni keşif sıralaması için ürün migration dosyası gerekir. Mevcut profiliniz ve bağlantılarınız çalışmaya devam eder.",
  more: "Diğer",
  menu: "Senin alanın",
  marriage: "Evlilik Merkezi",
  marriageTitle: "Bir bağdan ortak bir hayata.",
  marriageIntro:
    "İkiniz de evliliği bir sonraki adım olarak gördüğünüzde, pratik konuşmalara, güvenilir bilgiye ve profesyonel desteğe yer açın.",
  journey: "Bir sonraki bölümünüz",
  journeySteps: [
    "Ortak geleceğinizi konuşun",
    "Nerede evleneceğinizi belirleyin",
    "Koşulları resmi makamlarla doğrulayın",
    "Belgeleri ve çevirileri hazırlayın",
    "Randevu ve dil desteğini planlayın",
  ],
  services: "İhtiyaç duyduğunuzda profesyonel destek",
  serviceNames: [
    "Evliliğe hazırlık danışmanlığı",
    "Belge rehberliği ve çeviri",
    "Tercüman desteği",
  ],
  serviceTexts: [
    "Planlarınızı, sorularınızı ve sonraki adımları konuşun.",
    "Neleri doğrulamanız gerektiğini ve profesyonel belge desteğinin nerede yararlı olabileceğini anlayın.",
    "Önemli görüşme ve randevular için dil desteğine hazırlanın.",
  ],
  notAvailable:
    "Hizmet rezervasyonu ve belge yükleme henüz açık değildir. Bu alan planlanan desteği anlatır; sipariş oluşturmaz.",
  guidance:
    "Eğitim amaçlı bilgidir, hukuki danışmanlık değildir. Evlilik, vize veya resmi onay garantisi verilmez.",
  requirementWarning:
    "Koşullar değişebilir. Harekete geçmeden önce güncel koşulları ilgili resmi makam veya profesyonel ekibimizle doğrulayın.",
  premium: "Premium",
  premiumTitle: "Daha fazla seçenek. Aynı saygı.",
  premiumText:
    "Temel bağlantılar ücretsiz kalır: profil oluşturun, insanları keşfedin, ilgi gösterin, eşleşin ve konuşun. Gelecekte Premium kolaylık sunacak; insanlara erişim satmayacak.",
  free: "Ücretsiz · şimdi kullanılabilir",
  planned: "Premium · planlanıyor",
  freeBenefits: [
    "Üye keşfi ve favoriler",
    "Karşılıklı eşleşme ve özel yazışma",
    "Gizlilik, engelleme ve bildirme",
  ],
  premiumBenefits: [
    "Daha ayrıntılı keşif seçenekleri",
    "Ek görünürlük tercihleri",
    "Profesyonel hizmetlerde olası avantajlar",
  ],
  premiumNotice:
    "Premium satın almaya açık değildir. Fiyatlar ve kesin avantajlar henüz belirlenmedi.",
  safety: "Acele etmeyin. Güven oluşturun.",
  safetyText:
    "E-posta doğrulaması bir adresi doğrular; kişinin kimliğini veya niyetini değil. Doğrulamadığınız bir bağlantıya asla para göndermeyin.",
  chapter: "BİR SONRAKİ BÖLÜM",
  viewPlans: "Gelecekteki üyeliği keşfet",
  onboardNote:
    "Profilinizi siz şekillendirirsiniz. Temel bilgilerle başlayın, hazır olduğunuzda daha fazlasını paylaşın.",
  membersOnly:
    "Yalnızca yetişkinler · Özel üye fotoğrafları · Eşleşmeyle mesajlaşma",
  sharedWith: "İzin verilen üyelerle paylaşılıyor",
  returnDiscover: "Keşfe dön",
};
const id: typeof tr = {
  joinTitle: "Rasa ingin tahu membuka awal baru.",
  joinText:
    "Buat profil anggota dewasa. Bagikan hal yang berarti bagimu dan mulai percakapan dengan saling menghormati.",
  heroLabel: "TÜRKİYE ↔ INDONESIA · TEMUKAN KESAMAAN",
  heroTitle: "Masa depan bersama\ndimulai dari saling memahami.",
  heroText:
    "Kenali orang dewasa lintas budaya untuk hubungan serius, pernikahan, persahabatan, dan pertukaran bahasa. Kenali pribadi di balik profilnya.",
  create: "Buat profilmu",
  signin: "Masuk",
  how: "Lihat cara kerjanya",
  hello: "Dua bahasa. Awal yang baru.",
  helloText: "Latar berbeda. Tujuan yang sejalan. Ruang untuk saling mengenal.",
  understand: "Kenali pribadinya, bukan hanya fotonya.",
  understandText:
    "Tujuan yang jelas, minat dan bahasa bersama membuka percakapan. Tanpa persentase kecocokan. Hanya alasan yang bisa dipahami untuk terhubung.",
  intentions: "Mulai dari yang berarti bagimu",
  insights: "Kesamaan kalian",
  insightsHelp:
    "Berdasarkan informasi yang kalian pilih untuk dibagikan. Ini bahan percakapan, bukan ramalan hubungan.",
  noInsights:
    "Setiap hubungan punya awal. Baca perkenalannya dan tanyakan apa yang berarti baginya.",
  sharedPurpose: "Tujuan yang sejalan",
  sharedInterest: "Minat yang sama",
  commonLanguage: "Bahasa yang kalian kuasai",
  learning: "Jembatan bahasa",
  theyLearn: "Ia mempelajari bahasa yang kamu kuasai",
  youLearn: "Kamu mempelajari bahasa yang ia kuasai",
  forYou: "Untukmu",
  newMembers: "Anggota baru",
  forYouHelp:
    "Diurutkan berdasarkan tujuan, minat, dan bahasa bersama. Tanpa promosi berbayar.",
  newHelp:
    "Diurutkan saat profil selesai dibuat. Bukan penanda aktivitas terbaru.",
  discoverTitle: "Temukan kesamaan kalian.",
  discoverText:
    "Pribadi, pandangan, dan kemungkinan lintas budaya. Tidak perlu terburu-buru.",
  filters: "Sesuaikan pencarianmu",
  basics: "Tempat & usia",
  connection: "Yang mempertemukan kalian",
  search: "Cari seseorang",
  results: "Orang untuk dikenal",
  starterTitle: "Pesan pertama yang bermakna",
  starterHelp:
    "Saran dari detail profil yang dibagikan. Pilih untuk menyunting; tidak ada pesan otomatis.",
  interestPrompt: "Apa yang membuatmu tertarik pada {value}?",
  languagePrompt: "Mau berlatih {value} bersama?",
  culturePrompt: "Apa yang paling kamu sukai dari kehidupan di {value}?",
  story: "Ceritanya",
  international: "Kehidupan lintas budaya",
  optional: "Ceritakan duniamu sedikit lagi",
  optionalHelp:
    "Opsional. Boleh dikosongkan. Tetap pribadi kecuali kamu memilih membagikannya kepada anggota yang diizinkan.",
  nationality: "Kewarganegaraan",
  relocate: "Keterbukaan untuk pindah",
  future: "Negara tempat tinggal di masa depan",
  destinations: "Negara yang kamu pertimbangkan",
  education: "Pendidikan",
  profession: "Profesi",
  children: "Pandangan tentang anak",
  share: "Bagikan detail opsional ini kepada anggota yang diizinkan",
  privateNote:
    "Tersembunyi secara bawaan. Menonaktifkan berbagi menyembunyikan detail ini dari anggota lain.",
  unspecified: "Tidak ingin menyebutkan",
  yes: "Terbuka",
  maybe: "Bisa dibicarakan",
  no: "Tidak berencana",
  childrenYes: "Ingin memiliki anak",
  childrenNo: "Tidak berencana memiliki anak",
  childrenDiscuss: "Ingin membicarakannya secara pribadi",
  saveContext: "Simpan detail opsional",
  setupRequired:
    "Detail opsional dan urutan penemuan baru memerlukan migrasi produk. Profil dan koneksimu yang ada tetap berfungsi.",
  more: "Lainnya",
  menu: "Ruangmu",
  marriage: "Pusat Pernikahan",
  marriageTitle: "Dari perkenalan menuju hidup bersama.",
  marriageIntro:
    "Saat kalian sepakat melangkah ke pernikahan, siapkan percakapan praktis, informasi tepercaya, dan bantuan profesional.",
  journey: "Bab berikutnya",
  journeySteps: [
    "Bicarakan masa depan bersama",
    "Tentukan negara tempat menikah",
    "Konfirmasikan persyaratan dengan instansi resmi",
    "Siapkan dokumen dan terjemahan",
    "Rencanakan janji temu dan bantuan bahasa",
  ],
  services: "Dukungan profesional saat dibutuhkan",
  serviceNames: [
    "Konsultasi persiapan pernikahan",
    "Panduan dokumen & penerjemahan",
    "Bantuan juru bahasa",
  ],
  serviceTexts: [
    "Diskusikan rencana, pertanyaan, dan langkah praktis berikutnya.",
    "Pahami hal yang perlu dikonfirmasi dan bantuan dokumen yang mungkin berguna.",
    "Siapkan bantuan bahasa untuk percakapan dan janji temu penting.",
  ],
  notAvailable:
    "Pemesanan layanan dan unggah dokumen belum tersedia. Area ini menjelaskan dukungan yang direncanakan, bukan membuat pesanan.",
  guidance:
    "Informasi edukatif, bukan nasihat hukum. Tidak ada jaminan pernikahan, visa, atau persetujuan pemerintah.",
  requirementWarning:
    "Persyaratan dapat berubah. Konfirmasikan persyaratan terbaru kepada instansi resmi terkait atau tim profesional kami sebelum bertindak.",
  premium: "Premium",
  premiumTitle: "Lebih banyak pilihan. Rasa hormat yang sama.",
  premiumText:
    "Koneksi utama tetap gratis: buat profil, temukan orang, tunjukkan minat, cocokkan, dan berbincang. Premium kelak memberi kemudahan, bukan menjual akses kepada seseorang.",
  free: "Gratis · tersedia sekarang",
  planned: "Premium · direncanakan",
  freeBenefits: [
    "Penemuan anggota dan favorit",
    "Kecocokan bersama dan pesan pribadi",
    "Privasi, pemblokiran, dan pelaporan",
  ],
  premiumBenefits: [
    "Pilihan pencarian lebih terperinci",
    "Preferensi visibilitas tambahan",
    "Potensi manfaat layanan profesional",
  ],
  premiumNotice:
    "Premium belum dapat dibeli. Harga dan manfaat akhir belum ditentukan.",
  safety: "Luangkan waktu. Bangun kepercayaan.",
  safetyText:
    "Verifikasi email memastikan alamat email, bukan identitas atau niat seseorang. Jangan kirim uang kepada kenalan yang belum diverifikasi secara mandiri.",
  chapter: "BAB BERIKUTNYA",
  viewPlans: "Kenali rencana keanggotaan",
  onboardNote:
    "Profilmu milikmu. Mulai dari hal penting, lalu bagikan lebih banyak saat siap.",
  membersOnly:
    "Khusus dewasa · Foto anggota pribadi · Pesan setelah saling cocok",
  sharedWith: "Dibagikan kepada anggota yang diizinkan",
  returnDiscover: "Kembali ke penemuan",
};
export const productCopy: Record<Locale, typeof tr> = { en, tr, id };
