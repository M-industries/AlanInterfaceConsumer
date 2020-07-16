import * as read_api from "./alan_api";
let serialize_initialize_node = (
	function ($:read_api.Cinitialize_node) { 
		let $_initialize_node= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["properties"] = (function ($) {
			var object:{[key:string]:any} = {};
			for (let [k,v] of $_initialize_node.properties.properties) {
				object[k] = (
					function ($:read_api.Cproperties__initialize_node) { 
						let $_properties__initialize_node= $;
						var raw_data:{[key:string]:any} = {};
						switch ($_properties__initialize_node.properties.type.state.name) {
							case 'collection':
								raw_data["type"] = [$_properties__initialize_node.properties.type.state.name, (
									function ($:read_api.Ccollection__type__properties__initialize_node) { 
										let $_collection__type__properties__initialize_node= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["entries"] = Array.from($_collection__type__properties__initialize_node.properties.entries).map(el => {
											return function ($:read_api.Centries__collection__type__properties__initialize_node) { 
												let $_entries__collection__type__properties__initialize_node= $;
												var raw_data:{[key:string]:any} = {};
												raw_data["node"] = serialize_initialize_node($_entries__collection__type__properties__initialize_node.properties.node);
												return raw_data;
											}
											(el);
										});
										return raw_data;
									}
								(<any>$_properties__initialize_node.properties.type.state.node))];
								break;
							case 'file':
								raw_data["type"] = [$_properties__initialize_node.properties.type.state.name, (
									function ($:read_api.Cfile__type__properties__initialize_node) { 
										let $_file__type__properties__initialize_node= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["extension"] = $_file__type__properties__initialize_node.properties.extension;
										raw_data["token"] = $_file__type__properties__initialize_node.properties.token;
										return raw_data;
									}
								(<any>$_properties__initialize_node.properties.type.state.node))];
								break;
							case 'group':
								raw_data["type"] = [$_properties__initialize_node.properties.type.state.name, (
									function ($:read_api.Cgroup__type__properties__initialize_node) { 
										let $_group__type__properties__initialize_node= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["node"] = serialize_initialize_node($_group__type__properties__initialize_node.properties.node);
										return raw_data;
									}
								(<any>$_properties__initialize_node.properties.type.state.node))];
								break;
							case 'number':
								raw_data["type"] = [$_properties__initialize_node.properties.type.state.name, (
									function ($:read_api.Cnumber__type__properties__initialize_node) { 
										let $_number__type__properties__initialize_node= $;
										var raw_data:{[key:string]:any} = {};
										switch ($_number__type__properties__initialize_node.properties.type.state.name) {
											case 'integer':
												raw_data["type"] = [$_number__type__properties__initialize_node.properties.type.state.name, (
													function ($:read_api.Cinteger__type__number__type__properties__initialize_node) { 
														let $_integer__type__number__type__properties__initialize_node= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["value"] = $_integer__type__number__type__properties__initialize_node.properties.value;
														return raw_data;
													}
												(<any>$_number__type__properties__initialize_node.properties.type.state.node))];
												break;
											case 'natural':
												raw_data["type"] = [$_number__type__properties__initialize_node.properties.type.state.name, (
													function ($:read_api.Cnatural__type__number__type__properties__initialize_node) { 
														let $_natural__type__number__type__properties__initialize_node= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["value"] = $_natural__type__number__type__properties__initialize_node.properties.value;
														return raw_data;
													}
												(<any>$_number__type__properties__initialize_node.properties.type.state.node))];
												break;
											default:
												throw new Error('Hmmm');
										}
										return raw_data;
									}
								(<any>$_properties__initialize_node.properties.type.state.node))];
								break;
							case 'state group':
								raw_data["type"] = [$_properties__initialize_node.properties.type.state.name, (
									function ($:read_api.Cstate_group__type__properties__initialize_node) { 
										let $_state_group__type__properties__initialize_node= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["node"] = serialize_initialize_node($_state_group__type__properties__initialize_node.properties.node);
										raw_data["state"] = $_state_group__type__properties__initialize_node.properties.state.entry;
										return raw_data;
									}
								(<any>$_properties__initialize_node.properties.type.state.node))];
								break;
							case 'text':
								raw_data["type"] = [$_properties__initialize_node.properties.type.state.name, (
									function ($:read_api.Ctext__type__properties__initialize_node) { 
										let $_text__type__properties__initialize_node= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["value"] = $_text__type__properties__initialize_node.properties.value;
										return raw_data;
									}
								(<any>$_properties__initialize_node.properties.type.state.node))];
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
let serialize_update_node = (
	function ($:read_api.Cupdate_node) { 
		let $_update_node= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["properties"] = (function ($) {
			var object:{[key:string]:any} = {};
			for (let [k,v] of $_update_node.properties.properties) {
				object[k] = (
					function ($:read_api.Cproperties__update_node) { 
						let $_properties__update_node= $;
						var raw_data:{[key:string]:any} = {};
						switch ($_properties__update_node.properties.type.state.name) {
							case 'collection':
								raw_data["type"] = [$_properties__update_node.properties.type.state.name, (
									function ($:read_api.Ccollection__type__properties__update_node) { 
										let $_collection__type__properties__update_node= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["entries"] = Array.from($_collection__type__properties__update_node.properties.entries).map(el => {
											return function ($:read_api.Centries__collection__type__properties__update_node) { 
												let $_entries__collection__type__properties__update_node= $;
												var raw_data:{[key:string]:any} = {};
												switch ($_entries__collection__type__properties__update_node.properties.type.state.name) {
													case 'create':
														raw_data["type"] = [$_entries__collection__type__properties__update_node.properties.type.state.name, (
															function ($:read_api.Ccreate__type__entries) { 
																let $_create__type__entries= $;
																var raw_data:{[key:string]:any} = {};
																raw_data["node"] = serialize_initialize_node($_create__type__entries.properties.node);
																return raw_data;
															}
														(<any>$_entries__collection__type__properties__update_node.properties.type.state.node))];
														break;
													case 'remove':
														raw_data["type"] = [$_entries__collection__type__properties__update_node.properties.type.state.name, (
															function ($:read_api.Cremove__type__entries) { 
																let $_remove__type__entries= $;
																var raw_data:{[key:string]:any} = {};
																raw_data["key"] = $_remove__type__entries.properties.key;
																return raw_data;
															}
														(<any>$_entries__collection__type__properties__update_node.properties.type.state.node))];
														break;
													case 'update':
														raw_data["type"] = [$_entries__collection__type__properties__update_node.properties.type.state.name, (
															function ($:read_api.Cupdate__type__entries) { 
																let $_update__type__entries= $;
																var raw_data:{[key:string]:any} = {};
																raw_data["key"] = $_update__type__entries.properties.key;
																raw_data["update node"] = serialize_update_node($_update__type__entries.properties.update_node);
																return raw_data;
															}
														(<any>$_entries__collection__type__properties__update_node.properties.type.state.node))];
														break;
													default:
														throw new Error('Hmmm');
												}
												return raw_data;
											}
											(el);
										});
										return raw_data;
									}
								(<any>$_properties__update_node.properties.type.state.node))];
								break;
							case 'file':
								raw_data["type"] = [$_properties__update_node.properties.type.state.name, (
									function ($:read_api.Cfile__type__properties__update_node) { 
										let $_file__type__properties__update_node= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["new extension"] = $_file__type__properties__update_node.properties.new_extension;
										raw_data["new token"] = $_file__type__properties__update_node.properties.new_token;
										return raw_data;
									}
								(<any>$_properties__update_node.properties.type.state.node))];
								break;
							case 'group':
								raw_data["type"] = [$_properties__update_node.properties.type.state.name, (
									function ($:read_api.Cgroup__type__properties__update_node) { 
										let $_group__type__properties__update_node= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["update node"] = serialize_update_node($_group__type__properties__update_node.properties.update_node);
										return raw_data;
									}
								(<any>$_properties__update_node.properties.type.state.node))];
								break;
							case 'number':
								raw_data["type"] = [$_properties__update_node.properties.type.state.name, (
									function ($:read_api.Cnumber__type__properties__update_node) { 
										let $_number__type__properties__update_node= $;
										var raw_data:{[key:string]:any} = {};
										switch ($_number__type__properties__update_node.properties.type.state.name) {
											case 'integer':
												raw_data["type"] = [$_number__type__properties__update_node.properties.type.state.name, (
													function ($:read_api.Cinteger__type__number__type__properties__update_node) { 
														let $_integer__type__number__type__properties__update_node= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["new value"] = $_integer__type__number__type__properties__update_node.properties.new_value;
														return raw_data;
													}
												(<any>$_number__type__properties__update_node.properties.type.state.node))];
												break;
											case 'natural':
												raw_data["type"] = [$_number__type__properties__update_node.properties.type.state.name, (
													function ($:read_api.Cnatural__type__number__type__properties__update_node) { 
														let $_natural__type__number__type__properties__update_node= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["new value"] = $_natural__type__number__type__properties__update_node.properties.new_value;
														return raw_data;
													}
												(<any>$_number__type__properties__update_node.properties.type.state.node))];
												break;
											default:
												throw new Error('Hmmm');
										}
										return raw_data;
									}
								(<any>$_properties__update_node.properties.type.state.node))];
								break;
							case 'state group':
								raw_data["type"] = [$_properties__update_node.properties.type.state.name, (
									function ($:read_api.Cstate_group__type__properties__update_node) { 
										let $_state_group__type__properties__update_node= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["state"] = $_state_group__type__properties__update_node.properties.state.entry;
										switch ($_state_group__type__properties__update_node.properties.type.state.name) {
											case 'set':
												raw_data["type"] = [$_state_group__type__properties__update_node.properties.type.state.name, (
													function ($:read_api.Cset) { 
														let $_set= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["node"] = serialize_initialize_node($_set.properties.node);
														return raw_data;
													}
												(<any>$_state_group__type__properties__update_node.properties.type.state.node))];
												break;
											case 'update':
												raw_data["type"] = [$_state_group__type__properties__update_node.properties.type.state.name, (
													function ($:read_api.Cupdate__type__state_group) { 
														let $_update__type__state_group= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["update node"] = serialize_update_node($_update__type__state_group.properties.update_node);
														return raw_data;
													}
												(<any>$_state_group__type__properties__update_node.properties.type.state.node))];
												break;
											default:
												throw new Error('Hmmm');
										}
										return raw_data;
									}
								(<any>$_properties__update_node.properties.type.state.node))];
								break;
							case 'text':
								raw_data["type"] = [$_properties__update_node.properties.type.state.name, (
									function ($:read_api.Ctext__type__properties__update_node) { 
										let $_text__type__properties__update_node= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["new value"] = $_text__type__properties__update_node.properties.new_value;
										return raw_data;
									}
								(<any>$_properties__update_node.properties.type.state.node))];
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
	function ($:read_api.Cinterface_notification) { 
		let $_interface_notification= $;
		var raw_data:{[key:string]:any} = {};
		switch ($_interface_notification.properties.type.state.name) {
			case 'create':
				raw_data["type"] = [$_interface_notification.properties.type.state.name, (
					function ($:read_api.Ccreate__type__interface_notification) { 
						let $_create__type__interface_notification= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["initialize node"] = serialize_initialize_node($_create__type__interface_notification.properties.initialize_node);
						return raw_data;
					}
				(<any>$_interface_notification.properties.type.state.node))];
				break;
			case 'remove':
				raw_data["type"] = [$_interface_notification.properties.type.state.name, (
					function ($:read_api.Cremove__type__interface_notification) { 
						let $_remove__type__interface_notification= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_interface_notification.properties.type.state.node))];
				break;
			case 'update':
				raw_data["type"] = [$_interface_notification.properties.type.state.name, (
					function ($:read_api.Cupdate__type__interface_notification) { 
						let $_update__type__interface_notification= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["update node"] = serialize_update_node($_update__type__interface_notification.properties.update_node);
						return raw_data;
					}
				(<any>$_interface_notification.properties.type.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		return raw_data;
	}
);