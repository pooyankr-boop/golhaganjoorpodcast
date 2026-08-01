// ===================================================================
// داده‌های رادیو گل‌ها — فایل‌های mp3 تأیید شده از archive.org
// دسته‌بندی بر اساس: مجموعه‌های اصلی برنامهٔ گل‌ها
// منبع: https://archive.org/details/mousighi-irani
// ===================================================================

const GOLHA_BASE = "https://archive.org/download/mousighi-irani/";

// مجموعه‌های رسمی برنامهٔ گل‌ها در رادیو ایران
// از آنجا که فایل‌ها در آرشیو به تفکیک خواننده دسته‌بندی شده‌اند
// نه شمارهٔ برنامه، این دسته‌بندی بر اساس مجموعه‌های معروف رادیو گل‌ها
// و با تطبیق خواننده‌ها انجام شده است.

const GOLHA_COLLECTIONS = [
  {
    // ===== گل‌های جاویدان =====
    id: "golhaye-javidan",
    performer: "گل‌های جاویدان",
    subtitle: "مجموعهٔ اول برنامهٔ گل‌ها — بنان، دلکش، مرضیه",
    info: "گل‌های جاویدان نخستین مجموعه از برنامه‌های گل‌ها بود که از سال ۱۳۳۵ توسط داوود پیرنیا بنیان‌گذاری شد. این مجموعه شامل تصنیف‌ها و آوازهای کلاسیک با صدای غلامحسین بنان، دلکش، مرضیه و دیگر استادان بود.",
    tracks: [
      { file: "Banan-Ahe Sahar.mp3", title: "آه سحر" },
      { file: "Banan-Asare negah.mp3", title: "اثر نگاه" },
      { file: "Banan-Bolbole Mast.mp3", title: "بلبل مست" },
      { file: "Banan-Gole man.mp3", title: "گل من" },
      { file: "Banan-Yade Shiraz.mp3", title: "یاد شیراز" },
      { file: "Banan-Salha.mp3", title: "سال‌ها" },
      { file: "Banan-Az Yadam Nemiravi.mp3", title: "از یادم نمی‌رود" },
      { file: "Banan-shab.mp3", title: "شب" },
      { file: "Banan-Bia-Ey-Saghi.mp3", title: "بیا ای ساقی" },
      { file: "Banan-Dar Arezouye To.mp3", title: "در آرزوی تو" },
      { file: "Banan-ghame jahan.mp3", title: "غم جهان" },
      { file: "Banan-ala ya ayohasaghi.mp3", title: "الا یا ایها الساقی" },
      { file: "Delkash-Afsaneh Vafa.mp3", title: "افسانهٔ وفا" },
      { file: "Delkash-Gomrah.mp3", title: "گمراه" },
      { file: "Delkash-Setareh Omid.mp3", title: "ستارهٔ امید" },
      { file: "Delkash-Yade Koodaki.mp3", title: "یاد کودکی" },
      { file: "Delkash-Ashk E Sepehr.mp3", title: "اشک سپهر" },
      { file: "Marzieh-Bahar ayad.mp3", title: "بهار آید" },
      { file: "Marzieh-Gisoo.mp3", title: "گیسو" },
      { file: "Marzieh-Naghshe Gham.mp3", title: "نقش غم" },
      { file: "Marzieh-Sang'e Sabur.mp3", title: "سنگ صبور" },
      { file: "Marzieh-yek delo sad arezoo.mp3", title: "یک دل و صد آرزو" }
    ]
  },
  {
    // ===== گل‌های رنگارنگ =====
    id: "golhaye-rangarang",
    performer: "گل‌های رنگارنگ",
    subtitle: "مجموعهٔ اصلی — گسترده‌ترین برنامه",
    info: "گل‌های رنگارنگ (۵۸۱ برنامه) مهم‌ترین و پرطرفدارترین مجموعهٔ برنامه‌های گل‌ها بود که طی سال‌ها با حضور اکثر خوانندگان بزرگ موسیقی ایران پخش شد. این مجموعه شامل متنوع‌ترین آثار از بنان، دلکش، مرضیه، ایرج، الهه، گلپا و دیگران است.",
    tracks: [
      { file: "Iraj-Bahare Talaei+.mp3", title: "بهار طلایی" },
      { file: "Iraj-Khandeh Sobhe Bahar.mp3", title: "خندهٔ صبح بهار" },
      { file: "Iraj-Naghashe Chin.mp3", title: "نقاش چین" },
      { file: "Iraj-Selseleh Mouye Doost.mp3", title: "سلسلهٔ موی دوست" },
      { file: "Iraj-Shour.mp3", title: "شور" },
      { file: "Iraj-Aieneyeh Too.mp3", title: "آینهٔ تو" },
      { file: "Iraj-Bieganeh.mp3", title: "بیگانه" },
      { file: "Iraj-An Sarv.mp3", title: "آن سرو" },
      { file: "Iraj-Kolbeh Del.mp3", title: "کلبهٔ دل" },
      { file: "Iraj-Man Kistam.mp3", title: "من کیستم" },
      { file: "Iraj-Shooshtari.mp3", title: "شوشتری" },
      { file: "Iraj-Afshari.mp3", title: "افشاری" },
      { file: "Iraj-Diyare Afsaneh.mp3", title: "دیار افسانه" },
      { file: "Shajarian-Bahare Delkash.mp3", title: "بهار دلکش" },
      { file: "Shajarian-Dostat Daram.mp3", title: "دوستت دارم" },
      { file: "Shajarian-Javani.mp3", title: "جوانی" },
      { file: "Shajarian-Naaye Del.mp3", title: "نای دل" },
      { file: "Shajarian-Aaman.mp3", title: "امان" },
      { file: "Shajarian-HezarDastan.mp3", title: "هزار دستان" }
    ]
  },
  {
    // ===== گل‌های تازه =====
    id: "golhaye-taze",
    performer: "گل‌های تازه",
    subtitle: "مجموعهٔ برنامه‌های جدیدتر — شجریان، همایرا، گلپا",
    info: "گل‌های تازه ادامهٔ مجموعهٔ گل‌های رنگارنگ بود که با حضور خوانندگان نسل جدیدتر همچون محمدرضا شجریان، همایرا، گلپا، پریسا و سیما بینا تولید شد.",
    tracks: [
      { file: "Shajarian-Bazme Eshgh.mp3", title: "بزم عشق" },
      { file: "Shajarian-An Tork Mast bin.mp3", title: "آن ترک مست" },
      { file: "Shajarian-Daftar E Omr.mp3", title: "دفتر عمر" },
      { file: "Shajarian-Ey Eshghe Man.mp3", title: "ای عشق من" },
      { file: "Shajarian-Shaahede Aflaaki (Segah).mp3", title: "شاهد افلاکی" },
      { file: "Shajarian-Jani ke Khalas.mp3", title: "جانی که خلاص" },
      { file: "Shajarian-Koochesare Shab.mp3", title: "کوچه‌سار شب" },
      { file: "Shajarian-Che Shod ke Mahe Morad.mp3", title: "چه شد که ماه مراد" },
      { file: "Shajarian-Gar che mastim.mp3", title: "گر چه مستیم" },
      { file: "Golpa-Dar Chashme Man.mp3", title: "در چشم من" },
      { file: "Golpa-Ey Eshgh hame Bahaneh.mp3", title: "ای عشق همه بهانه" },
      { file: "Golpa-piyale Por kon.mp3", title: "پیاله پر کن" },
      { file: "Golpa-Gom Shodam.mp3", title: "گم شدم" },
      { file: "Golpa-Shoushtari.mp3", title: "شوشتری" },
      { file: "Homeyra-Ahange mohabat.mp3", title: "آهنگ محبت" },
      { file: "Homeyra-Golbarg 1.mp3", title: "گلبرگ (۱)" },
      { file: "Homeyra-Golbarg 2.mp3", title: "گلبرگ (۲)" },
      { file: "Homeyra-Golbarg 3.mp3", title: "گلبرگ (۳)" },
      { file: "Homeyra-Saze khamosh.mp3", title: "ساز خاموش" },
      { file: "Homeyra-Khoshbavar.mp3", title: "خوشباور" },
      { file: "Parisa-Abe Hayat.mp3", title: "آب حیات" },
      { file: "Parisa-Nadideh Rokhat.mp3", title: "ندیده رخت" },
      { file: "Parisa-Yousefe Khoshnam.mp3", title: "یوسف خوشنام" }
    ]
  },
  {
    // ===== یک شاخه گل =====
    id: "yek-shakheh-gol",
    performer: "یک شاخه گل",
    subtitle: "برنامه‌های تک‌خوان — اجراهای خصوصی‌تر",
    info: "یک شاخه گل مجموعه‌ای از برنامه‌های تک‌خوان بود که در آن هر برنامه به یک خواننده یا یک تصنیف خاص اختصاص داشت.",
    tracks: [
      { file: "Ghavami-Che Bashad.mp3", title: "چه باشد" },
      { file: "Ghavami-Nava.mp3", title: "نوا" },
      { file: "Ghavami-Saghi Nmaeh.mp3", title: "ساقی‌نامه" },
      { file: "Ghavami-Bahare Asheghan@MousighiGolha.mp3", title: "بهار عاشقان" },
      { file: "Ghavami-Delam Joz Eshgh.mp3", title: "دلم جز عشق" },
      { file: "Ghavami-Ta daman az man keshidi.mp3", title: "تا دامن از من کشیدی" },
      { file: "Parvin-Ghoghay Setaregan.mp3", title: "غوغای ستارگان" },
      { file: "Parvin-Zemestan Ast.mp3", title: "زمستان است" },
      { file: "Parvin-Che Konam.mp3", title: "چه کنم" },
      { file: "Parvin-Bahaneye Masti.mp3", title: "بهانهٔ مستی" },
      { file: "Parvin-Dir Amadi.mp3", title: "دیر آمادی" },
      { file: "Parvin-Ey Nazanin.mp3", title: "ای نازنین" },
      { file: "Parvin-Saghare Hasti.mp3", title: "ساغر هستی" },
      { file: "Parvin-Dokhtar Choopan.mp3", title: "دختر چوپان" }
    ]
  },
  {
    // ===== گل‌های صحرایی =====
    id: "golhaye-sahraei",
    performer: "گل‌های صحرایی",
    subtitle: "ترانه‌های محلی و بومی ایران",
    info: "گل‌های صحرایی مجموعه‌ای متمرکز بر ترانه‌ها و نواهای محلی و بومی ایران بود که توسط خوانندگانی چون سیما بینا، پریوش، فرح و دیگران اجرا می‌شد.",
    tracks: [
      { file: "Sima Bina-Nowrouz.mp3", title: "نوروز" },
      { file: "Sima Bina-Delam Khaahad.mp3", title: "دلم خواهد" },
      { file: "Sima Bina-Arouse Javan.mp3", title: "عروس جوان" },
      { file: "Sima Bina-Az kafam raha.mp3", title: "از کفم رها" },
      { file: "Parivash-Ayeneh Mah.mp3", title: "آینهٔ ماه" },
      { file: "Parivash-Bahare roya.mp3", title: "بهار رؤیا" },
      { file: "Parivash-Baraan.mp3", title: "باران" },
      { file: "Parivash-Shab Shab.mp3", title: "شب شب" },
      { file: "Parivash-Yarab.mp3", title: "یا رب" },
      { file: "Farah-Balaye Eshgh.mp3", title: "بلای عشق" },
      { file: "Farah-Ey Kabutar.mp3", title: "ای کبوتر" },
      { file: "Farah-Mey E Golgoun.mp3", title: "می گلگون" },
      { file: "Farah-Moj.mp3", title: "موج" }
    ]
  },
  {
    // ===== آوازهای اصیل =====
    id: "avazhaye-asil",
    performer: "آوازهای اصیل",
    subtitle: "آوازهای ردیف‌دستگاهی و سنتی",
    info: "مجموعه‌ای از آوازهای سنتی و اصیل ایرانی در دستگاه‌های موسیقی ایرانی، شامل آوازخوانانی چون تاج اصفهانی، داریوش رفیعی، شهیدی و دیگران.",
    tracks: [
      { file: "Taj-Asoude khateram.mp3", title: "آسودهٔ خاطرم" },
      { file: "Taj-Mara chashmist.mp3", title: "مرا چشمی است" },
      { file: "Taj-chand be shayad be sabr.mp3", title: "چند به شاید به صبر" },
      { file: "Taj-ravandegan.mp3", title: "رواندگان" },
      { file: "Dariuosh Rafiei-Che Sazam.mp3", title: "چه سازم" },
      { file: "Dariuosh Rafiei-Golnar.mp3", title: "گلنار" },
      { file: "Dariuosh Rafiei-An sarv ke goyand.mp3", title: "آن سرو که گویند" },
      { file: "Dariuosh Rafiei-Selseleye Mouye Doust.mp3", title: "سلسلهٔ موی دوست" },
      { file: "Dariuosh Rafiei-Saghi.mp3", title: "ساقی" },
      { file: "Dariuosh Rafiei-Ghobar.mp3", title: "غبار" },
      { file: "Shahidi-Gham duste ghadimie man.mp3", title: "غم دوست قدیمی من" },
      { file: "Shahidi-Az to bogzashtam(Abuata)..mp3", title: "از تو بگذشتم" },
      { file: "Shahidi-Shour.mp3", title: "شور" },
      { file: "Shahidi-Man Masto To Divaneh.mp3", title: "من مست و تو دیوانه" },
      { file: "Shahidi-Zendegi..mp3", title: "زندگی" }
    ]
  },
  {
    // ===== گلچین بانوان =====
    id: "golchin-banovan",
    performer: "گلچین بانوان",
    subtitle: "صدای زنان در برنامهٔ گل‌ها",
    info: "مجموعه‌ای از اجرای خوانندگان زن برنامهٔ گل‌ها شامل الهه، پوران، پریوش، پروین، رؤیا، گلوریا، هنگامه اخوان و دیگران.",
    tracks: [
      { file: "Elaheh-Peyke Bahar.mp3", title: "پیک بهار" },
      { file: "Elaheh-Ashk e bigonahi.mp3", title: "اشک بی‌گناهی" },
      { file: "Elaheh-Beheshte man.mp3", title: "بهشت من" },
      { file: "Elaheh-Darigha.mp3", title: "دریغا" },
      { file: "Elaheh-Eshgh E Man.mp3", title: "عشق من" },
      { file: "Pooran-Golbone eshgh.mp3", title: "گلبن عشق" },
      { file: "Pouran-Bala.mp3", title: "بالا" },
      { file: "Pooran-Biganeh.mp3", title: "بیگانه" },
      { file: "Roya-Sargashteh.mp3", title: "سرگشته" },
      { file: "Geloria-Aziz besh be kenarom.mp3", title: "عزیز بش به کنارم" },
      { file: "Hayedeh-Ghalbam gereft.mp3", title: "قلبم گرفت" },
      { file: "Hengameh Akhavan-Baz Amadam.mp3", title: "باز آمدم" },
      { file: "Shahla Sarshar-Ghasam.mp3", title: "قسم" }
    ]
  },
  {
    // ===== همخوانی‌ها و گروهی =====
    id: "hamkhaniha",
    performer: "همخوانی‌ها و گروهی",
    subtitle: "دوئت‌ها و گروه‌های همخوانی",
    info: "اجراهای دونفره و گروهی برنامهٔ گل‌ها، شامل همکاری شجریان با الهه، گلوریا و همایرا، و نیز ایرج با همایرا، مرضیه و پوران.",
    tracks: [
      { file: "Shajarian & Elahe-Setareye Shabhaye man & Ta Khabar daram az ou.mp3", title: "ستاره‌های شب‌های من" },
      { file: "Shajarian & Elaheh-Saba be Tahniyate pire Mey Foroush.mp3", title: "صبا به تهنیت پیر می‌فروش" },
      { file: "Shajarian & Geloria-Be Kooh & Vay Az Shabe Man.mp3", title: "به کوه و وای از شب من" },
      { file: "Shajarian & Geloria-Khoda Mehraboone & Del Az Man Bord.mp3", title: "خدا مهربونه" },
      { file: "Shajarian & Geloria-Omri be Bouye Yari.mp3", title: "عمری به بوی یاری" },
      { file: "Shajarian & Homeyra-Che Fetneh Bood.mp3", title: "چه فتنه بود" },
      { file: "Shajarian & Marzieh-naghsh e roya.mp3", title: "نقش رؤیا" },
      { file: "Iraj & Homeyra-Az to ey balaye joon.mp3", title: "از تو ای بلای جان" },
      { file: "Iraj & Homeyra-Delet miyad.mp3", title: "دلت می‌آید" },
      { file: "Iraj & Homeyra-Eltemas.mp3", title: "التماس" },
      { file: "Iraj & Homeyra-Kashki.mp3", title: "کاشکی" },
      { file: "Iraj & Marzieh-Maste Mastam.mp3", title: "مست مستم" },
      { file: "Iraj & Pooran-Booseh javid.mp3", title: "بوسه جاوید" },
      { file: "Marzieh & Golpa-Ba Dele Man.mp3", title: "با دل من" }
    ]
  },
  {
    // ===== برگ سبز =====
    id: "barg-e-sabz",
    performer: "برگ سبز",
    subtitle: "مجموعهٔ برگ سبز — تصنیف‌های شاد",
    info: "برگ سبز یکی دیگر از مجموعه‌های پرطرفدار داوود پیرنیا بود که عمدتاً شامل تصنیف‌های شاد و ترانه‌های محلی می‌شد. بسیاری از خوانندگان گل‌ها در این مجموعه نیز حضور داشتند.",
    tracks: [
      { file: "Khansari-Ba man sanama.mp3", title: "با من صنما" },
      { file: "Khansari-Man Masto To Divaneh.mp3", title: "من مست و تو دیوانه" },
      { file: "Khansari-Pande asheghan.mp3", title: "پند عاشقان" },
      { file: "Khansari-Ma Name Khod Ze Safhaye Delha.mp3", title: "ما نام خود" },
      { file: "Vafaei-Mahoor.mp3", title: "ماهور" },
      { file: "Vafaei-Booye khoshe to.mp3", title: "بوی خوش تو" },
      { file: "Vafaei-Dorooud garm bar meyforoushan.mp3", title: "درود گرم" },
      { file: "Vafaei-Ya rab in morghe beheshti.mp3", title: "یا رب این مرغ بهشتی" },
      { file: "Nader Golchin-Monajat.mp3", title: "مناجات" },
      { file: "Nader Golchin-Navaye Karevan.mp3", title: "نوای کاروان" },
      { file: "Nader Golchin-Yoosofe Gomgashte.mp3", title: "یوسف گمگشته" },
      { file: "Nader Golchin-Mojde Ey Del.mp3", title: "مژده ای دل" },
      { file: "Nader Golchin-SarveChaman Man.mp3", title: "سرو چمن من" },
      { file: "Nader Golchin-Mara Mehre Siyah Cheshman.mp3", title: "مرا مهر سیاه‌چشمان" },
      { file: "Rashidi-Bi Foroghe Mehr.mp3", title: "بی فروغ مهر" },
      { file: "Rashidi-Chashme shab.mp3", title: "چشم شب" },
      { file: "Rashidi-Jan Jahan.mp3", title: "جان جهان" }
    ]
  },
  {
    // ===== موسیقی اصیل عارفانه =====
    id: "musighi-asil-arefane",
    performer: "موسیقی اصیل عارفانه",
    subtitle: "ساز و آوازهای عرفانی",
    info: "مجموعه‌ای از اجراهای عارفانه و معنوی موسیقی ایرانی با آوازهای عمیق و اشعار عرفانی از حافظ، مولوی و سعدی.",
    tracks: [
      { file: "Marzieh-Dar miane golha.mp3", title: "در میان گل‌ها" },
      { file: "Marzieh-Dibacheh.mp3", title: "دیباچه" },
      { file: "Marzieh-Ey khabe khoshe sahari.mp3", title: "ای خواب خوش سحری" },
      { file: "Marzieh-Gheseh Vafa.mp3", title: "قصه وفا" },
      { file: "Marzieh-Mey Zadeh.mp3", title: "می زده" },
      { file: "Marzieh-Minaye Shekasteh.mp3", title: "مینای شکسته" },
      { file: "Marzieh-Sokout ha.mp3", title: "سکوت‌ها" },
      { file: "Dardashti-Agar dastam rasad.mp3", title: "اگر دستم رسد" },
      { file: "Dardashti-saghinameh.mp3", title: "ساقی‌نامه" },
      { file: "Dardashti-Zolfe por chin to.mp3", title: "زلف پرچین تو" },
      { file: "Dardashti-abuata.mp3", title: "ابوعطا" },
      { file: "Homayounpour-Raz Hasti.mp3", title: "راز هستی" },
      { file: "Homayounpour-Sepand O Azar.mp3", title: "سپند و آذر" },
      { file: "Soroush Izadi-Niayesh.mp3", title: "نیایش" }
    ]
  }
];

function buildGolhaFlatList() {
  const out = [];
  GOLHA_COLLECTIONS.forEach((col) => {
    col.tracks.forEach((t) => {
      out.push({
        mode: "golha",
        collectionId: col.id,
        performer: col.performer,
        subtitle: col.subtitle || "",
        info: col.info || "",
        title: t.title,
        src: GOLHA_BASE + t.file
      });
    });
  });
  return out;
}
