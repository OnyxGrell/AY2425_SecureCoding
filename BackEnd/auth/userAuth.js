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