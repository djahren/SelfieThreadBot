const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types/v10');
const GuildDB = require('../models/guild');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removeselfiechannel')
		.setDescription('Removes a channel from SelfieThreadBot\'s watch list.')
		.setDefaultMemberPermissions('0')
		.setDMPermission(false)
		.addChannelOption((option) => (
			option.setName('channel')
				.setDescription('The channel to remove.')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText)
		)),
	async execute(interaction) {
		const channel = interaction.options.getChannel('channel');
		const guildDbObj = await GuildDB.findOne({ 'guildId': interaction.guildId });
		const channelIndex = guildDbObj.channels.indexOf(channel.id);
		if (channelIndex != -1) {
			guildDbObj.channels.splice(channelIndex, 1);
			await guildDbObj.save();
			interaction.reply(`I will no longer create threads in <#${channel.id}>.`);
		}
		else {
			interaction.reply(`I'm not currently creating threads in <#${channel.id}>.`);
		}
	},
};