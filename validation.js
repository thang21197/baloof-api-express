// Validation
const Joi = require ('@hapi/joi');

// Register Validation

const registerValidation = data => {
    const schema = Joi.object({
        username: Joi.string().min(6).required().alphanum(),
        email:Joi.string().min(6).required().email(),
        password:Joi.string().min(6).required(),
        displayname:Joi.string().optional(),
        role:Joi.string().optional(),
        phone_number:Joi.string().min(9).pattern(/^[0-9]+$/).allow(null, '')
    });
    return schema.validate(data);
}

// LOGIN validation 
const loginValidation = data => {
    const schema = Joi.object({
        username:Joi.string().min(6).required(),
        password:Joi.string().min(6).required()
    });
    return schema.validate(data);
}
// Update validation 
const updateValidation = data => {
    const schema = Joi.object({
        displayname:Joi.string().allow(null, ''),
        phone_number:Joi.string().allow(null, ''),
        password:Joi.string().min(6).allow(null, ''),
        jwtDecoded:Joi.object()
    });
    return schema.validate(data);
}

module.exports.registerValidation= registerValidation
module.exports.loginValidation= loginValidation
module.exports.updateValidation= updateValidation
