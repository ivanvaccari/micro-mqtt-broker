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

var configJson = require('../config.json');

module.exports = {
    mqttPort: process.env.MQTT_PORT || configJson.MQTT_PORT || 11883,
    mongoConnectionString: process.env.MONGOSTRING || configJson.MONGOSTRING || '',
    mongoDbName: process.env.MONGODBNAME || configJson.MONGODBNAME || '',
    httpPort: process.env.PORT || configJson.PORT || 8080,
}