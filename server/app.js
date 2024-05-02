var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var logger = require('morgan');
var cors = require("cors");

require("dotenv").config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var accessGroupRouter = require('./routes/accessGroup');
var docs = require('./routes/docs');
var entities = require('./routes/entities');
var imgprofile = require('./routes/imageProfile');
var modalities = require('./routes/modalities');
var teams = require('./routes/teams');
var competitions = require('./routes/competitions');

var app = express();

const http = require("http");

const server = http.createServer(app);

server.listen(process.env.PORT, process.env.HOST, ()=>{
  console.log("|PODIUM STARTED SUCCESSFULLY 🏆|");
  console.log(`-> http://${process.env.HOST}:${process.env.PORT} <-`);
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true}));
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/access-group', accessGroupRouter);
app.use('/docs', docs);
app.use('/entities', entities);
app.use('/image-profile', imgprofile);
app.use('/modalities', modalities);
app.use('/teams', teams);
app.use('/competitions', competitions);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
