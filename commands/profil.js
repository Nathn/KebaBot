const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('profil')
        .setDescription('Affiche votre profil de gros mangeur de kebabs.'),
    async execute(interaction) {
        const Kebab = mongoose.model('Kebab');
        const kebabs = await Kebab.find({ user: interaction.user.id }).sort({ datetime: 1 });
        const allkebabs = await Kebab.aggregate([
            { $group: { _id: '$user', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const placeinleaderboard = allkebabs.findIndex(kebab => kebab._id == interaction.user.id) + 1;
        let reply = '';
        switch (kebabs.length) {
            case 0:
                reply += 'Vous n\'avez jamais mangé de kebab.';
                break;
            case 1:
                reply += `Vous avez mangé un seul kebab.
Il a été mangé le ${kebabs[0].datetime.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
                break;
            default:
                reply += `Vous avez mangé ${kebabs.length} kebab${kebabs.length > 1 ? 's' : ''}.
Votre premier kebab a été mangé le ${kebabs[0].datetime.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
Votre dernier kebab a été mangé le ${kebabs[kebabs.length - 1].datetime.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
            break;
        }
        if (placeinleaderboard == 0) {
            reply += '\nVous n\'êtes pas dans le classement des mangeurs de kebabs.';
        } else if (placeinleaderboard == 1) {
            reply += '\nVous êtes premier du classement des plus gros mangeurs de kebabs !';
        } else {
            reply += `\nVous êtes ${placeinleaderboard}ème du classement des plus gros mangeurs de kebabs.`;
        }
        await interaction.reply(reply);
    }
};
