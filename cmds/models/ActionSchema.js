const mongoose = require("mongoose");

const ActionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Type: String,
    UsersID: String,
    Amount: Number,
    GiversIDs: Array
})
module.exports = mongoose.model("Actions", ActionSchema);