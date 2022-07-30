const express = require('express');
const app = express()
const cors = require('cors')
const axios = require('axios')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

const posts = {}

const handleEvent = (type, data) => {
  if (type === 'PostCreated') {
    const { id, title } = data
    posts[id] = { id, title, comments: [] }
  }

  if (type === 'CommentCreated') {
    const { id, content, postId, status } = data
    const post = posts[postId]
    post.comments.push({id, content, status})
  }

  if (type === 'CommentUpdated') {
    const { id, content, postId, status } = data
    const post = posts[postId]
    const comment = post.comments.find((comment) => {
      return comment.id === id
    })
    comment.status = status
    comment.content = content
  }
}

app.get('/posts', (req, res) => {
  res.send(posts)
})

app.post('/events', (req, res) => {
  const { type, data } = req.body;
  console.log('Event received', type)

  handleEvent(type, data)
  console.log(posts)

  res.send({})
})

app.listen(4002, async () => {
  console.log('Server up at port 4002')

  try {
    const res = await axios.get("http://event-bus-srv:4005/events");
 
    for (let event of res.data) {
      console.log("Processing event:", event.type);
 
      handleEvent(event.type, event.data);
    }
  } catch (error) {
    console.log(error.message);
  }
})


/**
 * Posts: {
 *  'firstpostid': {
 *     id: 'firstpostid',
 *     title: 'firstposttitle',
 *     comments: [
         {
 *         id: 'firstcommentId',
 *         content: 'firstcontentofcomment',
 *         status: 'pending'
 *       },
 *       {
 *         id: 'secondcommentId',
 *         content: 'secondcontentofcomment',
 *         status: 'pending'
 *       },
 *     ]
 *  },
 *  'secondpostid': {
 *     id: 'secondpostid',
 *     title: 'secondposttitle',
 *     comments: [
         {
 *         id: 'firstcommentId',
 *         content: 'firstcontentofcomment',
 *         status: 'pending'
 *       },
 *       {
 *         id: 'secondcommentId',
 *         content: 'secondcontentofcomment',
 *         status: 'pending'
 *       },
 *     ]
 *   }
 * }
 */

// {5e941d80-bf96-11cd-b579-08002b30bfeb}
// ikechukwu__19
// packages/ui/src/util/browser-config.ts