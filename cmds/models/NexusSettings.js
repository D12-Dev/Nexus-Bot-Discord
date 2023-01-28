const mongoose = require("mongoose");

const NexusSettingsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Type: String,
    NoNexusChannels: Array,
    NoXpChannels: Array,
    WelcomeChannel: String,
    BotLogsChannel: String,
    MsgLogsChannel: String,
    Prefix: String,
    XPMultiplier: Number,
    GuildId: String,
})
module.exports = mongoose.model("NexusSettings", NexusSettingsSchema);
