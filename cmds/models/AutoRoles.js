const mongoose = require("mongoose");

const AutoRoleSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Type: String,
    RoleID: String,
    GuildId: String
})
module.exports = mongoose.model("AutoRoles", AutoRoleSchema);