const Discord = require("discord.js");
var client
const Modules = require(`./models/Modules.js`)
const NexusSettings = require(`./models/NexusSettings`)
const XpBans = require(`./models/XpBan`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
var PREFIX = "."
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []
module.exports.run = async (receivedMessage, args, Client, iarguments) => {
  client = Client
  PREFIXToSet = await PREFIXMap.get(receivedMessage.guild.id)
  if(!PREFIXToSet){
    PREFIX = "."
  }
  else{
    PREFIX = PREFIXToSet.GuildPrefix
  }
  try{
    console.log("Guild command ran!")
    await GuildCommand(receivedMessage, args, iarguments)
  }catch(err){
    console.log(err)
    if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("SEND_MESSAGES"))return
    let botlogschannel = await client.channels.cache.get("873587394224459818");
    let DevErrorEmbed =  new Discord.MessageEmbed()
    .setTitle("**An error has occurred! ❌**")
    .setDescription("**"+ err + "**\n\n" + err.stack)
    .setAuthor(client.user.username)
    .setColor(0xFF0000)
    .setTimestamp(new Date())
    await botlogschannel.send({ embeds: [DevErrorEmbed]})
  }
}
module.exports.help = {
    name: "GuildCommand",
    trigger: "acm",
    aliases: []
}
async function GuildCommand(receivedMessage, args, iarguments) {
  try{
    await Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id}).exec(async function(err,check){
      if(check.guilds == false){
        return;
      }
      else{
        let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL", "MANAGE_ROLES"]
        let answer = await MakeMissingPermsEmbed(RequiredPerms, receivedMessage)
        if(answer != true){
          try{
            return await receivedMessage.author.send({embeds: [answer]})
          }catch(err){
            return
          }
        }
    server = await receivedMessage.guild;
    member = await receivedMessage.member;
    if (args == 0) {
      await receivedMessage.channel.send("No arguments!");
      return;
    }
   if (iarguments[1] == "invite") {
      if (args.length <= 1) {
        return await receivedMessage.channel.send(
          "Invalid amount of arguments! do .g invite <user>"
        );
      } else if (args.length >= 3) {
        return await receivedMessage.channel.send(
          "Invalid amount of arguments! do .g invite <user>"
        );
      } else if (args.length == 2) {
        const mentioneduser = receivedMessage.mentions.members.first();
        if (receivedMessage.member == mentioneduser) {
          return await receivedMessage.channel.send(
            "You can't invite yourself :crossed_swords: "
          );
        }
        if (
          await receivedMessage.member.roles.some(r =>
            [
              "Invited to " + receivedMessage.member.user.tag + "'s Guild"
            ].includes(r.name)
          )
        ) {
          return await receivedMessage.channel.send(
            "This member has already been invited to your Guild"
          );
        }
        var GuildRole = await receivedMessage.guild.roles.find(
          role => role.name === receivedMessage.member.user.tag + "'s Guild"
        );
        if (!GuildRole) {
          if (
            !receivedMessage.member.roles.some(r => [GuildRole].includes(r.name))
          ) {
            return await receivedMessage.channel.send(
              "You are not the guild leader or you do not have a guild!"
            );
          }
        } else {
          if (!mentioneduser) {
            await receivedMessage.channel.send("Invalid User!");
          } else {
            let alreadyguildroleexist =await  receivedMessage.guild.roles.find(role =>
              role.name.includes(
                "Invited to " + receivedMessage.member.user.tag + "'s Guild"
              )
            );
            try{
              await mentioneduser.send("You have been invited to " + receivedMessage.member.user.tag + "'s Guild, to join type in #commands .g join and select " + receivedMessage.member.user.tag + "'s Guild")
            }catch(err){
              return console.log("Cant send messages to this user!")
            }
            try{
              await receivedMessage.channel.send(
              mentioneduser.user.tag + " has been invited to your Guild!"
            )}catch(err){
              return console.log("Cannot send messages to this user!")
            }
            if (!alreadyguildroleexist) {
              await receivedMessage.guild
                .createRole({
                  name:
                    "Invite to " + receivedMessage.member.user.tag + "'s Guild",
                  color: "WHITE"
                })
                .then(role =>
                  console.log(
                    `Created new Guild role with name ${role.name} and color ${role.color}`
                  )
                )
                .catch(console.error);
              var Guildrole = await receivedMessage.guild.roles.find(
                role =>
                  role.name ===
                  "Invite to " + receivedMessage.member.user.tag + "'s Guild"
              );
            } else {
              var Guildrole = alreadyguildroleexist;
            }
            await mentioneduser.addRole(Guildrole);
            setTimeout(async () => {
              if (!mentioneduser.roles.has(Guildrole.id)) {
                return;
              } else {
                try{
                  await mentioneduser.send(
                  "Your invite to" +
                    receivedMessage.member.user.tag +
                    "'s Guild has timed out!"
                );
                }catch(err){
                  return console.log("Cant send messages to this user!")
                }
                await Guildrole.delete();
              }
            }, 300000);
          }
        }
      } else {
        await receivedMessage.channel.send("something has gone wrong @D12#7185");
      }
    }
    if (args == "create") {
      await receivedMessage.guild
        .createRole({
          name: receivedMessage.member.user.tag + "'s Guild",
          color: "BLUE"
        })
        .then(role =>
          console.log(
            `Created new Guild role with name ${role.name} and color ${role.color}`
          )
        )
        .catch(console.error);
      const role = await receivedMessage.guild.roles.find(
        role => role.name === receivedMessage.member.user.tag + "'s Guild"
      );
      await receivedMessage.member.addRole(role).catch(console.error);
      await receivedMessage.author.send({
        embed: {
          color: 0x7cfc00,
          author: {
            name: client.user.username,
            icon_url: client.user.avatarURL
          },
          title: "Guild Created!✅",
          url: "http://google.com",
          description:
            "Your Guild has been created with the name: " +
            receivedMessage.member.user.tag +
            "'s Guild",
          fields: [
            {
              name: "How to invite members!",
              value:
                "To invite members to the Guild created in the " +
                receivedMessage.guild +
                " discord, go to #Commands and type .g invite <user>"
            }
          ],
          timestamp: new Date(),
          footer: {
            icon_url: client.user.avatarURL,
            text: "© Nexus"
          }
        }
      });
    }
    if (args[0] == "join") {
      await joinGuildcommand(receivedMessage);
      return;
    }
    if (args[0] == "help") {
      await helpCommand(receivedMessage);
      return;
    }
    if (args[0] == "disband") {
      await deleteGuildCommand(receivedMessage);
      return;
    }
    if (args[0] == "delete") {
      await deleteGuildCommand(receivedMessage);
      return;
    }
    if (args[0] == "d") {
      await deleteGuildCommand(receivedMessage);
      return;
    }
    if (args[0] == "del") {
      await deleteGuildCommand(receivedMessage);
      return;
    }
    
  }
  
    })
  }catch(err){
    if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("SEND_MESSAGES"))return
    let botlogschannel = await client.channels.cache.get("873587394224459818");
    if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("EMBED_LINKS"))return
    let Errorembed =  new Discord.MessageEmbed()
    .setTitle("**An error has occurred! ❌**")
    .setDescription("**The devolpment team have been notified of this issue!**")
    .setAuthor(client.user.username)
    .setColor(0xFF0000)
    .setTimestamp(new Date())
    await receivedMessage.channel.send({ embeds: [Errorembed]})
    let DevErrorEmbed =  new Discord.MessageEmbed()
    .setTitle("**An error has occurred! ❌**")
    .setDescription("**"+ err + "**\n\n" + err.stack)
    .setAuthor(client.user.username)
    .setColor(0xFF0000)
    .setTimestamp(new Date())
    await botlogschannel.send({ embeds: [DevErrorEmbed]})
  }
    
  async function joinGuildcommand(receivedMessage) {
    let hasanguildrole = await receivedMessage.member.roles.find(role =>
      role.name.includes("Invite to ")
    );
    let joinGuildrolearray = await receivedMessage.member.roles.filter(role =>
      role.name.includes("Invite to ")
    );
    var joinGuildrolemap = await joinGuildrolearray.map(joinGuildrolearraytomap => {
      return joinGuildrolearraytomap;
    });
    if (!hasanguildrole) {
      return await receivedMessage.channel.send(
        "You have not been invited to any guild 😞"
      );
    }
  
    ///let joininvitedroles =
    let joinGuildrolesstring = joinGuildrolemap.join(" ");
    let joinGuildroleargs = joinGuildrolesstring.split(" ");
    let index = 0;
    await receivedMessage.channel.send(`
      __**Guild selection:**__
  ${joinGuildrolemap
    .map(joinGuildroles => `**${++index} -** ${joinGuildroles}`)
    .join("\n")}
  Please provide a value to select one of the search results ranging from 1-10.
                          `);
    try {
      var response = await receivedMessage.channel.awaitMessages(
        msg2 => msg2.content > 0 && msg2.content < 11,
        {
          maxMatches: 1,
          time: 10000,
          errors: ["time"]
        }
      );
    } catch (err) {
      console.error(err);
      return await receivedMessage.channel.send(
        "No or invalid value entered, cancelling Guild selection."
      );
    }
    const numGuildtojoin = parseInt(response.first().content);
    var chosenGuildrole = await receivedMessage.guild.roles.get(
      joinGuildrolemap[numGuildtojoin - 1].id
    );
    let chosenGuildrolename = chosenGuildrole.name;
    let joinedGuildroleargs = chosenGuildrolename.split(" ");
    let whosGuildtojoin = joinedGuildroleargs.slice(2);
    let Guildjoining = receivedMessage.guild.roles.find(
      role => role.name === whosGuildtojoin[0] + " " + whosGuildtojoin[1]
    );
    let member = await receivedMessage.member;
    await member.addRole(Guildjoining);
    await chosenGuildrole.delete();
    await receivedMessage.author.send(
      "You have joined " + whosGuildtojoin);
      
  }
  async function helpCommand(receivedMessage) {
    await receivedMessage.author.send({
      embed: {
        color: 0xffff00,
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        title: "Command Help!",
        url: "http://google.com",
        description:
          "__Here is a list of commands that are currently available to you in Guilds__",
        fields: [
          {
            name: "**.g help**",
            value: "Shows the list of commands you can currently do!"
          },
          {
            name: "**.g create**",
            value: "Creates a guild voice chat and allows friends to be invited!"
          },
          {
            name: "**.g invite**",
            value:
              "Invites the mentioned user to a guild and the invite times out after 5 minutes "
          },
          {
            name: "**.g join**",
            value:
              "This allows you to join a guild in which you have been invited to!"
          },
          {
            name: "**.g disband**",
            value: "Deletes your currently owned guild!"
          }
        ],
        timestamp: new Date(),
        footer: {
          icon_url: client.user.avatarURL,
          text: "© Nexus"
        }
      }
    });
  }
  async function deleteGuildCommand(receivedMessage) {
    const Guildrole = await receivedMessage.guild.roles.find(
      role => role.name === receivedMessage.member.user.tag + "'s Guild"
    );
    const invitedGuildroles = await receivedMessage.guild.roles.filter(role =>
      role.name.includes(
        "Invite to " + receivedMessage.member.user.tag + "'s Guild"
      )
    );
    if (!Guildrole) {
      return await receivedMessage.channel.send("You do not own a Guild 😞");
    }
    await Guildrole.delete();
    var Guildinvitedrolesmap = await invitedGuildroles.map(Guildinvitedrolestomap => {
      return Guildinvitedrolestomap;
    });
    let Guildrolesstring = Guildinvitedrolesmap.join(" ");
    let joinGuildroleargs = Guildrolesstring.split(" ");
   let amountofinvitedroles = joinGuildroleargs.length;
   if(invitedGuildroles == undefined)return await receivedMessage.channel.send("Guild disbanded!");
    if (amountofinvitedroles >= 1) {
      var i;
      for (i = 0; i < amountofinvitedroles; i++) {
        let invitedGuildrolestodelete = await receivedMessage.guild.roles.find(role =>
          role.name.includes(
            "Invite to " + receivedMessage.member.user.tag + "'s Guild"
          )
        );
        await invitedGuildrolestodelete.delete();
      }
      await receivedMessage.channel.send("Guild disbanded!");
    }
  }
  }
