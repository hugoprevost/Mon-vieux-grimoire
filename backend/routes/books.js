const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')
const bookctrl =  require('../controllers/books')
const { resizeImage } = require("../middleware/multer-config")

// Les différentes routes pour les books
router.get('/', bookctrl.getAllBook)
router.get('/bestrating', bookctrl.getBestRating)
router.get('/:id', bookctrl.getOneBook)
router.post('/', auth, multer, resizeImage, bookctrl.createBook)
router.post('/:id/rating', auth, bookctrl.createRating)
router.put('/:id', auth, multer, resizeImage, bookctrl.modifyBook)
router.delete('/:id', auth, bookctrl.deleteBook)

module.exports = router