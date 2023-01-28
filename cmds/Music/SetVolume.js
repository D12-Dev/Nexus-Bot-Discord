const Discord = require("discord.js");
const Levels = require("discord-xp")
var client
const Modules = require(`../models/Modules.js`)
const NexusSettings = require(`../models/NexusSettings`)
const XpBans = require(`../models/XpBan`)
var {PREFIXMap, NexusVersion, Volume} = require(`../../core-nexus`)
var PREFIX = "."
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []
module.exports.run = async (guild, volumetoset, Client) => {
  client = Client
  PREFIXToSet = await PREFIXMap.get(guild.id)
  if(!PREFIXToSet){
    PREFIX = "."
  }
  else{
    PREFIX = PREFIXToSet.GuildPrefix
  }
  try{
    console.log("set volume command ran.")
    await SetSavedVolume(guild, volumetoset)
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
    name: "SetVolumeUtil"
}



async function SetSavedVolume(guild, volumetoset){
    const SavedVolume = await Volume.get(guild.id)
    if (!SavedVolume) {
      const VolumeConstruct = {
        Volume: volumetoset
      };
      Volume.set(guild.id, VolumeConstruct);
    }
    else{
      return SavedVolume.Volume = volumetoset
    }
}
  