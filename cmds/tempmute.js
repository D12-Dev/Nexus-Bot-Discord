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
    console.log("tempmute command ran!")
    await TempMuteCommand(receivedMessage, args)
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
    name: "TempMuteCommand",
    trigger: "acm",
    aliases: []
}
async function TempMuteCommand(receivedMessage, args) {
  try{
  Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id}).exec(async function(err,check){
    if(check.mutes == false){
      return;
    }
    else{
      let RequiredPerms = ["MUTE_MEMBERS", "EMBED_LINKS", "SEND_MESSAGES", "VIEW_CHANNEL", "MANAGE_ROLES"]
      let answer = await MakeMissingPermsEmbed(RequiredPerms, receivedMessage)
      if(answer != true){
        try{
        return await receivedMessage.author.send({embeds: [answer]})
      }catch(err){
        return
      }
      }
      var muterole = await receivedMessage.guild.roles.find(role => role.name === "Nexus Mute");
      if(!muterole){
      await receivedMessage.guild.createRole({
        name:"Nexus Mute",
        color: "WHITE"
      })
      .then(role => console.log(`Created new role with name ${role.name} and color ${role.color}`)).catch(console.error);
      muterole = await receivedMessage.guild.roles.find(role => role.name === "Nexus Mute");
      }
  if(!receivedMessage.member.permissions.has("KICK_MEMBERS")){
    return await receivedMessage.channel.send("You don't have permission to use this command. You must have the KICK_MEMBERS permisson.")
  }
  let member =
  await receivedMessage.mentions.members.first() ||
  await receivedMessage.guild.members.get(args[0]);
  if (!member)
    return await receivedMessage.reply(
      "Please mention a valid member of this server"
    );
  if (!member.kickable)
    return await receivedMessage.reply(
      "I cannot mute this user! Do they have a higher role? Do I have mute permissions?"
    );
  let reason = args.slice(2).join(" ");
  if(reason.length > 1500){
    return await receivedMessage.channel.send("The reason field may only be 1500 characters long!")
  }
  if (!reason) reason = "MODERATOR DISCRESION";
  await member.setMute(true, reason)
  await member.addRole(muterole).catch(console.error);
  let Amountoftime = args.slice(1).join(" ");
  if (!Amountoftime) Amountoftime = "60000";
  const mute_time = 60000 * Amountoftime;
  //////////////Database Query////////////////////////////
  ///////////////////////////////////////////////////////
  await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id }).exec(async function(err,CheckForSettingsdoc){
    var GuildBotLogs = CheckForSettingsdoc.BotLogsChannel
   // console.log("[GetGuildPrefix] Result: " + GuildPrefix)  <---- Testing purposes 
   BotLogsChannel = GuildBotLogs
   console.log("[Guild botlogs] BotLogs channel: " + BotLogsChannel)
  //////////////Database Query////////////////////////////
  ///////////////////////////////////////////////////////
  if(BotLogsChannel == "n/a")return console.log("No botlogs channel assigned!")
  console.log(BotLogsChannel)
  let BotLogsChannelData = await client.channels.cache.get(BotLogsChannel)
  await BotLogsChannelData.send(`${member.user.tag} has been muted by ${receivedMessage.author.tag} reason: ${reason} for ` + Amountoftime + `minutes`)
  })
  await receivedMessage.channel.send(
    `${member.user.tag} has been muted by ${receivedMessage.author.tag} reason: ${reason} for ` +
      Amountoftime +
      " minutes"
  );
  try{
    await receivedMessage.mentions.members
    .first()
    .send(
      `You have been muted by ${
        receivedMessage.author.tag
      } with the reason: ${reason} for ${mute_time / 60000}`
    );
  }catch(err){
    let failedtosend = new Discord.MessageEmbed()
    .setTitle("Failed to sent a message to their dm's! ❌")
    .setDescription("I cannot send them messages " + receivedMessage.member + "! Please check if they have blocked me or if they have closed your dm's.")
    .setAuthor(client.user.username)
    .setColor(0x00ff00)
    .setFooter("© Nexus", client.user.avatarURL)
    .setTimestamp(new Date())
    await receivedMessage.channel.send(failedtosend)
  }
  setTimeout(async() => {
    await member.removeRole(muterole);
    {
    await member.setMute(false, "Time expired!");
    }
    {
      await receivedMessage.mentions.members
        .first()
        .send("Your mute has timed out and you are no longer muted!");
    }
  }, mute_time);
}
})
  }catch(err){
    let botlogschannel = client.channels.cache.get("873587394224459818");
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
  let Perms = receivedMessage.channel.permissionsFor(receivedMessage.guild.me).toArray()
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