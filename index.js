const Discord = require("discord.js");
const fs = require("fs");
const date = require('dateformat')
const time = require('moment-timezone');
const moment = require("moment");
const {
    token,
    logchannel,
    prefix
} = require("./config.json")
const bot = new Discord.Client({
    disableEveryone: true
});

bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {

    if (err) console.log(err)

    let jsfile = files.filter(f => f.split(".").pop() === "js")
    if (jsfile.length <= 0) {
        return console.log("[LOGS] Couldn't Find Commands!");
    }

    jsfile.forEach((f, i) => {
        let props = require(`./commands/${f}`);
        console.log(`✅ ${f} is succesfully loaded.`);
        bot.commands.set(props.config.name, props);
        let pull = require(`./commands/${f}`);
        bot.commands.set(pull.config.name, pull);
        pull.config.aliases.forEach(alias => {
            bot.aliases.set(alias, pull.config.name)
        });
    });
});

fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        console.log(`✅ ${eventName} event is succesfully loaded.`);
        bot.on(eventName, event.bind(null, bot));
    });
});

bot.on("message", async (message) => {
    if (message.author.bot || message.channel.type === "dm") return;
    if (!message.guild) return;
    if (!message.channel.send) return;

    let messageArray = message.content.split(" ");
    let cmd = messageArray[0].toLowerCase();
    let args = messageArray.slice(1);
    if (!message.content.startsWith(prefix)) return;

    try {
        let commandfile = bot.commands.get(cmd.slice(prefix.length)) || bot.commands.get(bot.aliases.get(cmd.slice(prefix.length)));
        if (commandfile) commandfile.run(bot, message, args);
        if (!commandfile) return;
        console.log("[" + moment.tz("America/New_York").format('HH:mm A') + `\u001b[0m` + "]" + ` Server: ${message.guild.name} | Channel: #${message.channel.name} | ${message.author.tag} used ${cmd}`)

        let channel = message.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
        if (!channel) return;

        let botlogs = new Discord.MessageEmbed()
            .setTitle("Command Logs")
            .setColor("GREEN")
            .setDescription([
                `User: **${message.author.tag} (${message.author.id})**`,
                `Command: **${cmd}**`,
                `Server: **${message.guild.name} (${message.guild.id})**`,
                `Channel: **#${message.channel.name} (${message.channel.id})**`
            ])
            .setFooter(`Date: ${message.createdAt.toLocaleDateString()}`)
            .setTimestamp()
        channel.send(botlogs);
    } catch (err) {
        console.log(err)
        return message.channel.send(new Discord.MessageEmbed().setColor("RED").setDescription("**Something is going on, contact the owner of the bot!**"))
    }
});

bot.on("warn", async (info) => {
    console.log(`⚠️ Warning: ${info}`);
});

bot.on("reconnecting", (bot) => {
    console.log(`${bot.user.tag} tries to reconnect to the WebSocket`);
});

bot.on("resume", async (replayed) => {
    console.log(`A WebSocket Resumed, ${replayed} replays`);
});

bot.on("disconnect", async (event, bot) => {
    console.log(`${bot.user.tag} disconnect`);
});

bot.on('messageDelete', async message => {
    if (message.channel.type == 'text') {

        let channel = message.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
        if (!channel) return;

        let logses = await message.guild.fetchAuditLogs({
            type: 72
        });

        let entry = logses.entries.first();

        let messageDelete = new Discord.MessageEmbed()
            .setThumbnail(message.author.displayAvatarURL({
                dynamic: true,
                format: 'png',
                size: 512
            }))
            .setColor("RED")
            .setTitle("🗑️ Message Delete")
            .setDescription([
                `**Message Author: ${message.author}**`,
                `**Deleted By: ${entry.executor}**`,
                `**Channel: ${message.channel}**\n`,
                `**Message: ${message.cleanContent}**`,
            ])
        channel.send(messageDelete);
        console.log(`[MESSAGE DELETE] User: ${message.author.tag} (${message.author.id}) | Deleted By: ${entry.executor.tag} | Channel: #${message.channel.name} (${message.channel.id}) | Message: ${message.cleanContent}`);
    }
});

