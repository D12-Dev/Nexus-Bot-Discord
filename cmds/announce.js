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
    console.log("announce command ran.")
    await AnnounceCommand(receivedMessage, args)
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
    name: "AnnounceCommand",
    trigger: "acm",
    aliases: []
}
async function AnnounceCommand(receivedMessage, args){
  try{
    Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id}).exec(async function(err,check){
      if(check.announce == false){
        return;
      }
      else{
        let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL"]
        let answer = await MakeMissingPermsEmbed(RequiredPerms, receivedMessage)
        if(answer != true){
          try{
            return await receivedMessage.author.send({embeds: [answer]})
          }catch(err){
            return
          }
        }
        //console.log(receivedMessage.content.length)
        if(receivedMessage.content.length > 900){
          return await receivedMessage.channel.send("You may only have 900 characters for your message announcement.")
        }
        if(!receivedMessage.member.permissions.has("ADMINISTRATOR")){
          return await receivedMessage.channel.send("You don't have permission to this command, please ask a server administrator if necessary!")
        }
    if (args <= 1)return await receivedMessage.channel.send("Invalid amount of arguments - Usage: .announce <channel> <Message> ");
    console.log(args[0])
    if (!args[0].startsWith("<#")){
      var annoucechannel = await receivedMessage.guild.channels.find(channel => channel.name === args[0])
    }
    else{
      var annoucechannel = await receivedMessage.mentions.channels.first()
    }
    if(!annoucechannel)return await receivedMessage.channel.send("This channel is not valid.")
    let message = args.slice(1).join(' ');
    if(!message)return await receivedMessage.channel.send("Please include what you're announcing!")
    var str = await receivedMessage.member.user.tag;
    var res = str.split("#")[0];
    let announcement = new Discord.MessageEmbed()
            .setTitle("**📣  Announcement**")
            .setThumbnail(receivedMessage.member.user.displayAvatarURL)
            .setDescription(res + " has made an announcement...")
            .addField("Announcement: ", message , true)
            .setAuthor(client.user.username)
            .setColor(0x4f007e)
            .setFooter(res + " made this announcement • © Nexus ", client.user.avatarURL)
            .setTimestamp(new Date())
             annoucechannel.send({embeds: [announcement]});
             if(receivedMessage.channel != annoucechannel){
              await receivedMessage.channel.send("✅ Update was posted to " + annoucechannel + " successfully.")
            }
            await receivedMessage.delete();
            return
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
