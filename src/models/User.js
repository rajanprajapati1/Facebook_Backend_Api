const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email:
    {
        type: String, require: true, index: true, unique: true,
        sparse: true
    },

    Birthday: {
        type: String,
    },
    password: {
        type: String,
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Posts', // Use 'Posts' with capital 'P'
    }],
    // friends: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Post',
    // }],
});

const User = mongoose.model('User', userSchema);

module.exports.User = User;
