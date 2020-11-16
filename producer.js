var Kafka = require("node-rdkafka");

module.exports = function mykafkafunction(event) {
  var producer = new Kafka.Producer({
    //'debug' : 'all',
    "metadata.broker.list": "localhost:19092",
    dr_cb: true, //delivery report callback
  });

  var topicName = "Blockchain-Post";

  var MessageEvent = event;

  //logging debug messages
  producer.on("event.log", function (log) {
    console.log(log);
  });

  //logging all errors~
  producer.on("event.error", function (err) {
    console.error("Error from producer");
    console.error(err);
  });

  //counter to stop this sample after maxMessages are sent
  var counter = 0;
  var maxMessages = 1;

  producer.on("delivery-report", function (err, report) {
    console.log("delivery-report: " + JSON.stringify(report));
    counter++;
  });

  //Wait for the ready event before producing
  producer.on("ready", function (arg) {
    console.log("producer ready." + JSON.stringify(arg));

    for (var i = 0; i < maxMessages; i++) {
      var value = Buffer.from(MessageEvent);
      var key = "key-" + i;
      // if partition is set to -1, librdkafka will use the default partitioner
      var partition = -1;
      producer.produce(topicName, partition, value, key);
    }

    //need to keep polling for a while to ensure the delivery reports are received
    var pollLoop = setInterval(function () {
      producer.poll();
      if (counter === maxMessages) {
        clearInterval(pollLoop);
        producer.disconnect();
      }
    }, 1000);
  });

  producer.on("disconnected", function (arg) {
    console.log("producer disconnected. " + JSON.stringify(arg));
  });

  //starting the producer
  producer.connect();
 
};
