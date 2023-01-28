const Discord = require("discord.js");
var client
const Modules = require(`./models/Modules.js`)
const NexusSettings = require(`./models/NexusSettings`)
const XpBans = require(`./models/XpBan`)
const Polls = require(`./models/Polls`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
var PREFIX = "."
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []
var mongoose = require(`mongoose`)
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
    console.log("Poll create command ran!")
    await  MakePollEmbed(receivedMessage, args)
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
    name: "PollCommand",
    trigger: "acm",
    aliases: []
}


async function MakePollEmbed(receivedMessage, args){
  let RequiredPerms = ["EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL"]
  let answer = await MakeMissingPermsEmbed(RequiredPerms, receivedMessage)
  if(answer != true){
    try{
      return await receivedMessage.author.send({embeds: [answer]})
    }catch(err){
      return
    }
  }
  /*let UnavailableEmbed =  new Discord.MessageEmbed()
      .setTitle("**Polls are temporarily unavailable whilst we fix an issue. **")
      .setDescription("**We hope to get them working again soon. In the meantime, use Strawpoll.**")
      .setAuthor(client.user.username)
      .setColor(0xFF0000)
      .setTimestamp(new Date())
      return await receivedMessage.channel.send(UnavailableEmbed)*/
  try{
    await receivedMessage.delete()
  let PremiumWarningEmbed =  new Discord.MessageEmbed()
  .setTitle("**💳  Polling will become a premium-only feature soon.**")
  .setDescription("**The premium charge of only £10 a year helps us to keep developing the bot, and also helps pay for hosting!**")
  .addField("How do I get Nexus Premium?", "You can buy Nexus Premium [here](httpsnexus.orzi.tv)")
  .setAuthor(client.user.username)
  .setColor(0xFF8C00)
  .setTimestamp(new Date())
  receivedMessage.author.send({ embeds: [PremiumWarningEmbed]})
  
  var second = 1000; //s
  var minute = 60000; //m
  var hour = 3600000; //h
  var day = 86400000; //d
  var Duration = 0;
  let BuildEmbed1 = new Discord.MessageEmbed()
  .setAuthor("**Create your poll**", "", "https://www.youtube.com/watch?v=YXN2bx26viw")
  .setDescription("Reply to this message with whatever question you want to ask.")
  .addField(`Example:`, `How many cats do you have[?](https://www.youtube.com/watch?v=NutN_NbRIs8)`)
  .setColor(0xff007f)
  .setFooter("© Nexus", client.user.avatarURL)
  .setTimestamp(new Date())

  var BuildingEmbed = await receivedMessage.author.send({ embeds: [BuildEmbed1]})

  try{
    let Filter = (msg2) => msg2.author.id != client.user.id
    var Question = await BuildingEmbed.channel.awaitMessages({filter: Filter, max: 1, time: 10000, errors: ["time"]});
  }catch (err) {
      console.error(err);
      return await receivedMessage.author.send("You didn't provide a question within one minute. Poll building has been cancelled.")
    }
    if(Question.first().content.length > 900){
      return await receivedMessage.author.send("You may only have 900 characters for the question of the poll.")
    }
    let BuildEmbed2 = new Discord.MessageEmbed()
    .setAuthor("**Create your poll**", "", "https://www.youtube.com/watch?v=YXN2bx26viw")
    .setDescription("No worries en. Now, how long would you like your poll to last for. ")
    .addField("⠀" ,"Use s for seconds, m for minutes, h for hours and d for days. You can't combine time types. So, if you want the poll to last for 5 minutes, reply with \"5m\".")
    .setColor(0xff007f)
    .setFooter("© Nexus", client.user.avatarURL)
    .setTimestamp(new Date())

    await BuildingEmbed.edit({ embeds: [BuildEmbed2]})
    
    try{
      var Time = await BuildingEmbed.channel.awaitMessages(() => true, {maxMatches: 1, time: 60000, errors: ["time"]});
      }catch (err) {
          console.error(err);
          return await receivedMessage.author.send("You didn't provide a timescale within one minute. Poll building has been cancelled.")
      }
    var count = 0;
    var Type = ""
    if(Time.first().content.includes("s")){
        count+1;
        Type = "Seconds"
    }
    if(Time.first().content.includes("m")){
        count+1;
        Type = "Minutes"
    }
    if(Time.first().content.includes("h")){
        count+1;
        Type = "Hours"
    }
    if(Time.first().content.includes("d")){
        count+1;
        Type = "Days"
    }
    if(count > 1){
      return await receivedMessage.author.send("You provided more than one time type at the same time. Poll building has been cancelled.")
    }

    if(Type === "Seconds"){
      try {
        var DurationInSeconds = parseFloat(Time.first().content.replace("s", ''))
        if(DurationInSeconds > 432000){
            return await receivedMessage.channel.send("The maximum poll length is 5 days (432,000 Seconds). Poll building has been cancelled.")
        }
        Duration = DurationInSeconds * second
      } catch (error) {
        return await receivedMessage.author.send("You provided a value that was invalid. Poll building has been cancelled.")
      }
      if(isNaN(Duration)){
        return await receivedMessage.author.send("You provided a value that was invalid. Poll building has been cancelled.")
      }
    }

    if(Type === "Minutes"){
      try { 
        var DurationInMinutes = parseFloat(Time.first().content.replace("m", ''))
        if(DurationInMinutes > 7200){
            return await receivedMessage.author.send("The maximum poll length is 5 days (7,200 Minutes). Poll building has been cancelled.")
        }
        Duration = DurationInMinutes * minute
      } catch (error) {
        return await receivedMessage.author.send("You provided a value that was invalid. Poll building has been cancelled.")
      }
      if(isNaN(Duration)){
        return await receivedMessage.author.send("You provided a value that was invalid. Poll building has been cancelled.")
      }
    }

    if(Type === "Hours"){
      try {
        var DurationInHours = parseFloat(Time.first().content.replace("s", ''))
        if (DurationInHours > 120){
          return await receivedMessage.author.send("The maximum poll length is 5 days (120 Hours). Poll building has been cancelled.")
        }
        Duration = DurationInHours * hour
      } catch (error) {
        return await receivedMessage.author.send("You provided a value that was invalid. Poll building has been cancelled.")
      }
      if(isNaN(Duration)){
        return await receivedMessage.author.send("You provided a value that was invalid. Poll building has been cancelled.")
      }
    }

    if(Type === "Days"){
      try {
        var DurationInDays = parseFloat(Time.first().content.replace("s", ''))
        if (DurationInDays > 5){
          return await receivedMessage.author.send("The maximum poll length is 5 days. Poll building has been cancelled.")
        }
        Duration = DurationInDays * day
      } catch (error) {
        return await receivedMessage.author.send("You provided a value that was invalid. Poll building has been cancelled.")
      }
      if(isNaN(Duration)){
        return await receivedMessage.author.send("You provided a value that was invalid. Poll building has been cancelled.")
      }
    }
    let BuildEmbed3 = new Discord.MessageEmbed()
    .setAuthor("**Create your poll**", "", "https://www.youtube.com/watch?v=YXN2bx26viw")
    .setDescription("Almost there! How many answers do you want this poll to include (Max of 16).")
    .setColor(0xff007f)
    .setFooter("© Nexus", client.user.avatarURL)
    .setTimestamp(new Date())

    await BuildingEmbed.edit({ embeds: [BuildEmbed3]})
    try{
        var AmountOfAnswersSpecifiedByUser = await BuildingEmbed.channel.awaitMessages(() => true, {maxMatches: 1, time: 60000, errors: ["time"]});
    }catch (err) {
        console.error(err);
        return await receivedMessage.author.send("You didn't provide an amount of answers within one minute. Poll building has been cancelled.")
    }
    if(isNaN(AmountOfAnswersSpecifiedByUser.first().content)){
      return await receivedMessage.author.send("You provided a value that was invalid. Poll building has been cancelled.")
    }
    if(parseInt(AmountOfAnswersSpecifiedByUser.first().content) > 16){
      return await receivedMessage.author.send("You provided a value that was invalid. Poll building has been cancelled.")
    }
    if(parseInt(AmountOfAnswersSpecifiedByUser.first().content) < 1){
      return await receivedMessage.author.send("You provided a value that was invalid. Poll building has been cancelled.")
    }
    var AmountOfAnswers = parseInt(AmountOfAnswersSpecifiedByUser.first().content)
    if(!AmountOfAnswers){
      return await receivedMessage.author.send("You provided a value that was invalid. Poll building has been cancelled.")
    }
    var AnswerInputNum = 0
    var Answer = ""
    var AnswerArray = []
    for(var i = 0;i < AmountOfAnswers;i++){
        let BuildEmbed4 = new Discord.MessageEmbed()
        .setAuthor("**Create your poll**", "", "https://www.youtube.com/watch?v=YXN2bx26viw")
        .setDescription(`Almost there! Please input answer No.${AnswerInputNum + 1}.`)
        .setColor(0xff007f)
        .setFooter(`© Nexus || Amount of answers remaining: ${AmountOfAnswers - AnswerInputNum}`, client.user.avatarURL)
        .setTimestamp(new Date())
        await BuildingEmbed.edit({ embeds: [BuildEmbed4]})
        try{
            Answer = await BuildingEmbed.channel.awaitMessages(() => true, {maxMatches: 1, time: 120000, errors: ["time"]});
        }catch (err) {
            console.error(err);
            return await receivedMessage.author.send("You didn't provide an answer within two minutes. Poll building has been cancelled.")
        }
        if(Answer.first().content.length > 900){
          return await receivedMessage.author.send("Answers can only be of a max of 900 characters.")
        }
        AnswerArray.push(Answer.first().content)
        AnswerInputNum = AnswerInputNum + 1
    }
    let BuildEmbed5 = new Discord.MessageEmbed()
    .setAuthor("**Poll created!** ✅", "", "https://www.youtube.com/watch?v=YXN2bx26viw")
    .setDescription(`Poll successfully created in channel: ${receivedMessage.channel}. On server ${receivedMessage.guild.name}.`)
    .setColor(0xff007f)
    .setFooter(`© Nexus`, client.user.avatarURL)
    .setTimestamp(new Date())
    await BuildingEmbed.edit({ embeds: [BuildEmbed5]})

    const PollEmbed = new Discord.MessageEmbed()
    .setAuthor(`${receivedMessage.member.user.tag}'s Poll!`)
    .setDescription(`**${Question.first().content}**`)
    .setColor(0x0080ff)
    .setFooter("© Nexus", client.user.avatarURL)
    .setTimestamp(new Date())
    var ReactEmojiIDArray = ["913535445294546995", "913535445307117639", "913535445269368883", "913535445185495061", "913535445529399306", "913535445114191934", "913535445210636393", "913535445495869521", "913535445521010738", "913535445508431872", "913536969005465600", "913535445353263145", "913535445487485018", "913535445491646504", "913535445474873364", "913535445378412556"]
    for(var x = 0;x < AmountOfAnswers;x++){
      let EmojiToAdd = client.emojis.get(ReactEmojiIDArray[x])
      PollEmbed.addField(`${EmojiToAdd} Answer #${x + 1}`, AnswerArray[x])
    }
    var Poll = await receivedMessage.channel.send(PollEmbed)
    for(var x = 0;x < AmountOfAnswers;x++){
      let EmojiToReactWith = await client.emojis.get(ReactEmojiIDArray[x])
      await Poll.react(EmojiToReactWith)
    }
    var d = new Date
    const PollDBEntry = new Polls({
        _id: mongoose.Types.ObjectId(),
        Type: "Poll",
        AmountOfAnswers: AmountOfAnswers,
        UserMadeById: receivedMessage.member.user.id,
        GuildID: receivedMessage.guild.id,
        ChannelID: receivedMessage.channel.id,
        MadeAtTime: d.getTime(),
        Duration: Duration,
        PollMsgID: Poll.id,
        Answers: AnswerArray,
        Question: Question.first().content
      })
      await PollDBEntry.save()
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

/**
 * Shadowhawk's poll has ended
 * 
 * Results:
 * Option 1 - 1 vote (20%)
 * Option 2 - 2 votes (40%)
 * Option 3 - 2 votes (40%)
 * 
 * Winner: Tie between Option 2 and Option 3
*/

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