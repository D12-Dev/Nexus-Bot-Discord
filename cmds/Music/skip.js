const Discord = require("discord.js");
const Levels = require("discord-xp")
var client
const Modules = require(`../models/Modules.js`)
const NexusSettings = require(`../models/NexusSettings`)
const XpBans = require(`../models/XpBan`)
var {PREFIXMap, NexusVersion, queue} = require(`../../core-nexus`)
var PREFIX = "."
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []
module.exports.run = async (receivedMessage, Client) => {
  client = Client
  PREFIXToSet = await PREFIXMap.get(receivedMessage.guild.id)
  if(!PREFIXToSet){
    PREFIX = "."
  }
  else{
    PREFIX = PREFIXToSet.GuildPrefix
  }
  try{
    console.log("skip command ran.")
    await SkipMusic(receivedMessage)
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
    name: "SkipMusicCommand"
}


async function SkipMusic(msg){
  let serverQueue = queue.get(msg.guild.id)
  let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL"]
  let answer = await MakeMissingPermsEmbed(RequiredPerms, msg)
  if(answer != true){
    try{
      return await msg.author.send(answer)
    }catch(err){
      return
    }
  }
  console.log(msg.guild.client.voiceChannelID);
  if (!msg.member.voiceChannel){
      let notinavoicechannelembed = new Discord.MessageEmbed()
      .setTitle("**Cannot skip!❌**")
      .setDescription("You are not in a voice channel!")
      .setAuthor(client.user.username)
      /*
      * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
      */
      .setColor(0xff0000)
      .setFooter("© Nexus", client.user.avatarURL)
      /*
      * Takes a Date object, defaults to current date.
      */
      .setTimestamp(new Date())
      return await msg.channel.send(notinavoicechannelembed);
  }
  let usercount = await msg.member.voiceChannel.members.size;
  let required = Math.ceil(usercount/2);
  let guild = await msg.guild;
  if (msg.member.voiceChannel.id != guild.me.voiceChannelID){
      let notinavoicechannelwithbotembed = new Discord.MessageEmbed()
      .setTitle("**Cannot skip!❌**")
      .setDescription("You are not in the same voicechannel as the bot!")
      .setAuthor(client.user.username)
      /*
      * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
      */
      .setColor(0xff0000)
      .setFooter("© Nexus", client.user.avatarURL)
      /*
      * Takes a Date object, defaults to current date.
      */
      .setTimestamp(new Date())
      return await msg.channel.send(notinavoicechannelwithbotembed)
  }
  if (!serverQueue){
      let nothingplayingembed = new Discord.MessageEmbed()
      .setTitle("**Cannot skip!❌**")
      .setDescription("There is nothing playing for me to skip!")
      .setAuthor(client.user.username)
      /*
      * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
      */
      .setColor(0xff0000)
      .setFooter("© Nexus", client.user.avatarURL)
      /*
      * Takes a Date object, defaults to current date.
      */
      .setTimestamp(new Date())
      return await msg.channel.send(nothingplayingembed);
  }
  if (msg.member.roles.some(r=>["DJ"].includes(r.name)) ){
    let embed = new Discord.MessageEmbed()
    .setTitle("**Song Skipped:**")
    .setDescription("You're a DJ and skipped this song!😊")
    .setAuthor(client.user.username)
    /*
    * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
    */
    .setColor(0x00ff00)
    .setFooter("© Nexus", client.user.avatarURL)
    /*
    * Takes a Date object, defaults to current date.
    */
    .setTimestamp(new Date())
    await msg.channel.send(embed);
    let DeleteSkipUtil = await client.Music.get("DeleteGuildSkipsUtil")
    await DeleteSkipUtil.run(msg, client)
    await serverQueue.connection.dispatcher.end('Skipped a song!');
    return
  }
  let AlreadySkippedUtil = await client.Music.get("AlreadySkippedSkipsUtil")
  let HasAlreadySkipped = await AlreadySkippedUtil.run(msg, client)
  //let HasAlreadySkipped = AlreadySkipped(msg)
  if (HasAlreadySkipped == true){
    let GetCurrentSkipsUtil = await client.Music.get("GetCurrentSkipsUtil")
    let CurrentAmountOfSkips = await GetCurrentSkipsUtil.run(msg, client)
    //let CurrentAmountOfSkips = await GetCurrentSkips(msg)
      let alreadyskippedembed = new Discord.MessageEmbed()
      .setTitle("**Cant skip again❌**")
      .setDescription(`You have already voted to skip this song!`)
      .addField(`Vote Skips:`, `${CurrentAmountOfSkips}/${required}`)
      .setAuthor(client.user.username)
      /*
      * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
      */
      .setColor(0xff0000)
      .setFooter("© Nexus", client.user.avatarURL)
      /*
      * Takes a Date object, defaults to current date.
      */
      .setTimestamp(new Date())
      return await msg.channel.send(alreadyskippedembed)
  }
  let AddSkipUtil = await client.Music.get("AddToGuildSkipsUtil")
  await AddSkipUtil.run(msg, client)



  let GetCurrentSkipsUtil = await client.Music.get("GetCurrentSkipsUtil")
  let CurrentAmountOfSkips = await GetCurrentSkipsUtil.run(msg, client)
  if (CurrentAmountOfSkips >= required){
      let DeleteSkipUtil = await client.Music.get("DeleteGuildSkipsUtil")
      await DeleteSkipUtil.run(msg, client)
      let requiredamountreachedembed = new Discord.MessageEmbed()
      .setTitle("**Song Skipped:**")
      .setDescription("The required amount of people needed to skip this song has been reached!")
      .setAuthor(client.user.username)
      /*
      * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
      */
      .setColor(0x00ff00)
      .setFooter("© Nexus", client.user.avatarURL)
      /*
      * Takes a Date object, defaults to current date.
      */
      .setTimestamp(new Date())
      await msg.channel.send(requiredamountreachedembed)
      await serverQueue.connection.dispatcher.end('Skipped a song!');
      return 
  }
  else{
    let GetCurrentSkipsUtil = await client.Music.get("GetCurrentSkipsUtil")
    let CurrentAmountOfSkips = await GetCurrentSkipsUtil.run(msg, client)
      let embed = new Discord.MessageEmbed()
      .setTitle("**Successfully Voted To Skip ✅**")
      .setDescription(`To skip this song there must be ${required} Skips, or a person with the DJ role must skip it.`)
      .addField(`Vote Skips:`, `${CurrentAmountOfSkips}/${required} `)
      .setAuthor(client.user.username)
      /*
      * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
      */
      .setColor(0x00ff00)
      .setFooter("© Nexus", client.user.avatarURL)
      /*
      * Takes a Date object, defaults to current date.
      */
      .setTimestamp(new Date())
      await msg.channel.send(embed);
      return 
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