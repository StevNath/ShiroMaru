const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const cloudscraper = require('cloudscraper');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('uts')
    .setDescription('Cari jadwal uts.')
    .addStringOption(option =>
      option.setName('kelas')
        .setDescription('Nama kelas atau dosen')
        .setRequired(true)
    ),

  async execute(interaction) {
    const kelas = interaction.options.getString('kelas');

    if (kelas.length < 5) {
      await interaction.reply('🔍 Nama kelas atau dosen terlalu pendek. Minimal 5 karakter.');
      return;
    }

    await interaction.deferReply();

    const cachePath = path.join(__dirname, '..', '..', 'cache', `uts_${kelas}.html`);
    let html = null;

    // Ambil dari cache jika ada
    if (fs.existsSync(cachePath)) {
      console.log(`🔍 Mengambil jadwal dari cache untuk: ${kelas}`);
      html = fs.readFileSync(cachePath, 'utf8');
    } else {
      const url = `https://baak.gunadarma.ac.id/jadwal/cariUts?teks=${encodeURIComponent(kelas)}`;
      const jar = cloudscraper.jar();

      try {
        html = await cloudscraper.get({
          uri: url,
          jar,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        });

        const $ = cheerio.load(html);
        const jadwalTable = $('.stacktable.large-only');

        if (jadwalTable.length > 0) {
          fs.writeFileSync(cachePath, jadwalTable.html());
          console.log(`✅ Saved uts_${kelas}.html`);
        } else {
          console.log(`❌ No jadwal table found for ${kelas}`);
        }

        console.log(`✅ Jadwal UTS untuk ${kelas} disimpan ke cache.`);
      } catch (error) {
        console.error('❌ Error saat fetch:', error.message);
        await interaction.editReply('🚨 Gagal mengambil jadwal dari server. Mungkin kena proteksi Cloudflare.');
        return;
      }
    }

    // Parsing HTML
    const wrappedHtml = `<table><tbody>${html}</tbody></table>`;
    const $ = cheerio.load(wrappedHtml);
    const rows = $('tbody tr').slice(1); // skip header

    if (rows.length === 0) {
      await interaction.editReply(`❌ Jadwal kosong atau tidak valid untuk: \`${kelas}\``);
      return;
    }

    // Buat Embed
    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`📅 Jadwal UTS: ${kelas.toUpperCase()}`)
      .setDescription('Berikut adalah daftar jadwal yang ditemukan:')
      .setFooter({ text: 'Sumber: baak.gunadarma.ac.id' })
      .setTimestamp();

    // Tambah field per jadwal
    rows.each((i, row) => {
      const cols = $(row).find('td');
      if (cols.length >= 5) {
        const hari = $(cols[0]).text().trim();
        const tanggal = $(cols[1]).text().trim();
        const matkul = $(cols[2]).text().trim();
        const waktu = $(cols[3]).text().trim();
        const ruang = $(cols[4]).text().trim();

        embed.addFields({
          name: `${hari}, ${tanggal}`,
          value: `📘 **${matkul}**\n🕒 ${waktu} | 🏫 ${ruang}`,
          inline: false
        });
      }
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
