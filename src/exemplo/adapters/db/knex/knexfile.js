

const path = require('path');

module.exports = {
    client: 'better-sqlite3',
    connection: {
        filename: process.env.SQLITE_DB_PATH || path.resolve(__dirname, 'banco.sqlite3'),
    },
    migrations: {
        tableName: 'knex_migrations',
        directory: path.resolve(__dirname, 'migrations'),
        loadExtensions: ['.js'],
    },
    seeds: {
        directory: path.resolve(__dirname, 'seeds'),
    },
    pool: {
        min: 1,
        max: 1,
    },
    useNullAsDefault: true,
};