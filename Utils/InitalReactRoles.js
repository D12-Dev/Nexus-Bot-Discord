const Discord = require("discord.js");
var client
const Modules = require(`../cmds/models/Modules.js`)
const NexusSettings = require(`../cmds/models/NexusSettings.js`)
var {PREFIXMap, NexusVersion} = require(`../core-nexus`)

const mongoose = require(`mongoose`)
module.exports.run = async (Client) => {
    client = Client
    try{
      console.log("react command ran!")
      await InitReactRole()
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
    name: "InitReactRole"
}   
    


async function InitReactRole(){
    var Channel = await client.channels.cache.get("1033460728495087616")
    var message1 = await Channel.messages.fetch("1033851392294649947")
    message1.react("❤️")
    message1.react("🧡")
    message1.react("💛")
    message1.react("💚")
    message1.react("💙")
    message1.react("💜")
    ///////////////////////////
    var Channel = await client.channels.cache.get("1033460728495087616")
    var message2 = await Channel.messages.fetch("1033851883367956531")
    message2.react("🌑")
    message2.react("🌘")
    message2.react("🌗")
    message2.react("🌖")
    message2.react("🌕")
    message2.react("🌔")
    message2.react("🌓")
    message2.react("🌒")
    var Channel = await client.channels.cache.get("1033460728495087616")
    var message3 = await Channel.messages.fetch("1033852146438918256")
    message3.react("💝")
    message3.react("🔒")
    message3.react("❤️‍🩹")
    message3.react("💕")
    message3.react("💖")
    message3.react("🤍")
    var Channel = await client.channels.cache.get("1033460728495087616")
    var message4 = await Channel.messages.fetch("1033852416803737670")
    message4.react("⛩️")
    message4.react("🏰")
    message4.react("🦁")
    message4.react("🌊")
    message4.react("🗽")
    message4.react("💃")
    var Channel = await client.channels.cache.get("1033460728495087616")
    var message4 = await Channel.messages.fetch("1033852604112969749")
    message4.react("❄️")
    message4.react("☀️")
    message4.react("🛡️")
    message4.react("🦋")
    message4.react("🎨")
    message4.react("🎮")
    message4.react("💅")
    message4.react("🍆")
    message4.react("🖤")
    var Channel = await client.channels.cache.get("1033460728495087616")
    var message5 = await Channel.messages.fetch("1033852731523342406")
    message5.react("♀️")
    message5.react("♂️")
}