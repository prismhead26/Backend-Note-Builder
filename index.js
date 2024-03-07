const express = require('express')
const morgan = require('morgan')
const notes = require('./db/db.json')
const path = require('path')
const { readFile, writeFile } = require('fs/promises')
const { v4 } = require('uuid');

const PORT = process.env.PORT || 3002

const app = express()

// middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.use(express.static(path.join(__dirname, 'public')))
// GET request for notes page
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'))
})
// GET request for all notes in json form
app.get('/api/notes', (req, res) => {
    // Log our request to the terminal
    console.info(`${req.method} request received to get notes`);
    // Send a message to the client   readfile
    readFile('./db/db.json').then((raw_data) => {
        res.json(JSON.parse(raw_data))
    })
})
//  POST request
app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to get notes`)

    const { title, text } = req.body
// conditional to check for proper user input
    if ( title && text ) {
        const newNote = {
            title,
            text,
            id: v4()
        }

        readFile('./db/db.json').then((raw_data) => {
            return JSON.parse(raw_data)
        })
        .then(data => {
            const notes = (data);
            notes.push(newNote);
            writeFile('./db/db.json', JSON.stringify(notes))
            res.status(201).json(notes)
        })
        .then(() => console.log('Success!'))
        .catch(err => console.error(err));
    } else {
        res.status(500).json('Error in posting note')
    }
})
// delete request
app.delete('/api/notes/:id', (req, res) => {

    // before
    var before_length = 0
    var after_length = 0    
    readFile('./db/db.json').then((raw_data) => {
        return JSON.parse(raw_data);
    })
    .then(notes => {
        before_length = notes.length
        notes = notes.filter(({ id }) => id != req.params.id);
        after_length = notes.length
        return writeFile('./db/db.json', JSON.stringify(notes))
    })
    .then(() => console.log('DELETE Success!'))
    .then(() => {
        if (before_length == after_length) {
            return res.sendStatus(404)
        }
        return res.sendStatus(200)
    })
    .catch(err => console.error(err));
    // res.json('post complete')
    // after
})

// 404 page
app.use((req, res) => {
    res.status(404).sendFile('./public/404.html', { root: __dirname })
})
// Listening for initial connection
app.listen(PORT, (err) => {
    if (err) console.log(err)
    console.log(`Listening on port ${PORT}...`)
})