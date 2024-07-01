const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const questionsFilePath = path.join(__dirname, '../data/questions.json');
const usersFilePath = path.join(__dirname, '../data/users.json');
const { sessions } = require('./auth');

function handleQuestions(req, res) {
    fs.readFile(questionsFilePath, (err, data) => {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
    });
}

function handleSubmit(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        let answers = JSON.parse(body);
        fs.readFile(questionsFilePath, (err, data) => {
            if (err) throw err;
            let questions = JSON.parse(data);
            let score = answers.reduce((score, answer) => {
                return score + (questions[answer.question].answer === answer.answer ? 1 : 0);
            }, 0);
            
            // Get the session ID and username
            let cookies = querystring.parse(req.headers.cookie, '; ');
            let sessionId = cookies.sessionId;
            let userSession = sessions[sessionId];
            if (!userSession) {
                res.writeHead(401);
                res.end('Unauthorized');
                return;
            }

            let username = userSession.username;

            // Store the score
            fs.readFile(usersFilePath, (err, data) => {
                if (err) throw err;
                let users = JSON.parse(data);
                let user = users.find(user => user.username === username);
                if (user) {
                    user.scores.push(score);
                    fs.writeFile(usersFilePath, JSON.stringify(users), err => {
                        if (err) throw err;
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ score }));
                    });
                } else {
                    res.writeHead(400);
                    res.end('User not found');
                }
            });
        });
    });
}

function handleAddQuestion(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        let { question, options, answer } = JSON.parse(body);
        fs.readFile(questionsFilePath, (err, data) => {
            if (err) throw err;
            let questions = JSON.parse(data);
            questions.push({ question, options, answer });
            fs.writeFile(questionsFilePath, JSON.stringify(questions), err => {
                if (err) throw err;
                res.writeHead(200);
                res.end('Question added');
            });
        });
    });
}

module.exports = { handleQuestions, handleSubmit, handleAddQuestion };
