const {User, validateUser} = require('../models/user');
const {Post, validatePost} = require('../models/post');
const {ServicePackage, validatePackage} = require('../models/servicePackage');
const {CompletedProjects, validateProject} = require('../models/completedProjects');
const { JobApplications } = require('../models/jobApplications');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const express = require('express');
const admin = require('../middleware/admin');
const jwt = require('jsonwebtoken');
const router = express.Router();
const multer  = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './public/images');
    },
    filename: (req, file, cb) => {
    //   console.log(file);
      var filetype = '';
      if(file.mimetype === 'image/gif') {
        filetype = 'gif';
      }
      if(file.mimetype === 'image/png') {
        filetype = 'png';
      }
      if(file.mimetype === 'image/jpeg') {
        filetype = 'jpg';
      }
      
      cb(null, 'image-' + Date.now() + '.' + filetype);
    }
});
const upload = multer({storage: storage});

router.get('/dashboard',auth, async(req, res) => {
    
    try{
        let user = jwt.decode(req.headers.token);
        let dashboardData;

        User.findById(user._id)
        .then(user => {
            
            ServicePackage.find({"userId": user._id})
            .then(package => {
                
                CompletedProjects.find({"userId": user._id})
                .then(projects => {
                    dashboardData = {
                        profile: user ? user.profile : [],
                        servicePackage: package ? package : [],
                        completedProjects: projects ? projects :  []
                    }
    
                    res.status(200).send({success: true, dashboard: dashboardData, msg: ''});
                })
            });
        });

    }catch(e){
        return res.status(500).send(`Internal Server Error: ${e}`);
    }
});

router.get('/profile', auth, async(req, res) => {
    try{
        let user = jwt.decode(req.headers.token);

        User.findById(user._id)
        .then(user => {
            if(!user)
            {
                return res.status(200).send({
                    success: true,
                    profile: null,
                    msg: ''
                });
            }

            res.status(200).send({
                success: true,
                profile: user.profile,
                msg: ''
            })
        });

    }catch(e){
        return res.status(500).send(`Internal Server Error: ${e}`);
    }
});

router.post('/update-profile', auth, async(req, res) => {
    try{
        let user = jwt.decode(req.headers.token);
        let profile = {
            jobSkills: req.body.jobSkills,
            address: req.body.address,
            aboutMe: req.body.aboutMe
        }

        User.findByIdAndUpdate(user._id, {
            profile: profile
        }, {new: true})
        .then(user => {
            if(!user)
            {
                return res.status(404).send({message: "User record not found."})
            }

            let userDetails = {'_id': user._id, 'name': user.name, 'email': user.email, 'accountType' : user.accountType, 'profile': user.profile, 'isAvailable' : user.isAvailable}

            res.status(200).send({success: true, userDetails: userDetails, msg: "Successfully updated your profile."})
        
        }).catch(err => {
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "User not found with id " + user._id
                });                
            }
            return res.status(500).send({
                message: "Error updating User profile with id " + user._id
            });
        })

        // return res.status(200).send([user, profile]);
    }catch(e){
        return res.status(500).send(`Internal Server Error: ${e}`);
    }
});

router.post('/service-package/create', auth, async(req, res) => {
    try{
        const {error} = validatePackage(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        let package = await ServicePackage.findOne({ packageName: req.body.packageName});
        if (package) return res.status(400).send(`Package already exists`);

        package = new ServicePackage({
            userId: req.body.userId,
            packageName: req.body.packageName,
            packagePrice: req.body.packagePrice,
            inclusions: req.body.inclusions,
            isPopular: req.body.isPopular
        });
        await package.save();

        res.status(200).send({success: true, data: package, msg: "Successfully created new service package."});

    }catch(e){
        return res.status(500).send(`Internal Server Error: ${e}`);
    }
});

router.get('/service-package/lists', auth, async(req, res) => {
    try{
        let user = jwt.decode(req.headers.token);

        ServicePackage.find({"userId": user._id})
        .then(package => {
            if(!package)
            {
                return res.status(200).send({
                    success: true,
                    data: null,
                    msg: 'No service package created yet.'
                });
            }

            res.status(200).send({
                success: true,
                package: package,
                msg: ''
            })
        });

    }catch(e){
        return res.status(500).send(`Internal Server Error: ${e}`);
    }
});


router.get('/service-package/:id', auth, async(req, res) => {
    let user = jwt.decode(req.headers.token);
    try{
        ServicePackage.findById(req.params.id)
        .then(package => {
            // res.send(package)
            if(!package)
            {
                return res.status(400).send('Cannot find service package.');
            }

            res.status(200).send({
                success: true,
                package: package,
                msg: ''
            })
        });

    }catch(e){
        return res.status(500).send(`Internal Server Error: ${e}`);
    }
    
});

router.post('/service-package/:id/update', auth, async(req, res) => {

    try{
        ServicePackage.findByIdAndUpdate(req.params.id, {
            packageName: req.body.packageName,
            packagePrice: req.body.packagePrice,
            inclusions: req.body.inclusions,
            isPopular: req.body.isPopular
        }, {new: true})
        .then(package => {
            if(!package)
            {
                return res.status(404).send({message: "Service package record not found."})
            }

            res.status(200).send({success: true, package: package, msg: "Successfully updated your service package."})
        
        }).catch(err => {
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Package not found with id " + req.params.id
                });                
            }
            return res.status(500).send({
                message: "Error updating Package service with id " + req.params.id
            });
        })

    }catch(e)
    {
        return res.status(500).send(`Internal Server Error: ${e}`);
    }

});

router.post('/availability/save', auth, async(req, res) => {
    
    let user = jwt.decode(req.headers.token);

    User.findByIdAndUpdate(user._id, {
        isAvailable: req.body.isAvailable
    }, {new: true})
    .then(user => {
        if(!user)
        {
            return res.status(404).send({message: "User record not found."})
        }

        let userDetails = {'_id': user._id, 'name': user.name, 'email': user.email, 'accountType' : user.accountType, 'profile': user.profile, 'isAvailable' : user.isAvailable}

        res.status(200).send({success: true, userDetails: userDetails, msg: "Successfully updated your status."});
    
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "User not found with id " + req.params.id
            });                
        }
        return res.status(500).send({
            message: "Error updating User availability with id " + req.params.id
        });
    })
});

router.get('/availability/', auth, async(req, res) => {
    let user = jwt.decode(req.headers.token);
    User.findById(user._id)
        .then(user => {
            if(!user)
            {
                return res.status(400).send(`Cannot find user with id ${req.params.id}`);
            }

            res.status(200).send({
                success: true,
                isAvailable: user.isAvailable,
                msg: ''
            })
        });
});

router.post('/project/upload', upload.single('image') , async(req, res, next) => {
    let user = jwt.decode(req.headers.token);
    
    try{
        
        const {error} = validateProject(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        let project = new CompletedProjects({
            userId: user._id,
            name: req.body.name,
            description: req.body.description,
            image: 'images/' + req.file.filename
        });
        await project.save();

        res.status(200).send({success: true, project: project, msg: "Successfully added new project."});

    }catch(e)
    {
        return res.status(500).send(`Internal Server Error: ${e}`);
    }
});

router.get('/message/inbox', auth, async(req, res) => {
    let user = jwt.decode(req.headers.token);

    JobApplications.find({sellerId: user._id})
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