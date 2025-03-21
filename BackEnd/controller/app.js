

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var user = require('../model/user.js');
var listing = require('../model/listing');
var offers = require('../model/offer');
var likes = require('../model/likes');
var images = require('../model/images')

var verifyToken = require('../auth/verifyToken.js');
var verifyUser = require('../auth/userAuth.js');
const bcryptMiddleware = require('../middleware/bcryptMiddleware.js');

var path = require("path");
var multer = require('multer')
var cors = require('cors');//Just use(security feature)

var morgan = require('morgan');
const { auditLogger, errorLogger } = require('../middleware/winstonMiddleware.js'); // Import the loggers
var rfs = require('rotating-file-stream');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.options('*', cors());//Just use
app.use(cors());//Just use
app.use(bodyParser.json());
app.use(urlencodedParser);

// Vuln 9: Insufficient General logging
//////////////////////// Logging //////////////////////////
// Create a rotating write stream for access logs
var accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, '../log')
});

// Create a rotating write stream for error logs
var errorLogStream = rfs.createStream('error.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, '../log')
});

// Custom token to log the IP address
morgan.token('remote-addr', function (req, res) {
    return req.ip;
});

// Custom format for logging
const customFormat = ':remote-addr [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

// Setup morgan to log ALL HTTP requests to the access.log file
app.use(morgan(customFormat, { stream: accessLogStream }));

// Setup morgan to log errors to the error.log file (Skip 2xx responses)
app.use(morgan(customFormat, {
    skip: function (req, res) { return res.statusCode < 400 },
    stream: errorLogStream
}));
//////////////////////// Logging //////////////////////////

//User APIs
app.post('/user/login', verifyUser.loginUser, bcryptMiddleware.checkIfHashed, bcryptMiddleware.comparePassword, function (req, res) {//Login
	var email = req.body.email;
	var password = res.locals.hash;

	user.loginUser(email, password, function (err, token, result) {
        // Error 401 resolved at comparePassword middleware
		if (err) {
            // Internal server error
            errorLogger.error(`Failed login attempt for email: ${req.body.email}, Timestamp: ${new Date().toISOString()}`);
			res.status(500);
			res.send(err.statusCode);
		} else {
            auditLogger.info(`User with email: ${req.body.email} has logged in successfully, Timestamp: ${new Date().toISOString()}`);
			res.statusCode = 201;
			res.setHeader('Content-Type', 'application/json');
			delete result[0]['password'];//clear the password in json data, do not send back to client
			res.json({ success: true, UserData: JSON.stringify(result), token: token, status: 'You are successfully logged in!' });
		}
	});
});
// Vuln 6: Use of default or weak credentials and Vuln 5: Storage of plaintext passwords
app.post('/user', bcryptMiddleware.validatePassword, bcryptMiddleware.hashPassword, function (req, res) {//Create User
	var username = req.body.username;
	var email = req.body.email;
	var hashedPassword = res.locals.hash;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;

	user.addUser(username, email, hashedPassword, firstname, lastname, function (err, result) {
		if (err) {
			res.status(500);
			res.send(err);
		} else {
			res.status(201);
			res.setHeader('Content-Type', 'application/json');
			res.send(result);
		}
	});
});

app.post('/user/logout', function (req, res) {//Logout
	console.log("..logging out.");
	res.clearCookie('session-id'); //clears the cookie in the response
	res.setHeader('Content-Type', 'application/json');
	res.json({ success: true, status: 'Log out successful!' });

});


app.put('/user/update/', verifyToken, function (req, res) {//Update user info
	var id = req.id
	var username = req.body.username;
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	user.updateUser(username, firstname, lastname, id, function (err, result) {
		if (err) {
			res.status(500);
			res.json({ success: false })
		} else {
			res.status(200);
			res.setHeader('Content-Type', 'application/json');
			res.json({ success: true })
		}
	});
});

