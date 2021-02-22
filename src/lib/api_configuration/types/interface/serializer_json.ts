import * as read_api from "./alan_api";
let serialize_context_node_path = (
	function ($:read_api.Ccontext_node_path) { 
		let $_context_node_path= $;
		var raw_data:{[key:string]:any} = {};
		switch ($_context_node_path.properties.context.state.name) {
			case 'dataset root':
				raw_data["context"] = [$_context_node_path.properties.context.state.name, (
					function ($:read_api.Cdataset_root) { 
						let $_dataset_root= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_context_node_path.properties.context.state.node))];
				break;
			case 'expression context':
				raw_data["context"] = [$_context_node_path.properties.context.state.name, (
					function ($:read_api.Cexpression_context) { 
						let $_expression_context= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_context_node_path.properties.context.state.node))];
				break;
			case 'this dataset node':
				raw_data["context"] = [$_context_node_path.properties.context.state.name, (
					function ($:read_api.Cthis_dataset_node) { 
						let $_this_dataset_node= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_context_node_path.properties.context.state.node))];
				break;
			case 'this parameter node':
				raw_data["context"] = [$_context_node_path.properties.context.state.name, (
					function ($:read_api.Cthis_parameter_node) { 
						let $_this_parameter_node= $;
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
let serialize_explicit_evaluation_annotation = (
	function ($:read_api.Cexplicit_evaluation_annotation) { 
		let $_explicit_evaluation_annotation= $;
		var raw_data:{[key:string]:any} = {};
		switch ($_explicit_evaluation_annotation.properties.phase.state.name) {
			case 'downstream':
				raw_data["phase"] = [$_explicit_evaluation_annotation.properties.phase.state.name, (
					function ($:read_api.Cdownstream__phase__explicit_evaluation_annotation) { 
						let $_downstream__phase__explicit_evaluation_annotation= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_explicit_evaluation_annotation.properties.phase.state.node))];
				break;
			case 'upstream':
				raw_data["phase"] = [$_explicit_evaluation_annotation.properties.phase.state.name, (
					function ($:read_api.Cupstream) { 
						let $_upstream= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_explicit_evaluation_annotation.properties.phase.state.node))];
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
						switch ($_attributes.properties.has_predecessor.state.name) {
							case 'no':
								raw_data["has predecessor"] = [$_attributes.properties.has_predecessor.state.name, (
									function ($:read_api.Cno__has_predecessor) { 
										let $_no__has_predecessor= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_attributes.properties.has_predecessor.state.node))];
								break;
							case 'yes':
								raw_data["has predecessor"] = [$_attributes.properties.has_predecessor.state.name, (
									function ($:read_api.Cyes__has_predecessor) { 
										let $_yes__has_predecessor= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["attribute"] = $_yes__has_predecessor.properties.attribute.entry;
										return raw_data;
									}
								(<any>$_attributes.properties.has_predecessor.state.node))];
								break;
							default:
								throw new Error('Hmmm');
						}
						switch ($_attributes.properties.type.state.name) {
							case 'command':
								raw_data["type"] = [$_attributes.properties.type.state.name, (
									function ($:read_api.Ccommand) { 
										let $_command= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["parameters"] = serialize_node($_command.properties.parameters);
										return raw_data;
									}
								(<any>$_attributes.properties.type.state.node))];
								break;
							case 'event':
								raw_data["type"] = [$_attributes.properties.type.state.name, (
									function ($:read_api.Cevent) { 
										let $_event= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["parameters"] = serialize_node($_event.properties.parameters);
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
													function ($:read_api.Ccollection) { 
														let $_collection= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["graphs"] = serialize_graphs_definition($_collection.properties.graphs);
														raw_data["key property"] = $_collection.properties.key_property.entry;
														raw_data["node"] = serialize_node($_collection.properties.node);
														switch ($_collection.properties.type.state.name) {
															case 'dense map':
																raw_data["type"] = [$_collection.properties.type.state.name, (
																	function ($:read_api.Cdense_map) { 
																		let $_dense_map= $;
																		var raw_data:{[key:string]:any} = {};
																		return raw_data;
																	}
																(<any>$_collection.properties.type.state.node))];
																break;
															case 'simple':
																raw_data["type"] = [$_collection.properties.type.state.name, (
																	function ($:read_api.Csimple__type) { 
																		let $_simple__type= $;
																		var raw_data:{[key:string]:any} = {};
																		return raw_data;
																	}
																(<any>$_collection.properties.type.state.node))];
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
													function ($:read_api.Cfile) { 
														let $_file= $;
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
													function ($:read_api.Cnumber) { 
														let $_number= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["type"] = serialize_number_type($_number.properties.type);
														return raw_data;
													}
												(<any>$_property.properties.type.state.node))];
												break;
											case 'state group':
												raw_data["type"] = [$_property.properties.type.state.name, (
													function ($:read_api.Cstate_group) { 
														let $_state_group= $;
														var raw_data:{[key:string]:any} = {};
														raw_data["states"] = (function ($) {
															var object:{[key:string]:any} = {};
															for (let [k,v] of $_state_group.properties.states) {
																object[k] = (
																	function ($:read_api.Cstates) { 
																		let $_states= $;
																		var raw_data:{[key:string]:any} = {};
																		raw_data["context rules"] = serialize_where_clause($_states.properties.context_rules);
																		raw_data["node"] = serialize_node($_states.properties.node);
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
													function ($:read_api.Ctext) { 
														let $_text= $;
														var raw_data:{[key:string]:any} = {};
														switch ($_text.properties.has_constraint.state.name) {
															case 'no':
																raw_data["has constraint"] = [$_text.properties.has_constraint.state.name, (
																	function ($:read_api.Cno__has_constraint) { 
																		let $_no__has_constraint= $;
																		var raw_data:{[key:string]:any} = {};
																		return raw_data;
																	}
																(<any>$_text.properties.has_constraint.state.node))];
																break;
															case 'yes':
																raw_data["has constraint"] = [$_text.properties.has_constraint.state.name, (
																	function ($:read_api.Cyes__has_constraint) { 
																		let $_yes__has_constraint= $;
																		var raw_data:{[key:string]:any} = {};
																		raw_data["referencer"] = serialize_referencer($_yes__has_constraint.properties.referencer);
																		switch ($_yes__has_constraint.properties.type.state.name) {
																			case 'existing':
																				raw_data["type"] = [$_yes__has_constraint.properties.type.state.name, (
																					function ($:read_api.Cexisting) { 
																						let $_existing= $;
																						var raw_data:{[key:string]:any} = {};
																						return raw_data;
																					}
																				(<any>$_yes__has_constraint.properties.type.state.node))];
																				break;
																			case 'nonexisting':
																				raw_data["type"] = [$_yes__has_constraint.properties.type.state.name, (
																					function ($:read_api.Cnonexisting) { 
																						let $_nonexisting= $;
																						var raw_data:{[key:string]:any} = {};
																						return raw_data;
																					}
																				(<any>$_yes__has_constraint.properties.type.state.node))];
																				break;
																			default:
																				throw new Error('Hmmm');
																		}
																		return raw_data;
																	}
																(<any>$_text.properties.has_constraint.state.node))];
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
let serialize_node_path_tail = (
	function ($:read_api.Cnode_path_tail) { 
		let $_node_path_tail= $;
		var raw_data:{[key:string]:any} = {};
		switch ($_node_path_tail.properties.has_steps.state.name) {
			case 'no':
				raw_data["has steps"] = [$_node_path_tail.properties.has_steps.state.name, (
					function ($:read_api.Cno__has_steps) { 
						let $_no__has_steps= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_node_path_tail.properties.has_steps.state.node))];
				break;
			case 'yes':
				raw_data["has steps"] = [$_node_path_tail.properties.has_steps.state.name, (
					function ($:read_api.Cyes__has_steps) { 
						let $_yes__has_steps= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["tail"] = serialize_node_path_tail($_yes__has_steps.properties.tail);
						switch ($_yes__has_steps.properties.type.state.name) {
							case 'group':
								raw_data["type"] = [$_yes__has_steps.properties.type.state.name, (
									function ($:read_api.Cgroup__type__yes) { 
										let $_group__type__yes= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["group step"] = serialize_property_step($_group__type__yes.properties.group_step);
										return raw_data;
									}
								(<any>$_yes__has_steps.properties.type.state.node))];
								break;
							case 'parent':
								raw_data["type"] = [$_yes__has_steps.properties.type.state.name, (
									function ($:read_api.Cparent) { 
										let $_parent= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_yes__has_steps.properties.type.state.node))];
								break;
							case 'reference':
								raw_data["type"] = [$_yes__has_steps.properties.type.state.name, (
									function ($:read_api.Creference__type) { 
										let $_reference__type= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["reference"] = serialize_reference_property_step($_reference__type.properties.reference);
										return raw_data;
									}
								(<any>$_yes__has_steps.properties.type.state.node))];
								break;
							case 'reference rule':
								raw_data["type"] = [$_yes__has_steps.properties.type.state.name, (
									function ($:read_api.Creference_rule) { 
										let $_reference_rule= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["reference"] = serialize_reference_property_step($_reference_rule.properties.reference);
										raw_data["rule"] = $_reference_rule.properties.rule.entry;
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
										raw_data["state group step"] = serialize_property_step($_state.properties.state_group_step);
										return raw_data;
									}
								(<any>$_yes__has_steps.properties.type.state.node))];
								break;
							case 'state context rule':
								raw_data["type"] = [$_yes__has_steps.properties.type.state.name, (
									function ($:read_api.Cstate_context_rule) { 
										let $_state_context_rule= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["context rule"] = $_state_context_rule.properties.context_rule.entry;
										return raw_data;
									}
								(<any>$_yes__has_steps.properties.type.state.node))];
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
						raw_data["places"] = $_yes__decimal_places.properties.places.value;
						return raw_data;
					}
				(<any>$_number_type.properties.decimal_places.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		raw_data["numerical type"] = $_number_type.properties.numerical_type.entry;
		switch ($_number_type.properties.type.state.name) {
			case 'bounded':
				raw_data["type"] = [$_number_type.properties.type.state.name, (
					function ($:read_api.Cbounded) { 
						let $_bounded= $;
						var raw_data:{[key:string]:any} = {};
						switch ($_bounded.properties.invert_sign.state.name) {
							case 'no':
								raw_data["invert sign"] = [$_bounded.properties.invert_sign.state.name, (
									function ($:read_api.Cno__invert_sign) { 
										let $_no__invert_sign= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_bounded.properties.invert_sign.state.node))];
								break;
							case 'yes':
								raw_data["invert sign"] = [$_bounded.properties.invert_sign.state.name, (
									function ($:read_api.Cyes__invert_sign) { 
										let $_yes__invert_sign= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_bounded.properties.invert_sign.state.node))];
								break;
							default:
								throw new Error('Hmmm');
						}
						switch ($_bounded.properties.sign.state.name) {
							case 'negative':
								raw_data["sign"] = [$_bounded.properties.sign.state.name, (
									function ($:read_api.Cnegative) { 
										let $_negative= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_bounded.properties.sign.state.node))];
								break;
							case 'positive':
								raw_data["sign"] = [$_bounded.properties.sign.state.name, (
									function ($:read_api.Cpositive) { 
										let $_positive= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_bounded.properties.sign.state.node))];
								break;
							case 'zero':
								raw_data["sign"] = [$_bounded.properties.sign.state.name, (
									function ($:read_api.Czero) { 
										let $_zero= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_bounded.properties.sign.state.node))];
								break;
							default:
								throw new Error('Hmmm');
						}
						return raw_data;
					}
				(<any>$_number_type.properties.type.state.node))];
				break;
			case 'unbounded':
				raw_data["type"] = [$_number_type.properties.type.state.name, (
					function ($:read_api.Cunbounded) { 
						let $_unbounded= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_number_type.properties.type.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		return raw_data;
	}
);
let serialize_optional_evaluation_annotation = (
	function ($:read_api.Coptional_evaluation_annotation) { 
		let $_optional_evaluation_annotation= $;
		var raw_data:{[key:string]:any} = {};
		switch ($_optional_evaluation_annotation.properties.phase.state.name) {
			case 'downstream':
				raw_data["phase"] = [$_optional_evaluation_annotation.properties.phase.state.name, (
					function ($:read_api.Cdownstream__phase__optional_evaluation_annotation) { 
						let $_downstream__phase__optional_evaluation_annotation= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_optional_evaluation_annotation.properties.phase.state.node))];
				break;
			case 'inherited':
				raw_data["phase"] = [$_optional_evaluation_annotation.properties.phase.state.name, (
					function ($:read_api.Cinherited) { 
						let $_inherited= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_optional_evaluation_annotation.properties.phase.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		return raw_data;
	}
);
let serialize_property_step = (
	function ($:read_api.Cproperty_step) { 
		let $_property_step= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["property"] = $_property_step.properties.property.entry;
		return raw_data;
	}
);
let serialize_reference_property_step = (
	function ($:read_api.Creference_property_step) { 
		let $_reference_property_step= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["property"] = serialize_property_step($_reference_property_step.properties.property);
		return raw_data;
	}
);
let serialize_referencer = (
	function ($:read_api.Creferencer) { 
		let $_referencer= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["evaluation"] = serialize_explicit_evaluation_annotation($_referencer.properties.evaluation);
		raw_data["path"] = (
			function ($:read_api.Cpath) { 
				let $_path= $;
				var raw_data:{[key:string]:any} = {};
				raw_data["head"] = serialize_context_node_path($_path.properties.head);
				raw_data["tail"] = serialize_node_path_tail($_path.properties.tail);
				return raw_data;
			}
		($_referencer.properties.path));
		raw_data["rules"] = serialize_where_clause($_referencer.properties.rules);
		raw_data["tail"] = serialize_node_path_tail($_referencer.properties.tail);
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
										switch ($_no__graph_participation.properties.support_self_reference.state.name) {
											case 'no':
												raw_data["support self reference"] = [$_no__graph_participation.properties.support_self_reference.state.name, (
													function ($:read_api.Cno__support_self_reference) { 
														let $_no__support_self_reference= $;
														var raw_data:{[key:string]:any} = {};
														return raw_data;
													}
												(<any>$_no__graph_participation.properties.support_self_reference.state.node))];
												break;
											case 'yes':
												raw_data["support self reference"] = [$_no__graph_participation.properties.support_self_reference.state.name, (
													function ($:read_api.Cyes__support_self_reference) { 
														let $_yes__support_self_reference= $;
														var raw_data:{[key:string]:any} = {};
														return raw_data;
													}
												(<any>$_no__graph_participation.properties.support_self_reference.state.node))];
												break;
											default:
												throw new Error('Hmmm');
										}
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
						raw_data["collection step"] = serialize_property_step($_unrestricted.properties.collection_step);
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
						raw_data["evaluation"] = serialize_optional_evaluation_annotation($_rules.properties.evaluation);
						switch ($_rules.properties.has_successor.state.name) {
							case 'no':
								raw_data["has successor"] = [$_rules.properties.has_successor.state.name, (
									function ($:read_api.Cno__has_successor) { 
										let $_no__has_successor= $;
										var raw_data:{[key:string]:any} = {};
										return raw_data;
									}
								(<any>$_rules.properties.has_successor.state.node))];
								break;
							case 'yes':
								raw_data["has successor"] = [$_rules.properties.has_successor.state.name, (
									function ($:read_api.Cyes__has_successor) { 
										let $_yes__has_successor= $;
										var raw_data:{[key:string]:any} = {};
										raw_data["rule"] = $_yes__has_successor.properties.rule.entry;
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