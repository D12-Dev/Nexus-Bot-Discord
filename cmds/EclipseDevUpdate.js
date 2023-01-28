const Discord = require("discord.js");
var client
const Modules = require(`./models/Modules.js`)
const NexusSettings = require(`./models/NexusSettings`)
const XpBans = require(`./models/XpBan`)
const Suggestions = require(`./models/suggestions`)
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
    console.log("eclipse dev update command ran!")
    await EclipsedevUpdateCommand(receivedMessage, args)
  }catch(err){
    console.log(err)
    if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("EMBED_LINKS"))return
    /*let botlogschannel = await client.channels.cache.get("873587394224459818");
    let DevErrorEmbed =  new Discord.MessageEmbed()
    .setTitle("**An error has occurred! ❌**")
    .setDescription("**"+ err + "**\n\n" + err.stack)
    .setAuthor(client.user.username)
    .setColor(0xFF0000)
    .setTimestamp(new Date())
    await botlogschannel.send({ embeds: [DevErrorEmbed]})*/
  }
}
module.exports.help = {
    name: "EclipseDevUpdateCommand",
    trigger: "acm",
    aliases: []
}



async function EclipsedevUpdateCommand(receivedMessage, args){
  try{
    await Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id}).exec(async function(err,check){
    if(check.eclipse == false)return
  let devchannel
  if(receivedMessage.guild.id == "911095119371972638"){
    devchannel = await client.channels.cache.get("911138589553881088");
  }
  else{
    devchannel = await client.channels.cache.get("660640338670649367");
  }
  if(!receivedMessage.member.roles.some(r=>["🦊Community Lead🦊", "🌐Web Developer🌐", "Developer", "Dev"].includes(r.name)) ){
    return await receivedMessage.channel.send("You don't have permission to make development updates.")
  }
  if (args <= 0)return await receivedMessage.channel.send("Invalid amount of arguments - Usage: .devupdate <type-of-update> <Message> ");
  console.log(args[0])
  let message = args.slice(1).join(' ');
  var str = await receivedMessage.member.user.tag;
  var res = str.split("#")[0];
  let status1 = args[0]
  var status = "none"
  if(status1 == "add"){
      status = "an addition..."
  }
  if(status1 == "change"){
    status = "a change..."
    }
    if(status1 == "del"){
        status = "a deletion..."
    }
  if(status == "none"){
    return await receivedMessage.channel.send("Please make a valid status update: change, add, deletion")
  }
  let announcement = await new Discord.MessageEmbed()
          .setTitle("**🛠️  Development Update**")
          .setThumbnail(receivedMessage.member.user.displayAvatarURL)
          .setDescription(res + " has made " + status)
          .addField("Update: ", message , true)
          .setAuthor(client.user.username)
          .setColor(0x4f007e)
          .setFooter(res + " made this update • © Nexus ", client.user.avatarURL)
          .setTimestamp(new Date())
   let reacttomessage = await devchannel.send({ embed: announcement });
   await reacttomessage.react(`✅`)
   .then(async() => await reacttomessage.react(`❌`))
          
  if(receivedMessage.channel != devchannel){
    await receivedMessage.channel.send("✅ Update was posted to " + devchannel + " successfully.")
  }
  await receivedMessage.delete()
  return
    })
  }catch(err){
    let botlogschannel = client.channels.cache.get("873587394224459818");
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
  };