/*global module, require, console, Buffer */
import * as child_process from "child_process";

import * as api_application_protocol_hand from "./lib/api_configuration/types/application_protocol_hand/alan_api";
import * as api_application_protocol_request from "./lib/api_configuration/types/application_protocol_request/alan_api";
import * as api_application_protocol_notify from "./lib/api_configuration/types/application_protocol_notify/alan_api";
import * as api_application_protocol_shake from "./lib/api_configuration/types/application_protocol_shake/alan_api";
import * as api_interface from "./lib/api_configuration/types/interface/alan_api";
import * as api_interface_notification from "./lib/api_configuration/types/interface_notification/alan_api";
import * as api_interface_subscription from "./lib/api_configuration/types/interface_subscription/alan_api";
import * as api_interface_command from "./lib/api_configuration/types/interface_command/alan_api";
import * as api_manifest from "./lib/api_configuration-manifest/types/manifest/alan_api";
import * as serializer_application_protocol_hand from "./lib/api_configuration/types/application_protocol_hand/serializer_json";
import * as serializer_application_protocol_request from "./lib/api_configuration/types/application_protocol_request/serializer_json";
import * as serializer_interface_subscription from "./lib/api_configuration/types/interface_subscription/serializer_json";

import {default as readFiles} from "./lib/read-from-zip/readFilesFromZipArchive";
import {default as stream_handler_create} from "./lib/stream_handler";

var INIT = 1, EXPECT_SHAKE = 2, EXPECT_NOTIFY = 3, EXPECT_NOTHING = 4;
var OPEN = 1, CLOSED = 2;

