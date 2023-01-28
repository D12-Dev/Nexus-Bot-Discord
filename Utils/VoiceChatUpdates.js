const Discord = require("discord.js");
var client
const Modules = require(`../cmds/models/Modules.js`)
const NexusSettings = require(`../cmds/models/NexusSettings`)
const XpBans = require(`../cmds/models/XpBan`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
var PREFIX = "."
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []
const {queue} = require(`../core-nexus`)
var NexusVersion = "0.2.0 Alpha"
module.exports.run = async (oldMember, newMember, Client) => {
  client = Client
  PREFIXToSet = await PREFIXMap.get(newMember.guild.id)
  if(!PREFIXToSet){
    PREFIX = "."
  }
  else{
    PREFIX = PREFIXToSet.GuildPrefix
  }
  try{
    console.log("Voice channel updates ran!")
    await VoiceChannelUpdate(oldMember, newMember)
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
    name: "VoiceChannelUpdates"
}
async function VoiceChannelUpdate(oldMember, newMember){
  try{
    /// console.log(newMember.voiceChannel)
    /// console.log(oldMember.voiceChannel)
    if(oldMember.voiceChannel == undefined){
       //console.log("Someone joined a vc")
     }
     if(newMember.voiceChannel == undefined){
       //console.log("Someone left")
      if(oldMember.voiceChannel == oldMember.guild.me.voiceChannel){
         if(!oldMember.guild.me.voiceChannel)return 
         if(oldMember.guild.me.voiceChannel.members.size == 1){
          /*setTimeout(async() => {
            if(!oldMember.guild.me.voiceChannel)return
            if(oldMember.guild.me.voiceChannel.members.size == 1){
              const serverQueue = await queue.get(oldMember.guild.id)
              if(!serverQueue)return //awaitoldMember.guild.me.setVoiceChannel(null);
              if(!serverQueue.songs)return //await oldMember.guild.me.setVoiceChannel(null);
              serverQueue.songs = [];
              if(!serverQueue.connection.dispatcher)return await oldMember.guild.me.setVoiceChannel(null);
              await serverQueue.connection.dispatcher.end("I have left the voicechannel due to inactivity!");
            }
          }, 30000);*/
         }

       }
      else if(oldMember.user.id == client.user.id){
         const serverQueue = await queue.get(oldMember.guild.id)
         if(!serverQueue)return
         if(!serverQueue.songs)return
         serverQueue.songs = [];
         await serverQueue.connection.dispatcher.end("I have been disconnected from the channel!");
         return //console.log("I got disconnected from a voice channel")
       }
    }
    }catch(err){
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