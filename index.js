var io = require('socket.io-client');
var host = '192.168.1.7';

//var socket = io.connect('http://3.86.163.195:80', {reconnect: true});
var socket = io.connect('http://192.168.1.7:3000',{reconnect: true});
const axios = require('axios');

socket.on('connect', function () {
	console.log('Connected!');
	socket.emit('rfid_scanned_request','test');
});

const Gpio = require('pigpio').Gpio;
const rc522 = require("rc522");

let temp_session = 0;

console.log('Ready!!!');

socket.on('park_vehicle',function(data){
  temp_session = data.session_id;
});

rc522(function(rfidSerialNumber){
	socket.emit('rfid_scanned_request',rfidSerialNumber);
	axios.get(`http://${host}:3000/newparking/${rfidSerialNumber}`)
	  .then(response => {
		console.log(response.data);
	}).catch(error => {
		console.log(error);
	});
});


// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECDONDS_PER_CM = 1e6/34321;

const trigger = new Gpio(23, {mode: Gpio.OUTPUT});
const echo = new Gpio(24, {mode: Gpio.INPUT, alert: true});

const trigger2 = new Gpio(22,{mode: Gpio.OUTPUT});
const echo2 = new Gpio(27,{mode: Gpio.INPUT, alert:true});

trigger.digitalWrite(0); // Make sure trigger is low
trigger2.digitalWrite(0);

const updateParking = (slot,session_id) => {
    axios.get(`http://${host}:3000/fillslot/${slot}/${session_id}`)
    .then(response => {
        console.log(response.data);
    }).catch(error => {
        console.log(error);
    });
}

const watchHCSR041 = () => {
  let startTick;

  echo.on('alert', (level, tick) => {
    if (level == 1) {
      startTick = tick;
    } else {
      const endTick = tick;
      const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
      const dist = Math.round(diff / 2 / MICROSECDONDS_PER_CM);
      if(dist < 14){
          if(temp_session > 0){
              let s_id = temp_session;
              temp_session = 0;
              updateParking(1,s_id);
          }
      } else {
          console.log("Parking Slot I Available"); 
      }
    }
  });
};

const watchHCSR042 = () => {
  let startTick;

  echo2.on('alert', (level, tick) => {
    if (level == 1) {
      startTick = tick;
    } else {
      const endTick = tick;
      const diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
      const dist = Math.round(diff / 2 / MICROSECDONDS_PER_CM);
      if(dist < 14){
        if(temp_session > 0){
              let s_id = temp_session;
              temp_session = 0;
              updateParking(2,s_id);
          }
      } else {
        console.log("Parking Slot II Available");  
      }
    }
  });
};

watchHCSR041();
watchHCSR042();
// Trigger a distance measurement once per second
setInterval(()=> {
  console.log("--------Reading----------");
  trigger.trigger(10, 1); // Set trigger high for 10 microseconds
  trigger2.trigger(10, 1); 
}, 1000); 

