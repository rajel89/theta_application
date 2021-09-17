const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi');
const {postSchema} = require('./post');

const userSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 1, maxlength: 50},
    email: {type: String, unique: true, required: true, minlength:1, maxlength: 255},
    password: {type: String, required: true, maxlength: 1024, minlength: 5},
    //about:{type: String, required: true, maxlength: 1024, minlength: 1},
    // locality:{type: String, required: true, maxlength: 1024, minlength: 1},
    isAdmin: {type: Boolean, default: false},
    posts:[postSchema],

});

userSchema.methods.generateAuthToken = function(){
    return jwt.sign({_id: this._id, name: this.name, isAdmin: this.isAdmin}, config.get('jwtSecret'));
};

const User = mongoose.model('User', userSchema);


function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(1).max(50).required(),
        email: Joi.string().min(5).max(255).required(),
        password: Joi.string().min(1).max(1024).required(),
    });
    return schema.validate(user);
}

exports.User = User;
exports.validateUser = validateUser;
exports.userSchema = userSchema;