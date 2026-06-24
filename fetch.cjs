const https = require('https');
const fs = require('fs');

const proxy = "https://api.rss2json.com/v1/api.json?rss_url=";
const target = encodeURIComponent("https://www.aefip.org.ar/prensa?format=feed&type=rss");

const url = proxy + target;
https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('scratch.json', data);
    console.log('Saved to scratch.json');
  });
}).on('error', (e) => {
  console.error(e);
});
