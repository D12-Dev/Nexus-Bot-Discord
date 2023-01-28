const Discord = require("discord.js");
var client
const Modules = require(`./models/Modules.js`)
const NexusSettings = require(`./models/NexusSettings`)
var {PREFIXMap, NexusVersion, Dispatcher} = require(`../core-nexus`)
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
    console.log("tempmute command ran!")
    await TestCommand(receivedMessage, args)
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
    name: "TestCommand",
    trigger: "acm",
    aliases: []
}

async function TestCommand(receivedMessage, args){
    if(receivedMessage.guild.id != "676874632078426180")return receivedMessage.channel.send("Only admins in the nexus dev discord can post an update message for the bot.Please contact 🔥 D12 🔥#0001, if something critical has occured! https://discord.gg/wEdRXDM")
    if(!receivedMessage.member.permissions.has("ADMINISTRATOR")){
        return await receivedMessage.channel.send("You don't have permission to this command, please ask a server administrator if necessary!")
    }
    console.log(Dispatcher)
}