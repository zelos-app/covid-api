const express = require('express');
const app = express();
const util = require('util');
const Trello = require('./models/Trello');

// Check environment

if (!process.env.GCP_PROJECT) {
  console.log("[i] Not in the cloud: entering debug mode")
  // Set up body parsing middleware
  const bodyParser = require('body-parser');
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json())

  const port = process.env.PORT || 9000;
  app.listen(port, () => {
    console.log('[i] Service listening on port', port);
  });
}

// Default route
app.get('/', (req, res) => {
  res.send("Yes hello");
});

// Get data from CF7 Webhook
app.post('/', async (req, res) => {
  // create trello card
  const trello = new Trello();
  await trello.init();
  try {
    await trello.newCard(req.body);
    res.send("Success!\n");
  } catch (err) {
    console.error(err);
    res.send("Failed because of reasons, error has been logged\n")
  }
});

// debug functions
function printRequest(req) {
  console.log("Headers:\n" + util.inspect(req.headers));
  console.log("Query:\n" + util.inspect(req.query));
  console.log("Body:\n" + util.inspect(req.body));
}

exports.cf7_to_trello = app;