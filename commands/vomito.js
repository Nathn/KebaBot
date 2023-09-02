const { SlashCommandBuilder } = require("discord.js");
const mongoose = require("mongoose");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("vomito")
        .setDescription("Vommissez un kebab."),
    async execute(interaction) {
        const Kebab = mongoose.model("Kebab");
        const kebab = await Kebab.findOne({ user: interaction.user.id }).sort({
            date: -1,
        });
        if (!kebab) {
            await interaction.reply("Vous n'avez jamais mangé de kebab.");
            return;
        }
        await kebab.delete();
        await interaction.reply("Vous avez vomi un kebab.");
    },
};
