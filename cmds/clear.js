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
module.exports.run = async (receivedMessage, arguments, Client) => {
  client = Client
  PREFIXToSet = await PREFIXMap.get(receivedMessage.guild.id)
  if(!PREFIXToSet){
    PREFIX = "."
  }
  else{
    PREFIX = PREFIXToSet.GuildPrefix
  }
  try{
    console.log("clear command ran!")
    await ClearCommand(receivedMessage, arguments)
  }catch(err){
    console.log(err)
    if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("EMBED_LINKS"))return
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
    name: "ClearCommand",
    trigger: "acm",
    aliases: []
}
/*async function ClearCommand(receivedMessage, arguments) {
    let eAmount = parseInt(arguments[0]);
    let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL", "MANAGE_MESSAGES"]
    let answer = await MakeMissingPermsEmbed(RequiredPerms, receivedMessage)
    if(answer != true){
      return
    }
    if (isNaN(eAmount)){
        return receivedMessage.channel.send("Invalid amount of messages!");
    }
    if(eAmount >= 100){
        eAmount = 99;
    }
    if(!receivedMessage.member.permissions.has("MANAGE_MESSAGES")){
      return receivedMessage.channel.send("You don't have permission to use this command. You must have the `MANAGE_MESSAGES` permisson.")
    }
    let fetchedMessages = await receivedMessage.channel.fetchMessages({ limit: eAmount + 1 })
    fetchedMessages.forEach(MessageToDelete => {
      MessageToDelete.delete()
    });
      await receivedMessage.channel.send("Deleted " + eAmount + " messages!");
      let lastmessage = client.user.lastMessage;
      lastmessage.delete(5000).catch(console.error);
      NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id }).exec(async function(err,CheckForSettingsdoc){
        var GuildBotLogs = CheckForSettingsdoc.BotLogsChannel
       // console.log("[GetGuildPrefix] Result: " + GuildPrefix)  <---- Testing purposes 
       BotLogsChannel = GuildBotLogs
       console.log("[Guild botlogs] BotLogs channel: " + BotLogsChannel)
      //////////////Database Query////////////////////////////
      ///////////////////////////////////////////////////////
      if(BotLogsChannel == "n/a")return console.log("No botlogs channel assigned!")
      console.log(BotLogsChannel)
      let BotLogsChannelData = client.channels.cache.get(BotLogsChannel)
      BotLogsChannelData.send(receivedMessage.author.tag + " cleared " + eAmount + " of messages in channel: " + receivedMessage.channel)
      })
}    */
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






  async function ClearCommand(receivedMessage, arguments) {
    try{
    let eAmount = parseInt(arguments[0]);
    let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL", "MANAGE_MESSAGES"]
    let answer = await MakeMissingPermsEmbed(RequiredPerms, receivedMessage)
    if(answer != true){
      return
    }
    if (isNaN(eAmount)){
        return await receivedMessage.channel.send("Invalid amount of messages!");
    }
    if(eAmount >= 100){
        eAmount = 99;
    }
    if(!receivedMessage.member.permissions.has("MANAGE_MESSAGES")){
      return await receivedMessage.channel.send("You don't have permission to use this command. You must have the `MANAGE_MESSAGES` permisson.")
    }
    let fetchedMessages = await receivedMessage.channel.fetchMessages({ limit: eAmount + 1 })
    await receivedMessage.channel.bulkDelete(fetchedMessages)
    .then(async res => { // Added this so that if the promise resolves correctly, it sends the message
      await receivedMessage.channel.send("Deleted " + eAmount + " messages!");
      let lastmessage = await client.user.lastMessage;
      await lastmessage.delete(5000).catch(console.error);
      await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id }).exec(async function(err,CheckForSettingsdoc){
        var GuildBotLogs = CheckForSettingsdoc.BotLogsChannel
       // console.log("[GetGuildPrefix] Result: " + GuildPrefix)  <---- Testing purposes 
       BotLogsChannel = GuildBotLogs
       console.log("[Guild botlogs] BotLogs channel: " + BotLogsChannel)
      //////////////Database Query////////////////////////////
      ///////////////////////////////////////////////////////
      if(BotLogsChannel == "n/a")return console.log("No botlogs channel assigned!")
      console.log(BotLogsChannel)
      let BotLogsChannelData = await client.channels.cache.get(BotLogsChannel)
      await BotLogsChannelData.send(receivedMessage.author.tag + " cleared " + eAmount + " of messages in channel: " + receivedMessage.channel)
      })
    })
    .catch(async err => { // If the promise rejects, it sends teh error message.
    let failedtodelete = new Discord.MessageEmbed()
    .setTitle("Failed to delete given messages! ❌")
    .setDescription("Please make sure the messages you are trying to delete are less than 2 weeks old! This is to prevent api spam and also to stop our bot being banned!")
    .setAuthor(client.user.username)
    .setColor(0x00ff00)
    .setFooter("© Nexus", client.user.avatarURL)
    .setTimestamp(new Date())
    return await receivedMessage.channel.send(failedtodelete)
  })
}catch(err){
  if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("EMBED_LINKS"))return
  let botlogschannel = client.channels.cache.get("873587394224459818");
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
