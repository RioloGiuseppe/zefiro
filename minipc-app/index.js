// Importo le dipendenze necessarie per l'esecuzione del codice
// Web-server
const Hapi = require('hapi');
const Nes = require('nes');
// Systeminformation
const si = require('systeminformation');
const mqtt = require('mqtt');
// File statici (html/js/css)
var Path = require('path');
// Gestore del bus i2c
var i2cBus = require('i2c-bus').openSync(0);
// Port expander
var PCF8574 = require('pcf8574').PCF8574;
// Indirizzo sul bus del port expander (Datasheet)
var pcf_addr = 0x38;
var pcf = new PCF8574(i2cBus, pcf_addr, true);

var hapiStarted = false;
var dev1_led = false;
var dev2_led = false;
var dev3_led = false;
var dev4_led = false;


var clientMqtt = mqtt.connect({
    protocol: 'mqtt',
    host: 'ws.mqtt.it',
    port: 1883
});

clientMqtt.on('connect', function() {
    console.log('Connessione a broker MQTT OK');

    clientMqtt.subscribe('/zefiro/zigbee-mqtt-bridge/zigbee-rx/#');
});

clientMqtt.on('message', function(topic, payload) {
    if (hapiStarted)
        server.publish('/item/5', {
            topic: topic.replace("/zefiro/zigbee-mqtt-bridge/zigbee-rx/", ""),
            data: payload.toString()
        });
    console.log('Ricevuto via MQTT: %s, %s', topic, payload.toString());

});



// Definisco i pin 4..7 uscite, spente, non invertenti
pcf.outputPin(4, false, false);
pcf.outputPin(5, false, false);
pcf.outputPin(6, false, false);
pcf.outputPin(7, false, false);
// Spengo i pins 4..7
pcf.setPin(4, false)
    .then(() => pcf.setPin(5, false))
    .then(() => pcf.setPin(6, false))
    .then(() => pcf.setPin(7, false));

// Costruisco il server hapi
const server = new Hapi.Server();

// Imposto l'endpoint del server
server.connection({ host: '0.0.0.0', port: 8000 });
// Configuro le rotte (routes)
server.register(require('inert'), (err) => {
    // Orriene il carico corrente della cpu
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
    // Controlla i bottoni
    server.route({
        method: 'GET',
        path: '/button/{led}',
        handler: async function(request, reply) {
            var led = encodeURIComponent(request.params.led);
            pcf.setPin(Number.parseInt(led) + 4);
            return reply();
        }
    });

    server.route({
        method: 'GET',
        path: '/dev_button/{mac}',
        handler: async function(request, reply) {
            let topic = "/zefiro/zigbee-mqtt-bridge/mqtt-rx/" + mac;
            var mac = encodeURIComponent(request.params.mac);
            if (mac === "0013a20040c5cabe") {
                dev1_led != dev1_led;
                if (dev1_led)
                    clientMqtt.publish(topic, "LED=1");
                else
                    clientMqtt.publish(topic, "LED=0");
            }
            if (mac === "0013a20040aded7d") {
                dev2_led != dev2_led;
                if (dev2_led)
                    clientMqtt.publish(topic, "LED=1");
                else
                    clientMqtt.publish(topic, "LED=0");
            }
            if (mac === "0013a20040ba9198") {
                dev3_led != dev3_led;
                if (dev3_led)
                    clientMqtt.publish(topic, "LED=1");
                else
                    clientMqtt.publish(topic, "LED=0");
            }
            if (mac === "0013a20040c5caa9") {
                dev4_led != dev4_led;
                if (dev4_led)
                    clientMqtt.publish(topic, "LED=1");
                else
                    clientMqtt.publish(topic, "LED=0");
            }


        }
    });
    // Gestisce i file statici
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

    server.register(Nes, function(err) {
        server.subscription('/item/{id}');
    });

    // Avvio il server http
    server.start((err) => {
        if (err) error = true;
        else {
            hapiStarted = true;
            console.log('Server running at:', server.info.uri);
        }
    });
});
