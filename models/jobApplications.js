const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi');
const { object } = require('joi');

const jobApplicationsSchema = new mongoose.Schema({
    sellerId: {type: String, required: true},
    seller: {type: Object, required: true},
    buyerId: {type: String, required: true},
    buyer: {type: Object, required: true},
    service: {type: Object},
    jobpost: {type: Object},
    status: {type: String}, /* [Hired, In Progress, Completed] */
    paymentComplete: {type: Boolean},
    conversation: {type: Array}
},{
    timestamps: true
});

const JobApplications = mongoose.model('jobApplications', jobApplicationsSchema);


function validateJobApplications(user) {
    const schema = Joi.object({
        sellerId: Joi.object().required(),
        seller: Joi.object().required(),
        buyerId: Joi.object().required(),
        buyer: Joi.object().required()
    });
    return schema.validate(user);
}

exports.JobApplications = JobApplications;
exports.validateJobApplications = validateJobApplications;
exports.jobApplicationsSchema = jobApplicationsSchema;