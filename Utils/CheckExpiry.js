const Discord = require("discord.js");
var client
const Modules = require(`../cmds/models/Modules.js`)
const NexusSettings = require(`../cmds/models/NexusSettings`)
const XpBans = require(`../cmds/models/XpBan`)
const Polls = require(`../cmds/models/Polls`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
var BotLogsChannel = "n/a"
var MsgLogsChannel = "n/a"
var WelcomeChannel = "n/a"
var NoNexusChannels = []
var NoXpChannels = []
module.exports.run = async (Client) => {
    client = Client
    try{
        setInterval(CheckExpiries, 1000)
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
    name: "CheckExpiry"
}
async function CheckExpiries(){
    try{
        await CheckPollExpiry()
    }catch(err){
        console.log(err)
        let botlogschannel = client.channels.cache.get("873587394224459818");
        let DevErrorEmbed = new Discord.MessageEmbed()
        .setTitle("**An error has occurred! ❌**")
        .setDescription("**"+ err + "**\n\n" + err.stack)
        .setAuthor(client.user.username)
        .setColor(0xFF0000)
        .setTimestamp(new Date())
        await botlogschannel.send({ embeds: [DevErrorEmbed] })
      }
}

async function CheckPollExpiry(){
    try{
    Polls.find({Type: "Poll"}, async function(err, ResultingDocs){
        await ResultingDocs.forEach(async Doc => {
            console.log("editing polls command ran!")
            var d = new Date
            var Expiry = await Doc.MadeAtTime + Doc.Duration
            if(d.getTime() >= Expiry){
                var EmbedID = await Doc.PollMsgID
                var Channel = await client.channels.cache.get(Doc.ChannelID)
                var PollMsg = await Channel.fetchMessage(EmbedID)
                var user = await client.fetchUser(Doc.UserMadeById)
                var AmountOfAnswers = await Doc.AmountOfAnswers
                var AnswerArray = await Doc.Answers
                var NumberOfReactionsArray = []
                var TotalNumOfReactions = 0
                var CheckDupArray = ["632255459801300992", "673285454724071456"]
                var AmountOfDups = 0
                var EmojiIDArray = ["1emoji:691825439597002792", "2emoji:691825439353602079", "3emoji:691825439534088252", "4emoji:691825439257264169", "5emoji:691825439542476882", "6emoji:691825439592808458", "7emoji:691825439597133874", "8emoji:691825439638945792", "9emoji:691825439680888912", "10emoji:691825439307595787", "11emoji:691825439290818662", "12emoji:691825439420841985", "13emoji:691825439446138932", "14emoji:691825439701991424", "15emoji:691825439236292711", "16emoji:691825439567773746"]
                for(var i = 0;i < AmountOfAnswers;i++){
                    await PollMsg.reactions.get(EmojiIDArray[i]).users.forEach(async Member => {
                        if(CheckDupArray.includes(Member.id)){
                            AmountOfDups = AmountOfDups + 1
                        }
                        else{
                            CheckDupArray.push(Member.id)
                        }
                    })
                    NumberOfReactionsArray.push((PollMsg.reactions.get(EmojiIDArray[i]).count - AmountOfDups))
                    TotalNumOfReactions = TotalNumOfReactions + (await PollMsg.reactions.get(EmojiIDArray[i]).count - AmountOfDups)
                    AmountOfDups = 0
                }
                console.log(NumberOfReactionsArray)
                var PercentageForAnswersArray = await GetPercentageInArray(NumberOfReactionsArray, TotalNumOfReactions)
                let FinshedEmbed = new Discord.MessageEmbed()
                .setAuthor(`${user.tag}'s Poll Ended!`)
                .setDescription(`**${Doc.Question}**\nBelow are the results of this poll!`)
                .setColor(0x0080ff)
                .setFooter("© Nexus", client.user.avatarURL)
                .setTimestamp(new Date())
                for(var x = 0;x < AmountOfAnswers;x++){
                    if(NumberOfReactionsArray[x] == 1){
                        FinshedEmbed.addField(`⠀`, `**${AnswerArray[x]}** | **${NumberOfReactionsArray[x]}** vote (${PercentageForAnswersArray[x]})`)
                    }
                    else{
                        FinshedEmbed.addField(`⠀`, `**${AnswerArray[x]}** | **${NumberOfReactionsArray[x]}** votes (${PercentageForAnswersArray[x]})`)
                    }
                }
                await PollMsg.edit(FinshedEmbed)
                await Doc.delete()
            }
            else{
                return
            }
        })
    })
}catch(err){
    let botlogschannel = client.channels.cache.get("873587394224459818");
    let DevErrorEmbed = new Discord.MessageEmbed()
    .setTitle("**An error has occurred! ❌**")
    .setDescription("**"+ err + "**\n\n" + err.stack)
    .setAuthor(client.user.username)
    .setColor(0xFF0000)
    .setTimestamp(new Date())
    await botlogschannel.send({ embeds: [DevErrorEmbed] })
  }
}

async function GetPercentageInArray(ArrayOfNum, TotalNum){
    var PerArray = []
    if(TotalNum == 0){
        for(var x = 0;x < ArrayOfNum.length;x++){
            PerArray.push("0.00%")
        }
        return PerArray
    }
    for(var x = 0;x < ArrayOfNum.length;x++){
        var Per = (ArrayOfNum[x] / TotalNum) * 100
        var PerRounded = Per.toPrecision(4)
        PerArray.push(PerRounded + "%")
    }
    return PerArray
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