const model = require('../model/userAuthModel.js');

module.exports.userAuth= (req, res, next) => {
    
    const data = {
        userId: res.locals.userId,
        listingId: req.body.id
    };
    
    console.log(data); // Log the IDs

    const callback = (error,results,fields) => {

        if(error){
            console.log('whoop internal server error');
            return res.status(500).json({message: 'SQL server error in verifying user'});
        }else{
            if(results.length == 0)
            {
                console.log('Listing does not belong to user');
                return res.status(403).json({message: 'Listing does not belong to user'});
            }else{
                next();
            };
        };
    };
model.verifyUser(data, callback);
};