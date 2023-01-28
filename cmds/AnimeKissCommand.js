const Discord = require("discord.js");
var client
const Modules = require(`./models/Modules.js`)
const NexusSettings = require(`./models/NexusSettings`)
const XpBans = require(`./models/XpBan`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
const mongoose = require(`mongoose`)
const Actions = require(`./models/ActionSchema`)
const request = require(`request`)
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
    console.log("anime kiss command ran.")
    await AnimeKissCommand(receivedMessage, args)
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
    name: "AnimeKissCommand",
    trigger: "acm",
    aliases: []
}
async function AnimeKissCommand(receivedMessage, args){
    
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
    request.get(`https://nekos.life/api/v2/img/kiss`, {
      }, async function(error, response, body) {
        if(error || !response.statusCode == 200) {
          return await receivedMessage.channel.send("A problem occured whilst fetching an image, please try again later...")
        }
        var JsonBody = JSON.parse(body);
        var link = JsonBody.url
        //console.log(response.request.uri.href)
        let Target = await receivedMessage.mentions.members.first() || await receivedMessage.guild.members.get(args[0]) || await receivedMessage.guild.members.find(user => user.displayName === args[0])
        if(!Target){
          let ActionDoc = await Actions.findOne({Type: "Kisses", UsersID: receivedMessage.member.user.id})
          var AmountOfAction;
          console.log(ActionDoc)
          if(!ActionDoc){
            let ActionDocCount = new Actions({
              _id: mongoose.Types.ObjectId(),
              Type: "Kisses",
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
          .setAuthor(`Here ${receivedMessage.member.displayName} have a kiss!`)
          .setImage(link)
          .setFooter(`You have now recieved ${AmountOfAction} kisses. :3`)
          return await receivedMessage.channel.send({embeds: [ImageEmbed]});
        }
        else{
          let ActionDoc = await Actions.findOne({Type: "Kisses", UsersID: Target.user.id})
          var AmountOfAction;
          if(!ActionDoc){
            let ActionDocCount = new Actions({
              _id: mongoose.Types.ObjectId(),
              Type: "Kisses",
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
          .setAuthor(`${receivedMessage.member.displayName} gave ${Target.displayName} a kiss, they're so cute together! OwO`)
          .setImage(link)
          .setFooter(`You have now recieved ${AmountOfAction} kisses. :3`)
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