bot.on('messageUpdate', function (oldMessage, newMessage) {
    if (newMessage.author.bot) return;

    let channel = newMessage.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!channel) return;

    if (newMessage.channel.type == 'text' && newMessage.cleanContent != oldMessage.cleanContent) {

        const messageUpdate = new Discord.MessageEmbed()
            .setThumbnail(newMessage.author.displayAvatarURL({
                dynamic: true,
                format: 'png',
                size: 512
            }))
            .setColor("YELLOW")
            .setTitle("📝 Message Edit")
            .setDescription([
                `**User: ${newMessage.author}**`,
                `**Channel: ${newMessage.channel}**\n`,
                `**Before: ${oldMessage.cleanContent}**`,
                `**After: ${newMessage.cleanContent}**`,
            ])
        channel.send(messageUpdate);
    }
    console.log(`[MESSAGE EDIT] User: ${newMessage.author.tag} (${newMessage.author.id}) | Channel: ${newMessage.channel} (${newMessage.channel.id}) | Before: ${oldMessage.cleanContent} => ${newMessage.cleanContent}`);
});

bot.on('guildBanAdd', function (guild, user) {
    let channel = guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!channel) return;

    let guildBanAdd = new Discord.MessageEmbed()
        .setThumbnail(user.displayAvatarURL({
            dynamic: true,
            format: 'png',
            size: 512
        }))
        .setColor("BLUE")
        .setAuthor(`${user.tag}`, user.displayAvatarURL())
        .setDescription(`**👮🔒 ${user} was banned!**`)
        .setTimestamp();
    channel.send(guildBanAdd)
    console.log(`[BAN] User: ${user.tag} (${user.id}) | Server: ${guild.name} (${guild.id})`);
});


bot.on('guildBanRemove', async (guild, user) => {
    let channel = guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!channel) return;

    let guildBanRemove = new Discord.MessageEmbed()
        .setThumbnail(user.displayAvatarURL({
            dynamic: true,
            format: 'png',
            size: 512
        }))
        .setColor("BLUE")
        .setAuthor(`${user.tag}`, user.displayAvatarURL())
        .setDescription(`**👮🔓 ${user} was unbanned!**`)
        .setTimestamp();
    channel.send(guildBanRemove)
    console.log(`[UNBAN] User: ${user.tag} (${user.id}) | Server: ${guild.name} (${guild.id})`);
});

bot.on('guildCreate', async guild => {
    let channel = guild.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!channel) return;

    let logs = new Discord.MessageEmbed()
        .setColor("GREEN")
        .setTitle("🤖 Bot has been Invited!")
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
        .setTitle("🤖 Bot has been Removed!")
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
    if (channel.type === 'dm') return;
    let logging = channel.guild.channels.cache.find(ch => ch.channelid === `${logchannel}`);
    if (!logging) return;

    let types = {
        text: 'Text Channel',
        voice: 'Voice Channel',
        category: "Category Channel",
        null: 'None',
    };

    let channelCreate = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setTitle("✏️ Channel Created")
        .setDescription([
            `**Name: ${channel.name} (${channel.id}) | ${channel}**`,
            `**Created At: ${channel.createdAt.toLocaleString()}**`,
            `**Type: ${types[channel.type]}**`,
        ])
        .setTimestamp()
    logging.send(channelCreate)

    console.log(`[CHANNEL CREATED] Channel: #${channel.name} (${channel.id}) | Created At: ${channel.createdAt.toLocaleString()} | Type: ${channel.type}`);
})

bot.on('channelDelete', async (channel) => {
    let logging = channel.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    let types = {
        text: 'Text Channel',
        voice: 'Voice Channel',
        category: "Category Channel",
        null: 'None',
    };

    let channelDelete = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("🗑️ Channel Deleted")
        .setDescription([
            `**Name: ${channel.name} (${channel.id})**`,
            `**Type: ${types[channel.type]}**`,
        ])
        .setTimestamp()
    logging.send(channelDelete)

    console.log(`[CHANNEL DELETE] Channel: #${channel.name} (${channel.id}) | Type: ${channel.type}`);
})


