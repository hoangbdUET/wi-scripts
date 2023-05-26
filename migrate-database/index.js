#!/usr/bin/env node
require('dotenv').config();
const { Sequelize, QueryTypes } = require('sequelize');
const path = require('path');

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const opt = require('node-getopt').create([
    ['i', 'input-file=ARG', 'input filename in folder sql_files, default is sample.json'],
    ['p', 'db-prefix=ARG', 'database prefix, default is wi0000_'],
    ['d', 'delay=ARG', 'delay between each query, default is 1000ms'],
    ['h', 'help', 'display this help'],
    ['', 'v', 'verbose mode'],
]).bindHelp().parseSystem();

const inputFile = opt.options['input-file'] || 'sample.json';
const inputFileFullPath = path.join(__dirname, 'sql_files', inputFile);
const dbPrefix = opt.options['db-prefix'] || 'wi0000_';
const delay = +opt.options['delay'] || 1000;
const verboseMode = opt.options['v'];

const sequelize = new Sequelize('mysql', process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: 'mysql',
    logging: false,
    timezone: '+07:00',
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
        acquire: 30000
    }
});

const main = async () => {
    const logger = require('hy-logger')({ service: 'i2g-migrate-database', path: `logs/${inputFile}`, disableTimestamp: false })
    try {
        await sequelize.authenticate();
        logger.info('Connection has been established successfully.');
        //read all queries
        const queries = require(inputFileFullPath);
        //find all databases
        const dbs = await sequelize.query(`SHOW DATABASES like '${dbPrefix}%' `, { type: QueryTypes.SHOWTABLES });
        for (let i = 0; i < dbs.length; i++) {
            logger.info("Processing database", dbs[i]);
            const dbName = dbs[i];
            await sequelize.query(`USE \`${dbName}\``, { type: QueryTypes.RAW });
            for (let j = 0; j < queries.length; j++) {
                const query = queries[j].query;
                const type = queries[j].type;
                try {
                    const rs = await sequelize.query(query, { type: QueryTypes[type] });
                    if (verboseMode) {
                        logger.info(rs);
                    }
                } catch (err) {
                    logger.info(dbName, err.message);
                }
                logger.info("Done ", dbName);
            }
            await sleep(delay);
        }
        sequelize.close();
    } catch (err) {
        sequelize.close();
        logger.error(err);
    }
};

main();