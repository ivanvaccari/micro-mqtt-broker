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
const mqttCache = require('../mqtt-cache');

  
module.exports = function(db){    

    router.get('', function(req, res, next){
        let collection = db.collection('mqtt_devices');
        collection.find({},{ password: false }).toArray(function(err, result) {
            if (err) next(err);
            res.json(result);
        });
    });

    router.get('/status', function(req, res, next){
        res.json(mqttCache.connectedDevices);
    });

    router.post('', function(req, res, next){
        if (!req.body.username) return next("Body must contain username field")
        if (!req.body.password) return next("Body must contain password field")
        if (!req.body.userId) return next("Body must contain userId field")
        
        bcrypt.hash(req.body.password, 10).then(function(hash) {
            req.body.password=hash;
            let collection = db.collection('mqtt_devices');
            collection.insert(req.body,function(err, result) {
                if (err) next(err);
                res.json(result.ops);
            });   
        });

    });
    

    return router;
}