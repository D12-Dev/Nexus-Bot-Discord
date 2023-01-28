const Discord = require("discord.js");
var client
const Modules = require(`../cmds/models/Modules.js`)
const NexusSettings = require(`../cmds/models/NexusSettings.js`)
const XpBans = require(`../cmds/models/XpBan`)
const Suggestions = require(`../cmds/models/suggestions`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
var PREFIX = "."
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []

module.exports.run = async (guildMember, Client) => {
  client = Client
  PREFIXToSet = await PREFIXMap.get(guildMember.guild.id)
  if(!PREFIXToSet){
    PREFIX = "."
  }
  else{
    PREFIX = PREFIXToSet.GuildPrefix
  }
  try{
    console.log("eclipse user count util ran!")
    EclipseUserCountUpdate(guildMember)
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
    name: "EclipseUserCountCommand"
}

async function EclipseUserCountUpdate(guildMember) {
  try{
    await Modules.findOne({Type: "Modules", GuildId: guildMember.guild.id}).exec(async function(err,check){
    if(check.eclipse == "false")return
    const UserCountChannel = await client.channels.cache.get("660651333837389866")
    const UserCountGuild = await client.guilds.get("657711363879337984")
    const UserCount = await UserCountGuild.members.filter((m) => !m.user.bot).size 
    await UserCountChannel.setName("Members: " + UserCount)
    })
  }catch(err){
    if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("SEND_MESSAGES"))return
    let botlogschannel = client.channels.cache.get("873587394224459818");
    let DevErrorEmbed =  new Discord.MessageEmbed()
    .setTitle("**An error has occurred! ❌**")
    .setDescription("**"+ err + "**\n\n" + err.stack)
    .setAuthor(client.user.username)
    .setColor(0xFF0000)
    .setTimestamp(new Date())
    await botlogschannel.send({ embeds: [DevErrorEmbed]})
  }
}