const express = require('express')
const router = express.Router()
const bookctrl =  require('../controllers/books')

router.post('/', bookctrl.createBook)
router.put('/:id', bookctrl.modifyBook)
router.delete('/:id', bookctrl.deleteBook)
router.get('/:id', bookctrl.getOneBook)
router.get('/', bookctrl.getAllBook)

module.exports = router