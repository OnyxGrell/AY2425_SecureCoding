//////////////////////////////////////////////////////
// REQUIRE BCRYPT MODULE
//////////////////////////////////////////////////////
//provides functions for hasing and comparing passwords
const bcrypt = require("bcrypt");
const bcryptModel = require("../model/bcryptModel.js");
//////////////////////////////////////////////////////
// SET SALT ROUNDS
//////////////////////////////////////////////////////
const saltRounds = 12;

//////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION FOR COMPARING PASSWORD
//////////////////////////////////////////////////////
module.exports.comparePassword = (req, res, next) => {

    const callback = (error, isMatch) => {
        if (error) {
            console.error("Error bcrypt:", err);
            res.status(500).json(err);
        } else {
            if (isMatch) {
                console.log("password matches");
                next();
            } else {
                res.status(401).json({
                    message: "Wrong password",
                });
            }
        }
    };
    bcrypt.compare(req.body.password, res.locals.hash, callback);
};


//////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION FOR HASHING PASSWORD
//////////////////////////////////////////////////////
module.exports.hashPassword = (req, res, next) => {
    //check if password is provided
    if (!req.body.password || req.body.password == " ") {
        res.status(400).json({ message: "Error 400 Bad Request, Please provide a password" });
        return;
    };

    const callback = (error, hash) => {
        if (error) {
            console.error("Error bcrypt:", err);
            res.status(500).json(err);
        } else {
            res.locals.hash = hash;
            next();
        }
    };
    bcrypt.hash(req.body.password, saltRounds, callback);
};

// If the password is not hashed from before, hash it and update the database
module.exports.checkIfHashed = (req, res, next) => {
    // Check if password is hashed
    console.log(res.locals.hash);
    console.log(req.body.email);

    if (!res.locals.hash.startsWith("$2b$12$")) {
        console.log("Password is not hashed");

        const callback = (error, hash) => {
            if (error) {
                console.error("Error bcrypt:", error);
                res.status(500).json(error);
            } else {
                res.locals.hash = hash;
                // Call updateUserPassword from bcryptModel to update the password in the database
                bcryptModel.updateUserPassword(req.body.email, hash, (err, result) => {
                    if (err) {
                        console.error("Error updating password in DB:", err);
                        res.status(500).json(err);
                    } else {
                        console.log("Password updated in DB");
                        next();
                    }
                });
            }
        };
        bcrypt.hash(res.locals.hash, saltRounds, callback);
    } else {
        next();
    };
};

// Middleware function for validating password strength
module.exports.validatePassword = (req, res, next) => {
    const password = req.body.password;
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;

    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: "Password must be between 6 to 16 characters long and contain at least one number and one special character",
        });
    }
    next();
};