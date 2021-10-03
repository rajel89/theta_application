const mongoose = require('mongoose');
const Joi = require('joi');

const postSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 1, maxlength: 255 },
    text: { type: String, minlength:1, maxlength: 1500},
});

const Post = mongoose.model('Post', postSchema);


function validatePost(post) {
    const schema = Joi.object({
        name: Joi.string().required().min(1).max(255),
        text: Joi.string().min(1).max(1500),

    });
    return schema.validate(post);
}
exports.Post = Post;
exports.validatePost = validatePost;
exports.postSchema = postSchema;