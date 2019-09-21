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

const express = require('express');
const usersRoutes = require('./routes/users');
const mqttRoutes = require('./routes/mqtt-devices');
const healthRoutes = require('./routes/health');
const environment = require('./environment');
const app = express();
const bodyParser = require('body-parser')
const basicAuth = require('express-basic-auth')
const expressAuth = require('./express-auth');

module.exports = {
    init: function(db, cb){
  
        // somie express inits
        app.use(bodyParser.json());
        app.use(basicAuth({
            authorizer: expressAuth(db).myAsyncAuthorizer,
            authorizeAsync: true,
            challenge: true,
        }));
        
        // api routes
        app.use('/api/users', usersRoutes(db));
        app.use('/api/mqtt', mqttRoutes(db));
        app.use('/health', healthRoutes(db));
        /* error handler. Just send out a json formatted error*/
        app.use(function(err, req, res, next) {
            res.status(500).json({error:err});
        });

        app.listen(parseInt(environment.httpPort), cb);
        
    }
}