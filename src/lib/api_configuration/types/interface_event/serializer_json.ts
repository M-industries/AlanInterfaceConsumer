import * as read_api from "./alan_api";
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
						raw_data["property"] = $_yes.properties.property.entry;
						raw_data["tail"] = serialize_id_path($_yes.properties.tail);
						switch ($_yes.properties.value.state.name) {
							case 'choice':
								raw_data["value"] = [$_yes.properties.value.state.name, (
									function ($:read_api.Cchoice) { 
										let $_choice= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["state"] = $_choice.properties.state.entry;
										return raw_data;
									}
								(<any>$_yes.properties.value.state.node))];
								break;
							case 'collection':
								raw_data["value"] = [$_yes.properties.value.state.name, (
									function ($:read_api.Ccollection__value) { 
										let $_collection__value= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["entry"] = $_collection__value.properties.entry;
										return raw_data;
									}
								(<any>$_yes.properties.value.state.node))];
								break;
							case 'node':
								raw_data["value"] = [$_yes.properties.value.state.name, (
									function ($:read_api.Cnode__value) { 
										let $_node__value= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_yes.properties.value.state.node))];
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
let serialize_node = (
	function ($:read_api.Cnode__interface_event) { 
		let $_node__interface_event= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["properties"] = (function ($) {
			var object:{[key:string]:any} = {};
			for (let [k,v] of $_node__interface_event.properties.properties) {
				object[k] = (
					function ($:read_api.Cproperties) { 
						let $_properties= $;
						var raw_data:{[key:string]:any} = {};
						switch ($_properties.properties.type.state.name) {
							case 'collection':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Ccollection__type) { 
										let $_collection__type= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["entries"] = Array.from($_collection__type.properties.entries).map(el => {
											return function ($:read_api.Centries) { 
												let $_entries= $;
												var raw_data:{[key:string]:any} = {};
												raw_data["node"] = serialize_node($_entries.properties.node);
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
									function ($:read_api.Cgroup) { 
										let $_group= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["node"] = serialize_node($_group.properties.node);
										return raw_data;
									}
								(<any>$_properties.properties.type.state.node))];
								break;
							case 'number':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Cnumber) { 
										let $_number= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["value"] = $_number.properties.value.value;
										return raw_data;
									}
								(<any>$_properties.properties.type.state.node))];
								break;
							case 'state group':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Cstate_group) { 
										let $_state_group= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["node"] = serialize_node($_state_group.properties.node);
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
export var serialize = (
	function ($:read_api.Cinterface_event) { 
		let $_interface_event= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["arguments"] = serialize_node($_interface_event.properties.arguments);
		raw_data["context node"] = serialize_id_path($_interface_event.properties.context_node);
		raw_data["event"] = $_interface_event.properties.event.entry;
		return raw_data;
	}
);