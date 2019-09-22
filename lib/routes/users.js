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

var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

  
module.exports = function(db){    

    /**
     * GET /api/users
     * 
     * Get the list of users (without password)
     */
    router.get('', function(req, res, next){
        let collection = db.collection('users');
        collection.find({},{ password: false }).toArray(function(err, result) {
            if (err) next(err);
            res.json(result);
        });
    });


    //encrypted admin pwd: https://passwordhashing.com/BCrypt?plainText=admin
    /**
     * POST /api/users
     * 
     * Create a user
     */
    router.post('', function(req, res, next){
        if (!req.body.username) return next("Body must contain username field");
        if (!req.body.password) return next("Body must contain password field")
        if (req.body.admin === "true" || req.body.admin === true){ req.body.admin = true;}else{req.body.admin = false;}

        // username must be unique. Checking for exixtence
        let collection = db.collection('users');
        collection.find({username: req.body.username},{ password: false }).toArray(function(err, result) {
            if (err) return next(err);
            if (result.length>0) return next('Username not available');
            
            bcrypt.hash(req.body.password, 10).then(function(hash) {
                req.body.password=hash;
                collection.insert(req.body,function(err, result) {
                    if (err) return next(err);
                    res.json(result.ops);
                });   
            });
        });
    });

    return router;
}