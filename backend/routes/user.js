const express = require('express')
const router = express.Router()
const userCtrl = require('../controllers/user')

// Les différentes routes pour l'utilisateur
router.post('/signup', userCtrl.signup)
router.post('/login', userCtrl.login)


module.exports = router