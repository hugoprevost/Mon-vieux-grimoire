const express = require('express')
const mongoose = require('mongoose')

const booksRoutes = require('./routes/books')
const userRoutes = require('./routes/user')
const path = require('path')


// Connexion à la base de donnée
const dotenv = require('dotenv')
dotenv.config()
mongoose.connect('mongodb+srv://'+ process.env.MONGO_USER + ':'+ process.env.MONGO_PASSWORD + '@monvieuxgrimoire.pkv8ldu.mongodb.net/?retryWrites=true&w=majority&appName=MonVieuxGrimoire', { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('Connexion à MongoDB réussie !'))
        .catch(() => console.log(process.env.MONGO_USER))

// Création de l'application
const app = express()

//Middleware gestion des erreur du Cors
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  next()
})

// Middleware pour qu'Express extrait le corp JSON des requetes POST
app.use(express.json())

// Enregistrement des routeurs 
app.use('/api/auth', userRoutes)
app.use('/api/books', booksRoutes)
// Gestion des images
app.use('/images', express.static(path.join(__dirname, 'images')))


module.exports = app