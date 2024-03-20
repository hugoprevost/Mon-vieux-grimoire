const multer = require('multer')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
}

// Configuration
const storage = multer.diskStorage({
  // Enregistrement des images dans le dossier images
  destination: (req, file, callback) => {
    callback(null, 'images')
  },
  // Configuration du nom des fichier, suppression des espaces remplacé par des points
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_')
    const extension = MIME_TYPES[file.mimetype]
    // Ajout de la date au nom du fichier pour qu'il soit unique
    callback(null, name + Date.now() + "." + extension)
  }
})

// Gestion des téléchargements des fichiers image unique
module.exports = multer({ storage: storage }).single("image")

// Redimensionnement de l'image
module.exports.resizeImage = (req, res, next) => {
  // On regarde si le fichier a été téléchargé
  if (!req.file) {
    return next()
  }

  const filePath = req.file.path
  const fileName = req.file.filename
  const outputFilePath = path.join("images", `resized_${fileName}`)

  sharp(filePath)
    .resize({ width: 206, height: 260 })
    .toFile(outputFilePath)
    .then(() => {
      // On remplace le fichier par celui qui est redimensionné
      fs.unlink(filePath, () => {
        req.file.path = outputFilePath
        next()
      })
    })
    .catch((err) => {
      console.log(err)
      return next()
    })
}
