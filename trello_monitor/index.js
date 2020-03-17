const express = require('express');
const app = express();
const util = require('util');
const Trello = require('./models/Trello');
const Zelos = require('./models/Zelos');

// Check environment
if (!process.env.GCP_PROJECT) {
  console.log("[i] Not in the cloud")
  // Set up body parsing middleware
  const bodyParser = require('body-parser');
  app.use(bodyParser.urlencoded({
    extended: false
  }))
  app.use(bodyParser.json())

  const port = process.env.PORT || 9000;
  app.listen(port, () => {
    console.log('[i] Service listening on port', port);
  });
}

// Verify endpoint for Trello
app.head('/debug', (req, res) => {
  console.log(util.inspect(req.body));
  res.send("Yes hello, this is API");
});

app.get('/debug', (req, res) => {
  console.log(util.inspect(req.body));
  res.send("Yes hello");
});

// Get data from Trello Webhook
app.post('/debug', async (req, res) => {
  const status = {}
  const action = {}
  const trello = new Trello(action.board)

  if (req.body.action.display.translationKey === "action_move_card_from_list_to_list") {
    status.old = req.body.action.data.listBefore.name.toLowerCase();
    status.new = req.body.action.data.listAfter.name.toLowerCase();
    action.card = req.body.action.data.card.id;
    action.board = req.body.action.data.board.id;
  }
  if (status.old === "incoming") {
    if (status.new === "approved") {
      const labels = await trello.getLabels(action.card);
      if (!checkLabels(labels, status.new)) {
        // Create a task on Zelos
        const zelos = new Zelos();
        zelos.init();
        // Add a link to Zelos task

        // Mark the card
        await trello.addLabel(action.card, status.new, "green")
      }
    }
    if (status.new === "rejected") {
      const labels = await trello.getLabels(action.card);
      if (!checkLabels(labels, status.new)) {
        // TODO: Send a text

        // Mark the card
        await trello.addLabel(action.card, status.new, "red")
      }
    }
  }


  res.send("Yes Hello");
});

function checkLabels(labels, status) {
  let allLabels = [];
  labels.forEach(obj => {
    allLabels.push(obj.name);
  });
  const result = allLabels.includes(status);
  return result
}

// debug functions
function printRequest(req) {
  console.log("Headers:\n" + util.inspect(req.headers));
  console.log("Query:\n" + util.inspect(req.query));
  console.log("Body:\n" + util.inspect(req.body));
}

exports.cf7_to_trello = app;