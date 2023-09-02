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
            kebabs = await Kebab.find({ user: user }).sort({ datetime: 1 });
            reply += `Ratio de ${interaction.options.getString("user")} :\n`;
        } else {
            kebabs = await Kebab.find({ user: interaction.user.id }).sort({
                datetime: 1,
            });
        }
        let firstkebab,
            now,
            days = 0,
            dayswithoutweekends = 0;
        if (kebabs.length > 0) {
            firstkebab = kebabs[0].datetime;
            now = new Date();
            if (firstkebab && now) {
                let firstkebabcopy = new Date(firstkebab);
                days = Math.ceil((now - firstkebab) / (1000 * 60 * 60 * 24));
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
                    reply += "Cette personne n'a jamais mangé de kebab.\n";
                } else {
                    reply += "Vous n'avez jamais mangé de kebab.\n";
                }
                reply += "Ratio : 0 kebab par jour.";
                break;
            case 1:
                if (customuser) {
                    reply += `Cette personne a mangé un seul kebab, depuis le ${firstkebab.toLocaleDateString(
                        "fr-FR",
                        {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        }
                    )}.\n`;
                } else {
                    reply += `Vous avez mangé un seul kebab, depuis le ${firstkebab.toLocaleDateString(
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
                    )}.\n`;
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
                    )}.\n`;
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
