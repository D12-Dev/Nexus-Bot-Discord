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
    console.log("Xp unban command ran!")
    await XpUnbanCommand(receivedMessage, args)
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
    name: "XPUnbanCommand",
    trigger: "acm",
    aliases: []
}

async function XpUnbanCommand(receivedMessage, args){
  try{
  Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id}).exec(async function(err,check){
    if(check.xp == false){
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
    if(!receivedMessage.member.permissions.has("ADMINISTRATOR")){
      return await receivedMessage.channel.send("You don't have permission to this command, please ask a server administrator if necessary!")
    }
    if(args == 0)return await receivedMessage.channel.send("Invalid amount of arguments! Usage: .unxpban <user> <reason>")
  let member = await receivedMessage.mentions.members.first() || await receivedMessage.guild.members.get(args[0]);
  if(!member)return await receivedMessage.reply("Please mention a valid member of this server");
  let UserId = await member.id
  let reason = args.slice(1).join(' ');
  if(reason.length > 1500){
    return await receivedMessage.channel.send("The reason field may only be 1500 characters long!")
  }
  if(!reason)reason = "No reason provided!"
  console.log(reason)
  var str = await member.user.tag;
  var res = str.split("#")[0];
  XpBans.findOne({UserID: UserId, GuildId: receivedMessage.guild.id}).exec(async function(err,XPdocument){
    if(XPdocument === null){
      await receivedMessage.channel.send("This user is not xp banned on this guild!")
    }
    else{
      await XPdocument.delete()
      await receivedMessage.channel.send(res + " has now been unbanned from gaining xp, with the reason: " + reason)
      await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id }).exec(async function(err,CheckForSettingsdoc){
        var GuildBotLogs = CheckForSettingsdoc.BotLogsChannel
       BotLogsChannel = GuildBotLogs
       console.log("[Guild botlogs] BotLogs channel: " + BotLogsChannel)
      //////////////Database Query////////////////////////////
      ///////////////////////////////////////////////////////
      if(BotLogsChannel == "n/a")return console.log("No botlogs channel assigned!")
      console.log(BotLogsChannel)
      let BotLogsChannelData = await client.channels.cache.get(BotLogsChannel)
      await BotLogsChannelData.send(`${res} has been xp unbanned by ${receivedMessage.author.tag} reason: ${reason}`)
      return
      })
    }

  })
}
  })
}catch(err){
  if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("SEND_MESSAGES"))return
  let botlogschannel = await client.channels.cache.get("873587394224459818");
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
  await botlogschannel.send({embeds: [DevErrorEmbed]})
}
}



async function MakeMissingPermsEmbed(RequriedPerms, receivedMessage){
    if(!RequriedPerms)return
    if(!receivedMessage)return console.log("Missing message object!")
    let ReqPerms = [] // Needed perms
    let Perms = receivedMessage.channel.permissionsFor(receivedMessage.guild.me).toArray()
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