const Discord = require("discord.js");
const Levels = require("discord-xp")
var client
const Modules = require(`../models/Modules.js`)
const NexusSettings = require(`../models/NexusSettings`)
const XpBans = require(`../models/XpBan`)
var {PREFIXMap, NexusVersion, ServerIsAddingToPlaylist, queue, youtube} = require(`../../core-nexus`)
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
    console.log("shuffle command ran.")
    await ShuffleHandler(receivedMessage, args)
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
    name: "ShuffleMusicCommand"
}
async function ShuffleHandler(msg, args){
    let PremiumWarningEmbed =  new Discord.MessageEmbed()
    .setTitle("**💳  Shuffling will become a premium-only feature soon.**")
    .setDescription("**The premium charge of only £10 a year helps us to keep developing the bot, and also helps pay for hosting!**")
    .addField("How do I get Nexus Premium?", "You can buy Nexus Premium [here](https://nexus.orzi.tv)")
    .setAuthor(client.user.username)
    .setColor(0xFF8C00)
    .setTimestamp(new Date())
    await msg.channel.send(PremiumWarningEmbed)
    let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL"]
    let answer = await MakeMissingPermsEmbed(RequiredPerms, msg)
    if(answer != true){
      try{
        return await msg.author.send(answer)
      }catch(err){
        return
      }
    }
    if(!args[0]){
      let conditon = 1
      return await ShuffleFunc(msg, conditon)
    }
    const voiceChannel = await msg.member.voice.channel;
      if (!voiceChannel)
        return await msg.channel.send(
          "I'm sorry but you need to be in a voice channel to play music!"
        );
      const permissions = await voiceChannel.permissionsFor(msg.client.user);
      if (!permissions.has("CONNECT")) {
        return msg.channel.send(
          "I cannot connect to your voice channel, make sure I have the proper permissions!"
        );
      }
      if (!permissions.has("SPEAK")) {
        return msg.channel.send(
          "I cannot speak in this voice channel, make sure I have the proper permissions!"
        );
      }
      let guild = await msg.guild;
      if (guild.me.voiceChannelID != undefined){
        if (msg.member.voiceChannel.id != guild.me.voiceChannelID){
            let notinavoicechannelwithbotembed = new Discord.MessageEmbed()
            .setTitle("**Cannot play song!❌**")
            .setDescription("You are not in the same voicechannel as the bot!\nCurrent channel: " + guild.me.voiceChannel)
            .setAuthor(client.user.username)
            .setColor(0xff0000)
            .setFooter("© Nexus", client.user.avatarURL)
            .setTimestamp(new Date())
            return await msg.channel.send(notinavoicechannelwithbotembed)
          }
      }
      const searchString = await args.slice(1).join(" ");
      const url = await args[0] ? args[0].replace(/<(.+)>/g, "$1") : "";
      if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
        let AddingPlaylist = await ServerIsAddingToPlaylist.get(msg.guild.id)
        if (!AddingPlaylist) {
          const AddingPlaylistConstruct = {
            Adding: true,
          };
        ServerIsAddingToPlaylist.set(msg.guild.id, AddingPlaylistConstruct);
        }
        const playlist = await youtube.getPlaylist(url);
        const videos = await playlist.getVideos();
        const ArrayOfVideosToShuffle = []
        for (const video of Object.values(videos)) {
          let ServerIsAddingPlaylists = await ServerIsAddingToPlaylist.get(msg.guild.id)
          ServerIsAddingPlaylists.Adding = true
          ArrayOfVideosToShuffle.push(video.id)
        }
        var x;
        var ShuffledVideoArray = await ShuffleArray(ArrayOfVideosToShuffle)
        let HandleVideo = await client.Music.get("HandleMusic")
        for(var x = 0;x < ShuffledVideoArray.length;x++){
          try { 
            const video2 = await youtube.getVideoByID(ShuffledVideoArray[x]);
            //await handleVideo(video2, msg, voiceChannel, true); 
            await HandleVideo.run(video2, msg, voiceChannel, true, client)

          }catch(err){ 
            console.log("Could not get a video!") 
          }
        }
        await msg.channel.send(`✅ Playlist: **${playlist.title}** has been added to the queue and shuffled!`);
        let AddingtoPlaylist = await ServerIsAddingToPlaylist.get(msg.guild.id)
        return AddingtoPlaylist.Adding = false
      } else {
        return await msg.channel.send("To shuffle there must either already be songs in the queue or you must request a playlist. Usage: .shuffle <playlist>")
      }
    }









