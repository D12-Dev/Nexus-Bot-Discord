var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
var PREFIX = "."
const Levels = require(`discord-xp`)
const LevelRanks = require(`../cmds/models/LevelRanks.js`)
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []
module.exports.run = async (receivedMessage, Client) => {
    client = Client
    PREFIXToSet = await PREFIXMap.get(receivedMessage.guild.id)
    if(!PREFIXToSet){
      PREFIX = "."
    }
    else{
      PREFIX = PREFIXToSet.GuildPrefix
    }
    try{
        await AutoLevelRole(receivedMessage)
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
        await  botlogschannel.send(DevErrorEmbed)
      }
}
module.exports.help = {
    name: "LevelAutoRoles"
}

async function AutoLevelRole(receivedMessage){
    try{
    if(!receivedMessage.guild.me.permissions.has("MANAGE_ROLES"))return
    const user = await Levels.fetch(receivedMessage.author.id, receivedMessage.guild.id);
    await LevelRanks.find({GuildId: receivedMessage.guild.id, Type: "AutoLevelRoles"}).exec(function(err,Docs){
        if(Docs.length == 0)return
        console.log("Applying level roles.")
        Docs.forEach(async Doc => {
            if(Doc.Level <= user.level){
                let RoleID = await Doc.RoleID
                let Role = await receivedMessage.guild.roles.get(RoleID)
                if(!Role)return
                if(receivedMessage.guild.me.highestRole.comparePositionTo(Role) > 0){
                    if(receivedMessage.member.roles.has(Role))return 
                    await receivedMessage.member.addRole(RoleID)
                }
            }

        })
    })
}catch(err){
    if(!receivedMessage.channel.permissionsFor(receivedMessage.guild.me).has("EMBED_LINKS"))return
    let botlogschannel = client.channels.cache.get("873587394224459818");
    let DevErrorEmbed =  new Discord.MessageEmbed()
    .setTitle("**An error has occurred! ❌**")
    .setDescription("**"+ err + "**\n\n" + err.stack)
    .setAuthor(client.user.username)
    .setColor(0xFF0000)
    .setTimestamp(new Date())
    await botlogschannel.send({ embeds: [DevErrorEmbed]})
  }
}
