const Discord = require("discord.js");
const Util = require(`discord.js`)
const Levels = require("discord-xp")
var client
const discordvoice = require("@discordjs/voice");
const Modules = require(`../models/Modules.js`)
const NexusSettings = require(`../models/NexusSettings`)
const XpBans = require(`../models/XpBan`)
const ytdl = require("ytdl-core");
var {PREFIXMap, NexusVersion, queue, Dispatcher, LastMusicEmbedMap} = require(`../../core-nexus`)
var PREFIX = "."
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []
module.exports.run = async (video, msg, voiceChannel, playlist, Client) => {
  client = Client
  PREFIXToSet = await PREFIXMap.get(msg.guild.id)
  if(!PREFIXToSet){
    PREFIX = "."
  }
  else{
    PREFIX = PREFIXToSet.GuildPrefix
  }
  try{
    console.log("handle video ran.")
    await handleVideo(video, msg, voiceChannel, playlist)
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
    name: "HandleMusic"
}




async function handleVideo(video, msg, voiceChannel, playlist) {
    const serverQueue = await queue.get(msg.guild.id);
    try{
    //console.log(video.duration)
    if(video.duration.hours <= 9){
      songduartionhours = "0" + video.duration.hours
    }
    else{
      songduartionhours = video.duration.hours
    }
    if(video.duration.minutes <= 9){
      songduartionminutes = "0" + video.duration.minutes
    }
    else{
      songduartionminutes = video.duration.minutes
    }
    if(video.duration.seconds <= 9){
      songduartionseconds = "0" + video.duration.seconds
    }
    else{
      songduartionseconds = video.duration.seconds
    }
    songduration = songduartionhours + ":" + songduartionminutes + ":" + songduartionseconds
    if(video.duration.hours == 0){
      songduration = songduartionminutes + ":" + songduartionseconds
    }
    let SongHoursInSeconds = video.duration.hours * 3600
    let SongMinutesInSeconds = video.duration.minutes * 60
    const song = {
      id: video.id,
      title: Discord.Util.escapeMarkdown(video.title),
      url: `https://www.youtube.com/watch?v=${video.id}`,
      requestedby: msg.member.user.tag,
      duration: songduration,
      durationinseconds: SongHoursInSeconds + SongMinutesInSeconds + video.duration.seconds
    };
    if (!serverQueue) {
      const queueConstruct = {
        textChannel: msg.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 1,
        playing: true
      };
      queue.set(msg.guild.id, queueConstruct);
  
      queueConstruct.songs.push(song);
  
      try {

        var connection = discordvoice.joinVoiceChannel(
        {
            channelId: voiceChannel.id,
            guildId: msg.guild.id,
            adapterCreator: msg.guild.voiceAdapterCreator
        });
        queueConstruct.connection = connection;
        play(msg.guild, queueConstruct.songs[0], msg);
      } catch (error) {
        console.error(`I could not join the voice channel: ${error}`);
        queue.delete(msg.guild.id);
        return await msg.channel.send(`I could not join the voice channel: ${error}`);
      }
    } else {
      serverQueue.songs.push(song);
      songtitle = song.title;
      if (playlist) return console.log("Its a playlist!");
      else
        return await msg.channel.send({
          embed: {
            color: 3447003,
            author: {
              name: client.user.username,
              icon_url: client.user.avatarURL
            },
            title: "Added to music queue!",
            url: "http://google.com",
            description: "✅ Your song has been added to the queue!",
          fields: [{
              name: "Song:",
              value: (song.title + "\n" + song.url)
            },],
            timestamp: new Date(),
            footer: {
              icon_url: client.user.avatarURL,
              text: "© Nexus music"
            }
          }
        });
    }
  }catch(err){
    return console.log(err)
  }
  }
  
  async function play(guild, song, msg) {
    try{
      var serverQueue = await queue.get(guild.id);
      console.log(song)
    if (!song) {
      //return queue.delete(guild.id);
      setTimeout(async() => {
        serverQueue = await queue.get(guild.id);
        if(!serverQueue){
          if(!guild.me.voiceChannel)return
          try{
            await guild.me.voiceChannel.leave();
          }catch(err){
            return console.log("No voice channel to leave")
          }
            return;
        }
        else{
          return;
        }
      }, 300000)
      return
    }
    if(!serverQueue)return
   // console.log(serverQueue)
  const stream = ytdl(song.url, {
    filter: "audioonly"
  });
  const player = discordvoice.createAudioPlayer();
  const resource = discordvoice.createAudioResource(stream);
  await player.play(resource)
		  /*.on('end',async reason => {
        if (reason === 'Stream is not generating quickly enough.') console.log('Song ended due to stream not generating quickly enough.');
        else console.log(reason);
        console.log("Song ended")
        await serverQueue.songs.shift();
        serverQueue.playing = true;
        if(serverQueue.songs.length <= 0){
          serverQueue.volume = 1;
          let SetVolumeUtil = await client.Music.get("SetVolumeUtil")
          await SetVolumeUtil.run(guild, 1, client)
        }
        play(guild, serverQueue.songs[0]);
      })
      .on('error',async error => console.error(error));*/
      serverQueue.connection.dispatcher = serverQueue.connection.subscribe(player)
      let GetVolumeUtil = await client.Music.get("GetVolumeUtil")
      let SavedQueueVolume = await GetVolumeUtil.run(guild, client)
      console.log(SavedQueueVolume)
      //await player.setVolumeLogarithmic(SavedQueueVolume / 3);
      let DeleteGuildSkipsUtil = await client.Music.get("DeleteGuildSkipsUtil")
      await DeleteGuildSkipsUtil.run(guild, client)
      var CleanMessagesEnabled
      await Modules.findOne({Type: "Modules", GuildId: guild.id}).exec(async function(err,check){
      CleanMessagesEnabled = check.cleanermusicmessages
      if(CleanMessagesEnabled == true){
        let musicEmbed = new Discord.MessageEmbed()
        .setTitle("Now Playing... 🎶")
        .setURL(song.url)  
        .setThumbnail("https://img.youtube.com/vi/" + song.id + "/hqdefault.jpg") 
        .addField("Song:", song.title)
        .setDescription(`Song duration: \`${song.duration}\`. Requested by: \`${song.requestedby}.\`\n\n`) 
        .setTimestamp(new Date()) 
        .setFooter("© Nexus music")
        .setAuthor(client.user.tag, client.user.avatarURL)
        let GetLastMusicUtil = await client.Music.get("GetLastMusicEmbedUtil")
        let LastMusicEmbed = await GetLastMusicUtil.run(guild, client)
        //console.log(LastMusicEmbed)
        if(LastMusicEmbed){
          await LastMusicEmbed.delete()
          await LastMusicEmbedMap.get(guild.id)
          await LastMusicEmbedMap.delete(guild.id) 
        }
        LastMusicEmbed = await serverQueue.textChannel.send({embeds: [musicEmbed]})
        let AddLastMusicUtil = await client.Music.get("AddLastMusicEmbedUtil")
        await AddLastMusicUtil.run(LastMusicEmbed, guild, serverQueue.textChannel)
      }
      else{
        await serverQueue.textChannel.send({
          embed: {
            color: 3447003,
            author: {
              name: client.user.username,
              icon_url: client.user.avatarURL
            },
            title: "Playing music!",
            url: "http://google.com",
            description: "Now playing music! 🎶",
          fields: [{
            name: "Song:",
            value: (song.title + "\n" + song.url) 
                },],
            timestamp: new Date(),
            footer: {
              icon_url: client.user.avatarURL,
              text: "© Nexus music"
            }
          }
        });
      }
    })
  }catch(err){
    console.log(err)
    let botlogschannel = await client.channels.cache.get("873587394224459818");
    let DevErrorEmbed =  new Discord.MessageEmbed()
    .setTitle("**An error has occurred! ❌**")
    .setDescription("**"+ err + "**\n\n" + err.stack)
    .setAuthor(client.user.username)
    .setColor(0xFF0000)
    .setTimestamp(new Date())
    return await botlogschannel.send({embeds: [DevErrorEmbed]})
  }
  }

  ///await serverQueue.connection.dispatcher.resume();