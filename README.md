# WARNING
Project in development status. Do not use for any reason.

## micro-mqtt-broker
A ready to use standalone mqtt broker for NodeJS, based on Mosca and MongoDB.
It also offer:
 - MQTT borker over websocket
 - Http REST interface to manage users and devices
 - Connection/disconnection logs
 
## Install & run

1 - clone & npm install
```
git clone https://github.com/grisson2/micro-mqtt-broker.git
cd micro-mqtt-broker;
npm install;
```

2 - Create config.json file (you can also provide these variables via process.env)
```
{
    "MQTT_PORT": 11883,
    "PORT": 8080,
    "MONGODBNAME": "my_db_name",
    "MONGOSTRING": "Mongo connection string"
}
```

3 - Run
```
npm start
```

## Default access
When started, the app check for the existence of users in the mongodb collection. If the collection is empty, the app create automatically a default admin user.

```
username: admin
password: admin
```

## Http REST Api

micro-mqtt-broker offer a series of simple REST api to manage users and devices

### Users

User management api are accessible to admins only

**GET /api/users** - list of registered users

**POST /api/users** - create a new user. Post body must be 

```
{
	"username":"new user username",
	"password":"plain text password, will be encrypted by the backend",
	"admin": true/false
}
``` 

### Mqtt
Mqtt device management

**GET /api/mqtt** - list of registered devices for the current logged in user

**GET /api/mqtt/:deviceId** - get the data of a single device for the current logged in user

**GET /api/mqtt/:deviceId/log** - get the connection log of a single device for the current logged in user

**GET /api/mqtt/status** - list of currently connected devices for the current logged in user. If the user is admin, the list shows all the connected devices globally.

**POST /api/mqtt** - create a new device. Post body must be 

```
{
	"username":"new userdevice username",
	"password":"plain text password, will be encrypted by the backend",

}
``` 

**DELETE /api/mqtt/:deviceId** - remove a device. DeviceId can be found using *GET /api/mqtt*

## Models

### users
 - username: string
 - password: string, bcrypt encrypted password
 - admin: boolean, true if the user is an admin, false otherwise

