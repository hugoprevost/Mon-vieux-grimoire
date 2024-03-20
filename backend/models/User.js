const mongoose = require('mongoose')
const uniqueValidator= require('mongoose-unique-validator')

// Schéma de l'utilisateur unique
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
})

userSchema.plugin(uniqueValidator)

//exportation du schéma
module.exports = mongoose.model('User', userSchema)