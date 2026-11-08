    const express = require('express');
    const router = express.Router();
    const { register, login, refresh, updateEmail, updatePassword } = require('./auth.controller');
    const requireAuth = require('../../middleware/auth.middleware');
    const { loginRateLimiter, registerRateLimiter } = require('../../middleware/rateLimit.middleware');

    router.post('/register', registerRateLimiter, register);
    router.post('/login', loginRateLimiter, login)
    router.post('/refresh', refresh)
    router.put('/email', requireAuth, updateEmail)
    router.put('/password', requireAuth, updatePassword)

    module.exports = router;
