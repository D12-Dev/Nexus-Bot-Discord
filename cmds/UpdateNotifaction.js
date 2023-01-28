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
    console.log("Update notifactions command ran!")
    await UpdateNotifactionCommand(receivedMessage, args)
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
    name: "UpdateNotifactionCommand",
    trigger: "acm",
    aliases: []
}

async function UpdateNotifactionCommand(receivedMessage, args){
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
        if(receivedMessage.guild.id != "676874632078426180")return receivedMessage.channel.send("Only admins in the nexus dev discord can post an update message for the bot.Please contact 🔥 D12 🔥#0001, if something critical has occured! https://discord.gg/wEdRXDM")
        if(!receivedMessage.member.permissions.has("ADMINISTRATOR")){
            return await receivedMessage.channel.send("You don't have permission to this command, please ask a server administrator if necessary!")
        }
      if (args <= 2)return await receivedMessage.channel.send("Invalid amount of arguments - Usage: .updatemsg <When Is Update> <Estimated Downtime> <Update Message> ");

      let message = args.slice(2).join(' ');
      let TimeToUpdate = args[1]
      let EstDownTime = args[0]
      if(!message)return await receivedMessage.channel.send("Please include what you're announcing!")
      var str = await receivedMessage.member.user.tag;
      var res = str.split("#")[0];
      let updateannouncement = new Discord.MessageEmbed()
              .setTitle("**📣  Update Announcement**")
              .setThumbnail(receivedMessage.member.user.displayAvatarURL)
              .setDescription(`Nexus will be updating in: ${TimeToUpdate}.\nEstimated downtime: ${EstDownTime}`)
              .addField("Update Message: ", message , true)
              .setAuthor(client.user.username)
              .setColor(0x4f007e)
              .setFooter(res + " made this update announcement. • © Nexus ", client.user.avatarURL)
              .setTimestamp(new Date())
      await client.guilds.forEach(async guild =>{
            let Channel = await guild.channels.filter(c => c.type === "text" && c.permissionsFor(guild.client.user).has("SEND_MESSAGES", "EMBED_LINKS", "VIEW_CHANNEL")).sort((a, b) => a.position - b.position || Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber()).first();
            if(!Channel)return
            try{
              await Channel.send(updateannouncement);
            }catch(err){
              console.log("Failed to post to a guild")
            }
        })
        await receivedMessage.delete();
        return
      }catch(err){
        let botlogschannel = client.channels.cache.get("873587394224459818");
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