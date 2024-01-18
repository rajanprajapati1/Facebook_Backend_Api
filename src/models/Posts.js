const mongoose = require('mongoose');


const PostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    caption: {
        type: String
    },
    Image: {
        type: String
    },
    likes :[
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
        }
    ],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }]
} , {
    timestamps : true
})
const Post = mongoose.model('Posts', PostSchema);


module.exports.Posts = Post;