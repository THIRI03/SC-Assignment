var db = require('./databaseConfig.js');
var config = require('../config.js');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var userDB = {

	loginUser: function (email, password, callback) {
		var conn = db.getConnection();
	
		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			} else {
				console.log("Connected!");
	
				// First, retrieve the stored hashed password for the user
				var sql = 'select id, password from users where email = ?';
				conn.query(sql, [email], function (err, result) {
					conn.end();
	
					if (err) {
						console.log("Err: " + err);
						return callback(err, null, null);
					} else {
						if (result.length == 1) {
							// Compare the entered password with the hashed password
							bcrypt.compare(password, result[0].password, function (err, isMatch) {
								if (err) {
									console.log("Error comparing passwords: ", err);
									return callback(err, null, null);
								}
	
								if (isMatch) {
									// Passwords match, generate token
									const token = jwt.sign({ id: result[0].id }, config.key, {
										expiresIn: 86400 // expires in 24 hrs
									});
									console.log("@@token " + token);
	
									// Remove password from result before sending to client
									delete result[0].password;
	
									return callback(null, token, result);
								} else {
									// Password does not match
									console.log("Email/Password does not match");
									var err2 = new Error("Email/Password does not match.");
									err2.statusCode = 404;
									return callback(err2, null, null);
								}
							});
						} else {
							// No user found
							console.log("Email not found.");
							var err2 = new Error("Email not found.");
							err2.statusCode = 404;
							return callback(err2, null, null);
						}
					}
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

	addUser: function (username, email, password, firstname, lastname, callback) {

		var conn = db.getConnection();

		conn.connect(function (err) {
			if (err) {
				console.log(err);
				return callback(err, null);
			} else {


				console.log("Connected!");
				var sql = "Insert into users(username,email,password,firstname,lastname) values(?,?,?,?,?)";
				conn.query(sql, [username, email, password, firstname, lastname], function (err, result) {
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