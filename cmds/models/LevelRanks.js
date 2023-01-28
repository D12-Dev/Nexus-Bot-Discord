const mongoose = require("mongoose");

const AutoLevelSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Type: String,
    RoleID: String,
    Level: Number,
    GuildId: String
})
module.exports = mongoose.model("AutoLevelRoles", AutoLevelSchema);