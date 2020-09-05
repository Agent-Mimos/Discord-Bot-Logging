const Discord = require("discord.js");
const {
    token,
} = require("./config.json");
const fs = require("fs");
const bot = new Discord.Client({
    disableEveryone: true
});

const logchannel = "746065467227242597";

fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        console.log(`Loading ${eventName} event.`);
        bot.on(eventName, event.bind(null, bot));
    });
});

bot.on('messageDelete', async message => {
    if (message.channel.type == 'text') {

        let channel = message.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
        if (!channel) return;

        let logses = await message.guild.fetchAuditLogs({
            type: 72
        });

        let entry = logses.entries.first();

        let deletemessage = new Discord.MessageEmbed()
            .setTitle("Message Delete")
            .setDescription([
                `**Message Author:** ${message.author}`,
                `**Deleted By:** ${entry.executor}`,
                `**Channel:** ${message.channel}\n`,
                `**Message:** ${message.cleanContent}`,
            ])
        channel.send(deletemessage);
    }
});


bot.on('messageUpdate', function (oldMessage, newMessage) {
    if (newMessage.author.bot) return;

    let channel = newMessage.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!channel) return;

    if (newMessage.channel.type == 'text' && newMessage.cleanContent != oldMessage.cleanContent) {

        const editmessage = new Discord.MessageEmbed()
            .setTitle("Message Edit")
            .setDescription([
                `**User:** ${newMessage.author}`,
                `**Channel:** ${newMessage.channel}\n`,
                `**Before:** ${oldMessage.cleanContent}\n`,
                `**After:** ${newMessage.cleanContent}\n`,
            ])
        channel.send(editmessage);
    }
});

bot.on('guildBanAdd', function (guild, user) {
    let channel = guild.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!channel) return;

    let ban = new Discord.MessageEmbed()
        .setThumbnail(user.displayAvatarURL({
            dynamic: true,
            format: 'png',
            size: 512
        }))
        .setColor("BLUE")
        .setAuthor(`${user.tag}`, user.displayAvatarURL())
        .setDescription(`**👮🔒 ${user} was banned!**`)
        .setTimestamp();
    channel.send(ban)
});


bot.on('guildBanRemove', async (guild, user) => {
    let channel = guild.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!channel) return;

    let unban = new Discord.MessageEmbed()
        .setThumbnail(user.displayAvatarURL({
            dynamic: true,
            format: 'png',
            size: 512
        }))
        .setColor("BLUE")
        .setAuthor(`${user.tag}`, user.displayAvatarURL())
        .setDescription(`**👮🔓 ${user} was unbanned!**`)
        .setTimestamp();
    channel.send(unban)
});

bot.on('guildCreate', async guild => {
    let channel = guild.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!channel) return;

    let logs = new Discord.MessageEmbed()
        .setColor("GREEN")
        .setTitle("Bot has been Invited!")
        .setThumbnail(guild.iconURL({
            dynamic: true,
            format: 'png',
            size: 512
        }))
        .setDescription([
            `**Owner: __${guild.owner.user.tag} (${guild.owner.user.id})__**`,
            `**Server: __${guild.name} (${guild.id})__**`
        ])
        .setTimestamp()
    channel.send(logs)
    console.log(`Someone Just Invited your bot to ${guild.name}.`);
});

bot.on('guildDelete', async (guild) => {
    let channel = guild.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!channel) return;

    let logs = new Discord.MessageEmbed()
        .setColor("GREEN")
        .setTitle("Bot has been Removed!")
        .setThumbnail(guild.iconURL({
            dynamic: true,
            format: 'png',
            size: 512
        }))
        .setDescription([
            `**Owner: __${guild.owner.user.tag} (${guild.owner.user.id})__**`,
            `**Server: __${guild.name} (${guild.id})__**`,
        ])
        .setTimestamp()
    channel.send(logs)
    console.log(`Someone Just Invited your bot to ${guild.name}.`);
});


bot.on('channelCreate', async (channel) => {
    let logging = channel.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    let createchannel = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setTitle("Channel Created")
        .setDescription([
            `**Name: ${channel} (${channel.id})**`,
            `**Created At: ${channel.createdAt.toLocaleString()}**`,
            `**Type: ${channel.type}**`,
        ])
        .setTimestamp()
    logging.send(createchannel)
})

bot.on('channelDelete', async (channel) => {
    let logging = channel.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    let createchannel = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("🗑️ Channel Deleted")
        .setDescription([
            `**Name: ${channel.name} (${channel.id})**`,
            `**Created At: ${channel.createdAt.toLocaleString()}**`,
            `**Type: ${channel.type}**`,
        ])
        .setTimestamp()
    logging.send(createchannel)
})

bot.login(token)