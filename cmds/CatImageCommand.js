const Discord = require("discord.js");
var client
const Modules = require(`./models/Modules.js`)
const NexusSettings = require(`./models/NexusSettings`)
const XpBans = require(`./models/XpBan`)
const Actions = require(`./models/ActionSchema`)
const mongoose = require(`mongoose`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
var APIKEY = require(`../config`)
var PREFIX = "."
const request = require('request');
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []
var linkArray = ["https://i.imgur.com/JCsbE75.gif", "https://i.imgur.com/spsfC3S.gif", "https://i.imgur.com/I3Iwza1.gif", "https://i.imgur.com/XUFCoM6.gif", "https://i.imgur.com/qcZblip.gif", "https://i.imgur.com/dio2wJT.gif", "https://i.imgur.com/QzieNnM.gif", "https://i.imgur.com/0DcX5mH.gif", "https://i.imgur.com/sFj3XjG.gif", "https://i.imgur.com/AzJqQRH.gif", "https://i.imgur.com/ECc9slN.gif", "https://i.imgur.com/FCPLS42.jpg", "https://i.imgur.com/1wiQ6Uf.jpg", "https://i.imgur.com/GA5yDho.jpg", "https://i.imgur.com/ouvqAY1.jpg", "https://i.imgur.com/mZqPkm4.jpg", "https://i.imgur.com/8EEYNUW.jpg", "https://i.imgur.com/30uuccm.gif", "https://i.imgur.com/rT9w9Sc.gif", "https://i.imgur.com/CFGR8Ti.gif", "https://i.imgur.com/5h0hdo6.gif", "https://i.imgur.com/wwTHZzc.gif", "https://i.imgur.com/BDlQYBC.gif", "https://i.imgur.com/P9gkcWC.gif", "https://i.imgur.com/Z4BctHF.gif", "https://i.imgur.com/ieUQwNs.gif", "https://i.imgur.com/bLUsI1k.gif", "https://i.imgur.com/7TAGy7m.gif", "https://i.imgur.com/iM3pvjM.gif", "https://i.imgur.com/XqVx6kM.gif", "https://i.imgur.com/jnUSP36.gif", "https://i.imgur.com/6P7tUPh.gif", "https://i.imgur.com/8Bxcea8.gif", "https://i.imgur.com/khNCaIl.gif", "https://i.imgur.com/96s6A5b.gif", "https://i.imgur.com/MNpZGZu.gif", "https://i.imgur.com/3wld7Pp.gif", "https://i.imgur.com/8FLhQLo.gif", "https://i.imgur.com/dsZP2Rs.gif", "https://i.imgur.com/Rg6MrAQ.gif", "https://i.imgur.com/sWtgQdz.gif", "https://i.imgur.com/3n0sgLR.gif", "https://i.imgur.com/b7EHcEE.gif", "https://i.imgur.com/KBQkgw1.gif", "https://i.imgur.com/ghb1fdq.gif", "https://i.imgur.com/hgyhM12.gif", "https://i.imgur.com/QGd3b2R.gif", "https://i.imgur.com/XwaP5q9.gif", "https://i.imgur.com/h2Xy2dk.gif", "https://i.imgur.com/7ElLTPG.gif", "https://i.imgur.com/6youDmz.gif", "https://i.imgur.com/qsRFlAa.gif", "https://i.imgur.com/0wQrUhX.gif", "https://i.imgur.com/Ba4vNoC.gif", "https://i.imgur.com/XsUhzeU.gif"]
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
    console.log("Cat command ran!")
    await CatImageCommand(receivedMessage, args)
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
    name: "CatImageCommand",
    trigger: "acm",
    aliases: []
}
async function CatImageCommand(receivedMessage, args) {
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

    request.get(`http://thecatapi.com/api/images/get?format=src&type=png?api_key=${APIKEY}`, {
    }, async function(error, response, body) {
      if(error || !response.statusCode == 200) {
        return await receivedMessage.channel.send("A problem occured whilst fetching an image, please try again later...")
      }
      //console.log(response.request.uri.href)
      let Target = await receivedMessage.mentions.members.first() || await receivedMessage.guild.members.get(args[0]) || await receivedMessage.guild.members.find(user => user.displayName === args[0])
      if(!Target){
        let ActionDoc = await Actions.findOne({Type: "CatPics", UsersID: receivedMessage.member.user.id})
        var AmountOfAction;
        console.log(ActionDoc)
        if(!ActionDoc){
          let ActionDocCount = new Actions({
            _id: mongoose.Types.ObjectId(),
            Type: "CatPics",
            UsersID: receivedMessage.member.user.id,
            Amount: 1,
            GiversIDs: []
          })
          await ActionDocCount.save()
          AmountOfAction = 1
        }
        else{
          ActionDoc.Amount = ActionDoc.Amount + 1
          AmountOfAction = ActionDoc.Amount
          await ActionDoc.save()
        }
        var ImageEmbed = new Discord.MessageEmbed()
        .setAuthor(`Here ${receivedMessage.member.displayName} have a cat picture!`)
        .setImage(response.request.uri.href)
        .setFooter(`You have now recieved ${AmountOfAction} cat pictures. :3`)
        return await receivedMessage.channel.send({embeds: [ImageEmbed]});
      }
      else{
        let ActionDoc = await Actions.findOne({Type: "CatPics", UsersID: Target.user.id})
        var AmountOfAction;
        if(!ActionDoc){
          let ActionDocCount = new Actions({
            _id: mongoose.Types.ObjectId(),
            Type: "CatPics",
            UsersID: Target.user.id,
            Amount: 1,
            GiversIDs: []
          })
          await ActionDocCount.save()
          AmountOfAction = 1
        }
        else{
          ActionDoc.Amount = ActionDoc.Amount + 1
          await ActionDoc.save()
          AmountOfAction = ActionDoc.Amount
        }
        var ImageEmbed = new Discord.MessageEmbed()
        .setAuthor(`${receivedMessage.member.displayName} gave ${Target.displayName} a cat picture!`)
        .setImage(response.request.uri.href)
        .setFooter(`You have now recieved ${AmountOfAction} cat pictures. :3`)
        return await receivedMessage.channel.send({embeds: [ImageEmbed]});
      }
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