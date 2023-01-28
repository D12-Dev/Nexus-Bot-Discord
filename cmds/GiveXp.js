const Discord = require("discord.js");
var client
const Levels = require(`discord-xp`)
const Modules = require(`./models/Modules.js`)
const NexusSettings = require(`./models/NexusSettings`)
const XpBans = require(`./models/XpBan`)
const Suggestions = require(`./models/suggestions`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
var PREFIX = "."
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []
var XPMultiplier = 0.5
var CoolDowns = new Map()
///Fixed xpmultiplier
module.exports.run = async (receivedMessage, Client) => {
  client = Client
  GetPREFIX = await PREFIXMap.get(receivedMessage.guild.id)
  if(!GetPREFIX){
    PREFIX = "."
  }
  else{
    PREFIX = GetPREFIX.GuildPrefix
  }
  try{
    console.log("xp gain command ran!")
    await XpGain(receivedMessage)
  }catch(err){
    console.log(err)
    if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("SEND_MESSAGES"))return
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
    name: "XPGain",
    trigger: "acm",
    aliases: []
}



async function XpGain(receivedMessage){
  try{
    await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id }).exec(async function(err,CheckForSettingsdoc){
        NoNexusChannels = CheckForSettingsdoc.NoNexusChannels
        if(NoNexusChannels.length >= 1){
          if(NoNexusChannels.includes(receivedMessage.channel.id)) return;
        }
    await Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id}).exec(async function(err,check){
        if(check.xp == false){
          return;
        }
    await NexusSettings.findOne({Type: "Settings", GuildId: receivedMessage.guild.id}).exec(async function(err,Settings){
        XPMultiplier = Settings.XPMultiplier
    })
    let randomAmountOfXp = Math.floor(Math.random() * (87 * XPMultiplier) + 1);
    await XpBans.findOne({UserID: receivedMessage.member.id, GuildId: receivedMessage.guild.id}).exec(async function(err,XPdocument){
        await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id }).exec(async function(err,CheckForSettingsdoc){
            if(CheckForSettingsdoc.NoXpChannels.length >= 1){
                if (CheckForSettingsdoc.NoXpChannels.includes(receivedMessage.channel.id)){
                    randomAmountOfXp = 0;
                }
            }
        if(!XPdocument == null ){
            randomAmountOfXp = 0;
        }
        let UserCooldowns = await CoolDowns.get(receivedMessage.guild.id)
        if(UserCooldowns){
          if(UserCooldowns.Users.includes(receivedMessage.member.user.id)){
            randomAmountOfXp = 0;
          }
        }

    if(!UserCooldowns){
      const UserCooldownsConstruct = {
        Users: [],
      };
      CoolDowns.set(receivedMessage.guild.id, UserCooldownsConstruct);
      UserCooldowns = await CoolDowns.get(receivedMessage.guild.id)
    }
    if(!UserCooldowns.Users.includes(receivedMessage.member.user.id)){
      UserCooldowns.Users.push(receivedMessage.member.user.id)
    }
    setTimeout(async() => {
      UserCooldowns.Users = await UserCooldowns.Users.filter(item => !receivedMessage.member.user.id.includes(item))
    }, 2000);
    if(randomAmountOfXp != 0){
      const hasLeveledUp = await Levels.appendXp(receivedMessage.author.id, receivedMessage.guild.id, randomAmountOfXp);
      if (hasLeveledUp) {
        const user = await Levels.fetch(receivedMessage.author.id, receivedMessage.guild.id);
        await Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id}).exec(async function(err,check2){
          if(check2.levelmsgs == false)return
          if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("SEND_MESSAGES"))return
          await receivedMessage.channel.send(`${receivedMessage.author}, congratulations! You have leveled up to level **${user.level}**. :tada:`);
        })
      }
    }
    })
    })
  })
  })
}catch(err){
  if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("SEND_MESSAGES"))return
  let botlogschannel = client.channels.cache.get("873587394224459818");
  if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("EMBED_LINKS"))return
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