const Discord = require("discord.js");
var client
const Modules = require(`../cmds/models/Modules.js`)
const NexusSettings = require(`../cmds/models/NexusSettings.js`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
var PREFIX = "."
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []
module.exports.run = async (member, Client) => {
    client = Client
    PREFIXToSet = await PREFIXMap.get(member.guild.id)
    if(!PREFIXToSet){
      PREFIX = "."
    }
    else{
      PREFIX = PREFIXToSet.GuildPrefix
    }
    try{
      console.log("Member leave command ran!")
      await MemberLeave(member)
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
    name: "MemberLeaveCommand"
}   

async function MemberLeave(member) {
  try{
    await Modules.findOne({Type:"Modules", GuildId: member.guild.id}).exec(async function(err, check){
      if(check.welcome == false)return
    await NexusSettings.findOne({ Type: "Settings", GuildId: member.guild.id }).exec(async function(err,CheckForSettingsdoc){
      var GuildWelcomeChannel = CheckForSettingsdoc.WelcomeChannel
     // console.log("[GetGuildPrefix] Result: " + GuildPrefix)  <---- Testing purposes 
     WelcomeChannel = GuildWelcomeChannel
    const WelcomeMemberChannel = await member.guild.channels.get(WelcomeChannel)
    if(!WelcomeMemberChannel)return
    var RandomMessageNumber = Math.ceil(Math.random() * 5)
    console.log(RandomMessageNumber)
    if(RandomMessageNumber == 1) {
      await WelcomeMemberChannel.send(member.user.username + " has left the server RIP...")
    }
    if(RandomMessageNumber == 2) {
      await WelcomeMemberChannel.send("Begone " + member.user.username )
    }
    if(RandomMessageNumber == 3) {
      await WelcomeMemberChannel.send(member.user.username + " the eboy has left the server!")
    }
    if(RandomMessageNumber == 4) {
      await WelcomeMemberChannel.send(member.user.username + " left... Bye bye.")
    }
    if(RandomMessageNumber == 5) {
      await WelcomeMemberChannel.send(member.user.username + " left. Simp down! Call backup!")
    }
  })
  })
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
  }