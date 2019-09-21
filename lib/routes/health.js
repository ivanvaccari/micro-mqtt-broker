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
const packageJson = require('../../package.json');

  
module.exports = function(db){    

    router.get('', function(req, res, next){
        let memory = process.memoryUsage();
        res.send({
            version: packageJson.version,
            memory: memory.rss,
            uptime: process.uptime()
        })
    });    

    return router;
}