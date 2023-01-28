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
    console.log("staff help command ran!")
    return shelpCommand(receivedMessage)
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
    name: "StaffHelpCommand",
    trigger: "acm",
    aliases: []
}
async function shelpCommand(receivedMessage) {
    let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL"]
    let answer = await MakeMissingPermsEmbed(RequiredPerms, receivedMessage)
    if(answer != true){
      try{
        return await receivedMessage.author.send({embeds: [answer]})
      }catch(err){
        return
      }
    }
    if(!receivedMessage.member.permissions.has("KICK_MEMBERS")){
      return await receivedMessage.channel.send("You don't have permission to use this command. You must have the KICK_MEMBERS permisson.")
    }
    try{
      let senthelp = new Discord.MessageEmbed()
      .setTitle("Nexus Staff Help.")
      .setDescription("**Here you can find some information about staff commands and how they work.**")
      .addField("**General:**", PREFIX  +"**mute <user> <reason>**\nThis mutes a given user until unmuted.\n\n" + PREFIX  +"**unmute <user> <reason>**\nThis unmutes a given user until muted again.\n\n" + PREFIX  +"**tempmute <user> <Time in minutes> <reason>**\nThis mutes a given user until the time expires.\n\n" + PREFIX  +"**kick <user> <reason>**\nThis kicks a given user.\n\n" + PREFIX  +"**ban <user> <reason>**\nThis ban a given user.\n\n" + PREFIX  +"**clear <amount 99 max>**\nThis clears a given amount of messages in a channel.\n\n")
      .addField("**Admin Only:**", PREFIX +"**setlevel <number> <user>**\nSets the current level of a user!\n\n" + PREFIX + "**setxp <amount> <user>**\nSets the current xp of a user!\n\n" + PREFIX + "**addxp <amount> <user>**\nAdds the amount of xp onto the selected user's current xp.\n\n" + PREFIX + "**addlevels**\nAdds the amount of levels onto the selected user's current level.\n\n" + PREFIX + "**settings <help/setting>**\nAllows administrators to change settings such as prefix, msg logs, no xp channels, no nexus channels, botlogs and more (For the full list do " + PREFIX + "settings help)")
      .addField("⠀⠀⠀", PREFIX + "**acm <help/enable/disable/modules>**\nAllows administrators to change what modules are active on their server.Such as Welcome messages, Music, Fun commands, Bans, Kicks, Mutes and more (For the full list do " + PREFIX + "acm modules).\n\n" + PREFIX + "**xpban <user>**\nPrevents the selected user from gaining xp until they are xp unbanned.\n\n" + PREFIX + "**xpunban**\nUnbans a user from gaining xp!\n\n" + PREFIX + "**announce**\nSends an announcement if a channel is set using .settings\n\n" + PREFIX + "**removelevels <amount> <user>**\nRemoves the selected amount of levels from the selected user.\n\n" + PREFIX + "**removexp <amount> <user>**\nRemoves the selected amount of xp from the selected user.")
      .setColor(0x94e5ff)
      .setFooter("© Nexus", client.user.avatarURL)
      .setTimestamp(new Date())
      await receivedMessage.author.send(senthelp)
      let sendalistofhelpembed = new Discord.MessageEmbed()
      .setTitle("Successfully sent some staff help to your dm's! ✅")
      .setDescription("Sent you some help and information about how to use staff commands!")
      .setAuthor(client.user.username)
      .setColor(0x00ff00)
      .setFooter("© Nexus", client.user.avatarURL)
      .setTimestamp(new Date())
      await receivedMessage.channel.send(sendalistofhelpembed);
  }
  catch(err){
    let failedtosend = new Discord.MessageEmbed()
    .setTitle("Failed to sent some staff help to your dm's! ❌")
    .setDescription("I cannot send you messages " + receivedMessage.member + "! Please check if you have blocked me or if you have closed your dm's.")
    .setAuthor(client.user.username)
    .setColor(0x00ff00)
    .setFooter("© Nexus", client.user.avatarURL)
    .setTimestamp(new Date())
    await receivedMessage.channel.send(failedtosend)
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