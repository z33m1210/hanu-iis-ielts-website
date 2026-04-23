const Joi = require('joi');

const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).required(),
    role: Joi.string().valid('USER').optional()
  }),
  login: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
  })
};

const postSchemas = {
  create: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    content: Joi.string().min(10).required(),
    type: Joi.string().valid('ARTICLE', 'BLOG', 'RESOURCE'),
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'REVIEW')
  }),
  update: Joi.object({
    title: Joi.string().min(5).max(200),
    content: Joi.string().min(10),
    type: Joi.string().valid('ARTICLE', 'BLOG', 'RESOURCE'),
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'REVIEW')
  })
};

const userSchemas = {
  updateStatus: Joi.object({
    isActive: Joi.boolean().required()
  }),
  updateProfile: Joi.object({
    name: Joi.string().min(2),
    avatarUrl: Joi.string().uri().allow('', null)
  }),
  adminUpdate: Joi.object({
    name: Joi.string().min(2),
    email: Joi.string().email(),
    role: Joi.string().valid('USER', 'ADMIN')
  })
};

const courseSchemas = {
  create: Joi.object({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(10).required(),
    price: Joi.number().min(0).required(),
    originalPrice: Joi.number().min(0).allow(null),
    category: Joi.string().required(),
    level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'All Levels'),
    hours: Joi.number().integer().min(0),
    lectures: Joi.number().integer().min(0),
    chapters: Joi.number().integer().min(0)
  }),
  update: Joi.object({
    title: Joi.string().min(5).max(100),
    description: Joi.string().min(10),
    price: Joi.number().min(0),
    originalPrice: Joi.number().min(0).allow(null),
    category: Joi.string(),
    level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'All Levels'),
    hours: Joi.number().integer().min(0),
    lectures: Joi.number().integer().min(0),
    chapters: Joi.number().integer().min(0),
    isPublished: Joi.boolean(),
    thumbnail: Joi.string().allow('', null),
    syllabus: Joi.string().allow('', null)
  })
};

const settingsSchemas = {
  update: Joi.object({
    platformName: Joi.string().min(3).required(),
    adminEmail: Joi.string().email().required(),
    defaultLanguage: Joi.string().required(),
    maintenanceMode: Joi.boolean().required()
  })
};

module.exports = {
  authSchemas,
  postSchemas,
  userSchemas,
  courseSchemas,
  settingsSchemas
};
