const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')

const bookctrl =  require('../controllers/books')

router.get('/', bookctrl.getAllBook)
router.post('/', auth, multer, bookctrl.createBook)
router.get('/:id', bookctrl.getOneBook)
router.put('/:id', auth, multer, bookctrl.modifyBook)
router.delete('/:id', auth, bookctrl.deleteBook)

module.exports = router