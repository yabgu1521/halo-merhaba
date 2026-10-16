import type { Locale } from "@/lib/i18n";
import type { LocalText } from "./catalog";
type Section = {
  heading: LocalText;
  body: LocalText;
  items: Record<Locale, string[]>;
};
export type Guide = {
  id: string;
  category: "marriage" | "documents" | "language" | "life" | "culture";
  title: LocalText;
  description: LocalText;
  minutes: number;
  product: string;
  sections: Section[];
};
export const guides: Guide[] = [
  {
    id: "menikah-di-turkiye-wni",
    category: "marriage",
    title: {
      tr: "Türkiye’de evlenmek isteyen WNI nereden başlamalı?",
      id: "Syarat Menikah di Türkiye untuk WNI: mulai dari mana?",
      en: "Getting married in Türkiye as an Indonesian: where to begin?",
    },
    description: {
      tr: "Belge toplamadan önce doğru soruları sormak için bir hazırlık rehberi.",
      id: "Panduan persiapan untuk mengajukan pertanyaan yang tepat sebelum mengumpulkan dokumen.",
      en: "A preparation guide to asking the right questions before collecting documents.",
    },
    minutes: 5,
    product: "marriage-checklist-wni",
    sections: [
      {
        heading: {
          tr: "Önce kendi durumunu tanımla",
          id: "Mulai dari situasimu sendiri",
          en: "Start with your own situation",
        },
        body: {
          tr: "İnternetteki tek bir liste, her başvuru için doğru olmayabilir. Vatandaşlık, ikamet ve kişisel durumunu bir araya getirip başvuracağın kuruma sorulacak soruları hazırlamak iyi bir ilk adımdır.",
          id: "Satu daftar di internet belum tentu sesuai untuk setiap pengajuan. Catat kewarganegaraan, tempat tinggal, dan situasi pribadi, lalu siapkan pertanyaan untuk instansi tujuan.",
          en: "A single online checklist may not suit every application. Outline citizenship, residence, and your personal situation before preparing questions for the receiving authority.",
        },
        items: {
          tr: [
            "Başvuruyu hangi kurum değerlendirecek?",
            "İki tarafın vatandaşlık ve ikamet durumu nedir?",
            "Önceki medeni durumla ilgili hangi sorular sorulmalı?",
          ],
          id: [
            "Instansi mana yang menerima pengajuan?",
            "Apa kewarganegaraan dan status tempat tinggal kedua pihak?",
            "Pertanyaan apa yang perlu diajukan tentang status perkawinan sebelumnya?",
          ],
          en: [
            "Which authority will receive the application?",
            "What are both parties’ citizenship and residence situations?",
            "What questions need to be asked about any previous marital status?",
          ],
        },
      },
      {
        heading: {
          tr: "Belge listesi yerine, teyit listesiyle başla",
          id: "Mulai dengan daftar konfirmasi",
          en: "Start with a confirmation checklist",
        },
        body: {
          tr: "Aşağıdakiler kesin bir evrak listesi değil, yetkili kuruma yöneltilecek soru örnekleridir. Belgenin adı kadar kabul edilen biçimi ve geçerlilik süresi de önemlidir.",
          id: "Ini bukan daftar dokumen definitif, melainkan contoh pertanyaan untuk instansi berwenang. Format yang diterima dan masa berlaku juga penting.",
          en: "These are questions for the relevant authority, not a definitive list of required documents. Accepted format and validity matter as well as a document’s name.",
        },
        items: {
          tr: [
            "Kimlik, doğum ve medeni durum için hangi belgeler isteniyor?",
            "Asıl belge mi, onaylı örnek mi kabul ediliyor?",
            "Tercüme veya tasdik işlemleri hangi sırada sorulmalı?",
            "Başvuru tarihi açısından belge geçerliliği nasıl değerlendiriliyor?",
          ],
          id: [
            "Dokumen apa untuk identitas, kelahiran, dan status perkawinan?",
            "Apakah perlu dokumen asli atau salinan yang disahkan?",
            "Bagaimana urutan terjemahan dan pengesahan perlu dikonfirmasi?",
            "Bagaimana masa berlaku dinilai pada tanggal pengajuan?",
          ],
          en: [
            "Which documents cover identity, birth, and marital status?",
            "Are originals or certified copies accepted?",
            "What sequence of translation and certification should be confirmed?",
            "How is validity assessed on the application date?",
          ],
        },
      },
      {
        heading: {
          tr: "Yanıtları ve kaynağını birlikte kaydet",
          id: "Catat jawaban beserta sumbernya",
          en: "Record answers together with their source",
        },
        body: {
          tr: "Kiminle ne zaman görüştüğünü, hangi belgeyi nasıl tarif ettiğini ve varsa resmi bağlantıyı kaydet. Farklı yanıtlar aldığında başvuru dosyasını değerlendirecek kurumdan netleştirme iste.",
          id: "Catat kapan dan dengan siapa kamu berbicara, penjelasan dokumen, dan tautan resmi jika ada. Jika jawaban berbeda, minta penjelasan dari instansi yang menilai pengajuan.",
          en: "Keep the date, authority contact, document description, and any official link. If answers differ, ask the authority assessing your application for clarification.",
        },
        items: {
          tr: [
            "Kurum ve görüşme tarihi",
            "Yazılı yanıt veya resmi kaynak",
            "Açık kalan sorular ve sonraki takip tarihi",
          ],
          id: [
            "Instansi dan tanggal komunikasi",
            "Jawaban tertulis atau sumber resmi",
            "Pertanyaan tersisa dan tanggal tindak lanjut",
          ],
          en: [
            "Authority and date of contact",
            "Written response or official source",
            "Outstanding questions and follow-up date",
          ],
        },
      },
    ],
  },
  {
    id: "dokumen-apostille-organizer",
    category: "documents",
    title: {
      tr: "Apostil, tercüme ve belge takibini nasıl düzenlersin?",
      id: "Cara merapikan dokumen, apostille, dan terjemahan",
      en: "Organizing documents, apostille questions, and translation",
    },
    description: {
      tr: "Kesin işlem sırası varsaymadan, belge dosyanı daha takip edilebilir hale getir.",
      id: "Buat dokumenmu mudah dilacak tanpa mengasumsikan urutan prosedur.",
      en: "Make your paperwork easier to follow without assuming a fixed procedure.",
    },
    minutes: 4,
    product: "document-apostille-organizer",
    sections: [
      {
        heading: {
          tr: "Her belge için tek bir kayıt aç",
          id: "Satu catatan untuk setiap dokumen",
          en: "Create one record per document",
        },
        body: {
          tr: "Dosya adlarıyla yetinme. Belgeyi düzenleyen kurum, dil, tarih ve belgenin gönderileceği yer için ayrı alanlar kullan.",
          id: "Jangan hanya mengandalkan nama berkas. Catat penerbit, bahasa, tanggal, dan instansi penerima.",
          en: "Do not rely on filenames alone. Record the issuing authority, language, date, and intended recipient.",
        },
        items: {
          tr: [
            "Belgenin adı ve düzenleyen kurum",
            "Tarih ve teyit edilmesi gereken geçerlilik",
            "Asıl / kopya durumu ve güvenli saklama yeri",
          ],
          id: [
            "Nama dokumen dan penerbit",
            "Tanggal dan masa berlaku yang perlu dikonfirmasi",
            "Asli atau salinan dan lokasi penyimpanan aman",
          ],
          en: [
            "Document name and issuer",
            "Date and validity to confirm",
            "Original/copy status and secure storage location",
          ],
        },
      },
      {
        heading: {
          tr: "İşlem gerekliliğini belgeden varsayma",
          id: "Jangan mengasumsikan pengesahan yang diperlukan",
          en: "Do not assume which certification is needed",
        },
        body: {
          tr: "Her belgeye otomatik olarak aynı işlem uygulanacağını varsayma. Apostil, başka bir tasdik, tercüme ve çevirinin onay biçimini; belgeyi kabul edecek kurumdan belge özelinde teyit et.",
          id: "Jangan menganggap setiap dokumen mengikuti prosedur yang sama. Konfirmasikan apostille, pengesahan lain, terjemahan, dan bentuk pengesahan terjemahan untuk dokumen tersebut ke instansi penerima.",
          en: "Do not assume every document follows the same process. Confirm apostille, other certification, translation, and translation approval requirements for that document with the receiving authority.",
        },
        items: {
          tr: [
            "Bu belge için hangi işlem gerekiyor?",
            "Tercümeyi kim yapmalı ve hangi biçimde sunmalı?",
            "İşlem sırası ve kabul edilen dil nasıl teyit edilecek?",
          ],
          id: [
            "Prosedur apa yang diperlukan untuk dokumen ini?",
            "Siapa yang harus menerjemahkan dan dalam bentuk apa?",
            "Bagaimana mengonfirmasi urutan dan bahasa yang diterima?",
          ],
          en: [
            "Which process is required for this document?",
            "Who should translate it and in what format?",
            "How should sequence and accepted language be confirmed?",
          ],
        },
      },
      {
        heading: {
          tr: "Hassas belgeleri rastgele paylaşma",
          id: "Jangan membagikan dokumen sensitif sembarangan",
          en: "Avoid sharing sensitive documents casually",
        },
        body: {
          tr: "İlk sorunu anlatmak için çoğu zaman belge başlığı ve ihtiyacın yeterli bir başlangıçtır. Gerçek belge paylaşmadan önce alıcının kimliğini, erişimi, saklama ve silme sürecini netleştir.",
          id: "Untuk menjelaskan pertanyaan awal, nama dokumen dan kebutuhan sering cukup sebagai permulaan. Sebelum berbagi dokumen, pastikan penerima, akses, penyimpanan, dan penghapusannya.",
          en: "A document title and your question can often start a conversation. Before sharing actual files, clarify the recipient, access, storage, and deletion process.",
        },
        items: {
          tr: [
            "Gereksiz kimlik bilgisi paylaşma",
            "Kamuya açık dosya bağlantısı kullanma",
            "Paylaşım kapsamını ve silme talebini kaydet",
          ],
          id: [
            "Jangan bagikan identitas yang tidak diperlukan",
            "Hindari tautan berkas publik",
            "Catat cakupan berbagi dan permintaan penghapusan",
          ],
          en: [
            "Avoid unnecessary identity details",
            "Do not use public file links",
            "Record sharing scope and deletion requests",
          ],
        },
      },
    ],
  },
  {
    id: "turkce-ilk-merhaba",
    category: "language",
    title: {
      tr: "Türk aileyle ilk tanışma: küçük bir konuşma rehberi",
      id: "Pertama bertemu keluarga Turki: mulai dengan merhaba",
      en: "Meeting a Turkish family: start with a little merhaba",
    },
    description: {
      tr: "Kusursuz cümlelerden önce, sıcak ve anlaşılır birkaç ifade.",
      id: "Sebelum kalimat sempurna, beberapa ungkapan yang hangat dan jelas.",
      en: "Before perfect sentences, a few warm and simple phrases.",
    },
    minutes: 3,
    product: "turkish-a1-survival",
    sections: [
      {
        heading: {
          tr: "İlk cümlelerin kısa olsun",
          id: "Mulai dengan kalimat singkat",
          en: "Keep your first sentences short",
        },
        body: {
          tr: "Kısa bir selamlaşma ve kendini tanıtma, bir konuşmayı başlatmak için yeterlidir. Anlamadığında tekrar istemek doğaldır.",
          id: "Sapaan dan perkenalan singkat cukup untuk memulai. Wajar meminta pengulangan saat belum mengerti.",
          en: "A greeting and a short introduction are enough to begin. It is natural to ask for repetition.",
        },
        items: {
          tr: [
            "Merhaba. Ben … → Halo. Saya …",
            "Tanıştığımıza memnun oldum. → Senang berkenalan.",
            "Türkçe öğreniyorum. → Saya sedang belajar bahasa Turki.",
          ],
          id: [
            "Merhaba. Ben … → Halo. Saya …",
            "Tanıştığımıza memnun oldum. → Senang berkenalan.",
            "Türkçe öğreniyorum. → Saya sedang belajar bahasa Turki.",
          ],
          en: [
            "Merhaba. Ben … → Hello. I am …",
            "Tanıştığımıza memnun oldum. → Nice to meet you.",
            "Türkçe öğreniyorum. → I am learning Turkish.",
          ],
        },
      },
      {
        heading: {
          tr: "Anlamadığında kullanacağın iki ifade",
          id: "Dua ungkapan saat belum mengerti",
          en: "Two phrases for when you need help",
        },
        body: {
          tr: "Konuşmayı takip edemediğinde daha yavaş konuşulmasını veya tekrar edilmesini isteyebilirsin.",
          id: "Kamu bisa meminta lawan bicara berbicara lebih pelan atau mengulangi.",
          en: "You can ask someone to speak more slowly or repeat what they said.",
        },
        items: {
          tr: [
            "Biraz yavaş konuşabilir misiniz? → Bisa bicara sedikit lebih pelan?",
            "Tekrar eder misiniz? → Bisa diulangi?",
          ],
          id: [
            "Biraz yavaş konuşabilir misiniz? → Bisa bicara sedikit lebih pelan?",
            "Tekrar eder misiniz? → Bisa diulangi?",
          ],
          en: [
            "Biraz yavaş konuşabilir misiniz? → Could you speak a little more slowly?",
            "Tekrar eder misiniz? → Could you repeat that?",
          ],
        },
      },
      {
        heading: {
          tr: "Küçük bir günlük çalışma planı",
          id: "Rencana latihan harian kecil",
          en: "A small daily practice routine",
        },
        body: {
          tr: "Her gün birkaç ifadeyi yüksek sesle söyle. Bir cümleyi kendi bilgilerinle değiştir ve kısa bir diyaloğu tekrar et. Bu mini kaynak, tam bir A1 kursu veya seviye sertifikası değildir.",
          id: "Ucapkan beberapa ungkapan setiap hari. Ganti satu kalimat dengan informasimu dan ulangi dialog pendek. Sumber mini ini bukan kursus A1 lengkap atau sertifikat tingkat.",
          en: "Say a few phrases aloud each day. Personalize a sentence and repeat a short dialogue. This mini resource is not a complete A1 course or proficiency certificate.",
        },
        items: {
          tr: [
            "Bugün: kendini tanıt",
            "Yarın: bir soru sor",
            "Sonraki gün: kısa bir diyalog tekrarla",
          ],
          id: [
            "Hari ini: perkenalkan diri",
            "Besok: ajukan pertanyaan",
            "Lusa: ulangi dialog singkat",
          ],
          en: [
            "Today: introduce yourself",
            "Tomorrow: ask one question",
            "Next: repeat a short dialogue",
          ],
        },
      },
    ],
  },
];
export const guideById = (id: string) => guides.find((g) => g.id === id);

