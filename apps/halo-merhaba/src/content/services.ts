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
  provisionalPrice?: number;
};
const text = (id: string, tr: string): LocalText => ({ id, tr, en: id });
export const services: Service[] = [
  {
    slug: "menikah-di-turkiye",
    kind: "marriage",
    icon: "rings",
    name: text("Menikah di Türkiye", "Türkiye’de evlilik"),
    short: text(
      "Persiapkan pertanyaan dan langkah sebelum memulai proses.",
      "Sürece başlamadan önce sorularını ve adımlarını hazırla.",
    ),
    audience: text(
      "WNI dan pasangan yang sedang mempertimbangkan proses pernikahan terkait Türkiye.",
      "Türkiye ile ilgili evlilik sürecini değerlendiren Endonezya vatandaşları ve çiftler.",
    ),
    problem: text(
      "Informasi tersebar dan setiap situasi bisa berbeda. Kamu perlu tahu apa yang harus ditanyakan, kepada siapa.",
      "Bilgiler dağınık ve her durum farklı olabilir. Kime ne sorman gerektiğini netleştirmek istersin.",
    ),
    help: {
      id: [
        "Memetakan pertanyaan berdasarkan situasi yang kamu jelaskan",
        "Membantu menyusun daftar konfirmasi untuk instansi terkait",
        "Mengidentifikasi kebutuhan konsultasi, dokumen, atau dukungan bahasa",
      ],
      tr: [
        "Anlattığın duruma göre soruları haritalandırma",
        "İlgili kuruma sorulacak teyit listesini düzenleme",
        "Danışmanlık, belge veya dil desteği ihtiyacını ayırma",
      ],
      en: [],
    },
  },
  {
    slug: "dokumen",
    kind: "documents",
    icon: "file",
    name: text("Dokumen & Persiapan Berkas", "Belge ve dosya hazırlığı"),
    short: text(
      "Buat daftar dokumen dan pertanyaan lebih teratur.",
      "Belge listesini ve sorularını daha düzenli hale getir.",
    ),
    audience: text(
      "Orang yang perlu menata persiapan dokumen Indonesia–Türkiye tanpa mengirim berkas identitas di formulir publik.",
      "Herkese açık forma kimlik belgesi göndermeden Endonezya–Türkiye evrak hazırlığını düzenlemek isteyenler.",
    ),
    problem: text(
      "Sulit membedakan mana yang sudah ada, apa yang masih perlu ditanyakan, dan siapa yang harus mengonfirmasi.",
      "Hazır olanı, sorulması gerekeni ve teyit merciini ayırt etmek zor olabilir.",
    ),
    help: {
      id: [
        "Mengorganisasi kategori dan status dokumen",
        "Menyusun pertanyaan tentang terjemahan atau pengesahan untuk instansi penerima",
        "Menentukan apakah pemeriksaan awal yang terbatas relevan",
      ],
      tr: [
        "Belge kategorilerini ve durumlarını düzenleme",
        "Çeviri veya tasdik için alıcı kuruma yöneltilecek soruları toparlama",
        "Sınırlı ön kontrolün uygun olup olmadığını belirleme",
      ],
      en: [],
    },
  },
  {
    slug: "terjemahan",
    kind: "translation",
    icon: "language",
    name: text("Terjemahan Indonesia ↔ Türkçe", "Endonezce ↔ Türkçe çeviri"),
    short: text(
      "Jelaskan bahasa, jenis dokumen, dan kebutuhan terjemahanmu.",
      "Dil, belge türü ve çeviri ihtiyacını açıkla.",
    ),
    audience: text(
      "Orang atau organisasi yang membutuhkan penilaian kebutuhan terjemahan Indonesia–Turki.",
      "Endonezce–Türkçe çeviri ihtiyacını değerlendirmek isteyen kişiler veya kuruluşlar.",
    ),
    problem: text(
      "Perkiraan biaya bergantung pada jenis, jumlah, tenggat, dan bentuk penerimaan. Status resmi perlu dikonfirmasi terlebih dahulu.",
      "Maliyet; tür, miktar, süre ve kabul biçimine bağlıdır. Resmi/onaylı nitelik önceden teyit edilmelidir.",
    ),
    help: {
      id: [
        "Meninjau bahasa sumber/tujuan dan perkiraan halaman",
        "Membahas tenggat yang diinginkan tanpa menjanjikan ketersediaan",
        "Mengklarifikasi apakah dibutuhkan penyedia terjemahan berkualifikasi tertentu",
      ],
      tr: [
        "Kaynak/hedef dil ve yaklaşık sayfa sayısını değerlendirme",
        "Uygunluk sözü vermeden istenen süreyi görüşme",
        "Belirli bir yetkinlikte çeviri sağlayıcısı gerekip gerekmediğini netleştirme",
      ],
      en: [],
    },
  },
  {
    slug: "interpreter",
    kind: "interpreter",
    icon: "chat",
    name: text("Interpreter", "Tercüman desteği"),
    short: text(
      "Dukungan komunikasi untuk pertemuan online atau tatap muka.",
      "Çevrimiçi veya yüz yüze görüşmeler için iletişim desteği.",
    ),
    audience: text(
      "Orang yang merencanakan pertemuan lintas bahasa dan perlu mengonfirmasi jenis bantuan yang sesuai.",
      "Diller arası görüşme planlayan ve uygun destek türünü netleştirmek isteyenler.",
    ),
    problem: text(
      "Bahasa, topik, lokasi, durasi, dan tanggal memengaruhi kebutuhan. Belum ada jadwal atau interpreter yang dijanjikan.",
      "Dil, konu, yer, süre ve tarih ihtiyacı etkiler. Takvim veya tercüman sözü verilmez.",
    ),
    help: {
      id: [
        "Memetakan konteks dan bahasa pertemuan",
        "Mencatat online/tatap muka, lokasi, tanggal, dan durasi perkiraan",
        "Mengonfirmasi cakupan dan penyedia yang tersedia sebelum kesepakatan",
      ],
      tr: [
        "Görüşmenin bağlamını ve dillerini belirleme",
        "Çevrimiçi/yüz yüze, yer, tarih ve yaklaşık süreyi kaydetme",
        "Anlaşma öncesi kapsamı ve uygun sağlayıcıyı teyit etme",
      ],
      en: [],
    },
  },
  {
    slug: "konsultasi",
    kind: "consultation",
    icon: "compass",
    name: text("Konsultasi", "Danışmanlık"),
    short: text(
      "Mulai dari situasimu, lalu perjelas pilihan berikutnya.",
      "Durumundan başlayıp sonraki seçenekleri netleştir.",
    ),
    audience: text(
      "Orang yang memiliki pertanyaan terkait kehidupan atau persiapan Indonesia–Türkiye dan membutuhkan pembahasan terarah.",
      "Endonezya–Türkiye yaşam veya hazırlık süreçleri hakkında sorularını düzenli biçimde görüşmek isteyenler.",
    ),
    problem: text(
      "Jawaban umum tidak selalu menjelaskan prioritas untuk situasi pribadi. Cakupan konsultasi perlu disepakati.",
      "Genel yanıtlar kişisel öncelikleri her zaman açıklamaz. Görüşmenin kapsamı netleştirilmelidir.",
    ),
    help: {
      id: [
        "Memahami topik dan konteks yang kamu sampaikan",
        "Membantu mengelompokkan pertanyaan dan langkah tindak lanjut",
        "Mengidentifikasi kapan perlu pihak atau profesional yang berwenang",
      ],
      tr: [
        "Paylaştığın konu ve bağlamı anlama",
        "Soruları ve takip adımlarını gruplandırmaya yardım",
        "Yetkili kurum veya profesyonelin ne zaman gerektiğini ayırt etme",
      ],
      en: [],
    },
  },
  {
    slug: "kursus-bahasa-turki",
    kind: "course",
    icon: "book",
    name: text("Kursus Bahasa Turki", "Türkçe kursu"),
    short: text(
      "A1, A2, percakapan, atau les privat — sampaikan minatmu.",
      "A1, A2, konuşma veya özel ders — ilgini belirt.",
    ),
    audience: text(
      "Orang Indonesia yang ingin mempelajari bahasa Turki untuk komunikasi sehari-hari.",
      "Günlük iletişim için Türkçe öğrenmek isteyen Endonezyalılar.",
    ),
    problem: text(
      "Kamu ingin tahu program yang sesuai. Guru, jadwal, biaya, dan kapasitas belum diumumkan.",
      "Uygun programı öğrenmek istersin. Eğitmen, takvim, ücret ve kapasite henüz açıklanmadı.",
    ),
    help: {
      id: [
        "Mencatat level dan format belajar yang diminati",
        "Memahami tujuan dan bahasa pengantar yang diinginkan",
        "Menghubungi kembali jika program dan informasi relevan tersedia, sesuai izin",
      ],
      tr: [
        "İlgilenilen seviye ve öğrenme biçimini kaydetme",
        "Hedefi ve istenen eğitim dilini anlama",
        "İzin kapsamında ilgili program ve bilgiler hazır olduğunda iletişime geçme",
      ],
      en: [],
    },
  },
  {
    slug: "pemeriksaan-dokumen",
    kind: "precheck",
    icon: "check",
    provisionalPrice: source.services.find((s) => s.id === "document-precheck")
      ?.proposed_test_price?.amount,
    name: text("Pemeriksaan Awal Dokumen", "Belge Ön Kontrol"),
    short: text(
      "Penilaian awal yang terbatas sebelum konsultasi lebih lanjut.",
      "Daha kapsamlı görüşme öncesinde sınırlı ilk değerlendirme.",
    ),
    audience: text(
      "Orang yang ingin memperjelas daftar pertanyaan tentang dokumen, tanpa mengirim berkas sensitif di formulir ini.",
      "Bu formda hassas belge göndermeden, belge sorularını netleştirmek isteyenler.",
    ),
    problem: text(
      "Belum yakin apa yang kurang atau perlu dikonfirmasi. Formulir awal hanya menerima kategori dan penjelasan non-sensitif.",
      "Neyin eksik olduğu veya teyit gerektiği belirsiz olabilir. İlk form yalnızca kategori ve hassas olmayan açıklama kabul eder.",
    ),
    help: {
      id: [
        "Ringkasan hal yang tampak belum jelas berdasarkan penjelasan awal",
        "Pertanyaan untuk instansi terkait",
        "Saran langkah berikutnya, sesuai cakupan yang disepakati",
      ],
      tr: [
        "İlk açıklamaya göre belirsiz görünenlerin özeti",
        "İlgili kuruma sorulacak sorular",
        "Kararlaştırılan kapsamda önerilen sonraki adım",
      ],
      en: [],
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
