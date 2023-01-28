const Discord = require("discord.js");
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
const mongoose = require(`mongoose`)
module.exports.run = async (Client) => {
    client = Client
    try{
      console.log("Make settings command ran!")
      await MakeSettings()
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
    name: "MakePresetsCommand"
}   
    
    
    
async function MakeSettings() {
  await client.guilds.cache.forEach(async(guild) => {
      try{
        console.log(guild.name)
        
        await Modules.findOne({Type: "Modules", GuildId: guild.id}).exec(async function(err,check){
          if(check === null || check === undefined){
            const modules = new Modules({
              _id: mongoose.Types.ObjectId(),
              Type: "Modules",
              partys: true,
              bans: true,
              mutes: true,
              music: true,
              xp: true,
              ai: false,
              msglogs: true,
              guilds: true,
              announce: true,
              devtracker: false,
              welcome: true,
              GuildId: guild.id,
              shadowandsummer: false,
              eclipse: false,
              levelmsgs: true,
              cleanermusicmessages: true,
              highvolumes: false,
              nsfw: false
            })
            await modules.save()
            .then(result => console.log(result))
            .catch(err => console.log(err));
          }
          else{

          }
          
        })

        //////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        var MuteRole = await guild.roles.cache.find(role => role.name === "Nexus Mute");
        if(!MuteRole){
          if(guild.me.permissions.has("MANAGE_ROLES")){
            MuteRole = await guild.createRole({name: "Nexus Mute", color: "WHITE"}).then(role =>console.log(`Created new role with name ${role.name} and color ${role.color}`)).catch(console.error);
            await MuteRole.setPosition(guild.me.highestRole.position + 1)
          }
        }

        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
	      ///////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////
        var DJRole = await guild.roles.cache.find(async role => role.name === "DJ");
        if(!DJRole){
          if(guild.me.permissions.has("MANAGE_ROLES")){
            await guild.createRole({name:"DJ", color: "WHITE"}).then(role => console.log(`Created new role with name ${role.name} and color ${role.color}`)).catch(console.error)
          }
        }
        /////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////
        await NexusSettings.findOne({ Type: "Settings", GuildId: guild.id }).exec(async function(err,check){
          if(check === null || check === undefined){
            const Settings = new NexusSettings({
              _id: mongoose.Types.ObjectId(),
              Type: "Settings",
              WelcomeChannel: "n/a",
              BotLogsChannel: "n/a",
              MsgLogsChannel: "n/a",
              Prefix: ".",
              XPMultiplier: 0.5,
              GuildId: guild.id
            })
            await Settings.save()
            .then(result => console.log(result))
            .catch(err => console.log(err));
          }
          else{

          }
          
        })
        await NexusSettings.findOne({ Type: "Settings", GuildId: guild.id }).exec(async function(err,CheckForSettingsdoc){  
          const AddingPlaylistConstruct = {
            GuildPrefix: CheckForSettingsdoc.Prefix
          };
          PREFIXMap.set(guild.id, AddingPlaylistConstruct);
        })
        //////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////
        await guild.channels.cache.forEach(async(channel) => {
          if(MuteRole){
            if(channel.type == "text"){
              if(!channel.permissionsFor(guild.me).toArray().includes("MANAGE_ROLES"))return
              await channel.overwritePermissions(MuteRole,{
                SEND_MESSAGES: false
              })
            }
            else if(channel.type == "voice"){
              if(!channel.permissionsFor(guild.me).toArray().includes("MANAGE_ROLES"))return
              await channel.overwritePermissions(MuteRole,{
                SPEAK: false
              })
            }
          }
          console.log(` - ${channel.name} ${channel.type} ${channel.id}`)
        })
      }catch(err){
        let botlogschannel = await client.channels.cache.get("873587394224459818");
        let DevErrorEmbed = new Discord.MessageEmbed()
        .setTitle("**An error has occurred! ❌**")
        .setDescription("**"+ err + "**\n\n" + err.stack)
        .setAuthor(client.user.username)
        .setColor(0xFF0000)
        .setTimestamp(new Date())
        await botlogschannel.send({ embeds: [DevErrorEmbed] })
      }
    })
}