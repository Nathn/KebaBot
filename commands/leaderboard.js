const { SlashCommandBuilder } = require("discord.js");
const mongoose = require("mongoose");

function getSeason() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const month = now.getMonth();
    if (month < 8) {
        return currentYear - 1;
    } else {
        return currentYear;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Affiche le classement des gros mangeurs de kebabs.")
        .addStringOption((option) =>
            option
                .setName("saison")
                .setDescription(
                    "La saison dont vous voulez voir le classement."
                )
                .setRequired(false)
        ),
    async execute(interaction) {
        const Kebab = mongoose.model("Kebab");
        // Get current year
        const now = new Date();
        const currentYear = now.getFullYear();
        // If no specified season or it is not valid, use the current season (year)
        let season =
            parseInt(interaction.options.getString("saison")) || currentYear;
        if (!season || season < 2022 || season > currentYear) {
            season = getSeason();
        }
        // Get leaderboard for the kebabs between 1st september of season and 31st august of season+1
        const start = new Date(season, 8, 1); // September 1st of variable season
        const end = new Date(season + 1, 7, 31); // August 31st of season+1
        const kebabs = await Kebab.aggregate([
            {
                $match: {
                    datetime: {
                        $gte: start,
                        $lte: end,
                    },
                },
            },
            {
                $group: {
                    _id: "$user",
                    count: { $sum: 1 },
                    latestKebabDate: { $max: "$datetime" },
                },
            },
            { $sort: { count: -1, latestKebabDate: 1 } },
        ]);
        let leaderboard = "";
        if (!kebabs.length) {
            leaderboard += `Aucun kebab n'a été mangé cette saison.`;
            await interaction.reply(leaderboard);
            return;
        } else {
            leaderboard += `**Classement des mangeurs de kebabs de la saison ${season}-${
                season + 1
            } :**\n\n`;
        }
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
                leaderboard += `**${i + 1}. ${user.username} (${
                    kebab.count
                } kebab${kebab.count > 1 ? "s" : ""})**\n`;
            } else {
                leaderboard += `${i + 1}. ${user.username} (${
                    kebab.count
                } kebab${kebab.count > 1 ? "s" : ""})\n`;
            }
        }
        await interaction.reply(leaderboard);
    },
};
