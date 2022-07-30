const express = require('express');
const app = express()
const { randomBytes } = require('crypto')
const cors = require('cors')
const axios = require('axios')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

let commentsByPostId = {}

app.get('/posts/:id/comments', (req, res) => {
  res.status(201).send(commentsByPostId[req.params.id] || [])
})

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex')
  const { content } = req.body
  const { id: postId } = req.params

  let comments = commentsByPostId[postId] || []
  comments.push({ id: commentId, content, status: 'pending' })
  commentsByPostId[postId] = comments
  console.log(commentsByPostId[postId])

  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: { 
      id: commentId,
      content,
      postId ,
      status: 'pending'
    }
  }).then((result) => {
    console.log('SUCCESSFUL')
  }).catch((err) => {
      console.log('AN ERROR OCCURED EMITTING COMMENTCREATED EVENT', err.message)
  });
  res.status(201).send(comments)
})

app.post('/events', async (req, res) => {
  const { type, data } = req.body;
  console.log('Event received', type)

  if (type === 'CommentModerated') {
    const { id, postId, status, content } = data

    const comments = commentsByPostId[postId]
    const comment = comments.find((comment) => {
      return comment.id === id
    })
    comment.status = status

    await axios.post('http://event-bus-srv:4005/events', {
     type: 'CommentUpdated',
     data: { 
       id,
       content,
       postId,
       status
     }
   }).then((result) => {
     console.log('SUCCESSFUL')
   }).catch((err) => {
       console.log('AN ERROR OCCURED EMITTING COMMENTUPDATED EVENT', err.message)
   });
   }

  res.send({})
})

app.listen(4001, () => {
  console.log('Server up at port 4001')
})


/**
 * commentsByPostId: {
 *   'firstpostid': [
 *      {
 *        id: 'firstcommentId',
 *        content: 'firstcontentofcomment',
 *        status: 'pending'
 *      },
 *      {
 *        id: 'secondcommentId',
 *        content: 'secondcontentofcomment',
 *        status: 'pending'
 *      },
 *    ],
 *   'secondpostid': [
 *      {
 *        id: 'firstcommentId',
 *        content: 'firstcontentofcomment',
 *        status: 'pending'
 *      },
 *      {
 *        id: 'secondcommentId',
 *        content: 'secondcontentofcomment',
 *        status: 'pending'
 *      },
 *    ]
 * }
*/
