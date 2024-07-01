const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const usersFilePath = path.join(__dirname, '../data/users.json');
let sessions = {};

function handleRegister(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        const { username, password } = querystring.parse(body);
        fs.readFile(usersFilePath, (err, data) => {
            if (err) throw err;
            let users = JSON.parse(data);
            if (users.some(user => user.username === username)) {
                res.writeHead(400);
                res.end('Username already exists');
            } else {
                users.push({ username, password, role: 'user', scores: [] });
                fs.writeFile(usersFilePath, JSON.stringify(users), err => {
                    if (err) throw err;
                    res.writeHead(200);
                    res.end('Registration successful');
                });
            }
        });
    });
}

function handleLogin(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        const { username, password } = querystring.parse(body);
        fs.readFile(usersFilePath, (err, data) => {
            if (err) throw err;
            let users = JSON.parse(data);
            let user = users.find(user => user.username === username && user.password === password);
            if (user) {
                let sessionId = Math.random().toString(36).substring(2);
                sessions[sessionId] = { username, role: user.role };
                res.writeHead(200, { 'Set-Cookie': `sessionId=${sessionId}` });
                res.end(JSON.stringify({ role: user.role }));
            } else {
                res.writeHead(400);
                res.end('Invalid username or password');
            }
        });
    });
}

function handleLogout(req, res) {
    let cookies = querystring.parse(req.headers.cookie, '; ');
    let sessionId = cookies.sessionId;
    delete sessions[sessionId];
    res.writeHead(200, { 'Set-Cookie': 'sessionId=; Max-Age=0' });
    res.end('Logged out');
}

module.exports = { handleRegister, handleLogin, handleLogout, sessions };
