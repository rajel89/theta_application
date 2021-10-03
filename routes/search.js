const {User, validateUser} = require('../models/user');
const {ServicePackage, validatePackage} = require('../models/servicePackage');
const {CompletedProjects, validateProject} = require('../models/completedProjects');
const {JobPost, validateJobPosting} = require('../models/jobPosting');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const express = require('express');
const admin = require('../middleware/admin');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/services', auth, async(req, res) => {
    try{
        ServicePackage.find({ $text: { $search: req.body.search } } )
        .then(services => {
            if(!services)
            {
                res.status(404).send('Something went wrong.');
            }
            res.status(200).send({
               success: true,
               services: services,
               msg: '' 
            });
        })
    }catch(e)
    {
        return res.status(500).send(`Internal Server Error: ${e}`);
    }
});

module.exports= router;