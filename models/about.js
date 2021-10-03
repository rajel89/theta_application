const mongoose = require('mongoose');
const Joi = require('joi');

const aboutSchema = new mongoose.Schema({
    text: { type: String, minlength:1, maxlength: 1500},
});

const About = mongoose.model('About', aboutSchema);


function validateAbout(about) {
    const schema = Joi.object({
        name: Joi.string().required().min(1).max(255),
        text: Joi.string().min(1).max(1500),

    });
    return schema.validate(about);
}
exports.About = About;
exports.validateAbout = validateAbout;
exports.aboutSchema = aboutSchema;