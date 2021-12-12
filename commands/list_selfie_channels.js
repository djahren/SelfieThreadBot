const GuildDB = require('../models/guild')

module.exports = {
	data: {
		"name": "listselfiechannels",
		"description": "Lists all channels which SelfieThreadBot is monitoring.",
	},
	isAdminCommand: false,
	async execute(interaction) {
		const guildFromDb = await GuildDB.findOne({guildId: interaction.guildId})
		if(!guildFromDb){
			await interaction.reply({content: 'Error: Could not find that guild in my database.', ephemeral: true});
			return
		}
		if(guildFromDb.channels.length){
			let monitoredChannels = ""
			guildFromDb.channels.forEach((channelId) =>{
				monitoredChannels += `- <#${channelId}>\n`
			})
			await interaction.reply(`These are the channels I will create threads in:\n${monitoredChannels}`);	
		} else {
			await interaction.reply(`This server doesn't currently have any selfie thread channels. 😢`);	
		}
	},
};