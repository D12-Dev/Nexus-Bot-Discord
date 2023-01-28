const Discord = require("discord.js");
var client
const Modules = require(`../cmds/models/Modules.js`)
const NexusSettings = require(`../cmds/models/NexusSettings.js`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)
/*


*/
var EmojiRoleArray = {
    "❤️": "1033782979031482489",
    "🧡": "1033783028125794344",
    "💛":"1033783066369462302",
    "💚":"1033783106513162362",
    "💙":"1033783149496373248",
    "💜": "1033783189652635690",
    "🌑": "1033783255863926864",
    "🌘": "1033783302336819320",
    "🌗":"1033783353180172339",
    "🌖":"1033783404614914119",
    "🌕":"1033783456116773054",
    "🌔": "1033826994414166076",
    "🌓":"1033783501897605250",
    "🌒": "1033783552527048764",
    "💝":"1033783613810020412",
    "🔒": "1033783650363396116",
    "❤️‍🩹":"1033783708005703781",
    "💕": "1033783756705759343",
    "💖": "1033783885416374382",
    "🤍": "1033783933365669898",
    "⛩️":"1033784180817002526",
    "🏰": "1033784223800230001",
    "🦁": "1033784283560685588",
    "🌊": "1033784334919933992",
    "🗽": "1033784553426387005",
    "💃": "1033784597646946434",
    "❄️":"1033784648096030850",
    "☀️": "1033784700893921391",
    "🛡️": "1033784748608344074",
    "🦋": "1033784800508653699",
    "🎨": "1033784852220219472",
    "🎮": "1033784905802469427",
    "💅": "1033784967462928454",
    "🍆": "1033785037117735133",
    "🖤": "1033785088535695411",
    "♀️": "1033828791371448410",
    "♂️": "1033828687843434626",
}
//console.log(EmojiRoleArray["❤️"])
const mongoose = require(`mongoose`)
module.exports.run = async (user, Client, reaction) => {
    client = Client
    try{
      console.log("react command ran!")
      await ReactAndRole(user, reaction)
    }catch(err){
      console.log(err)
      let botlogschannel = await client.channels.cache.get("873587394224459818");
      let DevErrorEmbed = new Discord.MessageEmbed()
      .setTitle("**An error has occurred! ❌**")
      .setDescription("**"+ err + "**\n\n" + err.stack)
      .setAuthor(client.user.username)
      .setColor(0xFF0000)
      .setTimestamp(new Date())
      await botlogschannel.send({ embeds: [DevErrorEmbed] })
    }
}
module.exports.help = {
    name: "GiveReactRole"
}   
    
    
    
async function ReactAndRole(user, reaction){
    var Channel = await client.channels.cache.get("1033460728495087616")
    var messagearray = ["1033851392294649947", "1033851883367956531", "1033852146438918256", "1033852604112969749", "1033852604112969749", "1033852731523342406"]
    let member = reaction.message.guild.members.cache.get(user.id);
    let messageid = reaction.message.id
    if (!Channel)return
    if(messagearray.includes(messageid)){
        //console.log(member)
        //console.log(reaction.message)
        let roleid = EmojiRoleArray[reaction.emoji.name]
        let role = reaction.message.guild.roles.cache.get(roleid)
        await member.roles.add(role)
        let roleaddedembed = new Discord.MessageEmbed()
        .setTitle("Role Added!!")
        .setDescription("**Role: " + role.name + " has been added to you!**")
        .setURL("http://bit.ly/33fVhjm")
        .setFooter("Nexus © - Click the title for a surprise ;)")
        .setColor(0x00FF00)
        try{
          await member.send({embeds: [roleaddedembed]})
        }catch{
            return
            /// dm closed
        }
    }
    ///////////////////////////
}