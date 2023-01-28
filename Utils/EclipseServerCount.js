var SourceQuery = require('sourcequery');
const Discord = require("discord.js");
var client
const Modules = require(`../cmds/models/Modules.js`)
const NexusSettings = require(`../cmds/models/NexusSettings`)
const XpBans = require(`../cmds/models/XpBan`)
const Suggestions = require(`../cmds/models/suggestions`)
var {PREFIXMap, NexusVersion, rcon, sql} = require(`../core-nexus`)
var PREFIX = "."
const mongoose = require(`mongoose`)
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []
var interval;
var EclipseActiveMemberVc;
module.exports.run = async (Client) => {
  client = Client
  if(!EclipseActiveMemberVc){
    EclipseActiveMemberVc = client.channels.cache.get("704112117648851075")
  }
  try{
    if(!EclipseActiveMemberVc)return console.log("Eclipse TTT Member Tracker Channel None existant.")
    interval = setInterval(GetEclipsePlayers, 10000)
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
    clearInterval(interval)
  }
}
module.exports.help = {
    name: "EclipseGetPlayersCommand"
}
var sq = new SourceQuery(1000); // 1000ms timeout
function GetEclipsePlayers(){
    if(!EclipseActiveMemberVc){
        clearInterval(interval)
        return console.log("Eclipse TTT Member Tracker Channel None existant.")
    }
    sq.open('94.9.224.215', 27015); 
    sq.getPlayers(function(err, players){
        if(!players)return
        return EclipseActiveMemberVc.setName("TTT-Players: " + players.length)
    });
}