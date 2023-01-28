const Discord = require("discord.js");
var client
const Modules = require(`./models/Modules.js`)
const NexusSettings = require(`./models/NexusSettings`)
const XpBans = require(`./models/XpBan`)
const Suggestions = require(`./models/suggestions`)
var {PREFIXMap, NexusVersion, rcon, sql} = require(`../core-nexus`)
var PREFIX = "."
const mongoose = require(`mongoose`)
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
    console.log("eclipse slay command ran!")
    await EclipseSlaycommand(receivedMessage, args)
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
    name: "EclipseSlayCommand",
    trigger: "acm",
    aliases: []
}

async function EclipseSlaycommand(receivedMessage, args){
    await Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id}).exec(async function(err,check){
        if(check.eclipse == false)return
    })
    await rcon.connect().then(() => { 
        console.log('connected to eclipse rcon!');
    }).catch(console.error);
    if(args.length == 0)return receivedMessage.channel.send("Please enter a valid user steam id or name.")
    //console.log(args)
    var UserToSlayID
    var UserToSlayNick
    if(receivedMessage.content.includes("Steam")){
      sql.connect(function(err){
        if(err){
          return console.log("Failed to connect to mysql database. Error: " + err + ".")
        }
          sql.query("SELECT" + args[0] + "  FROM main", function (err, result, fields){
          if(result == nil){
            return receivedMessage.channel.send("Please enter a valid user steam id or name.")
          }
          else{
            console.log(result)
            UserToSlayID = result.usersteamid
            UserToSlayNick = result.usernick
          }
        })
      })
    }
    else{
      sql.connect(function(err){
        if(err){
          return console.log("Failed to connect to mysql database. Error: " + err + ".")
        }
          sql.query("SELECT usersteamid FROM main WHERE usernick = '" + args[0] + "';", function (err, result, fields){
          if(result == nil){
            return receivedMessage.channel.send("No results where found!")
          }
          else{
            console.log(result)
            UserToSlayID = result.usersteamid
            UserToSlayNick = result.usernick
          }
        })
      })
    }
    let Reason = args.slice(1).join(' ')
    if(!Reason)return receivedMessage.channel.send("Please enter a reason for the slay('s).")
    var ReturnedServer
    await rcon.command(`slay ${UserToSlayID} ${Reason}`, 10000).then(ReturnedServerByRcon => {
      if(!ReturnedServerByRcon)console.log("No server!")
      else ReturnedServer = ReturnedServerByRcon
    })
    if(!ReturnedServer){
      let ASlayEmbed = new Discord.MessageEmbed()
      .setTitle(`**Successfully added 1 autoslay to ${args[0]}. ✅**`)
      .setDescription(`Added 1 autoslay to player: ${args[0]} due to them not being active on any servers.`)
      .setAuthor(client.user.username)
      .setColor(0xFF0000)
      .setTimestamp(new Date())
      return await receivedMessage.channel.send(ASlayEmbed)
    }
    let SlayEmbed = new Discord.MessageEmbed()
    .setTitle(`**Successfully slayed ${args[0]}. ✅**`)
    .setDescription(`Slayed player: ${args[0]} on server: ${ReturnedServer} successfully.`)
    .setAuthor(client.user.username)
    .setColor(0xFF0000)
    .setTimestamp(new Date())
    await receivedMessage.channel.send(SlayEmbed)
}