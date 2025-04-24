const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('All Information about the user'),
	async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('User Information')
            .addFields(
                { name: 'Account Username', value: interaction.user.username, inline: true },
                { name: 'Account Created at', value: interaction.user.createdAt.toString(), inline: true },
                { name: 'Account ID', value: interaction.user.id, inline: true },
                { name: 'Profile Picture', value: "" }
            )
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setTimestamp()
            .setFooter({ text: 'User Info' });
		await interaction.reply({ embeds: [embed] });
	},
}