bot.on("channelPinsUpdate", function (channel, time) {
    if (channel.type === 'dm') return;
    let logging = channel.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    let channelPinsUpdate = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("📌 Channel Pin")
        .setDescription([
            `**Channel: ${channel} (${channel.id})**`,
            `**Time: ${time.toLocaleString()}**`,
        ])
    logging.send(channelPinsUpdate)

    console.log(`[MESSAGE PIN] Channel: #${channel.name} (${channel.id}) | Time: ${time.toLocaleString()}`);
});

bot.on("roleCreate", async (role) => {
    let logging = role.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    const perms = role.permissions.toArray().map(e => {
        const words = e.split("_").map(x => x[0] + x.slice(1).toLowerCase());
        return words.join(" ");
    }).join(", ");

    let roleCreate = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setTitle("✏️ Role Created")
        .setDescription([
            `**Role: ${role} (${role.id})**`,
            `**Created At: ${role.createdAt.toLocaleString()}**`
            `**Permission:** \n ${perms}`
        ])
    logging.send(roleCreate)
    console.log(`[ROLE CREATED] Role: ${role} (${role.id}) | Created At: ${role.createdAt.toLocaleString()} | Permission: ${perms}`);
});

bot.on("roleDelete", async (role) => {
    let logging = role.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    const perms = role.permissions.toArray().map(e => {
        const words = e.split("_").map(x => x[0] + x.slice(1).toLowerCase());
        return words.join(" ");
    }).join(", ");

    let roleDelete = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("🗑️ Role Delete")
        .setDescription([
            `**Role: ${role.name} (${role.id})**`,
            `**Created At: ${role.createdAt.toLocaleString()}**`,
            `**Hex Color: ${role.hexColor}**`,
            `**Permission:** \n ${perms}`
        ])
    logging.send(roleDelete)
    console.log(`[ROLE DELETE] Role: ${role} (${role.id}) | Permission: ${perms}`);
});

bot.on("emojiCreate", async (emoji) => {
    let logging = emoji.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    let animated = {
        "false": "No",
        "true": "Yes",
    }

    let emojiCreate = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setTitle("✏️ Emoji Created")
        .setDescription([
            `**Name: ${emoji.name} (${emoji.id})**`,
            `**Emoji: ${emoji}**`,
            `**Image: [URL](${`${emoji.url}`})**`,
            `**Animated: ${animated[emoji.animated]}**`
        ])
        .setThumbnail(emoji.url)
    logging.send(emojiCreate)
    console.log(`[EMOJI CREATED] Name: ${emoji.name} | ID: ${emoji.id} | Animated: ${animated[emoji.animated]} | URL: ${emoji.url}`);
});

bot.on("emojiUpdate", async (oldEmoji, newEmoji) => {
    let logging = newEmoji.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    let animated = {
        "false": "No",
        "true": "Yes",
    }

    let emojiUpdate = new Discord.MessageEmbed()
        .setColor("YELLOW")
        .setTitle("📝 Emoji Updated")
        .setDescription([
            `**Old Name: ${oldEmoji.name}**`,
            `**New Name: ${newEmoji.name}**`,
            `**ID: ${newEmoji.id}**`,
            `**Emoji: ${newEmoji}**`,
            `**Image: [URL](${`${newEmoji.url}`})**`,
            `**Animated: ${animated[newEmoji.animated]}**`
        ])
        .setThumbnail(newEmoji.url)
    logging.send(emojiUpdate)
    console.log(`[EMOJI UPDATED] Old Name: ${oldEmoji.name} | New Name: ${newEmoji.name} | ID: ${newEmoji.id} | Animated: ${animated[newEmoji.animated]} | URL: ${newEmoji.url}`);
});

bot.on("emojiDelete", async (emoji) => {
    let logging = emoji.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    let animated = {
        "false": "No",
        "true": "Yes",
    }

    let emojiDelete = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("🗑️ Emoji Deleted")
        .setDescription([
            `**Name: ${emoji.name}**`,
            `**ID: ${emoji.id}**`,
            `**Image: [URL](${`${emoji.url}`})**`,
            `**Animated: ${animated[emoji.animated]}**`
        ])
        .setThumbnail(emoji.url)
    logging.send(emojiDelete)
    console.log(`[EMOJI DELETED] Name: ${emoji.name} | Animated: ${animated[emoji.animated]} | URL: ${emoji.url}`);
});


