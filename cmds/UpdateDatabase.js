const Discord = require("discord.js");
var client
const Modules = require(`./models/Modules.js`)
const NexusSettings = require(`./models/NexusSettings`)
var XpBans = require(`./models/XpBan`)
var Suggestions = require(`./models/suggestions`)
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
    console.log("Update database command ran!")
    await UpdateDatabase(receivedMessage, args)
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
    name: "UpdateAllDatabases",
    trigger: "acm",
    aliases: []
}


async function UpdateDatabase(receivedMessage, args){
    try{
    let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL"]
    let answer = await MakeMissingPermsEmbed(RequiredPerms, receivedMessage)
    if(answer != true){
      try{
        return await receivedMessage.author.send({embeds: [answer]})
      }catch(err){
        return
      }
    }
    if(receivedMessage.guild.id != "676874632078426180")return 
    if(!receivedMessage.member.permissions.has("ADMINISTRATOR")){
        return await receivedMessage.channel.send("You don't have permission to this command, please ask a server administrator if necessary!")
    }
    if(args[0] == "add"){
        await AddToDatabase(receivedMessage, args)
    }
    else if(args[0] == "remove"){
        await RemoveFromDatabase(receivedMessage, args)
    }
    else if(args[0] == "change"){
        await ChangeDatabase(receivedMessage, args)
    }
    else{
       return await receivedMessage.channel.send("Syntax invalid. Please choose to add, remove or change a part of the database.") 
    }
}catch(err){
    let botlogschannel = await client.channels.cache.get("873587394224459818");
    if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("SEND_MESSAGES"))return
    let Errorembed =  new Discord.MessageEmbed()
    .setTitle("**An error has occurred! ❌**")
    .setDescription("**The devolpment team have been notified of this issue!**")
    .setAuthor(client.user.username)
    .setColor(0xFF0000)
    .setTimestamp(new Date())
    await receivedMessage.channel.send({ embeds: [Errorembed]})
    let DevErrorEmbed =  new Discord.MessageEmbed()
    .setTitle("**An error has occurred! ❌**")
    .setDescription("**"+ err + "**\n\n" + err.stack)
    .setAuthor(client.user.username)
    .setColor(0xFF0000)
    .setTimestamp(new Date())
    await botlogschannel.send({ embeds: [DevErrorEmbed]})
  }
}
async function AddToDatabase(receivedMessage, args){
    if(args < 4){
        return await receivedMessage.channel.send("Invalid amount of arguments! Usage: .updatedatabase <add/remove/change> <type> <nameofsetting> <value>")
    }
    if(args[1] == "modules"){
        return await AddToModulesDatabase(receivedMessage, args)
    }
    if(args[1] == "settings"){
        return await AddToSettingsDatabase(receivedMessage, args)
    }
    if(args[1] == "xpbans"){
        return await AddToXpBansDatabase(receivedMessage, args)
    }
    if(args[1] == "suggestions"){
       return await AddToSuggestionsDatabase(receivedMessage, args)
    }
    else{
        return await receivedMessage.channel.send("Syntax invalid. Please choose either modules, settings, xpbans or suggestions")
    }
}
async function RemoveFromDatabase(receivedMessage, args){
    if(args < 3){
        return await receivedMessage.channel.send("Invalid amount of arguments! Usage: .updatedatabase <add/remove/change> <type> <nameofsetting>")
    }
    if(args[1] == "modules"){
        return await RemoveFromModulesDatabase(receivedMessage, args)
    }
    if(args[1] == "settings"){
        return await RemoveFromSettingsDatabase(receivedMessage, args)
    }
    if(args[1] == "xpbans"){
        return await RemoveFromXpBansDatabase(receivedMessage, args)
    }
    if(args[1] == "suggestions"){
        return await RemoveFromSuggestionsDatabase(receivedMessage, args)
    }
    else{
        return await receivedMessage.channel.send("Syntax invalid. Please choose either modules, settings, xpbans or suggestions")
    }
}
async function ChangeDatabase(receivedMessage, args){
    if(args < 4){
        return await receivedMessage.channel.send("Invalid amount of arguments! Usage: .updatedatabase <add/remove/change> <type> <nameofsetting> <value>")
    }
    if(args[1] == "modules"){
        return await ChangeModulesDatabase(receivedMessage, args)
    }
    if(args[1] == "settings"){
        return await ChangeSettingsDatabase(receivedMessage, args)
    }
    if(args[1] == "xpbans"){
        return await ChangeXpBansDatabase(receivedMessage, args)
    }
    if(args[1] == "suggestions"){
        return await ChangeSuggestionsDatabase(receivedMessage, args)
    }
    else{
        return await receivedMessage.channel.send("Syntax invalid. Please choose either modules, settings, xpbans or suggestions")
    }
}
async function AddToModulesDatabase(receivedMessage, args){
    Modules.find({ Type: "Modules"}).exec(async function(err,AllGuildDocs){
        if(AllGuildDocs[0][args[2]])return await receivedMessage.channel.send("This element is already in the database!")
        console.log(AllGuildDocs)
        AllGuildDocs.forEach(async(GuildDoc) => {
            let SettingToAdd = args[2]
            let Value = args[3]
            GuildDoc[SettingToAdd] = Value
            await GuildDoc.save()
        })
    })
    return await receivedMessage.channel.send(`Completed adding element to ${args[1]} database. Added element: ${args[2]} with the value: ${args[3]}`)
}
async function AddToSettingsDatabase(receivedMessage, args){
    NexusSettings.find({ Type: "Settings"}).exec(async function(err,AllGuildDocs){
        if(AllGuildDocs[0][args[2]])return await receivedMessage.channel.send("This element is already in the database!")
        AllGuildDocs.forEach(async(GuildDoc) => {
            let SettingToAdd = args[2]
            let Value = args[3]
            GuildDoc[SettingToAdd] = Value
            await GuildDoc.save()
        })
    })
    return await receivedMessage.channel.send(`Completed adding element to ${args[1]} database. Added element: ${args[2]} with the value: ${args[3]}`)
}
async function AddToXpBansDatabase(receivedMessage, args){
    XpBans.find({ Type: "XP-Ban"}).exec(async function(err,AllGuildDocs){
        if(AllGuildDocs[0][args[2]])return await receivedMessage.channel.send("This element is already in the database!")
        AllGuildDocs.forEach(async(GuildDoc) => {
            let SettingToAdd = args[2]
            let Value = args[3]
            GuildDoc[SettingToAdd] = Value
            await GuildDoc.save()
        })
    })
    return await receivedMessage.channel.send(`Completed adding element to ${args[1]} database. Added element: ${args[2]} with the value: ${args[3]}`)
}
async function AddToSuggestionsDatabase(receivedMessage, args){
    Suggestions.find({ Type: "Suggestions"}).exec(async function(err,AllGuildDocs){
        if(AllGuildDocs[0][args[2]])return await receivedMessage.channel.send("This element is already in the database!")
        AllGuildDocs.forEach(async(GuildDoc) => {
            let SettingToAdd = args[2]
            let Value = args[3]
            GuildDoc[SettingToAdd] = Value
            await GuildDoc.save()
        })
    })
    return await receivedMessage.channel.send(`Completed adding element to ${args[1]} database. Added element: ${args[2]} with the value: ${args[3]}`)
}
async function RemoveFromModulesDatabase(receivedMessage, args){
    Modules.find({ Type: "Modules"}).exec(async function(err,AllGuildDocs){
        if(!AllGuildDocs[0][args[2]])return await receivedMessage.channel.send("Element is not already in the database!")
        AllGuildDocs.forEach(async(GuildDoc) => {
            let SettingToRemove = args[2]
            GuildDoc[SettingToRemove] = undefined
            await GuildDoc.save()
        })
    })
    return await receivedMessage.channel.send(`Completed removing element from ${args[1]} database. Removed element: ${args[2]}.`)
}
async function RemoveFromSettingsDatabase(receivedMessage, args){
    NexusSettings.find({ Type: "Settings"}).exec(async function(err,AllGuildDocs){
        if(!AllGuildDocs[0][args[2]])return await receivedMessage.channel.send("Element is not already in the database!")
        AllGuildDocs.forEach(async(GuildDoc) => {
            let SettingToRemove = args[2]
            GuildDoc[SettingToRemove] = undefined
            await GuildDoc.save()
        })
    })
    return await receivedMessage.channel.send(`Completed removing element from ${args[1]} database. Removed element: ${args[2]}.`)
}
async function RemoveFromXpBansDatabase(receivedMessage, args){
    XPBans.find({ Type: "XP-Ban"}).exec(async function(err,AllGuildDocs){
        if(!AllGuildDocs[0][args[2]])return await receivedMessage.channel.send("Element is not already in the database!")
        AllGuildDocs.forEach(async(GuildDoc) => {
            let SettingToRemove = args[2]
            GuildDoc[SettingToRemove] = undefined
            await GuildDoc.save()
        })
    })
    return await receivedMessage.channel.send(`Completed removing element from ${args[1]} database. Removed element: ${args[2]}.`)
}
async function RemoveFromSuggestionsDatabase(receivedMessage, args){
    Suggestions.find({ Type: "Suggestions"}).exec(async function(err,AllGuildDocs){
        if(!AllGuildDocs[0][args[2]])return await receivedMessage.channel.send("Element is not already in the database!")
        AllGuildDocs.forEach(async(GuildDoc) => {
            let SettingToRemove = args[2]
            GuildDoc[SettingToRemove] = undefined
            await GuildDoc.save()
        })
    })
    return await receivedMessage.channel.send(`Completed removing element from ${args[1]} database. Removed element: ${args[2]}.`)
}
async function ChangeModulesDatabase(receivedMessage, args){
    Modules.find({ Type: "Modules"}).exec(async function(err,AllGuildDocs){
        if(!AllGuildDocs[0][args[2]])return await receivedMessage.channel.send("Element is not already in the database!")
        AllGuildDocs.forEach(async(GuildDoc) => {
            let Value = args[3]
            let SettingToRemove = args[2]
            GuildDoc[SettingToRemove] = Value
            await GuildDoc.save()
        })
    })
    return await receivedMessage.channel.send(`Completed changing element from ${args[1]} database. Changed element: ${args[2]} to the value: ${args[3]}.`)
}
async function ChangeSettingsDatabase(receivedMessage, args){
    Modules.find({ Type: "Settings"}).exec(async function(err,AllGuildDocs){
        if(!AllGuildDocs[0][args[2]])return await receivedMessage.channel.send("Element is not already in the database!")
        AllGuildDocs.forEach(async(GuildDoc) => {
            let Value = args[3]
            let SettingToRemove = args[2]
            GuildDoc[SettingToRemove] = Value
            await GuildDoc.save()
        })
    })
    return await receivedMessage.channel.send(`Completed changing element from ${args[1]} database. Changed element: ${args[2]} to the value: ${args[3]}.`)
}
async function ChangeXpBansDatabase(receivedMessage, args){
    Modules.find({ Type: "XP-Ban"}).exec(async function(err,AllGuildDocs){
        if(!AllGuildDocs[0][args[2]])return await receivedMessage.channel.send("Element is not already in the database!")
        AllGuildDocs.forEach(async(GuildDoc) => {
            let Value = args[3]
            let SettingToRemove = args[2]
            GuildDoc[SettingToRemove] = Value
            await GuildDoc.save()
        })
    })
    return await receivedMessage.channel.send(`Completed changing element from ${args[1]} database. Changed element: ${args[2]} to the value: ${args[3]}.`)
}
async function ChangeSuggestionsDatabase(receivedMessage, args){
    Modules.find({ Type: "Suggestions"}).exec(async function(err,AllGuildDocs){
        if(!AllGuildDocs[0][args[2]])return await receivedMessage.channel.send("Element is not already in the database!")
        AllGuildDocs.forEach(async(GuildDoc) => {
            let Value = args[3]
            let SettingToRemove = args[2]
            GuildDoc[SettingToRemove] = Value
            await GuildDoc.save()
        })
    })
    return await receivedMessage.channel.send(`Completed changing element from ${args[1]} database. Changed element: ${args[2]} to the value: ${args[3]}.`)
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