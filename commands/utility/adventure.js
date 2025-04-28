const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Simple user stats (harusnya pakai database kalau mau serius)
const userStats = {};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('adventure')
		.setDescription('RPG Adventure'),
	async execute(interaction) {
		const userId = interaction.user.id;

		// Kalau user baru, inisialisasi stats
		if (!userStats[userId]) {
			userStats[userId] = { hp: 100, gold: 0 };
		}

		const stats = userStats[userId];

		// Event random
		const events = [
			{ text: 'Kamu bertemu monster ganas! 😈', action: 'fight' },
			{ text: 'Kamu menemukan peti harta karun! 🎁', action: 'treasure' },
			{ text: 'Kamu menginjak jebakan berduri! ⚔️', action: 'trap' },
			{ text: 'Kamu bertemu penyihir baik hati! 🧙‍♂️', action: 'wizard' }
		];

		const event = events[Math.floor(Math.random() * events.length)];

		let eventResult = '';
		let color = 0x00FF00; // default hijau

		// Logika berdasarkan event
		if (event.action === 'fight') {
			const damage = Math.floor(Math.random() * 30) + 10;
			stats.hp -= damage;
			eventResult = `⚔️ **Bertarung!** Kamu kehilangan **${damage} HP**.`;
			color = 0xFF0000; // merah
		} else if (event.action === 'treasure') {
			const gold = Math.floor(Math.random() * 100) + 50;
			stats.gold += gold;
			eventResult = `💰 **Menemukan harta!** Kamu mendapatkan **${gold} gold**.`;
			color = 0xFFD700; // gold
		} else if (event.action === 'trap') {
			const trapDamage = Math.floor(Math.random() * 20) + 5;
			stats.hp -= trapDamage;
			eventResult = `🕳️ **Terjebak!** Kamu kehilangan **${trapDamage} HP**.`;
			color = 0xFFA500; // oranye
		} else if (event.action === 'wizard') {
			const heal = Math.floor(Math.random() * 25) + 10;
			stats.hp += heal;
			eventResult = `🧙‍♂️ **Bertemu penyihir!** Kamu mendapatkan **${heal} HP**.`;
			color = 0x00FFFF; // cyan
		}

		// Cek apakah HP <= 0
		if (stats.hp <= 0) {
			// Reset stats ke awal
			userStats[userId] = { hp: 100, gold: 0 };

			// Buat embed Game Over
			const gameOverEmbed = new EmbedBuilder()
				.setColor(0x8B0000) // dark red
				.setTitle('💀 GAME OVER!')
				.setDescription(`${interaction.user.username}, kamu kehabisan HP dan kalah dalam petualanganmu!`)
				.addFields(
					{ name: 'Status Terakhir', value: `❤️ HP: **0** | 💰 Gold: **${stats.gold}**`, inline: false },
					{ name: 'Restart', value: `Statistik kamu telah di-reset. Mulai lagi dengan /adventure!`, inline: false }
				)
				.setFooter({ text: 'Coba lebih berhati-hati lain kali!', iconURL: interaction.user.displayAvatarURL() })
				.setTimestamp();

			await interaction.reply({ embeds: [gameOverEmbed] });
			return;
		}

		// Kalau belum game over, kirim event biasa
		const embed = new EmbedBuilder()
			.setColor(color)
			.setTitle('🌟 Petualanganmu!')
			.setDescription(event.text)
			.addFields(
				{ name: 'Hasil', value: eventResult, inline: false },
				{ name: 'Statusmu Sekarang', value: `❤️ HP: **${stats.hp}** | 💰 Gold: **${stats.gold}**`, inline: false },
			)
			.setFooter({ text: `Good luck, ${interaction.user.username}!`, iconURL: interaction.user.displayAvatarURL() })
			.setTimestamp();

		await interaction.reply({ embeds: [embed] });
	},
};
