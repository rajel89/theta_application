const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi');
const { object } = require('joi');

const jobPosting = new mongoose.Schema({
    userId: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    budget: {type: String}
},{
    timestamps: true
});

const JobPost = mongoose.model('jobPost', jobPosting);


function validateJobPosting(user) {
    const schema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        budget: Joi.string()
    });
    return schema.validate(user);
}

exports.JobPost = JobPost;
exports.validateJobPosting = validateJobPosting;
exports.jobPosting = jobPosting;