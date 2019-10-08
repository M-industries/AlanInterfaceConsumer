/*global module, require, console, Buffer */
var net = require("net");

import * as decorator_manifest from "./lib/api_configuration-manifest/types/manifest/decorator";
import * as decorator_interface from "./lib/api_configuration/types/interface/decorator";
import * as decorator_interface_request from "./lib/api_configuration/types/interface_request/decorator";
import * as api_interface_reply from "./lib/api_configuration/types/interface_reply/read_api";
import * as api_interface from "./lib/api_configuration/types/interface/read_api";
var serializer_interface_request = require("./lib/api_configuration/types/interface_request/serializer");
import * as decorator_interface_reply from "./lib/api_configuration/types/interface_reply/decorator";
import * as decorator_application_protocol_shake from "./lib/api_configuration/types/application_protocol_shake/decorator";
import * as decorator_application_protocol_notify from "./lib/api_configuration/types/application_protocol_notify/decorator";
import * as decorator_application_protocol_hand from "./lib/api_configuration/types/application_protocol_hand/decorator";
var serializer_application_protocol_hand = require("./lib/api_configuration/types/application_protocol_hand/serializer");
import * as decorator_application_protocol_invoke from "./lib/api_configuration/types/application_protocol_invoke/decorator";
var serializer_application_protocol_invoke = require("./lib/api_configuration/types/application_protocol_invoke/serializer");

import {default as readFiles} from "./lib/read-from-zip/readFilesFromZipArchive";
import {create as stream_handler_create} from "./lib/stream_handler";

var INIT = 1, EXPECT_SHAKE = 2, EXPECT_NOTIFY = 3, EXPECT_NOTHING = 4;
var OPEN = 1, CLOSED = 2;

