const { SlashCommandBuilder } = require("discord.js");
const mongoose = require("mongoose");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("profil")
        .setDescription("Affiche un profil de gros mangeur de kebabs.")
        .addStringOption((option) =>
            option
                .setName("saison")
                .setDescription("La saison comptabilisée dans le profil.")
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName("user")
                .setDescription(
                    "L'utilisateur dont vous voulez voir le profil."
                )
                .setRequired(false)
        ),
    async execute(interaction) {
        const Kebab = mongoose.model("Kebab");
        let kebabs,
            user,
            reply = "",
            customuser = false;
        // Get current year
        const now = new Date();
        const currentYear = now.getFullYear();
        // If no specified season or it is not valid, use the current season (year)
        let season =
            parseInt(interaction.options.getString("saison")) || currentYear;
        if (!season || season < 2022 || season > currentYear) {
            season = currentYear;
        }
        // Get user profile for the kebabs between 1st september of season and 31st august of season+1
        const start = new Date(season, 8, 1); // September 1st of variable season
        const end = new Date(season + 1, 7, 31); // August 31st of season+1
        if (interaction.options.getString("user"))
            user = interaction.options.getString("user").replace(/[<@!>]/g, "");
        if (
            interaction.options.getString("user") &&
            user != interaction.user.id
        ) {
            customuser = true;
            kebabs = await Kebab.find({
                user: user,
                datetime: {
                    $gte: start,
                    $lte: end,
                },
            }).sort({ datetime: 1 });
            reply += `**Profil de ${interaction.options.getString(
                "user"
            )} pour la saison ${season}-${season + 1} :**\n\n`;
        } else {
            kebabs = await Kebab.find({
                user: interaction.user.id,
                datetime: {
                    $gte: start,
                    $lte: end,
                },
            }).sort({
                datetime: 1,
            });
            reply += `**Votre profil pour la saison ${season}-${
                season + 1
            } :**\n\n`;
        }
        const allkebabs = await Kebab.aggregate([
            { $match: { datetime: { $gte: start, $lte: end } } },
            { $group: { _id: "$user", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        let placeinleaderboard;
        if (customuser) {
            placeinleaderboard =
                allkebabs.findIndex((kebab) => kebab._id == user) + 1;
        } else {
            placeinleaderboard =
                allkebabs.findIndex(
                    (kebab) => kebab._id == interaction.user.id
                ) + 1;
        }
        switch (kebabs.length) {
            case 0:
                if (customuser) {
                    reply +=
                        "Cette personne n'a pas mangé de kebab cette saison.";
                } else {
                    reply += "Vous n'avez pas mangé de kebab cette saison.";
                }
                break;
            case 1:
                if (customuser) {
                    reply +=
                        "Cette personne a mangé un seul kebab cette saison.";
                } else {
                    reply += `Vous avez mangé un seul kebab cette saison.
Il a été mangé le ${kebabs[0].datetime.toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}.`;
                }
                break;
            default:
                if (customuser) {
                    reply += `Cette personne a mangé ${kebabs.length} kebab${
                        kebabs.length > 1 ? "s" : ""
                    } cette saison.
Son premier kebab a été mangé le ${kebabs[0].datetime.toLocaleDateString(
                        "fr-FR",
                        {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        }
                    )}.
Son dernier kebab a été mangé le ${kebabs[
                        kebabs.length - 1
                    ].datetime.toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}.`;
                } else {
                    reply += `Vous avez mangé ${kebabs.length} kebab${
                        kebabs.length > 1 ? "s" : ""
                    } cette saison.
Votre premier kebab a été mangé le ${kebabs[0].datetime.toLocaleDateString(
                        "fr-FR",
                        {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        }
                    )}.
Votre dernier kebab a été mangé le ${kebabs[
                        kebabs.length - 1
                    ].datetime.toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}.`;
                }
                break;
        }
        if (customuser) {
            if (placeinleaderboard == 0 || kebabs.length == 0) {
                reply +=
                    "\nCette personne n'est pas dans le classement des mangeurs de kebabs de la saison.";
            } else if (placeinleaderboard == 1) {
                reply +=
                    "\nCette personne est première du classement des plus gros mangeurs de kebabs de la saison !";
            } else {
                reply += `\nCette personne est ${placeinleaderboard}ème du classement des plus gros mangeurs de kebabs de la saison.`;
            }
        } else {
            if (placeinleaderboard == 0 || kebabs.length == 0) {
                reply +=
                    "\nVous n'êtes pas dans le classement des mangeurs de kebabs de la saison.";
            } else if (placeinleaderboard == 1) {
                reply +=
                    "\nVous êtes premier du classement des plus gros mangeurs de kebabs de la saison !";
            } else {
                reply += `\nVous êtes ${placeinleaderboard}ème du classement des plus gros mangeurs de kebabs de la saison.`;
            }
        }
        await interaction.reply(reply);
    },
};
