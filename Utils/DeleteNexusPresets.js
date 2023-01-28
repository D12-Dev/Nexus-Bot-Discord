const Discord = require("discord.js");
var client
const Modules = require(`../cmds/models/Modules.js`)
const NexusSettings = require(`../cmds/models/NexusSettings`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
var PREFIX = "."
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []
module.exports.run = async (guild, Client) => {
    client = Client
    PREFIXToSet = await PREFIXMap.get(guild.id)
    if(!PREFIXToSet){
      PREFIX = "."
    }
    else{
      PREFIX = PREFIXToSet.GuildPrefix
    }
    try{
      console.log("Delete settings command ran!")
      await DeleteSettings(guild)
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
    name: "DeletePresetsCommand"
}

async function DeleteSettings(guild) {
  try{
        console.log("Left a guild: " + guild.name);
        await NexusSettings.findOne({ Type: "Settings", GuildId: guild.id }).exec(async function(err,check){
        if(check === null){
          return
        }
        else{
          await check.delete()
          return console.log("[Settings] Deleted all settings for " + guild.name)
        }
      })
        Modules.findOne({ Type: "Modules", GuildId: guild.id }).exec(async function(err, check2){
          if(check2 === null){
            return
          }
          else{
            await check2.delete()
            return console.log("[Modules] Deleted all Modules for " + guild.name)
          }
        })
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