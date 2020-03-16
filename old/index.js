const express = require('express');
const app = express();
const util = require('util');
const Zelos = require('./models/Zelos');
const Trello = require('./models/Trello');

printRequest = (req) => {
  console.log("Headers:\n" + util.inspect(req.headers));
  console.log("Query:\n" + util.inspect(req.query));
  console.log("Body:\n" + util.inspect(req.body));
}

// Default route

app.get('/', (req, res) => {
  res.send("Yes hello");
});


// Trello webhook validation

app.head('/trello', (req, res) => {
  res.send("Yes Hello");
  printRequest(req);
});


// Get status updates from Trello and create tasks from Zelos

app.post('/trello', async (req, res) => {
  res.send("Yes Hello");
  let approved = false;

  if (req.body.action.display.translationKey === "action_move_card_from_list_to_list") {
    (req.body.action.data.listAfter.name === "Approved") ? approved = true: approved = false
  }

  if (approved) {
    trello = new Trello(req.body)
    const cardId = trello.data.action.data.card.id;
    console.log(`[i] Card (${cardId}) moved to Approved `);
    const customFields = await trello.getCustomFields(cardId);
    //console.log(fields);
    const workspace = new Zelos("covid-help-ee");
    await workspace.init();

    let taskData = {};
    taskData = parseCustomFields(customFields);
    taskData.description = await trello.getDesc(cardId);
    console.log(taskData);
    groupId = await workspace.getGroups(taskData.location);
    await workspace.newTask(taskData, [groupId]);
  }

});

// Get data from CF7 Webhook

app.post('/requestform', async (req, res) => {
  res.send("Yes Hello");
  // create trello card
  const trello = await new Trello();
  await trello.newCard(req.body);
});

const port = process.env.PORT || 9000;
app.listen(port, () => {
  console.log('Hello world listening on port', port);
});

function parseCustomFields(fields) {
  let taskData = {}
  fields.forEach(element => {
    const value = element.value.text
    const label = getKeyByValue(trello.fieldIds, element.idCustomField);
    taskData[label] = value;
  });
  return taskData
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

exports.covid_api = app;