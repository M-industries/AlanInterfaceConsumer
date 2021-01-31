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
							case 'collection':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Ccollection) { 
										let $_collection= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["entries"] = Array.from($_collection.properties.entries).map(el => {
											return function ($:read_api.Centries) { 
												let $_entries= $;
												var raw_data:{[key:string]:any} = {};
												raw_data["arguments"] = serialize_command_arguments($_entries.properties.arguments);
												return raw_data;
											}
											(el);
										});
										return raw_data;
									}
								(<any>$_properties.properties.type.state.node))];
								break;
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
							case 'group':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Cgroup__type__properties) { 
										let $_group__type__properties= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["arguments"] = serialize_command_arguments($_group__type__properties.properties.arguments);
										return raw_data;
									}
								(<any>$_properties.properties.type.state.node))];
								break;
							case 'number':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Cnumber) { 
										let $_number= $;
										var raw_data:{[key:string]:any} = {};
										switch ($_number.properties.type.state.name) {
											case 'integer':
												raw_data["type"] = [$_number.properties.type.state.name, (
													function ($:read_api.Cinteger) { 
														let $_integer= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["value"] = $_integer.properties.value.value;
														return raw_data;
													}
												(<any>$_number.properties.type.state.node))];
												break;
											case 'natural':
												raw_data["type"] = [$_number.properties.type.state.name, (
													function ($:read_api.Cnatural) { 
														let $_natural= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["value"] = $_natural.properties.value.value;
														return raw_data;
													}
												(<any>$_number.properties.type.state.node))];
												break;
											default:
												throw new Error('Hmmm');
										}
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
										raw_data["value"] = $_text.properties.value;
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
	function ($:read_api.Ccontext_keys__interface_command) { 
		let $_context_keys__interface_command= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["context keys"] = (function ($) {
			var object:{[key:string]:any} = {};
			for (let [k,v] of $_context_keys__interface_command.properties.context_keys) {
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
					function ($:read_api.Cno) { 
						let $_no= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_id_path.properties.has_steps.state.node))];
				break;
			case 'yes':
				raw_data["has steps"] = [$_id_path.properties.has_steps.state.name, (
					function ($:read_api.Cyes) { 
						let $_yes= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["tail"] = serialize_id_path($_yes.properties.tail);
						switch ($_yes.properties.type.state.name) {
							case 'collection entry':
								raw_data["type"] = [$_yes.properties.type.state.name, (
									function ($:read_api.Ccollection_entry) { 
										let $_collection_entry= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["collection"] = $_collection_entry.properties.collection.entry;
										raw_data["id"] = $_collection_entry.properties.id;
										return raw_data;
									}
								(<any>$_yes.properties.type.state.node))];
								break;
							case 'group':
								raw_data["type"] = [$_yes.properties.type.state.name, (
									function ($:read_api.Cgroup__type__yes) { 
										let $_group__type__yes= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["group"] = $_group__type__yes.properties.group.entry;
										return raw_data;
									}
								(<any>$_yes.properties.type.state.node))];
								break;
							case 'state':
								raw_data["type"] = [$_yes.properties.type.state.name, (
									function ($:read_api.Cstate) { 
										let $_state= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["state"] = $_state.properties.state.entry;
										raw_data["state group"] = $_state.properties.state_group.entry;
										return raw_data;
									}
								(<any>$_yes.properties.type.state.node))];
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
	function ($:read_api.Cinterface_command) { 
		let $_interface_command= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["arguments"] = serialize_command_arguments($_interface_command.properties.arguments);
		raw_data["command"] = $_interface_command.properties.command.entry;
		raw_data["context keys"] = serialize_context_keys($_interface_command.properties.context_keys);
		raw_data["context node"] = serialize_id_path($_interface_command.properties.context_node);
		return raw_data;
	}
);