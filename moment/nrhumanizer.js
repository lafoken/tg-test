"use strict";

// Read the docs: https://nodered.org/docs/creating-nodes/node-js
// require moment.js (must be installed from package.js as a dependency)
const moment = require("moment");

/**
 * @param {import("node-red").NodeRedApp} RED
 */
module.exports = function (RED) {
  // The main node definition - most things happen in here
  /**
   * @this {import("node-red").Node & Record<string,any>}
   * @param {import("node-red").NodeSettings<Record<string,any>>} config
   */

  function nodeDefinition(config) {
    // copy "this" object in case we need it in context of callbacks of other functions.
    const node = this;

    // Create a RED node
    // @ts-ignore
    RED.nodes.createNode(this, config);

    // Store local copies of the node configuration (as defined in the .html)
    this.topic = config.topic;

    // CUSTOM SETTINGS
    this.inputKey = config.input_key || "payload"; // where to take the input from
    this.outputKey = config.output_key || "payload";
    this.approximate = config.approximate;
    this.units = config.units || "seconds";

    console.dir(JSON.stringify(config));

    // respond to inputs....
    node.on("input", function (msg, send, done) {
      // @ts-ignore
      const { payload } = msg;

      const value =
        node.inputKey && payload.hasOwnProperty(node.inputKey)
          ? payload[node.inputKey]
          : payload;

      if (!node.approximate && !Number.isInteger(value)) {
        return node.warn(
          "Invalid input for humanize call, input must be an integer"
        );
      }

      const v = node.approximate ? Math.ceil(value) : value;

      const _humanized = moment.duration(v, node.units).humanize();

      const resolvedKey = node.outputKey || node.inputKey;

      if (typeof msg.payload == "object") {
        msg.payload[resolvedKey] = _humanized;
      } else {
        msg.payload = _humanized;
      }

      send(msg);

      // for backward compatibility
      done();
    });
  }

  // Register the node by name. This must be called before overriding any of the
  // Node functions.
  // Module name must match this nodes html file
  // @ts-ignore
  RED.nodes.registerType("humanizer", nodeDefinition);
};
