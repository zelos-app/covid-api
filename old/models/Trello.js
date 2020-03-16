const axios = require('axios');
const util = require('util');

const config = require("../auth/trello-account.json");

class Trello {
    constructor(body = null) {
        this.data = body;
        this.authParams = `?key=${config.key}&token=${config.token}`;
        this.fieldIds = {
            "name": "5e6d29241b49b216d9a914d5",
            "phone": "5e6d291c1f7083515d255211",
            "location": "5e6d292f2ba2395224ed747b",
            "address": "5e6d2984cb1009845bf440f8"
        }
    }
    async getCard(id) {
        console.log(`Getting card ${id}...`)
        const res = await axios.get(`https://api.trello.com/1/cards/${id}${this.authParams}`)
        //console.log(res.data)
    }
    async getCustomFields(id) {
        const res = await axios.get(`https://api.trello.com/1/cards/${id}/customFieldItems${this.authParams}`);
        return res.data;
    }

    async getDesc(id) {
        const res = await axios.get(`https://api.trello.com/1/cards/${id}/desc${this.authParams}`);
        return res.data._value;
    }

    async newCard(request, idList = "5e6ce605f677832cd1cd551c") {
        let query = []
        query.push(`name=${request.request.substring(0,57)}...`);
        query.push(`desc=${request.request}`);
        query.push(`pos=bottom`);
        query.push(`idList=${idList}`);
        query = query.join('&');

        const req = encodeURI(`https://api.trello.com/1/cards${this.authParams}&${query}`);
        const res = await axios.post(req);
        this.addFields(res.data.id, request);
    }
    async addFields(cardId, fields) {
        delete fields.request;
        const requests = [];
        Object.keys(fields).forEach(item => {
            const fieldId = this.fieldIds[item];
            const value = {
                "value": {
                    "text": fields[item]
                },
                "key": config.key,
                "token": config.token
            }
            requests.push([`https://api.trello.com/1/card/${cardId}/customField/${fieldId}/item`, value])
        })
        //console.log(requests);
        requests.forEach(async req => {
            //console.log(req)
            const res = await axios.put(req[0], req[1]);
            //console.log(res.data);
        })
        
    }
}

module.exports = Trello;