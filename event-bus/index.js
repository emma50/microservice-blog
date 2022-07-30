const express = require('express')
const axios = require('axios')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const events = [];

app.post('/events', async (req, res) => {
  const event = req.body

  events.push(event)

  await axios.post('http://posts-clusterip-srv:4000/events', event)
    .then((result) => {
      console.log('SENT SUCCESSFULLY')
    }).catch((err) => {
        console.log('AN ERROR OCCURED SENDING EVENT TO POSTS ROUTE', err.message)
    });
  await axios.post('http://comments-srv:4001/events', event)
    .then((result) => {
      console.log('SENT SUCCESSFULLY')
    }).catch((err) => {
        console.log('AN ERROR OCCURED SENDING EVENT TO COMMENTS ROUTE', err.message)
    });
  await axios.post('http://query-srv:4002/events', event)
    .then((result) => {
      console.log('SENT SUCCESSFULLY')
    }).catch((err) => {
        console.log('AN ERROR OCCURED SENDING EVENT TO QUERY ROUTE', err.message)
    });
  await axios.post('http://moderation-srv:4003/events', event)
    .then((result) => {
      console.log('SENT SUCCESSFULLY')
    }).catch((err) => {
        console.log('AN ERROR OCCURED SENDING EVENT TO MODERATION ROUTE', err.message)
    });

  res.status(200).send({  message: 'ok' })
})

app.get('/events', (req, res) => {
  console.log(events, 'THESE ARE ALL THE EVENTS THAT YOU MISSED')
  res.send(events);
})

app.listen(4005, () => {
  console.log('Listening at port 4005')
})