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
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        let cookies = querystring.parse(req.headers.cookie, '; ');
        let sessionId = cookies.sessionId;
        let userSession = sessions[sessionId];
        if (!userSession) {
            res.writeHead(401);
            res.end('Unauthorized');
            return;
        }

        let answers = JSON.parse(body);
        fs.readFile(questionsFilePath, (err, data) => {
            if (err) throw err;
            let questions = JSON.parse(data);
            let score = 0;
            let resultAnswers = questions.map((question, index) => {
                let isCorrect = question.answer == answers[index];
                if (isCorrect) score++;
                return {
                    question: question.question,
                    userAnswer: question.options[answers[index]],
                    correctAnswer: question.options[question.answer],
                    isCorrect: isCorrect
                };
            });

            fs.readFile(usersFilePath, (err, data) => {
                if (err) throw err;
                let users = JSON.parse(data);
                let user = users.find(user => user.username === userSession.username);
                user.scores.push(score);
                fs.writeFile(usersFilePath, JSON.stringify(users), err => {
                    if (err) throw err;
                    userSession.result = { score, answers: resultAnswers };
                    res.writeHead(200);
                    res.end(JSON.stringify({ message: 'Quiz submitted successfully' }));
                });
            });
        });
    });
}

const handleAddQuestion = (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const newQuestion = JSON.parse(body);
            if (newQuestion.options.length !== 4) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Each question must have exactly 4 options' }));
                return;
            }
            fs.readFile(questionsFilePath, (err, data) => {
                if (err) {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Failed to load questions' }));
                    return;
                }
                const questions = JSON.parse(data);
                questions.push(newQuestion);
                fs.writeFile(questionsFilePath, JSON.stringify(questions, null, 2), err => {
                    if (err) {
                        res.writeHead(500);
                        res.end(JSON.stringify({ error: 'Failed to save question' }));
                        return;
                    }
                    res.writeHead(200);
                    res.end(JSON.stringify({ message: 'Question added successfully' }));
                });
            });
        } catch (error) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Invalid JSON input' }));
        }
    });
}

const handleDeleteQuestion = (req, res, pathname) => {
    const index = parseInt(pathname.split('/').pop(), 10);
    fs.readFile(questionsFilePath, (err, data) => {
        if (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to load questions' }));
            return;
        }
        const questions = JSON.parse(data);
        questions.splice(index, 1);
        fs.writeFile(questionsFilePath, JSON.stringify(questions, null, 2), err => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Failed to delete question' }));
                return;
            }
            res.writeHead(200);
            res.end(JSON.stringify({ message: 'Question deleted successfully' }));
        });
    });
}

const handleEditQuestion = (req, res, pathname) => {
    const index = parseInt(pathname.split('/').pop(), 10);
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const updatedQuestion = JSON.parse(body);
            fs.readFile(questionsFilePath, (err, data) => {
                if (err) {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Failed to load questions' }));
                    return;
                }
                const questions = JSON.parse(data);
                if (updatedQuestion.options.length === 4) {
                    questions[index].options = updatedQuestion.options;
                }
                questions[index].answer = updatedQuestion.answer;
                fs.writeFile(questionsFilePath, JSON.stringify(questions, null, 2), err => {
                    if (err) {
                        res.writeHead(500);
                        res.end(JSON.stringify({ error: 'Failed to update question' }));
                        return;
                    }
                    res.writeHead(200);
                    res.end(JSON.stringify({ message: 'Question updated successfully' }));
                });
            });
        } catch (error) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Invalid JSON input' }));
        }
    });
}

function handleResult(req, res) {
    let cookies = querystring.parse(req.headers.cookie, '; ');
    let sessionId = cookies.sessionId;
    let userSession = sessions[sessionId];
    if (!userSession) {
        res.writeHead(401);
        res.end('Unauthorized');
        return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(userSession.result));
}

module.exports = { handleQuestions, handleSubmit, handleAddQuestion, handleDeleteQuestion, handleEditQuestion, handleResult };
