
# Easily deployable back-end system for taking help requests and managing volunteers during the COVID-19 season

## About this project

This was written during an online [Garage48 hackathon](http://garage48.org/events/hack-the-crisis) in Estonia.
You can find and support our project at https://kogukondaitab.ee

**NB! This project is deprecated and replaced by [Community Heldesk](https://github.com/zelos-app/community-helpdesk) for [GlobalHack](https://theglobalhack.com/)**

## System components

* [Wordpress](https://www.wordpress.com) site with [Contact Form 7](https://wordpress.org/plugins/contact-form-7/) for providing a request form for vulnerable people in need
* [CF7 to Webhook](https://wordpress.org/plugins/cf7-to-zapier/) plugin for relaying form data
* Back-end service (cf7_to_trello) for creating Trello cards with requests
* [Trello board](https://www.trello.com) for sorting requests and marking them as approved or rejected
* [Trello webhook](https://developers.trello.com/page/webhooks) that sends updates to back-end service about card updates
* Back-end service (trello_monitor) that:
  * Creates tasks on Zelos upon approval
  * Sends an SMS to the submitter about request approval or rejection
  * Marks the cards as resolved
* [Zelos App](https://www.getzelos.com) as the core back- and frontend for managing volunteers, task delegation and tracking

## Screenshots

### Request form
![](https://i.imgur.com/26x6tu3.png)

## Managing requests in Trello
![](https://i.imgur.com/wiOr8ka.png)

## Tasks in Zelos App
<img src="https://i.imgur.com/oiGJbVc.png" width="280"> <img src="https://i.imgur.com/uV6vy3w.png" width="280"> <img src="https://i.imgur.com/w84W1XZ.png" width="280">

## About the code

Everything is written in Node.js and is best run as cloud functions. It can also be run as a regular node app using pm2 and probably on AWS lambda as well with little or no changes.  

Documentation about the services are in their respective subfolders.
