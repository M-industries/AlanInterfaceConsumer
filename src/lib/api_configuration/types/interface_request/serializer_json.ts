import * as read_api from "./alan_api";
let serialize_command_arguments = (
	function ($:read_api.Ccommand_arguments) { 
		let $_command_arguments= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["properties"] = (function ($) {
			var object:{[key:string]:any} = {};
			for (let [k,v] of $_command_arguments.properties.properties) {
				object[k] = (
					function ($:read_api.Cproperties) { 
						let $_properties= $;
						var raw_data:{[key:string]:any} = {};
						switch ($_properties.properties.type.state.name) {
							case 'file':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Cfile) { 
										let $_file= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["extension"] = $_file.properties.extension;
										raw_data["token"] = $_file.properties.token;
										return raw_data;
									}
								(<any>$_properties.properties.type.state.node))];
								break;
							case 'matrix':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Cmatrix) { 
										let $_matrix= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["entries"] = (function ($) {
											var object:{[key:string]:any} = {};
											for (let [k,v] of $_matrix.properties.entries) {
												object[k] = (
													function ($:read_api.Centries) { 
														let $_entries= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["arguments"] = serialize_command_arguments($_entries.properties.arguments);
														return raw_data;
													}
												(v));
											}
											return object;
										}($));
										return raw_data;
									}
								(<any>$_properties.properties.type.state.node))];
								break;
							case 'number':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Cnumber) { 
										let $_number= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["number"] = $_number.properties.number;
										return raw_data;
									}
								(<any>$_properties.properties.type.state.node))];
								break;
							case 'reference':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Creference) { 
										let $_reference= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["entry"] = $_reference.properties.entry;
										return raw_data;
									}
								(<any>$_properties.properties.type.state.node))];
								break;
							case 'state group':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Cstate_group) { 
										let $_state_group= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["arguments"] = serialize_command_arguments($_state_group.properties.arguments);
										raw_data["state"] = $_state_group.properties.state.entry;
										return raw_data;
									}
								(<any>$_properties.properties.type.state.node))];
								break;
							case 'text':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Ctext) { 
										let $_text= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["text"] = $_text.properties.text;
										return raw_data;
									}
								(<any>$_properties.properties.type.state.node))];
								break;
							default:
								throw new Error('Hmmm');
						}
						return raw_data;
					}
				(v));
			}
			return object;
		}($));
		return raw_data;
	}
);
let serialize_context_keys = (
	function ($:read_api.Ccontext_keys__interface_request) { 
		let $_context_keys__interface_request= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["context keys"] = (function ($) {
			var object:{[key:string]:any} = {};
			for (let [k,v] of $_context_keys__interface_request.properties.context_keys) {
				object[k] = (
					function ($:read_api.Ccontext_keys__context_keys) { 
						let $_context_keys__context_keys= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["value"] = $_context_keys__context_keys.properties.value;
						return raw_data;
					}
				(v));
			}
			return object;
		}($));
		return raw_data;
	}
);
let serialize_id_path = (
	function ($:read_api.Cid_path) { 
		let $_id_path= $;
		var raw_data:{[key:string]:any} = {};
		switch ($_id_path.properties.has_steps.state.name) {
			case 'no':
				raw_data["has steps"] = [$_id_path.properties.has_steps.state.name, (
					function ($:read_api.Cno__has_steps) { 
						let $_no__has_steps= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_id_path.properties.has_steps.state.node))];
				break;
			case 'yes':
				raw_data["has steps"] = [$_id_path.properties.has_steps.state.name, (
					function ($:read_api.Cyes__has_steps) { 
						let $_yes__has_steps= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["tail"] = serialize_id_path($_yes__has_steps.properties.tail);
						switch ($_yes__has_steps.properties.type.state.name) {
							case 'collection entry':
								raw_data["type"] = [$_yes__has_steps.properties.type.state.name, (
									function ($:read_api.Ccollection_entry) { 
										let $_collection_entry= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["collection"] = $_collection_entry.properties.collection.entry;
										raw_data["id"] = $_collection_entry.properties.id;
										return raw_data;
									}
								(<any>$_yes__has_steps.properties.type.state.node))];
								break;
							case 'group':
								raw_data["type"] = [$_yes__has_steps.properties.type.state.name, (
									function ($:read_api.Cgroup) { 
										let $_group= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["group"] = $_group.properties.group.entry;
										return raw_data;
									}
								(<any>$_yes__has_steps.properties.type.state.node))];
								break;
							case 'state':
								raw_data["type"] = [$_yes__has_steps.properties.type.state.name, (
									function ($:read_api.Cstate) { 
										let $_state= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["state"] = $_state.properties.state.entry;
										raw_data["state group"] = $_state.properties.state_group.entry;
										return raw_data;
									}
								(<any>$_yes__has_steps.properties.type.state.node))];
								break;
							default:
								throw new Error('Hmmm');
						}
						return raw_data;
					}
				(<any>$_id_path.properties.has_steps.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		return raw_data;
	}
);
export var serialize = (
	function ($:read_api.Cinterface_request) { 
		let $_interface_request= $;
		var raw_data:{[key:string]:any} = {};
		switch ($_interface_request.properties.type.state.name) {
			case 'command execution':
				raw_data["type"] = [$_interface_request.properties.type.state.name, (
					function ($:read_api.Ccommand_execution) { 
						let $_command_execution= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["arguments"] = serialize_command_arguments($_command_execution.properties.arguments);
						raw_data["command"] = $_command_execution.properties.command.entry;
						raw_data["context keys"] = serialize_context_keys($_command_execution.properties.context_keys);
						raw_data["context node"] = serialize_id_path($_command_execution.properties.context_node);
						return raw_data;
					}
				(<any>$_interface_request.properties.type.state.node))];
				break;
			case 'subscribe':
				raw_data["type"] = [$_interface_request.properties.type.state.name, (
					function ($:read_api.Csubscribe) { 
						let $_subscribe= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["context keys"] = serialize_context_keys($_subscribe.properties.context_keys);
						switch ($_subscribe.properties.initialization_data_requested.state.name) {
							case 'no':
								raw_data["initialization data requested"] = [$_subscribe.properties.initialization_data_requested.state.name, (
									function ($:read_api.Cno__initialization_data_requested) { 
										let $_no__initialization_data_requested= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_subscribe.properties.initialization_data_requested.state.node))];
								break;
							case 'yes':
								raw_data["initialization data requested"] = [$_subscribe.properties.initialization_data_requested.state.name, (
									function ($:read_api.Cyes__initialization_data_requested) { 
										let $_yes__initialization_data_requested= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_subscribe.properties.initialization_data_requested.state.node))];
								break;
							default:
								throw new Error('Hmmm');
						}
						return raw_data;
					}
				(<any>$_interface_request.properties.type.state.node))];
				break;
			case 'unsubscribe':
				raw_data["type"] = [$_interface_request.properties.type.state.name, (
					function ($:read_api.Cunsubscribe) { 
						let $_unsubscribe= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_interface_request.properties.type.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		return raw_data;
	}
);