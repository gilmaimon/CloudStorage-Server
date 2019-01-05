[![Dependencies](https://david-dm.org/gilmaimon/CloudStorage-Server.svg)](https://david-dm.org/gilmaimon/CloudStorage-Server)  [![Dev Dependencies](https://david-dm.org/gilmaimon/CloudStorage-Server/dev-status.svg)](https://david-dm.org/gilmaimon/CloudStorage-Server?type=dev) [![Maintainability](https://api.codeclimate.com/v1/badges/0284157266c2fe66ff86/maintainability)](https://codeclimate.com/github/gilmaimon/CloudStorage-Server/maintainability) [![Build Status](https://travis-ci.org/gilmaimon/CloudStorage-Server.svg?branch=master)](https://travis-ci.org/gilmaimon/CloudStorage-Server)


# CloudStorage Server v0.5
Simple backend for storing key/value pairs via http requests. Implemented with Node.js and MongoDB. Made for IOT projects.
The server can store any type of json compatible data (primitives, objects, arrays);
View the Arduino Client: [`Arduino-CloudStorage`](https://github.com/gilmaimon/Arduino-CloudStorage)

#### Supported Operations:
##### User Operations:
- Register (GET/POST for ui or backend interface)
##### Object Operations:
- Set/Get single keys
- Set/Get multiple keys
##### Collection Operations:
- Push item to an array
- Pop from front/back of array
- Fetch elements from start or end (With skip and limit)
##### Aggregations:
- Get the min/max/unique/merged/average items from a collection
##### Atomics:
- Increment/Decrement an item
- Update an item if it is smaller/bigger than provided value (server-side min/max)
- Set key to hold current time in millis (server side)
