const EventEmitter = require("events");

const EE = new EventEmitter();

EE.on("test", (message) => {
  console.log(message);
});

EE.emit("test", process.env.TEST);
