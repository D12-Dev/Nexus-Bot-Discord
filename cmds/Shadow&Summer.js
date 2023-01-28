const Discord = require("discord.js");
const Levels = require("discord-xp")
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
    console.log("verify command ran!")
    await VerifyCommand(receivedMessage)
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
    name: "VerifyCommand",
    trigger: "acm",
    aliases: []
}

async function VerifyCommand(receivedMessage){
  try{
    let toverifychannel = await client.channels.cache.get("638477794346795028");
      let member = await receivedMessage.member;
      let verifiedrole = await receivedMessage.guild.roles.get("612017261443547211");
        let generalchannel = await client.channels.cache.get("636915349216034816");
        await member.addRole(verifiedrole);
        await generalchannel.send(member + " **has just verified! **:open_mouth:")
        await receivedMessage.member.send("Hi there, "+ receivedMessage.member + ", thanks for verifying! This means you can now interact with the awesome community on our server!\n \nNeed any help? Ask any staff member!\n \nBecome an MVP!\nThis means that you'll get priority access to all our intra-server, and occasionally cross-server tournaments, be invited first to group games, use a lot more commands and help support us!\n \nBecome a member of the Staff Team!\nWe're always on the hunt for new mods, and our community is still growing! Want to help out? Type !applyformod!\n \nWe hope you have a great time!");
        setTimeout(async() => {
          await receivedMessage.delete();
        }, 3000);
      }catch(err){
        let botlogschannel = await client.channels.cache.get("873587394224459818");
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