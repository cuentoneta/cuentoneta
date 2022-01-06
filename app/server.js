require('rootpath')();

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('server/_helpers/error-handler');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const options = {
    key: fs.readFileSync('server/_certificates/cert.key'),
    cert: fs.readFileSync('server/_certificates/cert.pem'),
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// global error handler
app.use(errorHandler);

// Serve only the static files form the www directory
app.use(express.static('./www'));

const apiRoutes = [{ path: '/story', controller: './server/controllers/story.controller' }];

// api routes
for (const route of apiRoutes) {
  app.use(route.path, require(route.controller));
}

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '/www/index.html'));
});


// Start the app by listening on the default Heroku port
const port = process.env.PORT ? process.env.PORT : 4000;
const localSecurePort = 443;

// If local environment, then start secure and insecure environments
if (port === 4000) {
    http.createServer(app).listen(port, function () {
        console.log('Insecure local server listening on port ' + port);
    });

    https.createServer(options, app).listen(localSecurePort, function () {
        console.log('Secure local server listening on port ' + localSecurePort);
    });
}
// If production, just secure
else {
    app.listen(port, function () {
        console.log('Server listening on port ' + port);
    });
}
