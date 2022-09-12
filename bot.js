const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { Client, Intents } = require('discord.js');
const { token } = require('./auth.json');
const mongoose = require('mongoose');
const GuildDB = require('./models/guild');
const fs = require('fs');

// SETUP
mongoose.connect('mongodb://stb-mongo:27017/guilds');
const db = mongoose.connection;
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const rest = new REST({ version: '10' }).setToken(token);

// GLOBALS
const watchedChannels = {}; // {"1234guildID": [channelid1,channelid2]}
const commands = [];
const commandData = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commandData.push(command.data.toJSON());
	commands.push(command);
}


// CORE FUNCTIONS
async function addGuildToDb(guild) {
	const guildExists = await GuildDB.findOne({ "guildId": guild.id });
	if (guildExists) {
		console.log(`Guild [${guild.name}] already in db.`);
		return;
	}
	const guildObj = new GuildDB({
		guildId: guild.id,
		name: guild.name,
	});
	try {
		await guildObj.save();
		console.log("Added guild to db: " + guild.name);
		//	console.log(newGuild)
	} catch (err) {
		console.error(err);
	}
}

function removeGuildFromDb(guildId) {
	GuildDB.deleteMany({ guildId: guildId }, (err, res) => {
		if (err) {
			console.error(err);
		} else {
			console.log(res);
		}
	});
}

async function registerGlobalCommands(clientId) {
	try {
		console.log(`Started refreshing ${commandData.length} application (/) commands.`);
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commandData },
		);
		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
}

async function checkForRogueGuilds() {
	const guildsInDb = await GuildDB.find();
	const guildIdsInDb = [];
	guildsInDb.forEach((guildInDb) => {
		guildIdsInDb.push(guildInDb.guildId);
	});
	const clientGuilds = client.guilds.cache;
	clientGuilds.forEach((clientGuild) => {
		if (guildIdsInDb.indexOf(clientGuild.id) == -1) {
			// guild in client but not in db
			addGuildToDb(clientGuild);
		}
	});
}

async function logGuildsInDb() {
	const currentGuilds = await GuildDB.find();
	currentGuilds.forEach((guild) => {
		console.log(guild.name + " with watched channels:");
		console.log(guild.channels);
	});
}

async function loadWatchedChannelsFromDb() {
	const currentGuilds = await GuildDB.find();
	currentGuilds.forEach((dbGuild) => {
		watchedChannels[dbGuild.guildId] = dbGuild.channels;
	});
}

// SLASH COMMANDS
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	const command = commands.find(c => c.data.name === interaction.commandName);
	if (command) {
		try {
			await command.execute(interaction);
			logGuildsInDb(); // extra logging to find db clear bug
			return;
		}
		catch (error) {
			console.error(error);
		}
	}
	return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
});

// EVENT RESPONSES
client.once('ready', async () => {
	console.log('Ready!');
	registerGlobalCommands(client.user.id);
	checkForRogueGuilds();
});

// create threads for any message with an attachment in watched threads.
client.on("messageCreate", async message => {
	const guildId = message.guildId;
	await loadWatchedChannelsFromDb();
	// ensure the guild is in the watched channels array
	if (!(guildId in watchedChannels)) return;
	// ensure the author of the message isn't the bot or any other bot
	if (message.author.id == client.user.id || message.author.bot) return;
	// ensure message is in a watched channel & has attachments
	if (watchedChannels[guildId].indexOf(message.channel.id) != -1
		&& message.attachments.size) {
		const user = await message.guild.members.fetch(message.author.id);
		const guildFromDb = await GuildDB.findOne({ guildId: guildId });
		const d = new Date();
		const threadName = "" + (d.getMonth() + 1) + "-" + d.getDate() + " " +
			(user.nickname || message.author.username);
		message.channel.threads.create({
			name: threadName,
			autoArchiveDuration: guildFromDb.autoArchiveDuration || 1440,
			startMessage: message,
		})
			.then(threadChannel => {
				console.log(`Created thread in #${message.channel.name}: ${threadChannel.name}.`);
				logGuildsInDb(); // extra logging to find db clear bug
			})
			.catch(console.error);
	}
});

client.on("guildCreate", guild => { // joined a server
	console.log("Joined a new guild: " + guild.name);
	addGuildToDb(guild);
	logGuildsInDb();
});

client.on("guildDelete", guild => { // removed from a server
	console.log("Left a guild: " + guild.name);
	removeGuildFromDb(guild.id);
	logGuildsInDb();
});

db.once('open', () => {
	console.log('Connected to Database');
	logGuildsInDb();
	loadWatchedChannelsFromDb();
});

db.on('error', (error) => console.error(error));
client.login(token);

// log out of Discord when container stopped
process.on('SIGINT', () => client.destroy());
process.on('SIGTERM', () => client.destroy());