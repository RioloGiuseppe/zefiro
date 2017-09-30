var util = require('util');
var SerialPort = require('serialport');
var xbee_api = require('xbee-api');
var colors=require("colors");

var serialportname=process.argv[2];
var serialportspeed=parseInt(process.argv[3]);
var xbee_dest_64=process.argv[4];
var delay_between_msgs=parseInt(process.argv[5]);

var C = xbee_api.constants;

var xbeeAPI = new xbee_api.XBeeAPI({
    api_mode: 1
});

var serialport = new SerialPort(serialportname, {
    baudRate: serialportspeed
});

serialport.on("data", function(data) {
   //console.log("SERIAL PORT data in: ", data);
    xbeeAPI.parseRaw(data);
});

xbeeAPI.on("frame_raw", function (frame) {
    //console.log("XBEE RAW> ", frame);
});

xbeeAPI.on("frame_object", function (frame) {
    //console.log("XBEE FRAME_OBJ> ", util.inspect(frame));

    switch(frame.type) {
        case C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET:
            console.log(colors.bgMagenta("ZIGBEE RX %s >>>"), frame.remote64);
            console.info(colors.white("%s"),frame.data.toString());
            break;
        case C.FRAME_TYPE.ZIGBEE_TRANSMIT_STATUS:
            console.log(colors.bgBlue("ZIGBEE TX STATUS %s >>>"), frame.deliveryStatus === 0 ? "OK" : frame.deliveryStatus.toString());
            break;
    }
});

setInterval(function () {

    var frame = {
        type: C.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST,
        destination64: xbee_dest_64,
        options:0x00,
        data: "DATA - " + (new Date()).toISOString()
    };

    var frame_buffer=xbeeAPI.buildFrame(frame);

    //console.log("data out: ", frame_buffer);

    serialport.write(frame_buffer);

}, delay_between_msgs);