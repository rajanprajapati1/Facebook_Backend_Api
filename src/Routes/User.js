const router = require('express').Router();
const { User } = require('../models/User');
const bcryptjs = require('bcryptjs');
const authenticateUser = require('../Auth/Authentication')

router.get('/',async (req, res) => {

    const users = await User.find().populate({
        path: 'posts',
    });

    res.status(200).json({ success: true, users });
});

router.get("/:userid/posts", async (req, res) => {
    try {
        const userid = req.params.userid;
        const user = await User.findById(userid).populate({
            path: 'posts',
            populate: {
                path: 'likes.userId', // Correct path to userId
                model: 'User',
                select: 'name email', // Add any other fields you want to include
            },
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const userPosts = {
            _id: user._id,
            name: user.name,
            email: user.email,
            posts: user.posts.map(post => {
                console.log("Post:", post);
                return {
                    _id: post._id,
                    caption: post.caption,
                    Image: post.Image,
                    likes: post.likes.map(like => ({
                        userId: like.userId ? like.userId._id : null,
                        name: like.userId ? like.userId.name : null,
                        email: like.userId ? like.userId.email : null,
                    })),
                    createdAt: post.createdAt,
                };
            }),
        };
        res.status(200).json({ success: true, userPosts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/signup', async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.Email }); // Corrected here
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email is already taken.' });
        }
        const hashedPassword = bcryptjs.hashSync(req.body.Password, 10);
        const NewUser = new User({
            name: req.body.Name,
            email: req.body.Email,
            Birthday: req.body.DOB,
            password: hashedPassword
        });
        const savedUser = await NewUser.save();
        res.status(201).json({ Success: true, User: savedUser, Msg: "Successfully Created" });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(400).json({ Success: false, Msg: "Unsuccessfully", error: error.message });
    }
});

router.post('/login', async (req, res) => {
    console.log(req.body);
    try {
        const user = await User.findOne({ email: req.body.Email }).populate({
            path: 'posts',
        });
        if (user) {
            const isPasswordValid = bcryptjs.compareSync(req.body.Password, user.password);
            if (isPasswordValid) {
                req.session.user = {
                    _id : user._id,
                    name : user.name,
                    email  :user.email ,
                }
                res.status(200).json({ msg: user, success: true, user: req.session.user , message: "Login successfully" });
            } else {
                res.status(401).json({ msg: 'Invalid credentials' });
            }
        } else {
            res.status(404).json({ msg: 'User not found' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
});

router.post('/logout', (req, res) => {
    // Clear the user session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error during logout:', err);
        res.status(500).json({ success: false, msg: 'Internal server error' });
      } else {
        res.status(200).json({ success: true, msg: 'Logout successful' });
      }
    });
  })

  router.get('/session', async (req, res) => {
    try {
      if (req.session.user) {
        const userId = req.session.user._id;
        const user = await User.findById(userId);
        res.status(200).json({ success: true, user });
      } else {
        res.status(401).json({ success: false, message: 'User not authenticated' });
      }
    } catch (error) {
      console.error('Error fetching session data:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });


module.exports = router;