// Static editorial records avoid a CMS dependency; procedural drafts need source review.
export const editorialReview = Object.fromEntries(
  guides.map((g) => [
    g.id,
    g.category === "language"
      ? "editorial_draft"
      : "official_source_review_required",
  ]),
);
guides.push({
  id: "kesalahan-persiapan-dokumen",
  category: "documents",
  title: {
    id: "Kesalahan umum saat menyiapkan dokumen Indonesia–Türkiye",
    tr: "Endonezya–Türkiye belge hazırlığında sık yapılan hatalar",
    en: "Common document preparation mistakes",
  },
  description: {
    id: "Pisahkan asumsi, jawaban instansi, dan hal yang masih perlu dikonfirmasi.",
    tr: "Varsayımları, kurum yanıtlarını ve teyit bekleyenleri ayır.",
    en: "Separate assumptions from confirmed answers.",
  },
  minutes: 4,
  product: "document-apostille-organizer",
  sections: [
    {
      heading: {
        id: "Menganggap pengalaman orang lain berlaku untuk semua",
        tr: "Başkasının deneyimini herkes için geçerli saymak",
        en: "Assuming one experience fits everyone",
      },
      body: {
        id: "Cerita orang lain bisa membantu merumuskan pertanyaan, tetapi bukan bukti persyaratan untuk situasimu. Catat apa yang perlu dikonfirmasi langsung.",
        tr: "Başkalarının deneyimi soru oluşturmaya yardımcı olabilir; kendi durumun için gereklilik kanıtı değildir. Doğrudan teyit edilecekleri kaydet.",
        en: "Other experiences can inspire questions, not establish requirements.",
      },
      items: {
        id: [
          "Tulis sumber informasi",
          "Pisahkan fakta yang dikonfirmasi dari dugaan",
          "Catat kapan perlu bertanya ulang",
        ],
        tr: [
          "Bilgi kaynağını yaz",
          "Teyit edilmiş bilgi ile varsayımı ayır",
          "Ne zaman tekrar sorulacağını kaydet",
        ],
        en: [],
      },
    },
    ...guides[1].sections.slice(1),
  ],
});
guides.push({
  id: "pertemuan-keluarga-indonesia-turkiye",
  category: "culture",
  title: {
    id: "Pertemuan keluarga Indonesia–Türkiye: persiapan dan komunikasi",
    tr: "Endonezya–Türkiye aile tanışması: hazırlık ve iletişim",
    en: "Preparing for a cross-cultural family meeting",
  },
  description: {
    id: "Membicarakan harapan dengan jelas tanpa menganggap semua keluarga sama.",
    tr: "Her aileyi aynı saymadan beklentileri açıkça konuşmak.",
    en: "Discuss expectations without treating every family as the same.",
  },
  minutes: 4,
  product: "turkish-a1-survival",
  sections: [
    {
      heading: {
        id: "Tanyakan, jangan mengasumsikan",
        tr: "Varsaymak yerine sor",
        en: "Ask instead of assuming",
      },
      body: {
        id: "Setiap keluarga berbeda. Bahas kebutuhan bahasa, siapa yang hadir, dan hal yang nyaman dibicarakan sebelum pertemuan.",
        tr: "Her aile farklıdır. Görüşmeden önce dil ihtiyacını, kimlerin katılacağını ve rahat konuşulabilecek konuları ele al.",
        en: "Every family is different. Discuss language and expectations first.",
      },
      items: {
        id: [
          "Bahasa yang dipahami bersama",
          "Bantuan komunikasi yang dibutuhkan",
          "Harapan dan batasan pribadi",
        ],
        tr: [
          "Ortak anlaşılabilen dil",
          "Gerekli iletişim desteği",
          "Kişisel beklenti ve sınırlar",
        ],
        en: [],
      },
    },
    {
      heading: {
        id: "Siapkan perkenalan singkat",
        tr: "Kısa bir tanışma hazırla",
        en: "Prepare a short introduction",
      },
      body: {
        id: "Perkenalan sederhana dan pertanyaan yang ramah cukup untuk membuka percakapan. Jika perlu, diskusikan interpreter terlebih dahulu tanpa menjanjikan ketersediaan.",
        tr: "Basit bir tanışma ve nazik sorular konuşmaya başlangıç olabilir. Gerekirse uygunluk varsaymadan tercüman ihtiyacını önceden konuş.",
        en: "A simple introduction can start a conversation.",
      },
      items: {
        id: [
          "Nama dan panggilan yang nyaman",
          "Satu hal tentang keseharianmu",
          "Pertanyaan yang ingin kamu tanyakan",
        ],
        tr: [
          "Adın ve tercih ettiğin hitap",
          "Günlük yaşamından bir şey",
          "Sormak istediğin sorular",
        ],
        en: [],
      },
    },
    {
      heading: {
        id: "Lanjutkan dengan langkah yang disepakati",
        tr: "Kararlaştırılan adımla devam et",
        en: "Agree the next step",
      },
      body: {
        id: "Setelah berbicara, rangkum apa yang sudah jelas dan apa yang masih terbuka. Keputusan penting tidak perlu dipaksakan dalam satu pertemuan.",
        tr: "Görüşmeden sonra netleşenleri ve açık kalanları özetle. Önemli kararları tek görüşmeye sığdırmak gerekmez.",
        en: "Summarize what is clear and what remains open.",
      },
      items: {
        id: [
          "Apa yang sudah dipahami?",
          "Apa yang perlu ditanyakan lagi?",
          "Kapan dan bagaimana berbicara berikutnya?",
        ],
        tr: [
          "Neler anlaşıldı?",
          "Neler tekrar sorulmalı?",
          "Sonraki görüşme nasıl ve ne zaman olacak?",
        ],
        en: [],
      },
    },
  ],
});

for (const g of guides)
  editorialReview[g.id] =
    g.category === "language" || g.category === "culture"
      ? "editorial_draft"
      : "official_source_review_required";
