const mongoose = require('mongoose')

const WarnsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Type: String,
    OffenderUserName: String, 
    OffenderUserID: String,
    GivenByUserName: String,
    GivenByUserID: String,
    DateGiven: String,
    DateExact: String,
    Reason: String,
    GuildID: String,
})
module.exports = mongoose.model("Warns", WarnsSchema);