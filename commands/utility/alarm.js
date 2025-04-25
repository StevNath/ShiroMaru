const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setalarm')
    .setDescription('Setel alarm dan dapatkan notifikasi saat waktunya tiba')
    .addIntegerOption(option =>
      option.setName('menit')
        .setDescription('Berapa menit dari sekarang alarm berbunyi')
        .setRequired(true)),

  async execute(interaction) {
    const menit = interaction.options.getInteger('menit');
    const userId = interaction.user.id;

    // Hitung waktu alarm (dalam detik UNIX)
    const now = Math.floor(Date.now() / 1000);
    const triggerTimestamp = now + (menit * 60);

    // Format hover timestamp
    const hoverTimestamp = `<t:${triggerTimestamp}:F>`; // Full datetime format
    const relativeTime = `<t:${triggerTimestamp}:R>`; // Relative, e.g., "in 5 minutes"

    await interaction.reply(`⏰ Alarm disetel! Akan berbunyi ${relativeTime} pada ${hoverTimestamp}, <@${userId}>.`);

    // Jalankan alarm
    setTimeout(() => {
      interaction.followUp({
        content: `🔔 Waktunya sudah tiba, <@${userId}>! (${hoverTimestamp})`,
        ephemeral: false
      });
    }, menit * 60 * 1000);
  }
};
