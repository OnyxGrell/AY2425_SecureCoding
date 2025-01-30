var db = require('./databaseConfig.js');

module.exports.updateUserPassword = (email, hashedPassword, callback) => {
    var conn = db.getConnection();

    conn.connect(function (err) {
        if (err) {
            console.log(err);
            return callback(err, null);
        } else {
            var sql = "UPDATE users SET password = ? WHERE email = ?";
            conn.query(sql, [hashedPassword, email], function (err, result) {
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
};