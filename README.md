# WARNING
Project in development status. Do not use for any reason.

### micro-mqtt-broker
A ready to use standalone mqtt broker for NodeJS, based on Mosca and MongoDB.
It offer:
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

To be completed

