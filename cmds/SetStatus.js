const Discord = require("discord.js");
const Levels = require("discord-xp")
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
    console.log("set status command ran!")
    SetStatus(receivedMessage, args)
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
    name: "SetStatusCommand",
    trigger: "acm",
    aliases: []
}

async function SetStatus(receivedMessage, args){
  try{
    if(receivedMessage.guild.id != "676874632078426180")return
    if(!receivedMessage.member.permissions.has("ADMINISTRATOR"))return
    var StatusToSet = args.slice(1).join(' ')
    if(StatusToSet > 200)return await receivedMessage.channel.send("Status' may only be 200 characters long.")
    console.log(StatusToSet)
    if(args[0].toLowerCase() == "game"){
      await client.user.setActivity(StatusToSet, {
          type: "GAME",
          url: "http://bit.ly/33fVhjm"
       });
      await receivedMessage.channel.send(`Set status to \`${args[0]} ${StatusToSet}\`.`)
    }
    else if(args[0].toLowerCase() == "listening"){
      await client.user.setActivity(StatusToSet, {
            type: "LISTENING",
            url: "http://bit.ly/33fvhjm"
          });
          await receivedMessage.channel.send(`Set status to \`${args[0]} ${StatusToSet}\`.`)
    }
    else if(args[0].toLowerCase() == "playing"){
        client.user.setActivity(StatusToSet, {
            type: "PLAYING",
            url: "http://bit.ly/33fvhjm"
          });
          await receivedMessage.channel.send(`Set status to \`${args[0]} ${StatusToSet}\`.`)
    }
    else if(args[0].toLowerCase() == "streaming"){
        client.user.setActivity(StatusToSet, {
            type: "STREAMING",
            url: StatusToSet
          });
          await receivedMessage.channel.send(`Set status to \`${args[0]} ${StatusToSet}\`.`)
    }
    else if(args[0].toLowerCase() == "watching"){
        client.user.setActivity(StatusToSet, {
            type: "WATCHING",
            url: "http://bit.ly/33fvhjm"
          });
          await  receivedMessage.channel.send(`Set status to \`${args[0]} ${StatusToSet}\`.`)
    }
    else{
      await receivedMessage.channel.send("Invalid syntax. Usage: .setstatus <streaming/watching/playing/listening> <Status To Set>")
    }
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