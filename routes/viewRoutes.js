const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController')

app.get('/', viewController.login)
app.get('/', viewController.signup)


module.exports = router