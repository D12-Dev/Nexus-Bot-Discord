const Discord = require("discord.js");
const Levels = require("discord-xp")
var client
const Modules = require(`../models/Modules.js`)
const NexusSettings = require(`../models/NexusSettings`)
const XpBans = require(`../models/XpBan`)
var {PREFIXMap, NexusVersion, ServerIsAddingToPlaylist, youtube} = require(`../../core-nexus`)
const {GOOGLE_API_KEY, TOKEN, IMGUR_API_KEY, MongoUrl} = require('../../config')
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
    console.log("play command ran.")
    await PlayMusic(receivedMessage, args)
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
    name: "PlayMusicCommand"
}

async function PlayMusic(msg, args){
    let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL"]
    let answer = await MakeMissingPermsEmbed(RequiredPerms, msg)
    if(answer != true){
      try{
        return await msg.author.send(answer)
      }catch(err){
        return
      }
    }
    const voiceChannel = await msg.member.voice.channel;
    //console.log(voiceChannel)
    if (!voiceChannel)
      return await msg.channel.send(
        "I'm sorry but you need to be in a voice channel to play music!"
      );
    const permissions = await voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT")) {
      return await msg.channel.send(
        "I cannot connect to your voice channel, make sure I have the proper permissions!"
      );
    }
    if (!permissions.has("SPEAK")) {
      return await msg.channel.send(
        "I cannot speak in this voice channel, make sure I have the proper permissions!"
      );
    }
    let guild = await msg.guild;
    if (guild.me.voiceChannelID != undefined){
      if (msg.member.voiceChannel.id != guild.me.voiceChannelID){
        let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL"]
        let answer = await MakeMissingPermsEmbed(RequiredPerms, msg)
        if(answer != true){
          try{return await receivedMessage.author.send({embeds: [answer]})
      }catch(err){
        return
      }
        }
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
    const searchString = await args.join(" ");
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
      let HandleVideo = await client.Music.get("HandleMusic")
      for (const video of Object.values(videos)) {
        let ServerIsAddingPlaylists = await ServerIsAddingToPlaylist.get(msg.guild.id)
        ServerIsAddingPlaylists.Adding = true
        try { 
          const video2 = await youtube.getVideoByID(video.id);
          await HandleVideo.run(video2, msg, voiceChannel, true, client)
         // await handleVideo(video2, msg, voiceChannel, true, client); 
        }catch(err){ 
          console.log("Could not get a video!") 
        }
      }
      let playlistAddedEmbed = new Discord.MessageEmbed()
      .setTitle("**Playlist Added ✅**")
      .setDescription(`Playlist \"**${playlist.title}**\" was successfully added.`)
      .setAuthor(client.user.username)
      .setColor(0x00ff00)
      .setFooter("© Nexus", client.user.avatarURL)
      .setTimestamp(new Date())
      await msg.channel.send(playlistAddedEmbed);
      let AddingtoPlaylist = await ServerIsAddingToPlaylist.get(msg.guild.id)
      return AddingtoPlaylist.Adding = false
    } else {
      try {
        var video = await youtube.getVideo(url);
      } catch (error) {
        if(error === "Error: resource youtube#videoListResponse not found"){
          return await msg.channel.send("Could not get video, please check if it is privated!")
        }
        try {
          var videos = await youtube.searchVideos(searchString, 10);
          let index = 0;
          if(videos.length == 0){
            return await msg.channel.send("🆘 I could not obtain any search results.")
          }
          let videoselectembed = new Discord.MessageEmbed()
            .setTitle("__**Song selection:**__")
            videos.forEach(video2 => videoselectembed.addField("⠀⠀⠀" , `**${++index} -** ${video2.title}`));
            videoselectembed.addField("⠀⠀⠀⠀⠀⠀⠀⠀" , `**Please provide a value to select one of the search results ranging from 1-${videos.length}.**`)
            videoselectembed.setColor(0x0080ff)
          videoselectembed = await msg.channel.send({embeds: [videoselectembed]});
         // let videoselectembedid = videoselectembed.id
          // eslint-disable-next-line max-depth
          try {
            console.log(videos.length)
            let Filter = (msg2) => msg2.content > 0 && msg2.content < (videos.length + 1)
            var response = await msg.channel.awaitMessages({filter: Filter, max: 1, time: 10000, errors: ["time"]});
          } catch (err) {
            console.error(err);
            return await msg.channel.send(
              "No or invalid value entered, cancelling video selection." 
            );
          }
          //console.log(response)
          const videoIndex = parseInt(response.first().content);
          var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
        } catch (err) {
          console.error(err);
          return await msg.channel.send("🆘 I could not obtain any search results.");
        }
      }
      let HandleVideo = await client.Music.get("HandleMusic")
      return HandleVideo.run(video, msg, voiceChannel, false, client)//handleVideo(video, msg, voiceChannel);
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