const Discord = require("discord.js");
const Levels = require("discord-xp")
var client
const Modules = require(`./models/Modules.js`)
const NexusSettings = require(`./models/NexusSettings`)
const XpBans = require(`./models/XpBan`)
var {PREFIXMap, NexusVersion, queue, ServerIsAddingToPlaylist} = require(`../core-nexus`)
var PREFIX = "."
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []
module.exports.run = async (msg, args, Client) => {
  client = Client
  PREFIXToSet = await PREFIXMap.get(msg.guild.id)
  if(!PREFIXToSet){
    PREFIX = "."
  }
  else{
    PREFIX = PREFIXToSet.GuildPrefix
  }
  try{
    console.log("D12 Ban command ran.")
    await D12BanCommand(msg, args)
  }catch(err){
    console.log(err)
    if(!msg.channel.permissionsFor(msg.guild.me).has("EMBED_LINKS"))return
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
    name: "D12Ban",
    trigger: "acm",
    aliases: []
}


async function D12BanCommand(msg, args){
    if(msg.member.user.id != "373159136592134144"){
        return msg.reply("Go fuck yourself")
    }
    let PersonToBan = await await msg.mentions.members.first() || await msg.guild.members.get(args[0]) || await msg.guild.members.find(user => user.displayName === args[0])
    //await PersonToBan.ban()
    if(!PersonToBan.bannable)return await msg.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");
    await msg.guild.member(PersonToBan).ban();
    await msg.reply("banned em");
}