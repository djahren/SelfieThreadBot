/*jshint esversion: 8 */
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./auth.json');
const mongoose = require('mongoose')
const GuildDB = require('./models/guild')
const fs = require('fs');

//SETUP
mongoose.connect('mongodb://localhost/guilds')
const db = mongoose.connection
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
// client.commands = new Collection(); //global commands

//GLOBALS
var watchedChannels = {} //{"1234guildID": [channelid1,channelid2]}
const commands = [];
const commandData = []
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commandData.push(command.data);
	commands.push(command);
}


//CORE FUNCTIONS
async function addGuildToDb(guild){
	guildExists = await GuildDB.findOne({"guildId": guild.id})
	if(guildExists) {
		console.log(`Guild [${guild.name}] already in db.`)
		return
	}
	const guildObj = new GuildDB({ 
		guildId: guild.id,
		name: guild.name
	})
	try{
		const newGuild = await guildObj.save();
		console.log("Added guild to db: " + guild.name)
	//	console.log(newGuild)
	} catch(err){
		console.error(err) 
	}
}

function removeGuildFromDb(guildId){
	GuildDB.deleteMany({guildId: guildId}, (err, res) => {
		if(err){
			console.error(err)
		} else {
			console.log(res)
		}
	})
}

async function registerCommands(guildId){
	const guild = client.guilds.cache.get(guildId)
	const admins = guild.roles.highest;
	const everyone = guild.roles.everyone;
	// client.commands.set(command.data.name, command); //global commands
	const guildCommandMgr = guild.commands
	const newCommands = await guildCommandMgr.set(commandData)
	newCommands.forEach((newCommand) => {
		const isAdminCommand = commands.find(c => c.data.name === newCommand.name).isAdminCommand;
		if(isAdminCommand){
			guild.commands.permissions.add({ 
				command: newCommand.id, 
				permissions: [
					{id: everyone.id, type: 'ROLE', permission: false},
					{id: admins.id, type: 'ROLE', permission: true},
				]	
			});
		}
	});
}

async function logGuildsInDb(){
	const currentGuilds = await GuildDB.find();
	currentGuilds.forEach((guild) => {
		console.log(guild.name + " with watched channels:")
		console.log(guild.channels)
	})
}

async function loadWatchedChannelsFromDb(){
	const currentGuilds = await GuildDB.find();
	currentGuilds.forEach((dbGuild) => {
		watchedChannels[dbGuild.guildId] = dbGuild.channels
	})
}

//SLASH COMMANDS
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	// const command = client.commands.get(interaction.commandName); //global commands
	const command = commands.find(c => c.data.name === interaction.commandName)
	if (!command) return;
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

//EVENT RESPONSES
client.once('ready', async () => {
	console.log('Ready!');
});

//create threads for any message with an attachment in watched threads.
client.on("messageCreate", async message => { 
	const guildId = message.guildId;
	await loadWatchedChannelsFromDb()
	//ensure the guild is in the watched channels array
	if(!(guildId in watchedChannels)) return
	//ensure the author of the message isn't the bot or any other bot
	if(message.author.id == client.user.id || message.author.bot)  return
	//ensure message is in a watched channel & has attachments
	if(watchedChannels[guildId].indexOf(message.channel.id) != -1
		&& message.attachments.size){
		const user = await message.guild.members.fetch(message.author.id);
		const guildFromDb = await GuildDB.findOne({guildId: guildId})
		const d = new Date()
		const threadName = "" + (d.getMonth()+1) + "-" + d.getDate() + " " + 
				(user.nickname || message.author.username)
		message.channel.threads.create({
			name: threadName,
			autoArchiveDuration: guildFromDb.autoArchiveDuration || 1440,
			startMessage: message,
		})
		.then(threadChannel => console.log(`Created ${threadChannel.name}.`))
		.catch(console.error);
	}
})

client.on("guildCreate", guild => { //joined a server
    console.log("Joined a new guild: " + guild.name);
	addGuildToDb(guild)
	registerCommands(guild.id)
	logGuildsInDb()
})

client.on("guildDelete", guild => { //removed from a server
    console.log("Left a guild: " + guild.name);
	removeGuildFromDb(guild.id)
	logGuildsInDb()
})

db.once('open', () => {
	console.log('Connected to Database')
	logGuildsInDb()
	loadWatchedChannelsFromDb()
})

db.on('error', (error) => console.error(error))
client.login(token);