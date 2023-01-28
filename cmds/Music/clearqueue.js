const Discord = require("discord.js");
const Levels = require("discord-xp")
var client
const Modules = require(`../models/Modules.js`)
const NexusSettings = require(`../models/NexusSettings`)
const XpBans = require(`../models/XpBan`)
var {PREFIXMap, NexusVersion, queue} = require(`../../core-nexus`)
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
    console.log("play command ran.")
    await ClearQueueMusicCommand(msg, args)
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
    name: "ClearQueueMusicCommand"
}


async function ClearQueueMusicCommand(msg, args){
  let serverQueue = queue.get(msg.guild.id)
  let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL"]
    let answer = await MakeMissingPermsEmbed(RequiredPerms, msg)
    if(answer != true){
      try{
        return await msg.author.send(answer)
      }catch(err){
        return
      }
    }
    if(msg.member.roles.some(r=>["DJ"].includes(r.name)) ){
      if(!serverQueue){
          let nosongqueuedembed = new Discord.MessageEmbed()
          .setTitle("Cannot clear queue! ❌")
          .setDescription("There are no songs to clear!")
          .setColor(0xFF0000)
          await msg.channel.send(nosongqueuedembed)
      }
      else{
        serverQueue.songs = [serverQueue.songs[0]]
        let serverqueueclearedembed = new Discord.MessageEmbed()
        .setTitle("Cleared queue! ✅")
        .setDescription("I have cleared the queue for you!")
        .setColor(0x00ff00)
        await msg.channel.send(serverqueueclearedembed)
      }
    }
    else{
      let clearqueueembed = new Discord.MessageEmbed()
      .setTitle("Cannot clear queue! ❌")
      .setDescription("You must have the DJ role to clear the song queue!")
      .setColor(0xFF0000)
      await msg.channel.send(clearqueueembed)
    }
}

async function MakeMissingPermsEmbed(RequriedPerms, receivedMessage){
  if(!RequriedPerms)return
  if(!receivedMessage)return console.log("Missing message object!")
  let ReqPerms = [] // Needed perms
  let Perms = await receivedMessage.channel.permissionsFor(receivedMessage.guild.me).toArray()
  for(var i = 0;i < RequriedPerms.length;i++){
    if(Perms.includes(RequriedPerms[i])){

    }
    else{
      ReqPerms.push(RequriedPerms[i])
    }
  }
  if(ReqPerms.length == 0)return true
  let MissingPerms = await CompairArrays(ReqPerms, Perms)
  if(!MissingPerms)return
  if(MissingPerms.length == 0)return true
  if(MissingPerms.length == 1){
    let InvalidAmountOfPermissionsEmbed = new Discord.MessageEmbed()
    .setTitle("I do not have the required permissions to run this command! ❌")
    .setDescription("Please make sure I have the `" + MissingPerms[0] + "` permission in this guild, in order to run this command.")
    .setColor(0x0080FF)
    .setTimestamp(new Date())
    .setFooter("Nexus © - V" + NexusVersion)
    return InvalidAmountOfPermissionsEmbed
  }
  if(MissingPerms.length >= 2){
    let MissingPermsString = ""
    for(var x = 0;x < MissingPerms.length;x++){
      if(x == MissingPerms.length -1){
        MissingPermsString = MissingPermsString + "and `" + MissingPerms[x] + "`"
      }
      else if(x == 0){
        MissingPermsString = MissingPermsString + "`" + MissingPerms[x] + "` "
      }
      else{
        MissingPermsString = MissingPermsString + ", `" + MissingPerms[x] + "` "
      }
    }
    let InvalidAmountOfPermissionsEmbed = new Discord.MessageEmbed()
    .setTitle("I do not have the required permissions to run this command! ❌")
    .setDescription("Please make sure I have the " + MissingPermsString + " permissions in this guild, in order to run this command.")
    .setColor(0x0080FF)
    .setTimestamp(new Date())
    .setFooter("Nexus © - V" + NexusVersion)
    return InvalidAmountOfPermissionsEmbed
  }
}
async function CompairArrays(Array1, Array2){
  let TempArray = []
  for(var x = 0;x < Array1.length;x++){
    if(Array2.includes(Array1[x])){

    }
    else{
      TempArray.push(Array1[x])
    }
  }
  return TempArray
}