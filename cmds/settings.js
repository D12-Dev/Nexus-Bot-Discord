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
    console.log("Change settings command ran!")
    await ChangeNexusSettings(receivedMessage, args)
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
    name: "SettingsCommand",
    trigger: "acm",
    aliases: []
}
async function ChangeNexusSettings(receivedMessage, args){
  try{
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
    if (args <= 1){
      let InvalidAmountOfArgs = Discord.MessageEmbed()
      .setTitle("Invalid amount of arguments! ❌")
      .setDescription("Here are all the usages for the settings command!")
      .addField("Normal Use:", PREFIX + "settings <setting> <change>.")
      .addField("No nexus & No XP channels:", PREFIX + "settings <setting> <add/remove> <channel>.")
      .addField("Auto Roles:", PREFIX + "settings autoroles <add/remove> <role>.")
      .addField("Auto Level Roles:", PREFIX + "settings autolevelroles <add/remove> <level-obtained-at> <role>.") 
      .setAuthor(client.user.username)
      .setColor(0x0080FF)
      .setFooter("The list of changes you can apply can be found by doing " + PREFIX + "settings help.")
      .setTimestamp(new Date())
      return await receivedMessage.channel.send(InvalidAmountOfArgs)
    }
    if(args[0] == "help"){
      return await NexusSettingsHelp(receivedMessage)
    }
    if(args[0] == "nonexuschannels"){
      return await NoNexusChannelsSetting(receivedMessage, args)
    }
    if(args[0] == "noxpchannels"){
      return await NoXPChannelsSetting(receivedMessage, args)
    }
    if(args[0] == "autoroles"){
      return await AutoRolesSetting(receivedMessage, args)
    }
    if(args[0] == "autolevelroles"){
      return await AutoLevelRolesSetting(receivedMessage, args)
    }
    let SettingToChange = args[0].toLowerCase()
    let Change = args[1]
    if(!Change){
      return await receivedMessage.channel.send(`Invalid amount of arguments! Usage: ${PREFIX}settings <setting> <change>.`)
    }
    if(SettingToChange == "xpmult" || SettingToChange == "xpmultiplier" || SettingToChange == "xpm" || SettingToChange == "xpgained"){
      SettingToChange = "xpmultiplier"
    }
    await SettingChange(SettingToChange, Change, receivedMessage)
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
  async function SettingChange(SettingToChange, Change, receivedMessage){
    await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id }).exec(async function(err,check){
      let IfAlreadyActive = SettingsErrorHandling(SettingToChange, Change, check)
      if(IfAlreadyActive == true){
        return await receivedMessage.channel.send("The current setting " + SettingToChange + " is already " + Change)
      }
      else{
        if(SettingToChange == "prefix"){
          return await ChangePrefixSetting(receivedMessage,Change)
        }
        if(SettingToChange == "msglogs"){
          return await ChangeMsgLogsSetting(receivedMessage,Change)
        }
        if(SettingToChange == "botlogs"){
          return await ChangeBotLogsSetting(receivedMessage,Change)
        }
        if(SettingToChange == "welcome"){
          return await ChangeWelcomeChatSetting(receivedMessage,Change)
        }
        if(SettingToChange == "xpmultiplier"){
          return await ChangeXPMultiplierSetting(receivedMessage,Change)
        }
        else{
          return await receivedMessage.channel.send("That setting does not exist!")
        }
      }
    })
  }
  
  ////////////////////////Error Handling////////////////////////////
  /////////////////////////////////////////////////////////////////
  function SettingsErrorHandling(SettingToChange, Change, check){
    if(SettingToChange == "prefix"){
      if(Change == check.Prefix){
        return true
      }
    }
    if(SettingToChange == "xpmultiplier"){
      if(Change == check.XPMultiplier){
        return true
      }
    }
    if(SettingToChange == "msglogs"){
      if(Change == check.MsgLogsChannel){
        return true
      }
    }
    if(SettingToChange == "botlogs"){
      if(Change == check.BotLogsChannel){
        return true
      }
    }
    if(SettingToChange == "welcome"){
      if(Change == check.WelcomeChannel){
        return true
      }
    }
    else{
      return false
    }
  }
  ////////////////////////Error Handling////////////////////////////
  //////////////////////////////////////////////////////////////////

