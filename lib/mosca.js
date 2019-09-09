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


'use strict';

var mosca = require('mosca')
var environment = require('./environment');
const bcrypt = require('bcrypt');
var mqttCache = require('./mqtt-cache');

var pubsubsettings = {
    type: 'mongo',		
    url: environment.mongoConnectionString,
    pubsubCollection: 'ascoltatori',
    mongo: {}
  };
  
var moscaSettings = {
    port: parseInt(environment.mqttPort),
    backend: pubsubsettings
};

var server = null;
var db = null;

var authenticate = function(client, username, password, callback) {
    let collection = db.collection('mqtt_devices');
    
    collection.find({
        username: username
    }).toArray(function(err, result) {
        if (err){
            console.log("[AUTHENTICATOR] authenticate(1) failed for client "+username+" with error "+err);
            return callback(null, false);
        }
        if (!result || result.length == 0){
            console.log("[AUTHENTICATOR] authenticate(2) failed for client "+username+": wrong user/password");
            return callback(null, false);
        }

        bcrypt.compare(password.toString(), result[0].password, function(err, result) {
            if (err){
                console.log("[AUTHENTICATOR] authenticate(3) failed for client "+username+" with error "+err);
                return callback(null, false);
            }
            
            if (!result){
                console.log("[AUTHENTICATOR] authenticate(4) failed for client "+username+": wrong user/password");
                return callback(null, false);
            }

            client.user = username;
            mqttCache.connectedDevices.push({
                username: username,
                connectionDate: new Date(),
                clientId: client.id
            });

            let collection = db.collection('mqtt_connection_log');
            collection.insert({
                date: new Date(),
                username: username
            }, (err,res)=>{});
            return callback(null, true);
        });
    });
}

var disconnected = function(client){
    console.log('disconnected');
    let index = mqttCache.connectedDevices.findIndex(d => d.clientId == client.id);
    if(index>=0)
        mqttCache.connectedDevices.splice(index,1);
};

module.exports = {

    start: function(cb){
        server = new mosca.Server(moscaSettings);	//here we start mosca
        server.on('ready', function(){
            db = server.ascoltatore.db;
            server.authenticate = authenticate;
            /*
            server.authorizePublish = authorizePublish;
            server.authorizeSubscribe = authorizeSubscribe;
            */
            cb(db);
        });
        server.on('clientDisconnected', function(client) {
            disconnected(client);
        });
    }
}