// requests slowdown
module.exports = {get: function get(config) {
    // requests throttler and limiter
    const rateLimit = require("express-rate-limit");
    const limiter = rateLimit({
        windowMs: config.requests_limiter_window_minutes * 60 * 1000,
        max: config.requests_limiter_max_requests,
        handler: function(req, res) {
            res.status(429).send({error: true, message: "Too Many Requests. Wait and try again."});
        },
        keyGenerator: config.limits_key
    });
    return limiter;
}}