const amqplib = require("amqplib");
const {
  MESSAGE_BROKER_URL,
  EXCHANGE_NAME,
} = require("../config/server-config");

const { subscribeEvents } = require("../services/email-services"); // your service file

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

const subscribeMessage = async (channel, binding_key) => {
  try {
    const queueName = "REMINDER_QUEUE";

    // Ensure exchange exists and is durable
    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });

    // Ensure queue exists and is durable
    const applicationQueue = await channel.assertQueue(queueName, {
      durable: true,
    });

    // Bind queue to exchange
    await channel.bindQueue(applicationQueue.queue, EXCHANGE_NAME, binding_key);

    console.log(
      `Subscribed to queue "${queueName}" with binding key "${binding_key}"`
    );

    // Prefetch 1 message at a time to avoid overwhelming subscriber
    channel.prefetch(1);

    channel.consume(
      applicationQueue.queue,
      async (msg) => {
        if (!msg) return;

        let payload;
        try {
          payload = JSON.parse(msg.content.toString());
        } catch (err) {
          console.error("❌ Failed to parse message:", msg.content.toString());
          return channel.ack(msg); // acknowledge to remove bad message
        }

        if (!payload.service || !payload.data) {
          console.warn("⚠️ Message missing service or data:", payload);
          return channel.ack(msg);
        }

        try {
          // Call the actual service handler (CREATE_TICKET, SEND_BASIC_MAIL, etc.)
          await subscribeEvents(payload);
          console.log(`✅ Handled service: ${payload.service}`);
          // Message processed successfully → acknowledge
          channel.ack(msg);
        } catch (err) {
          console.error(`❌ Error handling service ${payload.service}:`, err);

          // Optional: do NOT ack if you want message to be retried later
          // channel.nack(msg, false, true);
          // This will requeue the message for later retry
          channel.ack(msg); // Or ack to remove from queue
        }
      },
      { noAck: false } // important: disable auto-ack to control retry
    );
  } catch (error) {
    console.error("❌ Error subscribing to messages:", error);
    throw error;
  }
};

const publisherMessage = async (channel, binding_key, message) => {
  try {
    // Ensure the exchange exists
    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });

    // Optional: ensure the queue exists and is bound to the exchange
    // we can replace QUEUE_NAME with your actual queue name
    const queueName = "REMINDER_QUEUE";
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
