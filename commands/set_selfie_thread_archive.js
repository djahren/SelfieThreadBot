const { Constants } = require('discord.js');
const GuildDB = require('../models/guild')

module.exports = {
	data: {"name": "setselfiethreadarchive",
		"description": "Sets the number of time until a thread is archived.",
		"options": [{
			"type": Constants.ApplicationCommandOptionTypes.INTEGER,
			"name": "time",
			"description": "Can be 1 or 24 hours. If server is boosted it can be 3 or 7 days, depending on boost level.",
			"choices": [{
				"name": "1 hour",
				"value": 1
			},{
				"name": "1 day",
				"value": 24
			},{
				"name": "3 days",
				"value": 72
			},{
				"name": "1 week",
				"value": 168
			}],
			"required": true
	  	}]
	},
	async execute(interaction) {
		const guildFromDb = await GuildDB.findOne({guildId: interaction.guildId})
		if(!guildFromDb){
			await interaction.reply({content: 'Error: Could not find that guild in my database.', ephemeral: true});
			return
		}
		const time = interaction.options.getInteger('time');
		const tier = interaction.member.guild.premiumTier;
		const timeNames = {1: "1 hour",	24: "1 day",  
						   72: "3 days", 168: "1 week"}
		if(time > 24 && tier == 'NONE'){
			await interaction.reply({content: 'Error: Your server is not boosted and can have a maximum time of 1 day.', ephemeral: true});
			return
		} else if (time > 72 && tier == 'TIER_1') {
			await interaction.reply({content: 'Error: Your server is at boost level 1 and can have a maximum time of 3 days.', ephemeral: true});
			return
		}
		
		guildFromDb.autoArchiveDuration = time * 60
		await guildFromDb.save()

		await interaction.reply(`The auto-archive time has been set to \`${timeNames[time]}\` for all selfie channels on ${interaction.member.guild.name}`);
	},
};