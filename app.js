const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');

const { handleRegister, handleLogin, handleLogout } = require('./routes/auth');
const { handleQuestions, handleSubmit, handleAddQuestion, handleDeleteQuestion, handleEditQuestion, handleResult } = require('./routes/quiz');
const { handleUserPage, handleAdminPage, handleShowUsers } = require('./routes/user');

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
    const pathname = parsedUrl.pathname;

    if (req.method === 'GET') {
        if (pathname === '/' || pathname === '/index.html') {
            serveStaticFile(res, './public/index.html', 'text/html');
        } else if (pathname === '/login.html') {
            serveStaticFile(res, './public/login.html', 'text/html');
        } else if (pathname === '/register.html') {
            serveStaticFile(res, './public/register.html', 'text/html');
        } else if (pathname === '/quiz.html') {
            serveStaticFile(res, './public/quiz.html', 'text/html');
        } else if (pathname === '/result.html') {
            serveStaticFile(res, './public/result.html', 'text/html');
        } else if (pathname === '/user_dashboard.html') {
            serveStaticFile(res, './public/user_dashboard.html', 'text/html');
        } else if (pathname === '/admin_dashboard.html') {
            serveStaticFile(res, './public/admin_dashboard.html', 'text/html');
        } else if (pathname === '/add_question.html') {
            serveStaticFile(res, './public/add_question.html', 'text/html');
        } else if (pathname === '/show_users.html') {
            serveStaticFile(res, './public/show_users.html', 'text/html');
        } else if (pathname === '/update-quiz.html') {
            serveStaticFile(res, './public/update-quiz.html', 'text/html');
        } else if (pathname === '/edit-quiz.html') {
            serveStaticFile(res, './public/edit-quiz.html', 'text/html');
        } else if (pathname === '/questions') {
            handleQuestions(req, res);
        } else if (pathname === '/user') {
            handleUserPage(req, res);
        } else if (pathname === '/admin') {
            handleAdminPage(req, res);
        } else if (pathname === '/result') {
            handleResult(req, res);
        } else if (pathname === '/showUsers') {
            handleShowUsers(req, res);
        } else {
            // Serve static files like CSS, JS, images
            serveStaticFile(res, `./public${pathname}`, getContentType(pathname));
        }
    } else if (req.method === 'POST') {
        if (pathname === '/register') {
            handleRegister(req, res);
        } else if (pathname === '/login') {
            handleLogin(req, res);
        } else if (pathname === '/logout') {
            handleLogout(req, res);
        } else if (pathname === '/submit') {
            handleSubmit(req, res);
        } else if (pathname === '/addQuestion') {
            handleAddQuestion(req, res);
        }
    } else if (req.method === 'PUT') {
        if (pathname.startsWith('/editQuestion/')) {
            handleEditQuestion(req, res, pathname);
        }
    } else if (req.method === 'DELETE') {
        if (pathname.startsWith('/deleteQuestion/')) {
            handleDeleteQuestion(req, res, pathname);
        }
    }
});

const getContentType = (pathname) => {
    if (pathname.endsWith('.css')) {
        return 'text/css';
    } else if (pathname.endsWith('.js')) {
        return 'application/javascript';
    } else if (pathname.endsWith('.png')) {
        return 'image/png';
    } else if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) {
        return 'image/jpeg';
    } else {
        return 'text/html';
    }
};

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
