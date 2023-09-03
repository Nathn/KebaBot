const { SlashCommandBuilder } = require("discord.js");
const mongoose = require("mongoose");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ratio")
        .setDescription("Affiche le ratio de kebab mangés par jour.")
        .addStringOption((option) =>
            option
                .setName("user")
                .setDescription("L'utilisateur dont vous voulez voir le ratio.")
                .setRequired(false)
        )
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
        let kebabs,
            user,
            reply = "",
            customuser = false;
        const now = new Date();
        const currentYear = now.getFullYear();
        // If no specified season or it is not valid, use the current season (year)
        let season =
            parseInt(interaction.options.getString("saison")) || currentYear;
        if (!season || season < 2022 || season > currentYear) {
            season = currentYear;
        }
        // Get users kebabs between 1st september of season and 31st august of season+1
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
            reply += `**Ratio de ${interaction.options.getString(
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
            reply += `**Votre ratio pour la saison ${season}-${
                season + 1
            } :**\n\n`;
        }
        let firstkebab,
            lastkebab,
            days = 0,
            dayswithoutweekends = 0;
        if (kebabs.length > 0) {
            firstkebab = kebabs[0].datetime;
            lastkebab = kebabs[kebabs.length - 1].datetime;
            if (firstkebab && lastkebab) {
                let firstkebabcopy = new Date(firstkebab);
                days = Math.ceil(
                    (lastkebab - firstkebab) / (1000 * 60 * 60 * 24)
                );
                for (let i = 0; i < days; i++) {
                    if (
                        firstkebabcopy.getDay() != 0 &&
                        firstkebabcopy.getDay() != 6
                    ) {
                        dayswithoutweekends++;
                    }
                    firstkebabcopy.setDate(firstkebabcopy.getDate() + 1);
                }
            }
        }
        switch (kebabs.length) {
            case 0:
                if (customuser) {
                    reply +=
                        "Cette personne n'a jamais mangé de kebab cette saison.\n";
                } else {
                    reply +=
                        "Vous n'avez jamais mangé de kebab cette saison.\n";
                }
                reply += "Ratio : 0 kebab par jour.";
                break;
            case 1:
                if (customuser) {
                    reply += `Cette personne a mangé un seul kebab cette saison, le ${firstkebab.toLocaleDateString(
                        "fr-FR",
                        {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        }
                    )}.\n`;
                } else {
                    reply += `Vous avez mangé un seul kebab cette saison, le ${firstkebab.toLocaleDateString(
                        "fr-FR",
                        {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        }
                    )}.\n`;
                }
                reply += `Ratio avec week-ends : ${
                    Math.round((kebabs.length / days) * 100) / 100
                } kebab${
                    Math.round((kebabs.length / days) * 100) / 100 > 1
                        ? "s"
                        : ""
                } par jour.\n`;
                reply += `Ratio sans week-ends : ${
                    Math.round((kebabs.length / dayswithoutweekends) * 100) /
                    100
                } kebab${
                    Math.round((kebabs.length / dayswithoutweekends) * 100) /
                        100 >
                    1
                        ? "s"
                        : ""
                } par jour.`;
                break;
            default:
                if (customuser) {
                    reply += `Cette personne a mangé ${
                        kebabs.length
                    } kebabs depuis le ${firstkebab.toLocaleDateString(
                        "fr-FR",
                        {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        }
                    )} cette saison.\n`;
                } else {
                    reply += `Vous avez mangé ${
                        kebabs.length
                    } kebabs depuis le ${firstkebab.toLocaleDateString(
                        "fr-FR",
                        {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        }
                    )} cette saison.\n`;
                }
                reply += `Ratio : ${
                    Math.round((kebabs.length / days) * 100) / 100
                } kebab${
                    Math.round((kebabs.length / days) * 100) / 100 > 1
                        ? "s"
                        : ""
                } par jour.\n`;
                reply += `Ratio sans week-ends : ${
                    Math.round((kebabs.length / dayswithoutweekends) * 100) /
                    100
                } kebab${
                    Math.round((kebabs.length / dayswithoutweekends) * 100) /
                        100 >
                    1
                        ? "s"
                        : ""
                } par jour.`;
                break;
        }
        await interaction.reply(reply);
    },
};