bot.on("guildMemberAdd", async (member) => {
    let logging = member.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    let guildMemberAdd = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setTitle("Member Joined")
        .setThumbnail(member.user.displayAvatarURL({
            dynamic: true,
            format: 'png',
            size: 512
        }))
        .setDescription([
            `**Name: ${member.user.tag}**`,
            `**ID: ${member.user.id}**`,
            `**Account Created: ${date(member.user.createdAt, "dd/mm/yyyy - HH:MM:ss")}**`,
            `**Mention: ${member}**`
        ])
        .setTimestamp()
    logging.send(guildMemberAdd)
    console.log(`[MEMBER JOINED] Name: ${member.user.tag} (${member.user.id}) | Account Created: ${date(member.user.createdAt, "dd/mm/yyyy - HH:MM:ss")}`);
});

bot.on("guildMemberRemove", async (member) => {
    let logging = member.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    let guildMemberRemove = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("Member Left")
        .setThumbnail(member.user.displayAvatarURL({
            dynamic: true,
            format: 'png',
            size: 512
        }))
        .setDescription([
            `**Name: ${member.user.tag}**`,
            `**ID: ${member.user.id}**`,
            `**Account Created: ${date(member.user.createdAt, "dd/mm/yyyy - HH:MM:ss")}**`,
            `**Mention: ${member}**`
        ])
        .setTimestamp();
    logging.send(guildMemberRemove)
    console.log(`[MEMBER LEFT] Name: ${member.user.tag} (${member.user.id}) | Account Created: ${date(member.user.createdAt, "dd/mm/yyyy - HH:MM:ss")}`);
});

bot.on("channelUpdate", async (oldChannel, newChannel) => {
    let oldCategory = oldChannel.parent;
    let newCategory = newChannel.parent;
    let guildsChannel = newChannel.guild;
    if (!newCategory) newCategory = 'None';
    if (!guildsChannel || !guildsChannel.available) return;

    let types = {
        text: 'Text Channel',
        voice: 'Voice Channel',
        category: "Category Channel",
        null: 'None',
    };

    let logChannel = oldChannel.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logChannel) return;
    if (!logChannel.permissionsFor(oldChannel.guild.me).has('VIEW_CHANNEL')) return;
    if (!logChannel.permissionsFor(oldChannel.guild.me).has('SEND_MESSAGES')) return;

    if (oldChannel.name !== newChannel.name) {
        let channelUpdate = new Discord.MessageEmbed()
            .setColor('YELLOW')
            .setTitle(`📝 Channel Name Updated`)
            .setDescription([
                `**Old Channel Name: ${oldChannel.name}**`,
                `**New Channel Name: ${newChannel.name}**`,
                `**Channel ID: ${newChannel.id}**`,
                `**Channel Type: ${types[newChannel.type]}**`,
                `**Channel Category: ${newCategory}**`
            ])
            .setTimestamp();

        logChannel.send(channelUpdate).catch();
        console.log(`[CHANNEL UPDATED] Old Channel Name: ${oldChannel.name} => ${newChannel.name} | Channel ID: ${newChannel.id} | Channel Type: ${types[newChannel.type]} | Channel Category: ${newCategory}`);
    }
});

bot.on("messageReactionRemoveAll", async (message) => {
    if (message.channel.type === 'dm') return;
    let logChannel = message.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logChannel) return;
    let messageReactionRemoveAll = new Discord.MessageEmbed()
        .setColor('RED')
        .setTitle(`🗑️ Remove All Reactions`)
        .setDescription([
            `**Channel: ${message.channel} (${message.channel.id})**`,
            `**Message: ${message}**`,
        ])
        .setTimestamp();

    logChannel.send(messageReactionRemoveAll).catch();
    console.log(`[REMOVED ALL REACTIONS] Channel: ${message.channel} (${message.channel.id}) | Message: ${message}`);
    logChannel.send(`${message} | ${message.reactions}`)
});

bot.login(token)