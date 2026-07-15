const https = require('https');
const fs = require('fs');
const url = 'https://feeds.redcircle.com/af0f4c01-435b-4829-a7a7-f9cf1fefa3bb';

https.get(url, {headers:{'User-Agent':'Mozilla/5.0'}}, (res) => {
  let chunks = [];
  res.on('data', chunk => chunks.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    const utf8Text = buffer.toString('utf8');
    console.log('Downloaded: ' + utf8Text.length + ' chars');
    
    // Extract items
    const items = utf8Text.match(/<item>[\s\S]*?<\/item>/g) || [];
    console.log('Found ' + items.length + ' items');
    
    let js = '// Auto-generated data from RedCircle podcast feed\n';
    js += '// Source: https://feeds.redcircle.com/af0f4c01-435b-4829-a7a7-f9cf1fefa3bb\n';
    js += '// کتاب صوتی ناصر زراعتی - Ketab soti\n\n';
    js += 'const REDCIRCLE_EPISODES = [\n';
    
    let count = 0;
    items.forEach((item) => {
      const urlMatch = item.match(/<enclosure[^>]*url=\"([^\"]+)\"/);
      const durMatch = item.match(/<itunes:duration>(\d+)<\/itunes:duration>/);
      const pubMatch = item.match(/<pubDate>([^<]+)<\/pubDate>/);
      const src = urlMatch ? urlMatch[1] : '';
      if (!src) return;
      
      let title = '';
      const ititle = item.match(/<itunes:title><!\[CDATA\[(.*?)\]\]><\/itunes:title>/s);
      if (ititle) title = ititle[1];
      else {
        const t2 = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s);
        if (t2) title = t2[1];
        else {
          const t3 = item.match(/<itunes:title>([^<]+)<\/itunes:title>/);
          if (t3) title = t3[1];
        }
      }
      
      const duration = durMatch ? parseInt(durMatch[1]) : 0;
      const mins = Math.floor(duration / 60);
      const secs = duration % 60;
      const durStr = mins + ':' + (secs < 10 ? '0' : '') + secs;
      const pubDate = pubMatch ? pubMatch[1] : '';
      
      count++;
      js += '  { title: ' + JSON.stringify(title.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')) + ',';
      js += ' author: "Ketab soti",';
      js += ' duration: ' + JSON.stringify(durStr) + ',';
      js += ' src: ' + JSON.stringify(src) + ',';
      js += ' pubDate: ' + JSON.stringify(pubDate) + ',';
      js += ' description: "" },\n';
    });
    
    js += '];\n\n';
    js += 'function buildRedcircleFlatList() {\n';
    js += '  return REDCIRCLE_EPISODES.map(p => ({\n';
    js += '    mode: "hekayat", author: p.author, title: p.title,\n';
    js += '    duration: p.duration, src: p.src, url: "",\n';
    js += '    pubDate: p.pubDate || "", info: p.description || ""\n';
    js += '  }));\n';
    js += '}\n';
    
    fs.writeFileSync('D:\\Program Files\\openclaw\\Projects\\golhaganjoorpodcast-main\\redcircle-data.js', js, 'utf8');
    const stat = fs.statSync('D:\\Program Files\\openclaw\\Projects\\golhaganjoorpodcast-main\\redcircle-data.js');
    console.log('Generated file: ' + stat.size + ' bytes, ' + count + ' episodes');
    console.log('First 3 titles:');
    const items2 = JSON.parse('[' + js.match(/  \{.*?\},\n/g).slice(0,3).join('\n') + ']');
    items2.forEach(i => console.log('  - ' + i.title.substring(0,60)));
  });
}).on('error', (e) => console.log('Error: ' + e.message));
