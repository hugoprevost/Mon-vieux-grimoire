const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')

const bookctrl =  require('../controllers/books')

router.get('/', bookctrl.getAllBook)
router.get('/bestrating', bookctrl.getBestRating)
router.get('/:id', bookctrl.getOneBook)

router.post('/', auth, multer.upload, multer.optimize, bookctrl.createBook)
router.post('/:id/rating', auth, bookctrl.createRating)
router.put('/:id', auth, multer.upload, multer.optimize, bookctrl.modifyBook)
router.delete('/:id', auth, bookctrl.deleteBook)

module.exports = router