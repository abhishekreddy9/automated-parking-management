const Gpio = require('pigpio').Gpio;
const rc522 = require("rc522");

console.log('Ready!!!');

rc522(function(rfidSerialNumber){
    console.log(rfidSerialNumber);
});

/*

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECDONDS_PER_CM = 1e6/34321;

const trigger = new Gpio(23, {mode: Gpio.OUTPUT});
const echo = new Gpio(24, {mode: Gpio.INPUT, alert: true});

const trigger2 = new Gpio(22,{mode: Gpio.OUTPUT});
const echo2 = new Gpio(27,{mode: Gpio.INPUT, alert:true});

trigger.digitalWrite(0); // Make sure trigger is low
trigger2.digitalWrite(0);

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
	console.log("Parking Slot I Occupied");	
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
        console.log("Parking Slot II Occupied");   
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
}, 1000); */
