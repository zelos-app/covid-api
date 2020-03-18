const express = require('express');
const app = express();
const util = require('util');
const Trello = require('./models/Trello');

// Check environment

if (!process.env.GCP_PROJECT) {
  console.log("[i] Not in the cloud: entering debug mode")
  // Set up body parsing middleware
  const bodyParser = require('body-parser');
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

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
  let submission = req.body;
  submission.phone = sanitizePhoneNr(submission.phone);
  // create trello card
  const trello = new Trello();
  await trello.init();
  try {
    await trello.newCard(req.body);
    res.send("Success!\n");
  } catch (err) {
  }
});

////////////////////////////////////////////////////
// Change phone number validation settings below! //
////////////////////////////////////////////////////

function sanitizePhoneNr(num) {
  // Remove spaces
  let number = num.replace(/\s*\.*\-*/g, "");
  if (number.match(/^\+*372\d{7,8}/)) {
    // (Probably) a valid Estonian phone number
    // Add + if it's not there already
    number = number.replace(/^372/, "+372");
    return number;
  } else if (number.match(/^\d{7,8}/)) {
    // Add prefix
    number = `+372${number}`;
    return number;
  } else {
    // I guess this person isn't getting a message
    number = ""
    return number;
  }
}

// debug functions
function printRequest(req) {
  console.log("Headers:\n" + util.inspect(req.headers));
  console.log("Query:\n" + util.inspect(req.query));
  console.log("Body:\n" + util.inspect(req.body));
}

exports.cf7_to_trello = app;