const Discord = require("discord.js");
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
    console.log("Creeper command ran!")
    await CreeperCommand(receivedMessage)
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
    name: "CreeperCommand",
    trigger: "acm",
    aliases: []
}
async function CreeperCommand(receivedMessage) {
    try{
      await receivedMessage.author.send("[CaptainSparklez:]Creeper, aw man \n[TryHardNinja:]So we back in the mine, got our pickaxe swingin' from side to side, side, side to side.\nThis task a grueling one, hope to find some diamonds tonight, night, night, diamonds tonight.\nHeads up.You hear a sound, turn around and look up.Total shock fills your body.\nOh no it's you again, I can never forget those eyes, eyes, eyes, eyes, eyes, eyes.\nCause baby tonight, the creeper's tryin' to steal all our stuff again.\nCause baby tonight, you grab your pick shovel and bolt again, bolt again, gain.\nAnd run, run until it's done, done, until the sun comes up in the morn'.\nCause baby tonight, the creeper's tryin' to steal all our stuff again, stuff again, gain.\nJust when you think you're safe, overhear some hissing from right behind, right, right behind.\nThat's a nice life you have, shame it's gotta end at this time, time, time, time, time, time, time.\nBlows up, then your health bar drops and you could use a 1-up.\nGet inside don't be tardy.So now you're stuck in there, half a heart is left but don't die, die, die, die, die, die.\nCause baby tonight, the creeper's tryin' to steal all our stuff again.\nCause baby tonight, grab your pick shovel and bolt again, bolt again, gain.\nAnd run, run until it's done, done, until the sun comes up in the morn'.\nCause baby tonight, the creeper's tryin' to steal all our stuff again.");
      await receivedMessage.author.send("[CaptainSparklez:]Creepers, you're mine ha haDig up diamonds, craft those diamonds, make some armor Get it baby, go and forge that like you so, MLG proThe sword's made of diamonds, so come at me broHa,\n training in your room under the torch-lightHone that form to get you ready for the big fight.\nEvery single day in the whole nightCreeper's out prowlin',(Whoo), alright.\nLook at me, look at you.Take my revenge that's what I'm gonna do.\nI'm a warrior baby, what else is new, And my blade's gonna tear through you\n[CaptainSparklez, TryHardNinja:]Bring itCause baby tonight, the creeper's tryin' to steal all our stuff again (Get your Stuff)\nYea, let's take back the worldYea baby tonight, grab your sword armor and go (It's on)\nTake your revenge (Whoo)Oh so fight, fight, like it's the last, last night of your life, life show them your bite (Whoo)\n[TryHardNinja:]Cause baby tonight, the creeper's tryin' to steal our stuff again.\nCause baby tonight, grab your pick shovel and bolt again, bolt again, gain. \nAnd run, run until it's done, done, until the sun comes up in the morn'.\n Cause baby tonight, come on, the creeper's, come on, tryin' to steal all our stuff again.(Whoo)");
    }catch(err){
        let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL"]
        let answer = await MakeMissingPermsEmbed(RequiredPerms, receivedMessage)
        if(answer != true){
          return
        }
        let failedtosend = new Discord.MessageEmbed()
        .setTitle("Failed to sent a message to your dm's! ❌")
        .setDescription("I cannot send you messages " + receivedMessage.member + "! Please check if you have blocked me or if you have closed your dm's.")
        .setAuthor(client.user.username)
        .setColor(0x00ff00)
        .setFooter("© Nexus", client.user.avatarURL)
        .setTimestamp(new Date())
        await receivedMessage.channel.send(failedtosend)
      }
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