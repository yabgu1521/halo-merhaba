import type { Locale } from "./i18n";
const en = {
  title: "Meet someone worth knowing.",
  intro:
    "Find serious relationship and marriage candidates across Türkiye and Indonesia. Friendship and language exchange are welcome too.",
  hero: "Find your person.\nUnderstand your connection.",
  heroText:
    "Meet adults seeking a serious relationship or marriage. Search real profiles, define who you want to meet, and understand why a candidate may be right for you.",
  preferences: "Who I want to meet",
  preferenceHelp:
    "Choose what matters to you. Saved preferences apply to For You, New Members, Discover and Search. Nothing is inferred from your name or photo.",
  genders: "Gender(s) I want to meet",
  any: "No preference",
  anyHelp:
    "Leave a group unselected if you have no preference. Selected countries or languages mean any one of those choices.",
  countries: "Preferred countries",
  languages: "Preferred spoken languages",
  intention: "Preferred relationship intention",
  relocation: "Relocation expectation",
  aboutLooking: "What I am looking for",
  share:
    "Share my looking-for summary and selected preferences with permitted members",
  private:
    "Private by default. Your preferences can guide discovery without being shown on your profile.",
  save: "Save matchmaking preferences",
  resetPreferences: "Reset matchmaking preferences",
  search: "Search candidates",
  discover: "Discover",
  essentials: "Essential filters",
  moreFilters: "More filters",
  photo: "With profile photo",
  sharedOnly:
    "Life-context filters use only information the member voluntarily shares. Hidden details never influence these filters.",
  fit: "Your preference fit",
  shared: "Shared compatibility",
  why: "Why this candidate?",
  fitAge: "Within your preferred age range",
  fitCountry: "Matches your country preference",
  fitGender: "Matches your gender preference",
  fitPurpose: "Matches your relationship intention",
  fitLanguage: "Speaks a language you prefer",
  fitRelocation: "Matches your relocation expectation",
  bothRelocate: "You both shared that you are open to relocating",
  futureTogether: "A future-country plan in common",
  forYou:
    "Candidates meeting your saved preferences, ordered by shared intentions, interests and languages. No paid boosts or hidden scores.",
  activePreferences:
    "Your matchmaking preferences are applied. Search filters narrow these results further.",
  noPreferences:
    "Tell us who you want to meet to make For You more useful. Until then, browse visible adult profiles without inferred preferences.",
  editPreferences: "Edit who I want to meet",
  emptyTitle: "No candidates match these choices yet.",
  emptyText:
    "Try clearing one search filter, widening your preferred age range, or considering another country. Your saved preferences are never silently ignored.",
  clearSearch: "Clear search filters",
  complete: "A more useful profile starts with clear information.",
  completeHelp:
    "Add your introduction, languages, interests and who you want to meet. Optional life plans are yours to share when ready.",
  interests: "Interest activity",
  interestsHelp:
    "People you have expressed interest in. Incoming interest is not exposed here. A conversation becomes available after mutual interest.",
  noInterests: "No interests sent yet. Find someone you would like to know.",
  actionGuide:
    "Favorite is a private bookmark. Interest can lead to a mutual match. Messaging opens only after matching.",
  notShared:
    "This member has not shared a looking-for summary. Ask respectfully after matching.",
  optionalPrompt:
    "Define who you want to meet before discovering candidates. You can change these choices at any time.",
  savedSearch: "Save this search",
  unavailable:
    "Candidate search is temporarily unavailable. Your existing connections remain available.",
  invite: "Invite someone you know",
  inviteText:
    "Share our public homepage with an adult who may value meaningful international connections. Never share private member profiles.",
};
type Copy = { [K in keyof typeof en]: string };
export const matchmakingCopy: Record<Locale, Copy> = {
  en,
  tr: {
    title: "Tanımaya değer biriyle tanışın.",
    intro:
      "Türkiye ve Endonezya arasında ciddi ilişki ve evlilik adaylarını keşfedin. Arkadaşlık ve dil paylaşımına da yer var.",
    hero: "Aradığınız insanı bulun.\nBağınızı anlayın.",
    heroText:
      "Ciddi ilişki veya evlilik arayan yetişkinlerle tanışın. Gerçek profilleri arayın, kimi tanımak istediğinizi belirleyin ve bir adayın neden size uygun olabileceğini anlayın.",
    preferences: "Kimi tanımak istiyorum",
    preferenceHelp:
      "Sizin için önemli olanı seçin. Tercihleriniz Senin için, Yeni katılanlar, Keşfet ve Arama için geçerlidir. İsminizden veya fotoğrafınızdan çıkarım yapılmaz.",
    genders: "Tanımak istediğim cinsiyetler",
    any: "Tercih belirtmiyorum",
    anyHelp:
      "Bir tercihiniz yoksa grubu boş bırakın. Seçtiğiniz ülkeler veya dillerden herhangi biri yeterlidir.",
    countries: "Tercih edilen ülkeler",
    languages: "Tercih edilen konuşulan diller",
    intention: "Tercih edilen ilişki niyeti",
    relocation: "Taşınma beklentisi",
    aboutLooking: "Ne arıyorum",
    share: "Arayış özetimi ve seçtiğim tercihleri izin verilen üyelerle paylaş",
    private:
      "Varsayılan olarak gizlidir. Tercihleriniz profilinizde gösterilmeden keşfi yönlendirebilir.",
    save: "Eşleşme tercihlerini kaydet",
    resetPreferences: "Eşleşme tercihlerini sıfırla",
    search: "Aday ara",
    discover: "Keşfet",
    essentials: "Temel filtreler",
    moreFilters: "Diğer filtreler",
    photo: "Profil fotoğrafı olanlar",
    sharedOnly:
      "Yaşam bilgisi filtreleri yalnızca üyenin paylaşmayı seçtiği bilgileri kullanır. Gizli bilgiler bu filtreleri etkilemez.",
    fit: "Tercihlerinize uygunluk",
    shared: "Ortak uyumluluk noktaları",
    why: "Neden bu aday?",
    fitAge: "Tercih ettiğiniz yaş aralığında",
    fitCountry: "Ülke tercihinize uyuyor",
    fitGender: "Cinsiyet tercihinize uyuyor",
    fitPurpose: "İlişki niyetinize uyuyor",
    fitLanguage: "Tercih ettiğiniz bir dili konuşuyor",
    fitRelocation: "Taşınma beklentinize uyuyor",
    bothRelocate: "İkiniz de taşınmaya açık olduğunuzu paylaştınız",
    futureTogether: "Gelecek ülke planında ortak nokta",
    forYou:
      "Kaydettiğiniz tercihlere uyan adaylar; ortak niyet, ilgi alanı ve dillere göre sıralanır. Ücretli öne çıkarma veya gizli puan yoktur.",
    activePreferences:
      "Eşleşme tercihleriniz uygulanıyor. Arama filtreleri bu sonuçları daha da daraltır.",
    noPreferences:
      "Senin için bölümünü geliştirmek için kimi tanımak istediğinizi belirtin. O zamana kadar çıkarım yapılmadan görünür yetişkin profilleri keşfedebilirsiniz.",
    editPreferences: "Kimi aradığımı düzenle",
    emptyTitle: "Bu seçimlere uyan aday henüz yok.",
    emptyText:
      "Bir arama filtresini kaldırmayı, tercih ettiğiniz yaş aralığını genişletmeyi veya başka bir ülkeyi düşünmeyi deneyin. Kaydettiğiniz tercihler sessizce yok sayılmaz.",
    clearSearch: "Arama filtrelerini temizle",
    complete: "Daha yararlı bir profil, açık bilgilerle başlar.",
    completeHelp:
      "Tanıtımınızı, dillerinizi, ilgi alanlarınızı ve kimi aradığınızı ekleyin. İsteğe bağlı yaşam planlarını hazır olduğunuzda paylaşın.",
    interests: "İlgi hareketleri",
    interestsHelp:
      "İlgi gösterdiğiniz kişiler. Gelen ilgiler burada açıklanmaz. Karşılıklı ilgi oluştuğunda konuşma açılır.",
    noInterests: "Henüz ilgi göndermediniz. Tanımak istediğiniz birini bulun.",
    actionGuide:
      "Favori özel bir yer imidir. İlgi karşılıklı eşleşmeye dönüşebilir. Mesajlaşma yalnızca eşleştikten sonra açılır.",
    notShared:
      "Bu üye arayış özetini paylaşmadı. Eşleştikten sonra saygıyla sorabilirsiniz.",
    optionalPrompt:
      "Adayları keşfetmeden önce kimi tanımak istediğinizi belirleyin. Seçimlerinizi istediğiniz zaman değiştirebilirsiniz.",
    savedSearch: "Bu aramayı kaydet",
    unavailable:
      "Aday arama geçici olarak kullanılamıyor. Mevcut bağlantılarınız kullanılabilir.",
    invite: "Tanıdığınız birini davet edin",
    inviteText:
      "Anlamlı uluslararası bağlara değer verebilecek bir yetişkinle açık ana sayfamızı paylaşın. Özel üye profillerini paylaşmayın.",
  },
  id: {
    title: "Kenali seseorang yang berarti.",
    intro:
      "Temukan calon pasangan serius dan pernikahan di Türkiye dan Indonesia. Persahabatan dan pertukaran bahasa juga diterima.",
    hero: "Temukan pasanganmu.\nPahami kecocokan kalian.",
    heroText:
      "Kenali orang dewasa yang mencari hubungan serius atau pernikahan. Telusuri profil nyata, tentukan siapa yang ingin kamu temui, dan pahami alasan calon pasangan mungkin sesuai.",
    preferences: "Siapa yang ingin saya temui",
    preferenceHelp:
      "Pilih hal yang penting bagimu. Preferensi berlaku untuk Untukmu, Anggota baru, Jelajahi, dan Pencarian. Tidak ada dugaan dari nama atau foto.",
    genders: "Gender yang ingin saya temui",
    any: "Tidak ada preferensi",
    anyHelp:
      "Kosongkan grup jika tidak ada preferensi. Salah satu negara atau bahasa yang dipilih sudah cukup.",
    countries: "Negara pilihan",
    languages: "Bahasa yang dikuasai pilihan",
    intention: "Tujuan hubungan pilihan",
    relocation: "Harapan untuk pindah",
    aboutLooking: "Yang saya cari",
    share:
      "Bagikan ringkasan dan preferensi saya kepada anggota yang diizinkan",
    private:
      "Pribadi secara bawaan. Preferensi dapat memandu penemuan tanpa ditampilkan di profil.",
    save: "Simpan preferensi pasangan",
    resetPreferences: "Atur ulang preferensi pasangan",
    search: "Cari calon pasangan",
    discover: "Jelajahi",
    essentials: "Filter utama",
    moreFilters: "Filter lainnya",
    photo: "Dengan foto profil",
    sharedOnly:
      "Filter konteks kehidupan hanya menggunakan informasi yang dibagikan secara sukarela. Detail tersembunyi tidak memengaruhi filter ini.",
    fit: "Kesesuaian preferensimu",
    shared: "Kesamaan kalian",
    why: "Mengapa calon ini?",
    fitAge: "Dalam rentang usia pilihanmu",
    fitCountry: "Sesuai negara pilihanmu",
    fitGender: "Sesuai preferensi gendermu",
    fitPurpose: "Sesuai tujuan hubunganmu",
    fitLanguage: "Menguasai bahasa pilihanmu",
    fitRelocation: "Sesuai harapan pindahmu",
    bothRelocate: "Kalian sama-sama menyatakan terbuka untuk pindah",
    futureTogether: "Rencana negara masa depan yang sama",
    forYou:
      "Calon yang memenuhi preferensi tersimpan, diurutkan menurut tujuan, minat, dan bahasa bersama. Tanpa promosi berbayar atau skor tersembunyi.",
    activePreferences:
      "Preferensi pasanganmu diterapkan. Filter pencarian mempersempit hasil lebih lanjut.",
    noPreferences:
      "Ceritakan siapa yang ingin kamu temui agar Untukmu lebih berguna. Sementara itu, jelajahi profil dewasa yang terlihat tanpa preferensi yang diduga.",
    editPreferences: "Ubah siapa yang ingin ditemui",
    emptyTitle: "Belum ada calon yang sesuai pilihan ini.",
    emptyText:
      "Coba hapus satu filter, perluas usia pilihan, atau pertimbangkan negara lain. Preferensi tersimpan tidak pernah diam-diam diabaikan.",
    clearSearch: "Hapus filter pencarian",
    complete: "Profil yang lebih berguna dimulai dari informasi yang jelas.",
    completeHelp:
      "Tambahkan perkenalan, bahasa, minat, dan siapa yang ingin ditemui. Bagikan rencana hidup opsional saat siap.",
    interests: "Aktivitas minat",
    interestsHelp:
      "Orang yang telah kamu minati. Minat masuk tidak ditampilkan di sini. Percakapan tersedia setelah minat bersama.",
    noInterests:
      "Belum mengirim minat. Temukan seseorang yang ingin kamu kenal.",
    actionGuide:
      "Favorit adalah penanda pribadi. Minat bisa menjadi kecocokan bersama. Pesan tersedia setelah saling cocok.",
    notShared:
      "Anggota ini belum membagikan ringkasan pencariannya. Tanyakan dengan sopan setelah cocok.",
    optionalPrompt:
      "Tentukan siapa yang ingin ditemui sebelum menjelajahi calon. Kamu bisa mengubahnya kapan saja.",
    savedSearch: "Simpan pencarian ini",
    unavailable:
      "Pencarian calon sementara tidak tersedia. Koneksi yang ada tetap tersedia.",
    invite: "Undang kenalanmu",
    inviteText:
      "Bagikan halaman publik kami kepada orang dewasa yang menghargai hubungan lintas negara. Jangan bagikan profil pribadi anggota.",
  },
};
