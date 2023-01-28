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
    console.log("secret command ran!")
    await secret(receivedMessage)
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
    name: "secretcommand",
}
async function secret(receivedMessage) {
  try{
    let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL"]
    let answer = await MakeMissingPermsEmbed(RequiredPerms, receivedMessage)
    if(answer != true){
      try{
        return await receivedMessage.author.send({embeds: [answer]})
      }catch(err){
        return
      }
    }
    //// code here
    let curtime = new Date().getTime() 
    let TimeToActivate = 1669935599000
    if(curtime >= TimeToActivate){
        let InfoEmbed = new Discord.MessageEmbed()
        .setTitle("✨Happy Birthday Yvonne!!✨")
        .setDescription("✨** I love you so much and I hope you enjoy this.**✨\nSince you commented before that you would like nsfw commands in nexus, As a little present i handled that for you :>")
        .addField("Commands activated",".fuck\n.hentai\n.anal\n.ass\n.thighs\n.boobs", true)
        //https://youtu.be/UmOsfZiFYqo
        //.setURL("http://bit.ly/33fVhjm")
        .setFooter("Nexus ©")
        .setColor(0x0080ff)
        await receivedMessage.channel.send({embeds: [InfoEmbed]})
        let InfoEmbed2 = new Discord.MessageEmbed()
        .setTitle("✨Video From me✨")
        .setDescription("Hope you enjoy.")
        .addField("Video link","https://youtu.be/UmOsfZiFYqo", true)
       // .setURL("http://bit.ly/33fVhjm")
        .setFooter("Nexus ©")
        .setColor(0x0080ff)
        await receivedMessage.channel.send({embeds: [InfoEmbed2]})
        let InfoEmbed3 = new Discord.MessageEmbed()
        .setTitle("✨Message From me✨")
        .setDescription("I know im very mushy but here.")
        .addField("What I Love About You.","Yvonne you are my everything, my oxygen, my world; all of my decisions are based around you.You have a beautiful smile and your happiness brings me happiness. You are amazing and my life is so much better when you are around.", true)
        .addField("⠀", "I love you because you're perfect for me, you have hobbies which I love such as singing, art, dancing and in the future coding and you are so my type, I love your body and I think you are the most sexy and beautiful girl everr, I love your eyes, hair, nose and of course your lips, that I want to kiss so badly right now. We even think the same stuff 90% of the time and its so cute with how similar we think. You are amazing yvonne and you are a really strong person and you inspire me to do so much with my life such as code more. Furthermore, you motivate me so much and make my stomach turn upside down everytime you say that you love me. I will be there soon hopefully, so I spend all the time in the world with you, this time im not leaving and you are gonna hide me under your bed. I love you, have a great birthday Yvonne.")
        // .setURL("http://bit.ly/33fVhjm")
        .setFooter("Nexus © - I love you so much more than you know.")
        .setColor(0x0080ff)
        await receivedMessage.channel.send({embeds: [InfoEmbed3]})
        let moduleDoc = await Modules.findOne({Type:"Modules", GuildId: receivedMessage.guild.id})
        moduleDoc["nsfw"] = true
        moduleDoc.save()












    }
    else{
        let timeremaininginmil = TimeToActivate - curtime
        let timeremaining = msToTime(timeremaininginmil)
        let InfoEmbed = new Discord.MessageEmbed()
        .setTitle("✨Not Ready Yet✨")
        .setDescription(`✨**I love you!!!**`)
        .addField("Time Remaining",`${timeremaining}`, true)
        //.setURL("http://bit.ly/33fVhjm")
        .setFooter("Nexus ©")
        .setColor(0x0080FF)
        await receivedMessage.channel.send({embeds: [InfoEmbed]})

    }


    function msToTime(duration) {
        var milliseconds = Math.floor((duration % 1000) / 100),
          seconds = Math.floor((duration / 1000) % 60),
          minutes = Math.floor((duration / (1000 * 60)) % 60),
          hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
      
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
      
        return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
      }
      console.log(msToTime(300000))





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