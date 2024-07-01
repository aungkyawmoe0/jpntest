const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const usersFilePath = path.join(__dirname, '../data/users.json');
const { sessions } = require('./auth');

function handleUserPage(req, res) {
    let cookies = querystring.parse(req.headers.cookie, '; ');
    let sessionId = cookies.sessionId;
    let userSession = sessions[sessionId];
    if (!userSession) {
        res.writeHead(401);
        res.end('Unauthorized');
        return;
    }

    let username = userSession.username;

    fs.readFile(usersFilePath, (err, data) => {
        if (err) throw err;
        let users = JSON.parse(data);
        let user = users.find(user => user.username === username);
        if (user) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(user));
        } else {
            res.writeHead(400);
            res.end('User not found');
        }
    });
}

function handleAdminPage(req, res) {
    let cookies = querystring.parse(req.headers.cookie, '; ');
    let sessionId = cookies.sessionId;
    let userSession = sessions[sessionId];
    if (!userSession || userSession.role !== 'admin') {
        res.writeHead(401);
        res.end('Unauthorized');
        return;
    }

    fs.readFile(usersFilePath, (err, data) => {
        if (err) throw err;
        let users = JSON.parse(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
    });
}

module.exports = { handleUserPage, handleAdminPage };
