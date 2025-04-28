const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('List All Commands'),
	async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('All Commands')
            .setDescription('List of all commands available in the bot.')
            .addFields(
                { name: '/hello', value: 'Replies with Hello!' },
                { name: '/info', value: 'All Information about the user' },
                { name: '/membercount', value: 'Shows total number of members' },
                { name: '/adventure', value: 'RPG Adventure' },
                { name: 'jadwal', value: 'Jadwal kelas' },
                { name: '/alert', value: 'Alert' },
                { name: '/help', value: 'List All Commands' },


            )
		await interaction.reply({ embeds: [embed] });
	},
}