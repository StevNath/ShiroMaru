const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('membercount')
		.setDescription('Shows total number of members'),
	async execute(interaction) {
		await interaction.reply(`Current Member Count: ${interaction.guild.memberCount}`);
	},
}