const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types/v10');
const GuildDB = require('../models/guild');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("addselfiechannel")
		.setDescription("Adds a channel to SelfieThreadBot's watch list.")
		.setDefaultMemberPermissions("0")
		.setDMPermission(false)
		.addChannelOption((option) => (
			option.setName("channel")
				.setDescription("The channel to add.")
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText)
		)),
	async execute(interaction) {
		const exclamations = ["Great", "Wonderful", "Fantastic", "Sounds good", "Let's take a selfie"];
		const channel = interaction.options.getChannel('channel');
		const guildDbObj = await GuildDB.findOne({ 'guildId': interaction.guildId });
		if (guildDbObj.channels.indexOf(channel.id) != -1) {
			interaction.reply(`I'm already creating threads in <#${channel.id}>.`);
		} else {
			guildDbObj.channels.push(channel.id);
			await guildDbObj.save();
			interaction.reply(`${exclamations[Math.floor(Math.random() * exclamations.length)]}! I will start creating threads when media is shared in <#${channel.id}>.`);
		}
	},
};