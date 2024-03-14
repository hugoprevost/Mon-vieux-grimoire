const express = require('express')
const mongoose = require('mongoose')

const booksRoutes = require('./routes/books')
const userRoutes = require('./routes/user')


mongoose.connect('mongodb+srv://hugo:hugo@cluster0.yebctzj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  { 
    useNewUrlParser: true,
    useUnifiedTopology: true 
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'))

const app = express()

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  next()
})

app.use(express.json())

app.use('/api/books', booksRoutes)
app.use('/api/auth', userRoutes)

module.exports = app