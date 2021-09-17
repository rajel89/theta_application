const {User, validateUser} = require('../models/user');
const {Post, validatePost} = require('../models/post');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const express = require('express');
const admin = require('../middleware/admin');
const router = express.Router();


//functions to be able to GET, POST, PUT user//

//This is finding user
router.get('/', async (req, res) => {
    try{
        const users = await User.find();
        return res.send(users);
    }catch(ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});

//This is finding user by ID
router.get('/:id', async (req, res) => {
    try{
        const user = await User.findById(req.params.id);
        if(!user)
            return res.status(400).send(`The user with id "${req.params.id}" does not exist.`);
            return res.send(user);
    }catch(ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});

//This is finding a user's POST
router.get('/:userId/post', async (req, res) => {
    try{
        const user = await User.findById();
        const { error } = validatePost(req.body);
        const post = await Post.findById(req.params.id);
        if(!post)
            return res.status(400).send(`The post with id "${req.params.id}" does not exist.`);
            return res.send(post);
    }catch(ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});


//This is to create a USER with authentication requirement using jwtToken//
router.post('/', auth, async (req, res) => {
    try{
        const {error} = validateUser(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({ email: req.body.email});
        if (user) return res.status(400).send(`User already registered.`);

        const salt = await bcrypt.genSalt(10);
        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, salt),
            services: [],
        });
        await user.save();

        const token = user.generateAuthToken();

        return res
            .header('x-auth-token', token)
            .header('access-control-expose-headers', 'x-auth-token')
            .send({_id: user._id, name: user.name, email: user.email})
    }catch (ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});

//Update user information e-mail, name, password
router.put('/:id', async (req, res) => {
    try{
        const {error} = validateUser(req.body);
        if(error) return res.status(400).send(error);
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                email: req.body.email,
                name: req.body.name,
                password: req.body.password,
                //locality: req.body.locality,
            },
            {new: true}
        );
        if (!user)
            return res.status(400).send(`The person with id "${req.params.id}" does not exist.`);
            await user.save();
            return res.send(user);
    }catch (ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});


//This is to delete a services posted
router.delete('/:userId/post/postId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.postId);
        if(!user) return res.status(400).send(`The user with id "${req.params.postId}" does not exist.`);

        post = await post.remove();

        await user.save();
        return res.send(user.post);
    }catch (ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});





module.exports= router;