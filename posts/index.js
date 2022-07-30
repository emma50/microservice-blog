const express = require('express');
const { randomBytes } = require('crypto')
const cors = require('cors')
const axios = require('axios')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

let posts = {}

app.get('/posts', (req, res) => {
  res.status(200).send(posts)
})

app.post('/posts/create', async (req, res) => {
  const id = randomBytes(4).toString('hex')
  const { title } = req.body

  posts[id] = { id, title }
  console.log(posts[id])

  await axios.post('http://event-bus-srv:4005/events', {
    type: 'PostCreated',
    data: { id, title }
  }).then((result) => {
    console.log('SUCCESSFUL')
  }).catch((err) => {
      console.log('AN ERROR OCCURED EMITTING POSTCREATED EVENT', err.message)
  });
  res.status(201).send(posts[id])
})

app.post('/events', (req, res) => {
  const { type } = req.body;
  console.log('Event received', type)

  res.send({})
})

app.listen(4000, () => {
  console.log('version: 2')
  console.log('Server up at port 4000')
})

/**
 * Posts: {
 *  'firstpostid': {
 *    id: 'firstpostid',
 *    title: 'something'
 *  },
 *  'secondpostid': {
 *    id: 'secondpostid',
 *    title: 'someone'
 *  },
 * }
 */