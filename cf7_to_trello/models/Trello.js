const axios = require('axios');

const env = (process.env.GCP_PROJECT) ? "" : ".dev"
const config = require(`../config/trello${env}.json`);

class Trello {
    constructor() {
        this.board = config.board;
        this.lists = {};
        this.cfields = {};
        this.authParams = `?key=${config.key}&token=${config.token}`;
    }
    async init() {
        await this.initLists();
        await this.initFields();
    }

    async initLists() {
        try {
            const res = await axios.get(`https://api.trello.com/1/boards/${this.board}/lists${this.authParams}`);
            res.data.forEach(obj => {
                this.lists[obj.name.toLowerCase()] = obj.id;
            });
        } catch (err) {
            console.error(`[!] Couldn't get lists from Trello:\n${err.message}`);
        }  
    }

    async initFields() {
        try {
            const res = await axios.get(`https://api.trello.com/1/boards/${this.board}/customFields${this.authParams}`);
            res.data.forEach(obj => {
                this.cfields[obj.name.toLowerCase().replace(/\s.*/, '')] = obj.id;
            });
        } catch (err) {
            console.error(`[!] Couldn't get custom fields from Trello:\n${err.message}`);
        }
        
    }

    async newCard(formFields, list = this.lists.incoming) {
        let query = []
        let request = formFields.request;
        if (request.length > 160){
            query.push(`name=${request.substring(0,157)}...`);
        } else {
            query.push(`name=${request}`);
        }
        query.push(`desc=${request}`);
        query.push(`pos=bottom`);
        query.push(`idList=${list}`);
        query = query.join('&');

        const req = encodeURI(`https://api.trello.com/1/cards${this.authParams}&${query}`);
        try {
            const res = await axios.post(req);
            this.addFields(res.data.id, formFields);
        } catch (err) {
            console.error(`[!] Failed to create a card: ${err.message}`)
        }
    }

    async addFields(card, formFields) {
        delete formFields.request;
        const requests = [];
        Object.keys(formFields).forEach(item => {
            const field = this.cfields[item];
            const value = {
                "value": {
                    "text": formFields[item]
                },
                "key": config.key,
                "token": config.token
            }
            requests.push([`https://api.trello.com/1/card/${card}/customField/${field}/item`, value]);
        })
        requests.forEach(async req => {
            try {
                const res = await axios.put(req[0], req[1]);
            } catch (err) {
                console.error(`[!] Failed to update custom fields on card ${card}\n${err.message}`);
            }
        })

    }
}

module.exports = Trello;