export function consumeInterface(
	application_host:string,
	application_port:number,
	custom_project_package_path:string,
	onInterfaceLoaded:(consuming_interface:{
		createSubscriptionConnection:(
			subscription_request_jso:any,
			replyHandler:(reply:api_interface_reply.Cinterface_reply) => void,
			onError:(error:string) => void
		) => {
			invokeCommand(command_jso:any):void,
			close():void
		},
		createRawSubscriptionConnection:(
			subscription_request_jso:any,
			replyHandler:(reply:string) => void,
			onError:(error:string) => void
		) => {
			invokeCommand(command_jso:any):void,
			close():void
		},
		createSubscriptionLessConnection:(
			onError:(error:string) => void
		) => {
			invokeCommand(command_jso:any):void,
			close():void
		},
		$interface:api_interface.Cinterface
	}) => void
):void {
	var $interface,
		interface_hash;

	var consumeInterface;

	readFiles(custom_project_package_path, function (pkg) {
		$interface = decorator_interface.decorate(JSON.parse(pkg["package"]["interface.alan.json"].toString("utf8")), {}, function (error) { throw new Error(error); });
		interface_hash = decorator_manifest.decorate(JSON.parse(pkg[".manifest"].toString("utf8")), {}, function (error) { throw new Error(error); }).properties.root
			.properties.type.cast("directory").properties.children.getEntry("interface.alan").properties.inode.properties.type.cast("file").properties.hash;
		onInterfaceLoaded({
			createSubscriptionConnection: function (subscription_request_jso, notifyHandler, onError:(error_message:string) => void) {
				return consumeInterface(subscription_request_jso, true, notifyHandler, onError);
			},
			createRawSubscriptionConnection: function (subscription_request_jso, notifyHandler, onError:(error_message:string) => void) {
				return consumeInterface(subscription_request_jso, false, notifyHandler, onError);
			},
			createSubscriptionLessConnection: function (onError:(error_message:string) => void) {
				return consumeInterface(null, true, null, onError);
			},
			$interface: $interface
		});
	});

	consumeInterface = function (
		subscription_request_jso:any,
		validate_subscription_requests_replies:boolean,
		notifyHandler:(reply:api_interface_reply.Cinterface_reply|string) => void,
		onError:(error_message:string) => void
	):{
		invokeCommand(command_jso:any):void,
		close():void
	} {
		var subscription_request_decorated,
			subscription_request_raw;
		if (subscription_request_jso !== null) {
			if (validate_subscription_requests_replies === true) {
				subscription_request_decorated = decorator_interface_request.decorate(
					{ "type": ["subscribe", subscription_request_jso] },
					{ "interface": $interface },
					function (error) { throw new Error(error); }
				);
			} else {
				subscription_request_raw = { "type": ["subscribe", subscription_request_jso] };
			}
		}

		var connection_receive_state = INIT;
		var connection_send_state = OPEN;

		var client = net.createConnection(application_port, application_host, function () {
			var sh = stream_handler_create(function (raw_msg) {
				//console.log("-> consumer: " + raw_msg.toString());
				switch (connection_receive_state) {
					case INIT:
						throw new Error("Receiving data when no hand sent yet");
					case EXPECT_SHAKE:
						decorator_application_protocol_shake.decorate(JSON.parse(raw_msg.toString("utf8")), {}, function (error) { throw new Error(error); });
						if (subscription_request_jso === null) {
							connection_receive_state = EXPECT_NOTHING;
						} else {
							connection_receive_state = EXPECT_NOTIFY;
						}
						break;
					case EXPECT_NOTIFY:
						var notify_reply = decorator_application_protocol_notify.decorate(JSON.parse(raw_msg.toString("utf8")), {}, function (error) { throw new Error(error); });
						notifyHandler(
							validate_subscription_requests_replies === true
								?  decorator_interface_reply.decorate(
									JSON.parse(notify_reply.properties.notification),
									{
										"interface": $interface,
										"request": subscription_request_decorated
									},
									function (error) { throw new Error(error); }
								)
								: notify_reply.properties.notification
						);
						break;
					case EXPECT_NOTHING:
						throw new Error("Error in js_application_runtime: Unexpected received data from server. Expected no data, because no subscription data requested.");
					default:
						throw new Error("Hmm");
				}
			});

			client.on("data", function (buffer) {
				sh(buffer);
			});
			client.on("end", function () {
				switch (connection_send_state) {
					case OPEN:
						var reply_type;
						switch (connection_receive_state) {
							case INIT:
								reply_type = "INIT";
								break;
							case EXPECT_SHAKE:
								reply_type = "EXPECT_SHAKE";
								break;
							case EXPECT_NOTIFY:
								reply_type = "EXPECT_NOTIFY";
								break;
							case EXPECT_NOTHING:
								reply_type = "EXPECT_NOTHING";
								break;
							default:
								throw new Error("Hmm");
						}
						onError("Error in js_application_runtime: Unexpected server socket close, expected OPEN with reply type " + reply_type);
						break;
					case CLOSED:
						break;
				}
			});
		});
		client.on("error", function (error) {
			onError(error);
		});
		client.write(new Buffer(JSON.stringify(serializer_application_protocol_hand.serialize(decorator_application_protocol_hand.decorate({
			"interface version": interface_hash,
			"subscribe": subscription_request_jso === null
				? ["no", {}]
				: ["yes", { "subscription": JSON.stringify(
						validate_subscription_requests_replies === true
							? serializer_interface_request.serialize(subscription_request_decorated)
							: subscription_request_raw
				) }]
		}, {}, function (error) { throw new Error(error); }))), "utf8"));
		client.write(new Buffer([ 0 ]));
		connection_receive_state = EXPECT_SHAKE;

		return {
			invokeCommand: function (command_jso) {
				switch (connection_send_state) {
					case OPEN:
						client.write(new Buffer(JSON.stringify(serializer_application_protocol_invoke.serialize(decorator_application_protocol_invoke.decorate({
							"command": JSON.stringify(serializer_interface_request.serialize(decorator_interface_request.decorate(
								{ "type": ["command execution", command_jso] },
								{ "interface": $interface }
							)))
						}, {}, function (error) { throw new Error(error); }))), "utf8"));
						client.write(new Buffer([ 0 ]));
						break;
					case CLOSED:
						throw new Error("Invoking a command on a closed consuming connection");
					default:
						throw new Error("Hmm");
				}
			},
			close: function () { // Warning: Due to a misdesign in fabric_server, closing the connection may result in not invoking the command in the fabric_server. Hack/Work around: Open another subscription after invoking the commands and close both connections after having an connection will ensure invoking all commands
				switch (connection_send_state) {
					case OPEN:
						client.end();
						connection_send_state = CLOSED;
						break;
					case CLOSED:
						throw new Error("Closing an already closed connection");
				}
			}
		};
	};
};
