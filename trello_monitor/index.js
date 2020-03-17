const express = require('express');
const app = express();
const util = require('util');
const Trello = require('./models/Trello');
const Zelos = require('./models/Zelos');

const sms = true; // assumes you have a texting service configured!
const Infobip = require('./models/Infobip'); // you don't need this if you don't
const messages = require('./config/messages'); // message templates

let endpoint = ""

// Check environment
if (!process.env.GCP_PROJECT) {
  console.log("[i] Not in the cloud")
  // Set up body parsing middleware
  const bodyParser = require('body-parser');
  endpoint = "debug"
  app.use(bodyParser.urlencoded({
    extended: false
  }))
  app.use(bodyParser.json())

  const port = process.env.PORT || 9000;
  app.listen(port, () => {
    console.log('[i] Service listening on port', port);
  });
}

// Verification endpoints for setting up Trello webhooks
app.head(`/${endpoint}`, (req, res) => {
  res.send("Yes hello, this is API");
});

app.get(`/${endpoint}`, (req, res) => {
  res.send("Yes hello");
});

// Get data from Trello Webhook
app.post(`/${endpoint}`, async (req, res) => {
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
    await trello.init();
    // Get card info
    const labels = await trello.getLabels(action.card);
    const cardFields = await trello.getCustomFields(action.card);
    // Populate task data
    const taskData = parseCustomFields(cardFields, trello.customFields);
    taskData.description = await trello.getDesc(action.card);

    if (status.new === "approved") {
      if (!checkLabels(labels, status.new)) {
        // Create a task on Zelos
        const workspace = new Zelos();
        await workspace.init();
        const groupId = await workspace.findGroup(taskData.location);
        const task = await workspace.newTask(taskData, [groupId]);
        if (!(task instanceof Error)) {
          // Add a link to Zelos task
          trello.addComment(action.card, task);
          // Mark the card
          await trello.addLabel(action.card, status.new, "green");
          // Send a confirmation message
          if (sms && !(taskData.phone == "")) {
            const text = new Infobip();
            try {
              await text.sendMessage(taskData.phone, messages.approved);
              await trello.addLabel(action.card, "SMS sent", "blue");
            } catch (err) {
            }
          }
        }
      }
    }
    if (status.new === "rejected") {;
      if (!checkLabels(labels, status.new)) {
        // Send a rejected text (maybe)
        if (sms) {
          // Find the phone number (in a retarded manner)
          const cardFields = await trello.getCustomFields(action.card);
          const taskData = parseCustomFields(cardFields, trello.customFields);
          console.log(taskData);
          if (!taskData.phone == "") {
            console.log(`sending a text to ${taskData.phone}`)
            const text = new Infobip();
            try {
              await text.sendMessage(taskData.phone, messages.rejected);
              trello.addLabel(action.card, "SMS sent", "blue");
            } catch (err) {
            }
          }
        }
        // Mark the card
        await trello.addLabel(action.card, status.new, "red");
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

function parseCustomFields(cardFields, boardFields) {
  let taskData = {}
  cardFields.forEach(obj => {
    const value = obj.value.text
    const label = getKeyByValue(boardFields, obj.idCustomField);
    taskData[label] = value;
  });
  return taskData;
}

function getKeyByValue(object, value) { 
  return Object.keys(object).find(key => object[key] === value); 
}

// debug functions
function printRequest(req) {
  console.log("Headers:\n" + util.inspect(req.headers));
  console.log("Query:\n" + util.inspect(req.query));
  console.log("Body:\n" + util.inspect(req.body));
}

exports.trello_monitor = app;