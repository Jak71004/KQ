#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
var path    = require('path');
var mongojs = require('mongojs');
var bodyParser = require('body-Parser');
//load twilio module
var twilio = require('twilio');
//load http module - only needed for web server
var http = require('http');

//var bitcoinCtrl = require('./js/bitcoin');

var connectionString; 
var db; 

// Create a new REST API client to make authenticated requests against the
// twilio back end
var client = new twilio.RestClient('AC9c46405ec244abe2014d13d37bcdaa9dX', 'e9f585b39ac4cdbeee751fd11e72163eX');

var schools = [
    {
		"ID": "ClassicalPrep_34610",
		"Name": "Classical Prep",
		"TwilioNumber": "3522278954",
		"Admins": {
			"admin1": "Jack",
			"admin2": "Jane"
		},
		"Teachers": [{
			"teacher1": "Mr Doe",
			"teacher2": "Mrs Doe"
		}],
		"Students": [
			{
				"ID": "000",
				"FirstName": "Jon",
				"LastName": "Fluck",
				"MiddleInital": "D",
				"Teacher": "Mrs. Smith",
				"RmNumber": "401",
				"WhiteListNo": {
					"Primary": "3522776011",
					"Secondary": "3522776012",
					"Alternatives": [{
						"alt1": "3521111111",
						"alt2": "1111111111"
					}]
				},
				"BlackListNo": [{
					"BlackList1": "2222222222"
				}]
		},
        {
				"ID": "001",
				"FirstName": "jason",
				"LastName": "lee",
				"MiddleInital": "D",
				"Teacher": "Mrs. Carter",
				"RmNumber": "402",
				"WhiteListNo": {
					"Primary": "3522776013",
					"Secondary": "3522776014",
					"Alternatives": [{
						"alt1": "3523111111",
						"alt2": "1113111111"
					}]
				},
				"BlackListNo": [{
					"BlackList1": "2322222222"
				}]
		}]
    },
	{
		"ID": "Suncoast_34609",
		"Name": "Suncoast",
		"TwilioNumber": "3522278955",
		"Admins": [{
			"admin1": "Jill",
			"admin2": "Bill"
		}],
		"Teachers": [{
			"teacher1": "Mr Joe",
			"teacher2": "Mrs Jane"
		}],
		"Students": {}
    }
];
/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 3000;
        
        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };

    self.setupDatabase = function(){
        connectionString = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
            process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
            process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
            process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
            process.env.OPENSHIFT_APP_NAME;
        
        db = mongojs(connectionString,['DBWagers']);

    };

    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };
        schools.forEach(function(school){
            //Get All Wagers for this user
        self.routes['/api/schools/'+school.ID] = function(req, res) {
            //Get students for this school
            var students = school.Students;
            
            //Check incoming number against blacklist
            //Assuming not blacklisted, check primary
            //if found queue student
            //else check alternatives
                //if found queue student
                //else tell office and txt parent to park and go to office.
            
            // Create a TwiML response
            var twiml = new twilio.TwimlResponse();
            var smsNumber = req.from;
            
            // The TwiML response object will have functions on it that correspond
            // to TwiML "verbs" and "nouns". This example uses the "Say" verb.
            // Passing in a string argument sets the content of the XML tag.
            // Passing in an object literal sets attributes on the XML tag.
            twiml.message(smsNumber + ' ahoy hoy! Testing Twilio and node.js');

            //Render the TwiML document using "toString"
            res.writeHead(200, {
                'Content-Type':'text/xml'
            });
            res.end(twiml.toString());
        };  
        });
        
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();
        self.app.use(bodyParser.json());
        self.app.use(bodyParser.urlencoded({ extended: true }));
        self.app.use(express.static(path.join(__dirname, 'public')));
        self.app.use(function (req, res, next) {

            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
            //res.setHeader('Access-Control-Allow-Origin', 'http://BetYou.Fail'); //Allow BYF to connect

            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

            // Request headers you wish to allow
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            res.setHeader('Access-Control-Allow-Credentials', true);

            // Pass to next layer of middleware
            next();
        });
        
                
        self.app
            .post('/api/schools', function(req, res){
                console.log(schools);
        })
            .post('/api/wagers/wager', function(req,res){
                console.log(req.body.amount);
                console.log(req.body.amountBTC);
                var keyPair = bitcoinCtrl.CreateKeyPair();
                req.body.publicAddress = keyPair.getAddress();
                req.body.dateSubmitted = Date();
                console.log(req.body.dateSubmitted);
                console.log(req.body.publicAddress + " "+keyPair.toWIF());
                res.send(req.body);
        })
            .get('/api/schools', function(req, res){
                console.log(schools.school.ID);
                res.send(schools); 
        })
            .get('/api/students', function(req, res){
                console.log(students);
                res.json(students); 
        })
            .get('/api/sms', function(req, res){
                // Create a TwiML response
                var twiml = new twilio.TwimlResponse();
                var smsNumber = req.from;
            

                // The TwiML response object will have functions on it that correspond
                // to TwiML "verbs" and "nouns". This example uses the "Say" verb.
                // Passing in a string argument sets the content of the XML tag.
                // Passing in an object literal sets attributes on the XML tag.
                twiml.message('ahoy hoy! Testing Twilio and node.js');

                //Render the TwiML document using "toString"
                res.writeHead(200, {
                    'Content-Type':'text/xml'
                });
                res.end(twiml.toString());
        });
           
        schools.forEach(function(school){
            console.log(school.ID);
            self.app.get('/api/schools/'+ school.ID, self.routes['/api/schools/'+school.ID]);
        });
        /*schools.forEach(function(obj){
            self.app.get('/api/schools/'+obj.school.ID, self.routes['/api/schools/'+obj.school.ID]);
            console.log(obj.school.ID)
        });*/
        
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.setupDatabase();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

