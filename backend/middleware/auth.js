const jwt = require('jsonwebtoken')

//Middleware d'authentification
module.exports = (req, res, next) => {
   try {
        // Extraction du Token du header
        const token = req.headers.authorization.split(' ')[1]
        // Décodage du Token
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET')
        // Extration de l'ID de l'utilisateur
        const userId = decodedToken.userId
        req.auth = {
            userId: userId
        }
	    next()
    }   catch(error) {
        res.status(401).json({ error })
    }
}