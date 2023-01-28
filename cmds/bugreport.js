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
    console.log("add levels command ran.")
    await BugReportCommand(receivedMessage, args)
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
    name: "BugReportCommand",
    trigger: "acm",
    aliases: []
}

let reportsChannelID = 678372631770300444

/*
let SuccessfulReportEmbed =  new Discord.MessageEmbed()
    .setTitle("**Bug Report Filed 📝**")
    .setDescription("**Your bug report has been filed with our *developers*!**")
    .setAuthor(client.user.username)
    .addField("Bug Report ID", <id>, true)
    .setColor(0xFF8000)
    .setTimestamp(new Date())
    .setURL("https://www.youtube.com/watch?v=Vhh_GeBPOhs")
    await botlogschannel.send({ embeds: [DevErrorEmbed]})

*/
let UserArrayCooldown = []
async function BugReportCommand(receivedMessage, args) {
    if(UserArrayCooldown.includes(receivedMessage.member.user.id)){
      let CooldownEmbed =  new Discord.MessageEmbed()
      .setTitle("**❌ You currently can't make a bug report**")
      .setDescription("**To help combat spam, we limit bug reports to 1 report every 5 minutes per user**")
      .setAuthor(client.user.username)
      .addField("Try again in a few minutes", "Abusing the .bugreport command will lead to a report ban.", true)
      .setColor(0xFF0000)
      .setTimestamp(new Date())
      return await receivedMessage.channel.send(CooldownEmbed)
    }
    /*
    if(BannedUsers.includes(receivedmessage.member.user.id){
      let BanEmbed =  new Discord.MessageEmbed()
      .setTitle("**❌ You are banned from making bug reports.**")
      .setDescription("**The devs noticed you spamming the .bugreport command, so you have been banned from using it**")
      .setAuthor(client.user.username)
      .addField("If you feel your ban is unjust, contact D12#0001 on Discord.", "Remember the developer's decision is final.", true)
      .setColor(0xFF0000)
      .setTimestamp(new Date())
      return await receivedMessage.channel.send(BanEmbed)
    }*/
    UserArrayCooldown.push(receivedMessage.member.user.id)

    setTimeout(()=> {
      let valueToRemove = receivedMessage.member.user.id
      UserArrayCooldown = UserArrayCooldown.filter(item => item !== valueToRemove)
    }, 300000)
}


function GenerateRandomID() {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = Math.floor(Math.random() * (50 - 25 + 1) + 25); i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)]
    }
    return result;
}