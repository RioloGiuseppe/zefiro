// Importo le dipendenze necessarie per l'esecuzione del codice

var MongoClient = require('mongodb').MongoClient;
const Hapi = require('hapi');
const si = require('systeminformation');
var Path = require('path');

// Definisco la scringa di connessione al db mongo (indirizzo:porta/database)
var url = 'mongodb://localhost:27017/zefiro_db';

var error = false;

// Definisco la variable per il server http hapi
const server = new Hapi.Server();

// Prepraro il riferimento all'oggetto per mongo db
var db = {};

// Avvio la connessione al database
MongoClient.connect(url, (_err, _db) => {
    if (_err) error = true;
    db = _db;
});

// Definisco la funzione async che 
//  > legge le info di carico di sistema
//  > le scrive sulla collection 'system_status'
async function writeDB(callback) {
    var load = await si.currentLoad();
    db.collection('system_status').insertOne({
        "Total": load.currentload,
        "User": load.currentload_user,
        "System": load.currentload_system
    }, callback);
}

// Imposto l'endpoint del server
server.connection({
    host: 'localhost',
    port: 8000
});
server.register(require('inert'), (err) => {
    // Configuro le rotte (routes)
    server.route({
        method: 'GET',
        path: '/currentLoad',
        handler: async function(request, reply) {
            var _cpu = await si.currentLoad();
            var ret = {
                total: _cpu.currentload,
                user: _cpu.currentload_user,
                system: _cpu.currentload_system
            }
            return reply(ret);
        }
    });

    server.route({
        method: 'GET',
        path: '/currentTemp',
        handler: async function(request, reply) {
            var _temp = await si.cpuTemperature();
            return reply(_temp.main);
        }
    });

    server.route({
        method: 'GET',
        path: '/{path*}',
        handler: {
            directory: {
                path: './public',
                listing: false,
                index: true
            }
        }
    });


    // avvio la lettura info/ scrittura db con periodicità un sec
    //setInterval(writeDB, 1000);

    // Avvio il server http
    server.start((err) => {
        if (err) error = true;
        console.log('Server running at:', server.info.uri);
    });
});