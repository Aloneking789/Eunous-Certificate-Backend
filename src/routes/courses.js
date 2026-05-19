const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/courseController');

router.get('/', controller.getCourses);
router.post('/', auth, controller.createCourse);

module.exports = router;
