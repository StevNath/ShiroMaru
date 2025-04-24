// wajib di jalankan setelah menambah command baru
const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json'); // Pastikan ada clientId dan guildId
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const rest = new REST().setToken(token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// Tentukan apakah kita menggunakan guild atau global commands
		const useGuild = guildId ? true : false; // Jika guildId ada, maka pakai guild command

		// Jika menggunakan guild, deploy ke guild tertentu, jika tidak, deploy ke global
		const route = useGuild
			? Routes.applicationGuildCommands(clientId, guildId) // Guild-specific command
			: Routes.applicationCommands(clientId);             // Global command

		const data = await rest.put(route, { body: commands });

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();
