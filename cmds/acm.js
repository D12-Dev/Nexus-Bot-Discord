const Discord = require("discord.js");
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
    console.log("acm command ran.")
    await acmCommands(receivedMessage, args)
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
    name: "AcmCommand",
    trigger: "acm",
    aliases: []
}
//Special cases ONLY for "devtracker" and "eclipse"
let allmodules = ["ai", "bans", "mutes", "music", "xp", "msglogs", "guilds", "announce", "devtracker", "eclipse", "welcome", "lvlmsgs", "cleanermusicmessages", "highvolumes", "shadowandsummer"]
let moduleDesc = [/*ai*/"Controls the ai repsonses when you mention Nexus.", /*bans*/"Controls the ban commands. Useful if D12 breaks something again.", /*mutes*/"Controls the mute commands.", 
/*music*/"Allows you to play music through Nexus. We suggest \"Plankton Struggling for 1 hour\".", /*xp*/"Controls the XP commands and can be disabled to stop XP being earned", /*msglogs*/"Controls the bot uploading messages sent in channels to msg-logs!",
/*guilds*/"Controls the Guild commands such as .g create", /*announce*/"Controls the .announce command.", /*devtracker*/"[Nexus Dev Team Only] Controls the DevUpdate command and whilst this is off, you cannot post embed bot messages to the DevTracker channel",
/*eclipse*/"Enables eclipse commands.", /*welcome*/"Controls the welcome messages when someone joins the discord. Must have a set up channel using .settings welcomechannel <channel>", /*lvlmsgs*/"Controls when a user levels up, it posts a level up message.",
/*cleanermusicmessages*/"Deletes previous \"music playing\" embed when moving onto another song. Also better embeds.", /*highvolumes*/"Allows music volume to be set higher than 10.", "shadowandsummer module."]
let RestrictedModules = ["eclipse", "devtracker", "shadowandsummer"]
let RestrictedModulesGuilds  = [
    {"eclipse": ["657711363879337984", "911095119371972638"]},
    {"devtracker": "676874632078426180"},
    {"shadowandsummer": "399299233603387392"}
]
async function acmCommands(receivedMessage, args){
    if(!receivedMessage.member.permissions.has("ADMINISTRATOR")){
        return await receivedMessage.channel.send("Sorry, you can't modify this. Ask a server admin if something needs changing.")
      }
    if(args.length == 0){
        let noargsembed = new Discord.MessageEmbed()
        .setTitle("⚠️  Check 'yer syntax innit bruv")
        .setDescription("In non-South-London English, you didn't give us any arguments. Try running " + PREFIX + "acm help if you're unsure what to do.")
        .setColor(0xFFFF00)
        .setFooter("Listen to \"Bittersweet Symphony\". Hell of a song.")
        .setURL("https://www.youtube.com/watch?v=1lyu1KKwC74")
        return await receivedMessage.channel.send({embeds: [noargsembed]})
    }
    if(args[0].toLowerCase() == "help"){
        let ACMHelpEmbed =  new Discord.MessageEmbed()
        .setTitle("**ACM Help**")
        .setDescription("**One of these will do what you want. Unless you want food. Go to the kitchen for that.**")
        .addField(".acm help", "Not exactly sure how you got here without doing this one. Usage: .acm help", true)
        .addField(".acm enable", "Enables a module on your server. Usage: .acm enable <module>", true)
        .addField(".acm disable", "Disables a module on your server. Usage: .acm disable <module>", true)
        .addField(".acm modules", "Lists all modules Usage: .acm modules", true)
        .setAuthor(client.user.username)
        .setColor(0x5DFC0A)
        .setTimestamp(new Date())
        try{
            receivedMessage.delete()
        }catch(err){return}
        return await receivedMessage.author.send({embeds: [ACMHelpEmbed]})
    }
    if(args[0].toLowerCase() == "modules"){
        receivedMessage.delete()
        let ACMModulesEmbed = new Discord.MessageEmbed()
        .setTitle("**All Modules**")
        .setDescription("You can change any one of these. Give it a try!")
        .setColor(0x5DFC0A)
        .setTimestamp(new Date())
        for (let i = 0; i < allmodules.length; i++) {
            let RestrictedModule = await CheckIfARestricted(allmodules[i].toLowerCase())
            if((RestrictedModule != false) && (receivedMessage.guild.id != RestrictedModule)){
                continue
            }
            ACMModulesEmbed.addField(allmodules[i], moduleDesc[i])            
        }
        return await receivedMessage.author.send({embeds: [ACMModulesEmbed]}) 
    }
    if(args[0].toLowerCase() == "enable" || args[0].toLowerCase() == "disable"){
        var state;
        if(args.length < 2){
            let notenoughargsembed = new Discord.MessageEmbed()
            .setTitle("⚠️  Check 'yer syntax innit bruv")
            .setDescription("In non-South-London English, you didn't give us enough arguments. Try running " + PREFIX + "acm help if you're unsure what to do.")
            .setColor(0xFFFF00)
            .setFooter("Listen to \"Bittersweet Symphony\". Hell of a song.")
            .setURL("https://www.youtube.com/watch?v=1lyu1KKwC74")
            .setTimestamp(new Date())
         return await receivedMessage.channel.send({embeds: [notenoughargsembed]})
        }
        var str1
        var str2
        if(args[0].toLowerCase() == "enable"){ 
            state = true
            str1 = "Disabled"
            str2 = "Enabled"
        }else{
            state = false
            str1 = "Enabled"
            str2 = "Disabled"
        }
        
        if(!allmodules.includes(args[1].toLowerCase())){
            let notamoduleembed = new Discord.MessageEmbed()
            .setTitle("⚠️  That's not a module")
            .setDescription("You silly goose. Use \"" + PREFIX + "acm modules\" if you want to see what ones you can change.")
            .setColor(0xFFFF00)
            .setFooter("Listen to \"Bittersweet Symphony\". Hell of a song.")
            .setURL("https://www.youtube.com/watch?v=1lyu1KKwC74")
            .setTimestamp(new Date())
            return await receivedMessage.channel.send({embeds: [notamoduleembed]})
        }
        else{
            let RestrictedModule = await CheckIfARestricted(args[1].toLowerCase())
           // console.log(RestrictedModule.includes(receivedMessage.guild.id))
            if(Array.isArray(RestrictedModule)){
                if((RestrictedModule != false) && ((!RestrictedModule.includes(receivedMessage.guild.id)))){
                    let NoAccessmoduleembed = new Discord.MessageEmbed()
                    .setTitle("⚠️  Nah.") //lmao 
                    .setDescription("You silly goose. You do not have access to use this module.")
                    .setColor(0xFFFF00)
                    .setFooter("Listen to \"Bittersweet Symphony\". Hell of a song.")
                    .setURL("https://www.youtube.com/watch?v=1lyu1KKwC74")
                    .setTimestamp(new Date())
                    return await receivedMessage.channel.send({embeds: [NoAccessmoduleembed]})
                }
            }
            else{
                if((RestrictedModule != false) && (!receivedMessage.guild.id != RestrictedModule)){
                    let NoAccessmoduleembed = new Discord.MessageEmbed()
                    .setTitle("⚠️  Nah.") //lmao 
                    .setDescription("You silly goose. You do not have access to use this module.")
                    .setColor(0xFFFF00)
                    .setFooter("Listen to \"Bittersweet Symphony\". Hell of a song.")
                    .setURL("https://www.youtube.com/watch?v=1lyu1KKwC74")
                    .setTimestamp(new Date())
                    return await receivedMessage.channel.send({embeds: [NoAccessmoduleembed]})
                }

            }
            let ChangedOrNot = await modifyAcm(args[1].toLowerCase(), state);
            if(!ChangedOrNot){
                let AlreadyInThatStateEmbed = new Discord.MessageEmbed()
                .setTitle("❌  Module cannot be " + args[0].toLowerCase() + "d") 
                .setDescription("The state of that module is already " + args[0].toLowerCase() + "d.")
                .setColor(0x00ff00)
                .setFooter("You're a slave to money, then you die.")
                .setTimestamp(new Date())
                return await receivedMessage.channel.send({embeds: [AlreadyInThatStateEmbed]})
            }
            let ModuleModified = new Discord.MessageEmbed()
            .setTitle("✅  Module " + args[0].toLowerCase() + "d") 
            .setDescription("The worker monkeys that we ~~stole from Brazil~~ obtained legally have made the change.")
            .addField("Module \"" + args[1].toLowerCase() + "\"", str1 + " -> " + str2, true) 
            .setColor(0x00FF00)
            .setFooter("You're a slave to money, then you die.")
            .setTimestamp(new Date())
            return await receivedMessage.channel.send({embeds: [ModuleModified]})
        }
    }
    else{
        let NoAccessmoduleembed = new Discord.MessageEmbed()
                .setTitle("⚠️  Nah.") //lmao 
                .setDescription("You silly goose. You gave us an invalid state.")
                .setColor(0xFFFF00)
                .setFooter("Listen to \"Bittersweet Symphony\". Hell of a song.")
                .setURL("https://www.youtube.com/watch?v=1lyu1KKwC74")
                .setTimestamp(new Date())
                return await receivedMessage.channel.send({embeds: [NoAccessmoduleembed]})
        return
    }   
    async function modifyAcm(module, state){
        var ModuleChangedOrNot;
        let moduleDoc = await Modules.findOne({Type:"Modules", GuildId: receivedMessage.guild.id})
        if(moduleDoc[module] == state){
            return ModuleChangedOrNot = false
        }
        moduleDoc[module] = state
        moduleDoc.save()
        ModuleChangedOrNot = true
        return ModuleChangedOrNot
    }
}


async function CheckIfARestricted(Module){
    var returnedRestricted;
    for(i = 0; i < RestrictedModulesGuilds.length;i++){
        if(RestrictedModulesGuilds[i][Module]){
            returnedRestricted = RestrictedModulesGuilds[i][Module]
            break
        }
    }
    if(!returnedRestricted){
        return false
    }
    else{
        return returnedRestricted
    }
}




