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

const http = require('http');
const express = require('express');
const usersRoutes = require('./routes/users');
const mqttRoutes = require('./routes/mqtt-devices');
const healthRoutes = require('./routes/health');
const environment = require('./environment');
const app = express();
const bodyParser = require('body-parser')
const basicAuth = require('express-basic-auth')
const expressAuth = require('./express-auth');
const moscaServer = require('./mosca');

module.exports = {
    init: function(db, cb){
  
        // setup the body parser middleware
        app.use(bodyParser.json());
        
        // setup the basic auth middleware
        let basicAuthMiddleware = basicAuth({
            authorizer: expressAuth(db).myAsyncAuthorizer,
            authorizeAsync: true,
            challenge: true,
        });

        // This middleware inject in the req.auth object the current logged userId
        let getUserIdMiddleware = function(req, res, next){
            let collection = db.collection('users');
            collection.find({username: req.auth.user},{ password: false }).toArray(function(err, result) {
                if (err) return next(err);
                if ((!result) || (result.length == 0)) return next('Logged in user not found');
                req.auth.userId = result[0]._id;
                req.auth.admin = result[0].admin;
                next();
            })
        };

        // just send out a 401 error if the user is not an admin
        let adminCheck = function(req, res, next){
            if (!req.auth.admin) return res.status(401).send("Unauthorized");
            next();
        }

        // setup api routes
        app.use('/api/users', basicAuthMiddleware, getUserIdMiddleware, adminCheck, usersRoutes(db));
        app.use('/api/mqtt', basicAuthMiddleware, getUserIdMiddleware, mqttRoutes(db));
        app.use('/health', healthRoutes(db));

        // error handler middleware. Just send out a json formatted error
        app.use(function(err, req, res, next) {
            res.status(500).json({error:err});
        });

        var httpServer = http.createServer(app);
        // attach mosca server to the http server to enable MQTT over websocket
        moscaServer.attachHttpServer(httpServer);

        // start express listener
        httpServer.listen(parseInt(environment.httpPort), cb);

    }
}