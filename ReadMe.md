## hook.io-postgres

Hook.io Postgres is a client-wrapper around [pg](https://github.com/brianc/node-postgres) for querying a postgres database.

## Installation

     git clone git@github.com:paulbellamy/hook.io-postgres.git
     cd hook.io-postgres
     npm install
     node bin/postgres

### Using NPM

    npm install hook.io-postgres
    hookio-postgres --debug

**Note: Using the default options hookio-postgres will attempt to connect to pg://localhost/mydatabase**

## Hook Event Names

### Event Listeners

**postgres::query** *string* - Run a sql query and pass the results to the callback.

**postgres::query** *array* - Run a sql query (with arguments) and pass the results to the callback.

**postgres::query** *{text, name, values}* - Run a named sql query and pass the results to the callback.

### Event Emitters

**postgres::connected** *event emitted when the hook is connected to postgres*

**postgres::error** *event emitted when there is an error talking to postgres*

## Hook config.json data

``` js
{
  "database": {
    "host": "/var/run/postgresql",
    "port": 5432,
    "user": "username",
    "password": "password",
    "database": "mydatabase"
  }
}
```
