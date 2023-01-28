const mongoose = require('mongoose')

const PollsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Type: String,
    AmountOfAnswers: Number,
    UserMadeById: String,
    GuildID: String,
    ChannelID: String,
    MadeAtTime: Number,
    Duration: Number,
    PollMsgID: String,
    Answers: Array,
    Question: String
})
module.exports = mongoose.model("Polls", PollsSchema);