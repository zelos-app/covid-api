const axios = require('axios');
const config = require(`../config/infobip.json`);

class Infobip {
    constructor() {
        this.baseUrl = config.baseUrl;
        this.apiKey = config.apiKey;
        this.sender = config.sender;
        axios.defaults.headers.common['Authorization'] = `App ${this.apiKey}`;
    }

    async sendMessage(number, text) {
        const req = {};
        req.messages = [];
        req.messages.push({
            "from": this.sender,
            "destinations": [{
                "to": number
            }],
            "text": text
        })
        try {
            await axios.post(`${this.baseUrl}`, req)
        } catch (err) {
            console.error(`[!] Failed to send a message to ${number}: ${err.message}`);
            return err;
        }
    }
}

module.exports = Infobip;