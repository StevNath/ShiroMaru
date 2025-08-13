const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { token } = require('./config.json');

// Menambahkan intent yang dibutuhkan
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,                 // Untuk event terkait guild (server)
		GatewayIntentBits.GuildMessages,          // Untuk mendengarkan pesan di server
		GatewayIntentBits.MessageContent,         // Untuk membaca isi pesan (required for message-based commands)
		GatewayIntentBits.GuildMembers,           // Untuk membaca event anggota (misal saat ada user join/leave)
		GatewayIntentBits.GuildPresences,         // Untuk mendapatkan informasi presensi anggota (status online, dsb.)
		GatewayIntentBits.GuildVoiceStates,       // Untuk membaca status suara anggota (join, leave, dll.)
		GatewayIntentBits.DirectMessages,         // Untuk event terkait pesan pribadi
		GatewayIntentBits.MessageContent,         // Intent untuk bisa mengakses isi pesan yang masuk
	]
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventPath, file);
	const event = require(filePath);
	if (event.once){
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}
client.once('ready', () => {
	console.log(`✅ Bot login sebagai ${client.user.tag}`);

	// Mulai cron job timeChecker
	const { startTimeChecker } = require('./events/timeChecker');
	startTimeChecker(client);
});

client.login(token);
