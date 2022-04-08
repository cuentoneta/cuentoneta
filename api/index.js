const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('server/_helpers/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// global error handler
app.use(errorHandler);

const apiRoutes = [
    { path: '/api/push-notifications', controller: './controllers/push-notifications.controller' },
    { path: '/api/story', controller: './controllers/story.controller' },
];

// api routes
for (const route of apiRoutes) {
    app.use(route.path, require(route.controller));
}
