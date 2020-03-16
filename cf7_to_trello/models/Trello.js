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
        const res = await axios.get(`https://api.trello.com/1/boards/${this.board}/lists${this.authParams}`);
        res.data.forEach(obj => {
            this.lists[obj.name.toLowerCase()] = obj.id;
        });
    }

    async initFields() {
        const res = await axios.get(`https://api.trello.com/1/boards/${this.board}/customFields${this.authParams}`);
        res.data.forEach(obj => {
            this.cfields[obj.name.toLowerCase().replace(/\s.*/, '')] = obj.id;
        });
    }

    async newCard(formFields, list = this.lists.incoming) {
        let query = []
        console.log(formFields);
        query.push(`name=${formFields.request.substring(0,57)}...`);
        query.push(`desc=${formFields.request}`);
        query.push(`pos=bottom`);
        query.push(`idList=${list}`);
        query = query.join('&');

        const req = encodeURI(`https://api.trello.com/1/cards${this.authParams}&${query}`);
        try {
            const res = await axios.post(req);
            this.addFields(res.data.id, formFields);
        } catch (err) {
            return err;
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
            requests.push([`https://api.trello.com/1/card/${card}/customField/${field}/item`, value])
        })
        requests.forEach(async req => {
            const res = await axios.put(req[0], req[1]);
        })

    }
}

module.exports = Trello;