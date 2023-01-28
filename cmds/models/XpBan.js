const mongoose = require("mongoose");

const XpBanSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Type: String,
    UserID: String,
    UserName: String,
    PunishmentGiverID: String,
    PunishmentGiverUsername: String,
    Reason: String,
    Time: String,
    GuildId: String,
})
module.exports = mongoose.model("XpBans", XpBanSchema);
