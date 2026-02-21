const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear_jadwal')
    .setDescription('Clears the schedule'),

  async execute(interaction) {

    // 🔐 Permission check v13
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply({
        content: 'Kamu tidak punya izin untuk menggunakan command ini!',
        ephemeral: true
      });
    }

    const folderPath = path.join(__dirname, '../../cache');

    try {
      if (!fs.existsSync(folderPath)) {
        return interaction.reply({ content: 'Folder tidak ditemukan.', ephemeral: true });
      }

      const files = fs.readdirSync(folderPath);

      for (const file of files) {
        const filePath = path.join(folderPath, file);
        if (fs.lstatSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      }

      await interaction.reply('Semua file dalam folder berhasil dihapus.');
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Terjadi error saat menghapus file.',
        ephemeral: true
      });
    }
  },
};