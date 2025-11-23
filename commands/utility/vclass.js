const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { readIcal } = require("../../events/readical.js");
const { formatDate } = require("../../events/formatdate.js");

// Karena URL-nya sama, cukup 1 variabel
const { VCLASS_URL } = require("../../config.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("vclass")
        .setDescription("Menampilkan jadwal dari V-Class"),

    async execute(interaction) {
        await interaction.deferReply();

        if (!VCLASS_URL) {
            return interaction.editReply("❌ URL VCLASS belum diatur di config.json");
        }

        let events;
        try {
            events = await readIcal(VCLASS_URL);
        } catch (err) {
            console.error(err);
            return interaction.editReply("❌ Gagal mengambil data dari VClass.");
        }

        if (!events || events.length === 0) {
            return interaction.editReply("📭 Tidak ada jadwal tersedia.");
        }

        const embed = new EmbedBuilder()
            .setTitle("📅 Jadwal V-Class")
            .setColor(0x00bfff)
            .setTimestamp()

        for (const ev of events) {
            const start = ev.start ? formatDate(ev.start) : "Tidak ada data";
            const end = ev.end ? formatDate(ev.end) : "Tidak ada data";

            embed.addFields({
                name: ev.summary,
                value: `**Mulai:** ${start}\n**Selesai:** ${end}`
            });
        }
        embed.setFooter({ text: "Tugas Yang tidak ada batas waktu kemungkinan tidak muncul" });

        return interaction.editReply({ embeds: [embed] });
    }
};
