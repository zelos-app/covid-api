const axios = require('axios');

const env = (process.env.GCP_PROJECT) ? "" : ".dev"
const config = require(`../config/trello${env}.json`);

class Trello {
    constructor(board = config.board) {
        this.board = board;
        this.lists = {};
        //this.cfields = {};
        this.authParams = `?key=${config.key}&token=${config.token}`;
    }
    async init() {
        await this.initLists();
        //await this.initFields();
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

    async getCard(id) {
        console.log(`Getting card ${id}...`)
        const res = await axios.get(`https://api.trello.com/1/cards/${id}${this.authParams}`)
        //console.log(res.data)
    }

    async addLabel(card, status, color) {
        try {
            const res = await axios.post(`https://api.trello.com/1/cards/${card}/labels${this.authParams}&color=${color}&name=${status}`);
        } catch (err) {
            console.error(`Couldn't add label`);
        }
    }
    async getLabels(card) {
        try {
            const res = await axios.get(`https://api.trello.com/1/cards/${card}${this.authParams}&fields=labels`);
            return res.data.labels
        } catch (err) {
            console.error("Couldn't get labels");
        }
    }

    async newCard(formFields, list = this.lists.incoming) {
        let query = []
        let request = formFields.request;
        if (request.length > 160) {
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