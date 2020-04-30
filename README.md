# Tagger - Back-End

The back-end is deployed on at [Heroku](https://tagger-be-dev.herokuapp.com/).

[![Maintainability](https://api.codeclimate.com/v1/badges/aa6f20b6890135c5e02f/maintainability)](https://codeclimate.com/github/Lambda-School-Labs/tagger-be/maintainability)

## Back-End Responsibilites 

* The IMAP service retrieves and stores new email messages into a PostgreSQL database.
* Endpoints are exposed to enable the front-end to:
  * Retreive a list of message meta-data (to, from, subject, etc) in a pageable format
  * Retreive all the data for a specific message (meta-data + body)
  * Search for specific fields (from, to, etc) in messages and return those messages that match
  * Send a message via SMTP
  
NOTE: All DS functionality has been disabled/commented-out since we had no DS contributors

#### Backend delpoyed at [Heroku](https://taggerhq.herokuapp.com/)

## Getting Started

To get the server running locally:

* ```npm install``` to install all required dependencies
* ```npm run server``` to start the local server on port 8000

## Tech Stack

* node
* cors
* dotenv
* helmet
* express
* knex
* imap-simple
* mailparser
* nodemailer

## Endpoints for Front-End Consumption

Note: ALL ROUTES ARE PRIVATE (for the use of the front-end only)

#### Table of Contents  
- [Get Message List](#get-message-list)
- [Get Message](#get-message)

## Get Message List

Given a label (typically "inbox"), a list of messages will be returned along with the total count

**URL** : `/emails/label/:label/:page`

**Method** : `GET`

### Success Response

**Condition** : If everything is OK.

**Code** : `200 OK`

**Content example**

```json
{
  "totalCount": {
    "count": 204
  },
  "messages": [
    {
      "id": 317,
      "name": "Wish",
      "subject": "Buy Pillows",
      "date": "1588260629000.0",
      "email_body_text": "Hello world..."
    },
    { ... }
   ]
 }
```

### Error Responses

**Condition** : If no messages are found.

**Code** : `200 OK`

**Content example**

```json
{
  "totalCount": {
     "count": 0
  },
  "messages": []
}
```

## Get Message

Retrieves all the information for a specific message

**URL** : `/emails/email/:id`

**Method** : `GET`

### Success Response

**Condition** : If message exists.

**Code** : `200 OK`

**Content example**

```json
[
  {
    "id": 1,
    "message_id": "<98f29004-6c77-308b-0201-36cec79677fc@gmail.com>",
    "from": "taggerlabs20@gmail.com",
    "name": "",
    "to": "receiver_email@service.com",
    "subject": "HERE COMES THE SPAM",
    "email_body": "0",
    "email_body_text": "WE'RE GOIGN TO JAM, YOUR MAILBOX FULL OF SPAM!\n",
    "read": 0,
    "date": "1580157214000.0",
    "uid": 3,
    "labels": "\\Inbox",
    "gMsgId": "1656914933919808974",
    "gmThreadID": "1656914933919808974",
    "user_id": 1
  }
]
```

### Error Responses

**Condition** : If message is not found.

**Code** : `200 OK`

**Content example**

```json
[]
```
