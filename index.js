const Discord = require("discord.js");
const fs = require("fs");
const time = require('moment-timezone');
const moment = require("moment");
const bot = new Discord.Client({
    disableEveryone: true
});

const token = ""; // Put your bot's token here.
const logchannel = ""; // Channel That The Logs will be sent to.

fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        console.log(`✅ ${eventName} event is succesfully loaded.`);
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
            .setThumbnail(message.author.displayAvatarURL({
                dynamic: true,
                format: 'png',
                size: 512
            }))
            .setColor("RED")
            .setTitle("🗑️ Message Delete")
            .setDescription([
                `**Message Author:** ${message.author}`,
                `**Deleted By:** ${entry.executor}`,
                `**Channel:** ${message.channel}\n`,
                `**Message:** ${message.cleanContent}`,
            ])
        channel.send(deletemessage);
        console.log(`[MESSAGE DELETE] User: ${message.author.tag} (${message.author.id}) | Deleted By: ${entry.executor.tag} | Channel: ${message.channel} (${message.channel.id}) | Message: ${message.cleanContent}`);
    }
});

bot.on('messageUpdate', function (oldMessage, newMessage) {
    if (newMessage.author.bot) return;

    let channel = newMessage.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!channel) return;

    if (newMessage.channel.type == 'text' && newMessage.cleanContent != oldMessage.cleanContent) {

        const editmessage = new Discord.MessageEmbed()
            .setThumbnail(newMessage.author.displayAvatarURL({
                dynamic: true,
                format: 'png',
                size: 512
            }))
            .setColor("YELLOW")
            .setTitle("📝 Message Edit")
            .setDescription([
                `**User:** ${newMessage.author}`,
                `**Channel:** ${newMessage.channel}\n`,
                `**Before:** ${oldMessage.cleanContent}`,
                `**After:** ${newMessage.cleanContent}`,
            ])
        channel.send(editmessage);
    }
    console.log(`[MESSAGE EDIT] User: ${newMessage.author.tag} (${newMessage.author.id}) | Channel: ${newMessage.channel} (${newMessage.channel.id}) | Before: ${oldMessage.cleanContent} => ${newMessage.cleanContent}`);
});

bot.on('guildBanAdd', function (guild, user) {
    let channel = guild.channels.cache.find(ch => ch.id === `${logchannel}`);
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
    console.log(`[BAN] User: ${user.tag} (${user.id}) | Server: ${guild.name} (${guild.id})`);
});


bot.on('guildBanRemove', async (guild, user) => {
    let channel = guild.channels.cache.find(ch => ch.id === `${logchannel}`);
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
    console.log(`[UNBAN] User: ${user.tag} (${user.id}) | Server: ${guild.name} (${guild.id})`);
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
            `**Name: ${channel.name} (${channel.id}) | ${channel}**`,
            `**Created At: ${channel.createdAt.toLocaleString()}**`,
            `**Type: ${channel.type}**`,
        ])
        .setTimestamp()
    logging.send(createchannel)

    console.log(`[CHANNEL CREATED] Channel: #${channel.name} (${channel.id}) | Created At: ${channel.createdAt.toLocaleString()} | Type: ${channel.type}`);
})

bot.on('channelDelete', async (channel, time) => {
    let logging = channel.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    let createdelete = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("🗑️ Channel Deleted")
        .setDescription([
            `**Name: ${channel.name} (${channel.id})**`,
            `**Type: ${channel.type}**`,
        ])
        .setTimestamp()
    logging.send(createdelete)

    console.log(`[CHANNEL DELETE] Channel: #${channel.name} (${channel.id}) | Created At: ${channel.createdAt.toLocaleString()} | Type: ${channel.type}`);
})


bot.on("channelPinsUpdate", function (channel, time) {
    let logging = channel.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    let createdelete = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("📌 Channel Pin")
        .setDescription([
            `**Channel: ${channel} (${channel.id})**`,
            `**Time: ${time.toLocaleString()}**`,
        ])
    logging.send(createdelete)

    console.log(`[MESSAGE PIN] Channel: #${channel.name} (${channel.id}) | Time: ${time.toLocaleString()}`);
});

bot.login(token)