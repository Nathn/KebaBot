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
        for (let i = 0; i < kebabs.length; i++) {
            const kebab = kebabs[i];
            const user = await interaction.client.users.fetch(kebab._id);
            leaderboard += `${i + 1}. ${user.username} (${kebab.count} kebab${kebab.count > 1 ? 's' : ''})\n`;
        }
        await interaction.reply(leaderboard);
    }
};
