import * as read_api from "./alan_api";
let serialize_context_node_path = (
	function ($:read_api.Ccontext_node_path) { 
		let $_context_node_path= $;
		var raw_data:{[key:string]:any} = {};
		switch ($_context_node_path.properties.context.state.name) {
			case 'context node':
				raw_data["context"] = [$_context_node_path.properties.context.state.name, (
					function ($:read_api.Ccontext_node) { 
						let $_context_node= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_context_node_path.properties.context.state.node))];
				break;
			case 'parameter definition':
				raw_data["context"] = [$_context_node_path.properties.context.state.name, (
					function ($:read_api.Cparameter_definition__context) { 
						let $_parameter_definition__context= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["head"] = serialize_context_parameter_path($_parameter_definition__context.properties.head);
						switch ($_parameter_definition__context.properties.type.state.name) {
							case 'reference':
								raw_data["type"] = [$_parameter_definition__context.properties.type.state.name, (
									function ($:read_api.Creference__type__parameter_definition) { 
										let $_reference__type__parameter_definition= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["reference"] = $_reference__type__parameter_definition.properties.reference.entry;
										return raw_data;
									}
								(<any>$_parameter_definition__context.properties.type.state.node))];
								break;
							case 'state context rule':
								raw_data["type"] = [$_parameter_definition__context.properties.type.state.name, (
									function ($:read_api.Cstate_context_rule__type__parameter_definition) { 
										let $_state_context_rule__type__parameter_definition= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["rule"] = $_state_context_rule__type__parameter_definition.properties.rule.entry;
										return raw_data;
									}
								(<any>$_parameter_definition__context.properties.type.state.node))];
								break;
							default:
								throw new Error('Hmmm');
						}
						return raw_data;
					}
				(<any>$_context_node_path.properties.context.state.node))];
				break;
			case 'root':
				raw_data["context"] = [$_context_node_path.properties.context.state.name, (
					function ($:read_api.Croot) { 
						let $_root= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_context_node_path.properties.context.state.node))];
				break;
			case 'this node':
				raw_data["context"] = [$_context_node_path.properties.context.state.name, (
					function ($:read_api.Cthis_node) { 
						let $_this_node= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_context_node_path.properties.context.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		return raw_data;
	}
);
let serialize_context_parameter_path = (
	function ($:read_api.Ccontext_parameter_path) { 
		let $_context_parameter_path= $;
		var raw_data:{[key:string]:any} = {};
		switch ($_context_parameter_path.properties.has_steps.state.name) {
			case 'no':
				raw_data["has steps"] = [$_context_parameter_path.properties.has_steps.state.name, (
					function ($:read_api.Cno__has_steps__context_parameter_path) { 
						let $_no__has_steps__context_parameter_path= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_context_parameter_path.properties.has_steps.state.node))];
				break;
			case 'yes':
				raw_data["has steps"] = [$_context_parameter_path.properties.has_steps.state.name, (
					function ($:read_api.Cyes__has_steps__context_parameter_path) { 
						let $_yes__has_steps__context_parameter_path= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["tail"] = serialize_context_parameter_path($_yes__has_steps__context_parameter_path.properties.tail);
						switch ($_yes__has_steps__context_parameter_path.properties.type.state.name) {
							case 'group':
								raw_data["type"] = [$_yes__has_steps__context_parameter_path.properties.type.state.name, (
									function ($:read_api.Cgroup__type__yes__has_steps__context_parameter_path) { 
										let $_group__type__yes__has_steps__context_parameter_path= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["group"] = $_group__type__yes__has_steps__context_parameter_path.properties.group.entry;
										return raw_data;
									}
								(<any>$_yes__has_steps__context_parameter_path.properties.type.state.node))];
								break;
							case 'parent':
								raw_data["type"] = [$_yes__has_steps__context_parameter_path.properties.type.state.name, (
									function ($:read_api.Cparent__type__yes__has_steps__context_parameter_path) { 
										let $_parent__type__yes__has_steps__context_parameter_path= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_yes__has_steps__context_parameter_path.properties.type.state.node))];
								break;
							default:
								throw new Error('Hmmm');
						}
						return raw_data;
					}
				(<any>$_context_parameter_path.properties.has_steps.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		return raw_data;
	}
);
let serialize_graphs_definition = (
	function ($:read_api.Cgraphs_definition) { 
		let $_graphs_definition= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["graphs"] = (function ($) {
			var object:{[key:string]:any} = {};
			for (let [k,v] of $_graphs_definition.properties.graphs) {
				object[k] = (
					function ($:read_api.Cgraphs__graphs_definition) { 
						let $_graphs__graphs_definition= $;
						var raw_data:{[key:string]:any} = {};
						switch ($_graphs__graphs_definition.properties.type.state.name) {
							case 'acyclic':
								raw_data["type"] = [$_graphs__graphs_definition.properties.type.state.name, (
									function ($:read_api.Cacyclic) { 
										let $_acyclic= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_graphs__graphs_definition.properties.type.state.node))];
								break;
							case 'ordered':
								raw_data["type"] = [$_graphs__graphs_definition.properties.type.state.name, (
									function ($:read_api.Cordered) { 
										let $_ordered= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["ordering property"] = $_ordered.properties.ordering_property.entry;
										raw_data["path"] = serialize_node_path_tail($_ordered.properties.path);
										return raw_data;
									}
								(<any>$_graphs__graphs_definition.properties.type.state.node))];
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
let serialize_node = (
	function ($:read_api.Cnode) { 
		let $_node= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["attributes"] = (function ($) {
			var object:{[key:string]:any} = {};
			for (let [k,v] of $_node.properties.attributes) {
				object[k] = (
					function ($:read_api.Cattributes) { 
						let $_attributes= $;
						var raw_data:{[key:string]:any} = {};
						switch ($_attributes.properties.type.state.name) {
							case 'command':
								raw_data["type"] = [$_attributes.properties.type.state.name, (
									function ($:read_api.Ccommand) { 
										let $_command= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["parameters"] = serialize_parameter_definition($_command.properties.parameters);
										return raw_data;
									}
								(<any>$_attributes.properties.type.state.node))];
								break;
							case 'property':
								raw_data["type"] = [$_attributes.properties.type.state.name, (
									function ($:read_api.Cproperty) { 
										let $_property= $;
										var raw_data:{[key:string]:any} = {};
										switch ($_property.properties.type.state.name) {
											case 'collection':
												raw_data["type"] = [$_property.properties.type.state.name, (
													function ($:read_api.Ccollection__type__property) { 
														let $_collection__type__property= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["graphs"] = serialize_graphs_definition($_collection__type__property.properties.graphs);
														raw_data["key property"] = $_collection__type__property.properties.key_property.entry;
														raw_data["node"] = serialize_node($_collection__type__property.properties.node);
														return raw_data;
													}
												(<any>$_property.properties.type.state.node))];
												break;
											case 'file':
												raw_data["type"] = [$_property.properties.type.state.name, (
													function ($:read_api.Cfile__type__property) { 
														let $_file__type__property= $;
														var raw_data:{[key:string]:any} = {};
														return raw_data;
													}
												(<any>$_property.properties.type.state.node))];
												break;
											case 'group':
												raw_data["type"] = [$_property.properties.type.state.name, (
													function ($:read_api.Cgroup__type__property) { 
														let $_group__type__property= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["node"] = serialize_node($_group__type__property.properties.node);
														return raw_data;
													}
												(<any>$_property.properties.type.state.node))];
												break;
											case 'number':
												raw_data["type"] = [$_property.properties.type.state.name, (
													function ($:read_api.Cnumber__type__property) { 
														let $_number__type__property= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["type"] = serialize_number_type($_number__type__property.properties.type);
														return raw_data;
													}
												(<any>$_property.properties.type.state.node))];
												break;
											case 'state group':
												raw_data["type"] = [$_property.properties.type.state.name, (
													function ($:read_api.Cstate_group__type__property) { 
														let $_state_group__type__property= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["first state"] = $_state_group__type__property.properties.first_state.entry;
														raw_data["states"] = (function ($) {
															var object:{[key:string]:any} = {};
															for (let [k,v] of $_state_group__type__property.properties.states) {
																object[k] = (
																	function ($:read_api.Cstates__state_group__type__property) { 
																		let $_states__state_group__type__property= $;
																		var raw_data:{[key:string]:any} = {};
																		raw_data["context rules"] = serialize_where_clause($_states__state_group__type__property.properties.context_rules);
																		switch ($_states__state_group__type__property.properties.has_successor.state.name) {
																			case 'no':
																				raw_data["has successor"] = [$_states__state_group__type__property.properties.has_successor.state.name, (
																					function ($:read_api.Cno__has_successor__states__state_group__type__property) { 
																						let $_no__has_successor__states__state_group__type__property= $;
																						var raw_data:{[key:string]:any} = {};
																						return raw_data;
																					}
																				(<any>$_states__state_group__type__property.properties.has_successor.state.node))];
																				break;
																			case 'yes':
																				raw_data["has successor"] = [$_states__state_group__type__property.properties.has_successor.state.name, (
																					function ($:read_api.Cyes__has_successor__states__state_group__type__property) { 
																						let $_yes__has_successor__states__state_group__type__property= $;
																						var raw_data:{[key:string]:any} = {};
																						raw_data["successor"] = $_yes__has_successor__states__state_group__type__property.properties.successor.entry;
																						return raw_data;
																					}
																				(<any>$_states__state_group__type__property.properties.has_successor.state.node))];
																				break;
																			default:
																				throw new Error('Hmmm');
																		}
																		raw_data["node"] = serialize_node($_states__state_group__type__property.properties.node);
																		return raw_data;
																	}
																(v));
															}
															return object;
														}($));
														return raw_data;
													}
												(<any>$_property.properties.type.state.node))];
												break;
											case 'text':
												raw_data["type"] = [$_property.properties.type.state.name, (
													function ($:read_api.Ctext__type__property) { 
														let $_text__type__property= $;
														var raw_data:{[key:string]:any} = {};
														switch ($_text__type__property.properties.has_constraint.state.name) {
															case 'no':
																raw_data["has constraint"] = [$_text__type__property.properties.has_constraint.state.name, (
																	function ($:read_api.Cno__has_constraint__text__type__property) { 
																		let $_no__has_constraint__text__type__property= $;
																		var raw_data:{[key:string]:any} = {};
																		return raw_data;
																	}
																(<any>$_text__type__property.properties.has_constraint.state.node))];
																break;
															case 'yes':
																raw_data["has constraint"] = [$_text__type__property.properties.has_constraint.state.name, (
																	function ($:read_api.Cyes__has_constraint__text__type__property) { 
																		let $_yes__has_constraint__text__type__property= $;
																		var raw_data:{[key:string]:any} = {};
																		raw_data["referencer"] = serialize_referencer($_yes__has_constraint__text__type__property.properties.referencer);
																		return raw_data;
																	}
																(<any>$_text__type__property.properties.has_constraint.state.node))];
																break;
															default:
																throw new Error('Hmmm');
														}
														return raw_data;
													}
												(<any>$_property.properties.type.state.node))];
												break;
											default:
												throw new Error('Hmmm');
										}
										return raw_data;
									}
								(<any>$_attributes.properties.type.state.node))];
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
let serialize_node_path = (
	function ($:read_api.Cnode_path) { 
		let $_node_path= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["head"] = serialize_context_node_path($_node_path.properties.head);
		raw_data["tail"] = serialize_node_path_tail($_node_path.properties.tail);
		return raw_data;
	}
);
let serialize_node_path_tail = (
	function ($:read_api.Cnode_path_tail) { 
		let $_node_path_tail= $;
		var raw_data:{[key:string]:any} = {};
		switch ($_node_path_tail.properties.has_steps.state.name) {
			case 'no':
				raw_data["has steps"] = [$_node_path_tail.properties.has_steps.state.name, (
					function ($:read_api.Cno__has_steps__node_path_tail) { 
						let $_no__has_steps__node_path_tail= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_node_path_tail.properties.has_steps.state.node))];
				break;
			case 'yes':
				raw_data["has steps"] = [$_node_path_tail.properties.has_steps.state.name, (
					function ($:read_api.Cyes__has_steps__node_path_tail) { 
						let $_yes__has_steps__node_path_tail= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["tail"] = serialize_node_path_tail($_yes__has_steps__node_path_tail.properties.tail);
						switch ($_yes__has_steps__node_path_tail.properties.type.state.name) {
							case 'group':
								raw_data["type"] = [$_yes__has_steps__node_path_tail.properties.type.state.name, (
									function ($:read_api.Cgroup__type__yes__has_steps__node_path_tail) { 
										let $_group__type__yes__has_steps__node_path_tail= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["group"] = $_group__type__yes__has_steps__node_path_tail.properties.group.entry;
										return raw_data;
									}
								(<any>$_yes__has_steps__node_path_tail.properties.type.state.node))];
								break;
							case 'parent':
								raw_data["type"] = [$_yes__has_steps__node_path_tail.properties.type.state.name, (
									function ($:read_api.Cparent__type__yes__has_steps__node_path_tail) { 
										let $_parent__type__yes__has_steps__node_path_tail= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_yes__has_steps__node_path_tail.properties.type.state.node))];
								break;
							case 'reference':
								raw_data["type"] = [$_yes__has_steps__node_path_tail.properties.type.state.name, (
									function ($:read_api.Creference__type__yes) { 
										let $_reference__type__yes= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["reference"] = $_reference__type__yes.properties.reference.entry;
										return raw_data;
									}
								(<any>$_yes__has_steps__node_path_tail.properties.type.state.node))];
								break;
							case 'reference rule':
								raw_data["type"] = [$_yes__has_steps__node_path_tail.properties.type.state.name, (
									function ($:read_api.Creference_rule) { 
										let $_reference_rule= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["reference"] = $_reference_rule.properties.reference.entry;
										raw_data["rule"] = $_reference_rule.properties.rule.entry;
										return raw_data;
									}
								(<any>$_yes__has_steps__node_path_tail.properties.type.state.node))];
								break;
							case 'state':
								raw_data["type"] = [$_yes__has_steps__node_path_tail.properties.type.state.name, (
									function ($:read_api.Cstate__type) { 
										let $_state__type= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["state"] = $_state__type.properties.state.entry;
										raw_data["state group"] = $_state__type.properties.state_group.entry;
										return raw_data;
									}
								(<any>$_yes__has_steps__node_path_tail.properties.type.state.node))];
								break;
							case 'state context rule':
								raw_data["type"] = [$_yes__has_steps__node_path_tail.properties.type.state.name, (
									function ($:read_api.Cstate_context_rule__type__yes) { 
										let $_state_context_rule__type__yes= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["context rule"] = $_state_context_rule__type__yes.properties.context_rule.entry;
										return raw_data;
									}
								(<any>$_yes__has_steps__node_path_tail.properties.type.state.node))];
								break;
							default:
								throw new Error('Hmmm');
						}
						return raw_data;
					}
				(<any>$_node_path_tail.properties.has_steps.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		return raw_data;
	}
);
let serialize_number_type = (
	function ($:read_api.Cnumber_type) { 
		let $_number_type= $;
		var raw_data:{[key:string]:any} = {};
		switch ($_number_type.properties.decimal_places.state.name) {
			case 'no':
				raw_data["decimal places"] = [$_number_type.properties.decimal_places.state.name, (
					function ($:read_api.Cno__decimal_places) { 
						let $_no__decimal_places= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_number_type.properties.decimal_places.state.node))];
				break;
			case 'yes':
				raw_data["decimal places"] = [$_number_type.properties.decimal_places.state.name, (
					function ($:read_api.Cyes__decimal_places) { 
						let $_yes__decimal_places= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["places"] = $_yes__decimal_places.properties.places;
						return raw_data;
					}
				(<any>$_number_type.properties.decimal_places.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		switch ($_number_type.properties.set.state.name) {
			case 'integer':
				raw_data["set"] = [$_number_type.properties.set.state.name, (
					function ($:read_api.Cinteger) { 
						let $_integer= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_number_type.properties.set.state.node))];
				break;
			case 'natural':
				raw_data["set"] = [$_number_type.properties.set.state.name, (
					function ($:read_api.Cnatural) { 
						let $_natural= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_number_type.properties.set.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		raw_data["type"] = $_number_type.properties.type.entry;
		return raw_data;
	}
);
let serialize_parameter_definition = (
	function ($:read_api.Cparameter_definition__interface) { 
		let $_parameter_definition__interface= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["properties"] = (function ($) {
			var object:{[key:string]:any} = {};
			for (let [k,v] of $_parameter_definition__interface.properties.properties) {
				object[k] = (
					function ($:read_api.Cproperties) { 
						let $_properties= $;
						var raw_data:{[key:string]:any} = {};
						switch ($_properties.properties.type.state.name) {
							case 'collection':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Ccollection__type__properties) { 
										let $_collection__type__properties= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["key property"] = $_collection__type__properties.properties.key_property.entry;
										raw_data["parameters"] = serialize_parameter_definition($_collection__type__properties.properties.parameters);
										switch ($_collection__type__properties.properties.type.state.name) {
											case 'dense map':
												raw_data["type"] = [$_collection__type__properties.properties.type.state.name, (
													function ($:read_api.Cdense_map) { 
														let $_dense_map= $;
														var raw_data:{[key:string]:any} = {};
														return raw_data;
													}
												(<any>$_collection__type__properties.properties.type.state.node))];
												break;
											case 'simple':
												raw_data["type"] = [$_collection__type__properties.properties.type.state.name, (
													function ($:read_api.Csimple) { 
														let $_simple= $;
														var raw_data:{[key:string]:any} = {};
														return raw_data;
													}
												(<any>$_collection__type__properties.properties.type.state.node))];
												break;
											default:
												throw new Error('Hmmm');
										}
										return raw_data;
									}
								(<any>$_properties.properties.type.state.node))];
								break;
							case 'file':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Cfile__type__properties) { 
										let $_file__type__properties= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_properties.properties.type.state.node))];
								break;
							case 'group':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Cgroup__type__properties) { 
										let $_group__type__properties= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["parameters"] = serialize_parameter_definition($_group__type__properties.properties.parameters);
										return raw_data;
									}
								(<any>$_properties.properties.type.state.node))];
								break;
							case 'number':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Cnumber__type__properties) { 
										let $_number__type__properties= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["type"] = serialize_number_type($_number__type__properties.properties.type);
										return raw_data;
									}
								(<any>$_properties.properties.type.state.node))];
								break;
							case 'state group':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Cstate_group__type__properties) { 
										let $_state_group__type__properties= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["first state"] = $_state_group__type__properties.properties.first_state.entry;
										raw_data["states"] = (function ($) {
											var object:{[key:string]:any} = {};
											for (let [k,v] of $_state_group__type__properties.properties.states) {
												object[k] = (
													function ($:read_api.Cstates__state_group__type__properties) { 
														let $_states__state_group__type__properties= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["context rules"] = serialize_where_clause($_states__state_group__type__properties.properties.context_rules);
														switch ($_states__state_group__type__properties.properties.has_successor.state.name) {
															case 'no':
																raw_data["has successor"] = [$_states__state_group__type__properties.properties.has_successor.state.name, (
																	function ($:read_api.Cno__has_successor__states__state_group__type__properties) { 
																		let $_no__has_successor__states__state_group__type__properties= $;
																		var raw_data:{[key:string]:any} = {};
																		return raw_data;
																	}
																(<any>$_states__state_group__type__properties.properties.has_successor.state.node))];
																break;
															case 'yes':
																raw_data["has successor"] = [$_states__state_group__type__properties.properties.has_successor.state.name, (
																	function ($:read_api.Cyes__has_successor__states__state_group__type__properties) { 
																		let $_yes__has_successor__states__state_group__type__properties= $;
																		var raw_data:{[key:string]:any} = {};
																		raw_data["successor"] = $_yes__has_successor__states__state_group__type__properties.properties.successor.entry;
																		return raw_data;
																	}
																(<any>$_states__state_group__type__properties.properties.has_successor.state.node))];
																break;
															default:
																throw new Error('Hmmm');
														}
														raw_data["parameters"] = serialize_parameter_definition($_states__state_group__type__properties.properties.parameters);
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
							case 'text':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Ctext__type__properties) { 
										let $_text__type__properties= $;
										var raw_data:{[key:string]:any} = {};
										switch ($_text__type__properties.properties.has_constraint.state.name) {
											case 'no':
												raw_data["has constraint"] = [$_text__type__properties.properties.has_constraint.state.name, (
													function ($:read_api.Cno__has_constraint__text__type__properties) { 
														let $_no__has_constraint__text__type__properties= $;
														var raw_data:{[key:string]:any} = {};
														return raw_data;
													}
												(<any>$_text__type__properties.properties.has_constraint.state.node))];
												break;
											case 'yes':
												raw_data["has constraint"] = [$_text__type__properties.properties.has_constraint.state.name, (
													function ($:read_api.Cyes__has_constraint__text__type__properties) { 
														let $_yes__has_constraint__text__type__properties= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["referencer"] = serialize_referencer($_yes__has_constraint__text__type__properties.properties.referencer);
														switch ($_yes__has_constraint__text__type__properties.properties.type.state.name) {
															case 'existing':
																raw_data["type"] = [$_yes__has_constraint__text__type__properties.properties.type.state.name, (
																	function ($:read_api.Cexisting) { 
																		let $_existing= $;
																		var raw_data:{[key:string]:any} = {};
																		return raw_data;
																	}
																(<any>$_yes__has_constraint__text__type__properties.properties.type.state.node))];
																break;
															case 'new':
																raw_data["type"] = [$_yes__has_constraint__text__type__properties.properties.type.state.name, (
																	function ($:read_api.Cnew) { 
																		let $_new= $;
																		var raw_data:{[key:string]:any} = {};
																		return raw_data;
																	}
																(<any>$_yes__has_constraint__text__type__properties.properties.type.state.node))];
																break;
															default:
																throw new Error('Hmmm');
														}
														return raw_data;
													}
												(<any>$_text__type__properties.properties.has_constraint.state.node))];
												break;
											default:
												throw new Error('Hmmm');
										}
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
let serialize_referencer = (
	function ($:read_api.Creferencer) { 
		let $_referencer= $;
		var raw_data:{[key:string]:any} = {};
		switch ($_referencer.properties.has_tail.state.name) {
			case 'no':
				raw_data["has tail"] = [$_referencer.properties.has_tail.state.name, (
					function ($:read_api.Cno__has_tail) { 
						let $_no__has_tail= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_referencer.properties.has_tail.state.node))];
				break;
			case 'yes':
				raw_data["has tail"] = [$_referencer.properties.has_tail.state.name, (
					function ($:read_api.Cyes__has_tail) { 
						let $_yes__has_tail= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["tail"] = serialize_node_path_tail($_yes__has_tail.properties.tail);
						return raw_data;
					}
				(<any>$_referencer.properties.has_tail.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		raw_data["head"] = serialize_node_path($_referencer.properties.head);
		raw_data["rules"] = serialize_where_clause($_referencer.properties.rules);
		switch ($_referencer.properties.type.state.name) {
			case 'sibling':
				raw_data["type"] = [$_referencer.properties.type.state.name, (
					function ($:read_api.Csibling) { 
						let $_sibling= $;
						var raw_data:{[key:string]:any} = {};
						switch ($_sibling.properties.graph_participation.state.name) {
							case 'no':
								raw_data["graph participation"] = [$_sibling.properties.graph_participation.state.name, (
									function ($:read_api.Cno__graph_participation) { 
										let $_no__graph_participation= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_sibling.properties.graph_participation.state.node))];
								break;
							case 'yes':
								raw_data["graph participation"] = [$_sibling.properties.graph_participation.state.name, (
									function ($:read_api.Cyes__graph_participation) { 
										let $_yes__graph_participation= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["graphs"] = (function ($) {
											var object:{[key:string]:any} = {};
											for (let [k,v] of $_yes__graph_participation.properties.graphs) {
												object[k] = (
													function ($:read_api.Cgraphs__yes) { 
														let $_graphs__yes= $;
														var raw_data:{[key:string]:any} = {};
														return raw_data;
													}
												(v));
											}
											return object;
										}($));
										return raw_data;
									}
								(<any>$_sibling.properties.graph_participation.state.node))];
								break;
							default:
								throw new Error('Hmmm');
						}
						return raw_data;
					}
				(<any>$_referencer.properties.type.state.node))];
				break;
			case 'unrestricted':
				raw_data["type"] = [$_referencer.properties.type.state.name, (
					function ($:read_api.Cunrestricted) { 
						let $_unrestricted= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["collection"] = $_unrestricted.properties.collection.entry;
						return raw_data;
					}
				(<any>$_referencer.properties.type.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		return raw_data;
	}
);
let serialize_where_clause = (
	function ($:read_api.Cwhere_clause) { 
		let $_where_clause= $;
		var raw_data:{[key:string]:any} = {};
		switch ($_where_clause.properties.has_rule.state.name) {
			case 'no':
				raw_data["has rule"] = [$_where_clause.properties.has_rule.state.name, (
					function ($:read_api.Cno__has_rule) { 
						let $_no__has_rule= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_where_clause.properties.has_rule.state.node))];
				break;
			case 'yes':
				raw_data["has rule"] = [$_where_clause.properties.has_rule.state.name, (
					function ($:read_api.Cyes__has_rule) { 
						let $_yes__has_rule= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["first"] = $_yes__has_rule.properties.first.entry;
						return raw_data;
					}
				(<any>$_where_clause.properties.has_rule.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		raw_data["rules"] = (function ($) {
			var object:{[key:string]:any} = {};
			for (let [k,v] of $_where_clause.properties.rules) {
				object[k] = (
					function ($:read_api.Crules) { 
						let $_rules= $;
						var raw_data:{[key:string]:any} = {};
						switch ($_rules.properties.context.state.name) {
							case 'context':
								raw_data["context"] = [$_rules.properties.context.state.name, (
									function ($:read_api.Ccontext) { 
										let $_context= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["path"] = serialize_context_node_path($_context.properties.path);
										return raw_data;
									}
								(<any>$_rules.properties.context.state.node))];
								break;
							case 'sibling rule':
								raw_data["context"] = [$_rules.properties.context.state.name, (
									function ($:read_api.Csibling_rule) { 
										let $_sibling_rule= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["rule"] = $_sibling_rule.properties.rule.entry;
										return raw_data;
									}
								(<any>$_rules.properties.context.state.node))];
								break;
							default:
								throw new Error('Hmmm');
						}
						switch ($_rules.properties.has_successor.state.name) {
							case 'no':
								raw_data["has successor"] = [$_rules.properties.has_successor.state.name, (
									function ($:read_api.Cno__has_successor__rules) { 
										let $_no__has_successor__rules= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_rules.properties.has_successor.state.node))];
								break;
							case 'yes':
								raw_data["has successor"] = [$_rules.properties.has_successor.state.name, (
									function ($:read_api.Cyes__has_successor__rules) { 
										let $_yes__has_successor__rules= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["successor"] = $_yes__has_successor__rules.properties.successor.entry;
										return raw_data;
									}
								(<any>$_rules.properties.has_successor.state.node))];
								break;
							default:
								throw new Error('Hmmm');
						}
						raw_data["tail"] = serialize_node_path_tail($_rules.properties.tail);
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
	function ($:read_api.Cinterface) { 
		let $_interface= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["context keys"] = (function ($) {
			var object:{[key:string]:any} = {};
			for (let [k,v] of $_interface.properties.context_keys) {
				object[k] = (
					function ($:read_api.Ccontext_keys) { 
						let $_context_keys= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(v));
			}
			return object;
		}($));
		raw_data["numerical types"] = (function ($) {
			var object:{[key:string]:any} = {};
			for (let [k,v] of $_interface.properties.numerical_types) {
				object[k] = (
					function ($:read_api.Cnumerical_types) { 
						let $_numerical_types= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(v));
			}
			return object;
		}($));
		raw_data["root"] = serialize_node($_interface.properties.root);
		return raw_data;
	}
);