//This is the offical shadow and summer discord bot, version: 2.0 {Experimental}.
const Discord = require("discord.js");
const {Events} = require('discord.js')
const mongoose = require('mongoose')
const DiscordIntents = Discord.Intents.FLAGS
const client = new Discord.Client({ 
  intents: [DiscordIntents.GUILDS, DiscordIntents.GUILD_BANS, DiscordIntents.GUILD_EMOJIS_AND_STICKERS, DiscordIntents.GUILD_VOICE_STATES, DiscordIntents.GUILD_MESSAGES, DiscordIntents.GUILD_MESSAGE_REACTIONS, DiscordIntents.DIRECT_MESSAGES],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
 });
const NexusSettings = require('./cmds/models/NexusSettings.js')
const Levels = require(`discord-xp`)
const Modules = require(`./cmds/models/Modules`)
const XpBans = require(`./cmds/models/XpBan`)
const mysql = require('mysql');
const YouTube = require("simple-youtube-api");
const {TOKEN, MongoUrl, IMGUR_API_KEY, GOOGLE_API_KEY, dblToken, webhookAuthPass, HEROKUPORT, RconSecrets} = require('./config')
//const DBL = require("dblapi.js");
try{
 // const dbl = new DBL(dblToken, { webhookPort: HEROKUPORT, webhookAuth: webhookAuthPass });
 // dbl.webhook.on('ready', hook => {
 //   console.log(`Voting webhook running!`);
 // });
 // dbl.webhook.on('vote', vote => {
//    console.log(`User with ID ${vote.user} just voted!`);
 // });
  const Rcon = require('srcds-rcon');
  exports.rcon = Rcon({
      address: RconSecrets[0],
      password: RconSecrets[1]
  });
  /*let rcon = Rcon({
    address: RconSecrets[0],
    password: RconSecrets[1]
  });*/
  /*rcon.connect().then(() => {
      console.log('connected to eclipse rcon!');
  }).catch(console.error);*/
}catch(err){
  console.log("Failed to connect to a server...")
}
/*exports.sql = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword",
  database: "mydb"
});
var sql = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword",
  database: "mydb"
});
sql.connect(function(err){
  if(err){
    return console.log("Failed to connect to mysql database. Error: " + err + ".")
  }
})*/

