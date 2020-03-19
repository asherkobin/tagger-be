# Tagger - Smarter Email

You can find the project at [Tagger](https://tagger-lab.netlify.com/).

Front-End:[![Maintainability](https://api.codeclimate.com/v1/badges/f0e8023998589cc4d94f/maintainability)](https://codeclimate.com/github/Lambda-School-Labs/tagger-fe/maintainability)

Back-End: [![Maintainability](https://api.codeclimate.com/v1/badges/aa6f20b6890135c5e02f/maintainability)](https://codeclimate.com/github/Lambda-School-Labs/tagger-be/maintainability)

## Project Overview

Introducing, [Tagger](https://tagger-lab.netlify.com/)!

[Trello Board](https://trello.com/b/fxTQlX74/labs-20-tagger-smarter-email)

[Product Canvas](https://www.notion.so/Tagger-Smarter-Email-01673a2ed9e54cb8834b959ad39f7de2)

#### Backend delpoyed at [Heroku](https://taggerhq.herokuapp.com/) <br>

## Getting started

To get the server running locally:

- Clone this repo
- **npm install** to install all required dependencies
- **node .** to start the local server
- **npm test** to start server using testing environment

### NodeJS

- NodeJS is a lightweight framework.
- The asynchronous nature of NodeJS makes it efficient for building API's.
- NodeJS is easy to learn if you know JavaScript.
- Since NodeJS is written in JavaScript, you can use one language for FE and BE.
- NodeJS scales well. Therefore, future additions may be added to this project by our group or another group at Lambda School.

## Endpoints for Frontend

#### Private Routes

**All routes require "id_token"**

## Email Routes

| Method |     Endpoint      |                                          Requirements                                           |                        Optional                        |      Description       |
| :----: | :---------------: | :---------------------------------------------------------------------------------------------: | :----------------------------------------------------: | :--------------------: |
|  POST  |    `/emails/`     |                           email(string), host(string), token(string)                            |                                                        |   receive all emails   |
|  POST  | `/emails/boxes/`  |                           email(string), host(string), token(string)                            |                                                        |   receive all boxes    |
|  POST  |    `/compose/`    | service(string), host(string), port(string), token(string), userEmail(string), receiver(string) | subject(string), body(string), cc(string), bcc(string) | create and send emails |
|  POST  | `/emails/stream/` |                                          email(string)                                          |                                                        |     streams emails     |

## DS Routes

| Method |      Endpoint      | Requirements  |                        Optional                         |               Description                |
| :----: | :----------------: | :-----------: | :-----------------------------------------------------: | :--------------------------------------: |
|  POST  |  `/emails/train/`  | email(string) |                                                         |      send emails to DS for training      |
|  POST  | `/emails/predict/` | email(string) | uid(string), from(string), msg(string), subject(string) | send search query to DS for smart search |

## Tech Stack

![MIT](https://img.shields.io/packagist/l/doctrine/orm.svg)
![JavaScript](https://img.shields.io/badge/Language-JavaScript-blue)
![Heroku](https://heroku-badge.herokuapp.com/?app=heroku-badge)
![Code Style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)
![Node.js](https://img.shields.io/badge/node.js-green)
![React.js](https://img.shields.io/badge/React-red)

## Dependencies

**axios,
axios-rate-limit,
bluebird,
cors,
dotenv,
express,
flatted,
google-auth-library,
googleapis,
helmet,
http,
imap,
imap-simple,
knex,
knex-cleaner,
mailparser,
mailparser-mit,
needle,
nodemailer,
oauth,
open,
pg,
sqlite,
supertest,
underscore,
url,
xoauth**
