const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi');
const { object } = require('joi');

const completedProjectSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    name: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String}
},{
    timestamps: true
});

const CompletedProjects = mongoose.model('completedProject', completedProjectSchema);


function validateProject(user) {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string()
    });
    return schema.validate(user);
}

exports.CompletedProjects = CompletedProjects;
exports.validateProject = validateProject;
exports.completedProjectSchema = completedProjectSchema;