async function AutoRolesSetting(receivedMessage, args){
  if(args.length < 3)return await receivedMessage.channel.send(`Invalid amount of arguments. Usage: ${PREFIX}settings autoroles <add/remove> <role>.`)
  if(args[1].toLowerCase() == "remove"){
    return await RemoveAutoRoleSetting(receivedMessage, args, args[2].toLowerCase())
  }
  if(args[1].toLowerCase() == "add"){
    return await AddAutoRoleSetting(receivedMessage, args, args[2].toLowerCase())
  }
  else{
    return await receivedMessage.channel.send(`Invalid syntax. Usage: ${PREFIX}settings autoroles <add/remove> <role>.`)
  }
}
async function AutoLevelRolesSetting(receivedMessage, args){
  if(args.length < 4)return await receivedMessage.channel.send(`Invalid amount of arguments. Usage: ${PREFIX}settings autolevelroles <add/remove> <level-obtained-at> <role>.`)
  if(args[1].toLowerCase() == "remove"){
    return await RemoveAutoLevelRoleSetting(receivedMessage, args, args[2].toLowerCase())
  }
  if(args[1].toLowerCase() == "add"){
    return await AddAutoLevelRoleSetting(receivedMessage, args, args[1].toLowerCase())
  }
  else{
    return await receivedMessage.channel.send(`Invalid syntax. Usage: ${PREFIX}settings autolevelroles <add/remove> <level-obtained-at> <role>.`)
  }
}


