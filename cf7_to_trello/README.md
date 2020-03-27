# Contact Form 7 to Trello

This service listens to form submissions coming from web form with requests and creates cards on Trello

## Getting started

1. Set up your CF7 form and webhooks. You can easily add your own fields and map them to task details if you'd like. The service expects data in the following format:
```
{
"name": "",
"phone": "",
"location": "",
"address": "",
"request": ""
}
```
**Important!**
Location field of the form has to be "select" type with matching Group names on Zelos. This allows notifying people from relevant areas only. In case of a mismatch, Trello monitoring service will mark the card with "Bad Location" label and add a comment with instructions for fixing it.

1. Create `./config/trello.json` with your Trello credentials and board ID
2. Enable "Custom Fields" power-up for your Trello board
3. Edit the regex patterns in index.js that clean up mobile numbers. They are configured for Estonian format by default.
4. Deploy the cloud function, or run it however you like, I'm not a cop. For Google Cloud: `gcloud functions deploy cf7_to_trello --runtime nodejs8 --trigger-http --region europe-west1`
6. Point CF7 webhook to your cloud function URL
7. Get cards on Trello board