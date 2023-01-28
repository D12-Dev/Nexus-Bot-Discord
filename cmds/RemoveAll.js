const Discord = require("discord.js");
var client
const Modules = require(`./models/Modules.js`)
const NexusSettings = require(`./models/NexusSettings`)
const XpBans = require(`./models/XpBan`)
var {TOKEN} = require(`../config`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
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
    console.log("remove all roles command ran!")
    await RemoveAll(receivedMessage, args)
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
    name: "RemoveAllCommand",
    trigger: "acm",
    aliases: []
}

async function RemoveAll(receivedMessage, args){
    try{
      let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL", "MANAGE_ROLES"]
      let answer = await MakeMissingPermsEmbed(RequiredPerms, receivedMessage)
      if(answer != true){
        try{
          return await receivedMessage.author.send({embeds: [answer]})
        }catch(err){
          return
        }
      }
      if(!receivedMessage.member.permissions.has("ADMINISTRATOR")){
          return await receivedMessage.channel.send("You don't have permission to this command, please ask a server administrator if necessary!")
      }
      let guild = await receivedMessage.guild
      if(!args[0])return await receivedMessage.channel.send("Please mention a role")
      let Role = await receivedMessage.mentions.roles.first() || await guild.roles.get(args[0])
      if(!Role)return await receivedMessage.channel.send("Please mention a valid role to give to this guild!")
      if(guild.me.highestRole.comparePositionTo(Role) > 0){
        await RemoveSlowlyRoles(receivedMessage, guild, Role)
        return
      }
      return await receivedMessage.channel.send("You are trying to give a role that is higher than me!")
    }catch(err){
      if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("SEND_MESSAGES"))return
      let botlogschannel = await client.channels.cache.get("873587394224459818");
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
  
  async function RemoveSlowlyRoles(receivedMessage, guild, role){
    var MemberArray = [] 
    await guild.members.filter((m) => !m.user.bot).forEach(async (member) => {
      if(!member.roles.some(r=>[role.name].includes(r.name)) )return
      MemberArray.push(member)
    });
    await receivedMessage.channel.send(`Attempting to remove ${role} from \`${MemberArray.length}\` members...\nThis may take a while if your guild has a high member count!`);
    if(MemberArray.length == 0)return
    console.log(MemberArray.length)
    for(var x = 0;x < MemberArray.length;x++){
      await Sleep("1000")
      console.log((x + 1) + " out of " + MemberArray.length + `. ${MemberArray.length - (x + 1)} remaining!`)
      try{
        await MemberArray[x].removeRole(role)
      }catch(err){
        console.log("Failed to remove role!")
      }
    }
    return await receivedMessage.channel.send(`Removed the role ${role} from \`${MemberArray.length}\` members.`);
  }
  
  async function Sleep(time){
    setTimeout(() => {
      return
    }, time);
    return
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
  