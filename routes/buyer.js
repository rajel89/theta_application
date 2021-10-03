const {User, validateUser} = require('../models/user');
const {ServicePackage, validatePackage} = require('../models/servicePackage');
const {CompletedProjects, validateProject} = require('../models/completedProjects');
const {JobPost, validateJobPosting} = require('../models/jobPosting');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const express = require('express');
const admin = require('../middleware/admin');
const jwt = require('jsonwebtoken');
const { JobApplications } = require('../models/jobApplications');
const router = express.Router();

router.post('/jobs/create', auth, async(req, res) => {
    let user = jwt.decode(req.headers.token);

    try{
        const {error} = validateJobPosting(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        let jobpost = new JobPost({
            userId: user._id,
            title: req.body.title,
            description: req.body.description,
            budget: req.body.budget
        });
        await jobpost.save();
        
        return res.status(200).send({
            success: true,
            jobpost: jobpost,
            msg: 'You have successfully created a new job.'
        });
    }catch(e){

        return res.status(500).send(`Internal Server Error: ${e}`);
    }
});

router.post('/jobs/:id/update', auth, async(req, res) => {
    let user = jwt.decode(req.headers.token);

    try{
        const {error} = validateJobPosting(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        JobPost.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            description: req.body.description,
            budget: req.body.budget
        }, {new: true})
        .then(jobpost => {
            if(!jobpost)
            {
                return res.status(404).send({message: "Job post record not found."})
            }

            return res.status(200).send({
                success: true,
                jobpost: jobpost,
                msg: 'You have successfully created a new job.'
            });

        }).catch(err => {
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Job post not found with id " + req.params.id
                });                
            }
            return res.status(500).send({
                message: "Error updating Job post with id " + req.params.id
            });
        })
        
        
    }catch(e){

        return res.status(500).send(`Internal Server Error: ${e}`);
    }
});

router.get('/jobs', auth, async(req, res) => {
    let user = jwt.decode(req.headers.token);

    JobPost.find({userId: user._id})
    .then(jobpost => {
        if(!jobpost)
        {
            return res.status(400).send(`Cannot find job post with id ${user._id}`);
        }

        res.status(200).send({
            success: true,
            jobpost: jobpost,
            msg: ''
        })
    });
});

router.get('/jobs/:id', auth, async(req, res) => {
    let user = jwt.decode(req.headers.token);

    JobPost.findById(req.params.id)
    .then(jobpost => {
        if(!jobpost)
        {
            return res.status(400).send(`Cannot find job post with id ${user._id}`);
        }

        res.status(200).send({
            success: true,
            jobpost: jobpost,
            msg: ''
        })
    });
});

router.get('/view/freelancers-profile/:id', auth, async(req, res) => {
    let user = jwt.decode(req.headers.token);

    User.findById(req.params.id)
    .then(profile => {
        if(!profile)
        {
            return res.status(400).send(`Cannot find freelancer's profile with id ${user._id}`);
        }

        ServicePackage.find({"userId": profile._id})
        .then(package => {
            CompletedProjects.find({"userId": profile._id})
            .then(projects => {
                
                res.status(200).send({
                    success: true,
                    profile: profile,
                    services: package,
                    completedProjects: projects,
                    msg: ''
                });
            })
        });
    });
});

router.post('/hire/freelance', auth, async(req, res) => {
    let user = jwt.decode(req.headers.token);

   User.findOne({_id: req.body.sellerId})
    .then(sellerData => {

        if(!sellerData)
        {
            return res.status(404).send({message: "Seller record not found."})
        }

        let jobApplication = new JobApplications({
            sellerId: sellerData._id,
            seller: {_id: sellerData._id, name: sellerData.name, email: sellerData.email},
            buyerId: user._id,
            buyer: {_id: user._id, name: user.name, email: user.email},
            service: req.body.service,
            status: 'Hired',
            conversation: [{userId: user._id, sender: user.name, message: req.body.message}]
        });
    
        jobApplication.save();
    
        return res.status(200).send({
            success: true,
            jobApplication: jobApplication,
            msg: 'You have successfully hired the freelancer'
        });
        
    });

    

    
});

router.get('/hired/freelancers', auth, async(req, res) => {
    let user = jwt.decode(req.headers.token);

    JobApplications.find({buyerId: user._id})
    .then(jobApplications => {
        
        res.status(200).send({
            success: true,
            jobApplications: jobApplications,
            msg: ''
        });

    });
});

router.post('/message/send', auth, async(req, res) => {
    let user = jwt.decode(req.headers.token);

    JobApplications.findByIdAndUpdate(req.body._id, {
        conversation: req.body.conversation
    }, {new:true})
    .then(jobApplications => {
        if(!jobApplications)
        {
            return res.status(404).send({message: "Job post record not found."})
        }

        return res.status(200).send({
            success: true,
            jobApplications: jobApplications,
            msg: ''
        });

    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Message not found with id " + req.body._id
            });                
        }
        return res.status(500).send({
            message: "Error saving Message with id " + req.body._id
        });
    });
});

module.exports= router;