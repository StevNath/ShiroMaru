const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

// Path ke events.json di folder yang sama
const filePath = path.join(__dirname, 'H_Events.json');

// Load data events
function loadEvents() {
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return [];
}

// Simpan data events
function saveEvents(events) {
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2));
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sethoyoevent')
		.setDescription('Set reminder untuk event Hoyo')
		.addStringOption(option =>
			option.setName('nama')
				.setDescription('Nama event')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('waktu')
				.setDescription('Waktu selesai event (format: YYYY-MM-DDTHH:mm WIB)')
				.setRequired(true)),
				
	async execute(interaction) {
		const namaEvent = interaction.options.getString('nama');
		const waktuString = interaction.options.getString('waktu');

		// Parsing waktu ke timezone Asia/Jakarta
		const endTime = dayjs.tz(waktuString, 'Asia/Jakarta');

		if (!endTime.isValid()) {
			return interaction.reply({
				content: '❌ Format waktu tidak valid. Gunakan format: `YYYY-MM-DDTHH:mm` WIB',
				ephemeral: true
			});
		}

		// Simpan ke file
		const events = loadEvents();
		events.push({ name: namaEvent, endTime: Math.floor(endTime.unix()) });
		saveEvents(events);

		await interaction.reply(`✅ Reminder untuk **${namaEvent}** diset hingga **${endTime.format('DD MMM YYYY HH:mm')} WIB**`);
	}
};
