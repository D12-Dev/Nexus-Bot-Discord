const Discord = require("discord.js");
var client
const Modules = require(`./models/Modules.js`)
const NexusSettings = require(`./models/NexusSettings`)
const AutoRoles = require(`./models/AutoRoles.js`)
const AutoLevelRoles = require(`./models/LevelRanks.js`)
const XpBans = require(`./models/XpBan`)
const mongoose = require(`mongoose`)
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
    console.log("setup command ran!")
    await Setup(receivedMessage, args)
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
    name: "SetupCommands",
    trigger: "acm",
    aliases: []
}

async function Setup(receivedMessage, args){
    if(!args[0]){
        return receivedMessage.reply("No arguments provided! Syntax: " + PREFIX + "setup <module>.")
    }
    if(args[0].toLowerCase() == "muterole"){
        return MuteRoleSetup(receivedMessage)
    }
    else if(args[0].toLowerCase() == "djrole"){
        return DJRoleSetup(receivedMessage)
    }
    else if(args[0].toLowerCase() == "help"){
        return HelpSetup(receivedMessage)
    }
    else{
        return receivedMessage.reply("No module with that name. Please try " + PREFIX + "setup help.")
    }
}

async function MuteRoleSetup(receivedMessage){
    let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL", "MANAGE_ROLES"]
    let answer = await MakeMissingPermsEmbed(RequiredPerms, receivedMessage)
    if(answer != true){
      try{
        return await receivedMessage.author.send({embeds: [answer]})
      }catch(err){
        return
      }
    }
    if(!receivedMessage.member.permissions.has("ADMINISTRATOR")){
      return await receivedMessage.channel.send("You don't have permission to this command, please ask a server administrator if necessary!")
    }
    var MuteRole = await receivedMessage.guild.roles.find(role =>role.name === "Nexus Mute");
    if(!MuteRole){
        if(!receivedMessage.guild.me.permissions.has("MANAGE_ROLES")){
            
        }
        else{
            MuteRole = await receivedMessage.guild.createRole({name: "Nexus Mute", color: "WHITE"}).then(role =>console.log(`Created new role with name ${role.name} and color ${role.color}`)).catch(console.error);
            MuteRole.setPosition(receivedMessage.guild.me.highestRole.position + 1)
        }
    }
    //receivedMessage.channel.permissionsFor(receivedMessage.guild.me).toArray()
    let count = 0
    let channelcount = 0
    await receivedMessage.channel.send("Setting up mute role command! This may take a while if your guild is large!")
    await receivedMessage.guild.channels.forEach(async(channel) => {
        if(MuteRole){
          if(channel.type == "text"){
            count = count + 1
            if(count == receivedMessage.guild.channels.size){
                await receivedMessage.channel.send("Setup mute role for " + channelcount + " channels.")
            }
            if(!channel.permissionsFor(receivedMessage.guild.me).toArray().includes("MANAGE_ROLES"))return
            channelcount++
            await channel.overwritePermissions(MuteRole,{
              SEND_MESSAGES: false
            })
          }
          else if(channel.type == "voice"){
            count = count + 1
            if(count == receivedMessage.guild.channels.size){
                await receivedMessage.channel.send("Setup mute role for " + channelcount + " channels.")
            }
            if(!channel.permissionsFor(receivedMessage.guild.me).toArray().includes("MANAGE_ROLES"))return
            channelcount++
            await channel.overwritePermissions(MuteRole,{
              SPEAK: false
            })
          }
          count = count + 1
        }
    })
}

async function DJRoleSetup(receivedMessage){
    let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL", "MANAGE_ROLES"]
    let answer = await MakeMissingPermsEmbed(RequiredPerms, receivedMessage)
    if(answer != true){
      try{
        return await receivedMessage.author.send({embeds: [answer]})
      }catch(err){
        return
      }
    }
    if(!receivedMessage.member.permissions.has("ADMINISTRATOR")){
      return await receivedMessage.channel.send("You don't have permission to this command, please ask a server administrator if necessary!")
    }
    var DJRole = await receivedMessage.guild.roles.find(async role => role.name === "DJ");
    if(!DJRole){
      if(!receivedMessage.guild.me.permissions.has("MANAGE_ROLES")){
        
      }
      else{
        await receivedMessage.guild.createRole({name:"DJ", color: "WHITE"}).then(role => console.log(`Created new role with name ${role.name} and color ${role.color}`)).catch(console.error)
      }
    }
    await receivedMessage.channel.send("I have successfully setup DJ role!")
}

async function HelpSetup(receivedMessage){
    let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL", "MANAGE_ROLES"]
    let answer = await MakeMissingPermsEmbed(RequiredPerms, receivedMessage)
    if(answer != true){
      try{
        return await receivedMessage.author.send({embeds: [answer]})
      }catch(err){
        return
      }
    }
    if(!receivedMessage.member.permissions.has("ADMINISTRATOR")){
      return await receivedMessage.channel.send("You don't have permission to this command, please ask a server administrator if necessary!")
    }
    let Setuphelp = new Discord.MessageEmbed()
    .setTitle("**Setup Modules!**")
    .setDescription("**A useful list of all the setup modules!**")
    .addField(PREFIX + "setup MuteRole", "Sets up all the channels Nexus has the `MANAGE_ROLES` permission and Sets up the mute role!")
    .addField(PREFIX + "setup DJRole", "Makes the DJ role.")
    .setAuthor(client.user.username)
    .setColor(0x5DFC0A)
    .setTimestamp(new Date())
    return await receivedMessage.author.send(Setuphelp)
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