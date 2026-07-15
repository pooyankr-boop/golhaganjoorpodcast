// Ganjoor poems — loader
// همهٔ خوانش‌های صوتی منتشرشده از 26 شاعر،
// از طریق API رسمی گنجور (api.ganjoor.net/api/audio/published) واکشی شد.
// هر شاعر در فایل جداگانهٔ ganjoor-<poet>.js قرار دارد.

const GANJOOR_POEMS = []
  .concat(typeof GANJOOR_POEMS_ANVARI !== 'undefined' ? GANJOOR_POEMS_ANVARI : [])
  .concat(typeof GANJOOR_POEMS_ASIRI !== 'undefined' ? GANJOOR_POEMS_ASIRI : [])
  .concat(typeof GANJOOR_POEMS_ATTAR !== 'undefined' ? GANJOOR_POEMS_ATTAR : [])
  .concat(typeof GANJOOR_POEMS_BAHAR !== 'undefined' ? GANJOOR_POEMS_BAHAR : [])
  .concat(typeof GANJOOR_POEMS_BIDEL !== 'undefined' ? GANJOOR_POEMS_BIDEL : [])
  .concat(typeof GANJOOR_POEMS_ERAGHI !== 'undefined' ? GANJOOR_POEMS_ERAGHI : [])
  .concat(typeof GANJOOR_POEMS_ESHGHI !== 'undefined' ? GANJOOR_POEMS_ESHGHI : [])
  .concat(typeof GANJOOR_POEMS_FERDOUSI !== 'undefined' ? GANJOOR_POEMS_FERDOUSI : [])
  .concat(typeof GANJOOR_POEMS_FOROOGHI !== 'undefined' ? GANJOOR_POEMS_FOROOGHI : [])
  .concat(typeof GANJOOR_POEMS_HAFEZ !== 'undefined' ? GANJOOR_POEMS_HAFEZ : [])
  .concat(typeof GANJOOR_POEMS_HELALI !== 'undefined' ? GANJOOR_POEMS_HELALI : [])
  .concat(typeof GANJOOR_POEMS_IQBAL !== 'undefined' ? GANJOOR_POEMS_IQBAL : [])
  .concat(typeof GANJOOR_POEMS_IRAJ !== 'undefined' ? GANJOOR_POEMS_IRAJ : [])
  .concat(typeof GANJOOR_POEMS_KHAGHANI !== 'undefined' ? GANJOOR_POEMS_KHAGHANI : [])
  .concat(typeof GANJOOR_POEMS_KHAJOO !== 'undefined' ? GANJOOR_POEMS_KHAJOO : [])
  .concat(typeof GANJOOR_POEMS_MOULAVI !== 'undefined' ? GANJOOR_POEMS_MOULAVI : [])
  .concat(typeof GANJOOR_POEMS_NEZAMI !== 'undefined' ? GANJOOR_POEMS_NEZAMI : [])
  .concat(typeof GANJOOR_POEMS_OBEYD !== 'undefined' ? GANJOOR_POEMS_OBEYD : [])
  .concat(typeof GANJOOR_POEMS_RAHI !== 'undefined' ? GANJOOR_POEMS_RAHI : [])
  .concat(typeof GANJOOR_POEMS_SAADI !== 'undefined' ? GANJOOR_POEMS_SAADI : [])
  .concat(typeof GANJOOR_POEMS_SAEB !== 'undefined' ? GANJOOR_POEMS_SAEB : [])
  .concat(typeof GANJOOR_POEMS_SALIM !== 'undefined' ? GANJOOR_POEMS_SALIM : [])
  .concat(typeof GANJOOR_POEMS_SANAEE !== 'undefined' ? GANJOOR_POEMS_SANAEE : [])
  .concat(typeof GANJOOR_POEMS_SEYF !== 'undefined' ? GANJOOR_POEMS_SEYF : [])
  .concat(typeof GANJOOR_POEMS_VAHSHI !== 'undefined' ? GANJOOR_POEMS_VAHSHI : [])
  .concat(typeof GANJOOR_POEMS_KHAYYAM !== 'undefined' ? GANJOOR_POEMS_KHAYYAM : [])
  .concat(typeof GANJOOR_POEMS_PARVIN !== 'undefined' ? GANJOOR_POEMS_PARVIN : []);
