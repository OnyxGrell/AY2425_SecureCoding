var db = require('./databaseConfig.js');
var jwt = require('jsonwebtoken');
// Store the JWT_SECRET_KEY in the .env file
require('dotenv').config();

var userDB = {

	loginUser: function (email, password, callback) {

		var conn = db.getConnection();

		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			}
			else {
				console.log("Connected!");

				var sql = 'select * from users where email = ? and password=?';
				conn.query(sql, [email, password], function (err, result) {
					conn.end();

					if (err) {
						console.log("Err: " + err);
						return callback(err, null, null);

					} else {
                        // Generate token code done here
						var token = "";

                        var JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
                        var JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
                        var JWT_ALGORITHM = process.env.JWT_ALGORITHM;

						if (result.length == 1) {
                            user_id = result[0].id;

							token = jwt.sign(
                                { id: user_id }, // Payload
                                JWT_SECRET_KEY,  // Secret key
                                {
                                    expiresIn: JWT_EXPIRES_IN,
                                    algorithm: JWT_ALGORITHM,
                                }
                            );
                            console.log(user_id); // Verify the user_id logged in
							console.log("@@token " + token);
							return callback(null, token, result);
						} //if(res)
						else {
							console.log("email/password does not match");
							var err2 = new Error("Email/Password does not match.");
							err2.statusCode = 404;
							console.log(err2);
							return callback(err2, null, null);
						}
					}  //else
				});
			}
		});
	},

	updateUser: function (username, firstname, lastname, id, callback) {

		var conn = db.getConnection();
		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			} else {
				console.log("Connected!");

				var sql = "update users set username = ?,firstname = ?,lastname = ? where id = ?;";

				conn.query(sql, [username, firstname, lastname, id], function (err, result) {
					conn.end();

					if (err) {
						console.log(err);
						return callback(err, null);
					} else {
						console.log("No. of records updated successfully: " + result.affectedRows);
						return callback(null, result.affectedRows);
					}
				})
			}
		})
	},

	addUser: function (username, email, password, profile_pic_url, role, callback) {

		var conn = db.getConnection();

		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			} else {


				console.log("Connected!");
				var sql = "Insert into users(username,email,password,profile_pic_url,role) values(?,?,?,?,?)";
				conn.query(sql, [username, email, password, profile_pic_url, role], function (err, result) {
					conn.end();

					if (err) {
						console.log(err);
						return callback(err, null);
					} else {
						return callback(null, result);
					}
				});

			}
		});
	},
};


module.exports = userDB;