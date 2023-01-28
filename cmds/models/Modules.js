const mongoose = require("mongoose");

const modulesSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Type: String,
    partys: Boolean,
    bans: Boolean,
    mutes: Boolean,
    music: Boolean,
    xp: Boolean,
    ai: Boolean,
    msglogs: Boolean,
    guilds: Boolean,
    announce: Boolean,
    devtracker: Boolean,
    welcome: Boolean,
    GuildId: String,
    shadowandsummer: Boolean,
    eclipse: Boolean,
    levelmsgs: Boolean,
    cleanermusicmessages: Boolean,
    highvolumes: Boolean,
    nsfw: Boolean
})
module.exports = mongoose.model("Modules", modulesSchema);
