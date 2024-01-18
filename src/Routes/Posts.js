const router = require('express').Router();
const { Posts } = require('../models/Posts');
const multer = require('multer');
const path = require('path');
const { User } = require('../models/User');
const { Comment } = require('../models/Comment');

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../../src/images'),
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

// Get
router.get("/", async (req, res) => {
    try {
        const PostsData = await Posts.find().populate('userId').populate({
            path: 'comments',
            populate: {
                path: 'userId',
                model: User  // Reference the User model
            }
        });;
        res.status(200).json({ Posts: PostsData, success: true });
    } catch (error) {
        console.log(error)
    }
})
// get single post
router.get("/:id", async (req, res) => {
    const PostId = req.params.id;
    try {
        const PostsData = await Posts.findById(PostId)
        .populate('userId')
        .populate({
            path: 'comments',
            populate: {
                path: 'userId',
                model: User  // Reference the User model
            }
        });
        res.status(200).json({ Post: PostsData, success: true });
    } catch (error) {
        console.log(error)
    }
})
// Post New Posts
router.post("/upload", upload.single('image'), async (req, res) => {
    const UserId = req.body.userid;
    try {
        const newPost = await Posts.create({
            userId: UserId,
            caption: req.body.caption,
            Image: req.file.filename,
            likes: [],
            comments: [],
        });
        const user = await User.findById(UserId);
        user.posts.push(newPost._id);
        await user.save();
        res.status(200).json({ msg: newPost, success: true, message: "Post Uploaded successfully" });
    } catch (error) {
        res.status(404).json({ msg: 'Post not Uploaded', error: error });
    }
});
// Post Likes
router.post("/:postId/like", async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.body.userId;
        const post = await Posts.findById(postId);

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        const likesArray = post.likes || [];
        const existingLike = likesArray.find(like => like && like.userId && like.userId.toString() === userId.toString());

        if (existingLike) {
            return res.status(400).json({ success: false, message: "User already liked this post" });
        }

        post.likes.push({ userId: userId });
        await post.save();

        await post.populate('likes');

        res.status(200).json({ success: true, message: "Post liked successfully" });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// comment on posts
router.post("/:postId/comment", async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.body.userId;
        const commentText = req.body.commentText;
        const post = await Posts.findById(postId);

        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        const CommentsArray = post.comments || [];
        // const existingLike = CommentsArray.find(comment => comment && comment.userId && comment.userId.toString() === userId.toString());

        // if (existingLike) {
        //     return res.status(400).json({ success: false, message: "User already Comment this post" });
        // }
        const newComment = await Comment.create({
            userId: userId,
            commentText: commentText,
        })
        post.comments.push(newComment._id);
        await post.save()
        await post.populate('comments');

        res.status(200).json({ success: true, message: "Post Commented successfully" });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
