const Discord = require("discord.js");
var client
const Modules = require(`./models/Modules.js`)
const NexusSettings = require(`./models/NexusSettings`)
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
      console.log("unmute all in vc command ran!")
      await UnMuteAllInVcCommand(receivedMessage, args)
    }catch(err){
      console.log(err)
      
    if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("SEND_MESSAGES"))return;
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
    name: "UnMuteAllInVcCommand",
    trigger: "acm",
    aliases: []
}

async function UnMuteAllInVcCommand(receivedMessage, args){
    let Vc; 
    if(!receivedMessage.member.permissions.has("ADMINISTRATOR")){
      return await receivedMessage.channel.send("You don't have permission to this command, please ask a server administrator if necessary!")
    }
    if(args.length == 0){
      Vc = receivedMessage.member.voiceChannel
    }
    else{
      Vc = receivedMessage.mentions.channels.first() || receivedMessage.guild.channel.get(args[0]) 
    }
    let MemberMutedCount = 0 
    if(!Vc)return await receivedMessage.channel.send("Please mention a valid channel!")
    await receivedMessage.channel.send(`Unmuting ${Vc.members.size} members in voice channel: ${Vc}.`)
    await Vc.members.forEach(async (member) => {
        if(member == receivedMessage.member)return 
        if(member.voiceChannel){
            try{
                await member.setMute(false, "[Auto Nexus] Unmuting all people in current vc! By " + receivedMessage.member.user.tag + ".");
                MemberMutedCount + 1
            }catch(err){
                return MemberMutedCount - 1
            }
        }
    });
    await receivedMessage.channel.send(`Unmuted ${MemberMutedCount} members in voice channel: ${Vc}.`)
}