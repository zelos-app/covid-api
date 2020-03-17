const axios = require('axios');

const env = (process.env.GCP_PROJECT) ? "" : ".dev"
const config = require(`../config/trello${env}.json`);

class Trello {
    constructor(board = config.board) {
        this.board = board;
        this.lists = {};
        this.customFields = {};
        this.authParams = `?key=${config.key}&token=${config.token}`;
    }
    async init() {
        const lists = await axios.get(`https://api.trello.com/1/boards/${this.board}/lists${this.authParams}`);
        lists.data.forEach(obj => {
            this.lists[obj.name.toLowerCase()] = obj.id;
        });
        const fields = await axios.get(`https://api.trello.com/1/boards/${this.board}/customFields${this.authParams}`);
        fields.data.forEach(obj => {
            this.customFields[obj.name.toLowerCase().replace(/\s.*/, '')] = obj.id;
        });
    }

    async getCustomFields(card) {
        try {
            const res = await axios.get(`https://api.trello.com/1/cards/${card}/customFieldItems${this.authParams}`);
            return res.data;
        } catch (err) {
            console.error(`[!] Error getting custom fields: ${err.message}`)
        }
    }

    async getDesc(id) {
        try {
            const res = await axios.get(`https://api.trello.com/1/cards/${id}/desc${this.authParams}`);
            console.log(res.data);
            return res.data._value;
        } catch (err) {
            console.error(`[!] Error getting card description: ${err.message}`)
        }
    }

    async addLabel(card, status, color) {
        try {
            const res = await axios.post(`https://api.trello.com/1/cards/${card}/labels${this.authParams}&color=${color}&name=${status}`);
        } catch (err) {
            console.error(`Couldn't add label: ${err.message}`);
        }
    }

    async addComment(card, comment) {
        try {
            const res = await axios.post(`https://api.trello.com/1/cards/${card}/actions/comments${this.authParams}&text=${comment}`);
        } catch (err) {
            console.error(`[!] Failed to add the comment: ${err.message}`);
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
}

module.exports = Trello;