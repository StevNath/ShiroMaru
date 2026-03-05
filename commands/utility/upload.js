const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const https = require('https');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('uploadjadwal')
		.setDescription('Uploads the schedule file to the server')
        .addAttachmentOption(option =>
            option.setName('file')
                .setDescription('The schedule file to upload')
                .setRequired(true)
        ),
	async execute(interaction) {
        const allowedRole = "Ordal"

        if (!interaction.member.roles.cache.some(role => role.name === allowedRole)) {
            return interaction.reply({
                content: 'Kamu tidak punya izin untuk menggunakan command ini!',
                ephemeral: true
            });
        }

		const attachment = interaction.options.getAttachment('file');

        const cacheDir = path.join(__dirname, '../../cache');
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }

        const filePath = path.join(cacheDir, attachment.name);
        const file = fs.createWriteStream(filePath);

        https.get(attachment.url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                interaction.reply({ content: 'File uploaded successfully!', ephemeral: true });
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => {});
            console.error(err);
            interaction.reply({ content: 'Failed to upload file.', ephemeral: true });
        });
	},
}