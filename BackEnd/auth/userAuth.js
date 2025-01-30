const model = require('../model/userAuthModel.js');

module.exports.userAuth= (req, res, next) => {
    
    const data = {
        userId: res.locals.userId, //User Id from token
        listingId: req.body.id // Listing Id from request
    };
    
    console.log(data); // Log Ids into console for validation

    const callback = (error,results,fields) => {
        if(error){ // SQL server error
            console.log('internal server error');
            return res.status(500).json({message: 'SQL server error in verifying user'});
        }else{
            if(results.length == 0){ // No results returned, meaning listing does not belong to user
                console.log('Listing does not belong to user');
                return res.status(403).json({message: 'Listing does not belong to user'});
            }else{// Listing belongs to user
                next();
            };
        };
    };
    model.verifyUser(data, callback);
};

module.exports.loginUser = (req, res, next) => {

    const data = {
        email: req.body.email,
        password: req.body.password
    };

    console.log(data); 
    
    if (!req.body.email || req.body.email == " ") {
        res.status(400).json({ message: "Error 400 Bad Request, Please provide a valid email" });
        return;
    } else if (!req.body.password || req.body.password == " ") {
        res.status(400).json({ message: "Error 400 Bad Request, Please provide a password" });
        return;
    };

    const callback = (error,results) => {
        if(error){ // SQL server error
            console.log('internal server error');
            return res.status(500).json({message: 'SQL server error in verifying user'});
        }else{
            if(results.length == 0){
                console.log('User not found!');
                return res.status(403).json({message: 'User not found'});
            }else{
                console.log(results)
                res.locals.hash = results[0].password;
                next();
            };
        };
    };
    model.loginUser(data, callback);
};