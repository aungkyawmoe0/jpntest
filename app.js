const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');

const { handleRegister, handleLogin, handleLogout } = require('./routes/auth');
const { handleQuestions, handleSubmit, handleAddQuestion } = require('./routes/quiz');
const { handleUserPage, handleAdminPage } = require('./routes/user');

function serveStaticFile(res, filepath, contentType) {
    fs.readFile(filepath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    switch (parsedUrl.pathname) {
        case '/':
        case '/index.html':
            serveStaticFile(res, path.join(__dirname, 'public', 'index.html'), 'text/html');
            break;
        case '/register.html':
            serveStaticFile(res, path.join(__dirname, 'public', 'register.html'), 'text/html');
            break;
        case '/login.html':
            serveStaticFile(res, path.join(__dirname, 'public', 'login.html'), 'text/html');
            break;
        case '/user_dashboard.html':
            serveStaticFile(res, path.join(__dirname, 'public', 'user_dashboard.html'), 'text/html');
            break;
        case '/admin_dashboard.html':
            serveStaticFile(res, path.join(__dirname, 'public', 'admin_dashboard.html'), 'text/html');
            break;
        case '/quiz.html':
            serveStaticFile(res, path.join(__dirname, 'public', 'quiz.html'), 'text/html');
            break;
        case '/register':
            handleRegister(req, res);
            break;
        case '/login':
            handleLogin(req, res);
            break;
        case '/logout':
            handleLogout(req, res);
            break;
        case '/user':
            handleUserPage(req, res);
            break;
        case '/admin':
            handleAdminPage(req, res);
            break;
        case '/questions':
            handleQuestions(req, res);
            break;
        case '/submit':
            handleSubmit(req, res);
            break;
        case '/addQuestion':
            handleAddQuestion(req, res);
            break;
        default:
            res.writeHead(404);
            res.end('Not found');
    }
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
