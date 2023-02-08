const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('rmkebab')
        .setDescription('Enlever un kebab de votre compte.'),
    async execute(interaction) {
        const Kebab = mongoose.model('Kebab');
        const kebab = await Kebab.findOne({ user: interaction.user.id });
        if (kebab) {
            kebab.count--;
            kebab.save();
            await interaction.reply(`Vous avez fait un ptit vomito. Il vous reste ${kebab.count} kebab${kebab.count > 1 ? 's' : ''}.`);
        } else {
            await interaction.reply(`Vous n'avez pas mangé de kebab.`);
        }
    }
};
