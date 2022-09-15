const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
	guildId: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: false,
	},
	channels:{
		type: Array,
		required: false,
	},
	autoArchiveDuration:{
		type: Number,
		required: true,
		default: 1440,
	},
});

module.exports = mongoose.model('Guild', guildSchema);