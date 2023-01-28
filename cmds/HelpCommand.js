const Discord = require("discord.js");
var client
const Modules = require(`./models/Modules.js`)
const NexusSettings = require(`./models/NexusSettings`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
var PREFIX = "."
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
      console.log("Help command ran!")
      await helpCommand(receivedMessage)
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
    name: "HelpCommand",
    trigger: "acm",
    aliases: []
}
async function helpCommand(receivedMessage) {
  let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL"]
  let answer = await MakeMissingPermsEmbed(RequiredPerms, receivedMessage)
  if(answer != true){
    try{
      return await receivedMessage.author.send({embeds: [answer]})
    }catch(err){
      return
    }
  }
      try{
          let senthelp = new Discord.MessageEmbed()
          .setTitle("Nexus Help.")
          .setDescription("**Here you can find some information about this bot and how it works.**")
          .addField("Other Help:", PREFIX + "**help**\nThis gives you the text you are looking at!\n\n" + PREFIX + "**shelp**\nCan only be done by staff and displays all staff commands!\n\n" + PREFIX + "**settings help**\nGives you a list of help for settings.\n\n" + PREFIX + "**acm help**\nSends you a help list of how to enable and disable the variety of modules.")
          .addField("Fun:", PREFIX + "**creeper**\nGives you the complete lyrics of the captain sparkles song - Revenge\n\n" + PREFIX + "**av**\nDisplays the mentioned user's avatar or if you don't mention anyone it displays yours!\n\n" + PREFIX + "**image <Image To Search For>**\nSearches for an image on imgur.")
          .addField("XP:", PREFIX + "**rank**\n Displays your current rank.\n\n" + PREFIX + "**ranks**\nDisplays a leaderboard of the top 10 ranked people on the server.") 
          .addField("Music:", PREFIX + "**play <Song Name/ Url/ Playlist Url>**\nPlays the song requested, as long as you're in a voice channel.\n\n" + PREFIX + "**skip**\nSkips the currently playing song, can be instantly skipped if done by a DJ or if you are by yourself.\n\n" + PREFIX + "**pause**\nStops all currently playing music and awaits for a user to resume it.\n\n"+ PREFIX + "**resume**\nResumes all current music in the queue.\n\n"+ PREFIX + "**volume**\nTurns up current volume of the server queue (Please don't use this irresponsibly)\n\n"+ PREFIX + "**dc**\nCan only be used by people with the role DJ and clears the current server queue and disconnects from the voice channel.\n\n" + PREFIX + "**shuffle** <Playlist (Optional)\nShuffles all current songs in the queue.>")
          .addField("Other:", PREFIX + "**ping**\nShows current ping and latency top the server.\n\n" + PREFIX + "**version**\nSends you a dm of the current Nexus version (Required for making a bug report here: https://discord.gg/KANGu7j)\n\n" + PREFIX + "**credits**\nDm's you all the current contributers.\n\n" + PREFIX + "**dog**\nShows a cute dog picture (Dogs are better than cats!).\n\n" + PREFIX + "**cat**\nShows a picture of a cat (No logs included ;-;)\n\n" + PREFIX + "**hug**\nGives you a big hug!\n\n" + PREFIX + "**anime**\nDisplays a anime picture! (Is pokemon anime?)\n\n" + PREFIX + "**setup <module>**\nSets up modules if Nexus hasnt already set them up on join.")
          .setColor(0x94e5ff)
          .setFooter("© Nexus", client.user.avatarURL)
          .setTimestamp(new Date())
          await receivedMessage.author.send({ embeds: [senthelp]})
          let sendalistofhelpembed = new Discord.MessageEmbed()
          .setTitle("Successfully sent some help to your dm's! ✅")
          .setDescription("Sent you some help and information about this bot!")
          .setAuthor(client.user.username)
          .setColor(0x00ff00)
          .setFooter("© Nexus", client.user.avatarURL)
          .setTimestamp(new Date())
          await receivedMessage.channel.send({ embeds: [sendalistofhelpembed]});
      }
      catch(err){
        if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("EMBED_LINKS"))return
        let failedtosend = new Discord.MessageEmbed()
        .setTitle("Failed to sent some help to your dm's! ❌")
        .setDescription("I cannot send you messages " + receivedMessage.member + "! Please check if you have blocked me or if you have closed your dm's.")
        .setAuthor(client.user.username)
        .setColor(0x00ff00)
        .setFooter("© Nexus", client.user.avatarURL)
        .setTimestamp(new Date())
        await receivedMessage.channel.send({ embeds: [failedtosend]})
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