async function ShuffleFunc(msg, conditon){
    const serverQueue = await queue.get(msg.guild.id);
    const StillAddingPlaylist = await ServerIsAddingToPlaylist.get(msg.guild.id)
    if(conditon == 1){
    if(!StillAddingPlaylist){
      if(!serverQueue)return await msg.channel.send("There are no songs to shuffle!")
      if(!msg.member.roles.some(r=>["DJ"].includes(r.name)) ){
        if(!serverQueue){
            let nosongqueuedembed = new Discord.MessageEmbed()
            .setTitle("Cannot clear queue! ❌")
            .setDescription("There are no songs to clear!")
            .setColor(0xFF0000)
          return await msg.channel.send(nosongqueuedembed)
        }
        return await msg.channel.send("You do not have permisson to use this command. You must have the `DJ` role!")
      }
      var i;
      for(var i = 0;i < serverQueue.songs.length; i++){
        if(i == 0){

        }
        else{
          let RandomIndex = 0;
          let serverQueue = await queue.get(msg.guild.id);
          let x = true 
          while(x == true){
            RandomIndex = Math.floor(Math.random() * serverQueue.songs.length)
            if(RandomIndex == 0){
            }
            else{
              break
            }
          } 
          let TempValue = serverQueue.songs[i]
          serverQueue.songs[i] = serverQueue.songs[RandomIndex]
          serverQueue.songs[RandomIndex] = TempValue
        }
      }
      return await msg.channel.send("Shuffled the queue!")
      }
      if(StillAddingPlaylist.Adding == true){
        let StillAddingPlaylists = new Discord.MessageEmbed()
        .setTitle("**Couldn't Shuffle The Server Queue!** ❌")
        .setDescription("**There are still videos being requested from a playlist, please try again in approximately 15 seconds.**")
        .setColor(0xff0000)
        return await msg.channel.send(StillAddingPlaylists);
      }
      if(StillAddingPlaylist.Adding == false){
        if(!serverQueue)return msg.channel.send("There are no songs to shuffle!")
        if(!msg.member.roles.some(r=>["DJ"].includes(r.name)) ){
          if(!serverQueue){
              let nosongqueuedembed = new Discord.MessageEmbed()
              .setTitle("Cannot clear queue! ❌")
              .setDescription("There are no songs to clear!")
              .setColor(0xFF0000)
            return await msg.channel.send(nosongqueuedembed)
          }
          return await msg.channel.send("You do not have permisson to use this command. You must have the `DJ` role!")
        }
        var i;
        for(var i = 0;i < serverQueue.songs.length; i++){
          if(i == 0){

          }
          else{
            let RandomIndex = 0;
            let serverQueue = await queue.get(msg.guild.id);
            let x = true 
            while(x == true){
              RandomIndex = Math.floor(Math.random() * serverQueue.songs.length)
              if(RandomIndex == 0){
              }
              else{
                break
              }
            } 
            let TempValue = serverQueue.songs[i]
            serverQueue.songs[i] = serverQueue.songs[RandomIndex]
            serverQueue.songs[RandomIndex] = TempValue
          }
        }
        return await msg.channel.send("Shuffled the queue!")
      }
  }
  else if(conditon == 2){
    const serverQueue = await queue.get(msg.guild.id);
    const StillAddingPlaylist = await ServerIsAddingToPlaylist.get(msg.guild.id)
    var i;
    if(!serverQueue)return
    if(!StillAddingPlaylist){
      for(var i = 0;i < serverQueue.songs.length; i++){
        if(i == 0){

        }
        else{
          let RandomIndex = 0;
          let serverQueue = await queue.get(msg.guild.id);
          let x = true 
          while(x == true){
            RandomIndex = Math.floor(Math.random() * serverQueue.songs.length)
            if(RandomIndex == 0){
            }
            else{
              break
            }
          } 
          let TempValue = serverQueue.songs[i]
          serverQueue.songs[i] = serverQueue.songs[RandomIndex]
          serverQueue.songs[RandomIndex] = TempValue
        }
      }
      return
    }
    if(StillAddingPlaylist.Adding == false){
      for(var i = 0;i < serverQueue.songs.length; i++){
        if(i == 0){

        }
        else{
          let RandomIndex = 0;
          let serverQueue = await queue.get(msg.guild.id);
          let x = true 
          while(x == true){
            RandomIndex = Math.floor(Math.random() * serverQueue.songs.length)
            if(RandomIndex == 0){
            }
            else{
              break
            }
          } 
          let TempValue = serverQueue.songs[i]
          serverQueue.songs[i] = serverQueue.songs[RandomIndex]
          serverQueue.songs[RandomIndex] = TempValue
        }
      }
      return
    }
    if(StillAddingPlaylist.Adding == true)return
  }
  else{
    return console.log("[Shuffle Error] An error whilst shuffling songs has occured!")
  }
}
async function ShuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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