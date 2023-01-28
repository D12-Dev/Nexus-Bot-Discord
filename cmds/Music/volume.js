const Discord = require("discord.js");
const Levels = require("discord-xp")
var client
const Modules = require(`../models/Modules.js`)
const NexusSettings = require(`../models/NexusSettings`)
const XpBans = require(`../models/XpBan`)
var {PREFIXMap, NexusVersion, queue, Volume} = require(`../../core-nexus`)
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
    console.log("volume command ran.")
    await SetVolumeCommand(receivedMessage, args)
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
    name: "VolumeMusicCommand"
}


async function SetVolumeCommand(msg, args){
  //console.log(args[1])
  let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL"]
  let answer = await MakeMissingPermsEmbed(RequiredPerms, msg)
  if(answer != true){
    try{
      return await msg.author.send(answer)
    }catch(err){
      return
    }
  }
  if(msg.content.length > 900){
    return await msg.channel.send("There is a 900 character limit.")
  }
  let serverQueue = await queue.get(msg.guild.id)
  if(!msg.member.roles.cache.some(r=>["DJ"].includes(r.name)) ){
        let VolDJ = new Discord.MessageEmbed()
        .setTitle("**Failed to change volume! ❌**")
        .setDescription("You must have the role `DJ` to change volume.")
        return await msg.channel.send({embeds : [VolDJ]});
  }
  if (!msg.member.voice.channel){
    let NotInVc = new Discord.MessageEmbed()
    .setTitle("**Failed to change volume! ❌**")
    .setDescription("You must be in a voice channel to change the volume.")
    return await msg.channel.send({embeds : [NotInVc]});
  } 
  if (!serverQueue){
    let NothingPlaying = new Discord.MessageEmbed()
    .setTitle("**Failed to change volume! ❌**")
    .setDescription("There is nothing playing.")
    return await msg.channel.send({embeds : [NothingPlaying]});
  } 
  if (!args[0]){
    let savedvolumeutil = await client.Music.get("GetVolumeUtil")
    let savedvolume = await savedvolumeutil.run(msg.guild)//await GetSavedVolume(msg)
    let ReqVolume = await Volume.get(msg.guild.id)
    let CurVolEmbed = new Discord.MessageEmbed()
    .setTitle("Current server volume!")
    if(!ReqVolume){
      CurVolEmbed.setDescription("The current volume is: **" + savedvolume + "**.")
      return await msg.channel.send({embeds : [CurVolEmbed]});
    }
    CurVolEmbed.setDescription("The current volume is: **" + savedvolume + "**.")
    return await msg.channel.send({embeds : [CurVolEmbed]});
  }
  if(isNaN(parseInt(args[0]))){
    let NotValidValueEmbed = new Discord.MessageEmbed()
    .setTitle("**Failed to change volume! ❌**")
    .setDescription("The value provided was not valid!")
    return await msg.channel.send({embeds : [NotValidValueEmbed]});
  }
  var volToSet = parseInt(args[0])
  let MusicModuleCheck = await Modules.findOne({Type: "Modules", GuildId: msg.guild.id})
  if(volToSet > 10 && MusicModuleCheck.highvolumes == false){
    if(!msg.member.permissions.has("ADMINISTRATOR")){
      let HighVolumesUhOhEmbed = new Discord.MessageEmbed()
      .setTitle("**Failed to change volume! ❌**")
      .setDescription("This server restricts volume levels over 10.")
      .setFooter(`If you want high volumes enabled, ask an admin to enable them using ${PREFIX}acm enable highvolumes.`)
      .setColor(0xFF0000)
      return await msg.channel.send({embeds : [HighVolumesUhOhEmbed]});
   }else{
      let HighVolumesBypass = new Discord.MessageEmbed()
      .setTitle("**⚠️  Bypassing High Volumes restrictions...**")
      .setDescription("If your ears explode, it ain't the dev team's fault.")
      .setFooter(`Enable them for everyone, so your mates can blast music at higher volumes. Use ${PREFIX}acm enable highvolumes.`)
      .setColor(0xFFA500)
      await msg.channel.send({embeds : [HighVolumesBypass]});
   }
  }
  serverQueue.volume = parseInt(args[0]);
  let SetVolumeUtil = client.Music.get("SetVolumeUtil")
  await SetVolumeUtil.run(msg.guild, args[0], client)
  console.log(serverQueue.connection.dispatcher)
  await serverQueue.connection.dispatcher.volume(args[0] / 3);
  return await msg.channel.send(`I set the volume to: **${args[0]}**`);
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