const jwt = require('jsonwebtoken');
const SECRET = 'dGhpc0lzU2VjdXJlS2V5IQ';

function authenticateToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/');
    }

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.redirect('/');
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
