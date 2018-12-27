[![Maintainability](https://api.codeclimate.com/v1/badges/0284157266c2fe66ff86/maintainability)](https://codeclimate.com/github/gilmaimon/CloudStorage-Server/maintainability) [![Build Status](https://travis-ci.org/gilmaimon/CloudStorage-Server.svg?branch=master)](https://travis-ci.org/gilmaimon/CloudStorage-Server) [![HitCount](http://hits.dwyl.io/gilmaimon/CloudStorage-Server.svg)](http://hits.dwyl.io/gilmaimon/CloudStorage-Server)


# CloudStorage
Simple backend for storing key/value pairs via http requests. Implemented with Node.js and MongoDB. Made for IOT projects.

## User Operations
#### Register (POST '/user/register')
```JSON
{
	"username":"gidi",
	"password": "gidigov123"
}
```
Response:
```JSON
{
    "error": false
}
```

## Set/Update Operations 
#### Set/Update Single Key (POST '/data/object')
```JSON
{
	"username":"gidi",
	"password": "gidigov123",
	"key": "song",
	"value": {
	    "name": "Falling In Love Again",
	    "length": "3:40"
	}
}
```
Response:
```JSON
{
    "error": false
}
```

#### Set/Update Multiple Keys (POST '/data/object')
```JSON
{
	"username":"gidi",
	"password": "gidigov123",
	"operations": [
		{
			"key": "song.name",
			"value": "Falling In Love Again"
		}, 
		{
			"key": "song.length",
			"value": "3:40"
		}
	]
}
```

Response:
```JSON
{
    "error": [
        false,
        false
    ]
}
```

## Get Operations
#### Get Single Key (GET '/data/object')
```JSON
{
	"username":"gidi",
	"password": "gidigov123",
	"key": "song"
}
```

Response:
```JSON
{
    "error": false,
    "result": {
        "song": {
            "name": "Falling In Love Again",
            "length": "3:40"
        }
    }
}
```

#### Get Multiple Keys (GET '/data/object')
```JSON
{
	"username":"gidi",
	"password": "gidigov123",
	"keys": ["song.name", "song.length", "age"]
}
```

Response:
```JSON
{
    "error": false,
    "result": {
        "song": {
            "name": "Falling In Love Again",
            "length": "3:40"
        },
        "age": "68"
    }
}
```

