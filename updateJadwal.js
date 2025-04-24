const cloudscraper = require('cloudscraper');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

(async () => {
  // Buat shared cookie jar
  const jar = cloudscraper.jar();

  for (const kelas of ['2IA18', '2IA19', '2IA20', '2IA21', '2IA22', '2IA23', '2IA24']) {
    try {
      console.log(`🔄 Fetch ${kelas} via Cloudscraper…`);
      const html = await cloudscraper.get({
        uri: `https://baak.gunadarma.ac.id/jadwal/cariJadKul?teks=${kelas}`,
        jar: jar, // pakai jar yang sama
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      });

      // Parse HTML dan ambil tabel jadwal
      const $ = cheerio.load(html);
      const jadwalTable = $('.stacktable.large-only');

      if (jadwalTable.length > 0) {
        fs.writeFileSync(path.join(__dirname, 'cache', `${kelas}.html`), jadwalTable.html());
        console.log(`✅ Saved ${kelas}.html`);
      } else {
        console.log(`❌ No jadwal table found for ${kelas}`);
      }
    } catch (err) {
      console.error(`❌ Failed ${kelas}:`, err.message);
    }
  }
})();
