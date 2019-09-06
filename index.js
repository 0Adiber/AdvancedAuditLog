const Discord = require('discord.js');
const fs = require('fs');
const bot = new Discord.Client();

const config = require('./config.json');

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`);

//check if log directory exists
    if(!fs.existsSync('logs')) {
        fs.mkdirSync('logs');
    }

//server logging
    if(config.serverLogging.enabled) {
        bot.guilds.forEach(g => {
            new serverListener(g, config.serverLogging.options);
        });
    }

//user logging

});

bot.login(config.token);

class serverListener {

    getFunc(name) {
        let funcs = {
            channelCreate: (channel) => {
                let gc = this.server.channels.find(c => c.id === channel.id);
                let topic = "isVoiceChannel";

                if(channel.type == "text") {
                    topic = this.server.channels.find(c => c.id === channel.id).topic;
                }

                let c = {
                    "id": channel.id,
                    "name": gc.name,
                    "type": channel.type,
                    "topic": topic,
                    "created-at": channel.createdAt,
                    "parent-id": gc.parentID,
                    "parent-name": gc.parent.name,
                    "message": "Channel was created."
                }
                this.logger("channelCreate", c);
            },
            channelDelete: (channel) => {
                let c = {
                    "id": channel.id,
                    "type": channel.type,
                    "created-at": channel.createdAt,
                    "message": "Channel was deleted."
                }
                this.logger("channelDelete", c);
            },
            channelUpdate: (oldC, newC) => {
                let goc = this.server.channels.find(c => c.id === oldC.id);
                let gnc = this.server.channels.find(c => c.id === newC.id);

                let topic = "isVoiceChannel";

                if(newC.type == "text") {
                    topic = this.server.channels.find(c => c.id === newC.id).topic;
                }

                let c = {
                    "old-id": oldC.id,
                    "old-name": goc.name,
                    "new-id": newC.id,
                    "new-name": gnc.name,
                    "type": newC.type,
                    "topic": topic,
                    "created-at": gnc.createdAt,
                    "parent-id": gnc.parentID,
                    "parent-name": gnc.parent.name,
                    "message": "Channel was updated."
                }
                this.logger("channelUpdate", c);
            },
            debug: (info) => {
                this.logger("debug", {info});
            },
            emojiCreate: (emoji) => {
                emoji.fetchAuthor().then((u) => {

                    let e = {
                        "id": emoji.id,
                        "name": emoji.name,
                        "author": u.username,
                        "animated": emoji.animated,
                        "url": emoji.url,
                        "identifier": emoji.identifier,
                        "created-at": emoji.createdAt,
                        "roles-active-for": emoji.roles.array(),
                        "message": "Emoji was created."
                    }
                    this.logger("emojiCreate", e);

                }).catch(err => console.log(err));
            },
            emojiDelete: (emoji) => {
                let e = {
                    "id": emoji.id,
                    "name": emoji.name,
                    "animated": emoji.animated,
                    "url": emoji.url,
                    "identifier": emoji.identifier,
                    "created-at": emoji.createdAt,
                    "roles-active-for": emoji.roles.array(),
                    "message": "Emoji was deleted."
                }
                this.logger("emojiDelete", e);
            },
            emojiUpdate: (oldE, newE) => {
                newE.fetchAuthor().then((u) => {

                    let e = {
                        "old-id": oldE.id,
                        "new-id": newE.id,
                        "old-name": oldE.name,
                        "new-name": newE.name,
                        "author": u.tag,
                        "old-animated": oldE.animated,
                        "new-animated": newE.animated,
                        "old-url": oldE.url,
                        "new-url": newE.url,
                        "old-identifier": oldE.identifier,
                        "new-identifier": newE.identifier,
                        "created-at": newE.createdAt,
                        "old-roles-active-for": oldE.roles.array(),
                        "new-roles-active-for": newE.roles.array(),
                        "message": "Emoji was updated."
                    }
                    this.logger("emojiUpdate", e);

                }).catch(err => console.log(err));
            },
            guildBanAdd: (guild, user) => {
                guild.fetchBan(user).then((ban) => {

                    let b = {
                        "server-id": guild.id,
                        "server-name": guild.name,
                        "user-id": user.id,
                        "user-tag": user.tag,
                        "reason": ban["reason"],
                        "message": "User was banned"
                    }
                    this.logger("guildBanAdd", b);

                }).catch(err => console.log(err));
            },
            guildBanRemove: (guild, user) => {
                let b = {
                    "server-id": guild.id,
                    "server-name": guild.name,
                    "user-id": user.id,
                    "user-name": user.tag,
                    "message": "User was unbanned."
                }
                this.logger("guildBanRemove", b);
            },
            guildMemberAdd: (member) => {
                let m = {
                    "id": member.id,
                    "user-tag": member.user.tag,
                    "joined-at": member.joinedAt,
                    "message": "User joined the server."
                }
                this.logger("guildMemberAdd", m);
            },
            guildMemberRemove: (member) => {
                let m = {
                    "id": member.id,
                    "user-tag": member.user.tag,
                    "joined-at": member.joinedAt,
                    "message": "User left the server, or was kicked."
                }
                this.logger("guildMemberAdd", m);
            },
            guildMemberUpdate: (oldM, newM) => {
                let message;
                let role;
                let action;

                if(oldM.nickname != newM.nickname) {
                    action = "nameChanged";
                    message = "User's nickname changed from " + (oldM.nickname==null?oldM.user.username:oldM.nickname) + " to " + (newM.nickname==null?newM.user.username:newM.nickname);
                }

                let arrOld = Array.from(oldM.roles.values());
                let arrNew = Array.from(newM.roles.values());

                if(JSON.stringify(arrOld) != JSON.stringify(arrNew)) {
                    if(arrOld.length < arrNew.length) {
                        //role added
                        action = "roleAdded";

                        for(let i = 0; i<arrNew.length; i++) {
                            if(!arrOld.includes(arrNew[i])) {
                                role = arrNew[i];
                            }
                        }

                        message = "User new role " + role.name;
                    } else {
                        //role removed
                        action = "roleRemoved";

                        for(let i = 0; i<arrOld.length; i++) {
                            if(!arrNew.includes(arrOld[i])) {
                                role = arrOld[i];
                            }
                        }

                        message = "User removed role " + role.name;
                    }
                }
                if(action === undefined) {
                    return;
                }
                let m = {
                    "id": newM.id,
                    "user-tag": newM.user.tag,
                    "action": action,
                    "old-nickname": oldM.nickname,
                    "new-nickname": newM.nickname,
                    "role-id": role.id,
                    "role-name": role.name,
                    "message": message
                }
                this.logger("guildMemberUpdate", m);
            },
            guildUpdate: (oldG, newG) => {
                if(oldG.name == newG.name) {
                    return;
                }
                let g = {
                    "id": newG.id,
                    "old-name": oldG.name,
                    "new-name": newG.name,
                    "message": "The Server changed it's name."
                }
                this.logger("guildUpdate", g);
            },
            message: (msg) => {

                let attachments = []

                msg.attachments.forEach((v, k, map) => {
                    attachments.push({
                        "filename": v.filename,
                        "filesize": v.filesize,
                        "id": v.id,
                        "url": v.url
                    });
                });

                let m = {
                    "id": msg.id,
                    "author-id": msg.author.id,
                    "author-tag": msg.author.tag,
                    "channel-id": msg.channel.id,
                    "channel-name": msg.channel.name,
                    "content": msg.cleanContent,
                    "send-by-system": msg.system,
                    "tts": msg.tts,
                    "type": msg.type,
                    "url": msg.url,
                    "attachments": attachments,
                    "created-at": msg.createdAt,
                    "message": "A message was sent."
                }
                this.logger("message", m);
            },
            messageDelete: (msg) => {
                let attachments = []

                msg.attachments.forEach((v, k, map) => {
                    attachments.push({
                        "filename": v.filename,
                        "filesize": v.filesize,
                        "id": v.id,
                        "url": v.url
                    });
                });

                let m = {
                    "id": msg.id,
                    "author-id": msg.author.id,
                    "author-tag": msg.author.tag,
                    "channel-id": msg.channel.id,
                    "channel-name": msg.channel.name,
                    "content": msg.cleanContent,
                    "send-by-system": msg.system,
                    "tts": msg.tts,
                    "type": msg.type,
                    "url": msg.url,
                    "attachments": attachments,
                    "deleted": msg.deleted,
                    "created-at": msg.createdAt,
                    "message": "A message was deleted."
                }
                this.logger("messageDelete", m)
            },
            messageDeleteBulk: (msgs) => {
                let ms = {}
                let counter = 0;
                for(let msg in msgs.toArray()) {
                    let attachments = []

                    msg.attachments.forEach((v, k, map) => {
                        attachments.push({
                            "filename": v.filename,
                            "filesize": v.filesize,
                            "id": v.id,
                            "url": v.url
                        });
                    });

                    let m = {
                        "id": msg.id,
                        "author-id": msg.author.id,
                        "author-tag": msg.author.tag,
                        "channel-id": msg.channel.id,
                        "channel-name": msg.channel.name,
                        "content": msg.cleanContent,
                        "send-by-system": msg.system,
                        "tts": msg.tts,
                        "type": msg.type,
                        "url": msg.url,
                        "attachments": attachments,
                        "deleted": msg.deleted,
                        "created-at": msg.createdAt,
                        "message": "A message was deleted."
                    }
                    ms[counter++] = m;
                }
                ms[counter++] = {"message": "A bulk of message was deleted."};
                this.logger("messageDeleteBulk", ms)
            },
            messageReactionAdd: (msgR, user) => {
                let r = {
                    "msg-id": msgR.message.id,
                    "msg-author": msgR.message.author.tag,
                    "emoji-id": msgR.emoji.id,
                    "emoji-identifier": msgR.emoji.identifier,
                    "emoji-name": msgR.emoji.name,
                    "user-id": user.id,
                    "user-tag": user.tag,
                    "message": "A reaction was added to a message."
                }
                this.logger("messageReactionAdd", r);
            },
            messageReactionRemove: (msgR, user) => {
                let r = {
                    "msg-id": msgR.message.id,
                    "msg-author": msgR.message.author.tag,
                    "emoji-id": msgR.emoji.id,
                    "emoji-identifier": msgR.emoji.identifier,
                    "emoji-name": msgR.emoji.name,
                    "user-id": user.id,
                    "user-tag": user.tag,
                    "message": "A reaction was added to a message."
                }
                this.logger("messageReactionRemove", r);
            },
            messageUpdate: (oldM, newM) => {
                let m = {
                    "old-id": oldM.id,
                    "new-id": newM.id,
                    "old-content": oldM.cleanContent,
                    "new-content": newM.cleanContent,
                    "author": newM.author,
                    "url": newM.url,
                    "created-at": newM.createdAt,
                    "edited-at": newM.editedAt,
                    "edits": newM.edits.length
                }
                this.logger("messageUpdate", m);
            },
            roleCreate: (role) => {
                let r = {
                    "id": role.id,
                    "name": role.name,
                    "color": role.color,
                    "permissions": role.permissions,
                    "created-at": role.createdAt
                }
                this.logger("roleCreate", r);
            },
            roleDelete: (role) => {
                let r = {
                    "id": role.id,
                    "name": role.name,
                    "color": role.color,
                    "permissions": role.permissions,
                    "created-at": role.createdAt
                }
                this.logger("roleCreate", r);
            },
            roleUpdate: (oldR, newR) => {
                let r = {
                    "old-id": oldR.id,
                    "new-id": newR.id,
                    "old-name": oldR.name,
                    "new-name": newR.name,
                    "old-color": oldR.color,
                    "new-color": newR.color,
                    "old-permissions": oldR.permissions,
                    "new-permissions": newR.permissions,
                    "created-at": role.createdAt
                }
                this.logger("roleCreate", r);
            }
        };
        return funcs[name];
    }

    constructor(server, options) {
        this.server = server;
        this.options = options;

        this.filestring = './logs/' + this.server.name + ".json";

        options.forEach(o => {
            let func = this.getFunc(o)
            if(func) {
                server.client.on(o, func);
            } else {
                console.log("Function '" + o + "' does not exist!");
            }
        });
    }

    logger(event, info){
        fs.appendFile(this.filestring, `{"timestamp": ${Date.now()}, "event": ${event}, "info": ${JSON.stringify(info)}},\n`, (err) => {
            if(err){
                console.log(err)
            }
        });
    }

}