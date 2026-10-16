import type { Locale } from "@/lib/i18n";
const id = {
  worldEyebrow: "EMPAT RUANG, SATU JEMBATAN",
  worldTitle: "Dukungan yang saling terhubung.",
  worldIntro:
    "Ada kebutuhan yang berjalan bersama. Temukan gambaran besarnya, lalu mulai dari satu langkah yang relevan untuk Anda.",
  worldNames: [
    "Pernikahan & Keluarga",
    "Dokumen",
    "Bahasa",
    "Arahan & Interpreter",
  ],
  worldTexts: [
    "Persiapan pasangan, koordinasi dokumen, dan komunikasi keluarga lintas budaya.",
    "Daftar yang tertata, pertanyaan yang tepat, dan persiapan sebelum tahap berikutnya.",
    "Terjemahan untuk kebutuhan tertulis dan bahasa Turki untuk percakapan sehari-hari.",
    "Percakapan yang terarah, perencanaan proses, dan dukungan komunikasi lisan.",
  ],
  connectionEyebrow: "INDONESIA ↔ TÜRKİYE",
  connectionTitle: "Dua negara.\nLangkah yang lebih jelas.",
  connectionCaption:
    "Dari pertanyaan pertama hingga rencana yang lebih terarah.",
  connectionLabels: ["Rencana", "Dokumen", "Bahasa"],
  safetyEyebrow: "KEJELASAN SEBELUM KOMITMEN",
  safetyTitle: "Nyaman bercerita.\nTahu batasannya.",
  safetyIntro:
    "Bantuan yang baik dimulai dari informasi yang relevan, ruang lingkup yang jelas, dan keputusan yang Anda pahami.",
  safetyPoints: [
    "Informasi awal saja",
    "Akses yang terbatas",
    "Cakupan disepakati",
    "Keputusan resmi tetap independen",
  ],
  safetyTexts: [
    "Jangan kirim paspor, kartu identitas, izin tinggal, atau data sensitif melalui form ini.",
    "Permintaan dan catatan internal hanya dapat diakses admin yang berwenang.",
    "Jenis bantuan, penyedia, biaya, dan waktu dibahas sebelum layanan dimulai.",
    "Tidak ada jaminan persetujuan pemerintah atau penerimaan dokumen.",
  ],
  noticeTitle: "Yang perlu Anda ketahui",
  finalEyebrow: "MULAI DARI SATU PERCAKAPAN",
  finalTitle: "Kebutuhan Anda,\nlangkah berikutnya.",
  finalText:
    "Tidak perlu memahami seluruh proses hari ini. Ceritakan situasi Anda, lalu bahas dukungan yang sesuai.",
  finalCta: "Ceritakan kebutuhan Anda",
  formContact: "Informasi kontak",
  formDetails: "Kebutuhan Anda",
  formConsent: "Privasi & persetujuan",
  formSuccessTitle: "Permintaan Anda tersimpan.",
  languageNav: "Pilihan bahasa",
  phraseMeanings: ["Halo", "Terima kasih", "Apa kabar?"],
  resourceTitle: "Belajar dan mempersiapkan diri.",
  resourceText:
    "Bacaan awal untuk memahami pertanyaan yang perlu dibawa ke percakapan berikutnya.",
};
type BrandCopy = {
  [K in keyof typeof id]: (typeof id)[K] extends string[] ? string[] : string;
};
const tr: BrandCopy = {
  worldEyebrow: "DÖRT ALAN, TEK KÖPRÜ",
  worldTitle: "Birbirini tamamlayan destek.",
  worldIntro:
    "Bazı ihtiyaçlar birlikte ilerler. Bütünü görün, ardından size uygun tek bir adımla başlayın.",
  worldNames: ["Evlilik ve Aile", "Belgeler", "Dil", "Rehberlik ve Tercüman"],
  worldTexts: [
    "Çiftlerin hazırlığı, belge koordinasyonu ve kültürler arası aile iletişimi.",
    "Düzenli listeler, doğru sorular ve sonraki aşama için hazırlık.",
    "Yazılı ihtiyaçlar için çeviri; günlük iletişim için Türkçe.",
    "Anlaşılır görüşmeler, süreç planı ve sözlü iletişim desteği.",
  ],
  connectionEyebrow: "ENDONEZYA ↔ TÜRKİYE",
  connectionTitle: "İki ülke.\nDaha anlaşılır adımlar.",
  connectionCaption: "İlk sorudan daha düzenli bir plana doğru.",
  connectionLabels: ["Plan", "Belgeler", "Dil"],
  safetyEyebrow: "KARAR ÖNCESİNDE AÇIKLIK",
  safetyTitle: "Rahatça anlatın.\nSınırları bilin.",
  safetyIntro:
    "İyi destek; ilgili bilgiler, açık bir kapsam ve anladığınız kararlarla başlar.",
  safetyPoints: [
    "Yalnızca ilk bilgiler",
    "Sınırlı erişim",
    "Kararlaştırılan kapsam",
    "Resmi kararlar bağımsızdır",
  ],
  safetyTexts: [
    "Bu formdan pasaport, kimlik, ikamet izni veya hassas bilgi göndermeyin.",
    "Taleplere ve dahili notlara yalnızca yetkili adminler erişebilir.",
    "Destek türü, sağlayıcı, ücret ve zaman hizmet başlamadan önce görüşülür.",
    "Kamu onayı veya belge kabulü garanti edilmez.",
  ],
  noticeTitle: "Bilmeniz gerekenler",
  finalEyebrow: "TEK BİR GÖRÜŞMEYLE BAŞLAYIN",
  finalTitle: "İhtiyacınızdan\nsonraki adıma.",
  finalText:
    "Bugün bütün süreci bilmeniz gerekmiyor. Durumunuzu anlatın, ihtiyacınıza uygun desteği görüşelim.",
  finalCta: "İhtiyacınızı anlatın",
  formContact: "İletişim bilgileri",
  formDetails: "İhtiyacınız",
  formConsent: "Gizlilik ve onay",
  formSuccessTitle: "Talebiniz kaydedildi.",
  languageNav: "Dil seçimi",
  phraseMeanings: ["Selamlaşma", "Teşekkür etme", "Hal hatır sorma"],
  resourceTitle: "Öğrenmek ve hazırlanmak için.",
  resourceText:
    "Sonraki görüşmeye hangi soruları taşıyacağınızı anlamak için başlangıç okumaları.",
};
export const brandCopy: Record<Locale, BrandCopy> = { id, tr, en: id };
export type ServiceWorld = "marriage" | "documents" | "language" | "guidance";
export const serviceWorlds: { key: ServiceWorld; slugs: string[] }[] = [
  { key: "marriage", slugs: ["menikah-di-turkiye"] },
  { key: "documents", slugs: ["dokumen", "pemeriksaan-dokumen"] },
  { key: "language", slugs: ["terjemahan", "kursus-bahasa-turki"] },
  { key: "guidance", slugs: ["konsultasi", "interpreter"] },
];
export const worldForService = (slug: string): ServiceWorld =>
  serviceWorlds.find((w) => w.slugs.includes(slug))?.key || "guidance";

// Reference the existing localized FAQ collection; the full FAQ route stays complete.
export const serviceFaqs: Record<string, number[]> = {
  marriage: [3, 7, 1, 6, 11],
  documents: [7, 1, 6, 9, 11],
  translation: [4, 9, 6, 11],
  interpreter: [5, 9, 6, 11],
  consultation: [2, 9, 11, 12],
  course: [8, 9, 11, 12],
  precheck: [6, 7, 1, 11],
};
