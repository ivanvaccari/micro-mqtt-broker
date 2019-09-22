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

let express = require('express');
let router = express.Router();
let bcrypt = require('bcrypt');
let mqttCache = require('../mqtt-cache');
let ObjectID = require('mongodb').ObjectID;
  
module.exports = function(db){    

    /**
     * GET /api/mqtt
     * 
     * Get the list of devices for the current connected user
     */
    router.get('', function(req, res, next){
        let collection = db.collection('mqtt_devices');
        collection.find({userId: req.auth.userId},{ password: false }).toArray(function(err, result) {
            if (err) next(err);
            res.json(result);
        });
    });

    /**
     * GET /api/mqtt/status
     * Get the current connected devices list
     */
    router.get('/status', function(req, res, next){
        // admin can see all connected devices
        if (req.auth.admin) return res.json(mqttCache.connectedDevices);

        // non admin can see only their devices 
        res.json(mqttCache.connectedDevices.filter(d => d.userId == req.auth.userId));
    });

    /**
     * GET /api/mqtt/:deviceId
     * 
     * Get a single device for the current connected user
     */
    router.get('/:deviceId', function(req, res, next){
        let collection = db.collection('mqtt_devices');
        collection.find({userId: req.auth.userId, _id: new ObjectID(req.params.deviceId)}, {password: false})
        .toArray(function(err, result) {
            if (err) next(err);
            res.json(result);
        });
    });

    /**
     * GET /api/mqtt/:deviceId
     * 
     * Get a single device log for the current connected user
     */
    router.get('/:deviceId/log', function(req, res, next){
        let collection = db.collection('mqtt_connection_log');
        collection.find({userId: req.auth.userId, deviceId: new ObjectID(req.params.deviceId)})
        .sort({_id:-1})
        .toArray(function(err, result) {
            if (err) next(err);
            res.json(result);
        });
    });

    /**
     * DELETE /api/mqtt/deviceId
     * 
     * Remove a device account
     */
    router.delete('/:deviceId', function(req, res, next){
        let collection = db.collection('mqtt_devices');
        collection.deleteOne({userId: req.auth.userId, _id: new ObjectID(req.params.deviceId) }, function(err, result) {
            if (err) next(err);
            res.json({deletedCount: result.n});
        });
    });

    /**
     * POST /api/api/mqtt
     * 
     * Create a device 
     */
    router.post('', function(req, res, next){
        if (!req.body.username) return next("Body must contain username field");
        if (!req.body.password) return next("Body must contain password field");
        
        let collection = db.collection('mqtt_devices');
        collection.find({username: req.body.username},{ password: false }).toArray(function(err, result) {
            if (err) return next(err);
            if (result.length > 0) return next('Username not available');

            bcrypt.hash(req.body.password, 10).then(function(hash) {
                req.body.password=hash;
                req.body.userId = req.auth.userId;

                collection.insert(req.body,function(err, result) {
                    if (err) next(err);
                    res.json(result.ops);
                });   
            });
        });
    });
    

    return router;
}