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

console.log("[INIT] Starting app");

const moscaServer = require('./lib/mosca');
const routes = require('./lib/routes');
const dbInit = require('./lib/db-init');


console.log("[INIT] Starting Mosca MQTT broker....");
moscaServer.start(db => {

  console.log("[INIT] Mosca MQTT broker started");

  dbInit.init(db, function(err,result){
    if (err){
      console.error("[INIT] db init failed");
      process.exit(-1);
    }
    routes.init(db, function () {
      console.log('[INIT] Web service started');
    })
  });

});


