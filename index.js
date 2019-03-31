var io = require('socket.io-client');
var host = '192.168.1.4';

//var socket = io.connect('http://3.86.163.195:80', {reconnect: true});
var socket = io.connect('http://192.168.1.4:3000',{reconnect: true});
const axios = require('axios');

socket.on('connect', function () {
	console.log('Connected!');
	socket.emit('rfid_scanned_request','test');
});

const Gpio = require('pigpio').Gpio;
const rc522 = require("rc522");

let temp_session = 0;
var parking_1 = false;
var parking_2 = false;

console.log('Ready!!!');

socket.on('park_vehicle',function(data){
  console.log(data);

  temp_session = data.session_id;
  parking_1 = data.parking_1;
  parking_2 = data.parking_2;

});

rc522(function(rfidSerialNumber){
	console.log(rfidSerialNumber);
	socket.emit('rfid_scanned_request',rfidSerialNumber);
	axios.get(`http://${host}:3000/newparking/${rfidSerialNumber}`)
	  .then(response => {
		if(response.data.status == 1)
		toggleGate();
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
          if(!parking_1 && (temp_session!= 0)){
              let s_id = temp_session;
              temp_session = 0;
	      parking_1 = true;
              updateParking(1,s_id);
          }
	  socket.emit("parking_slot_1",false);
      } else {
          console.log("Parking Slot I Available");
	 socket.emit("parking_slot_1",true);
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
        if(!parking_2 && (temp_session!=0)){
              let s_id = temp_session;
              temp_session = 0;
	      parking_2 = true;
              updateParking(2,s_id);
          }
	socket.emit("parking_slot_2",false);
      } else {
        console.log("Parking Slot II Available");
	socket.emit("parking_slot_2",true);      
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


const motor = new Gpio(4, {mode: Gpio.OUTPUT});
motor.servoWrite(1000);

function toggleGate(){
	motor.servoWrite(2000);
	setTimeout(()=>{
		motor.servoWrite(1000);
	},4000);
}

