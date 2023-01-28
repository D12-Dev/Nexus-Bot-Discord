const Discord = require("discord.js");
var client
const Modules = require(`../cmds/models/Modules.js`)
const NexusSettings = require(`../cmds/models/NexusSettings`)
const XpBans = require(`../cmds/models/XpBan`)
const Suggestions = require(`../cmds/models/suggestions`)
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
    console.log("Guild Member joined eclipse command ran!")
    await GuildMemberJoined(guildMember)
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
    name: "EclipseUserJoinCommand"
}


async function GuildMemberJoined(guildMember){
  try{
    await Modules.findOne({Type: "Modules", GuildId: guildMember.guild.id}).exec(async function(err,check){
        if(check.eclipse == false)return
        const AlphaMemberRole = await guildMember.guild.roles.get("660892869963546654")
        const MemberRole = await guildMember.guild.roles.get("660660355122331693")
        const WelcomeMemberChannel = await guildMember.guild.channels.get("660810732178374666")
        if(!WelcomeMemberChannel)return;
        await WelcomeMemberChannel.send(`Welcome ${guildMember} to Eclipse.gg! This discord now has ${guildMember.guild.members.filter((m) => !m.user.bot).size} members! <a:nods:661381800777744444>`)
        await guildMember.addRole(AlphaMemberRole)
        return await guildMember.addRole(MemberRole)
    })
  }catch(err){
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