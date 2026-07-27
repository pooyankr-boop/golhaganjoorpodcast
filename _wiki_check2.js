const https = require('https');
function get(url, depth) {
  depth = depth || 0;
  return new Promise((resolve) => {
    if (depth > 5) { resolve({ error: 'too many redirects' }); return; }
    https.get(url, { headers: { 'User-Agent': 'AvacRadioBot/1.0 (contact: test@example.com) research check' } }, (res) => {
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
function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }
(async () => {
  const urls = [
    'https://upload.wikimedia.org/wikipedia/commons/7/7d/Abul_Chap_Paravaneh.ogg',
    'https://upload.wikimedia.org/wikipedia/commons/1/1f/Chour_I_Selim_Khan.ogg',
    'https://upload.wikimedia.org/wikipedia/commons/1/1f/Dachti_II_Selim_Khan.ogg',
    'https://upload.wikimedia.org/wikipedia/commons/3/35/Mahoor_Paravaneh.ogg',
    'https://upload.wikimedia.org/wikipedia/commons/e/ea/Dokhtaran-e_Quchan-_%D8%AF%D8%AE%D8%AA%D8%B1%D8%A7%D9%86_%D9%82%D9%88%DA%86%D8%A7%D9%86.ogg',
    'https://upload.wikimedia.org/wikipedia/commons/9/96/Santur_by_Mohammad_R_Azadehfar.wav',
    'https://upload.wikimedia.org/wikipedia/commons/e/e0/Mahoor_and_Chahargah_tuning%2C_1st_string%2CPersian_tone_C%2C_Western_tone_%3D_A_sharp.ogg',
    'https://upload.wikimedia.org/wikipedia/commons/9/9b/Mahoor_and_Chahargah_tuning%2C_2nd_string%2CPersian_tone_G%2C_Western_tone_%3D_F.ogg',
    'https://upload.wikimedia.org/wikipedia/commons/5/50/Mahoor_and_Chahargah_tuning%2C_3rd_string%2CPersian_tone_C%2C_Western_tone_%3D_A_sharp.ogg',
    'https://upload.wikimedia.org/wikipedia/commons/d/d6/Mahoor_and_Chahargah_tuning%2C_4th_string%2CPersian_tone_C%2C_Western_tone_%3D_A_sharp.ogg',
    'https://upload.wikimedia.org/wikipedia/commons/8/83/%C5%9Eerte_fi%C5%99%C3%AA_bidem_bed_u_bedfe%C5%99%C3%AE_-_Hesen_Z%C3%AErek.ogg',
    'https://upload.wikimedia.org/wikipedia/commons/8/82/K%C3%BB%C5%99_dell%C3%AA_feleka_-_Hesen_Z%C3%AErek.ogg',
    'https://upload.wikimedia.org/wikipedia/commons/d/dc/Ey_Reqib_-_%C5%9Eivan_Perwer.wav',
    'https://upload.wikimedia.org/wikipedia/commons/8/86/Kurdistan_%28Instrumental%29.ogg',
    'https://upload.wikimedia.org/wikipedia/commons/5/58/Roya_Ayxan_-_%C4%B0revanda_Xal_Qalmad%C4%B1.ogg',
    'https://upload.wikimedia.org/wikipedia/commons/5/52/Xan_Shushinski_Shushanin_Daglari.ogg',
    'https://upload.wikimedia.org/wikipedia/commons/9/93/Kuchelere_Su_Sepmishem_by_Rashid_Behbudov.ogg',
    'https://upload.wikimedia.org/wikipedia/commons/1/15/Xaric_Segah_%28c.1930%29.ogg',
    'https://upload.wikimedia.org/wikipedia/commons/4/4e/Karabakh_Shikestesi_music.ogg',
    'https://upload.wikimedia.org/wikipedia/commons/b/b1/Heyrati_mugam.ogg',
    'https://upload.wikimedia.org/wikipedia/commons/f/fe/Arazbari_by_Jabbar_Karyagdi.ogg'
  ];
  let out = '';
  for (const u of urls) {
    const r = await get(u);
    out += u + ' => ' + (r.error || ('status=' + r.status + ' len=' + r.len + ' type=' + (r.headers ? r.headers['content-type'] : ''))) + '\n';
    await delay(600);
  }
  require('fs').writeFileSync('_wiki_check2.txt', out, 'utf8');
})();
