const Discord = require("discord.js");
var client
const Modules = require(`./models/Modules.js`)
const NexusSettings = require(`./models/NexusSettings`)
const XpBans = require(`./models/XpBan`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
var PREFIX = "."
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
const mongoose = require(`mongoose`)
var NoNexusChannels = []
var NoXpChannels = []
var SuccessKillArray;
var FailKillArray
var NexusRefuseArray
module.exports.run = async (receivedMessage, args, Client) => {
  client = Client
  PREFIXToSet = await PREFIXMap.get(receivedMessage.guild.id)
  let Target = await receivedMessage.mentions.members.first() || await receivedMessage.guild.members.get(args[0]) || await receivedMessage.guild.members.find(user => user.displayName === args[0])
  if(Target){
    SuccessKillArray = [
      `${receivedMessage.member.displayName} stabbed ${Target} with a pencil...`,
      `${receivedMessage.member.displayName} shot ${Target} with a nuke.`,
      `${receivedMessage.member.displayName} silently killed ${Target} whilst they were asleep.`,
      `${receivedMessage.member.displayName} killed ${Target} by farting in their face.`,
      `${receivedMessage.member.displayName} pushed ${Target} of a cliff.`,
      `${receivedMessage.member.displayName} strangled ${Target}.`,
      `${receivedMessage.member.displayName} ate all of ${Target}'s food so they died of starvation.`,
      `${receivedMessage.member.displayName} put ${Target} to sleep.`,
      `${receivedMessage.member.displayName} shot ${Target} with a blow gun.`,
      `${receivedMessage.member.displayName}'s pet dragon ate ${Target} for a little snac.`,
      `${receivedMessage.member.displayName} hired a hitman after ${Target} and it was successful at killing them.`,
      `${receivedMessage.member.displayName} winked at ${Target} and they died of affection.`,
      `${receivedMessage.member.displayName} looked at ${Target} and they turned to stone.`,
      `${receivedMessage.member.displayName} poisoned ${Target}'s water supply with battery acid.`,
      `${receivedMessage.member.displayName} snapped ${Target}'s neck in a dark alley.`,
      `${receivedMessage.member.displayName} took so long to kill ${Target}, that they died of boredom.`,
      `${receivedMessage.member.displayName} suffocated ${Target} with their own hair.`,
      `${receivedMessage.member.displayName} prayed to the gods and they answered by striking ${Target} with a bolt of lightning.`
    ]
    FailKillArray = [
        `${receivedMessage.member.displayName} set off a bomb but it failed. T-T`,
        `${receivedMessage.member.displayName} held the knife by the blade and bled out.`,
        `${receivedMessage.member.displayName} got shot by ${Target}'s turrets upon entering their house.`,
        `${receivedMessage.member.displayName} accidently shot themself with a gun.`,
        `${receivedMessage.member.displayName} went to kill ${Target}, but was unaware that they were a navy seal and got sent to hospital.`,
        `${receivedMessage.member.displayName} and ${Target} had a western dual and ${Target} won.`,
        `${receivedMessage.member.displayName} shot at ${Target} but missed, then ${Target} shot ${receivedMessage.member.displayName} dead.`,
        `${receivedMessage.member.displayName} attempted to shoot ${Target} but the gun exploded on fire.`,
        `${receivedMessage.member.displayName} tried to stab ${Target}, but there rock hard abs deflected the knife back into ${receivedMessage.member.displayName} heart.`,
        `${receivedMessage.member.displayName} tried to kill ${Target} but got arrested.`,
        `${receivedMessage.member.displayName} couldn't bring themself to kill ${Target}.`,
        `${receivedMessage.member.displayName} exploded by ${Target}'s carefully placed landmines.`,
    ]
  }
  NexusRefuseArray = [
      `${receivedMessage.member.displayName} but you have so much to live for!`,
      `${receivedMessage.member.displayName} I will not kill you!`,
      `Nexus refuses.`,
      `${receivedMessage.member.displayName} but I love you...`,
      `${receivedMessage.member.displayName} I'm an ai so I can not kill you.`,
      `*Shakes head*`,


  ]
  if(!PREFIXToSet){
    PREFIX = "."
  }
  else{
    PREFIX = PREFIXToSet.GuildPrefix
  }
  try{
    console.log("Kill command ran!")
    await KillCommand(receivedMessage, args)
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
    name: "KillCommand",
    trigger: "acm",
    aliases: []
}



async function KillCommand(receivedMessage, args){
    let RequiredPerms = ["SEND_MESSAGES", "VIEW_CHANNEL"]
    let answer = await MakeMissingPermsEmbed(RequiredPerms, receivedMessage)
    if(answer != true){
      try{
        return await receivedMessage.author.send({embeds: [answer]})
      }catch(err){
        return
      }
    }
    if(args[0]){
      if(args[0].toLowerCase() == "me"){
        return await receivedMessage.channel.send(NexusRefuseArray[Math.floor(Math.random() * (NexusRefuseArray.length - 1))])
      }
    }
    let Target = await receivedMessage.mentions.members.first() || await receivedMessage.guild.members.get(args[0]) || await receivedMessage.guild.members.find(user => user.displayName === args[0])
    if(!Target){
        return await receivedMessage.channel.send("Please mention a valid member that you would like to kill...")
    }
    let Chanceroll = Math.floor(Math.random() * 2)
    if(Chanceroll == 0){ // Failed kill
        return await receivedMessage.channel.send(FailKillArray[Math.floor(Math.random() * (FailKillArray.length - 1))])
    }
    else{ // Successful kill
        return await receivedMessage.channel.send(SuccessKillArray[Math.floor(Math.random() * (SuccessKillArray.length - 1))])
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
