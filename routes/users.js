const {User, validateUser} = require('../models/user');
const {Post, validatePost} = require('../models/post');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const express = require('express');
const admin = require('../middleware/admin');
const router = express.Router();


//functions to be able to GET, POST, PUT user//

//This is finding user by ID, the users ID will cary the services offered listed as a array of services.
//Admin only
router.get('/', async (req, res) => {
    try{
        const users = await User.find();
        return res.send(users);
    }catch(ex){
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});

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

//update seller status from seller to buyer
router.put('/:id', async (req, res) => {
    try{
        const {error} = validateUser(req.body.id);
        if(error) return res.status(400).send(error);
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                email: req.body.email,
                name: req.body.name,
                password: req.body.password,
                accountType: req.body.accountType
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

router.post('/register', async(req, res) => {
    // return res.send(req.body);
    try{
        
        let validation = validateUser(req.body);
        if(validation?.error)
        {
            res.status(400).send(validation.error.details[0].message);
        }

        let user = await User.findOne({ email: req.body.email});
        if (user) return res.status(400).send(`Email ${req.body.email} was already registered.`);

        const salt = await bcrypt.genSalt(10);
        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: await bcrypt.hash(req.body.password, salt),
            accountType: req.body.accountType

        });
        await user.save();
        
        if(req.body.accountType == "seller")
        {
            let msg = "You're all set. Now you can create service packages and start generating revenue.";
            return res.status(200).send({"success" : true, "data": {"name" : req.body.name, "email": req.body.email}, "msg": msg})
        }else if(req.body.accountType == "buyer")
        {
            let msg = "You're all set. Now you can start hire feelancers to grow your business.";
            return res.status(200).send({"success" : true, "data": {"name" : req.body.name, "email": req.body.email}, "msg": msg})
        }


    }catch(e){
        return res.status(500).send(`Internal Server Error: ${e}`);
    }
});

router.get('/dashboard/seller', async(req, res) => {
    
    try{
        
        return res.status(200).send("test");

    }catch(e){
        return res.status(500).send(`Internal Server Error: ${e}`);
    }
});




module.exports= router;