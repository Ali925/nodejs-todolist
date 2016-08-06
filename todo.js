var tasks = require('./models/tasks');

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser());

var templates = require('consolidate');
app.engine('hbs', templates.handlebars);
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

var request = require('request');
var urlutils = require('url');

var cookieParser = require("cookie-parser");
app.use(cookieParser());

var session = require("cookie-session");
app.use(session({keys: ['secret']}));

var passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());

var localStrategy = require("passport-local").Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new localStrategy(function(username, password, done) {
	
	tasks.list('admins', function(err, admins) {
		console.dir(admins);
		key = 0;
		if(err)
			console.dir(err);
		else{
	for(i in admins) {
		if(admins[i].login == username && admins[i].password == password)
			{key = 2;
			break;}	
		else if	(admins[i].login == username) 
			key = 1;
	
	}
		}
		
	if(key == 1) {
		console.log('string-1');
		return done(null, false, {message: "Неверный логин"});
		
	}
	if(key == 0) {
		console.log('string-2');
		return done(null, false, {message: "Неверный пароль"});
		
	}
	
	return done(null, {username: username});
	 });
}));

passport.use(new FacebookStrategy({
    clientID: 1509898012659848,
    clientSecret: '56c052f4dc9e32d90c75a7e3fd0bf159',	
    callbackURL: "http://localhost:8080/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
 	process.nextTick(function () {
   		return done(null, profile);
 	});
	}
));

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});	

app.get('/login', function(req, res){
	res.render('login');
});
	
app.post('/login', function(req, res, next) {
	if(req.body.rem){
	  passport.authenticate('local', function(err, user, info) {
	    if (err) { return next(err); }
	    if (!user) { return res.redirect('/login'); }
	    req.logIn(user, function(err) {
	      if (err) { console.log(err); return next(err); }
    	  req.session.username = user.username;
    	  req.sessionOptions.maxAge = 365*24*60*60*1000;
	      return res.redirect('/');
	    });
	  })(req, res, next);
	  }
	else {
		passport.authenticate('local', function(err, user, info) {
	    if (err) { return next(err); }
	    if (!user) { return res.redirect('/login'); }
	    req.logIn(user, function(err) {	
	      if (err) { console.log(err); return next(err); }
	      return res.redirect('/');
	    });
	  })(req, res, next);
	}  	
});

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', passport.authenticate('facebook', 
									{ successRedirect: '/',
                                      failureRedirect: '/login' }));

var mustBeAuthenticated = function(req, res, next) {
	req.isAuthenticated() ? next() : res.redirect('/login');
}

app.all("/", mustBeAuthenticated);
app.all("/change", mustBeAuthenticated);
app.all("/delete", mustBeAuthenticated);

app.get('/logout', function(req, res) {
	req.session = null;
	req.logout();
	res.redirect("/login");
});

app.get('/', function(req, res) {
	tasks.list('tasks', function(err, tasks) {
		console.dir(tasks);

		templates.handlebars(
			'views/tasks.hbs', 
			{tasks: tasks},
			function(err, html) {
				if (err) 
					throw err;

				res.render('layout.hbs', {
					content: html
				});
			}
		)
	});
});

app.post('/', function(req, res) {
	tasks.add('tasks', {task: req.body.task, priority: req.body.priority}, function() {
		res.redirect('/');
	});
});

app.post('/change', function(req, res) {
	console.dir(req.body);
	tasks.change('tasks', req.body.id, {task: req.body.task, priority: req.body.priority}, function() {
		res.redirect('/');	
	});
});
			
app.post('/complete', function(req, res) {
	tasks.complete(req.body.id, function() {
		res.redirect('/');	
	});
});

app.post('/delete', function(req, res) {
	tasks.delete('tasks', req.body.id, function() {
		res.redirect('/');
	});
});

app.listen(8080);
console.log('Express server listening on port 8080');