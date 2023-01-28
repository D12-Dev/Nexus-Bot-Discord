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

module.exports.run = async (guild, Client) => {
    client = Client
    PREFIXToSet = await PREFIXMap.get(guild.id)
    if(!PREFIXToSet){
      PREFIX = "."
    }
    else{
      PREFIX = PREFIXToSet.GuildPrefix
    }
    try{
      console.log("Bot added to guild command ran!")
      await MakeSettings(guild)
      await MakeJoinEmbed(guild)
      await MakeNexusDevJoinMsg(guild)
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
    name: "BotAddedToGuild"
}   
    
    
    
async function MakeSettings(guild) {
  try{
        console.log("Joined a new guild: " + guild.name);
        console.log("[Settings] Starting query to server!")
        ///////////////////////////////////////////////////////
        ///////////////////////////////////
        let Settings = new NexusSettings({
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
          .catch(err => console.log("[Settings] An error has occured. Error: " + err));
          console.log("[Settings] Set up all settings for " + guild.name)
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
            highvolumes: false
          })
              await modules.save()
              .then(result => console.log(result))
              .catch(err => console.log("[Modules] An error has occured. Error: " + err));
              console.log("[Modules] Set up all modules for " + guild.name)
              await NexusSettings.findOne({ Type: "Settings", GuildId: guild.id }).exec(async function(err,CheckForSettingsdoc){  
                const AddingPlaylistConstruct = {
                  GuildPrefix: CheckForSettingsdoc.Prefix
                };
                PREFIXMap.set(guild.id, AddingPlaylistConstruct);
              })
              var MuteRole = await guild.roles.find(
                role =>
                  role.name ===
                  "Nexus Mute"
                );
              if(!MuteRole){
                if(!guild.me.permissions.has("MANAGE_ROLES")){
                  
                }
                else{
                  MuteRole = await guild.createRole({name: "Nexus Mute", color: "WHITE"}).then(role =>console.log(`Created new role with name ${role.name} and color ${role.color}`)).catch(console.error);
                  await MuteRole.setPosition(guild.me.highestRole.position + 1)
                }
              }
      
              /////////////////////////////////////////////////////////////////
              /////////////////////////////////////////////////////////////////
              ///////////////////////////////////////////////////////
              ///////////////////////////////////////////////////////
              var DJRole = await guild.roles.find(role => role.name === "DJ");
              if(!DJRole){
                if(!guild.me.permissions.has("MANAGE_ROLES")){
                  
                }
                else{
                  await guild.createRole({name:"DJ", color: "WHITE"}).then(role => console.log(`Created new role with name ${role.name} and color ${role.color}`)).catch(console.error)
                }
              }
              if(MuteRole){
                await guild.channels.forEach(async(channel) => {
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
                })
              }
              return
        }catch(err){
            let botlogschannel = client.channels.cache.get("873587394224459818");
            if(!botlogschannel.permissionsFor(botlogschannel.guild.me).has("EMBED_LINKS"))return
            let DevErrorEmbed =  new Discord.MessageEmbed()
            .setTitle("**An error has occurred! ❌**")
            .setDescription("**"+ err + "**\n\n" + err.stack)
            .setAuthor(client.user.username)
            .setColor(0xFF0000)
            .setTimestamp(new Date())
            await botlogschannel.send({ embeds: [DevErrorEmbed]})
        }
}

async function MakeJoinEmbed(guild){
    let JoinEmbed = new Discord.MessageEmbed()
    .setTitle("Thanks for adding Nexus to your server!")
    .setDescription("You can customize Nexus's options by running the commands .acm and .settings.\n\nFor more help about this bot please run the .help command.")
    .addField("Tos:", "By using this bot you accept all of Nexus's [TOS](https://top.gg/bot/673285454724071456).")
    .addField("Support:", "The offical Nexus support server ---> [Nexus Support](https://discord.gg/KANGu7j).")
    .setURL("http://bit.ly/33fVhjm")
    .setThumbnail("https://i.gifer.com/8R9h.gif")
    .setFooter("Nexus © - Click the title for a surprise ;)")
    .setColor(0x00FF00)
    let SentingChannelJoinEmbed = await guild.channels.filter(c => c.type === "text" && c.permissionsFor(guild.client.user).has("SEND_MESSAGES", "EMBED_LINKS", "VIEW_CHANNEL")).sort((a, b) => a.position - b.position || Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber()).first();
    if(!SentingChannelJoinEmbed)return
    await SentingChannelJoinEmbed.send(JoinEmbed)
}
async function MakeNexusDevJoinMsg(guild){
  /*var JoinChannel = await client.channels.cache.get("691659278284619827")
  try{
    await JoinChannel.send(`Someone has invited Nexus to their server: \`${guild.name}\` Currently server count: ${client.guilds.size}`)
  }catch(err){
    return console.log("The Nexus Join Channel has been deleted!")
  }*/
}