const Discord = require("discord.js");
const fs = require("fs");
const date = require('dateformat')
const bot = new Discord.Client({
    disableEveryone: true
});

const token = "Njg3Njg4ODg1ODMyMzg0NTE3.XmpaLw.txKBqr1YQg_aYePp77c_9B_lqDE"; // Put your bot's token here.
const logchannel = "746065467227242597"; // Channel That The Logs will be sent to.

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
                `**Message Author: ${message.author}**`,
                `**Deleted By: ${entry.executor}**`,
                `**Channel: ${message.channel}**\n`,
                `**Message: ${message.cleanContent}**`,
            ])
        channel.send(deletemessage);
        console.log(`[MESSAGE DELETE] User: ${message.author.tag} (${message.author.id}) | Deleted By: ${entry.executor.tag} | Channel: #${message.channel.name} (${message.channel.id}) | Message: ${message.cleanContent}`);
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
                `**User: ${newMessage.author}**`,
                `**Channel: ${newMessage.channel}**\n`,
                `**Before: ${oldMessage.cleanContent}**`,
                `**After: ${newMessage.cleanContent}**`,
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
    let logging = channel.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    let types = {
        text: 'Text Channel',
        voice: 'Voice Channel',
        category: "Category Channel",
        null: 'None',
    };

    let createchannel = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setTitle("✏️ Channel Created")
        .setDescription([
            `**Name: ${channel.name} (${channel.id}) | ${channel}**`,
            `**Created At: ${channel.createdAt.toLocaleString()}**`,
            `**Type: ${types[channel.type]}**`,
        ])
        .setTimestamp()
    logging.send(createchannel)

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

    let createdelete = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("🗑️ Channel Deleted")
        .setDescription([
            `**Name: ${channel.name} (${channel.id})**`,
            `**Type: ${types[channel.type]}**`,
        ])
        .setTimestamp()
    logging.send(createdelete)

    console.log(`[CHANNEL DELETE] Channel: #${channel.name} (${channel.id}) | Type: ${channel.type}`);
})


bot.on("channelPinsUpdate", function (channel, time) {
    let logging = channel.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    let pin = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("📌 Channel Pin")
        .setDescription([
            `**Channel: ${channel} (${channel.id})**`,
            `**Time: ${time.toLocaleString()}**`,
        ])
    logging.send(pin)

    console.log(`[MESSAGE PIN] Channel: #${channel.name} (${channel.id}) | Time: ${time.toLocaleString()}`);
});

bot.on("roleCreate", async (role) => {
    let logging = role.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    const perms = role.permissions.toArray().map(e => {
        const words = e.split("_").map(x => x[0] + x.slice(1).toLowerCase());
        return words.join(" ");
    }).join(", ");

    let rolecreate = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setTitle("✏️ Role Created")
        .setDescription([
            `**Role: ${role} (${role.id})**`,
            `**Created At: ${role.createdAt.toLocaleString()}**`
            `**Permission:** \n ${perms}`
        ])
    logging.send(rolecreate)
    console.log(`[ROLE CREATED] Role: ${role} (${role.id}) | Created At: ${role.createdAt.toLocaleString()} | Permission: ${perms}`);
});

bot.on("roleDelete", async (role) => {
    let logging = role.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    const perms = role.permissions.toArray().map(e => {
        const words = e.split("_").map(x => x[0] + x.slice(1).toLowerCase());
        return words.join(" ");
    }).join(", ");

    let roledelete = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("🗑️ Role Delete")
        .setDescription([
            `**Role: ${role.name} (${role.id})**`,
            `**Created At: ${role.createdAt.toLocaleString()}**`,
            `**Hex Color: ${role.hexColor}**`,
            `**Permission:** \n ${perms}`
        ])
    logging.send(roledelete)
    console.log(`[ROLE DELETE] Role: ${role} (${role.id}) | Permission: ${perms}`);
});

bot.on("emojiCreate", async (emoji) => {
    let logging = emoji.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    let animated = {
        "false": "No",
        "true": "Yes",
    }

    let rolecreate = new Discord.MessageEmbed()
        .setColor("BLUE")
        .setTitle("✏️ Emoji Created")
        .setDescription([
            `**Name: ${emoji.name} (${emoji.id})**`,
            `**Emoji: ${emoji}**`,
            `**Image: [URL](${`${emoji.url}`})**`,
            `**Animated: ${animated[emoji.animated]}**`
        ])
        .setThumbnail(emoji.url)
    logging.send(rolecreate)
    console.log(`[EMOJI CREATED] Name: ${emoji.name} | ID: ${emoji.id} | Animated: ${animated[emoji.animated]} | URL: ${emoji.url}`);
});

bot.on("emojiUpdate", async (oldEmoji, newEmoji) => {
    let logging = newEmoji.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    let animated = {
        "false": "No",
        "true": "Yes",
    }

    let rolecreate = new Discord.MessageEmbed()
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
    logging.send(rolecreate)
    console.log(`[EMOJI UPDATED] Old Name: ${oldEmoji.name} | New Name: ${newEmoji.name} | ID: ${newEmoji.id} | Animated: ${animated[newEmoji.animated]} | URL: ${newEmoji.url}`);
});

bot.on("emojiDelete", async (emoji) => {
    let logging = emoji.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    let animated = {
        "false": "No",
        "true": "Yes",
    }

    let rolecreate = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("🗑️ Emoji Deleted")
        .setDescription([
            `**Name: ${emoji.name}**`,
            `**ID: ${emoji.id}**`,
            `**Image: [URL](${`${emoji.url}`})**`,
            `**Animated: ${animated[emoji.animated]}**`
        ])
        .setThumbnail(emoji.url)
    logging.send(rolecreate)
    console.log(`[EMOJI DELETED] Name: ${emoji.name} | Animated: ${animated[emoji.animated]} | URL: ${emoji.url}`);
});


bot.on("guildMemberAdd", async (member) => {
    let logging = member.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    let welcome = new Discord.MessageEmbed()
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
    logging.send(welcome)
    console.log(`[MEMBER JOINED] Name: ${member.user.tag} (${member.user.id}) | Account Created: ${date(member.user.createdAt, "dd/mm/yyyy - HH:MM:ss")}`);
});

bot.on("guildMemberRemove", async (member) => {
    let logging = member.guild.channels.cache.find(ch => ch.id === `${logchannel}`);
    if (!logging) return;

    let welcome = new Discord.MessageEmbed()
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
    logging.send(welcome)
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
        let channelNameUpdateEmbed = new Discord.MessageEmbed()
            .setColor('YELLOW')
            .setTitle(`📝 Channel Name Updated`)
            .setDescription([
                `**Old Channel Name: ${oldChannel.name}**`,
                `**New Channel Name: ${newChannel.name}**`,
                `**Channel Type: ${types[newChannel.type]}**`,
                `**Channel Category: ${newCategory}**`,
                `**Channel ID: ${newChannel.id}**`,
            ])
            .setTimestamp();

        logChannel.send(channelNameUpdateEmbed).catch();
    }
});


bot.login(token)