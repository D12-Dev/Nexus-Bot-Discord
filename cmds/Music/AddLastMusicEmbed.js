const Discord = require("discord.js");
const Levels = require("discord-xp")
var client
const Modules = require(`../models/Modules.js`)
const NexusSettings = require(`../models/NexusSettings`)
const XpBans = require(`../models/XpBan`)
var {PREFIXMap, NexusVersion, LastMusicEmbedMap} = require(`../../core-nexus`)
var PREFIX = "."
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []
module.exports.run = async (LastMusicEmbed, guild, textchannel, Client) => {
  client = Client
  PREFIXToSet = await PREFIXMap.get(guild.id)
  if(!PREFIXToSet){
    PREFIX = "."
  }
  else{
    PREFIX = PREFIXToSet.GuildPrefix
  }
  try{
    console.log("add guild music embed util ran.")
    await AddGuildMusicEmbed(LastMusicEmbed, guild, textchannel)
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
    name: "AddLastMusicEmbedUtil"
}


async function AddGuildMusicEmbed(LastMusicEmbed, guild, textchannel){
    const LastMusicEmbedConstruct = {
      Embed: [],
      channelID: textchannel.id,
    };
    await LastMusicEmbedMap.set(guild.id, LastMusicEmbedConstruct);

    LastMusicEmbedConstruct.Embed.push(LastMusicEmbed.id);
}