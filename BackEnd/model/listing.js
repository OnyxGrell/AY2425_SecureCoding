

var db = require('./databaseConfig.js');

var listingDB = {

    addListing: function (data, callback) {
        console.log(data.description);
        var conn = db.getConnection();

        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return callback(err, null);
            }
            else {
                var sql = 'insert into listings(title,category,description,price,fk_poster_id) values(?,?,?,?,?)';
                conn.query(sql, [data.title, data.category, data.description, data.price, data.fk_poster_id], function (err, result) {
                    conn.end();
                    if (err) {
                        console.log("Err: " + err);
                        return callback(err, null);
                    } else {
                        return callback(null, result)
                    }
                })

            }
        })
    },
    getUserListings: function (userid, callback) {
        var conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return callback(err, null);
            } else {
                var sql = `select l.title,l.category,l.price,l.id,i.name from listings l,images i where l.id = i.fk_product_id and fk_poster_id = ?`;
                conn.query(sql, [userid], function (err, result) {
                    conn.end()
                    if (err) {
                        console.log(err);
                        return callback(err, null);
                    } else {
                        return callback(null, result)
                    }
                });
            }

        })
    },
    getListing: function (id, callback) {
        var conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return callback(err, null);
            } else {
                var sql = "select l.title,l.category,l.description,l.price,u.username,l.fk_poster_id,i.name from listings l,users u,images i where l.id = ? and l.id = i.fk_product_id and l.fk_poster_id = u.id";
                conn.query(sql, [id], function (err, result) {
                    conn.end()
                    if (err) {
                        console.log(err);
                        return callback(err, null);
                    } else {
                        return callback(null, result)
                    }
                });
            }

        })
    },
    //Search field vulnerability
    //DONE
    getOtherUsersListings: function (query, userid, callback) {
        var conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return callback(err, null);
            } else {
                // 1.title means like table 1 (images)
                var sql = "SELECT l.title, l.category, l.price, l.id, i.name FROM listings l, images i WHERE l.id = i.fk_product_id AND l.fk_poster_id != ? AND l.title LIKE ?";
                var queryParam = '%' + query + '%'; // Prepare the query parameter for LIKE clause
            
                conn.query(sql, [userid, queryParam], function (err, result) {
                    conn.end()
                    if (err) {
                        console.log(err);
                        return callback(err, null);
                    } else {
                        return callback(null, result)
                    }
                });
            }

        })
    },
    updateListing: function (title, category, description, price, id, callback) {
        var conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return callback(err, null);
            } else {
                var sql = "update listings set title = ?,category = ?,description = ?,price = ? where id = ?";
                conn.query(sql, [title, category, description, price, id], function (err, result) {
                    conn.end()
                    if (err) {
                        console.log(err);
                        return callback(err, null);
                    } else {
                        return callback(null, result)
                    }
                });
            }

        })
    },
    deleteListing: function (id, callback) {
        var conn = db.getConnection();
        conn.connect(function (err) {
            if (err) {
                console.log(err);
                return callback(err, null);
            } else {
                var sql = `delete from listings where id=${id}`;
                conn.query(sql, [], function (err, result) {
                    conn.end()
                    if (err) {
                        console.log(err);
                        return callback(err, null);
                    } else {
                        return callback(null, result)
                    }
                });
            }

        })
    },
}

module.exports = listingDB;