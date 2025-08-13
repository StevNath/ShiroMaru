const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const filePath = path.join(__dirname, '../commands/hoyo/H_Events.json');

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

function saveEvents(events) {
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2));
}

function startTimeChecker(client) {
    const channelId = '1173999146219339797'; // ID Channel Hoyoverse
    const roleId = '1405172918769418312';                // ID Role
    let notified = new Set();

    cron.schedule('* * * * *', async () => {
        const now = dayjs().tz('Asia/Jakarta');
        let events = loadEvents();
        let stillActive = [];
        let messages = [];

        for (let e of events) {
            const end = dayjs.unix(e.endTime).tz('Asia/Jakarta');
            const diff = end.diff(now, 'second');

            if (diff <= 0) {
                if (!notified.has(e.name)) {
                    messages.push(`❌ Event **${e.name}** sudah selesai!`);
                    notified.add(e.name);
                }
            } else {
                stillActive.push(e);
            }
        }

        // Hapus event expired
        if (stillActive.length !== events.length) {
            saveEvents(stillActive);
        }

        // Kirim notif selesai
        if (messages.length > 0) {
            const channel = await client.channels.fetch(channelId).catch(() => null);
            if (channel) channel.send(messages.join('\n'));
        }

        // Jam 4 pagi → kirim semua event aktif
        if (now.hour() === 4 && now.minute() === 0) {
            const channel = await client.channels.fetch(channelId).catch(() => null);
            if (channel) {
                if (stillActive.length > 0) {
                    const list = stillActive.map(e => 
                        `📢 **${e.name}** selesai pada <t:${e.endTime}:F> (<t:${e.endTime}:R>)`
                    );
                    channel.send(`<@&${roleId}>\n${list.join('\n')}`);
                } else {
                    channel.send('📭 Tidak ada event yang berlangsung hari ini.');
                }
            }
        }
    }, { timezone: 'Asia/Jakarta' });
}

module.exports = { startTimeChecker };
