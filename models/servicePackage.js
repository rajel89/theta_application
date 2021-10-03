const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi');
const { object } = require('joi');

const servicePackageSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    packageName: {type: String, required: true},
    packagePrice: {type: String, required: true},
    inclusions: {type: Array, required: true},
    isPopular: {type: Boolean}
});

servicePackageSchema.index({packageName: 'text', packagePrice: 'text'});

const ServicePackage = mongoose.model('ServicePackage', servicePackageSchema);
ServicePackage.createIndexes();

function validatePackage(user) {
    const schema = Joi.object({
        userId: Joi.string().required(),
        packageName: Joi.string().required(),
        packagePrice: Joi.string().required(),
        inclusions: Joi.array().required(),
        isPopular: Joi.boolean().required()
    });
    return schema.validate(user);
}

exports.ServicePackage = ServicePackage;
exports.validatePackage = validatePackage;
exports.servicePackageSchema = servicePackageSchema;