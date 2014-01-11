var Connect = require('connect');

Connect.createServer(
  Connect.logger(), // Log responses to the terminal using Common Log Format.
  Connect.static(__dirname) // Serve all static files in the current dir.
).listen(process.env.PORT || 5000);
