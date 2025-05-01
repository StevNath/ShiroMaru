const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Data user sederhana
const userStats = {};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('adventure')
		.setDescription('RPG Adventure'),
	async execute(interaction) {
		const userId = interaction.user.id;

		// Inisialisasi user jika belum ada
		if (!userStats[userId]) {
			userStats[userId] = { hp: 100, gold: 0, damage: 15 };
		}

		const stats = userStats[userId];

		const events = [
			{ text: 'Kamu bertemu monster ganas! 😈', action: 'fight' },
			{ text: 'Kamu menemukan peti harta karun! 🎁', action: 'treasure' },
			{ text: 'Kamu menginjak jebakan berduri! ⚔️', action: 'trap' },
			{ text: 'Kamu bertemu penyihir baik hati! 🧙‍♂️', action: 'wizard' },
			{ text: 'Kamu Sampai Di Shop', action: 'shop'}
		];

		const event = events[Math.floor(Math.random() * events.length)];

		if (event.action === 'fight') {
			let monsterHp = Math.floor(Math.random() * 60) + 60;
			const alphabet = 'abcdefghijklmnopqrstuvwxyz';
			let targetKey = alphabet[Math.floor(Math.random() * alphabet.length)];
			let battleEnded = false;

			const battleEmbed = new EmbedBuilder()
				.setColor(0xFF0000)
				.setTitle('😈 Monster Menyerang!')
				.setDescription(`Monster muncul dengan **${monsterHp} HP**!\n\n🗡️ Ketik huruf berikut untuk menyerang: **\`${targetKey}\`**`)
				.setFooter({ text: 'Bertarung sampai salah satu kalah!', iconURL: interaction.user.displayAvatarURL() })
				.setTimestamp();

			const msg = await interaction.reply({ embeds: [battleEmbed], fetchReply: true });

			// Menambahkan filter yang hanya menerima pesan dari pengguna yang memulai perintah
			const filter = m => m.author.id === userId;
			const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

			collector.on('collect', async m => {
				// Debug: Cek pesan yang diterima
				console.log(`Pesan diterima: ${m.content}`);

				if (battleEnded) return;

				// Hapus pesan untuk mencegah spam
				try {
					await m.delete();
					console.log(`Pesan dari ${m.author.username} dihapus`); // Debug log penghapusan
				} catch (err) {
					console.error('Error menghapus pesan:', err); // Debug log error penghapusan
				}

				// Cek apakah input sesuai dengan huruf yang harus ditekan
				if (m.content.toLowerCase() === targetKey) {
					monsterHp -= stats.damage;
					await interaction.editReply({
						embeds: [
							new EmbedBuilder()
								.setColor(0xFF0000)
								.setTitle('😈 Monster Menyerang!')
								.setDescription(`✅ Serangan berhasil! Kamu memberikan **${stats.damage} damage**. Sisa HP monster: **${Math.max(monsterHp, 0)}**`)
								.addFields(
									{ name: 'Kamu', value: `❤️ HP: **${stats.hp}** | 🗡️ Damage: **${stats.damage}**`, inline: false }
								)
								.setFooter({ text: 'Bertarung sampai salah satu kalah!', iconURL: interaction.user.displayAvatarURL() })
								.setTimestamp()
						]
					});
				} else {
					const monsterDamage = Math.floor(Math.random() * 20) + 10;
					stats.hp -= monsterDamage;
					await interaction.editReply({
						embeds: [
							new EmbedBuilder()
								.setColor(0xFF0000)
								.setTitle('😈 Monster Menyerang!')
								.setDescription(`❌ Salah huruf! Monster menyerang dan kamu kehilangan **${monsterDamage} HP**. Sisa HP-mu: **${stats.hp}**`)
								.addFields(
									{ name: 'Kamu', value: `❤️ HP: **${stats.hp}** | 🗡️ Damage: **${stats.damage}**`, inline: false }
								)
								.setFooter({ text: 'Bertarung sampai salah satu kalah!', iconURL: interaction.user.displayAvatarURL() })
								.setTimestamp()
						]
					});
				}

				// Cek hasil pertarungan
				if (stats.hp <= 0) {
					battleEnded = true;
					userStats[userId] = { hp: 100, gold: 0, damage: 15 };

					const gameOverEmbed = new EmbedBuilder()
						.setColor(0x8B0000)
						.setTitle('💀 GAME OVER!')
						.setDescription(`${interaction.user.username}, kamu kalah melawan monster!`)
						.addFields(
							{ name: 'Status Terakhir', value: `❤️ HP: **0** | 💰 Gold: **${stats.gold}**`, inline: false },
							{ name: 'Restart', value: `Statistikmu telah di-reset. Coba lagi dengan /adventure!`, inline: false }
						)
						.setFooter({ text: 'Tetap semangat!', iconURL: interaction.user.displayAvatarURL() })
						.setTimestamp();

					await interaction.editReply({ embeds: [gameOverEmbed] });
					collector.stop();
					return;
				}

				if (monsterHp <= 0) {
					battleEnded = true;
					const goldEarned = Math.floor(Math.random() * 100) + 50;
					stats.gold += goldEarned;

					const winEmbed = new EmbedBuilder()
						.setColor(0x00FF00)
						.setTitle('🎉 Kamu menang!')
						.setDescription(`Monster telah dikalahkan! Kamu mendapatkan **${goldEarned} gold**.`)
						.addFields(
							{ name: 'Statusmu Sekarang', value: `❤️ HP: **${stats.hp}** | 💰 Gold: **${stats.gold}** | 🗡️ Damage: **${stats.damage}**`, inline: false }
						)
						.setFooter({ text: `Selamat ${interaction.user.username}!`, iconURL: interaction.user.displayAvatarURL() })
						.setTimestamp();

					await interaction.editReply({ embeds: [winEmbed] });
					collector.stop();
					return;
				}

				// Huruf baru
				targetKey = alphabet[Math.floor(Math.random() * alphabet.length)];
				await interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setColor(0xFF0000)
							.setTitle('😈 Monster Menyerang!')
							.setDescription(`Serangan Berhasil! Monster masih hidup Dengan **HP ${Math.max(monsterHp, 0)}** .\n\n🗡️ Ketik huruf berikut untuk menyerang: **\`${targetKey}\`**`)
							.addFields(
								{ name: 'Kamu', value: `❤️ HP: **${stats.hp}** | 🗡️ Damage: **${stats.damage}**`, inline: false }
							)
							.setFooter({ text: 'Bertarung sampai salah satu kalah!', iconURL: interaction.user.displayAvatarURL() })
							.setTimestamp()
					]
				});
			});

			collector.on('end', async (collected, reason) => {
				if (!battleEnded) {
					await interaction.editReply('⏰ Waktu habis! Pertarungan berakhir karena kamu tidak menyelesaikannya.');
				}
			});

			return;
		}

		// Event non-pertarungan
		let eventResult = '';
		let color = 0x00FF00;

		if (event.action === 'treasure') {
			const gold = Math.floor(Math.random() * 100) + 50;
			stats.gold += gold;
			eventResult = `💰 **Menemukan harta!** Kamu mendapatkan **${gold} gold**.`;
			color = 0xFFD700;
		} else if (event.action === 'trap') {
			const trapDamage = Math.floor(Math.random() * 20) + 5;
			stats.hp -= trapDamage;
			eventResult = `🕳️ **Terjebak!** Kamu kehilangan **${trapDamage} HP**.`;
			color = 0xFFA500;
		} else if (event.action === 'wizard') {
			const heal = Math.floor(Math.random() * 25) + 10;
			stats.hp += heal;
			eventResult = `🧙‍♂️ **Penyihir menyembuhkanmu!** Kamu mendapatkan **${heal} HP**.`;
			color = 0x00FFFF;
		} else if (event.action === 'shop'){
			addDamage = Math.floor(Math.random() * 10) + 5;
			purchase = addDamage * 7;
			if (stats.gold >= purchase) {
				stats.damage += addDamage;
				stats.gold -= purchase;
				eventResult = `🛒 **Kamu membeli item!** Damage kamu bertambah **${addDamage}** dan menghabiskan **${purchase} gold**.`;
			} else {
				eventResult = `🛒 **Kamu tidak punya cukup gold!** Gold kamu tidak cukup untuk membeli item ini.`;
			}
		}

		const embed = new EmbedBuilder()
			.setColor(color)
			.setTitle('🌟 Petualanganmu!')
			.setDescription(event.text)
			.addFields(
				{ name: 'Hasil', value: eventResult, inline: false },
				{ name: 'Statusmu Sekarang', value: `❤️ HP: **${stats.hp}** | 💰 Gold: **${stats.gold}** | 🗡️ Damage: **${stats.damage}**`, inline: false }
			)
			.setFooter({ text: `Good luck, ${interaction.user.username}!`, iconURL: interaction.user.displayAvatarURL() })
			.setTimestamp();

		await interaction.reply({ embeds: [embed] });
	},
};
