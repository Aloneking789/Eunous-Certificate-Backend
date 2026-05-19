const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/branchController');

router.get('/', controller.getBranches);
router.post('/', auth, controller.createBranch);

module.exports = router;
