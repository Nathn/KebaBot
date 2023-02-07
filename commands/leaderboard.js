const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Affiche le classement des gros mangeurs de kebabs.'),
    async execute(interaction) {
        const Kebab = mongoose.model('Kebab');
        const kebabs = await Kebab.aggregate([
            { $group: { _id: '$user', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        let leaderboard = '';
        for (let i = 0; i < Math.min(10, kebabs.length); i++) {
            const kebab = kebabs[i];
            const user = await interaction.client.users.fetch(kebab._id);
            switch (i) {
                case 0:
                    leaderboard += `:crown: `;
                    break;
                case 1:
                    leaderboard += `:second_place: `;
                    break;
                case 2:
                    leaderboard += `:third_place: `;
                    break;
                default:
                    leaderboard += `:medal: `;
            }
            if (user == interaction.user) {
                leaderboard += `**${i + 1}. ${user.username} (${kebab.count} kebab${kebab.count > 1 ? 's' : ''})**\n`;
            } else {
                leaderboard += `${i + 1}. ${user.username} (${kebab.count} kebab${kebab.count > 1 ? 's' : ''})\n`;
            }
        }
        await interaction.reply(leaderboard);
    }
};
