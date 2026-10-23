/** Requirements */
const express = require('express'); // Express
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bycrypt = require("bcrypt"); // Bycrtpt
/* Local Requirements */
const config = require('./config');
const indexRouter = require('./routes/index');
const errorRouter = require('./routes/error');

const app = express();

/** view engine setup */
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
/* Add static path */
app.use(express.static(path.join(__dirname, './public')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());

app.use('/', indexRouter);
app.use(errorRouter);

app.listen(config.port);
console.log('Server running at http://localhost:' + config.port + '/');

module.exports = app;
