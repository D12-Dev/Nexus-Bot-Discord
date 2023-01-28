const Discord = require("discord.js");
var client
const Modules = require(`./models/Modules.js`)
const NexusSettings = require(`./models/NexusSettings`)
const XpBans = require(`./models/XpBan`)
const Actions = require(`./models/ActionSchema`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
const mongoose = require(`mongoose`)
const request = require(`request`)
var PREFIX = "."
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []
var linkArray = ["https://d17fnq9dkz9hgj.cloudfront.net/uploads/2018/04/Pomeranian_02.jpg", "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/funny-dog-captions-1563456605.jpg", "https://i.imgur.com/w1ctNZB.gif", "https://i.imgur.com/KZZJ8tJ.gif", "https://i.imgur.com/2xzRIgJ.gif", "https://i.imgur.com/S70gV0G.gif", "https://i.imgur.com/LOqd5sB.gif", "https://i.imgur.com/xufUMMs.gif", "https://i.imgur.com/evfmnno.gif", "https://i.imgur.com/AR4itsv.gif", "https://i.imgur.com/w4OVgVJ.gif", "https://i.imgur.com/FmSI0jA.gif", "https://i.imgur.com/XSDRWfm.gif", "https://i.imgur.com/bG6Sujq.gif", "https://i.imgur.com/sJklxTD.gif", "https://i.imgur.com/ejF7xvG.gif", "https://i.imgur.com/9yWwh7X.gif", "https://i.imgur.com/vJnRiXV.gif", "https://i.imgur.com/UZHswxe.gif", "https://i.imgur.com/lmRJOLF.gif", "https://i.imgur.com/u38PDwF.gif", "https://i.imgur.com/fjgEJd0.gif", "https://i.imgur.com/wS1UUSW.gif"]
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
    console.log("dog command ran!")
    await DogImageCommand(receivedMessage, args)
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
    name: "DogImageCommand",
    trigger: "acm",
    aliases: []
}
async function DogImageCommand(receivedMessage, args) {
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
    let Target = await receivedMessage.mentions.members.first() || await receivedMessage.guild.members.get(args[0]) || await receivedMessage.guild.members.find(user => user.displayName === args[0])
    request.get(`https://api.thedogapi.com/v1/images/search`, {
    }, async function(error, response, body) {
      if(error || !response.statusCode == 200) {
        return await receivedMessage.channel.send("A problem occured whilst fetching an image, please try again later...")
      }
      var JsonBody = JSON.parse(body);
      var link = JsonBody[0].url
      if(!Target){
        let ActionDoc = await Actions.findOne({Type: "DogPics", UsersID: receivedMessage.member.user.id})
        var AmountOfAction;
        if(!ActionDoc){
          let ActionDocCount = new Actions({
            _id: mongoose.Types.ObjectId(),
            Type: "DogPics",
            UsersID: receivedMessage.member.user.id,
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
        .setAuthor(`Here ${receivedMessage.member.displayName} have a dog picture!`)
        .setImage(link)
        .setFooter(`You have now recieved ${AmountOfAction} dog pictures. :3`)
        return await receivedMessage.channel.send({embeds: [ImageEmbed]});
      }
      else{
        let ActionDoc = await Actions.findOne({Type: "DogPics", UsersID: Target.user.id})
        var AmountOfAction;
        if(!ActionDoc){
          let ActionDocCount = new Actions({
            _id: mongoose.Types.ObjectId(),
            Type: "DogPics",
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
        .setAuthor(`${receivedMessage.member.displayName} gave ${Target.displayName} a dog picture!`)
        .setImage(link)
        .setFooter(`You have now recieved ${AmountOfAction} dog pictures. :3`)
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