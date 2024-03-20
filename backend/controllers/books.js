const Book = require('../models/Book')
const fs = require('fs')

// Création d'un livre
exports.createBook = (req, res, next) => {
    // Stockage de la requete sous JSON
    const bookObject = JSON.parse(req.body.book)
    // Suppression de l'Id et de l'userId
    delete bookObject._id
    delete bookObject._userId
    // Création de l'instance du modèle d'un livre
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        ratings: [],
        averageRating: 0,
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${req.file.filename}`,
    })
    // Enregistrement du livre dans la base de donnée
    book.save()
        .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
        .catch(error => { res.status(400).json( { error })})
}

// Modification d'un livre existant
exports.modifyBook = (req, res, next) => {
    // Stockage de la requete sous JSON
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${req.file.filename}`,
    } : { ...req.body }
    // Suppression de l'userId
    delete bookObject._userId
    // Récupération du livre à modifier
    Book.findOne({_id: req.params.id})
        .then((book) => {
            // Vérification de l'ID du créateur pour vois si il peut le modifier
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Non autorisé'})
            } else {
                // Séparation du nom du fichier image existant
                const filename = book.imageUrl.split('/images/')[1]
                // Suppression de l'ancienne image si elle est modifié
                req.file && fs.unlink(`images/${filename}`, (err => {
                        if (err) console.log(err)
                    })
                )
                // Mise à jour du livre dans la base de donné
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Livre modifié' }))
                    .catch(error => res.status(400).json({ error }))
            }
        })
        .catch((error) => { res.status(404).json({ error })})
}

// Suppression d'un livre
exports.deleteBook = (req, res, next) => {
    // Récupération du livre que l'on veut supprimer
    Book.findOne({ _id: req.params.id})
        .then(book => {
            // Vérification si l'ID du créateur correspond à celui qui veut le supprimer
            if (book.userId != req.auth.userId) {
                res.status(401).json({message: 'Non autorisé'})
            } else {
                // Séparation du nom du fichier image existant
                const filename = book.imageUrl.split('/images/')[1]
                // Suppression de l'image et du livre dans la base de donnée
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }))
                    })
                }
            })
        .catch( error => { res.status(500).json({ error })})
}

// Récupération d'un livre
exports.getOneBook = (req, res, next) => {
    // Récupération grâce à l'ID du livre
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }))
}

// Récupération de tous les livres
exports.getAllBook = (req, res, next) => {
    // Renvoie un tableau de tous les livres
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }))
}

// Récupération des livres les mieux notés
exports.getBestRating = (req, res, next) => {
    // Récupération de tous les livres et tri par ordre décroissant avec une limite de 3 livres
    Book.find().sort({averageRating: -1}).limit(3)
        .then((bestBooks)=>res.status(200).json(bestBooks))
        .catch((error)=>res.status(404).json({ error }))
}

exports.createRating = (req, res, next) => {
    // Création du constante avec comme paramètre l'userId et le grade 
    const updatedRating = {
        userId: req.auth.userId,
        grade: req.body.rating
    }
    // Vérification si la note est entre 0 et 5
    if (updatedRating.grade < 0 || updatedRating.grade > 5) {
        return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5' })
    }
    // Récupération grâce à l'ID du livre
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            // Vérification si l'utilisateur à déjà note le livre
            if (book.ratings.find(r => r.userId === req.auth.userId)) {
                return res.status(400).json({ message: 'Note déjà attribué' })
            } else {
                // Ajout de la note 
                book.ratings.push(updatedRating)
                // Calcul de la moyenne du livre
                // Moyenne actualisé = (Moyenne * le nombre de note - 1 + la nouvelle note) / le nombre de note
                book.averageRating = (book.averageRating * (book.ratings.length - 1) + updatedRating.grade) / book.ratings.length
                return book.save()
            }
        })
        .then((updatedBook) => res.status(201).json(updatedBook))
        .catch(error => res.status(400).json({ error }))
}