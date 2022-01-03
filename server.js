require("rootpath")();

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const errorHandler = require("server/_helpers/error-handler");
const path = require("path");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
// global error handler
app.use(errorHandler);

// Serve only the static files form the www directory
app.use(express.static("./www"));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, "/www/index.html"));
});

// Start the app by listening on the default Heroku port
const port = process.env.PORT ? process.env.PORT : 4000;

  app.listen(port, function () {
    console.log("Server listening on port " + port);
  });
// }
