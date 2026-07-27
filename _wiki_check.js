const https = require('https');
function get(url, depth) {
  depth = depth || 0;
  return new Promise((resolve) => {
    if (depth > 5) { resolve({ error: 'too many redirects' }); return; }
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(get(res.headers.location, depth + 1));
        return;
      }
      let chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, len: Buffer.concat(chunks).length, headers: res.headers }));
    }).on('error', (e) => resolve({ error: e.message }));
  });
}
(async () => {
  const files = [
    'Abul_Chap_Paravaneh.ogg',
    'Chour_I_Selim_Khan.ogg',
    'Dachti_II_Selim_Khan.ogg',
    'Mahoor_Paravaneh.ogg',
    'Dokhtaran-e_Quchan-_دختران_قوچان.ogg',
    'Santur_by_Mohammad_R_Azadehfar.wav',
    'Şerte_firê_bidem_bed_u_bedferî_-_Hesen_Zêrek.ogg',
    'Kûr_dellê_feleka_-_Hesen_Zêrek.ogg',
    'Ey_Reqib_-_Şivan_Perwer.wav',
    'Kurdistan_(Instrumental).ogg',
    'Roya_Ayxan_-_İrevanda_Xal_Qalmadı.ogg',
    'Xan_Shushinski_Shushanin_Daglari.ogg',
    'Kuchelere_Su_Sepmishem_by_Rashid_Behbudov.ogg',
    'Xaric_Segah_(c.1930).ogg',
    'Karabakh_Shikestesi_music.ogg',
    'Heyrati_mugam.ogg',
    'Arazbari_by_Jabbar_Karyagdi.ogg'
  ];
  let out = '';
  for (const f of files) {
    const url = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(f);
    const r = await get(url);
    out += f + ' => ' + (r.error || ('status=' + r.status + ' len=' + r.len + ' type=' + (r.headers ? r.headers['content-type'] : ''))) + '\n';
  }
  require('fs').writeFileSync('_wiki_check.txt', out, 'utf8');
})();
