const Discord = require("discord.js");
var client
const Modules = require(`./models/Modules.js`)
const NexusSettings = require(`./models/NexusSettings`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
var PREFIX = "."
var Warns = require(`./models/Warns`)
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
const mongoose = require(`mongoose`)
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
      console.log("Check warns command ran!")
      await HistoryCommand(receivedMessage, args)
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
    name: "CheckWarnsCommand",
    trigger: "acm",
    aliases: []
}

async function HistoryCommand(receivedMessage, args){
  try{
    let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL", "ADD_REACTIONS", "MANAGE_MESSAGES"]
    let answer = await MakeMissingPermsEmbed(RequiredPerms, receivedMessage)
    if(answer != true){
      return await receivedMessage.author.send({embeds: [answer]})
    }
    let WarnEmbedArray = []
    let PageNumber = 1
    let MaxPageNumber = 1
    if(!receivedMessage.member.permissions.has("KICK_MEMBERS"))return await receivedMessage.reply("You do not have the required `KICK_MEMBERS` permission to run this command.")
    let member = await receivedMessage.mentions.members.first() || await receivedMessage.guild.members.get(args[0]);
    if (!member){
      let NotValidMemberembed = new Discord.MessageEmbed()
      .setTitle(`Cannot warn this user! ❌`)
      .setDescription(`I cannot warn this user because they do not exist, within this server.`)
      .setAuthor(member.user.tag, member.displayAvatarURL) 
      .setColor(0xADD8E6)
      .setFooter("• © Nexus")
      .setTimestamp(new Date())
      return await receivedMessage.reply(NotValidMemberembed)
    }
    await Warns.countDocuments({GuildID: receivedMessage.guild.id, OffenderUserID: member.user.id}, async function(err, amount) {
      MaxPageNumber = Math.ceil(amount / 10)
      if(amount == 0){
        let NoWarnsEmbed = new Discord.MessageEmbed()
        .setTitle(`${member.user.tag} has no warns! ✅`)
        .setColor(0xADD8E6)
        .setFooter("• © Nexus")
        .setTimestamp(new Date())
        let WarnMsg = await receivedMessage.channel.send(NoWarnsEmbed)
        await WarnMsg.react('🚫')
        const filter = (reaction, user) => reaction.emoji.name === '🚫' && user.id === receivedMessage.member.user.id
        await WarnMsg.awaitReactions(filter, { time: 15000, max: 1 })
        .then(async collected => {
          try{
            await WarnMsg.delete()
            await receivedMessage.delete()
          }catch(err){
            return
          }
        })
        return
      }
    await Warns.find({GuildID: receivedMessage.guild.id, OffenderUserID: member.user.id}, async function(err, ResultingDocs) {
      let WarnEmbed = new Discord.MessageEmbed()
      .setTitle(`${member.user.tag}'s current warns!`)
      .setDescription(`These are all the current warns for ${member.user.tag} in this guild, if a warn is missing, its probably because you have kicked Nexus from your server at some point.`)
      .setAuthor(member.user.tag, member.user.displayAvatarURL) 
      .setColor(0x0080ff)
      .setThumbnail(member.user.displayAvatarURL)
      .setFooter("• © Nexus")
      .setTimestamp(new Date())
      var WarnNumber = 1
      ResultingDocs.forEach(async(UsersWarn) => {
        WarnEmbedArray.push(`${UsersWarn.DateGiven} || ${member.user.tag} was warned with the reason: ${UsersWarn.Reason}. By user: ${UsersWarn.GivenByUserName}.`)
      })
      if(WarnEmbedArray.length > 10){
        for(var x = 0;x < 10;x++){
          WarnEmbed.addField(`Warn ${WarnNumber}`, WarnEmbedArray[x])
          WarnNumber = WarnNumber + 1
        }
      }
      else{
        for(var x = 0;x < WarnEmbedArray.length;x++){
          WarnEmbed.addField(`Warn ${WarnNumber}`, WarnEmbedArray[x])
          WarnNumber = WarnNumber + 1
        }
      }
      let WarnMsg = await receivedMessage.channel.send(WarnEmbed)
      await WarnMsg.react('⬅️')
      .then(async () => await WarnMsg.react('➡️'))
      .then(async () => await WarnMsg.react('🚫'))
      const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅️' && user.id === receivedMessage.author.id;
      const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡️' && user.id === receivedMessage.author.id;
      const deleteFilter = (reaction, user) => reaction.emoji.name === '🚫' && user.id === receivedMessage.author.id;
      const backwards = await WarnMsg.createReactionCollector(backwardsFilter, {time: 100000});
      const forwards = await WarnMsg.createReactionCollector(forwardsFilter, {time: 100000});
      const Delete = await WarnMsg.createReactionCollector(deleteFilter, {time: 100000});
      await backwards.on('collect',async r => {
        if(PageNumber == 1)return //console.log("On Min page")
        let PreviousPageNum = PageNumber
        if(PageNumber != MaxPageNumber){
          WarnNumber = WarnNumber - ((10 * 2))
        }
        PageNumber = PageNumber - 1
        let TurnPageEmbed = new Discord.MessageEmbed()
        .setTitle(`${member.user.tag}'s current warns!`)
        .setDescription(`These are all the current warns for ${member.user.tag} in this guild, if a warn is missing, its probably because you have kicked Nexus from your server at some point.`)
        .setAuthor(member.user.tag, member.user.displayAvatarURL) 
        .setColor(0x0080ff)
        .setThumbnail(member.user.displayAvatarURL)
        .setFooter("• © Nexus")
        .setTimestamp(new Date())
        if(PreviousPageNum * 10 >= WarnEmbedArray.length){
          //console.log("TotalAmount " + WarnEmbedArray.length)
          WarnNumberOnLastPage = WarnEmbedArray.length - ((MaxPageNumber - 1)* 10)
          WarnNumber = WarnNumber - (10 +  WarnNumberOnLastPage)
          index = ((PageNumber - 1) * 10)
          var i = 0
          while(i < 10){
            TurnPageEmbed.addField(`Warn ${WarnNumber}`, WarnEmbedArray[index + i])
            WarnNumber = WarnNumber + 1
            i = i +1
          }
          await WarnMsg.edit(TurnPageEmbed)
        }
        else{
          var i = 0
          index = ((PageNumber - 1) * 10)
          //console.log("TotalAmount " + WarnEmbedArray.length)
         // console.log(WarnNumber)
          while(i < 10){
            TurnPageEmbed.addField(`Warn ${WarnNumber}`, WarnEmbedArray[index + i])
            WarnNumber = WarnNumber + 1
            i = i +1
          }
          await WarnMsg.edit(TurnPageEmbed)
        }
      })
      await forwards.on('collect',async r => {
        if(PageNumber == MaxPageNumber)return //console.log("On max page")
        PageNumber = PageNumber + 1
        let TurnPageEmbed = new Discord.MessageEmbed()
        .setTitle(`${member.user.tag}'s current warns!`)
        .setDescription(`These are all the current warns for ${member.user.tag} in this guild, if a warn is missing, its probably because you have kicked Nexus from your server at some point.`)
        .setAuthor(member.user.tag, member.user.displayAvatarURL) 
        .setColor(0x0080ff)
        .setThumbnail(member.user.displayAvatarURL)
        .setFooter("• © Nexus")
        .setTimestamp(new Date())
        if(PageNumber * 10 >= WarnEmbedArray.length){
          index = ((PageNumber - 1) * 10)
          var i = 0
          while(i < WarnEmbedArray.length - ((PageNumber - 1) * 10)){
            TurnPageEmbed.addField(`Warn ${WarnNumber}`, WarnEmbedArray[index + i])
            WarnNumber = WarnNumber + 1
            i = i +1
          }
          await WarnMsg.edit(TurnPageEmbed)
        }
        else{
          index = ((PageNumber - 1) * 10)
          var i = 0
          while(i < 10){
            TurnPageEmbed.addField(`Warn ${WarnNumber}`, WarnEmbedArray[index + i])
            WarnNumber = WarnNumber + 1
            i = i +1
          }
          await WarnMsg.edit(TurnPageEmbed)
        }
      })
      await Delete.on('collect',async r => {
        await WarnMsg.delete()
        await receivedMessage.delete()
      })
    })
  })
}catch(err){
  if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("EMBED_LINKS"))return
  let botlogschannel = client.channels.cache.get("873587394224459818");
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