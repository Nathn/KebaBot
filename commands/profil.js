const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('profil')
        .setDescription('Affiche votre profil de gros mangeur de kebabs.'),
    async execute(interaction) {
        const Kebab = mongoose.model('Kebab');
        const kebabs = await Kebab.find({ user: interaction.user.id }).sort({ datetime: 1 });
        switch (kebabs.length) {
            case 0:
                await interaction.reply('Vous n\'avez jamais mangé de kebab.');
                return;
            case 1:
                await interaction.reply(`Vous avez mangé un seul kebab.
Il a été mangé le ${kebabs[0].datetime.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`);
                return;
            default:
                await interaction.reply(`Vous avez mangé ${kebabs.length} kebab${kebabs.length > 1 ? 's' : ''}.
Votre premier kebab a été mangé le ${kebabs[0].datetime.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
Votre dernier kebab a été mangé le ${kebabs[kebabs.length - 1].datetime.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`);
                return;
        }
    }
};
