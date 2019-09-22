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

module.exports = function (db){
    return {

        /**
         * MongoDb based authenticator.
         * This function expect to have access to a 'users' collection.  See README.md/models/user
         * 
         * @param {*} username 
         * @param {*} password 
         * @param {*} cb 
         */
        myAsyncAuthorizer: function(username, password, cb) {

            if (username == '' || password == '')
                return cb(null,false);

            let collection = db.collection('users');
            collection.findOne({username:username},{ }, function(err, result) {
                if (err) return cb(null,false);
                if(!result) return cb(null,false);

                bcrypt.compare(password, result.password).then(function(res) {
                    cb(null,res);
                });    
            });
        }
    }
}