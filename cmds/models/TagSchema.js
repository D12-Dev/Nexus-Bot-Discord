const mongoose = require('mongoose')

const TagsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Type: String,
    PermissionLevel: String, 
    Tags: Array,
    GuildID: String,
})
module.exports = mongoose.model("Tags", TagsSchema);