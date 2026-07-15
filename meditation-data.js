// ===================================================================
// داده‌های مدیتیشن — صداهای آرامش‌بخش، ساوند اسکیپ، سازهای مدیتیشن
// منابع واقعی و تأییدشده از archive.org (هر آیتم از صفحهٔ جزئیات
// خودش راستی‌آزمایی شد):
//   - CalmPills (Alaeddin Hallak) — archive.org/details/CalmPills — CC0
//   - calm-relaxing-piano-collection — archive.org/details/calm-relaxing-piano-collection
//   - santur-faramarz-payvar — archive.org/details/santur-faramarz-payvar
//   - bamboo-flute-music-for-relaxing-meditation-and-healing
//   - relaxingsounds (GenreFan) — archive.org/details/relaxingsounds
//   - TibetanBowls_201809
// نویز سفید و قهوه‌ای به‌صورت زنده در مرورگر تولید می‌شود (بدون نیاز
// به فایل خارجی، بنابراین هرگز فیلتر یا مسدود نمی‌شود).
// ===================================================================

const MEDITATION_PRESETS = [
  // ===== ساوند اسکیپ و آمبیانت =====
  {
    id: 'soundscape',
    category: 'ساوند اسکیپ و آمبیانت',
    subtitle: 'میکس‌های آمبیانت برای آرامش و مراقبه',
    info: 'میکس‌های بی‌کلام آمبیانت با پیانوی نرم و فضاسازی صوتی، مناسب مراقبه، یوگا، مطالعه یا خواب.',
    base: 'https://archive.org/download/CalmPills/',
    tracks: [
      { file: 'Uplifting_Pills_-_Calm_Pill_1_-_Still_Habitat.mp3', title: 'زیستگاه آرام' },
      { file: 'Uplifting_Pills_-_Calm_Pill_11_-_The_Healing_Lake_8BE609A8-7115-4273-8A1A-CE5738459E7A.mp3', title: 'دریاچهٔ شفابخش' },
      { file: 'Uplifting_Pills_-_Calm_Pill_21_-_Heaven_Sings.mp3', title: 'آواز بهشت' },
      { file: 'Uplifting_Pills_-_Calm_Pill_30_-_Seclusion.mp3', title: 'خلوت‌گزینی' },
      { file: 'Uplifting_Pills_-_Calm_Pill_41_-_Remember_Me.mp3', title: 'به یادم باش' },
      { file: 'Uplifting_Pills_-_Calm_Pill_48_-_Chaka_Meditation.mp3', title: 'مدیتیشن چاکرا' },
      { file: 'Uplifting_Pills_-_Calm_Pill_54_-_Rebirth.mp3', title: 'تولد دوباره' },
      { file: 'Uplifting_Pills_-_Calm_Pill_61_-_Return_to_Eden.mp3', title: 'بازگشت به بهشت' }
    ]
  },

  // ===== پیانو =====
  {
    id: 'piano',
    category: 'سازهای مدیتیشن — پیانو',
    subtitle: 'قطعات پیانوی نئوکلاسیک برای آرامش',
    info: 'گلچینی از قطعات پیانوی نئوکلاسیک و مینیمال از آهنگسازان معاصر، مناسب مدیتیشن و تمرکز.',
    base: 'https://archive.org/download/calm-relaxing-piano-collection/Calm%20Relaxing%20Piano%20-%20Collection%20%282020%29/',
    tracks: [
      { file: '01%20Max%20Richter%20-%20The%20Departure.mp3', title: 'عزیمت — مکس ریشتر', duration: '۱:۱۵' },
      { file: '02%20Yann%20Tiersen%20-%20Comptine%20d%27Un%20Autre%20Ete%20%28L%27Apres-Midi%29%20%28Portrait%20Version%29.mp3', title: 'لالایی تابستانی دیگر — یان تیرسن', duration: '۲:۱۸' },
      { file: '03%20Olga%20Scheps%20-%20Una%20mattina.mp3', title: 'یک صبح — اولگا شپس', duration: '۳:۲۳' },
      { file: '08%20Agnes%20Obel%20-%20Roscian.mp3', title: 'روسکیان — اگنس اوبل', duration: '۲:۱۷' },
      { file: '25%20Dirk%20Maassen%20-%20Feather.mp3', title: 'پر — دیرک ماسن', duration: '۴:۴۰' },
      { file: '32%20Nils%20Frahm%20-%20A%20Shine.mp3', title: 'درخشش — نیلس فرام', duration: '۴:۱۵' },
      { file: '34%20Ludovico%20Einaudi%20-%20A%20Sense%20of%20Symmetry%20%28Day%202%29.mp3', title: 'حس تقارن — لودویکو اینائودی', duration: '۲:۳۷' },
      { file: "52%20Olafur%20Arnalds%20-%20Tomorrow%27s%20Song.mp3", title: 'آوای فردا — اولافور آرنالدز', duration: '۳:۰۸' }
    ]
  },

  // ===== سازهای ایرانی: سنتور، تار، کمانچه =====
  {
    id: 'persian-instruments',
    category: 'سازهای ایرانی — سنتور، تار و کمانچه',
    subtitle: 'فرامرز پایور و همنوازان — از آلبوم میراث ایرانی (۱۹۷۴)',
    info: 'اجرای سازهای سنتی ایرانی به رهبری استاد فرامرز پایور (سنتور)، با همراهی هوشنگ ظریف (تار)، رحمت‌الله بدیعی (کمانچه) و محمد اسماعیلی (ضرب).',
    base: 'https://archive.org/download/santur-faramarz-payvar/',
    tracks: [
      { file: '01Dastgah_Shur.mp3', title: 'دستگاه شور — فرامرز پایور (سنتور)', duration: '۱۰:۱۹' },
      { file: '02Dastgah_Homayoun.mp3', title: 'دستگاه همایون — رحمت‌الله بدیعی (کمانچه)', duration: '۷:۳۸' },
      { file: '03Dastgah_Chahargah.mp3', title: 'دستگاه چهارگاه — هوشنگ ظریف (تار)', duration: '۴:۵۴' },
      { file: '04Khavaran.mp3', title: 'خاوران', duration: '۲:۳۶' },
      { file: '05Daramad.mp3', title: 'درآمد — هوشنگ ظریف (تار)', duration: '۲:۲۲' },
      { file: '06Goshayesh_va_dad.mp3', title: 'گشایش و داد', duration: '۲:۲۸' },
      { file: '07Shekasteh_va_Forud.mp3', title: 'شکسته و فرود', duration: '۲:۲۳' },
      { file: '08Maghlub.mp3', title: 'مغلوب', duration: '۳:۰۹' },
      { file: '09Zarb_solo.mp3', title: 'تک‌نوازی ضرب — محمد اسماعیلی', duration: '۴:۵۷' },
      { file: '10Dastgah_Segah.mp3', title: 'دستگاه سه‌گاه — خاطره پروانه (آواز)، رحمت‌الله بدیعی (کمانچه)', duration: '۴:۵۲' }
    ]
  },

  // ===== نی و فلوت =====
  {
    id: 'flute',
    category: 'نی و فلوت',
    subtitle: 'فلوت بامبو و شاکوهاچی برای آرامش و مراقبه',
    info: 'نواهای فلوت بامبو و شاکوهاچی (فلوت سنتی ژاپنی) برای مراقبه، تمرکز و شفای ذهن.',
    base: 'https://archive.org/download/bamboo-flute-music-for-relaxing-meditation-and-healing/',
    tracks: [
      { file: 'Bamboo%20Flute%20Meditation%20%26%20Relaxation%20Music%20-.mp3', title: 'مدیتیشن با فلوت بامبو' },
      { file: 'Bamboo%20Flute%20Music%20for%20Relaxing%2C%20Meditation%20and%20Healing.mp3', title: 'موسیقی سنتی فلوت بامبو برای آرامش و شفا' },
      { file: 'Bamboo%20Flute%20Relaxation%20Music.mp3', title: 'آرامش با فلوت بامبو' },
      { file: 'Bamboo%20Flute.mp3', title: 'فلوت بامبو' },
      { file: 'Shakuhachi.mp3', title: 'شاکوهاچی — فلوت سنتی ژاپنی' }
    ]
  },

  // ===== صدای طبیعت =====
  {
    id: 'nature',
    category: 'صدای طبیعت',
    subtitle: 'صداهای بلندمدت طبیعت — رودخانه، دریا، جنگل، باد',
    info: 'فایل‌های طولانی صدای طبیعت برای خواب، مطالعه یا مدیتیشن — هر فایل چند ساعت طول می‌کشد و می‌توان آن را به‌صورت پس‌زمینه پخش کرد.',
    base: 'https://archive.org/download/relaxingsounds/',
    tracks: [
      { file: 'Falls%202%203h%20%28Low%20pitch%29MountainStreamWaterfalls.mp3', title: 'آبشار کوهستانی — رودخانهٔ کوهستانی', duration: '۳ ساعت' },
      { file: 'FIRE%202%203h%20Blazing%20Fireplace.mp3', title: 'شومینهٔ شعله‌ور', duration: '۳ ساعت' },
      { file: 'Cicadas%201%204h-%20Locust%20swells%2CGentle%20Birds-SE%20Texas-RGD.mp3', title: 'زنجره‌ها و پرندگان', duration: '۴ ساعت' },
      { file: 'Crickets%20%26%20Frogs%206h%20Owls%2CLite%20Rain%20Drips-Night.mp3', title: 'جیرجیرک، قورباغه و باران ملایم شبانه', duration: '۶ ساعت' },
      { file: 'Rain%207%20%28Lightest%29%208h%20DripsOnTrees-no%20thunder.mp3', title: 'باران ملایم روی برگ درختان', duration: '۸ ساعت' },
      { file: 'Wind%201%208h%20%28or%20Rapids%29%20Gentle%2CLowPitch%2CBrownNoise.mp3', title: 'باد ملایم و آرام', duration: '۸ ساعت' },
      { file: 'Snowfall%20or%20Rain%20%28moderate%29%205.2h%20on%20Trees-overcast%20day.mp3', title: 'برف‌باران آرام در روزی ابری', duration: '۵ ساعت' },
      { file: 'Waves%201%2010h%20Beach-Sunset%20into%20Night.mp3', title: 'امواج ساحل در غروب تا شب', duration: '۱۰ ساعت' }
    ]
  },

  // ===== زنگ‌های تبتی و صداهای معنوی =====
  {
    id: 'tibetan',
    category: 'زنگ‌های تبتی و صداهای معنوی',
    subtitle: 'زنگ، چنگ، دف و فضاهای آمبیانت معنوی',
    info: 'نواهای مدیتیشن ساخته‌شده با زنگ‌های تبتی، چنگ، دف و سازهای دیگر، مناسب برای مدیتیشن عمیق و تمرکز.',
    base: 'https://archive.org/download/TibetanBowls_201809/',
    tracks: [
      { file: 'Singing%20Bowl.ogg', title: 'کاسهٔ آوایی تبتی' },
      { file: 'Om.ogg', title: 'اُم' },
      { file: 'Harp.ogg', title: 'چنگ' },
      { file: 'Choir.ogg', title: 'همسرایی' },
      { file: 'Duduk.ogg', title: 'دودوک ارمنی' },
      { file: 'East%20Flute.ogg', title: 'فلوت شرقی' },
      { file: 'Drum.ogg', title: 'دف' },
      { file: 'Mystical%20Forest.ogg', title: 'جنگل رازآلود' }
    ]
  },

  // ===== نویز سفید، صورتی و قهوه‌ای — تولید زنده برای تمرکز و مطالعه =====
  {
    id: 'noise',
    category: 'نویز سفید و قهوه‌ای — تمرکز و مطالعه',
    subtitle: 'تولیدشده به‌صورت زنده در مرورگر — بدون نیاز به اینترنت یا فایل خارجی',
    info: 'نویز سفید، صورتی و قهوه‌ای برای پوشاندن صداهای محیط، تمرکز هنگام مطالعه و کار، و کمک به خواب. این صداها مستقیماً در مرورگر شما ساخته می‌شوند، بنابراین همیشه و بدون وقفه در دسترس‌اند.',
    base: '',
    tracks: [
      { file: '', title: 'نویز سفید', synthType: 'white', duration: '\u221e' },
      { file: '', title: 'نویز صورتی', synthType: 'pink', duration: '\u221e' },
      { file: '', title: 'نویز قهوه‌ای', synthType: 'brown', duration: '\u221e' }
    ]
  }
];

function buildMeditationFlatList() {
  const out = [];
  MEDITATION_PRESETS.forEach((cat) => {
    cat.tracks.forEach((t) => {
      out.push({
        mode: 'meditation',
        categoryId: cat.id,
        category: cat.category,
        subtitle: cat.subtitle || '',
        info: cat.info || '',
        title: t.title,
        duration: t.duration || '',
        synthType: t.synthType || null,
        src: t.synthType ? '' : (cat.base + t.file)
      });
    });
  });
  return out;
}