export function consumeInterface(
	application_host:string,
	application_port:number,
	container_name: string,
	route_name: string,
	custom_project_package_path:string,
	onInterfaceLoaded:(consuming_interface:{
		createSubscriptionConnection:(
			subscription_request_jso:api_interface_subscription.Tinterface_subscription,
			replyHandler:(reply:api_interface_notification.Cinterface_notification) => void,
			onError:(error:string) => void
		) => {
			invokeCommand(command_jso:api_interface_command.Tinterface_command):void,
			close():void
		},
		createRawSubscriptionConnection:(
			subscription_request_jso:api_interface_subscription.Tinterface_subscription,
			replyHandler:(reply:string) => void,
			onError:(error:string) => void
		) => {
			invokeCommand(command_jso:api_interface_command.Tinterface_command):void,
			close():void
		},
		createSubscriptionLessConnection:(
			onError:(error:string) => void
		) => {
			invokeCommand(command_jso:api_interface_command.Tinterface_command):void,
			close():void
		},
		$interface:api_interface.Cinterface
	}) => void
):void {
	var $interface: api_interface.Cinterface,
		interface_hash: string;

	var consumeInterface: any;

	readFiles(custom_project_package_path, function (pkg) {
		$interface = new api_interface.Cinterface(JSON.parse(pkg["package"]["interface.alan.json"].toString("utf8")));
		interface_hash = new api_manifest.Cmanifest(JSON.parse(pkg[".manifest"].toString("utf8"))).properties.root
			.properties.type.cast("directory").properties.children.get("interface.alan")?.properties.inode.properties.type.cast("file").properties.hash || "";
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
		subscription_request_jso:api_interface_subscription.Tinterface_subscription,
		validate_subscription_requests_replies:boolean,
		notifyHandler:(reply:api_interface_notification.Cinterface_notification|string) => void,
		onError:(error_message:string) => void
	):{
		invokeCommand(command_jso:api_interface_command.Tinterface_command):void,
		close():void
	} {
		var subscription_request_decorated: api_interface_subscription.Cinterface_subscription | undefined,
			subscription_request_raw: any;
		if (subscription_request_jso !== null) {
			if (validate_subscription_requests_replies === true) {
				subscription_request_decorated = new api_interface_subscription.Cinterface_subscription(
					subscription_request_jso,
					{ "interface_": $interface }
				);
			} else {
				subscription_request_raw = subscription_request_jso;
			}
		}

		var connection_receive_state = INIT;
		var connection_send_state = OPEN;

		var child = child_process.spawn(
			"socket-bridge",
			[
				application_host,
				application_port.toString(),
				"--appsrv",
				container_name,
				route_name,
				"default"
			]
		);

		var child_status = {
			error_buffers: [] as Buffer[],
			error_length: 0 as number,
			exited: false as boolean,
			exit_code: null as null | number,
			exit_signal: null as null | string,
			closed: false as boolean
		};

		var sh = stream_handler_create(function (raw_msg: Buffer) {
			//console.log("-> consumer: " + raw_msg.toString());
			switch (connection_receive_state) {
				case INIT:
					throw new Error("Receiving data when no hand sent yet");
				case EXPECT_SHAKE:
					new api_application_protocol_shake.Capplication_protocol_shake(JSON.parse(raw_msg.toString("utf8")));
					if (subscription_request_jso === null) {
						connection_receive_state = EXPECT_NOTHING;
					} else {
						child.stdin.write(Buffer.from(JSON.stringify(serializer_application_protocol_request.serialize(new api_application_protocol_request.Capplication_protocol_request({
							"type": [ "subscribe", {
								"id": "", //TODO: support subscription ids
								"subscription": JSON.stringify(
									subscription_request_decorated !== undefined
									? serializer_interface_subscription.serialize(subscription_request_decorated)
									: subscription_request_raw
								)
							} ]
						}))), "utf8"));
						child.stdin.write(Buffer.from([ 0 ]));

						connection_receive_state = EXPECT_NOTIFY;
					}
					break;
				case EXPECT_NOTIFY:
					var notify_reply = new api_application_protocol_notify.Capplication_protocol_notify(JSON.parse(raw_msg.toString("utf8")));
					notify_reply.properties.result.switch({
						"notification": function ($) {
							//TODO: pass $.properties.id to event handler
							notifyHandler(
								subscription_request_decorated !== undefined
									?  new api_interface_notification.Cinterface_notification(
										JSON.parse($.properties.notification),
										{
											"interface_": $interface
										}
									)
									: $.properties.notification
							);
						},
						"unsubscribe": function ($) {
							//TODO: handle server-initiated unsubscribe msg
						},
						"event": function ($) {
							//TODO: handle event
						}
					});
					break;
				case EXPECT_NOTHING:
					throw new Error("Error in js_application_runtime: Unexpected received data from server. Expected no data, because no subscription data requested.");
				default:
					throw new Error("Hmm");
			}
		});
		child.stdout.on("data", function (buffer) {
			sh(buffer);
		});
		child.stderr.on("data", function (buffer) {
			child_status.error_buffers.push(buffer);
			child_status.error_length += buffer.length;
		});
		var cleanup = function () {
			var details: string = "";
			if (child_status.closed && child_status.exited) {
				if (child_status.exit_signal !== null) {
					onError("Child terminated with signal " + child_status.exit_signal);
				} else if (child_status.exit_code !== null) {
					if (child_status.error_length > 0) {
						details = ": " + Buffer.concat(child_status.error_buffers, child_status.error_length).toString("utf8").trim();
					}
					onError("Child exited with status " + child_status.exit_code.toString() + details);
				} else if (child_status.exit_code === 0) {
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
				}
			}
		};
		child.on("close", function () {
			child_status.closed = true;
			cleanup();
		});
		child.on("exit", function (code, signal) {
			child_status.exited = true;
			child_status.exit_code = code;
			child_status.exit_signal = signal;
			cleanup();
		});
		child.stdin.write(Buffer.from(JSON.stringify(serializer_application_protocol_hand.serialize(new api_application_protocol_hand.Capplication_protocol_hand({
			"interface version": interface_hash,
		}))), "utf8"));
		child.stdin.write(Buffer.from([ 0 ]));
		connection_receive_state = EXPECT_SHAKE;

		return {
			invokeCommand: function (command_jso) {
				switch (connection_send_state) {
					case OPEN:
						child.stdin.write(Buffer.from(JSON.stringify(serializer_application_protocol_request.serialize(new api_application_protocol_request.Capplication_protocol_request({
							"type": [ "invoke", {
								"command": JSON.stringify(command_jso)
							} ]
						}))), "utf8"));
						child.stdin.write(Buffer.from([ 0 ]));
						break;
					case CLOSED:
						throw new Error("Invoking a command on a closed consuming connection");
					default:
						throw new Error("Hmm");
				}
			},
			close: function () {
				switch (connection_send_state) {
					case OPEN:
						child.stdin.end();
						connection_send_state = CLOSED;
						break;
					case CLOSED:
						throw new Error("Closing an already closed connection");
				}
			}
		};
	};
};
