const Joi = require('joi');
const bcrypt = require('bcrypt');
const express = require('express');
const {User} = require('../models/user');
const router = express.Router();

router.post('/signin', async (req, res) => {
    try{
        const {error} = validateLogin(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({ email: req.body.email});
        if (!user) return res.status(400).send('Invalid email or password.');

        const validPassword = await bcrypt.compare(req.body.password, user.password);

        if (!validPassword) return res.status(400).send('Invalid email or password.')

        const token = user.generateAuthToken();
        let userDetails = {'_id': user._id, 'name': user.name, 'email': user.email, 'accountType' : user.accountType, 'profile': user.profile}

        return res.status(200).send({"success": true, "token": token, "userDetails" : userDetails, "isAvailable": user.isAvailable});
    }catch{
        return res.status(500).send(`Internal Server Error: ${ex}`);
    }
});

function validateLogin(req) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(1024).required(),
    });
    return schema.validate(req);
}
//comment

module.exports = router;