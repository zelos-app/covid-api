const axios = require('axios')

const credentials = require("../auth/zelos-account.json")

class Zelos {
    constructor(workspace) {
        this.url = `https://${workspace}.zelos.space`;
        this.credentials = credentials;
    }

    async init() {
        const res = await axios.post('https://app.zelos.space/api/auth', this.credentials);
        this.tokens = res.data.data;
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.tokens.access.token}`;
        console.log(`[i] Authenticated`);
        //await this.getTasks();
        //await this.getGroups();
    }

    async getTasks() {
        const res = await axios.get(`${this.url}/api/task`);
        this.tasks = res.data.data;
        console.log(`[i] Found ${this.tasks.length} tasks`)
    }

    async getGroups(name = "") {
        if (name === "") {
            const res = await axios.get(`${this.url}/api/group`);
            this.groups = res.data.data;
            console.log(`[i] Loaded ${this.groups.length} groups`);
        } else {
            let url = `${this.url}/api/group?name=${name}`;
            url = encodeURI(url);
            const res = await axios.get(url);
            if (res.data.data == "") {
                return 0;
            } else {
                const group = res.data.data
                return group[0].data.id
            }
        }
    }

    async newTask(details, groups = [0]) {
        
        const body = {
            "type": "regular",
            "name": `${details.description.substring(0,80)}...`,
            "description": `${details.description}\n\n${details.name}\n${details.phone}\n${details.address}`,
            "execution_start_date": null,
            "execution_end_date": null,
            "points": 1,
            "publish_at": null,
            "active_until": null,
            "images": [],
            "assignment_approve_needed": true,
            "completion_approve_needed": false,
            "max_participants_amount": 1,
            "groups": groups,
            "location_id": null,
            "user_ids": []
        }
        const res = await axios.post(`${this.url}/api/task/regular`, body)
        if (res.status === 200) {
            const taskUrl = this.url + "/tasks/" + res.data.data.id;
            console.log(`[i] Created ${taskUrl}`);
        } else {
            //throw "Failed to create a task"
        }
        
    }
}

function getKeyByValue(object, value) { 
    return Object.keys(object).find(key => object[key] === value); 
}

module.exports = Zelos;