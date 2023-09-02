const { SlashCommandBuilder } = require("discord.js");
const mongoose = require("mongoose");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kebab")
        .setDescription("Vous avez dégusté un kebab."),
    async execute(interaction) {
        const Kebab = mongoose.model("Kebab");
        const kebab = new Kebab({
            user: interaction.user.id,
            date: Date.now(),
        });
        await kebab.save();
        await interaction.reply("Vous avez dégusté un kebab.");
    },
};
