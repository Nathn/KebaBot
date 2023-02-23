const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('profil')
        .setDescription('Affiche un profil de gros mangeur de kebabs.')
        .addStringOption(option =>
            option.setName('user')
                .setDescription('L\'utilisateur dont vous voulez voir le profil.')
                .setRequired(false)
        ),
    async execute(interaction) {
        const Kebab = mongoose.model('Kebab');
        let kebabs, user, reply = '', customuser = false;
        if (interaction.options.getString('user'))
            user = interaction.options.getString('user').replace(/[<@!>]/g, '');
        if (interaction.options.getString('user') && user != interaction.user.id) {
            customuser = true;
            kebabs = await Kebab.find({ user: user }).sort({ datetime: 1 });
            reply += `Profil de ${interaction.options.getString('user')} :\n`;
        } else {
            kebabs = await Kebab.find({ user: interaction.user.id }).sort({ datetime: 1 });
        }
        const allkebabs = await Kebab.aggregate([
            { $group: { _id: '$user', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        let placeinleaderboard;
        if (customuser) {
            placeinleaderboard = allkebabs.findIndex(kebab => kebab._id == user) + 1;
        } else {
            placeinleaderboard = allkebabs.findIndex(kebab => kebab._id == interaction.user.id) + 1;
        }
        switch (kebabs.length) {
            case 0:
                if (customuser) {
                    reply += 'Cette personne n\'a jamais mangé de kebab.';
                } else {
                    reply += 'Vous n\'avez jamais mangé de kebab.';
                }
                break;
            case 1:
                if (customuser) {
                    reply += 'Cette personne a mangé un seul kebab.';
                } else {
                    reply += `Vous avez mangé un seul kebab.
Il a été mangé le ${kebabs[0].datetime.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
                }
                break;
            default:
                if (customuser) {
                    reply += `Cette personne a mangé ${kebabs.length} kebab${kebabs.length > 1 ? 's' : ''}.
Son premier kebab a été mangé le ${kebabs[0].datetime.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
Son dernier kebab a été mangé le ${kebabs[kebabs.length - 1].datetime.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
                } else {
                    reply += `Vous avez mangé ${kebabs.length} kebab${kebabs.length > 1 ? 's' : ''}.
Votre premier kebab a été mangé le ${kebabs[0].datetime.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
Votre dernier kebab a été mangé le ${kebabs[kebabs.length - 1].datetime.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
                }
                break;
        }
        if (customuser) {
            if (placeinleaderboard == 0) {
                reply += '\nCette personne n\'est pas dans le classement des mangeurs de kebabs.';
            } else if (placeinleaderboard == 1) {
                reply += '\nCette personne est première du classement des plus gros mangeurs de kebabs !';
            } else {
                reply += `\nCette personne est ${placeinleaderboard}ème du classement des plus gros mangeurs de kebabs.`;
            }
        } else {
            if (placeinleaderboard == 0) {
                reply += '\nVous n\'êtes pas dans le classement des mangeurs de kebabs.';
            } else if (placeinleaderboard == 1) {
                reply += '\nVous êtes premier du classement des plus gros mangeurs de kebabs !';
            } else {
                reply += `\nVous êtes ${placeinleaderboard}ème du classement des plus gros mangeurs de kebabs.`;
            }
        }
        await interaction.reply(reply);
    }
};
