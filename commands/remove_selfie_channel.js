const { Constants } = require('discord.js');
const GuildDB = require('../models/guild')

module.exports = {
	data: {
		"name": "removeselfiechannel",
		"description": "Removes a channel from SelfieThreadBot\'s watch list.",
		"options": [
			{
				"type": Constants.ApplicationCommandOptionTypes.CHANNEL,
				"name": "channel",
				"description": "The channel to remove.",
				"required": true
			}
		]
	},
	isAdminCommand: true,
	async execute(interaction) {
		const channel = interaction.options.getChannel('channel');
		const guildDbObj = await GuildDB.findOne({'guildId': interaction.guildId});
		const channelIndex = guildDbObj.channels.indexOf(channel.id)
		if(channelIndex != -1){
			guildDbObj.channels.splice(channelIndex, 1)
			await guildDbObj.save();
			interaction.reply(`I will no longer create threads in <#${channel.id}>.`)
		} else {
			interaction.reply(`I'm not currently creating threads in <#${channel.id}>.`)
		}
	},
};