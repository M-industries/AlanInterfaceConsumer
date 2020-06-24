import * as read_api from "./alan_api";
let serialize_ancestor_parameters_selection = (
	function ($:read_api.Cancestor_parameters_selection) { 
		let $_ancestor_parameters_selection= $;
		var raw_data:{[key:string]:any} = {};
		switch ($_ancestor_parameters_selection.properties.has_steps.state.name) {
			case 'no':
				raw_data["has steps"] = [$_ancestor_parameters_selection.properties.has_steps.state.name, (
					function ($:read_api.Cno__has_steps__ancestor_parameters_selection) { 
						let $_no__has_steps__ancestor_parameters_selection= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_ancestor_parameters_selection.properties.has_steps.state.node))];
				break;
			case 'yes':
				raw_data["has steps"] = [$_ancestor_parameters_selection.properties.has_steps.state.name, (
					function ($:read_api.Cyes__has_steps__ancestor_parameters_selection) { 
						let $_yes__has_steps__ancestor_parameters_selection= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["tail"] = serialize_ancestor_parameters_selection($_yes__has_steps__ancestor_parameters_selection.properties.tail);
						switch ($_yes__has_steps__ancestor_parameters_selection.properties.type.state.name) {
							case 'matrix parent':
								raw_data["type"] = [$_yes__has_steps__ancestor_parameters_selection.properties.type.state.name, (
									function ($:read_api.Cmatrix_parent) { 
										let $_matrix_parent= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_yes__has_steps__ancestor_parameters_selection.properties.type.state.node))];
								break;
							case 'state parent':
								raw_data["type"] = [$_yes__has_steps__ancestor_parameters_selection.properties.type.state.name, (
									function ($:read_api.Cstate_parent__type__yes__has_steps__ancestor_parameters_selection) { 
										let $_state_parent__type__yes__has_steps__ancestor_parameters_selection= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_yes__has_steps__ancestor_parameters_selection.properties.type.state.node))];
								break;
							default:
								throw new Error('Hmmm');
						}
						return raw_data;
					}
				(<any>$_ancestor_parameters_selection.properties.has_steps.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		return raw_data;
	}
);
let serialize_command_parameter_referencer = (
	function ($:read_api.Ccommand_parameter_referencer) { 
		let $_command_parameter_referencer= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["collection"] = $_command_parameter_referencer.properties.collection.entry;
		switch ($_command_parameter_referencer.properties.context_type.state.name) {
			case 'command parameter':
				raw_data["context type"] = [$_command_parameter_referencer.properties.context_type.state.name, (
					function ($:read_api.Ccommand_parameter) { 
						let $_command_parameter= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["ancestor selection"] = serialize_ancestor_parameters_selection($_command_parameter.properties.ancestor_selection);
						switch ($_command_parameter.properties.type.state.name) {
							case 'key':
								raw_data["type"] = [$_command_parameter.properties.type.state.name, (
									function ($:read_api.Ckey) { 
										let $_key= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_command_parameter.properties.type.state.node))];
								break;
							case 'reference':
								raw_data["type"] = [$_command_parameter.properties.type.state.name, (
									function ($:read_api.Creference__type__command_parameter) { 
										let $_reference__type__command_parameter= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["reference"] = $_reference__type__command_parameter.properties.reference.entry;
										return raw_data;
									}
								(<any>$_command_parameter.properties.type.state.node))];
								break;
							default:
								throw new Error('Hmmm');
						}
						return raw_data;
					}
				(<any>$_command_parameter_referencer.properties.context_type.state.node))];
				break;
			case 'context node':
				raw_data["context type"] = [$_command_parameter_referencer.properties.context_type.state.name, (
					function ($:read_api.Ccontext_node) { 
						let $_context_node= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_command_parameter_referencer.properties.context_type.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		raw_data["head"] = serialize_node_selection_path($_command_parameter_referencer.properties.head);
		raw_data["tail"] = serialize_node_content_path($_command_parameter_referencer.properties.tail);
		return raw_data;
	}
);
let serialize_command_parameters = (
	function ($:read_api.Ccommand_parameters) { 
		let $_command_parameters= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["properties"] = (function ($) {
			var object:{[key:string]:any} = {};
			for (let [k,v] of $_command_parameters.properties.properties) {
				object[k] = (
					function ($:read_api.Cproperties) { 
						let $_properties= $;
						var raw_data:{[key:string]:any} = {};
						switch ($_properties.properties.type.state.name) {
							case 'file':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Cfile__type__properties) { 
										let $_file__type__properties= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_properties.properties.type.state.node))];
								break;
							case 'matrix':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Cmatrix__type__properties) { 
										let $_matrix__type__properties= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["parameters"] = serialize_command_parameters($_matrix__type__properties.properties.parameters);
										raw_data["referencer"] = serialize_command_parameter_referencer($_matrix__type__properties.properties.referencer);
										switch ($_matrix__type__properties.properties.type.state.name) {
											case 'dense':
												raw_data["type"] = [$_matrix__type__properties.properties.type.state.name, (
													function ($:read_api.Cdense) { 
														let $_dense= $;
														var raw_data:{[key:string]:any} = {};
														return raw_data;
													}
												(<any>$_matrix__type__properties.properties.type.state.node))];
												break;
											case 'sparse':
												raw_data["type"] = [$_matrix__type__properties.properties.type.state.name, (
													function ($:read_api.Csparse) { 
														let $_sparse= $;
														var raw_data:{[key:string]:any} = {};
														return raw_data;
													}
												(<any>$_matrix__type__properties.properties.type.state.node))];
												break;
											default:
												throw new Error('Hmmm');
										}
										return raw_data;
									}
								(<any>$_properties.properties.type.state.node))];
								break;
							case 'number':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Cnumber__type__properties) { 
										let $_number__type__properties= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["numerical type"] = $_number__type__properties.properties.numerical_type.entry;
										switch ($_number__type__properties.properties.set.state.name) {
											case 'integer':
												raw_data["set"] = [$_number__type__properties.properties.set.state.name, (
													function ($:read_api.Cinteger__set__number__type__properties) { 
														let $_integer__set__number__type__properties= $;
														var raw_data:{[key:string]:any} = {};
														return raw_data;
													}
												(<any>$_number__type__properties.properties.set.state.node))];
												break;
											case 'natural':
												raw_data["set"] = [$_number__type__properties.properties.set.state.name, (
													function ($:read_api.Cnatural__set__number__type__properties) { 
														let $_natural__set__number__type__properties= $;
														var raw_data:{[key:string]:any} = {};
														return raw_data;
													}
												(<any>$_number__type__properties.properties.set.state.node))];
												break;
											default:
												throw new Error('Hmmm');
										}
										return raw_data;
									}
								(<any>$_properties.properties.type.state.node))];
								break;
							case 'reference':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Creference__type__properties) { 
										let $_reference__type__properties= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["referencer"] = serialize_command_parameter_referencer($_reference__type__properties.properties.referencer);
										return raw_data;
									}
								(<any>$_properties.properties.type.state.node))];
								break;
							case 'state group':
								raw_data["type"] = [$_properties.properties.type.state.name, (
									function ($:read_api.Cstate_group__type__properties) { 
										let $_state_group__type__properties= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["states"] = (function ($) {
											var object:{[key:string]:any} = {};
											for (let [k,v] of $_state_group__type__properties.properties.states) {
												object[k] = (
													function ($:read_api.Cstates__state_group__type__properties) { 
														let $_states__state_group__type__properties= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["parameters"] = serialize_command_parameters($_states__state_group__type__properties.properties.parameters);
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
										raw_data["parameters"] = serialize_command_parameters($_command.properties.parameters);
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
														raw_data["node"] = serialize_node($_collection__type__property.properties.node);
														switch ($_collection__type__property.properties.type.state.name) {
															case 'dictionary':
																raw_data["type"] = [$_collection__type__property.properties.type.state.name, (
																	function ($:read_api.Cdictionary) { 
																		let $_dictionary= $;
																		var raw_data:{[key:string]:any} = {};
																		return raw_data;
																	}
																(<any>$_collection__type__property.properties.type.state.node))];
																break;
															case 'matrix':
																raw_data["type"] = [$_collection__type__property.properties.type.state.name, (
																	function ($:read_api.Cmatrix__type__collection) { 
																		let $_matrix__type__collection= $;
																		var raw_data:{[key:string]:any} = {};
																		raw_data["referencer"] = serialize_referencer($_matrix__type__collection.properties.referencer);
																		return raw_data;
																	}
																(<any>$_collection__type__property.properties.type.state.node))];
																break;
															default:
																throw new Error('Hmmm');
														}
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
														switch ($_number__type__property.properties.set.state.name) {
															case 'integer':
																raw_data["set"] = [$_number__type__property.properties.set.state.name, (
																	function ($:read_api.Cinteger__set__number__type__property) { 
																		let $_integer__set__number__type__property= $;
																		var raw_data:{[key:string]:any} = {};
																		return raw_data;
																	}
																(<any>$_number__type__property.properties.set.state.node))];
																break;
															case 'natural':
																raw_data["set"] = [$_number__type__property.properties.set.state.name, (
																	function ($:read_api.Cnatural__set__number__type__property) { 
																		let $_natural__set__number__type__property= $;
																		var raw_data:{[key:string]:any} = {};
																		return raw_data;
																	}
																(<any>$_number__type__property.properties.set.state.node))];
																break;
															default:
																throw new Error('Hmmm');
														}
														raw_data["type"] = $_number__type__property.properties.type.entry;
														return raw_data;
													}
												(<any>$_property.properties.type.state.node))];
												break;
											case 'reference':
												raw_data["type"] = [$_property.properties.type.state.name, (
													function ($:read_api.Creference__type__property) { 
														let $_reference__type__property= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["referencer"] = serialize_referencer($_reference__type__property.properties.referencer);
														return raw_data;
													}
												(<any>$_property.properties.type.state.node))];
												break;
											case 'state group':
												raw_data["type"] = [$_property.properties.type.state.name, (
													function ($:read_api.Cstate_group__type__property) { 
														let $_state_group__type__property= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["output parameters"] = (function ($) {
															var object:{[key:string]:any} = {};
															for (let [k,v] of $_state_group__type__property.properties.output_parameters) {
																object[k] = (
																	function ($:read_api.Coutput_parameters) { 
																		let $_output_parameters= $;
																		var raw_data:{[key:string]:any} = {};
																		raw_data["node selection"] = serialize_node_type_path($_output_parameters.properties.node_selection);
																		return raw_data;
																	}
																(v));
															}
															return object;
														}($));
														raw_data["states"] = (function ($) {
															var object:{[key:string]:any} = {};
															for (let [k,v] of $_state_group__type__property.properties.states) {
																object[k] = (
																	function ($:read_api.Cstates__state_group__type__property) { 
																		let $_states__state_group__type__property= $;
																		var raw_data:{[key:string]:any} = {};
																		raw_data["node"] = serialize_node($_states__state_group__type__property.properties.node);
																		raw_data["output arguments"] = (function ($) {
																			var object:{[key:string]:any} = {};
																			for (let [k,v] of $_states__state_group__type__property.properties.output_arguments) {
																				object[k] = (
																					function ($:read_api.Coutput_arguments) { 
																						let $_output_arguments= $;
																						var raw_data:{[key:string]:any} = {};
																						raw_data["path"] = serialize_node_selection_path($_output_arguments.properties.path);
																						return raw_data;
																					}
																				(v));
																			}
																			return object;
																		}($));
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
let serialize_node_content_path = (
	function ($:read_api.Cnode_content_path) { 
		let $_node_content_path= $;
		var raw_data:{[key:string]:any} = {};
		switch ($_node_content_path.properties.has_steps.state.name) {
			case 'no':
				raw_data["has steps"] = [$_node_content_path.properties.has_steps.state.name, (
					function ($:read_api.Cno__has_steps__node_content_path) { 
						let $_no__has_steps__node_content_path= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_node_content_path.properties.has_steps.state.node))];
				break;
			case 'yes':
				raw_data["has steps"] = [$_node_content_path.properties.has_steps.state.name, (
					function ($:read_api.Cyes__has_steps__node_content_path) { 
						let $_yes__has_steps__node_content_path= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["tail"] = serialize_node_content_path($_yes__has_steps__node_content_path.properties.tail);
						switch ($_yes__has_steps__node_content_path.properties.type.state.name) {
							case 'group':
								raw_data["type"] = [$_yes__has_steps__node_content_path.properties.type.state.name, (
									function ($:read_api.Cgroup__type__yes__has_steps__node_content_path) { 
										let $_group__type__yes__has_steps__node_content_path= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["group"] = $_group__type__yes__has_steps__node_content_path.properties.group.entry;
										return raw_data;
									}
								(<any>$_yes__has_steps__node_content_path.properties.type.state.node))];
								break;
							case 'state':
								raw_data["type"] = [$_yes__has_steps__node_content_path.properties.type.state.name, (
									function ($:read_api.Cstate__type__yes__has_steps__node_content_path) { 
										let $_state__type__yes__has_steps__node_content_path= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["state"] = $_state__type__yes__has_steps__node_content_path.properties.state.entry;
										raw_data["state group"] = $_state__type__yes__has_steps__node_content_path.properties.state_group.entry;
										return raw_data;
									}
								(<any>$_yes__has_steps__node_content_path.properties.type.state.node))];
								break;
							default:
								throw new Error('Hmmm');
						}
						return raw_data;
					}
				(<any>$_node_content_path.properties.has_steps.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		return raw_data;
	}
);
let serialize_node_selection_path = (
	function ($:read_api.Cnode_selection_path) { 
		let $_node_selection_path= $;
		var raw_data:{[key:string]:any} = {};
		switch ($_node_selection_path.properties.has_steps.state.name) {
			case 'no':
				raw_data["has steps"] = [$_node_selection_path.properties.has_steps.state.name, (
					function ($:read_api.Cno__has_steps__node_selection_path) { 
						let $_no__has_steps__node_selection_path= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_node_selection_path.properties.has_steps.state.node))];
				break;
			case 'yes':
				raw_data["has steps"] = [$_node_selection_path.properties.has_steps.state.name, (
					function ($:read_api.Cyes__has_steps__node_selection_path) { 
						let $_yes__has_steps__node_selection_path= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["tail"] = serialize_node_selection_path($_yes__has_steps__node_selection_path.properties.tail);
						switch ($_yes__has_steps__node_selection_path.properties.type.state.name) {
							case 'collection parent':
								raw_data["type"] = [$_yes__has_steps__node_selection_path.properties.type.state.name, (
									function ($:read_api.Ccollection_parent) { 
										let $_collection_parent= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_yes__has_steps__node_selection_path.properties.type.state.node))];
								break;
							case 'group':
								raw_data["type"] = [$_yes__has_steps__node_selection_path.properties.type.state.name, (
									function ($:read_api.Cgroup__type__yes__has_steps__node_selection_path) { 
										let $_group__type__yes__has_steps__node_selection_path= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["group"] = $_group__type__yes__has_steps__node_selection_path.properties.group.entry;
										return raw_data;
									}
								(<any>$_yes__has_steps__node_selection_path.properties.type.state.node))];
								break;
							case 'group parent':
								raw_data["type"] = [$_yes__has_steps__node_selection_path.properties.type.state.name, (
									function ($:read_api.Cgroup_parent) { 
										let $_group_parent= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_yes__has_steps__node_selection_path.properties.type.state.node))];
								break;
							case 'matrix key':
								raw_data["type"] = [$_yes__has_steps__node_selection_path.properties.type.state.name, (
									function ($:read_api.Cmatrix_key) { 
										let $_matrix_key= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_yes__has_steps__node_selection_path.properties.type.state.node))];
								break;
							case 'reference':
								raw_data["type"] = [$_yes__has_steps__node_selection_path.properties.type.state.name, (
									function ($:read_api.Creference__type__yes) { 
										let $_reference__type__yes= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["reference"] = $_reference__type__yes.properties.reference.entry;
										return raw_data;
									}
								(<any>$_yes__has_steps__node_selection_path.properties.type.state.node))];
								break;
							case 'state group output parameter':
								raw_data["type"] = [$_yes__has_steps__node_selection_path.properties.type.state.name, (
									function ($:read_api.Cstate_group_output_parameter) { 
										let $_state_group_output_parameter= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["output parameter"] = $_state_group_output_parameter.properties.output_parameter.entry;
										raw_data["state group"] = $_state_group_output_parameter.properties.state_group.entry;
										return raw_data;
									}
								(<any>$_yes__has_steps__node_selection_path.properties.type.state.node))];
								break;
							case 'state parent':
								raw_data["type"] = [$_yes__has_steps__node_selection_path.properties.type.state.name, (
									function ($:read_api.Cstate_parent__type__yes__has_steps__node_selection_path) { 
										let $_state_parent__type__yes__has_steps__node_selection_path= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_yes__has_steps__node_selection_path.properties.type.state.node))];
								break;
							default:
								throw new Error('Hmmm');
						}
						return raw_data;
					}
				(<any>$_node_selection_path.properties.has_steps.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		return raw_data;
	}
);
let serialize_node_type_path = (
	function ($:read_api.Cnode_type_path) { 
		let $_node_type_path= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["steps"] = serialize_node_type_path_step($_node_type_path.properties.steps);
		return raw_data;
	}
);
let serialize_node_type_path_step = (
	function ($:read_api.Cnode_type_path_step) { 
		let $_node_type_path_step= $;
		var raw_data:{[key:string]:any} = {};
		switch ($_node_type_path_step.properties.has_steps.state.name) {
			case 'no':
				raw_data["has steps"] = [$_node_type_path_step.properties.has_steps.state.name, (
					function ($:read_api.Cno__has_steps__node_type_path_step) { 
						let $_no__has_steps__node_type_path_step= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_node_type_path_step.properties.has_steps.state.node))];
				break;
			case 'yes':
				raw_data["has steps"] = [$_node_type_path_step.properties.has_steps.state.name, (
					function ($:read_api.Cyes__has_steps__node_type_path_step) { 
						let $_yes__has_steps__node_type_path_step= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["tail"] = serialize_node_type_path_step($_yes__has_steps__node_type_path_step.properties.tail);
						switch ($_yes__has_steps__node_type_path_step.properties.type.state.name) {
							case 'collection':
								raw_data["type"] = [$_yes__has_steps__node_type_path_step.properties.type.state.name, (
									function ($:read_api.Ccollection__type__yes) { 
										let $_collection__type__yes= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["collection"] = $_collection__type__yes.properties.collection.entry;
										return raw_data;
									}
								(<any>$_yes__has_steps__node_type_path_step.properties.type.state.node))];
								break;
							case 'group':
								raw_data["type"] = [$_yes__has_steps__node_type_path_step.properties.type.state.name, (
									function ($:read_api.Cgroup__type__yes__has_steps__node_type_path_step) { 
										let $_group__type__yes__has_steps__node_type_path_step= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["group"] = $_group__type__yes__has_steps__node_type_path_step.properties.group.entry;
										return raw_data;
									}
								(<any>$_yes__has_steps__node_type_path_step.properties.type.state.node))];
								break;
							case 'state':
								raw_data["type"] = [$_yes__has_steps__node_type_path_step.properties.type.state.name, (
									function ($:read_api.Cstate__type__yes__has_steps__node_type_path_step) { 
										let $_state__type__yes__has_steps__node_type_path_step= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["state"] = $_state__type__yes__has_steps__node_type_path_step.properties.state.entry;
										raw_data["state group"] = $_state__type__yes__has_steps__node_type_path_step.properties.state_group.entry;
										return raw_data;
									}
								(<any>$_yes__has_steps__node_type_path_step.properties.type.state.node))];
								break;
							default:
								throw new Error('Hmmm');
						}
						return raw_data;
					}
				(<any>$_node_type_path_step.properties.has_steps.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		return raw_data;
	}
);
let serialize_referencer = (
	function ($:read_api.Creferencer) { 
		let $_referencer= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["collection"] = $_referencer.properties.collection.entry;
		raw_data["head"] = serialize_node_selection_path($_referencer.properties.head);
		raw_data["tail"] = serialize_node_content_path($_referencer.properties.tail);
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
						switch ($_numerical_types.properties.has_factor.state.name) {
							case 'no':
								raw_data["has factor"] = [$_numerical_types.properties.has_factor.state.name, (
									function ($:read_api.Cno__has_factor) { 
										let $_no__has_factor= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_numerical_types.properties.has_factor.state.node))];
								break;
							case 'yes':
								raw_data["has factor"] = [$_numerical_types.properties.has_factor.state.name, (
									function ($:read_api.Cyes__has_factor) { 
										let $_yes__has_factor= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["base"] = $_yes__has_factor.properties.base;
										raw_data["exponent"] = $_yes__has_factor.properties.exponent;
										return raw_data;
									}
								(<any>$_numerical_types.properties.has_factor.state.node))];
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
		raw_data["root"] = serialize_node($_interface.properties.root);
		return raw_data;
	}
);