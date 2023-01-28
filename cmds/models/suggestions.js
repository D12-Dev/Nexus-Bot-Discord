const mongoose = require('mongoose')

const SuggestionsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Type: String,
    SuggestionNumber: String, 
    PersonName: String,
    RepliedTo: Boolean,
})
module.exports = mongoose.model("Suggestions", SuggestionsSchema);