var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter  = require('./routes/auth');
var postRouter  = require('./routes/posts');
var filesRouter = require('./routes/file');
// SWAGGER UI
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    info: {
      title: 'Swagger Express API', // Title (required)
      version: '1.0.0', // Version (required)
      description: 'A sample API',
      contact:{
        email: "vietthangad97@gmail.com"
      },
      license:{
        name: "Apache 2.0",
        url: "http://www.apache.org/licenses/LICENSE-2.0.html"
      },
    },
    host: "localhost:5000",
    basePath: "/api",
};

const options = {
  swaggerDefinition,
  apis:['./swagger.yaml'],
};

const swaggerSpec = swaggerJSDoc(options);
// 
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
mongoose.connect(process.env.DB_CONNECT, {useNewUrlParser: true},() => {
  console.log('connected successs');
} );

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Rout Middlewares
app.use('/', indexRouter);
app.use('/api/user', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/files', filesRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
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
