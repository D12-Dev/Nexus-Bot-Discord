const Discord = require("discord.js");
var client
const Modules = require(`../cmds/models/Modules.js`)
const NexusSettings = require(`../cmds/models/NexusSettings`)
const XpBans = require(`../cmds/models/XpBan`)
const TagsDB = require(`../cmds/models/TagSchema`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
var PREFIX = "."
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []
module.exports.run = async (receivedMessage, args, primaryCommand, Client) => {
    client = Client
    PREFIXToSet = await PREFIXMap.get(receivedMessage.guild.id)
    if(!PREFIXToSet){
      PREFIX = "."
    }
    else{
      PREFIX = PREFIXToSet.GuildPrefix
    }
    try{
      await TagManager(receivedMessage, args, primaryCommand)
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
    name: "TagManagerUtil"
}

async function TagManager(receivedMessage, args, primaryCommand){
  try{
    let TagsDoc = await TagsDB.findOne({GuildID: receivedMessage.guild.id, Type: "Tags"})
    if(TagsDoc && TagDoc.Tags.length != 0){
      // Handle the tags
      if(TagsDoc.Tags.includes(primaryCommand)){
        return await receivedMessage.reply(TagsDoc.Tags[primaryCommand])
      }
    }
    else{
      return 
    }
  }catch(err){
    if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("EMBED_LINKS"))return
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

