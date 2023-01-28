const Warns = require('./models/Warns.js')
const Discord = require("discord.js");
var client
const Modules = require(`./models/Modules.js`)
const NexusSettings = require(`./models/NexusSettings`)
const XpBans = require(`./models/XpBan`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
var PREFIX = "."
const mongoose = require(`mongoose`)
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []
const {queue} = require(`../core-nexus`)
var NexusVersion = "0.2.0 Alpha"
module.exports.run = async (receivedMessage, args, Client) => {
  client = Client
  PREFIXToSet = await PREFIXMap.get(receivedMessage.guild.id)
  if(!PREFIXToSet){
    PREFIX = "."
  }
  else{
    PREFIX = PREFIXToSet.GuildPrefix
  }
  try{
    console.log("Warn command ran!")
    await WarnCommand(receivedMessage, args)
  }catch(err){
    console.log(err)
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
    name: "WarnCommand",
    trigger: "acm",
    aliases: []
}
async function WarnCommand(receivedMessage, args){
  try{
    let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL", "MANAGE_ROLES", "ADD_REACTIONS", "MANAGE_MESSAGES"]
    let answer = await MakeMissingPermsEmbed(RequiredPerms, receivedMessage)
    if(answer != true){
      try{
        return await receivedMessage.author.send({embeds: [answer]})
      }catch(err){
        return
      }
    }
    if(!receivedMessage.member.permissions.has("KICK_MEMBERS"))return await receivedMessage.reply("You do not have the required `KICK_MEMBERS` permission to run this command.")
    if(args < 1){
      let NotValidMemberembed = new Discord.MessageEmbed()
      .setTitle(`Invalid amount of arguments! ❌`)
      .setDescription(`To warn users please use a minimum of 1 argument. Usage: ${PREFIX}warn <user> <reason>.`)
      .setAuthor(client.user.tag, client.user.displayAvatarURL) 
      .setColor(0xADD8E6)
      .setFooter("• © Nexus")
      .setTimestamp(new Date())
      return await receivedMessage.reply(NotValidMemberembed)
    }
    let member = await receivedMessage.mentions.members.first() || await receivedMessage.guild.members.get(args[0]);
    if (!member){
      let NotValidMemberembed = new Discord.MessageEmbed()
      .setTitle(`Cannot warn this user! ❌`)
      .setDescription(`I cannot warn this user because they do not exist, within this server.`)
      .setAuthor(member.user.tag, member.user.displayAvatarURL) 
      .setColor(0xADD8E6)
      .setFooter("• © Nexus")
      .setTimestamp(new Date())
      return await receivedMessage.reply(NotValidMemberembed)
    }
    if(member.permissions.has("ADMINISTRATOR")){
      let SillyGooseWarnAdminEmbed = new Discord.MessageEmbed()
      .setTitle(`Cannot warn ${member.user.tag}! ❌`)
      .setDescription(`I cannot warn this user because they have admin perms, you silly goose!`)
      .setAuthor(member.user.tag, member.user.displayAvatarURL) 
      .setColor(0xADD8E6)
      .setFooter("• © Nexus")
      .setTimestamp(new Date())
      return await receivedMessage.reply(SillyGooseWarnAdminEmbed)
    }
    let reason = args.slice(1).join(" ");
    if(reason.length > 950){
      return await receivedMessage.channel.send("The reason field may only be 950 characters long!")
    }
    if (!reason) reason = "No reason provided";
    const n = new Date()
    let WarnDoc = new Warns({
      _id: mongoose.Types.ObjectId(),
      Type: "Warn",
      OffenderUserName: member.user.tag, 
      OffenderUserID: member.user.id,
      GivenByUserName: receivedMessage.member.user.tag,
      GivenByUserID: receivedMessage.member.user.id,
      DateGiven: new Date(n).toGMTString(),
      DateExact: n.getTime(),
      Reason: reason,
      GuildID: receivedMessage.guild.id
      })
      await WarnDoc.save()
      .then(result => console.log(result))
      .catch(err => console.log("[Warns] An error has occured. Error: " + err));
      console.log("[Warns] Gave a warning in " + receivedMessage.guild.name)
      Warns.countDocuments({GuildID: receivedMessage.guild.id, OffenderUserID: member.user.id}, async function(err, number) {
      let WarnedEmbed = new Discord.MessageEmbed()
      .setTitle(`**Warned ${member.user.tag}** ✅`)
      .setDescription(`${member.user.tag} has been warned with the reason: ${reason}. By user ${receivedMessage.member.user.tag}.`)
      .setAuthor(member.user.tag, member.user.displayAvatarURL) 
      .setColor(0x00ff00)
      .setThumbnail(member.user.displayAvatarURL)
      .setFooter("• © Nexus|| " + member.user.tag + " Currently has " + number + " warns in this guild.")
      .setTimestamp(new Date())
      let WarnMsg = await receivedMessage.channel.send(WarnedEmbed)
      await WarnMsg.react('🚫')
      const filter = (reaction, user) => reaction.emoji.name === '🚫' && user.id === receivedMessage.member.user.id
      await WarnMsg.awaitReactions(filter, { time: 15000, max: 1 })
      .then(async collected => {
        try{
          await WarnMsg.delete()
          await receivedMessage.delete()
        }catch(err){
          return
        }
      })
      return
    })
  }catch(err){
    let botlogschannel = await client.channels.cache.get("873587394224459818");
    if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("SEND_MESSAGES"))return
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