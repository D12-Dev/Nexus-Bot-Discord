const Discord = require("discord.js");
var client
const Modules = require(`./models/Modules.js`)
const NexusSettings = require(`./models/NexusSettings`)
const TagsDB = require(`./models/TagSchema`)
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
    console.log("TagCommand command ran!")
    await TagCommand(receivedMessage, args)
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
    name: "TagCommand",
    trigger: "acm",
    aliases: []
}


async function TagCommand(receivedMessage, args){ 
    if(!args)return await receivedMessage.reply(`Please use the \`${PREFIX}tag help\` command to learn how to use tags!`)
    if(args[0] == "help"){
        let DevErrorEmbed =  new Discord.MessageEmbed()
        .setTitle(`Tag Help`)
        .setDescription(`\`${PREFIX}tag help\` - Brings up this guide to use.\n\`${PREFIX}tag delete <tagname>\` - Deletes any tag with that name.\n\`${PREFIX}tag add <tagname>\` - Adds a tag that can be used whenever its called using ${PREFIX}<tagname>.\n\`${PREFIX}tag permissions <role/permission/adminonly>\` - Sets the permission level required to **add and delete** tags, this does not stop people from using them.`)
        .setAuthor(client.user.username)
        .setColor(0xFF0000)
        .setTimestamp(new Date())
        await botlogschannel.send({ embeds: [DevErrorEmbed]})
    }
    if(args[0] == "delete" || args[0] == "remove"){
      await TagDeleteHandle(receivedMessage, args[1])
    }
    if(args[0] == "create" || args[0] == "add"){
      await TagCreateHandle(receivedMessage, args)
    }
    if(args[0] == "permissions" || args[0] == "perms"){
      await TagPermsHandle(receivedMessage, args)
    }
    /*let TagsDoc = await TagsDB.findOne({GuildID: receivedMessage.guild.id, Type: "Tags"})
    if(TagsDoc && TagDoc.TagArray.length != 0){
      // Handle the tags
      let TagManagerUtil = await client.utilities.get("TagManagerUtil")
      await TagManagerUtil.run(Client, receivedMessage, args)
    }
    else{
      return 
    }*/
}

async function TagDeleteHandle(receivedMessage, TagName){
  let TagsDoc = await TagsDB.findOne({GuildID: receivedMessage.guild.id, Type: "Tags"})
  if(!TagsDoc.Tags.includes(TagName)){
    return receivedMessage.reply("no such tag exists!")
  }
  TagsDoc.Tags = await TagsDoc.Tags.filter(item => item !== TagName)
  await TagsDoc.save()
  return await receivedMessage.reply("Successfully deleted tag: " + TagName)
}

async function TagCreateHandle(receivedMessage, args){
  let TagName = args[1]
  if(!TagName){
    return await receivedMessage.reply("Please include the name of the tag and the content. Usage: " + PREFIX + "tag create <tagname> <tagcontent>")
  }
  let Message = args.slice(2).join(' ');
  if(!Message){
    return await receivedMessage.reply("Please include the name of the tag and the content. Usage: " + PREFIX + "tag create <tagname> <tagcontent>")
  }
  let TagsDoc = await TagsDB.findOne({GuildID: receivedMessage.guild.id, Type: "Tags"})
  if(TagsDoc.Tags.includes(TagName)){
    return receivedMessage.reply("Tag already exists with that name!")
  } 
  TagsDoc.Tags = await TagsDoc.Tags.push([TagName = Message])
  await TagsDoc.save()
  return await receivedMessage.reply("Successfully added tag: " + TagName)
}

async function TagPermsHandle(receivedMessage, args){
  return await receivedMessage.reply("Nexus dev team has not yet finished this command and for now will be disabled.") // Will do at a later time 
}