//exports.ForbiddenTags = []
var PREFIX = "."
exports.PREFIXMap = new Map()
exports.queue = new Map()
exports.youtube = new YouTube(GOOGLE_API_KEY);
exports.Volume = new Map()
exports.Skips = new Map()
exports.ServerIsAddingToPlaylist = new Map()
exports.LastMusicEmbedMap = new Map()
exports.Dispatcher = new Map()
exports.NexusVersion = "0.3.0 Alpha"
try{
  Levels.setURL(
    MongoUrl
  );
  mongoose.connect(MongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}catch(err){
  console.log("Failed to connect to mongodb database")
}
client.commands = new Discord.Collection();
client.Music = new Discord.Collection();
client.utilities = new Discord.Collection();
client.Nsfw = new Discord.Collection();
const fs = require("fs")
fs.readdir("./cmds/", (err, files) => {
  if(err) console.error(err);

  let jsfiles = files.filter(f => f.split(".").pop() === "js");
  if(jsfiles.length <= 0)return console.log("No Cmds to load!")
  console.log(`Loading ${jsfiles.length} cmds!`)
  jsfiles.forEach((f, i) => {
    let props = require(`./cmds/${f}`);
    client.commands.set(props.help.name, props)
  });
});
fs.readdir("./Utils/", (err, files) => {
  if(err) console.error(err);

  let jsfiles = files.filter(f => f.split(".").pop() === "js");
  if(jsfiles.length <= 0)return console.log("No utils to load!")
  console.log(`Loading ${jsfiles.length} Utils!`)
  jsfiles.forEach((f, i) => {
    let props = require(`./Utils/${f}`);
    client.utilities.set(props.help.name, props)
  });
});

fs.readdir("./cmds/Music/", (err, files) => {
  if(err) console.error(err);

  let jsfiles = files.filter(f => f.split(".").pop() === "js");
  if(jsfiles.length <= 0)return console.log("No utils to load!")
  console.log(`Loading ${jsfiles.length} Music cmds!`)
  jsfiles.forEach((f, i) => {
    let props = require(`./cmds/Music/${f}`);
    client.Music.set(props.help.name, props)
  });
});
fs.readdir("./cmds/nsfw/", (err, files) => {
  if(err) console.error(err);

  let jsfiles = files.filter(f => f.split(".").pop() === "js");
  if(jsfiles.length <= 0)return console.log("No nsfw to load!")
  console.log(`Loading ${jsfiles.length} nsfw cmds!`)
  jsfiles.forEach((f, i) => {
    let props = require(`./cmds/nsfw/${f}`);
    client.Nsfw.set(props.help.name, props)
  });
});
client.on('ready', async() => {
    console.log("Connected as " + client.user.tag)
    await client.user.setActivity(".help")
    let cmd = await client.utilities.get("MakePresetsCommand")
    let cmd2 = await client.utilities.get("LeaveAllVoiceChats")
    let cmd3 = await client.utilities.get("CheckExpiry")
    let cmd4 = await client.utilities.get("InitReactRole")

   // let EclipsePlayerCountCmd = await client.utilities.get("EclipseGetPlayersCommand")
    await cmd.run(client)
    await cmd2.run(client)
    await cmd3.run(client)
    await cmd4.run(client)
    //await EclipsePlayerCountCmd.run(client)
    //console.log(client.commands)

});

client.on("messageCreate", async receivedMessage => {
    try{
      if (receivedMessage.author.bot) return;
      if(receivedMessage.channel.type === "dm") return;
      if (!receivedMessage.guild) return;
      /*let toverifychannel = client.channels.cache.get("638477794346795028");
      if(receivedMessage.channel == toverifychannel){
        if(receivedMessage.content != ".verify"){
          if(receivedMessage.guild.id == "399299233603387392") await receivedMessage.delete()
        }
      }*/
      NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id }).exec(async function(err,CheckForSettingsdoc){
        NoNexusChannels = CheckForSettingsdoc.NoNexusChannels
        if(NoNexusChannels.length >= 1){
          if(NoNexusChannels.includes(receivedMessage.channel.id)) return;
        }
        PREFIX = CheckForSettingsdoc.Prefix
        if (receivedMessage.content.startsWith(PREFIX)) {
          await processCommand(receivedMessage);
        }
    })
  }catch(err){
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
});
    
    async function processCommand(receivedMessage) {
      try{
      let fullcommand = receivedMessage.content.substr(1);
      let splitCommand = fullcommand.split(" ");
      let primaryCommand = splitCommand[0].toLowerCase()
      let arguments = splitCommand.slice(1);
      let args = splitCommand.slice(1);
      let iarguments = receivedMessage.content.split(" ");
      member = receivedMessage.member;
      if(primaryCommand == "setup"){
        let cmd = await client.commands.get("SetupCommands")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "help") {
        let cmd = await client.commands.get("HelpCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "tag"){
        let cmd = await client.commands.get("TagCommand")
        return await cmd.run(receivedMessage, args, client) 
      }
      if(primaryCommand == "test"){
        let cmd = await client.commands.get("TestCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "updatemsg"){
        let cmd = await client.commands.get("UpdateNotifactionCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "slay"){
        let cmd = await client.commands.get("EclipseSlayCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "updatestats"){
        let cmd = await client.commands.get("UpdateStatsCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "removeall"){
        let cmd = await client.commands.get("RemoveAllCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "creeper") {
        let cmd = await client.commands.get("CreeperCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "jademraps") {
        let cmd = await client.commands.get("JademRapsCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "updatedatabase"){
        let cmd = await client.commands.get("UpdateAllDatabases")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "clear") {
        let cmd = await client.commands.get("ClearCommand")
        return await cmd.run(receivedMessage, arguments, client)
      }
      if (primaryCommand == "anal") {
        let cmd = await client.Nsfw.get("AnalCommand")
        return await cmd.run(receivedMessage, arguments, client)
      }
      if (primaryCommand == "hentai") {
        let cmd = await client.Nsfw.get("HentaiCommand")
        return await cmd.run(receivedMessage, arguments, client)
      }
      if (primaryCommand == "ass") {
        let cmd = await client.Nsfw.get("AssCommand")
        return await cmd.run(receivedMessage, arguments, client)
      }
      if (primaryCommand == "boobs") {
        let cmd = await client.Nsfw.get("BoobsCommand")
        return await cmd.run(receivedMessage, arguments, client)
      }
      if (primaryCommand == "thighs") {
        let cmd = await client.Nsfw.get("ThighCommand")
        return await cmd.run(receivedMessage, arguments, client)
      }
      if (primaryCommand == "fuck") {
        let cmd = await client.Nsfw.get("FuckCommand")
        return await cmd.run(receivedMessage, arguments, client)
      }
      if (primaryCommand == "4k") {
        let cmd = await client.Nsfw.get("4kCommand")
        return await cmd.run(receivedMessage, arguments, client)
      }
      if(primaryCommand == "verify"){
        if(receivedMessage.guild.id != "399299233603387392")return
        let cmd = await client.commands.get("VerifyCommand")
        return await cmd.run(receivedMessage, client)
      }
      if (primaryCommand == "kick") {
        let cmd = await client.commands.get("KickCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "servermemberstats" || primaryCommand == "sms") {
        let cmd = await client.commands.get("MemberCountServerStatsCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "mute") {
        let cmd = await client.commands.get("MuteCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "credits" || primaryCommand == "credit"){
        let cmd = await client.commands.get("CreditsCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "shelp") {
        let cmd = await client.commands.get("StaffHelpCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "warn") {
        let cmd = await client.commands.get("WarnCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "crash") {
        let cmd = await client.commands.get("AttemptCrash")
        return await cmd.run(receivedMessage, client)
      }
      if (primaryCommand == "history" || primaryCommand == "po") {
        let cmd = await client.commands.get("CheckWarnsCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "info"){
        let cmd = await client.commands.get("InfoCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "unmute") {
        let cmd = await client.commands.get("UnmuteCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "tempmute") {
        let cmd = await client.commands.get("TempMuteCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "ban") {
        let cmd = await client.commands.get("BanCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "d12ban") {
        let cmd = await client.commands.get("D12Ban")
        return await cmd.run(receivedMessage, args, client)
      }
     // if (primaryCommand == "tempban") {
     //   let cmd = client.commands.get("TempBanCommand")
      //  return cmd.run(receivedMessage, client)
      //}
      if (primaryCommand == "rank") {
        let cmd = await client.commands.get("RankCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "ranks") {
        let cmd = await client.commands.get("LeaderboardCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "addxp") {
        let cmd = await client.commands.get("AddXPCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "xpadd") {
        let cmd = await client.commands.get("AddXPCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "setstatus") {
        let cmd = await client.commands.get("SetStatusCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "addlevels") {
        let cmd = await client.commands.get("AddLevelsCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "removexp") {
        let cmd = await client.commands.get("RemoveXPCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "setlevel") {
        let cmd = await client.commands.get("SetLevelCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "removelevels") {
        let cmd = await client.commands.get("RemoveLevelsCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "setxp") {
        let cmd = await client.commands.get("SetXPCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "xpset") {
        let cmd = await client.commands.get("SetXPCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "guild" || primaryCommand == "g") {
        let cmd = await client.commands.get("GuildCommand")
        return await cmd.run(receivedMessage, args, client, iarguments)
      }
      if (primaryCommand == "ping") {
        let cmd = await client.commands.get("PingCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "restart"){
        let cmd = await client.commands.get("RestartCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "announce"){
        let cmd = await client.commands.get("AnnounceCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "devupdate"){
        if(receivedMessage.guild.id == "676874632078426180"){
          let cmd = await client.commands.get("DevUpdateCommand")
          return await cmd.run(receivedMessage, args, client)
        }
        else{
          let cmd = await client.commands.get("EclipseDevUpdateCommand")
          return await cmd.run(receivedMessage, args, client)
        }
      }
      if(primaryCommand == "acm"){
        let cmd = await client.commands.get("AcmCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "xpban"){
        let cmd = await client.commands.get("XPBanCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "settings"){
        let cmd = await client.commands.get("SettingsCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "version"){
          let cmd = await client.commands.get("VersionCommand")
          return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "avatar" || primaryCommand == "av"){
        let cmd = await client.commands.get("AvatarCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if (primaryCommand == "xpunban") {
        let cmd = await client.commands.get("XPUnbanCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "dog" || primaryCommand == "inu"){
        let cmd = await client.commands.get("DogImageCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "neko" || primaryCommand == "cat"){
        let cmd = await client.commands.get("CatImageCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "giveall"){
        let cmd = await client.commands.get("GiveAllCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "anime" || primaryCommand == "weeb"){
        let cmd = await client.commands.get("AnimeImageCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "hug" || primaryCommand == "cuddle"){
        let cmd = await client.commands.get("HugImageCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "kill" || primaryCommand == "murder"){
        let cmd = await client.commands.get("KillCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "suggest"){
        let cmd = await client.commands.get("EclipseSuggestionCommand")
        return await cmd.run(receivedMessage, arguments, client, primaryCommand)
      }
      if(primaryCommand == "p" || primaryCommand == "play"){
        let NoNexusChannelsCheck = await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id })
        if(NoNexusChannelsCheck.NoNexusChannels.includes(receivedMessage.channel.id)) return;
        let MusicModuleCheck = await Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id})
        if(MusicModuleCheck.music == false)return
        let cmd = await client.Music.get("PlayMusicCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "skip" || primaryCommand == "s"){
        let NoNexusChannelsCheck = await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id })
        if(NoNexusChannelsCheck.NoNexusChannels.includes(receivedMessage.channel.id)) return;
        let MusicModuleCheck = await Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id})
        if(MusicModuleCheck.music == false)return
        let cmd = await client.Music.get("SkipMusicCommand")
        return await cmd.run(receivedMessage, client)
      }
      if(primaryCommand == "clearqueue" || primaryCommand == "queueclear"){
        let NoNexusChannelsCheck = await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id })
        if(NoNexusChannelsCheck.NoNexusChannels.includes(receivedMessage.channel.id)) return;
        let MusicModuleCheck = await Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id})
        if(MusicModuleCheck.music == false)return
        let cmd = await client.Music.get("ClearQueueMusicCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "shuffle"){
        let NoNexusChannelsCheck = await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id })
        if(NoNexusChannelsCheck.NoNexusChannels.includes(receivedMessage.channel.id)) return;
        let MusicModuleCheck = await Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id})
        if(MusicModuleCheck.music == false)return
        let cmd = await client.Music.get("ShuffleMusicCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "dc" || primaryCommand == "disconnect" || primaryCommand == "stop"){
        let NoNexusChannelsCheck = await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id })
        if(NoNexusChannelsCheck.NoNexusChannels.includes(receivedMessage.channel.id)) return;
        let MusicModuleCheck = await Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id})
        if(MusicModuleCheck.music == false)return
        let cmd = await client.Music.get("DisconnectMusicCommand")
        return await cmd.run(receivedMessage, client)
      }
      if(primaryCommand == "v" || primaryCommand == "vol" || primaryCommand == "volume"){
        let NoNexusChannelsCheck = await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id })
        if(NoNexusChannelsCheck.NoNexusChannels.includes(receivedMessage.channel.id)) return;
        let MusicModuleCheck = await Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id})
        if(MusicModuleCheck.music == false)return
        let cmd = await client.Music.get("VolumeMusicCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "queue" || primaryCommand == "q"){
        let NoNexusChannelsCheck = await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id })
        if(NoNexusChannelsCheck.NoNexusChannels.includes(receivedMessage.channel.id)) return;
        let MusicModuleCheck = await Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id})
        if(MusicModuleCheck.music == false)return
        let cmd = await client.Music.get("QueueMusicCommand")
        return await cmd.run(receivedMessage, client)
      }
      if(primaryCommand == "pause"){
        let NoNexusChannelsCheck = await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id })
        if(NoNexusChannelsCheck.NoNexusChannels.includes(receivedMessage.channel.id)) return;
        let MusicModuleCheck = await Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id})
        if(MusicModuleCheck.music == false)return
        let cmd = await client.Music.get("PauseMusicCommand")
        return await cmd.run(receivedMessage, client)
      }
      if(primaryCommand == "resume"){
        let NoNexusChannelsCheck = await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id })
        if(NoNexusChannelsCheck.NoNexusChannels.includes(receivedMessage.channel.id)) return;
        let MusicModuleCheck = await Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id})
        if(MusicModuleCheck.music == false)return
        let cmd = await client.Music.get("ResumeMusicCommand")
        return await cmd.run(receivedMessage, client)
      } 
      if(primaryCommand == "poll"){
        let cmd = await client.commands.get("PollCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "secret"){
        let cmd = await client.commands.get("secretcommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "kiss" || primaryCommand == "smooch"){
        let cmd = await client.commands.get("AnimeKissCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "insult" || primaryCommand == "baka"){
        let cmd = await client.commands.get("AnimeInsultCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "pat"){
        let cmd = await client.commands.get("AnimePatCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "poke"){
        let cmd = await client.commands.get("AnimePokeCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "tickle"){
        let cmd = await client.commands.get("AnimeTickleCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      if(primaryCommand == "slap" || primaryCommand == "bad"){
        let cmd = await client.commands.get("AnimeSlapCommand")
        return await cmd.run(receivedMessage, args, client)
      }
      else{
        let TagUtil = await client.utilities.get("TagManagerUtil")
        return await TagUtil.run(receivedMessage, args, primaryCommand, client)
      }
    }catch(err){
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
    client.on("messageCreate",async receivedMessage => {
      if(receivedMessage.channel.type === "dm") return;
      if(receivedMessage.author.bot) return;
      await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id }).exec(async function(err,CheckForSettingsdoc){
        NoNexusChannels = CheckForSettingsdoc.NoNexusChannels
      if(CheckForSettingsdoc.NoNexusChannels.includes(receivedMessage.channel.id)) return;
      await Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id}).exec(async function(err,check){
        if(check.ai == false){
          return;
        }
        else{
          var args = receivedMessage.content.toLowerCase().split(" ")
          if(receivedMessage.mentions.users.has(client.user.id)){
            let cmd = await client.commands.get("AiCommand")
            return await cmd.run(receivedMessage, client)
          }
          else if(args.includes("nexus") || args.includes("nexus,") || args.includes("nexus.") || args.includes(".nexus") || args.includes(",nexus") || args.includes("!nexus") || args.includes("nexus!") || args.includes("nexus?")|| args.includes("?nexus")){
            let cmd = await client.commands.get("AiCommand")
            return await cmd.run(receivedMessage, client)
          }
          else{
            return
          }
        }
      })
    })
    });


/**
 * let PremiumWarningEmbed =  new Discord.MessageEmbed()
    .setTitle("**💳  Shuffling will become a premium-only feature soon.**")
    .setDescription("**The premium charge of only £10 a year helps us to keep developing the bot, and also helps pay for hosting!**")
    .addField("How do I get Nexus Premium?", "You can buy Nexus Premium [here](https://nexus.orzi.tv)")
    .setAuthor(client.user.username)
    .setColor(0xFF8C00)
    .setTimestamp(new Date())
    msg.channel.send(PremiumWarningEmbed) 
 */


client.on("messageCreate", async receivedMessage => {
  try{
  if(receivedMessage.channel.type === "dm") return;
  if (receivedMessage.author.bot) return;
  let cmd = await client.commands.get("XPGain")
  let AutoRolesCmd = await client.utilities.get("LevelAutoRoles")
  await AutoRolesCmd.run(receivedMessage, client)
  return await cmd.run(receivedMessage, client)
}catch(err){
  let botlogschannel = await client.channels.cache.get("873587394224459818");
  let DevErrorEmbed =  new Discord.MessageEmbed()
  .setTitle("**An error has occurred! ❌**")
  .setDescription("**"+ err + "**\n\n" + err.stack)
  .setAuthor(client.user.username)
  .setColor(0xFF0000)
  .setTimestamp(new Date())
  await botlogschannel.send({ embeds: [DevErrorEmbed]})
}
}) 
  
client.on("messageCreate", async receivedMessage => {
  try{
  if(receivedMessage.channel.type === "dm") return;
  if (receivedMessage.author.bot) return;
  if (!receivedMessage.member.user.tag)return;
  let cmd = await client.utilities.get("MsgLogs")
  return await cmd.run(receivedMessage, client)
}catch(err){
  let botlogschannel = await client.channels.cache.get("873587394224459818");
  let DevErrorEmbed =  new Discord.MessageEmbed()
  .setTitle("**An error has occurred! ❌**")
  .setDescription("**"+ err + "**\n\n" + err.stack)
  .setAuthor(client.user.username)
  .setColor(0xFF0000)
  .setTimestamp(new Date())
  await botlogschannel.send({ embeds: [DevErrorEmbed]})
}
})
client.on("guildDelete",async (guild) => {
  try{
  let cmd = await client.utilities.get("DeletePresetsCommand")
  return await cmd.run(guild, client)
  }catch(err){
    let botlogschannel = await client.channels.cache.get("873587394224459818");
    let DevErrorEmbed =  new Discord.MessageEmbed()
    .setTitle("**An error has occurred! ❌**")
    .setDescription("**"+ err + "**\n\n" + err.stack)
    .setAuthor(client.user.username)
    .setColor(0xFF0000)
    .setTimestamp(new Date())
    await botlogschannel.send({ embeds: [DevErrorEmbed]})
  }
})
client.on("guildCreate",async(guild) => {
  try{
  let cmd = await client.utilities.get("BotAddedToGuild")
  return await cmd.run(guild, client)
}catch(err){
  let botlogschannel = await client.channels.cache.get("873587394224459818");
  let DevErrorEmbed =  new Discord.MessageEmbed()
  .setTitle("**An error has occurred! ❌**")
  .setDescription("**"+ err + "**\n\n" + err.stack)
  .setAuthor(client.user.username)
  .setColor(0xFF0000)
  .setTimestamp(new Date())
  await botlogschannel.send({ embeds: [DevErrorEmbed]})
}
})

client.on('voiceStateUpdate', async(oldMember, newMember) => {
  try{

  let cmd = await client.utilities.get("VoiceChannelUpdates")
  if(oldMember.id == client.user.id)return
  return await cmd.run(oldMember, newMember, client)
}catch(err){
  let botlogschannel = await client.channels.cache.get("873587394224459818");
  let DevErrorEmbed =  new Discord.MessageEmbed()
  .setTitle("**An error has occurred! ❌**")
  .setDescription("**"+ err + "**\n\n" + err.stack)
  .setAuthor(client.user.username)
  .setColor(0xFF0000)
  .setTimestamp(new Date())
  await botlogschannel.send({ embeds: [DevErrorEmbed]})
}
})

client.on('guildMemberAdd', async (guildMember) => {
  try{
  if(guildMember.guild.id == "657711363879337984"){
    ///let cmd = await client.utilities.get("EclipseUserJoinCommand")
   // let cmd2 = await client.utilities.get("EclipseUserCountCommand")
    let AutoRolesCmd = await client.utilities.get("AutoRoles")
    await cmd.run(guildMember, client)
    await AutoRolesCmd.run(guildMember, client)
    return await cmd2.run(guildMember, client)
  }
  else{
    let cmd = await client.utilities.get("MemberJoinCommand")
    let AutoRolesCmd = await client.utilities.get("AutoRoles")
    await AutoRolesCmd.run(guildMember, client)
    return await cmd.run(guildMember, client)
  }
}catch(err){
  let botlogschannel = await client.channels.cache.get("873587394224459818");
  let DevErrorEmbed =  new Discord.MessageEmbed()
  .setTitle("**An error has occurred! ❌**")
  .setDescription("**"+ err + "**\n\n" + err.stack)
  .setAuthor(client.user.username)
  .setColor(0xFF0000)
  .setTimestamp(new Date())
  await botlogschannel.send({ embeds: [DevErrorEmbed]})
}
})

client.on("guildMemberRemove",async(member) => {
  try{
    if(member.guild.id == "657711363879337984"){
    //  let cmd = await client.utilities.get("MemberLeaveCommand")
    //  let cmd2 = await client.utilities.get("EclipseUserCountCommand")
      await cmd.run(member, client)
      return await cmd2.run(member, client)
    }
    else{
      let cmd = await client.utilities.get("MemberLeaveCommand")
      return await cmd.run(member, client)
    }
  }catch(err){
    let botlogschannel = await client.channels.cache.get("873587394224459818");
    let DevErrorEmbed =  new Discord.MessageEmbed()
    .setTitle("**An error has occurred! ❌**")
    .setDescription("**"+ err + "**\n\n" + err.stack)
    .setAuthor(client.user.username)
    .setColor(0xFF0000)
    .setTimestamp(new Date())
    await botlogschannel.send({ embeds: [DevErrorEmbed]})
  }
})
client.on('messageReactionAdd', async (reaction, member) => {
    let cmd = await client.utilities.get("GiveReactRole")
    return await cmd.run(member, client, reaction)
});

try{
  console.log("Logging in...")
  client.login(TOKEN)
}catch(err){
  console.log("Failed to log on.")
}