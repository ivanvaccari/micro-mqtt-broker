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

const mosca = require('mosca')
const environment = require('./environment');
const bcrypt = require('bcrypt');
const mqttCache = require('./mqtt-cache');
const baseTopic = require('./baseTopic');

// ascoltatori to mongo pubsub setup
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

/**
 * Mosca authenticator function
 * 
 * @param {*} client 
 * @param {*} username 
 * @param {*} password 
 * @param {*} callback 
 */
var authenticate = function(client, username, password, callback) {
    let collection = db.collection('mqtt_devices');
    
    collection.find({
        username: username
    }).toArray(function(err, device) {
        if (err){
            console.log("[AUTHENTICATOR] authenticate(1) failed for client "+username+" with error "+err);
            return callback(null, false);
        }
        if (!device || device.length == 0){
            console.log("[AUTHENTICATOR] authenticate(2) failed for client "+username+": wrong user/password");
            return callback(null, false);
        }

        bcrypt.compare(password.toString(), device[0].password, function(err, result) {
            if (err){
                console.log("[AUTHENTICATOR] authenticate(3) failed for client "+username+" with error "+err);
                return callback(null, false);
            }
            
            if (!result){
                console.log("[AUTHENTICATOR] authenticate(4) failed for client "+username+": wrong user/password");
                return callback(null, false);
            }

            client.user = username;
            client.baseTopic = baseTopic(device[0].userId.toString());

            console.log(client.baseTopic);

            mqttCache.connectedDevices.push({
                connectionDate: new Date(),
                userId: device[0].userId,
                clientId: client.id,
                deviceId: device[0]._id,
                remoteAddress: ((client.connection || {}).stream || {}).remoteAddress
            });

            let collection = db.collection('mqtt_connection_log');
            collection.insert({
                state: 'CONNECTED',
                date: new Date(),
                deviceId: device[0]._id,
                userId: device[0].userId,
                clientId: client.id,
                remoteAddress: ((client.connection || {}).stream || {}).remoteAddress
            }, (err,res)=>{});
            return callback(null, true);
        });
    });
}

/**
 * Disconnected event handler
 * 
 * @param {*} client 
 */
var disconnected = function(client){

    let index = mqttCache.connectedDevices.findIndex(d => d.clientId == client.id);
    if(index>=0){
        let record = mqttCache.connectedDevices[index];

        // write a log entry
        let collection = db.collection('mqtt_connection_log');
        collection.insert({
            state: 'DISCONNECTED',
            date: new Date(),
            deviceId: record.deviceId,
            userId: record.userId,
            clientId: client.id,
            remoteAddress: record.remoteAddress
        }, (err,res)=>{});

        mqttCache.connectedDevices.splice(index,1);
    }
};

/**
 * Block devices from different users to exchange data between them except they
 * ask for it with the share topic
 * 
 * @param {*} client 
 * @param {*} topic 
 * @param {*} payload 
 * @param {*} callback 
 */
var authorizePublish = function(client, topic, payload, callback) {
    let allow = topic.startsWith("/share") || topic.startsWith("/"+client.baseTopic);
    callback(null, allow);
}

/**
 * Allow devices to subscribe to topics only if they match their limit topic string
 * Allow also to subscribe to share topic
 * @param {*} client 
 * @param {*} topic 
 * @param {*} callback 
 */
var authorizeSubscribe = function(client, topic, callback) {
    let allow = topic.startsWith("/share") || topic.startsWith("/"+client.baseTopic);
    callback(null, allow);
}

module.exports = {

    start: function(cb){
        server = new mosca.Server(moscaSettings);
        server.on('ready', function(){
            db = server.ascoltatore.db;
            server.authenticate = authenticate;
            server.authorizePublish = authorizePublish;
            server.authorizeSubscribe = authorizeSubscribe;
            cb(db);
        });

        server.on('clientDisconnected', function(client) {
            disconnected(client);
        });
    },

    attachHttpServer: function(httpServerInstance){
        server.attachHttpServer(httpServerInstance);
    }
}