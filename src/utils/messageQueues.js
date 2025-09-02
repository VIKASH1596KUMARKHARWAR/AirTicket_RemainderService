// const amqplib = require("amqplib");
// const {
//   MESSAGE_BROKER_URL,
//   EXCHANGE_NAME,
// } = require("../config/server-config");

// const createChannel = async () => {
//   try {
//     const connection = await amqplib.connect(MESSAGE_BROKER_URL);
//     const channel = await connection.createChannel();
//     await channel.assertExchange(EXCHANGE_NAME, "direct", false);
//     return channel;
//   } catch (error) {
//     throw error;
//   }
// };

// const subscribeMessage = async (channel, service, binding_key) => {
//   try {
//     const applicationQueue = await channel.assertQueue("QUEUE_NAME");

//     channel.bindQueue(applicationQueue.queue, EXCHANGE_NAME, binding_key);

//     channel.consume(applicationQueue.queue, (msg) => {
//       console.log("received data");
//       console.log(msg.content.toString());
//       channel.ack(msg);
//     });
//   } catch (error) {
//     throw error;
//   }
// };

// const publisherMessage = async (channel, binding_key, message) => {
//   try {
//     await channel.assertQueue("QUEUE_NAME");
//     await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(message));
//   } catch (error) {
//     throw error;
//   }
// };

// module.exports = {
//   createChannel,
//   subscribeMessage,
//   publisherMessage,
// };

const amqplib = require("amqplib");
const {
  MESSAGE_BROKER_URL,
  EXCHANGE_NAME,
} = require("../config/server-config");

const createChannel = async () => {
  try {
    const connection = await amqplib.connect(MESSAGE_BROKER_URL);
    const channel = await connection.createChannel();
    // await channel.assertExchange(EXCHANGE_NAME, "direct", false);
    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
    return channel;
  } catch (error) {
    throw error;
  }
};

// const subscribeMessage = async (channel, service, binding_key) => {
//   try {
//     const applicationQueue = await channel.assertQueue("QUEUE_NAME", {
//       durable: true,
//     });

//     channel.bindQueue(applicationQueue.queue, EXCHANGE_NAME, binding_key);

//     channel.consume(applicationQueue.queue, (msg) => {
//       if (msg !== null) {
//         console.log("✅ Received data:", msg.content.toString());

//         // If you want to call some service logic:
//         service(msg.content.toString());

//         channel.ack(msg);
//       }
//     });
//   } catch (error) {
//     throw error;
//   }
// };

const subscribeMessage = async (channel, service, binding_key) => {
  try {
    const queueName = "QUEUE_NAME";

    // 1. Ensure the exchange exists
    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });

    // 2. Ensure the queue exists
    const applicationQueue = await channel.assertQueue(queueName, {
      durable: true,
    });

    // 3. Bind the queue to the exchange with the binding key
    await channel.bindQueue(applicationQueue.queue, EXCHANGE_NAME, binding_key);

    // 4. Consume messages from the queue
    channel.consume(applicationQueue.queue, (msg) => {
      if (msg !== null) {
        // Convert message from Buffer to string/JSON
        const content = msg.content.toString();
        let parsedMessage;
        try {
          parsedMessage = JSON.parse(content);
        } catch {
          parsedMessage = content;
        }

        console.log(" Received data:", parsedMessage);

        // Call your service logic
        service(parsedMessage);

        // Acknowledge the message
        channel.ack(msg);
      }
    });

    console.log(
      `Subscribed to queue "${queueName}" with binding key "${binding_key}"`
    );
  } catch (error) {
    console.error(" Error subscribing to messages:", error);
    throw error;
  }
};

// const publisherMessage = async (channel, binding_key, message) => {
//   try {
//     await channel.assertQueue("QUEUE_NAME");
//     await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(message));
//   } catch (error) {
//     throw error;
//   }
// };

// const publisherMessage = async (channel, binding_key, message) => {
//   try {
//     const queue = "QUEUE_NAME";
//     await channel.assertQueue(queue, { durable: true });
//     // channel.sendToQueue(queue, Buffer.from(message));
//     channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(message));
//     console.log(`Message sent to queue ${queue}:`, message);
//   } catch (error) {
//     throw error;
//   }
// };
const publisherMessage = async (channel, binding_key, message) => {
  try {
    // Ensure the exchange exists
    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });

    // Optional: ensure the queue exists and is bound to the exchange
    // we can replace QUEUE_NAME with your actual queue name
    const queueName = "QUEUE_NAME";
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, EXCHANGE_NAME, binding_key);

    // Convert message to Buffer
    const bufferMessage = Buffer.from(
      typeof message === "string" ? message : JSON.stringify(message)
    );

    // Publish message to exchange with binding key
    channel.publish(EXCHANGE_NAME, binding_key, bufferMessage);

    console.log(
      `Message sent to exchange "${EXCHANGE_NAME}" with binding key "${binding_key}":`,
      message
    );
  } catch (error) {
    console.error("Error publishing message:", error);
    throw error;
  }
};

module.exports = {
  createChannel,
  subscribeMessage,
  publisherMessage,
};
