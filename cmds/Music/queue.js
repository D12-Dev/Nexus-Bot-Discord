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
module.exports.run = async (msg, Client) => {
  client = Client
  PREFIXToSet = await PREFIXMap.get(msg.guild.id)
  if(!PREFIXToSet){
    PREFIX = "."
  }
  else{
    PREFIX = PREFIXToSet.GuildPrefix
  }
  try{
    console.log("queue command ran.")
    await QueueCommand(msg)
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
    name: "QueueMusicCommand"
}





async function QueueCommand(msg){
    let serverQueue = queue.get(msg.guild.id)
    let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL", "ADD_REACTIONS", "MANAGE_MESSAGES"]
    let answer = await MakeMissingPermsEmbed(RequiredPerms, msg)
    let QueueEmbedArray = []
    if(answer != true){
      try{
      return await msg.author.send(answer)
    }catch(err){
      return
    }
    }
      if (!serverQueue) return await msg.channel.send('There is nothing playing.');
      var Index = 0
      await serverQueue.songs.forEach(async(song) => {
        QueueEmbedArray.push(`[${song.title}](${song.url})` + "\n`" + song.duration  + "`Requested by `" + song.requestedby + "`")
        Index = Index + 1
      })
      
      let queueembed = new Discord.MessageEmbed()
      .setAuthor(`Song queue for ${msg.guild.name}:`)
      .setDescription(`__Now playing:__\n` + `[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})` + "\n`" + serverQueue.songs[0].duration  + "`Requested by `" + serverQueue.songs[0].requestedby + "`\n\n__Up next:__\n")
      .setFooter("© Nexus", client.user.avatarURL)
      .setColor(0xFF69B4)
      var SongIndex
      var NoSongsAfter = false
      if(serverQueue.songs.length == 1){
        NoSongsAfter = true
        queueembed.addField("⠀", "There are no songs after the one playing! Request some more...")
      }
      else if(serverQueue.songs.length <= 10){
        for (SongIndex = 0; SongIndex < serverQueue.songs.length - 1; SongIndex++) {
          queueembed.addField("⠀", `[${serverQueue.songs[SongIndex + 1].title}](${serverQueue.songs[SongIndex + 1].url})` + "\n`" + serverQueue.songs[SongIndex + 1].duration  + "`Requested by `" + serverQueue.songs[SongIndex + 1].requestedby + "`")
        }
      }
      else{
        for (SongIndex = 0; SongIndex < 9; SongIndex++) {
          queueembed.addField("⠀", `[${serverQueue.songs[SongIndex + 1].title}](${serverQueue.songs[SongIndex + 1].url})` + "\n`" + serverQueue.songs[SongIndex + 1].duration  + "`Requested by `" + serverQueue.songs[SongIndex + 1].requestedby + "`")
        }
      }

      if(NoSongsAfter == true){
        queueembed.addBlankField()
      }
      var totaldurationinseconds = 0
      var totaldurationinminutes = 0
      var totaldurationinhours = 0
      var SongDurationIndex
      for (SongDurationIndex = 0; SongDurationIndex < serverQueue.songs.length; SongDurationIndex++) {
        totaldurationinseconds = totaldurationinseconds + serverQueue.songs[SongDurationIndex].durationinseconds
      }
      totaldurationinminutes = Math.floor(totaldurationinseconds / 60)
      totaldurationinminutesinseconds = totaldurationinminutes * 60
      aftertotaldurationinseconds = totaldurationinseconds - totaldurationinminutesinseconds
      totaldurationinhours = Math.floor(totaldurationinminutes / 60)
      aftertotaldurationinminutes = totaldurationinminutes - (totaldurationinhours * 60)
      if(aftertotaldurationinseconds <= 9){
        aftertotaldurationinseconds = "0" + aftertotaldurationinseconds
      }
      if(aftertotaldurationinminutes <= 9){
        aftertotaldurationinminutes = "0" + aftertotaldurationinminutes
      }
      if(totaldurationinhours <= 9){
        totaldurationinhours = "0" + totaldurationinhours
      }
      totalduration = totaldurationinhours + ":" + aftertotaldurationinminutes +":" + aftertotaldurationinseconds
      if(totaldurationinhours == 0){
        totalduration = totaldurationinminutes +":" + aftertotaldurationinseconds
      }
      queueembed.addField(serverQueue.songs.length + " songs in queue| " + totalduration , "**Press the arrows to scroll through the queue!**")
      var MusicQueeuEmbed = await msg.channel.send(queueembed)
      await MusicQueeuEmbed.react('⬅️')
      .then(async() => await MusicQueeuEmbed.react('➡️'))
      .then(async() => await MusicQueeuEmbed.react('🚫'))
      ////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////
      var PageNumber = 1
      var MaxPageNumber = Math.ceil(serverQueue.songs.length / 10)
      var QueueNumber = 1
      const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅️' && user.id === msg.author.id;
      const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡️' && user.id === msg.author.id;
      const deleteFilter = (reaction, user) => reaction.emoji.name === '🚫' && user.id === msg.author.id;
      const backwards = await MusicQueeuEmbed.createReactionCollector(backwardsFilter, {time: 100000});
      const forwards = await MusicQueeuEmbed.createReactionCollector(forwardsFilter, {time: 100000});
      const Delete = await MusicQueeuEmbed.createReactionCollector(deleteFilter, {time: 100000});
      await backwards.on('collect',async r => {
        if(PageNumber == 1)return console.log("On Min page")
        if(PageNumber == 2){
          PageNumber = PageNumber - 1
          return await MusicQueeuEmbed.edit(queueembed)
        }
        let PreviousPageNum = PageNumber
        if(PageNumber != MaxPageNumber){
          QueueNumber = QueueNumber - ((10 * 2))
        }
        PageNumber = PageNumber - 1
        let TurnPageEmbed = new Discord.MessageEmbed()
        .setAuthor(`Song queue for ${msg.guild.name}:`)
        .setFooter("© Nexus", client.user.avatarURL)
        .setColor(0xFF69B4)
        if(PreviousPageNum * 10 >= QueueEmbedArray.length){
          QueueNumberOnLastPage = QueueEmbedArray.length - ((MaxPageNumber - 1)* 10)
          QueueNumber = QueueNumber - (10 +  QueueNumberOnLastPage)
          index = ((PageNumber - 1) * 10)
          var i = 0
          while(i < 10){
            TurnPageEmbed.addField(`⠀`, QueueEmbedArray[index + i])
            QueueNumber = QueueNumber + 1
            i = i +1
          }
          await MusicQueeuEmbed.edit(TurnPageEmbed)
        }
        else{
          var i = 0
          index = ((PageNumber - 1) * 10)
          while(i < 10){
            TurnPageEmbed.addField(`⠀`, QueueEmbedArray[index + i])
            QueueNumber = QueueNumber + 1
            i = i +1
          }
          await MusicQueeuEmbed.edit(TurnPageEmbed)
        }
      })
      await forwards.on('collect',async r => {
        if(PageNumber == MaxPageNumber)return //console.log("On max page")
        PageNumber = PageNumber + 1
        let TurnPageEmbed = new Discord.MessageEmbed()
        .setAuthor(`Song queue for ${msg.guild.name}:`)
        .setFooter("© Nexus", client.user.avatarURL)
        .setColor(0xFF69B4)
        if(PageNumber * 10 >= QueueEmbedArray.length){
          index = ((PageNumber - 1) * 10)
          var i = 0
          while(i < QueueEmbedArray.length - ((PageNumber - 1) * 10)){
            TurnPageEmbed.addField(`⠀`, QueueEmbedArray[index + i])
            QueueNumber = QueueNumber + 1
            i = i +1
          }
          await MusicQueeuEmbed.edit(TurnPageEmbed)
        }
        else{
          index = ((PageNumber - 1) * 10)
          var i = 0
          while(i < 10){
            TurnPageEmbed.addField(`⠀`, QueueEmbedArray[index + i])
            QueueNumber = QueueNumber + 1
            i = i +1
          }
          await MusicQueeuEmbed.edit(TurnPageEmbed)
        }
      })
      await Delete.on('collect',async r => {
        try{
          await MusicQueeuEmbed.delete()
          await msg.delete()
        }catch(err){
          return
        }
      })
      ///////////////////////////////////////////////////////////
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