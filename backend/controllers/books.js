const Book = require('../models/Book')
//const average = require('../middleware/average');
const fs = require('fs')

exports.createBook = (req, res, next) => {
            const bookObject = JSON.parse(req.body.book)
            delete bookObject._id
            delete bookObject._userId
            const book = new Book({
                ...bookObject,
                userId: req.auth.userId,
                ratings: [],
                averageRating: 0,
                imageUrl: `${req.protocol}://${req.get('host')}/images/opt_${req.file.filename}`
            })
            book.save()
        .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
        .catch(error => { res.status(400).json( { error })})
}

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/opt_${req.file.filename}`
    } : { ...req.body }
  
    //delete bookObject._userId
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Non autorisé'})
            } else {
                Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                    .then(() => {
                        res.status(200).json({ message: 'book successfully updated' });
                        //delete old file
                        const oldFile = book.imageUrl.split('/images')[1];
                        req.file && fs.unlink(`images/${oldFile}`, (err => {
                            if (err) console.log(err);
                        }))
                    })
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => { res.status(400).json({ error })})
}

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({message: 'Non autorisé'})
            } else {
            const filename = book.imageUrl.split('/images/')[1]
            fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }))
                    })
                }
            })
        .catch( error => { res.status(500).json({ error })})
}

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }))
}

exports.getAllBook = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }))
}

exports.getBestRating = (req, res, next) => {
    Book.find().sort({averageRating: -1}).limit(3)
        .then((bestBooks)=>res.status(200).json(bestBooks))
        .catch((error)=>res.status(404).json({ error }));
}

exports.createRating = (req, res, next) => {
    const updatedRating = {
        userId: req.auth.userId,
        grade: req.body.rating
    }
    //check rating range
    if (updatedRating.grade < 0 || updatedRating.grade > 5) {
        return res.status(400).json({ message: 'rating must be between 0 and 5' })
    }
    //find book
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            //check if user already rated the book
            if (book.ratings.find(r => r.userId === req.auth.userId)) {
                return res.status(400).json({ message: 'User already voted for this book' })
            } else {
                //push new rating in array
                book.ratings.push(updatedRating)
                //average rating calculation 
                //no need to go through all array, sum of ratings is average rating * rating length (minus the new rate that is added)
                book.averageRating = (book.averageRating * (book.ratings.length - 1) + updatedRating.grade) / book.ratings.length
                return book.save()
            }
        })
        .then((updatedBook) => res.status(201).json(updatedBook))
        .catch(error => res.status(400).json({ error }))
}