//Listing APIs
// Injection Vuln(XSS):1
// (Brief)
app.post('/listing/', verifyToken, function (req, res) {//Add Listing

	const data = {
		title : req.body.title,
		category : req.body.category,
		description : req.body.description,
		price : req.body.price,
		fk_poster_id : req.id	
	}

    // Regex expression to prevent XSS on known fields
    const xssRegex = /<|>|"|\'|`|;|\(|\)|\{|\}|\[|\]|\||%|\?|script|scrip|cript|alert|onload|onerror|eval|document|window\b/gi;

    // Validate input fields for XSS
    if (xssRegex.test(data.title) || xssRegex.test(data.category) || xssRegex.test(data.description) || xssRegex.test(data.price)) {
        errorLogger.error(`Invalid characters in input fields for selling items, User Id: ${req.id}, Timestamp: ${new Date().toISOString()}`);
        return res.status(400).json({ success: false, message: 'Invalid characters in input fields' });
    }

    // Sanitize input fields by whitelisting allowed characters
    data.title = data.title.replace(/[^a-zA-Z0-9.,\s]/g, ''); // Only allows alphabets, numbers, commas, dots, and spaces
    data.category = data.category.replace(/[^a-zA-Z0-9.,\s]/g, ''); // Only allows alphabets, numbers, commas, dots, and spaces
    data.description = data.description.replace(/[^a-zA-Z0-9.,\s]/g, ''); // Only allows alphabets, numbers, commas, dots, and spaces

	listing.addListing(data, function (err, result) {
		if (err) {
            errorLogger.error(`Failed to add listing for User Id: ${req.id}, Timestamp: ${new Date().toISOString()}`);
			res.status(500);
			res.json({ success: false });
		} else {
            auditLogger.info(`User ID: ${req.id} has successfully added a listing, Timestamp: ${new Date().toISOString()}`);
			res.status(201);
			res.setHeader('Content-Type', 'application/json');
			res.json({ success: true,id:result.insertId })
		}
	});
});


app.get('/user/listing', verifyToken, function (req, res) {//Get all Listings of the User
	var userid = req.id;
	listing.getUserListings(userid, function (err, result) {
		if (err) {
			res.status(500);
			console.log(err)
			res.json({ success: false });
		} else {
			res.status(200);
			res.setHeader('Content-Type', 'application/json');
			res.json({ success: true, result: result });
		}
	});
});

// Broken Access Control Vuln (Viewing listings without authentication):1 - Patched
app.get('/listing/:id', verifyToken, function (req, res) {//View a listing
	var id = req.params.id
	listing.getListing(id, function (err, result) {
		if (err) {
            console.log('failed')
			res.status(500);
			res.json({ success: false })
		} else {
            console.log('success')
			res.status(200);
			res.setHeader('Content-Type', 'application/json');
			res.json({ success: true, result: result })
		}
	});
});

// Injection Vuln (SQLi):1 
// (Detailed)
app.get('/search/:query', verifyToken, function (req, res) {//View all other user's listing that matches the search

	var query = req.params.query;
	var userid = req.id;

	listing.getOtherUsersListings(query, userid, function (err, result) {
		if (err) {
			res.status(500);
			res.json({ success: false })
		} else {
			res.status(200);
			res.setHeader('Content-Type', 'application/json');
			res.json({ success: true, result: result })
		}
	});
});
// Broken Access Control Vuln(User can edit other user's listing):2
// (Detailed) -- Done
app.put('/listing/update/', verifyToken, verifyUser.userAuth, function (req, res) {//Update a listing
	var title = req.body.title;
	var category = req.body.category;
	var description = req.body.description;
	var price = req.body.price;
	var id = req.body.id;

	listing.updateListing(title, category, description, price, id, function (err, result) {
		if (err) {
			res.status(500);
			res.json({ success: false })
		} else {
			res.status(200);
			res.setHeader('Content-Type', 'application/json');
			res.json({ success: true })
		}
	});
});

app.delete('/listing/delete/', function (req, res) {//View a listing
	var id = req.body.id;

	listing.deleteListing(id, function (err, result) {
		if (err) {
			res.status(500);
			res.json({ success: false })
		} else {
			res.status(200);
			res.setHeader('Content-Type', 'application/json');
			res.json({ success: true })
		}
	});
});

