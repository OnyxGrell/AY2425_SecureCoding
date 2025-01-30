var db = require('./databaseConfig.js');

module.exports.verifyUser = (data,callback) => {

    var conn = db.getConnection();
    conn.connect(function (err) {
        if (err) {
            console.log(err);
            return callback(err, null);
        } else {
            var sql = "select * from listings where fk_poster_id = ? and id = ?";
            conn.query(sql, [data.userId, data.listingId], function (err, result) {
                conn.end()
                if (err) {
                    console.log(err);
                    return callback(err, null);
                } else {
                    return callback(null, result)
                }
            });
        };
    });
};

module.exports.loginUser = (data,callback) => {

    var conn = db.getConnection();

    conn.connect(function (err) {
        if (err) {
            console.log(err);
            return callback(err, null);
        } else {
            var sql = "select * from users where email = ?";
            conn.query(sql, [data.email], function (err, result) {
                conn.end()
                if (err) {
                    console.log(err);
                    return callback(err, null);
                } else {
                    return callback(null, result)
                }
            });
        };
    });
};