const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

// Path ke H_Events.json
const filePath = path.join(__dirname, 'H_Events.json');

function loadEvents() {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8').trim();
        if (!content) return [];
        try {
            return JSON.parse(content);
        } catch (err) {
            console.error('❌ Error parsing H_Events.json:', err);
            return [];
        }
    }
    return [];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listhoyoevents')
        .setDescription('Melihat semua event Hoyo yang sedang berlangsung'),

    async execute(interaction) {
        const events = loadEvents();
        const now = dayjs().tz('Asia/Jakarta');

        if (events.length === 0) {
            return interaction.reply('📭 Tidak ada event yang sedang berlangsung.');
        }

        const eventList = events
            .map(e => {
                const end = dayjs.unix(e.endTime).tz('Asia/Jakarta'); // ✅ parse UNIX
                if (end.isBefore(now)) return null; // skip kalau sudah lewat

                const unixTime = Math.floor(end.unix());
                return `📢 **${e.name}** selesai pada <t:${unixTime}:F> (<t:${unixTime}:R>)`;
            })
            .filter(Boolean);

        if (eventList.length === 0) {
            return interaction.reply('📭 Tidak ada event yang sedang berlangsung.');
        }

        await interaction.reply(eventList.join('\n'));
    }
};
