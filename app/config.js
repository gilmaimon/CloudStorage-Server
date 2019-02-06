// Config
const config = {
    port: process.env.HTTP_PORT | 80,
    web_sockets_port: process.env.WS_PORT | 8080,
    mongodb_url: "mongodb://localhost:3003",
    verbose : false,
    allow_registering : true,
    test_routes : true,

    show_register_ui : true,
    
    requests_limiter_window_minutes: 15,
    requests_limiter_max_requests: 2000,

    slowdown_window_minutes: 15,
    slowdown_max_requests: 1750,
    slowdown_delay_ms: 50
};

config.port = config.port || 8080;
config.web_sockets_port = config.web_sockets_port || 8181;
config.verbose = config.verbose || false;
config.allow_registering = config.allow_registering || false;
config.test_routes = config.test_routes || false; 
config.show_register_ui = config.show_register_ui || false;

config.requests_limiter_window_minutes = config.requests_limiter_window_minutes || 15 * 60 * 1000;
config.requests_limiter_max_requests = config.requests_limiter_max_requests || 500;

config.slowdown_window_minutes = config.slowdown_window_minutes || 15 * 60 * 1000;
config.slowdown_max_requests = config.slowdown_max_requests || 500;
config.slowdown_delay_ms = config.slowdown_delay_ms || 500;

// returns as key (for limiting and slowing down requests) returns the username or the ip (if no username is provided)
config.limits_key = function(req) {
    if (req.body['username'] != null) return req.body.username;
    else return req.ip;
};

module.exports = config;