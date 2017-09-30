const xbeePromise = require("xbee-promise");
var xbee_api = require('xbee-api');

const colors = require("colors");

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

var C = xbee_api.constants;

var serialportname = process.argv[2];
var serialportspeed = parseInt(process.argv[3]);
var xbee_dest_64 = process.argv[4];
var delay_between_msgs = parseInt(process.argv[5]);

var xbee = xbeePromise({
    serialport: serialportname,
    serialportOptions: {
        baudrate: serialportspeed
    },
    module: "ZigBee",
    debug: false,
    defaultTimeout: 5000
});

// Nome nodo:
xbee.localCommand({
    command: "NI"
}).then((response) => {
    console.log(colors.green("Nodo Locale: %s"), response);
}).catch((err) => {
    console.warn(err);
});

// PAN:
xbee.localCommand({
    command: "OP"
}).then((response) => {
    console.log(colors.green("PAN Corrente: %s"), buf2hex(response));
}).catch((err) => {
    console.warn(err);
});

function buf2hex(buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

setInterval(() => {

    var payload = "DATA - " + (new Date()).toISOString();

    xbee.remoteTransmit({
        destination64: xbee_dest_64,
        data: payload
    }).then((response) => {
        console.log(colors.bgBlue("Invio a %s : "), xbee_dest_64, payload);
    }).catch((err) => {
        console.warn(err);
    });

}, delay_between_msgs);

xbee.xbeeAPI.on("frame_object", function (frame) {

    switch (frame.type) {
        case C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET:
            console.log(colors.bgMagenta("Ricezione da %s :"), frame.remote64, frame.data.toString());
            break;
    }
});