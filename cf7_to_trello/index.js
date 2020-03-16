const express = require('express');
const app = express();
const util = require('util');
const Trello = require('./models/Trello');

// Default route

app.get('/', (req, res) => {
  res.send("Yes hello");
});

// Get data from CF7 Webhook

app.post('/form', async (req, res) => {
  res.send("Yes Hello");
  // create trello card
  const trello = new Trello();
  //await trello.newCard(req.body);
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

function printRequest(req) {
  console.log("Headers:\n" + util.inspect(req.headers));
  console.log("Query:\n" + util.inspect(req.query));
  console.log("Body:\n" + util.inspect(req.body));
}

function debug() {
  const trello = new Trello();
  console.log(trello.cfields)
  console.log(trello.lists)
}

debug();

exports.cf7_to_trello = app;