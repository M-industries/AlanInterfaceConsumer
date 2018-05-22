/*global require */
var path = require("path");

//Error.stackTraceLimit = Infinity;

import {consumeInterface} from "@m-industries/alan-interface-consumer";
//import {consumeInterface, api_configuration} from "../src/";
import {create as stream_handler_create} from "./node_modules/@m-industries/alan-interface-consumer/lib/stream_handler";

var providing = {
	host: "127.0.0.1",
	port: "12346"
};

var server_provider = require("net").createServer(function (socket) {
	var sh = stream_handler_create(function (raw_msg) {
		//console.log("-> provider: " + raw_msg.toString());
		switch (raw_msg.toString()) {
			case "{\"interface version\":\"2c9eb66daf5dc31c8ada41e92e4255ad124e0b6da114ef76cf50ec091d239217\",\"subscribe\":[\"yes\",{\"subscription\":\"{\\\"type\\\":[\\\"subscribe\\\",{\\\"context keys\\\":{\\\"context keys\\\":{}},\\\"initialization data requested\\\":[\\\"yes\\\",{}]}]}\"}]}":
				socket.write(new Buffer("{}")); socket.write(new Buffer([ 0 ]));
				socket.write(new Buffer("{\"notification\":\"{\\\"type\\\":[\\\"initialization\\\",{\\\"has initialization data\\\":[\\\"yes\\\",{\\\"context exists\\\":[\\\"yes\\\",{\\\"root\\\":{\\\"properties\\\":{\\\"Printers\\\":{\\\"type\\\":[\\\"collection\\\",{\\\"entries\\\":{\\\"Phaser_1\\\":{\\\"node\\\":{\\\"properties\\\":{}}},\\\"Phaser_2\\\":{\\\"node\\\":{\\\"properties\\\":{}}},\\\"Phaser_3\\\":{\\\"node\\\":{\\\"properties\\\":{}}},\\\"Phaser_4\\\":{\\\"node\\\":{\\\"properties\\\":{}}},\\\"Phaser_5\\\":{\\\"node\\\":{\\\"properties\\\":{}}},\\\"Phaser_6\\\":{\\\"node\\\":{\\\"properties\\\":{}}},\\\"Phaser_7\\\":{\\\"node\\\":{\\\"properties\\\":{}}}},\\\"type\\\":[\\\"dictionary\\\",{}]}]}}}}]}]}]}\"}")); socket.write(new Buffer([ 0 ]));
				socket.write(new Buffer("{\"notification\":\"{\\\"type\\\":[\\\"notification\\\",{\\\"type\\\":[\\\"update\\\",{\\\"update node\\\":{\\\"properties\\\":{\\\"Printers\\\":{\\\"type\\\":[\\\"collection\\\",{\\\"entries\\\":{\\\"NEW ENTRY\\\":{\\\"type\\\":[\\\"create\\\",{\\\"node\\\":{\\\"properties\\\":{}}}]}},\\\"type\\\":[\\\"dictionary\\\",{}]}]}}}}]}]}\"}")); socket.write(new Buffer([ 0 ]));
				break;
			case "{\"command\":\"{\\\"type\\\":[\\\"command execution\\\",{\\\"arguments\\\":{\\\"properties\\\":{}},\\\"command\\\":\\\"Print Label\\\",\\\"context keys\\\":{\\\"context keys\\\":{}},\\\"context node\\\":{\\\"has steps\\\":[\\\"yes\\\",{\\\"tail\\\":{\\\"has steps\\\":[\\\"no\\\",{}]},\\\"type\\\":[\\\"collection entry\\\",{\\\"collection\\\":\\\"Printers\\\",\\\"id\\\":\\\"NEW ENTRY\\\"}]}]}}]}\"}":
				socket.end();
				console.log("Test success");
				break;
			default:
				throw new Error("Unexpected consumer -> provider message: " + raw_msg.toString());
		}
	});

	socket.on("data", function (buffer) {
		sh(buffer);
	});
	socket.on("end", function () {
		server_provider.close(function () {});
	});
}).listen(providing.port, providing.host);

consumeInterface(providing.host, providing.port, path.join(__dirname, "interface.pkg"), function (consume_interface) {
	var consuming_interface_connection = consume_interface.createSubscriptionConnection({
		"context keys": {
			"context keys": {}
		},
		"initialization data requested": ["yes", {}]
	}, function (reply) {
		reply.properties.type.switch({
			"initialization": function () {},
			"notification": function (notification) {
				notification.properties.type.switch({
					"create": null,
					"update": function (update) {
						update.properties.update_node.properties.properties.getEntry("Printers").properties.type.cast("collection").properties.entries.walk(function (entries) {
							entries.properties.type.switch({
								"rename": null,
								"create": function (create) {
									consuming_interface_connection.invokeCommand({
										"context keys": {
											"context keys": {}
										},
										"context node": {
											"has steps": ["yes", {
												"type": ["collection entry", {
													"collection": "Printers",
													"id": create.parent.key
												}],
												"tail": {
													"has steps": ["no", {}]
												}
											}]
										},
										"command": "Print Label",
										"arguments": {
											"properties": {}
										}
									});
								},
								"update": null,
								"remove": null
							});
						});
					},
					"remove": null
				});
				consuming_interface_connection.close();
			}
		});
	}, function (error) { throw new Error(error); });
});
