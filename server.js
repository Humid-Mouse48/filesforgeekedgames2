const express = require('express');
const { createServer } = require('node:http');
const { createBareServer } = require('@tomphttp/bare-server-node');
const { uvPath } = require('@titaniumnetwork-dev/ultraviolet');

const app = express();
const server = createServer(app);

// Initialize the Bare server engine on the /bare/ endpoint
const bareServer = createBareServer('/bare/');

// Serve your normal website files from the current folder
app.use(express.static(__dirname));

// Expose Ultraviolet's core service worker and bundle files to the frontend
app.use('/uv/', express.static(uvPath));

// Route requests: If it's a proxy request, give it to Bare. Otherwise, give it to Express.
server.on('request', (req, res) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeRequest(req, res);
    } else {
        app(req, res);
    }
});

// Handle WebSockets (vital for complex browser games and chat apps)
server.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Ultraviolet proxy server running at http://localhost:${PORT}`);
});