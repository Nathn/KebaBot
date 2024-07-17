const { SlashCommandBuilder } = require("discord.js");
const mongoose = require("mongoose");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("palmares")
        .setDescription("Affiche le palmarès d'un mangeur de kebabs.")
        .addStringOption((option) =>
            option
                .setName("user")
                .setDescription(
                    "L'utilisateur dont vous voulez voir le palmarès."
                )
                .setRequired(false)
        ),
    async execute(interaction) {
        const Kebab = mongoose.model("Kebab");
        let kebabs,
            user,
            reply = "",
            customuser = false;
        if (interaction.options.getString("user"))
            user = interaction.options.getString("user").replace(/[<@!>]/g, "");
        if (
            interaction.options.getString("user") &&
            user != interaction.user.id
        ) {
            customuser = true;
            reply += `**Palmarès de ${interaction.options.getString(
                "user"
            )} :**\n\n`;
        } else {
            reply += `**Votre palmarès toutes saisons confondues :**\n\n`;
        }
        // Get current year
        const now = new Date();
        const currentYear = now.getFullYear();
        let start, end, allkebabs, placeinleaderboard;
        // for each season between 2022 and current year
        for (let season = 2022; season <= currentYear; season++) {
            start = new Date(season, 8, 1); // September 1st of variable season
            end = new Date(season + 1, 7, 31); // August 31st of season+1
            allkebabs = await Kebab.aggregate([
                { $match: { datetime: { $gte: start, $lte: end } } },
                { $group: { _id: "$user", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]);
            if (customuser) {
                placeinleaderboard =
                    allkebabs.findIndex((kebab) => kebab._id == user) + 1;
            } else {
                placeinleaderboard =
                    allkebabs.findIndex(
                        (kebab) => kebab._id == interaction.user.id
                    ) + 1;
            }
            switch (placeinleaderboard) {
                case 1:
                    reply += `:trophy: Champion de la saison ${season}-${
                        season + 1
                    } (x${allkebabs[0].count})\n`;
                    break;
                case 2:
                    reply += `:second_place: Vice-champion de la saison ${season}-${
                        season + 1
                    } (x${allkebabs[1].count})\n`;
                    break;
                case 3:
                    reply += `:third_place: Troisième de la saison ${season}-${
                        season + 1
                    } (x${allkebabs[2].count})\n`;
                    break;
                default:
                    break;
            }
            // create an empty object to store the ratios for each user
            const ratios = {};

            // loop through each user in the allkebabs array
            for (const kebab of allkebabs) {
                // get the user's name and kebab count
                const { _id: name, count: kebabCount } = kebab;
                // sort the user's kebabs by date
                const userKebabs = await Kebab.find({
                    user: name,
                    datetime: { $gte: start, $lte: end },
                }).sort({ datetime: 1 });
                if (userKebabs.length < 5) continue; // skip users with less than 5 kebabs
                // calculate the number of days between the first and last kebab
                const firstKebab = userKebabs[0]?.datetime;
                const lastKebab = userKebabs[userKebabs.length - 1]?.datetime;
                console.log(name);
                console.log(firstKebab, lastKebab);
                const days =
                    firstKebab && lastKebab
                        ? Math.round(
                              (lastKebab - firstKebab) / (1000 * 60 * 60 * 24)
                          )
                        : 0;
                console.log(days);
                console.log(kebabCount);
                // calculate the ratio for the user (Math.round((kebabs.length / days) * 100) / 100)
                const ratio = Math.round((kebabCount / days) * 100) / 100;
                console.log(ratio);
                // store the ratio for the user in the ratios object
                ratios[name] = ratio;
            }
            // sort the users by their ratio in descending order
            const sortedUsers = Object.keys(ratios).sort(
                (a, b) => ratios[b] - ratios[a]
            );
            // get the user's place in the leaderboard
            if (customuser) {
                placeinleaderboard =
                    sortedUsers.findIndex((user) => user == user) + 1;
            } else {
                placeinleaderboard =
                    sortedUsers.findIndex(
                        (user) => user == interaction.user.id
                    ) + 1;
            }
            switch (placeinleaderboard) {
                case 1:
                    reply += `:trophy: Meilleur ratio de la saison ${season}-${
                        season + 1
                    } (${ratios[sortedUsers[0]]} kebab/jour)\n`;
                    break;
                case 2:
                    reply += `:second_place: Deuxième meilleur ratio de la saison ${season}-${
                        season + 1
                    } (${ratios[sortedUsers[1]]} kebab/jour)\n`;
                    break;
                case 3:
                    reply += `:third_place: Troisième meilleur ratio de la saison ${season}-${
                        season + 1
                    } (${ratios[sortedUsers[2]]} kebab/jour)\n`;
                    break;
                default:
                    break;
            }
        }
        // get the user's place in the global leaderboard (all seasons)
        allkebabs = await Kebab.aggregate([
            { $group: { _id: "$user", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        if (customuser) {
            placeinleaderboard =
                allkebabs.findIndex((kebab) => kebab._id == user) + 1;
        } else {
            placeinleaderboard =
                allkebabs.findIndex(
                    (kebab) => kebab._id == interaction.user.id
                ) + 1;
        }
        switch (placeinleaderboard) {
            case 1:
                reply += `:trophy: Plus gros mangeur de tous les temps (x${allkebabs[0].count})\n`;
                break;
            case 2:
                reply += `:second_place: Deuxième plus gros mangeur de tous les temps (x${allkebabs[1].count})\n`;
                break;
            case 3:
                reply += `:third_place: Troisième plus gros mangeur de tous les temps (x${allkebabs[2].count})\n`;
                break;
            default:
                break;
        }
        await interaction.reply(reply);
    },
};
