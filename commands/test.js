const Discord = require("discord.js");
const bot = new Discord.Client({
    disableEveryone: true
});

module.exports.run = async (bot, message, args) => {
    message.reply("**__I am alive. 🤖__**")
};

module.exports.config = {
    name: "test",
    aliases: [],
    description: ''
}