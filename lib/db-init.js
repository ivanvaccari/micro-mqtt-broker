/*
    This file is part of micro-mqtt-broker.

    Foobar is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Foobar is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Foobar.  If not, see <https://www.gnu.org/licenses/>.
*/

const bcrypt = require('bcrypt');

/**
 * Create a default admin user if the users collection is empty
 * @param {*} collection 
 * @param {*} cb 
 */
let createDefaultAdmin = function(collection, cb){
    collection.count({}, function(err, result) {
        if (err) return cb(err);
        if (result === 0){            
            console.log('[INIT] creating default admin user');
            bcrypt.hash("admin", 10).then(function(hash) {
                collection.insert({
                    username:"admin",
                    password: hash,
                    admin:true
                },cb);   
            });
        }else{
            cb(null,true);
        }
    });
}

module.exports = {

    init: function(db, cb){
        let collection = db.collection('users');
        createDefaultAdmin(collection,cb);
    }
}