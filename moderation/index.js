const express = require('express');
const app = express()
const axios = require('axios')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.post('/events', async (req, res) => {
  const { type, data } = req.body;
  console.log('Event received', type)

  if (type === 'CommentCreated') {
  const status = data.content.includes('orange') ? 'rejected' : 'approved';

   await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentModerated',
    data: { 
      id: data.id,
      content: data.content,
      postId: data.postId ,
      status
    }
  }).then((result) => {
    console.log('SUCCESSFUL')
  }).catch((err) => {
      console.log('AN ERROR OCCURED EMITTING COMMENTMODERATED EVENT', err.message)
  });
  }

  res.send({})
})

app.listen(4003, () => {
  console.log('Server up at port 4003')
})
