var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var jwt = require('jwt-simple');
var passport = require('passport');
var moment = require('moment');

var createSendToken = require('./services/jwt.js');
var googleAuth = require('./services/googleAuth.js');
var facebookAuth = require('./services/facebookAuth.js');
var localStrategy = require('./services/localStrategy.js');
var jobs = require('./services/jobs.js');
var emailVerification = require('./services/emailVerification.js');

var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// app.use(require('connect').bodyParser());
app.use(passport.initialize());

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

	next();
});

passport.use('local-register', localStrategy.register);
passport.use('local-login', localStrategy.login);

app.post('/register', passport.authenticate('local-register'), function (req, res) {
	emailVerification.send(req.user.email);
	createSendToken(req.user, res);
});

app.get('/auth/verifyEmail', emailVerification.handler);

// app.post('/login', function (req, res) {
// 	console.log(req.body);
// 	if(req.body.email === 'test@test.com' && req.body.password === '1234') {
// 		createSendToken(req.body, res);
// 	} else {
// 		res.status(401).send({
// 			message: 'login failed!'
// 		});
// 	}
// });

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createJWT(user) {
  var payload = {
    sub: user.email,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, "shhh..");
}

/*
 |--------------------------------------------------------------------------
 | Log in with Email
 |--------------------------------------------------------------------------
 */
app.post('/auth/login', function(req, res) {
	if(req.body.email === 'test@test.com' && req.body.password === '1234') {
		res.send({ token: createJWT(req.body) });
	} else {
		res.status(401).send({
			message: 'login failed!'
		});
	}
  // User.findOne({ email: req.body.email }, '+password', function(err, user) {
  //   if (!user) {
  //     return res.status(401).send({ message: 'Invalid email and/or password' });
  //   }
  //   user.comparePassword(req.body.password, function(err, isMatch) {
  //     if (!isMatch) {
  //       return res.status(401).send({ message: 'Invalid email and/or password' });
  //     }
  //     res.send({ token: createJWT(user) });
  //   });
  // });
});

app.post('/test', function (req, res) {
	var token = req.headers.authorization.split(' ')[1];
	var payload = jwt.decode(token, "shhh..");

	if (!payload.sub) {
		res.status(401).send({
			message: 'Authentication failed'
		});
	}

	if (!req.headers.authorization) {
		return res.status(401).send({
			message: 'You are not authorized'
		});
	}
	res.json(req.body);
});

app.post('/auth/facebook', facebookAuth);

app.get('/jobs', jobs);

app.post('/auth/google', googleAuth);

mongoose.connect('mongodb://localhost/psjwt');

var server = app.listen(3000, function () {
	console.log('api listening on ', server.address().port);
});