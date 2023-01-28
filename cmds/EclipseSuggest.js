const Discord = require("discord.js");
var client
const Modules = require(`./models/Modules.js`)
const NexusSettings = require(`./models/NexusSettings`)
const XpBans = require(`./models/XpBan`)
const Suggestions = require(`./models/suggestions`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
var PREFIX = "."
const mongoose = require(`mongoose`)
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []
module.exports.run = async (receivedMessage, arguments, Client, primaryCommand) => {
  client = Client
  PREFIXToSet = await PREFIXMap.get(receivedMessage.guild.id)
  if(!PREFIXToSet){
    PREFIX = "."
  }
  else{
    PREFIX = PREFIXToSet.GuildPrefix
  }
  try{
    console.log("eclipse suggest command ran!")
    await Eclipsesuggestcommand(receivedMessage, arguments, primaryCommand)
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
    name: "EclipseSuggestionCommand",
    trigger: "acm",
    aliases: []
}
async function Eclipsesuggestcommand(receivedMessage, arguments, primaryCommand) {
  try{
    await Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id}).exec(async function(err,check){
    if(check.eclipse == false)return
    let suggestionchannel
    console.log("This is good enough")
    if(receivedMessage.guild.id == "911095119371972638"){
      suggestionchannel = await client.channels.cache.get("911142895761895474")
    }
    else{
      suggestionchannel = await client.channels.cache.get("870369595305914459")
    }
    if(arguments == 0){
        let pleaseaddsuggestionembed = new Discord.MessageEmbed()
          .setTitle("**Could not make suggestion! ❌**")
          .setDescription("Please make a valid suggestion. Usage: .suggest <suggestion>")
          .setAuthor(client.user.username)
          .setColor(0xFF0000)
          .setFooter("• © Nexus ", client.user.avatarURL)
          .setTimestamp(new Date())
        return await receivedMessage.channel.send({embed: pleaseaddsuggestionembed})
    }
    if(receivedMessage.content.length >= 1800){
        let ToManyCharactersembed = new Discord.MessageEmbed()
        .setTitle("**Could not make suggestion! ❌**")
        .setDescription("Too many characters.Please make sure you're suggestion is below 1800 characters!")
        .setAuthor(client.user.username)
        .setColor(0xFF0000)
        .setFooter("• © Nexus ", client.user.avatarURL)
        .setTimestamp(new Date())
        return await receivedMessage.channel.send({embed: ToManyCharactersembed})
    }
    await Suggestions.countDocuments({}, async function(err, number) {
    let suggestionnumber = number + 1
    console.log("Suggestion Number:" + suggestionnumber)
    let suggestion = await receivedMessage.content.substr(primaryCommand.length + 1)
    if(suggestion.length < 10){
        let ToLittleCharactersembed = new Discord.MessageEmbed()
        .setTitle("**Could not make suggestion! ❌**")
        .setDescription("Too little characters.Please make sure you're suggestion is above 10 characters!")
        .setAuthor(client.user.username)
        .setColor(0xFF0000)
        .setFooter("• © Nexus ", client.user.avatarURL)
        .setTimestamp(new Date())
        return await receivedMessage.channel.send({embed: ToLittleCharactersembed})
    }
    const suggestiondatabase = new Suggestions({
        _id: mongoose.Types.ObjectId(),
        Type: "Suggestion",
        SuggestionNumber: suggestionnumber,
        PersonName: receivedMessage.member.user.tag,
        RepliedTo: false
    })
    await suggestiondatabase.save()
    let suggestionembed = new Discord.MessageEmbed()
    .setTitle("**Suggestion #" + suggestionnumber + "**")
    .setDescription(suggestion)
    .setAuthor("Anonymous", "https://www.americanaircraftsales.com/wp-content/uploads/2016/09/no-profile-img-294x300.jpg") 
    .setColor(0xADD8E6)
    .setFooter("• © Nexus ")
    .setTimestamp(new Date())
    await receivedMessage.delete()
    let suggestionsmessage = await suggestionchannel.send({embed: suggestionembed})
    await suggestionsmessage.react(`✅`)
    .then(async() => await suggestionsmessage.react(`❌`))
  })
    })
  }catch(err){
    if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("EMBED_LINKS"))return
    let botlogschannel = await client.channels.cache.get("873587394224459818");
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