//Offers API
app.post('/offer/', verifyToken, function (req, res) {//View a listing
	var offer = req.body.offer;
	var fk_listing_id = req.body.fk_listing_id;
	var fk_offeror_id = req.id;
	var status = "pending";
	offers.addOffer(offer, fk_listing_id, fk_offeror_id, status, function (err, result) {
		if (err) {
			res.status(500);
			res.json({ success: false })
		} else {
			res.status(201);
			res.setHeader('Content-Type', 'application/json');
			res.json({ success: true })
		}
	});
});

app.get('/offer/', verifyToken, function (req, res) {//View all offers
	var userid = req.id
	offers.getOffers(userid, function (err, result) {
		if (err) {
			res.status(500);
			res.json({ success: false })
		} else {
			res.status(201);
			res.setHeader('Content-Type', 'application/json');
			console.log(result)
			res.json({ success: true, result: result })
		}
	});
});

app.post('/offer/decision/', function (req, res) {//View all offers
	var status = req.body.status;
	var offerid = req.body.offerid;
	offers.AcceptOrRejectOffer(status, offerid, function (err, result) {
		if (err) {
			res.status(500);
			res.json({ success: false })
		} else {
			res.status(201);
			res.setHeader('Content-Type', 'application/json');
			res.json({ success: true })
		}
	});
});

app.get('/offer/status/', verifyToken, function (req, res) {//View all offers
	var userid = req.id
	offers.getOfferStatus(userid, function (err, result) {
		if (err) {
			res.status(500);
			res.json({ success: false })
		} else {
			res.status(201);
			res.setHeader('Content-Type', 'application/json');
			res.json({ success: true, result: result })
		}
	});
});

//Likes API
app.post('/likes/', verifyToken, function (req, res) {//View all offers
	var userid = req.id
	var listingid = req.body.listingid;
	likes.insertLike(userid, listingid, function (err, result) {
		if (err) {
			res.status(500);
			res.json({ success: false })
		} else {
			res.status(201);
			res.setHeader('Content-Type', 'application/json');
			res.json({ success: true })
		}
	});
});

app.get('/likeorunlike/:listingid/', verifyToken, function (req, res) {//Like or Unlike
	var userid = req.id
	var listingid = req.params.listingid;
	likes.checklike(userid, listingid, function (err, result) {
		if (err) {
			res.status(500);
			res.json({ success: false })
		} else {
			res.status(200);
			if (result.length == 0) {
				likes.insertLike(userid, listingid, function (err, result) {
					if (err) {
						res.status(500);
						res.json({ success: false })
					} else {
						res.status(201);
						res.setHeader('Content-Type', 'application/json');
						res.json({ success: true, action: "liked" })
					}
				});
			} else {
				likes.deleteLike(userid, listingid, function (err, result) {
					if (err) {
						res.status(500);
						res.json({ success: false })
					} else {
						res.status(200);
						res.json({ success: true, action: "unliked" })
					}
				});
			}
		}
	});
});

app.get('/likes/:listingid/', function (req, res) {//View all offers
	var listingid = req.params.listingid;
	likes.getLike(listingid, function (err, result) {
		if (err) {
			res.status(500);
			res.json({ success: false })
		} else {
			res.status(200);
			res.setHeader('Content-Type', 'application/json');
			res.json({ success: true, amount: result.length })
		}
	});
});

//Images API

let storage = multer.diskStorage({
	destination: function (req, file, callback) {

		callback(null, __dirname + "/../public")
	},
	filename: function (req, file, cb) {
		req.filename = file.originalname.replace(path.extname(file.originalname), '') + '-' + Date.now() + path.extname(file.originalname);
		cb(null, req.filename);
		
	}
});

let upload = multer({
	storage: storage, limits: { fileSize: 5 * 1024 * 1024 }
});//limits check if he file size is equal to or below 5mb


app.post('/images/:fk_product_id/', upload.single('myfile'), function (req, res) {
	var fk_product_id = req.params.fk_product_id;
	var name = req.filename;
	images.uploadImage(name,fk_product_id, function (err, result) {
		if (err) {
			res.status(500);
			res.json({success:false});
		} else {
			res.status(201);
			res.json({success:true});
		}
	});
});
module.exports = app;