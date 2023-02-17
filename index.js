const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require('discord.js')
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions
    ]
})

const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({
	path: '.env'
});

// Connect to our Database and handle an bad connections
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
mongoose.set('strictQuery', true);
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
	console.log('Une erreur est survenue avec la base de données : ' + err);
})

// Load all models
require('./models/Kebab');

// Load all commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.on('ready', () => {
	console.log("Bot is online.");
	client.user.setPresence({
		status: "online", // You can show online, idle....
		activities: [
			{
				name: "King Burger", // The message shown
				type: ActivityType.Watching // PLAYING: WATCHING: LISTENING: STREAMING:
			}
		]
	});
})

// Added to a server
client.on("guildCreate", guild => {
	console.log("Joined a new server : " + guild.name);
})

// Removed from a server
client.on("guildDelete", guild => {
	console.log("Left a server : " + guild.name);
})

// Listen for messages
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		await interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de la commande. Zola a dit j\'accuse, moi je m\'excuse.', ephemeral: true });
		console.error(error);
	}
});


client.login(process.env.BOT_TOKEN);