async function AddAutoRoleSetting(receivedMessage, args, RoleToAdd){
  let Role = await receivedMessage.mentions.roles.first() || await client.roles.get(RoleToAdd)
  if(!Role)return await receivedMessage.channel.send("Please provide a valid role!")
  await AutoRoles.findOne({ Type: "AutoRoles", GuildId: receivedMessage.guild.id }).exec(async function(err,Doc){
    if(Doc != null){
      return await receivedMessage.channel.send("That role already exists as an autorole!")
    }
    const AutoRole = new AutoRoles({
      _id: mongoose.Types.ObjectId(),
      Type: "AutoRoles",
      RoleID: Role.id,
      GuildId: receivedMessage.guild.id
    })
    await AutoRole.save()
    return await receivedMessage.channel.send(`${Role} has been added to the current autoroles.`)
  })
}
async function RemoveAutoRoleSetting(receivedMessage, args, RoleToRemove){
  let Role = await receivedMessage.mentions.roles.first() || await client.roles.get(RoleToRemove)
  if(!Role)return await receivedMessage.channel.send("Please provide a valid role!")
  await AutoRoles.findOne({ Type: "AutoRoles", GuildId: receivedMessage.guild.id, RoleID: Role.id}).exec(async function(err,Doc){
    if(!Doc){
      return await receivedMessage.channel.send("That role does not exist as an autorole!")
    }
    await Doc.delete()
    return await receivedMessage.channel.send(`${Role} has been removed from the current autoroles.`)
  })
}
async function AddAutoLevelRoleSetting(receivedMessage, args, RoleToAdd){
  let Role
  if(args[3]){
    Role = await receivedMessage.mentions.roles.first() || await client.roles.get(args[3])
  }
  else{
    Role = await receivedMessage.mentions.roles.first()
  }
  if(!Role)return await receivedMessage.channel.send("Please provide a valid role!")
  if(isNaN(parseInt(args[2])))return await receivedMessage.channel.send(`Please provide a valid level. Example: settings autolevelroles add 5 Role`)
  await AutoLevelRoles.findOne({ Type: "AutoLevelRoles", GuildId: receivedMessage.guild.id, RoleID: Role.id}).exec(async function(err,Doc){
    if(Doc != null){
      return await receivedMessage.channel.send(`That role already exists as the level ${Doc.Level} autorole!`)
    }
    const AutoLevelRole = new AutoLevelRoles({
      _id: mongoose.Types.ObjectId(),
      Type: "AutoLevelRoles",
      RoleID: Role.id,
      Level: parseInt(args[2]),
      GuildId: receivedMessage.guild.id
    })
    await AutoLevelRole.save()
    return await receivedMessage.channel.send(`${Role} has been added to the current level autoroles.`)
  })
}
async function RemoveAutoLevelRoleSetting(receivedMessage, args, RoleToRemove){
  let Role
  if(args[3]){
    Role = await receivedMessage.mentions.roles.first() || await client.roles.get(args[3])
  }
  else{
    Role = await receivedMessage.mentions.roles.first()
  }
  if(!Role)return await receivedMessage.channel.send("Please provide a valid role!")
  await AutoLevelRoles.findOne({ Type: "AutoLevelRoles", GuildId: receivedMessage.guild.id, RoleID: Role.id}).exec(async function(err,Doc){
    if(!Doc){
      return await receivedMessage.channel.send("That role does not exist as an level autorole!")
    }
    await Doc.delete()
    return await receivedMessage.channel.send(`${Role} has been removed from the current level autoroles.`)
  })
}
async function ChangeXPMultiplierSetting(receivedMessage, Change){
    if (isNaN(Change)){
      return await receivedMessage.channel.send("Invalid value provided!");
    }
    if(Change <= 0){
      return await receivedMessage.channel.send("Please provide a value higher than 0 but lower than 100!")
    }
    if(Change >= 101){
      return await receivedMessage.channel.send("Please provide a value higher than 0 but lower than 100!")
    }
    await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id }).exec(async function(err,SettingDoc){
      SettingDoc.XPMultiplier = Change
      await SettingDoc.save()
      XPMultiplier = Change
      return await receivedMessage.channel.send("Made " + Change + " the default XP multiplier!")
    })
}
  async function NoNexusChannelsSetting(receivedMessage, args){
    // Check if channel is valid!
    let Channel = await receivedMessage.mentions.channels.first()
    if(!Channel)return await receivedMessage.channel.send("The channel you mentioned was not valid!")
    if(args[1] == "add"){
      return await AddNoNexusChannel(receivedMessage, args, Channel)
    }
    if(args[1] == "remove"){
      return await RemoveNoNexusChannel(receivedMessage, args, Channel)
    }
    else{
      return await receivedMessage.channel.send("Invalid syntax! Usage: .settings <setting> <add/remove> <channel>")
    }
  }
  
  async function RemoveNoNexusChannel(receivedMessage, args, Channel){
    await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id }).exec(async function(err,SettingDoc){
      if(!SettingDoc.NoNexusChannels.includes(Channel.id)){
        return await receivedMessage.channel.send( Channel + " is not a no Nexus channel!")
      }
      await SettingDoc.NoNexusChannels.pull(Channel.id)
      await SettingDoc.save()
      const valueToRemove = Channel.id
      const filteredChannels = NoNexusChannels.filter(item => item !== valueToRemove)
      NoNexusChannels = filteredChannels
      console.log(NoNexusChannels) 
      return await receivedMessage.channel.send("Removed " + Channel + " from the no Nexus channel list!")
    })
  }
  
  async function NoXPChannelsSetting(receivedMessage, args){
      // Check if channel is valid!
      let Channel = await receivedMessage.mentions.channels.first()
      if(!Channel)return await receivedMessage.channel.send("The channel you mentioned was not valid!")
      if(args[1] == "add"){
        return await AddNoXPChannel(receivedMessage, args, Channel)
      }
      if(args[1] == "remove"){
        return await RemoveNoXPChannel(receivedMessage, args, Channel)
      }
      else{
        return await receivedMessage.channel.send("Invalid syntax! Usage: .settings <setting> <add/remove> <channel>")
      }
  }
  
  async function AddNoXPChannel(receivedMessage, args, Channel){
    await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id }).exec(async function(err,SettingDoc){
      if(SettingDoc.NoXpChannels.includes(Channel.id)){
        return await receivedMessage.channel.send( Channel + " is already a no XP channel!")
      }
      NoXpChannels.push(Channel.id)
      SettingDoc.NoXpChannels.push(Channel.id)
      await SettingDoc.save()
      return await receivedMessage.channel.send("Added " + Channel + " to the no XP channel list!")
    })
  }
  async function RemoveNoXPChannel(receivedMessage, args, Channel){
    await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id }).exec(async function(err,SettingDoc){
      if(!SettingDoc.NoXpChannels.includes(Channel.id)){
        return await receivedMessage.channel.send( Channel + " is not a no XP channel!")
      }
      await SettingDoc.NoXpChannels.pull(Channel.id)
      await SettingDoc.save()
      const valueToRemove = Channel.id
      const filteredChannels = NoXpChannels.filter(item => item !== valueToRemove)
      NoXpChannels = filteredChannels
      return await receivedMessage.channel.send("Removed " + Channel + " from the no XP channel list!")
    })
  }
  
  async function AddNoNexusChannel(receivedMessage, args, Channel){
    await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id }).exec(async function(err,SettingDoc){
      if(SettingDoc.NoNexusChannels.includes(Channel.id)){
        return await receivedMessage.channel.send( Channel + " is already a no Nexus channel!")
      }
      NoNexusChannels.push(Channel.id)
      SettingDoc.NoNexusChannels.push(Channel.id)
      await SettingDoc.save()
      return await receivedMessage.channel.send("Added " + Channel + " to the no Nexus channel list!")
    })
  }
  
  
  async function ChangeMsgLogsSetting(receivedMessage,Change){
    // Check if channel is valid!
    let Channel = await receivedMessage.mentions.channels.first()
    if(!Channel)return await receivedMessage.channel.send("The channel you mentioned was not valid!")
    await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id }).exec(async function(err,SettingDoc){
      SettingDoc.MsgLogsChannel = Channel.id
      await SettingDoc.save()
      MsgLogsChannel = Channel.id
      return await receivedMessage.channel.send("Made " + Change + " the default MsgLogs channel!")
    })
  }
  
  async function ChangePrefixSetting(receivedMessage,Change){
    if(Change.length >= 2)return await receivedMessage.channel.send("As of now, the prefixes can only be one character long!")
    await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id }).exec(async function(err,SettingDoc){
      SettingDoc.Prefix = Change
      await SettingDoc.save()
      PREFIX = Change
      console.log("[Settings] Prefix for "  + receivedMessage.guild.name + " changed to " + Change)
      PossiblePrefix = await PREFIXMap.get(receivedMessage.guild.id)
      if(!PossiblePrefix){
        NexusSettings.findOne({ Type: "Settings", GuildId: guild.id }).exec(async function(err,CheckForSettingsdoc){
          const AddingPlaylistConstruct = {
            GuildPrefix: CheckForSettingsdoc.Prefix
          };
          PREFIXMap.set(guild.id, AddingPlaylistConstruct);
          })
      }
      else{
        PossiblePrefix.GuildPrefix = Change
      }

      return await receivedMessage.channel.send("Bot prefix changed to " + Change)
    })
  }
  
  async function ChangeWelcomeChatSetting(receivedMessage,Change){
    let Channel = await receivedMessage.mentions.channels.first()
    if(!Channel)return await receivedMessage.channel.send("The channel you mentioned was not valid!")
    await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id }).exec(async function(err,SettingDoc){
      SettingDoc.WelcomeChannel = Channel.id
      await SettingDoc.save()
      WelcomeChannel = Channel.id
      return await receivedMessage.channel.send("Made " + Change + " the default welcoming channel!")
    })
  }
  async function ChangeBotLogsSetting(receivedMessage,Change){
    // Check if channel is valid!
    let Channel = await receivedMessage.mentions.channels.first()
    if(!Channel)return await receivedMessage.channel.send("The channel you mentioned was not valid!")
    await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id }).exec(async function(err,SettingDoc){
      SettingDoc.BotLogsChannel = Channel.id
      await SettingDoc.save()
      BotLogsChannel = Channel.id
      return await receivedMessage.channel.send("Made " + Change + " the default BotLogs channel!")
    })
  }
  
  
  async function NexusSettingsHelp(receivedMessage){
    let Settinghelp = new Discord.MessageEmbed()
    .setTitle("Settings Help!")
    .setAuthor(client.user.username, client.user.displayAvatarURL)
    .setDescription("This message shows all current available settings!")
    .addField("⠀", PREFIX  + "**settings prefix <prefix>**\nChanges the current prefix and is updated via a database.")
    .addField("⠀", PREFIX  + "**settings msglogs <channel>**\nEnables the bot to post a log of what users say in your server!")
    .addField("⠀", PREFIX  + "**settings botlogs <channel>**\nEnables the bot to post a logs of when moderation commands are used!")
    .addField("⠀", PREFIX  + "**settings welcome <channel>**\nEnables the bot to post a welcome message or a leave message, when a user leaves or joins the guild.")
    .addField("⠀", PREFIX  + "**settings noxpchannels <add/remove> <channel>**\nAdds or removes no XP channels.")
    .addField("⠀", PREFIX  + "**settings nonexuschannels <add/remove> <channel>**\nAdds or removes no Nexus channels. (Nexus won't respond to any commands in these channels!)")
    .addField("⠀", PREFIX  + "**settings autoroles <add/remove> <role>**\nAdds or removes a role that is given on a member joining the server.")
    .addField("⠀", PREFIX  + "**settings autolevelroles <add/remove> <level-obtained> <role>**\nAdds or removes a role that is given when a member hits a specified level.")
    .setColor(0x5DFC0A)
    .setTimestamp(new Date())
    return await receivedMessage.author.send(Settinghelp)
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