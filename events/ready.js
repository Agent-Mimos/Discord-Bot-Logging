const Discord = require("discord.js");
const bot = new Discord.Client({
    disableEveryone: true
});

module.exports = async (bot) => {
    console.log(`${bot.user.tag} is up and running. | ${bot.guilds.cache.size.toLocaleString()} servers | ${bot.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} users`);

    bot.user.setPresence({
            activity: {
                name: `The Developer Agent Mimos#0001 ✨`,
                type: 'WATCHING',
            },
            status: 'dnd'
        })
        .catch(console.error);
};