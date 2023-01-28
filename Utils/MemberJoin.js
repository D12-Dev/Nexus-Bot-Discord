const Discord = require("discord.js");
var client
const Modules = require(`../cmds/models/Modules.js`)
const NexusSettings = require(`../cmds/models/NexusSettings.js`)
const AutoRoles = require(`../cmds/models/AutoRoles.js`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
var PREFIX = "."
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []
module.exports.run = async (guildMember, Client) => {
    client = Client
    PREFIXToSet = await PREFIXMap.get(guildMember.guild.id)
    if(!PREFIXToSet){
      PREFIX = "."
    }
    else{
      PREFIX = PREFIXToSet.GuildPrefix
    }
    try{
      console.log("Member join command ran!")
      await MemberJoined(guildMember) 
      await AutoRolesApplication(guildMember)
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
    name: "MemberJoinCommand"
}   
    
async function MemberJoined(guildMember){
  try{
    await Modules.findOne({Type:"Modules", GuildId: guildMember.guild.id}).exec(async function(err, check){
      if(check.welcome == false)return
    await NexusSettings.findOne({ Type: "Settings", GuildId: guildMember.guild.id }).exec(async function(err,CheckForSettingsdoc){
      var GuildWelcomeChannel = CheckForSettingsdoc.WelcomeChannel
     // console.log("[GetGuildPrefix] Result: " + GuildPrefix)  <---- Testing purposes 
     WelcomeChannel = GuildWelcomeChannel
    const WelcomeMemberChannel = await guildMember.guild.channels.get(WelcomeChannel)
    if(!WelcomeMemberChannel)return;
    await WelcomeMemberChannel.send(`Welcome ${guildMember} to ${guildMember.guild.name} This discord now has ${guildMember.guild.members.filter((m) => !m.user.bot).size} members! <a:nods:685979929669926943>`)
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
async function AutoRolesApplication(guildMember){
  try{
  if(!guildMember.guild.me.permissions.has("MANAGE_ROLES"))return
  await AutoRoles.find({GuildId: guildMember.guild.id, Type: "AutoRoles"}).exec(async function(err,Docs){
    Docs.forEach(async Doc => {
      console.log(Doc.RoleID)
      let Role = await guildMember.guild.roles.get(Doc.RoleID)
      if(!Role)return console.log("Role Does not exist!")
      if(guildMember.guild.me.highestRole.comparePositionTo(Role) > 0){
        await guildMember.addRole(Doc.RoleID)
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
