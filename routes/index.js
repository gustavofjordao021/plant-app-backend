const express = require("express");

const {
  Discord,
  Client,
  Intents,
  MessageEmbed,
  MessageButton,
  MessageActionRow,
} = require("discord.js");

const router = express.Router();

// Setup Discord client to listen to events
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
  if (msg.content === "!run") {
    const startButton = new MessageButton()
      .setCustomId("Run")
      .setLabel("Run 👨🏻‍💻")
      .setStyle("PRIMARY");

    const row = new MessageActionRow().addComponents(startButton);

    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Run Start!")
      .setURL("https://discord.js.org")
      .setDescription("Let's see if I can make this thing work LOL");

    await msg.reply({
      content: "!run",
      ephemeral: false,
      embeds: [embed],
      components: [row],
    });
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) {
    return;
  } else {
    const runButton = new MessageButton()
      .setCustomId("Run")
      .setLabel("Run 👨🏻‍💻")
      .setStyle("PRIMARY");

    const fleeButton = new MessageButton()
      .setCustomId("Flee")
      .setLabel("Flee 🏃🏻")
      .setStyle("DANGER");

    const row = new MessageActionRow().addComponents(runButton, fleeButton);

    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setImage("https://i.stack.imgur.com/rQm5c.png")
      .setTitle("Adonis ICE shows up!")
      .setDescription(
        "A sphix presents itself and watches your every movement. What do you do now?"
      );

    await interaction.reply({
      content: "Are you ready, runer?",
      ephemeral: false,
      embeds: [embed],
      components: [row],
    });
  }
  console.log(interaction.customId);
});

client.login(process.env.DISCORD_TOKEN);

module.exports = router;
