const Discord = require("discord.js");
const {Util} = require("discord.js")
var client
const Modules = require(`../cmds/models/Modules.js`)
const NexusSettings = require(`../cmds/models/NexusSettings.js`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
var PREFIX = "."
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
        console.log("Msglogs command ran!")
        await MsgLogs(receivedMessage)
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
    name: "MsgLogs"
}   
async function MsgLogs(receivedMessage){
    try{
    await Modules.findOne({Type: "Modules", GuildId: receivedMessage.guild.id}).exec(async function(err,check){
        if(check.msglogs == false){
        return;
        }
        else{
            await NexusSettings.findOne({ Type: "Settings", GuildId: receivedMessage.guild.id }).exec(async function(err,CheckForSettingsdoc){
            var GuildMsgLogs = CheckForSettingsdoc.MsgLogsChannel
        //  console.log("[GuildMsgLogs] Result: " + GuildMsgLogs)  //<---- Testing purposes 
            MsgLogsChannel = GuildMsgLogs
            let channelID = await client.channels.cache.get(MsgLogsChannel);
            if(!channelID)return
            if(!channelID.permissionsFor(receivedMessage.guild.me).has("SEND_MESSAGES"))return
            if(!channelID.permissionsFor(receivedMessage.guild.me).has("EMBED_LINKS"))return
            else{
                if(receivedMessage.content.length == 0)return
                if (receivedMessage.content.length >= 900) {
                    let MsgDisectedArray = DisectMsg(receivedMessage.content, 900, receivedMessage)
                    let MsgLogEmbed = new Discord.MessageEmbed()
                    .setTitle("**Msglogs.**")
                    .setDescription(`${receivedMessage.member.user.tag} has said a message in ${receivedMessage.channel}.`)
                    .setAuthor(client.user.username)
                    .setColor(0x0080ff)
                    .setTimestamp(new Date())
                    for(var i = 0; i < MsgDisectedArray.length;i++ ){
                        MsgLogEmbed.addField(MsgDisectedArray[i])
                    }
                    await channelID.send(MsgLogEmbed)
                }
                else{
                    let MsgLogEmbed = new Discord.MessageEmbed()
                    .setTitle("**Msglogs.**")
                    .setDescription(`${receivedMessage.member.user.tag} has said a message in ${receivedMessage.channel}.`)
                    .addFields([
                        {name: "Message:", value: `${receivedMessage.content}`},
                    ])
                    .setAuthor(client.user.username)
                    .setColor(0x0080ff)
                    .setTimestamp(new Date())
                    return await channelID.send({embeds: [MsgLogEmbed]})
                }
            }
        })
  }
})
    }catch(err){
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

async function DisectMsg(StringToDisect, LengthToDisectAt, receivedMessage){
    if(StringToDisect < LengthToDisectAt)return StringToDisect;
    let StringAsArray = StringToDisect.split(' ')
    if(StringAsArray[0].length > LengthToDisectAt){
        let ArrayToReturn = DisectAtCharcterLength(StringToDisect, StringAsArray, LengthToDisectAt)
        return ArrayToReturn
    }
    else{
        let ArrayToReturn = PrettyDisectByWordSplit(StringToDisect, StringAsArray, LengthToDisectAt, receivedMessage)
        return ArrayToReturn
    }
}


async function PrettyDisectByWordSplit(StringToDisect, StringAsArray, LengthToDisectAt, receivedMessage){
    let BuildingString = ""
    let BuildingArray = []
    let AmountOfTimesToDisect = Math.ceil(receivedMessage.content.length / 1000)
    if(AmountOfTimesToDisect == 0)return
    for(var x = 0;x < StringAsArray.length;x++){
        let TempString = BuildingString + " " + StringAsArray[x]
        if(TempString > LengthToDisectAt){
            BuildingArray.push(BuildingString)
            BuildingString = ""
        }
        else{
            BuildingString = TempString
        }
    }
    return BuildingArray
}
async function DisectAtCharcterLength(StringToDisect, StringAsArray, LengthToDisectAt){
    return Util.splitMessage(StringToDisect, {maxlength: LengthToDisectAt})
}