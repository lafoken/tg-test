"use strict";
const axios = require("axios");

module.exports = function (RED) {
  function TgTestNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.on("input", async function (msg, send, done) {
      const botToken = config.bot_token;
      const chatId = config.chat_id;
      const message = msg.payload;

      if (!botToken || !chatId) {
        node.error("Не вказано Bot Token або Chat ID", msg);
        return done();
      }

      if (!message) {
        node.warn("msg.payload порожній");
        return done();
      }

      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

      try {
        const response = await axios.post(url, {
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        });

        msg.payload = response.data;
        send(msg);
        done();
      } catch (error) {
        node.error(`Помилка відправлення: ${error.message}`, msg);
        done(error);
      }
    });
  }

  RED.nodes.registerType("tgTest", TgTestNode);
};
