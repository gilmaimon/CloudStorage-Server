// requests slowdown
module.exports = {get: function get(config) {
    const slowDown = require('express-slow-down');
    const speedLimiter = slowDown({
        windowMs: config.slowdown_window_minutes * 60 * 1000, 
        delayAfter: config.slowdown_max_requests,
        delayMs: config.slowdown_delay_ms,
        keyGenerator: config.limits_key
    });
    return speedLimiter;
}}