async function MakeMissingPermsEmbed(RequriedPerms, receivedMessage){
    if(!RequriedPerms)return
    if(!receivedMessage)return console.log("Missing message object!")
    let ReqPerms = [] // Needed perms
    let Perms = await receivedMessage.channel.permissionsFor(receivedMessage.guild.me).toArray()
    for(var i = 0;i < RequriedPerms.length;i++){
      if(Perms.includes(RequriedPerms[i])){
  
      }
      else{
        ReqPerms.push(RequriedPerms[i])
      }
    }
    if(ReqPerms.length == 0)return true
    let MissingPerms = await CompairArrays(ReqPerms, Perms)
    if(!MissingPerms)return
    if(MissingPerms.length == 0)return true
    if(MissingPerms.length == 1){
      let InvalidAmountOfPermissionsEmbed = new Discord.MessageEmbed()
      .setTitle("I do not have the required permissions to run this command! ❌")
      .setDescription("Please make sure I have the `" + MissingPerms[0] + "` permission in this guild, in order to run this command.")
      .setColor(0x0080FF)
      .setTimestamp(new Date())
      .setFooter("Nexus © - V" + NexusVersion)
      return InvalidAmountOfPermissionsEmbed
    }
    if(MissingPerms.length >= 2){
      let MissingPermsString = ""
      for(var x = 0;x < MissingPerms.length;x++){
        if(x == MissingPerms.length -1){
          MissingPermsString = MissingPermsString + "and `" + MissingPerms[x] + "`"
        }
        else if(x == 0){
          MissingPermsString = MissingPermsString + "`" + MissingPerms[x] + "` "
        }
        else{
          MissingPermsString = MissingPermsString + ", `" + MissingPerms[x] + "` "
        }
      }
      let InvalidAmountOfPermissionsEmbed = new Discord.MessageEmbed()
      .setTitle("I do not have the required permissions to run this command! ❌")
      .setDescription("Please make sure I have the " + MissingPermsString + " permissions in this guild, in order to run this command.")
      .setColor(0x0080FF)
      .setTimestamp(new Date())
      .setFooter("Nexus © - V" + NexusVersion)
      return InvalidAmountOfPermissionsEmbed
    }
  }
  async function CompairArrays(Array1, Array2){
    let TempArray = []
    for(var x = 0;x < Array1.length;x++){
      if(Array2.includes(Array1[x])){
  
      }
      else{
        TempArray.push(Array1[x])
      }
    }
    return TempArray
  }