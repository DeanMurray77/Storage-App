const {createServer} = require ('http');
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const normalizePort = port => parseInt(port, 10);
const PORT = normalizePort(process.env.PORT || 5000);

const app = express();
const dev = app.get('env') !== 'production';

const Sequelize = require('sequelize');
const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
        replication: {
            read: [
                { host: process.env.DATABASE_HOST },
            ],
            write: { host: process.env.DATABASE_WRITE_HOST },
        },
        dialect: 'mysql',
        operatorsAliases: false,
        logging: false,
        pool: {
            max: 5,
            idle: 1000,
            acquire: 2000,
        },
        dialectOptions: {
            ssl: 'Amazon RDS',
        },
    },
);

if(!dev) {
    app.disable('x-powered-by');
    app.use(compression());
    app.use(morgan('common'));

    app.use(express.static(path.resolve(__dirname, 'build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
    })
}

if(dev) {
    app.use(morgan('dev'));
}

const server = createServer(app);

server.listen(PORT, err => {
    if(err) throw err;

    console.log('Server started!');
})
