# Service that monitors Trello, creates tasks on Zelos and notifies people about their request status

## Setting it up

### Zelos
1. create a [Zelos workspace](https://app.zelos.space). If you used FB or Google login to start, also create a password on your profile for the service authentication.
2. Set up groups with names that match the values of the form location selection. If no groups are found for the location input, the task will be published to everyone with a push notification by default.
3. Set up `./config/zelos.json` with your username, password and workspace subdomain (default format is color-adjective-animal, you can change to custom domain with paid packages)

### SMS
1. We are using Infobip provided by TELE2 for our messaging. If you're on the same platform - good. If not, set `const sms = false` in the code or implement your own gateway.
2. Set up message templates at `./config/messages`

### Trello
1. Update your trello credentials and board in `./config/trello.json`
2. Make sure your Trello lists are called `Incoming`, `Rejected` and `Approved`, or change the hardcoded values in the code
3. Create a webhook with board as target for this service on Trello. There is no web interface for doing this, use Postman to do it via their API. (NB! You need to run the service first so Trello can validate the endpoint)

### Run the service
Deploy the cloud function, or run it however you like, I'm not a cop. For Google Cloud: `gcloud functions deploy trello_monitor --runtime nodejs8 --trigger-http --region europe-west1`

### Notes
1. Name, Phone and Address fields are hidden from public in Zelos tasks by default. Once a volunteer is approved they will see the details
2. Tasks are created with `"assignment_approve_needed": true` and `"completion_approve_needed": false,` flags by default, you can change this in Zelos.js model