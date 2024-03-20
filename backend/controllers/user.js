const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Création d'un compte
exports.signup = (req, res, next) => {
    // Fonction hachage de bcrypt 10 fois
    bcrypt.hash(req.body.password, 10)
    // Utilisation du résultat pour créer l'utilisateur
    .then(hash => {
      // Instance du model utilisateur
      const user = new User({
        email: req.body.email,
        password: hash
      })
      // Enregistrement dans la base de donnée
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé' }))
        .catch(error => res.status(400).json({ error }))
    })
    .catch(error => res.status(500).json({ error }))
}

// Connexion de l'utilisateur
exports.login = (req, res, next) => {
    // Vérification que l'utilisateur à un compte
    User.findOne({ email: req.body.email })
    .then(user => {
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé'})
        }
        // Vérification du mot de passe avec le hash de la base de donnée
        bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if (!valid) {
                    return res.status(401).json({ message: 'Mot de passe incorrect' })
                }
                // Envoie d'un réponse avec userId et le Token cryté
                res.status(200).json({
                    userId: user._id,
                    token: jwt.sign(
                        { userId: user._id },
                        'RANDOM_TOKEN_SECRET',
                        { expiresIn: '24h' }
                    )
                })
            })
            .catch(error => res.status(500).json({ error }))
    })
    .catch(error => res.status(500).json({ error }))
}