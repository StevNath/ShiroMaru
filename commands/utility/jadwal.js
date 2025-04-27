const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const cloudscraper = require('cloudscraper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jadwal')
    .setDescription('Cari jadwal kuliah berdasarkan kelas atau nama dosen.')
    .addStringOption(option =>
      option.setName('kelas')
        .setDescription('Nama kelas atau dosen')
        .setRequired(true)),
  async execute(interaction) {
    const kelas = interaction.options.getString('kelas');
    await interaction.deferReply();

    const cachePath = path.join(__dirname, '..', '..', 'cache', `${kelas}.html`);

    let html = null;
    // Coba ambil dari cache dulu
    if (fs.existsSync(cachePath)) {
      console.log(`🔍 Mengambil jadwal dari cache untuk: ${kelas}`);
      html = fs.readFileSync(cachePath, 'utf8');
    } else {
      // Tidak ada cache, ambil dari web pakai cloudscraper
      const url = `https://baak.gunadarma.ac.id/jadwal/cariJadKul?teks=${encodeURIComponent(kelas)}`;
      const jar = cloudscraper.jar();
      try { // Mancing agar cloudflare bisa jalan
        html = await cloudscraper.get({
          uri: url,
          jar: jar,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        });
      } catch (error) {
        html = null;
      }

      try {
        console.log(`🔄 Fetch jadwal langsung untuk: ${kelas}`);
        html = await cloudscraper.get({
          uri: url,
          jar,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:117.0) Gecko/20100101 Firefox/117.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Referer': 'https://baak.gunadarma.ac.id/',
            'Cache-Control': 'max-age=0',
          },
        });
        await interaction.editReply(`🔄 Mengambil jadwal untuk: \`${kelas}\`...`);


        const $ = cheerio.load(html);
              const jadwalTable = $('.stacktable.large-only');
        
              if (jadwalTable.length > 0) {
                fs.writeFileSync(path.join(__dirname,'..','..', 'cache', `${kelas}.html`), jadwalTable.html());
                console.log(`✅ Saved ${kelas}.html`);
              } else {
                console.log(`❌ No jadwal table found for ${kelas}`);
              }
        console.log(`✅ Jadwal ${kelas} disimpan ke cache.`);
      } catch (error) {
        console.error('❌ Error saat fetch:', error.message);
        await interaction.editReply('🚨 Gagal mengambil jadwal dari server. Mungkin kena proteksi Cloudflare.');
        return;
      }
    }

    // Parsing HTML jadwal (baik dari cache atau fetch baru)
    const wrappedHtml = `<table><tbody>${html}</tbody></table>`;
    const $ = cheerio.load(wrappedHtml);
    const rows = $('tbody tr').slice(1); // skip header

    if (rows.length === 0) {
      await interaction.editReply(`❌ Jadwal kosong atau tidak valid untuk: \`${kelas}\``);
      return;
    }

    let jadwalList = `📅 Jadwal ditemukan untuk: \`${kelas}\`\n\n`;
    jadwalList += '```markdown\n';
    jadwalList += 'Hari   | Mata Kuliah                  | Waktu   | Ruang | Dosen\n';
    jadwalList += '-------|------------------------------|---------|-------|--------------------\n';

    rows.each((i, row) => {
      const cols = $(row).find('td');
      if (cols.length === 6) {
        const hari = $(cols[1]).text().trim().padEnd(7, ' ');
        const matkul = $(cols[2]).text().trim().slice(0, 30).padEnd(30, ' ');
        const waktu = $(cols[3]).text().trim().padEnd(7, ' ');
        const ruang = $(cols[4]).text().trim().padEnd(5, ' ');
        const dosen = $(cols[5]).text().trim().slice(0, 20);
        jadwalList += `${hari}| ${matkul}| ${waktu}| ${ruang}| ${dosen}\n`;
      }
    });

    jadwalList += '```';
    await interaction.editReply(jadwalList);
  },
};