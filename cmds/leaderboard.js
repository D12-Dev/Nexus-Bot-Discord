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
    console.log("Leaderboard command ran!")
    await LeaderboardCommand(receivedMessage)
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
    name: "LeaderboardCommand",
    trigger: "acm",
    aliases: []
}
async function LeaderboardCommand(receivedMessage) {
  try{
    await Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id}).exec(async function(err,check){
      if(check.XP == false){
        return;
      }
      else{
        let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL"]
        let answer = await MakeMissingPermsEmbed(RequiredPerms, receivedMessage)
        if(answer != true){
          try{
            return await receivedMessage.author.send({embeds: [answer]})
          }catch(err){
            return
          }
        }
    const rawLeaderboard = await Levels.fetchLeaderboard(receivedMessage.guild.id, 1000); // We grab top 10 users with most xp in the current server.
   // console.log(rawLeaderboard[1])
    if (rawLeaderboard.length < 1) return receivedMessage.reply("Nobody's in leaderboard yet.");
    const leaderboard = await Levels.computeLeaderboard(client, rawLeaderboard); // We process the leaderboard.
    const leaderembed = new Discord.MessageEmbed()
      .setTitle("**Leaderboard:**")
      .setAuthor(client.user.username)
      .setColor(0x0080ff)
      .setFooter("© Nexus", client.user.avatarURL)
      .setTimestamp(new Date())
      let GuildEmbedArray = []
      let PageNumber = 1
      let MaxPageNumber = Math.ceil(leaderboard.length / 10)
      leaderboard.forEach(async(LeaderBoardPerson) => {
          GuildEmbedArray.push(`${LeaderBoardPerson.position}. \`${LeaderBoardPerson.username}\` || Level: ${LeaderBoardPerson.level}. XP: ${LeaderBoardPerson.xp}`)
        })
        if(GuildEmbedArray.length > 10){
          for(var x = 0;x < 10;x++){
            leaderembed.addField(`⠀`, GuildEmbedArray[x])
          }
        }
        else{
          for(var x = 0;x < GuildEmbedArray.length;x++){
            leaderembed.addField(`⠀`, GuildEmbedArray[x])
          }
        }
      let SentEmbed = await receivedMessage.channel.send({ embeds: [leaderembed]});
      await SentEmbed.react('⬅️')
    .then(async () => await SentEmbed.react('➡️'))
    .then(async () => await SentEmbed.react('🚫'))
    const backwardsFilter = (reaction, user) => reaction.emoji.name === '⬅️' && user.id === receivedMessage.author.id;
    const forwardsFilter = (reaction, user) => reaction.emoji.name === '➡️' && user.id === receivedMessage.author.id;
    const deleteFilter = (reaction, user) => reaction.emoji.name === '🚫' && user.id === receivedMessage.author.id;
    const backwards = await SentEmbed.createReactionCollector(backwardsFilter, {time: 100000});
    const forwards = await SentEmbed.createReactionCollector(forwardsFilter, {time: 100000});
    const Delete = await SentEmbed.createReactionCollector(deleteFilter, {time: 100000});
    await backwards.on('collect',async r => {
      if(PageNumber == 1)return //console.log("On Min page")
      let PreviousPageNum = PageNumber
      PageNumber = PageNumber - 1
      let TurnPageEmbed = new Discord.MessageEmbed()
      .setTitle("**Leaderboard:**")
      .setAuthor(client.user.username)
      .setColor(0x0080ff)
      .setFooter("© Nexus", client.user.avatarURL)
      .setTimestamp(new Date())
      if(PreviousPageNum * 10 >= GuildEmbedArray.length){
        //console.log("TotalAmount " + WarnEmbedArray.length)
        index = ((PageNumber - 1) * 10)
        var i = 0
        while(i < 10){
          TurnPageEmbed.addField(`⠀`, GuildEmbedArray[index + i])
          i = i +1
        }
        await SentEmbed.edit({ embeds: [TurnPageEmbed]})
      }
      else{
        var i = 0
        index = ((PageNumber - 1) * 10)
        //console.log("TotalAmount " + WarnEmbedArray.length)
       // console.log(WarnNumber)
        while(i < 10){
          TurnPageEmbed.addField(`⠀`, GuildEmbedArray[index + i])
          i = i +1
        }
        await SentEmbed.edit({ embeds: [TurnPageEmbed]})
      }
    })
    await forwards.on('collect',async r => {
      if(PageNumber == MaxPageNumber)return //console.log("On max page")
      PageNumber = PageNumber + 1
      let TurnPageEmbed = new Discord.MessageEmbed()
      .setTitle("**Leaderboard:**")
      .setAuthor(client.user.username)
      .setColor(0x0080ff)
      .setFooter("© Nexus", client.user.avatarURL)
      .setTimestamp(new Date())
      if(PageNumber * 10 >= GuildEmbedArray.length){
        index = ((PageNumber - 1) * 10)
        var i = 0
        while(i < GuildEmbedArray.length - ((PageNumber - 1) * 10)){
          TurnPageEmbed.addField(`⠀`, GuildEmbedArray[index + i])
          i = i +1
        }
        await SentEmbed.edit({ embeds: [TurnPageEmbed]})
      }
      else{
        index = ((PageNumber - 1) * 10)
        var i = 0
        while(i < 10){
          TurnPageEmbed.addField(`⠀`, GuildEmbedArray[index + i])
          i = i +1
        }
        await SentEmbed.edit({ embeds: [TurnPageEmbed]})
      }
    })
    await Delete.on('collect',async r => {
      try{
        await SentEmbed.delete()
        await receivedMessage.delete()
      }catch(err){
        return
      }
    })

  }
})
  }catch(err){
    let botlogschannel = await client.channels.cache.get("873587394224459818");
    if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("SEND_MESSAGES"))return
    let Errorembed =  new Discord.MessageEmbed()
    .setTitle("**An error has occurred! ❌**")
    .setDescription("**The devolpment team have been notified of this issue!**")
    .setAuthor(client.user.username)
    .setColor(0xFF0000)
    .setTimestamp(new Date())
    receivedMessage.channel.send(Errorembed)
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