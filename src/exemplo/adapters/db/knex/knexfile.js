

const path = require('path');

module.exports = {
    client: 'better-sqlite3',
    connection: {
        filename: path.resolve(__dirname, 'banco.sqlite3'),
    },
    options: {
      safeIntegers: true,
    },
    migrations: {
        tableName: 'knex_migrations',
        directory: path.resolve(__dirname, 'migrations'),
    },
    seeds: {
        directory: path.resolve(__dirname, 'seeds'),
    },
    pool: {
        min: 2,
        max: 10,        
    },
    useNullAsDefault: true,
};