import * as interface_resolver from "./reference_resolver";
import * as interface from "./read_api";
function switchResolutionStatus(reference_property, context, key, onResolved, onError) {
	let must_resolve = false;
	switch (reference_property.resolution_status) {
		case 'resolving':
			onError({
				message: 'Circular reference!',
				path: context.getPath(),
				entry: key
			});
			onResolved(true);
			break;
		case 'error':
			onResolved(true);
			break;
		case 'resolved':
			if (!reference_property.referenced_node) throw new Error('Implementation error!');
			onResolved(null, reference_property.referenced_node);
			break;
		case 'unresolved':
			reference_property.resolution_status = 'resolving';
			must_resolve = true;
			break;
	}
	return must_resolve;
}
function checkCollectionEntry(reference, $context, entry_context, entry_collection:string, onResolved, onError) {
	var entry = entry_context.properties[entry_collection].entries[reference.entry];
	if (entry) { return entry; }
	onError({
		message: 'Referenced entry not found!',
		path: $context.getPath(),
		entry: reference.entry,
		"entry suggestions": Object.keys(entry_context.properties[entry_collection].entries),
		"referenced path": entry_context.getPath() + '.' + entry_collection
	});
	reference.resolution_status = 'error';
	onResolved(true);
}
function checkPluralInputParameterEntry(reference,  $context, input_parameters_context, input_parameter:string, onResolved, onError) {
	var entry = input_parameters_context[reference.entry]; 
	if (entry) { return entry; }
	onError({
		message: 'Referenced entry not found!',
		path: $context.getPath(),
		entry: reference.entry,
		"entry suggestions": Object.keys(input_parameters_context),
		"referenced path": '&' + input_parameter
	});
	reference.resolution_status = 'error';
	onResolved(true);
}
function checkConstraint($referencee, $referencer, $context, reference, onResolved, onError) {
	if ($referencee === $referencer) { return true; }
	onError({
		message: 'Unexpected type!',
		path: $context.getPath(),
		actual: $referencer.getPath(),
		expected: $referencee.getPath()
	});
	reference.resolution_status = 'error';
	onResolved(true);
}
function checkStateConstraint(reference, state_context, state_group_property:string, expected_state:string, $context, onResolved, onError) {
	let actual_state = state_context.properties[state_group_property].state.name;
	if (actual_state === expected_state) { return true; }
	onError({
		message: 'Constraint violation!',
		path: $context.getPath(),
		"Expected state": expected_state,
		"Actual state": actual_state,
		"referenced path": state_context.getPath() + '?' + state_group_property
	});
	reference.resolution_result = 'error';
	onResolved(true);
}
function checkEntryContentStateStep(reference, state_context, state_group_property:string, expected_state:string, $context, onResolved, onError) {
	let actual_state = state_context.properties[state_group_property].state.name;
	if (actual_state === expected_state) { return true; }
	onError({
		message: 'Entry content path, wrong step type!',
		path: $context.getPath(),
		"Expected state": expected_state,
		"Actual state": actual_state,
		"referenced path": state_context.getPath() + '?' + state_group_property
	});
	reference.resolution_result = 'error';
	onResolved(true);
}
function checkLocationConstraint(reference, location_context, expected_type, expected_type_path:string, $context, path_step:string, onResolved, onError) {
	if (location_context.location instanceof expected_type) { return true; }
	onError({
		message: 'Constraint violation!',
		path: $context.getPath(),
		"Actual context": location_context.location.type_path,
		"Expected type": expected_type_path,
		"referenced path": location_context.getPath() + '~' + path_step
	});
	reference.resolution_result = 'error';
	onResolved(true);
}
function setReference(reference, referencee) {
	reference.referenced_node = referencee;
	reference.resolution_status = 'resolved';
}
function setReferenceWithCounter(reference, referencee) {
	referencee.reference_count += 1;
	setReference(reference, referencee);
}
export function imp_resolveStateOutputParameter__has_factor__numerical_types(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__has_factor__numerical_types[param];
	var $state_group = data.properties.has_factor;
	switch (param) {
		default:
			onResolved(true);
	}
};
export function resolveComponentOutputParameter_ancestor_parameters_selection(data, param, onResolved, onError) {
	var $param_context = data;
	var $param_data = data.output_parameters[param];
	switch (param) {
		case "result parameters":
			if (switchResolutionStatus($param_data, data, 'result parameters', onResolved, onError)) {
				interface_resolver.imp_resolveStateOutputParameter__has_steps__ancestor_parameters_selection(data, "result parameters", function (err, $_sgo_ancestor_parameters_selection) {
					if (err) {
						$param_data.resolution_status = 'error';
						onResolved(true)
					} else {
						$_sgo_ancestor_parameters_selection.reference_selections_count += 1;
						setReference($param_data, $_sgo_ancestor_parameters_selection);
						onResolved(null, $_sgo_ancestor_parameters_selection);
					}
				}, onError);
			}
		break;
		default:
			onResolved(true)
	}
}
export function imp_resolveStateOutputParameter__type__yes__has_steps__ancestor_parameters_selection(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__type__yes__has_steps__ancestor_parameters_selection[param];
	var $state_group = data.properties.type;
	switch (param) {
		case "result parameters":
			if (switchResolutionStatus($param_data, data, param, onResolved, onError)) {
				switch ($state_group.state.name) {
					case "matrix parent":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_parameters__matrix_parent($state_group.state.node, onResolved, onError);
						break;
					case "state parent":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_parameters__state_parent__type__yes__has_steps__ancestor_parameters_selection($state_group.state.node, onResolved, onError);
						break;
					default:
						onResolved(true);
				}
			}
		break;
		default:
			onResolved(true);
	}
};
function imp_resolveStateOutputArgument__result_parameters__matrix_parent(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__type__yes__has_steps__ancestor_parameters_selection['result parameters'];
	interface_resolver.imp_resolveStateContextValue__matrix__matrix_parent($state_data, function (err, $_scv_matrix) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_scv_matrix.parent.parent);
			onResolved(null, $_scv_matrix.parent.parent);
		}
	}, onError);
};
export function imp_resolveStateContextValue__matrix__matrix_parent(data, onResolved, onError) {
	var $state_context_value = data.state_context_values["matrix"];
	if (switchResolutionStatus($state_context_value, data, 'matrix', onResolved, onError)) {
		data.parent.parent.imp_resolveInputParameter("context parameters", function (err, $_i_param_context_parameters) {
			if (err) {
				$state_context_value.resolution_status = 'error';
				onResolved(true)
			} else {
				if (checkLocationConstraint($state_context_value, $_i_param_context_parameters, interface.Cmatrix__type__properties, "interface.Cmatrix__type__properties", data, 'parameters', onResolved, onError)) {
					setReference($state_context_value, $_i_param_context_parameters.location);
					onResolved(null, $state_context_value.referenced_node);

				}
			}
		}, onError);
	}
};
function imp_resolveStateOutputArgument__result_parameters__state_parent__type__yes__has_steps__ancestor_parameters_selection(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__type__yes__has_steps__ancestor_parameters_selection['result parameters'];
	interface_resolver.imp_resolveStateContextValue__state__state_parent__type__yes__has_steps__ancestor_parameters_selection($state_data, function (err, $_scv_state) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_scv_state.parent.parent.parent);
			onResolved(null, $_scv_state.parent.parent.parent);
		}
	}, onError);
};
export function imp_resolveStateContextValue__state__state_parent__type__yes__has_steps__ancestor_parameters_selection(data, onResolved, onError) {
	var $state_context_value = data.state_context_values["state"];
	if (switchResolutionStatus($state_context_value, data, 'state', onResolved, onError)) {
		data.parent.parent.imp_resolveInputParameter("context parameters", function (err, $_i_param_context_parameters) {
			if (err) {
				$state_context_value.resolution_status = 'error';
				onResolved(true)
			} else {
				if (checkLocationConstraint($state_context_value, $_i_param_context_parameters, interface.Cstates__state_group__type__properties, "interface.Cstates__state_group__type__properties", data, 'parameters', onResolved, onError)) {
					setReference($state_context_value, $_i_param_context_parameters.location);
					onResolved(null, $state_context_value.referenced_node);

				}
			}
		}, onError);
	}
};
export function imp_resolveStateOutputParameter__has_steps__ancestor_parameters_selection(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__has_steps__ancestor_parameters_selection[param];
	var $state_group = data.properties.has_steps;
	switch (param) {
		case "result parameters":
			if (switchResolutionStatus($param_data, data, param, onResolved, onError)) {
				switch ($state_group.state.name) {
					case "no":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_parameters__no__has_steps__ancestor_parameters_selection($state_group.state.node, onResolved, onError);
						break;
					case "yes":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_parameters__yes__has_steps__ancestor_parameters_selection($state_group.state.node, onResolved, onError);
						break;
					default:
						onResolved(true);
				}
			}
		break;
		default:
			onResolved(true);
	}
};
function imp_resolveStateOutputArgument__result_parameters__no__has_steps__ancestor_parameters_selection(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__has_steps__ancestor_parameters_selection['result parameters'];
	$state_data.parent.imp_resolveInputParameter("context parameters", function (err, $_i_param_context_parameters) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_i_param_context_parameters);
			onResolved(null, $_i_param_context_parameters);
		}
	}, onError);
};
function imp_resolveStateOutputArgument__result_parameters__yes__has_steps__ancestor_parameters_selection(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__has_steps__ancestor_parameters_selection['result parameters'];
	interface_resolver.resolveComponentOutputParameter_ancestor_parameters_selection($state_data.properties["tail"],"result parameters", function (err, $_cto_param_result_parameters) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_cto_param_result_parameters);
			onResolved(null, $_cto_param_result_parameters);
		}
	}, onError);
};
export function resolveComponentOutputParameter_command_parameter_referencer(data, param, onResolved, onError) {
	var $param_context = data;
	var $param_data = data.output_parameters[param];
	switch (param) {
		case "referenced node":
			if (switchResolutionStatus($param_data, data, 'referenced node', onResolved, onError)) {
				interface_resolver.resolveComponentOutputParameter_node_content_path(data.properties["tail"],"result interface node", function (err, $_cto_param_result_interface_node) {
					if (err) {
						$param_data.resolution_status = 'error';
						onResolved(true)
					} else {
						setReference($param_data, $_cto_param_result_interface_node);
						onResolved(null, $_cto_param_result_interface_node);
					}
				}, onError);
			}
		break;
		default:
			onResolved(true)
	}
}
export function imp_resolveStateOutputParameter__type__command_parameter(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__type__command_parameter[param];
	var $state_group = data.properties.type;
	switch (param) {
		case "result node":
			if (switchResolutionStatus($param_data, data, param, onResolved, onError)) {
				switch ($state_group.state.name) {
					case "key":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_node__key($state_group.state.node, onResolved, onError);
						break;
					case "reference":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_node__reference__type__command_parameter($state_group.state.node, onResolved, onError);
						break;
					default:
						onResolved(true);
				}
			}
		break;
		default:
			onResolved(true);
	}
};
function imp_resolveStateOutputArgument__result_node__key(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__type__command_parameter['result node'];
	interface_resolver.imp_resolveStateContextValue__matrix__key($state_data, function (err, $_scv_matrix) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			interface_resolver.resolveComponentOutputParameter_command_parameter_referencer($_scv_matrix.properties["referencer"],"referenced node", function (err, $_cto_param_referenced_node) {
				if (err) {
					$param_data.resolution_status = 'error';
					onResolved(true);
				} else {
					setReference($param_data, $_cto_param_referenced_node);
					onResolved(null, $_cto_param_referenced_node);
				}
			}, onError);
		}
	}, onError);
};
export function imp_resolveStateContextValue__matrix__key(data, onResolved, onError) {
	var $state_context_value = data.state_context_values["matrix"];
	if (switchResolutionStatus($state_context_value, data, 'matrix', onResolved, onError)) {
		interface_resolver.resolveComponentOutputParameter_ancestor_parameters_selection(data.parent.properties["ancestor_selection"],"result parameters", function (err, $_cto_param_result_parameters) {
			if (err) {
				$state_context_value.resolution_status = 'error';
				onResolved(true)
			} else {
				if (checkLocationConstraint($state_context_value, $_cto_param_result_parameters, interface.Cmatrix__type__properties, "interface.Cmatrix__type__properties", data, 'parameters', onResolved, onError)) {
					setReference($state_context_value, $_cto_param_result_parameters.location);
					onResolved(null, $state_context_value.referenced_node);

				}
			}
		}, onError);
	}
};
function imp_resolveStateOutputArgument__result_node__reference__type__command_parameter(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__type__command_parameter['result node'];
	interface_resolver.imp_resolve_reference__reference__reference__type__command_parameter($state_data, function (err, $_ref_reference__type__command_parameter) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			interface_resolver.resolveComponentOutputParameter_command_parameter_referencer($_ref_reference__type__command_parameter.properties["referencer"],"referenced node", function (err, $_cto_param_referenced_node) {
				if (err) {
					$param_data.resolution_status = 'error';
					onResolved(true);
				} else {
					setReference($param_data, $_cto_param_referenced_node);
					onResolved(null, $_cto_param_referenced_node);
				}
			}, onError);
		}
	}, onError);
};
export function imp_resolve_reference__reference__reference__type__command_parameter (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.reference, data, 'TODO!', onResolved, onError)) {
		interface_resolver.resolveComponentOutputParameter_ancestor_parameters_selection($context.parent.properties["ancestor_selection"],"result parameters", function (err, $_cto_param_result_parameters) {
			if (err) {
				data.properties.reference.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.reference, $context, $_cto_param_result_parameters, 'properties', onResolved, onError)) {
					if (checkEntryContentStateStep(data.properties.reference, entry, "type", "reference", data, onResolved, onError)) {
						var resolution_result = entry.properties.type.state.node;
						setReferenceWithCounter(data.properties.reference, resolution_result);
						onResolved(null, resolution_result);

					}
				}
			}
		}, onError);
	}
}
export function imp_resolve_reference__collection__command_parameter_referencer (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.collection, data, 'TODO!', onResolved, onError)) {
		interface_resolver.resolveComponentOutputParameter_node_selection_path($context.properties["head"],"result interface node", function (err, $_cto_param_result_interface_node) {
			if (err) {
				data.properties.collection.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.collection, $context, $_cto_param_result_interface_node, 'attributes', onResolved, onError)) {
					if (checkEntryContentStateStep(data.properties.collection, entry, "type", "property", data, onResolved, onError)) {
						if (checkEntryContentStateStep(data.properties.collection, entry.properties.type.state.node, "type", "collection", data, onResolved, onError)) {
							var resolution_result = entry.properties.type.state.node.properties.type.state.node;
							setReferenceWithCounter(data.properties.collection, resolution_result);
							onResolved(null, resolution_result);

						}

					}
				}
			}
		}, onError);
	}
}
export function imp_resolveStateOutputParameter__context_type__command_parameter_referencer(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__context_type__command_parameter_referencer[param];
	var $state_group = data.properties.context_type;
	switch (param) {
		case "result node":
			if (switchResolutionStatus($param_data, data, param, onResolved, onError)) {
				switch ($state_group.state.name) {
					case "command parameter":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_node__command_parameter($state_group.state.node, onResolved, onError);
						break;
					case "context node":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_node__context_node($state_group.state.node, onResolved, onError);
						break;
					default:
						onResolved(true);
				}
			}
		break;
		default:
			onResolved(true);
	}
};
function imp_resolveStateOutputArgument__result_node__command_parameter(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__context_type__command_parameter_referencer['result node'];
	interface_resolver.imp_resolveStateOutputParameter__type__command_parameter($state_data, "result node", function (err, $_sgo_command_parameter) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			$_sgo_command_parameter.reference_selections_count += 1;
			setReference($param_data, $_sgo_command_parameter);
			onResolved(null, $_sgo_command_parameter);
		}
	}, onError);
};
function imp_resolveStateOutputArgument__result_node__context_node(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__context_type__command_parameter_referencer['result node'];
	$state_data.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_i_param_context_node);
			onResolved(null, $_i_param_context_node);
		}
	}, onError);
};
export function resolveComponentOutputParameter_command_parameters(data, param, onResolved, onError) {
	var $param_context = data;
	var $param_data = data.output_parameters[param];
	switch (param) {
		default:
			onResolved(true)
	}
}
export function imp_resolveStateOutputParameter__type__properties(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__type__properties[param];
	var $state_group = data.properties.type;
	switch (param) {
		default:
			onResolved(true);
	}
};
export function imp_resolveStateOutputParameter__type__matrix__type__properties(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__type__matrix__type__properties[param];
	var $state_group = data.properties.type;
	switch (param) {
		default:
			onResolved(true);
	}
};
export function imp_resolve_reference__numerical_type__number__type__properties (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.numerical_type, data, 'TODO!', onResolved, onError)) {
		$context.parent.parent.imp_resolveInputParameter("interface", function (err, $_i_param_interface) {
			if (err) {
				data.properties.numerical_type.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.numerical_type, $context, $_i_param_interface, 'numerical_types', onResolved, onError)) {
					var resolution_result = entry;
					setReferenceWithCounter(data.properties.numerical_type, resolution_result);
					onResolved(null, resolution_result);
				}
			}
		}, onError);
	}
}
export function imp_resolveStateOutputParameter__set__number__type__properties(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__set__number__type__properties[param];
	var $state_group = data.properties.set;
	switch (param) {
		default:
			onResolved(true);
	}
};
export function resolveComponentOutputParameter_node(data, param, onResolved, onError) {
	var $param_context = data;
	var $param_data = data.output_parameters[param];
	switch (param) {
		default:
			onResolved(true)
	}
}
export function imp_resolveStateOutputParameter__type__attributes(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__type__attributes[param];
	var $state_group = data.properties.type;
	switch (param) {
		default:
			onResolved(true);
	}
};
export function imp_resolveStateOutputParameter__type__property(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__type__property[param];
	var $state_group = data.properties.type;
	switch (param) {
		default:
			onResolved(true);
	}
};
export function imp_resolveStateOutputParameter__type__collection__type__property(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__type__collection__type__property[param];
	var $state_group = data.properties.type;
	switch (param) {
		default:
			onResolved(true);
	}
};
export function imp_resolve_reference__type__component (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.type, data, 'TODO!', onResolved, onError)) {
		$context.parent.parent.parent.imp_resolveInputParameter("interface", function (err, $_i_param_interface) {
			if (err) {
				data.properties.type.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.type, $context, $_i_param_interface, 'component_types', onResolved, onError)) {
					var resolution_result = entry;
					setReferenceWithCounter(data.properties.type, resolution_result);
					onResolved(null, resolution_result);
				}
			}
		}, onError);
	}
}
export function imp_resolveStateOutputParameter__set__number__type__property(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__set__number__type__property[param];
	var $state_group = data.properties.set;
	switch (param) {
		default:
			onResolved(true);
	}
};
export function imp_resolve_reference__type__number__type__property (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.type, data, 'TODO!', onResolved, onError)) {
		$context.parent.parent.parent.imp_resolveInputParameter("interface", function (err, $_i_param_interface) {
			if (err) {
				data.properties.type.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.type, $context, $_i_param_interface, 'numerical_types', onResolved, onError)) {
					var resolution_result = entry;
					setReferenceWithCounter(data.properties.type, resolution_result);
					onResolved(null, resolution_result);
				}
			}
		}, onError);
	}
}
export function imp_resolve_matrix_key__output_arguments (data, onResolved, onError) {
	var $context = data.parent;
	if (switchResolutionStatus(data.key, data, 'TODO!', onResolved, onError)) {
		var entry;
		if (entry = checkCollectionEntry(data.key, $context, $context.parent, 'output_parameters', onResolved, onError)) {
			var resolution_result = entry;
			setReferenceWithCounter(data.key, resolution_result);
			onResolved(null, resolution_result);
		}
	}
}
export function resolveComponentOutputParameter_node_content_path(data, param, onResolved, onError) {
	var $param_context = data;
	var $param_data = data.output_parameters[param];
	switch (param) {
		case "result interface node":
			if (switchResolutionStatus($param_data, data, 'result interface node', onResolved, onError)) {
				interface_resolver.imp_resolveStateOutputParameter__has_steps__node_content_path(data, "result interface node", function (err, $_sgo_node_content_path) {
					if (err) {
						$param_data.resolution_status = 'error';
						onResolved(true)
					} else {
						$_sgo_node_content_path.reference_selections_count += 1;
						setReference($param_data, $_sgo_node_content_path);
						onResolved(null, $_sgo_node_content_path);
					}
				}, onError);
			}
		break;
		default:
			onResolved(true)
	}
}
export function imp_resolveStateOutputParameter__type__yes__has_steps__node_content_path(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__type__yes__has_steps__node_content_path[param];
	var $state_group = data.properties.type;
	switch (param) {
		case "result interface node":
			if (switchResolutionStatus($param_data, data, param, onResolved, onError)) {
				switch ($state_group.state.name) {
					case "group":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_interface_node__group__type__yes__has_steps__node_content_path($state_group.state.node, onResolved, onError);
						break;
					case "state":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_interface_node__state__type__yes__has_steps__node_content_path($state_group.state.node, onResolved, onError);
						break;
					default:
						onResolved(true);
				}
			}
		break;
		default:
			onResolved(true);
	}
};
function imp_resolveStateOutputArgument__result_interface_node__group__type__yes__has_steps__node_content_path(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__type__yes__has_steps__node_content_path['result interface node'];
	interface_resolver.imp_resolve_reference__group__group__type__yes__has_steps__node_content_path($state_data, function (err, $_ref_group__type__yes__has_steps__node_content_path) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_ref_group__type__yes__has_steps__node_content_path.properties["node"]);
			onResolved(null, $_ref_group__type__yes__has_steps__node_content_path.properties["node"]);
		}
	}, onError);
};
function imp_resolveStateOutputArgument__result_interface_node__state__type__yes__has_steps__node_content_path(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__type__yes__has_steps__node_content_path['result interface node'];
	interface_resolver.imp_resolve_reference__state__state__type__yes__has_steps__node_content_path($state_data, function (err, $_ref_state__type__yes__has_steps__node_content_path) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_ref_state__type__yes__has_steps__node_content_path.properties["node"]);
			onResolved(null, $_ref_state__type__yes__has_steps__node_content_path.properties["node"]);
		}
	}, onError);
};
export function imp_resolve_reference__group__group__type__yes__has_steps__node_content_path (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.group, data, 'TODO!', onResolved, onError)) {
		$context.parent.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
			if (err) {
				data.properties.group.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.group, $context, $_i_param_context_node, 'attributes', onResolved, onError)) {
					if (checkEntryContentStateStep(data.properties.group, entry, "type", "property", data, onResolved, onError)) {
						if (checkEntryContentStateStep(data.properties.group, entry.properties.type.state.node, "type", "group", data, onResolved, onError)) {
							var resolution_result = entry.properties.type.state.node.properties.type.state.node;
							setReferenceWithCounter(data.properties.group, resolution_result);
							onResolved(null, resolution_result);

						}

					}
				}
			}
		}, onError);
	}
}
export function imp_resolve_reference__state__state__type__yes__has_steps__node_content_path (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.state, data, 'TODO!', onResolved, onError)) {
		interface_resolver.imp_resolve_reference__state_group__state__type__yes__has_steps__node_content_path($context, function (err, $_ref_state__type__yes__has_steps__node_content_path) {
			if (err) {
				data.properties.state.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.state, $context, $_ref_state__type__yes__has_steps__node_content_path, 'states', onResolved, onError)) {
					var resolution_result = entry;
					setReferenceWithCounter(data.properties.state, resolution_result);
					onResolved(null, resolution_result);
				}
			}
		}, onError);
	}
}
export function imp_resolve_reference__state_group__state__type__yes__has_steps__node_content_path (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.state_group, data, 'TODO!', onResolved, onError)) {
		$context.parent.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
			if (err) {
				data.properties.state_group.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.state_group, $context, $_i_param_context_node, 'attributes', onResolved, onError)) {
					if (checkEntryContentStateStep(data.properties.state_group, entry, "type", "property", data, onResolved, onError)) {
						if (checkEntryContentStateStep(data.properties.state_group, entry.properties.type.state.node, "type", "state group", data, onResolved, onError)) {
							var resolution_result = entry.properties.type.state.node.properties.type.state.node;
							setReferenceWithCounter(data.properties.state_group, resolution_result);
							onResolved(null, resolution_result);

						}

					}
				}
			}
		}, onError);
	}
}
export function imp_resolveStateOutputParameter__has_steps__node_content_path(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__has_steps__node_content_path[param];
	var $state_group = data.properties.has_steps;
	switch (param) {
		case "result interface node":
			if (switchResolutionStatus($param_data, data, param, onResolved, onError)) {
				switch ($state_group.state.name) {
					case "no":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_interface_node__no__has_steps__node_content_path($state_group.state.node, onResolved, onError);
						break;
					case "yes":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_interface_node__yes__has_steps__node_content_path($state_group.state.node, onResolved, onError);
						break;
					default:
						onResolved(true);
				}
			}
		break;
		default:
			onResolved(true);
	}
};
function imp_resolveStateOutputArgument__result_interface_node__no__has_steps__node_content_path(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__has_steps__node_content_path['result interface node'];
	$state_data.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_i_param_context_node);
			onResolved(null, $_i_param_context_node);
		}
	}, onError);
};
function imp_resolveStateOutputArgument__result_interface_node__yes__has_steps__node_content_path(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__has_steps__node_content_path['result interface node'];
	interface_resolver.resolveComponentOutputParameter_node_content_path($state_data.properties["tail"],"result interface node", function (err, $_cto_param_result_interface_node) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_cto_param_result_interface_node);
			onResolved(null, $_cto_param_result_interface_node);
		}
	}, onError);
};
export function resolveComponentOutputParameter_node_selection_path(data, param, onResolved, onError) {
	var $param_context = data;
	var $param_data = data.output_parameters[param];
	switch (param) {
		case "result interface node":
			if (switchResolutionStatus($param_data, data, 'result interface node', onResolved, onError)) {
				interface_resolver.imp_resolveStateOutputParameter__has_steps__node_selection_path(data, "result interface node", function (err, $_sgo_node_selection_path) {
					if (err) {
						$param_data.resolution_status = 'error';
						onResolved(true)
					} else {
						$_sgo_node_selection_path.reference_selections_count += 1;
						setReference($param_data, $_sgo_node_selection_path);
						onResolved(null, $_sgo_node_selection_path);
					}
				}, onError);
			}
		break;
		default:
			onResolved(true)
	}
}
export function imp_resolveStateOutputParameter__type__yes__has_steps__node_selection_path(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__type__yes__has_steps__node_selection_path[param];
	var $state_group = data.properties.type;
	switch (param) {
		case "result interface node":
			if (switchResolutionStatus($param_data, data, param, onResolved, onError)) {
				switch ($state_group.state.name) {
					case "collection parent":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_interface_node__collection_parent($state_group.state.node, onResolved, onError);
						break;
					case "group":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_interface_node__group__type__yes__has_steps__node_selection_path($state_group.state.node, onResolved, onError);
						break;
					case "group parent":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_interface_node__group_parent($state_group.state.node, onResolved, onError);
						break;
					case "matrix key":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_interface_node__matrix_key($state_group.state.node, onResolved, onError);
						break;
					case "reference":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_interface_node__reference__type__yes($state_group.state.node, onResolved, onError);
						break;
					case "state group output parameter":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_interface_node__state_group_output_parameter($state_group.state.node, onResolved, onError);
						break;
					case "state parent":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_interface_node__state_parent__type__yes__has_steps__node_selection_path($state_group.state.node, onResolved, onError);
						break;
					default:
						onResolved(true);
				}
			}
		break;
		default:
			onResolved(true);
	}
};
function imp_resolveStateOutputArgument__result_interface_node__collection_parent(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__type__yes__has_steps__node_selection_path['result interface node'];
	interface_resolver.imp_resolveStateContextValue__collection__collection_parent($state_data, function (err, $_scv_collection) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_scv_collection.parent.parent.parent);
			onResolved(null, $_scv_collection.parent.parent.parent);
		}
	}, onError);
};
export function imp_resolveStateContextValue__collection__collection_parent(data, onResolved, onError) {
	var $state_context_value = data.state_context_values["collection"];
	if (switchResolutionStatus($state_context_value, data, 'collection', onResolved, onError)) {
		data.parent.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
			if (err) {
				$state_context_value.resolution_status = 'error';
				onResolved(true)
			} else {
				if (checkLocationConstraint($state_context_value, $_i_param_context_node, interface.Ccollection__type__property, "interface.Ccollection__type__property", data, 'node', onResolved, onError)) {
					setReference($state_context_value, $_i_param_context_node.location);
					onResolved(null, $state_context_value.referenced_node);

				}
			}
		}, onError);
	}
};
function imp_resolveStateOutputArgument__result_interface_node__group__type__yes__has_steps__node_selection_path(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__type__yes__has_steps__node_selection_path['result interface node'];
	interface_resolver.imp_resolve_reference__group__group__type__yes__has_steps__node_selection_path($state_data, function (err, $_ref_group__type__yes__has_steps__node_selection_path) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_ref_group__type__yes__has_steps__node_selection_path.properties["node"]);
			onResolved(null, $_ref_group__type__yes__has_steps__node_selection_path.properties["node"]);
		}
	}, onError);
};
function imp_resolveStateOutputArgument__result_interface_node__group_parent(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__type__yes__has_steps__node_selection_path['result interface node'];
	interface_resolver.imp_resolveStateContextValue__group__group_parent($state_data, function (err, $_scv_group) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_scv_group.parent.parent.parent);
			onResolved(null, $_scv_group.parent.parent.parent);
		}
	}, onError);
};
export function imp_resolveStateContextValue__group__group_parent(data, onResolved, onError) {
	var $state_context_value = data.state_context_values["group"];
	if (switchResolutionStatus($state_context_value, data, 'group', onResolved, onError)) {
		data.parent.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
			if (err) {
				$state_context_value.resolution_status = 'error';
				onResolved(true)
			} else {
				if (checkLocationConstraint($state_context_value, $_i_param_context_node, interface.Cgroup__type__property, "interface.Cgroup__type__property", data, 'node', onResolved, onError)) {
					setReference($state_context_value, $_i_param_context_node.location);
					onResolved(null, $state_context_value.referenced_node);

				}
			}
		}, onError);
	}
};
function imp_resolveStateOutputArgument__result_interface_node__matrix_key(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__type__yes__has_steps__node_selection_path['result interface node'];
	interface_resolver.imp_resolveStateContextValue__matrix__matrix_key($state_data, function (err, $_scv_matrix) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			interface_resolver.resolveComponentOutputParameter_referencer($_scv_matrix.properties["referencer"],"referenced interface node", function (err, $_cto_param_referenced_interface_node) {
				if (err) {
					$param_data.resolution_status = 'error';
					onResolved(true);
				} else {
					setReference($param_data, $_cto_param_referenced_interface_node);
					onResolved(null, $_cto_param_referenced_interface_node);
				}
			}, onError);
		}
	}, onError);
};
export function imp_resolveStateContextValue__matrix__matrix_key(data, onResolved, onError) {
	var $state_context_value = data.state_context_values["matrix"];
	if (switchResolutionStatus($state_context_value, data, 'matrix', onResolved, onError)) {
		data.parent.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
			if (err) {
				$state_context_value.resolution_status = 'error';
				onResolved(true)
			} else {
				if (checkLocationConstraint($state_context_value, $_i_param_context_node, interface.Ccollection__type__property, "interface.Ccollection__type__property", data, 'node', onResolved, onError)) {
					if (checkStateConstraint($state_context_value, $_i_param_context_node.location, 'type', 'matrix', data, onResolved, onError)) {
						setReference($state_context_value, $_i_param_context_node.location.properties.type.state.node);
						onResolved(null, $state_context_value.referenced_node);

					}
				}
			}
		}, onError);
	}
};
function imp_resolveStateOutputArgument__result_interface_node__reference__type__yes(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__type__yes__has_steps__node_selection_path['result interface node'];
	interface_resolver.imp_resolve_reference__reference__reference__type__yes($state_data, function (err, $_ref_reference__type__yes) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			interface_resolver.resolveComponentOutputParameter_referencer($_ref_reference__type__yes.properties["referencer"],"referenced interface node", function (err, $_cto_param_referenced_interface_node) {
				if (err) {
					$param_data.resolution_status = 'error';
					onResolved(true);
				} else {
					setReference($param_data, $_cto_param_referenced_interface_node);
					onResolved(null, $_cto_param_referenced_interface_node);
				}
			}, onError);
		}
	}, onError);
};
function imp_resolveStateOutputArgument__result_interface_node__state_group_output_parameter(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__type__yes__has_steps__node_selection_path['result interface node'];
	interface_resolver.imp_resolve_reference__output_parameter__state_group_output_parameter($state_data, function (err, $_ref_state_group_output_parameter) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			interface_resolver.resolveComponentOutputParameter_node_type_path($_ref_state_group_output_parameter.properties["node_selection"],"result interface node", function (err, $_cto_param_result_interface_node) {
				if (err) {
					$param_data.resolution_status = 'error';
					onResolved(true);
				} else {
					setReference($param_data, $_cto_param_result_interface_node);
					onResolved(null, $_cto_param_result_interface_node);
				}
			}, onError);
		}
	}, onError);
};
function imp_resolveStateOutputArgument__result_interface_node__state_parent__type__yes__has_steps__node_selection_path(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__type__yes__has_steps__node_selection_path['result interface node'];
	interface_resolver.imp_resolveStateContextValue__state__state_parent__type__yes__has_steps__node_selection_path($state_data, function (err, $_scv_state) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_scv_state.parent.parent.parent.parent);
			onResolved(null, $_scv_state.parent.parent.parent.parent);
		}
	}, onError);
};
export function imp_resolveStateContextValue__state__state_parent__type__yes__has_steps__node_selection_path(data, onResolved, onError) {
	var $state_context_value = data.state_context_values["state"];
	if (switchResolutionStatus($state_context_value, data, 'state', onResolved, onError)) {
		data.parent.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
			if (err) {
				$state_context_value.resolution_status = 'error';
				onResolved(true)
			} else {
				if (checkLocationConstraint($state_context_value, $_i_param_context_node, interface.Cstates__state_group__type__property, "interface.Cstates__state_group__type__property", data, 'node', onResolved, onError)) {
					setReference($state_context_value, $_i_param_context_node.location);
					onResolved(null, $state_context_value.referenced_node);

				}
			}
		}, onError);
	}
};
export function imp_resolve_reference__group__group__type__yes__has_steps__node_selection_path (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.group, data, 'TODO!', onResolved, onError)) {
		$context.parent.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
			if (err) {
				data.properties.group.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.group, $context, $_i_param_context_node, 'attributes', onResolved, onError)) {
					if (checkEntryContentStateStep(data.properties.group, entry, "type", "property", data, onResolved, onError)) {
						if (checkEntryContentStateStep(data.properties.group, entry.properties.type.state.node, "type", "group", data, onResolved, onError)) {
							var resolution_result = entry.properties.type.state.node.properties.type.state.node;
							setReferenceWithCounter(data.properties.group, resolution_result);
							onResolved(null, resolution_result);

						}

					}
				}
			}
		}, onError);
	}
}
export function imp_resolve_reference__reference__reference__type__yes (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.reference, data, 'TODO!', onResolved, onError)) {
		$context.parent.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
			if (err) {
				data.properties.reference.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.reference, $context, $_i_param_context_node, 'attributes', onResolved, onError)) {
					if (checkEntryContentStateStep(data.properties.reference, entry, "type", "property", data, onResolved, onError)) {
						if (checkEntryContentStateStep(data.properties.reference, entry.properties.type.state.node, "type", "reference", data, onResolved, onError)) {
							var resolution_result = entry.properties.type.state.node.properties.type.state.node;
							setReferenceWithCounter(data.properties.reference, resolution_result);
							onResolved(null, resolution_result);

						}

					}
				}
			}
		}, onError);
	}
}
export function imp_resolve_reference__output_parameter__state_group_output_parameter (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.output_parameter, data, 'TODO!', onResolved, onError)) {
		interface_resolver.imp_resolve_reference__state_group__state_group_output_parameter($context, function (err, $_ref_state_group_output_parameter) {
			if (err) {
				data.properties.output_parameter.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.output_parameter, $context, $_ref_state_group_output_parameter, 'output_parameters', onResolved, onError)) {
					var resolution_result = entry;
					setReferenceWithCounter(data.properties.output_parameter, resolution_result);
					onResolved(null, resolution_result);
				}
			}
		}, onError);
	}
}
export function imp_resolve_reference__state_group__state_group_output_parameter (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.state_group, data, 'TODO!', onResolved, onError)) {
		$context.parent.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
			if (err) {
				data.properties.state_group.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.state_group, $context, $_i_param_context_node, 'attributes', onResolved, onError)) {
					if (checkEntryContentStateStep(data.properties.state_group, entry, "type", "property", data, onResolved, onError)) {
						if (checkEntryContentStateStep(data.properties.state_group, entry.properties.type.state.node, "type", "state group", data, onResolved, onError)) {
							var resolution_result = entry.properties.type.state.node.properties.type.state.node;
							setReferenceWithCounter(data.properties.state_group, resolution_result);
							onResolved(null, resolution_result);

						}

					}
				}
			}
		}, onError);
	}
}
export function imp_resolveStateOutputParameter__has_steps__node_selection_path(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__has_steps__node_selection_path[param];
	var $state_group = data.properties.has_steps;
	switch (param) {
		case "result interface node":
			if (switchResolutionStatus($param_data, data, param, onResolved, onError)) {
				switch ($state_group.state.name) {
					case "no":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_interface_node__no__has_steps__node_selection_path($state_group.state.node, onResolved, onError);
						break;
					case "yes":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_interface_node__yes__has_steps__node_selection_path($state_group.state.node, onResolved, onError);
						break;
					default:
						onResolved(true);
				}
			}
		break;
		default:
			onResolved(true);
	}
};
function imp_resolveStateOutputArgument__result_interface_node__no__has_steps__node_selection_path(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__has_steps__node_selection_path['result interface node'];
	$state_data.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_i_param_context_node);
			onResolved(null, $_i_param_context_node);
		}
	}, onError);
};
function imp_resolveStateOutputArgument__result_interface_node__yes__has_steps__node_selection_path(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__has_steps__node_selection_path['result interface node'];
	interface_resolver.resolveComponentOutputParameter_node_selection_path($state_data.properties["tail"],"result interface node", function (err, $_cto_param_result_interface_node) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_cto_param_result_interface_node);
			onResolved(null, $_cto_param_result_interface_node);
		}
	}, onError);
};
export function resolveComponentOutputParameter_node_type_path(data, param, onResolved, onError) {
	var $param_context = data;
	var $param_data = data.output_parameters[param];
	switch (param) {
		case "result interface node":
			if (switchResolutionStatus($param_data, data, 'result interface node', onResolved, onError)) {
				interface_resolver.resolveComponentOutputParameter_node_type_path_step(data.properties["steps"],"result interface node", function (err, $_cto_param_result_interface_node) {
					if (err) {
						$param_data.resolution_status = 'error';
						onResolved(true)
					} else {
						setReference($param_data, $_cto_param_result_interface_node);
						onResolved(null, $_cto_param_result_interface_node);
					}
				}, onError);
			}
		break;
		default:
			onResolved(true)
	}
}
export function imp_resolve_reference__component_type__component_type (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.component_type, data, 'TODO!', onResolved, onError)) {
		$context.parent.imp_resolveInputParameter("interface", function (err, $_i_param_interface) {
			if (err) {
				data.properties.component_type.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.component_type, $context, $_i_param_interface, 'component_types', onResolved, onError)) {
					var resolution_result = entry;
					setReferenceWithCounter(data.properties.component_type, resolution_result);
					onResolved(null, resolution_result);
				}
			}
		}, onError);
	}
}
export function imp_resolveStateOutputParameter__root_type__node_type_path(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__root_type__node_type_path[param];
	var $state_group = data.properties.root_type;
	switch (param) {
		case "root type interface node":
			if (switchResolutionStatus($param_data, data, param, onResolved, onError)) {
				switch ($state_group.state.name) {
					case "component type":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__root_type_interface_node__component_type($state_group.state.node, onResolved, onError);
						break;
					case "root":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__root_type_interface_node__root($state_group.state.node, onResolved, onError);
						break;
					default:
						onResolved(true);
				}
			}
		break;
		default:
			onResolved(true);
	}
};
function imp_resolveStateOutputArgument__root_type_interface_node__component_type(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__root_type__node_type_path['root type interface node'];
	interface_resolver.imp_resolve_reference__component_type__component_type($state_data, function (err, $_ref_component_type) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_ref_component_type.properties["node"]);
			onResolved(null, $_ref_component_type.properties["node"]);
		}
	}, onError);
};
function imp_resolveStateOutputArgument__root_type_interface_node__root(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__root_type__node_type_path['root type interface node'];
	$state_data.parent.imp_resolveInputParameter("interface", function (err, $_i_param_interface) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_i_param_interface.properties["root"]);
			onResolved(null, $_i_param_interface.properties["root"]);
		}
	}, onError);
};
export function resolveComponentOutputParameter_node_type_path_step(data, param, onResolved, onError) {
	var $param_context = data;
	var $param_data = data.output_parameters[param];
	switch (param) {
		case "result interface node":
			if (switchResolutionStatus($param_data, data, 'result interface node', onResolved, onError)) {
				interface_resolver.imp_resolveStateOutputParameter__has_steps__node_type_path_step(data, "result interface node", function (err, $_sgo_node_type_path_step) {
					if (err) {
						$param_data.resolution_status = 'error';
						onResolved(true)
					} else {
						$_sgo_node_type_path_step.reference_selections_count += 1;
						setReference($param_data, $_sgo_node_type_path_step);
						onResolved(null, $_sgo_node_type_path_step);
					}
				}, onError);
			}
		break;
		default:
			onResolved(true)
	}
}
export function imp_resolveStateOutputParameter__type__yes__has_steps__node_type_path_step(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__type__yes__has_steps__node_type_path_step[param];
	var $state_group = data.properties.type;
	switch (param) {
		case "result interface node":
			if (switchResolutionStatus($param_data, data, param, onResolved, onError)) {
				switch ($state_group.state.name) {
					case "collection":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_interface_node__collection__type__yes($state_group.state.node, onResolved, onError);
						break;
					case "group":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_interface_node__group__type__yes__has_steps__node_type_path_step($state_group.state.node, onResolved, onError);
						break;
					case "state":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_interface_node__state__type__yes__has_steps__node_type_path_step($state_group.state.node, onResolved, onError);
						break;
					default:
						onResolved(true);
				}
			}
		break;
		default:
			onResolved(true);
	}
};
function imp_resolveStateOutputArgument__result_interface_node__collection__type__yes(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__type__yes__has_steps__node_type_path_step['result interface node'];
	interface_resolver.imp_resolve_reference__collection__collection__type__yes($state_data, function (err, $_ref_collection__type__yes) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_ref_collection__type__yes.properties["node"]);
			onResolved(null, $_ref_collection__type__yes.properties["node"]);
		}
	}, onError);
};
function imp_resolveStateOutputArgument__result_interface_node__group__type__yes__has_steps__node_type_path_step(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__type__yes__has_steps__node_type_path_step['result interface node'];
	interface_resolver.imp_resolve_reference__group__group__type__yes__has_steps__node_type_path_step($state_data, function (err, $_ref_group__type__yes__has_steps__node_type_path_step) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_ref_group__type__yes__has_steps__node_type_path_step.properties["node"]);
			onResolved(null, $_ref_group__type__yes__has_steps__node_type_path_step.properties["node"]);
		}
	}, onError);
};
function imp_resolveStateOutputArgument__result_interface_node__state__type__yes__has_steps__node_type_path_step(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__type__yes__has_steps__node_type_path_step['result interface node'];
	interface_resolver.imp_resolve_reference__state__state__type__yes__has_steps__node_type_path_step($state_data, function (err, $_ref_state__type__yes__has_steps__node_type_path_step) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_ref_state__type__yes__has_steps__node_type_path_step.properties["node"]);
			onResolved(null, $_ref_state__type__yes__has_steps__node_type_path_step.properties["node"]);
		}
	}, onError);
};
export function imp_resolve_reference__collection__collection__type__yes (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.collection, data, 'TODO!', onResolved, onError)) {
		$context.parent.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
			if (err) {
				data.properties.collection.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.collection, $context, $_i_param_context_node, 'attributes', onResolved, onError)) {
					if (checkEntryContentStateStep(data.properties.collection, entry, "type", "property", data, onResolved, onError)) {
						if (checkEntryContentStateStep(data.properties.collection, entry.properties.type.state.node, "type", "collection", data, onResolved, onError)) {
							var resolution_result = entry.properties.type.state.node.properties.type.state.node;
							setReferenceWithCounter(data.properties.collection, resolution_result);
							onResolved(null, resolution_result);

						}

					}
				}
			}
		}, onError);
	}
}
export function imp_resolve_reference__group__group__type__yes__has_steps__node_type_path_step (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.group, data, 'TODO!', onResolved, onError)) {
		$context.parent.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
			if (err) {
				data.properties.group.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.group, $context, $_i_param_context_node, 'attributes', onResolved, onError)) {
					if (checkEntryContentStateStep(data.properties.group, entry, "type", "property", data, onResolved, onError)) {
						if (checkEntryContentStateStep(data.properties.group, entry.properties.type.state.node, "type", "group", data, onResolved, onError)) {
							var resolution_result = entry.properties.type.state.node.properties.type.state.node;
							setReferenceWithCounter(data.properties.group, resolution_result);
							onResolved(null, resolution_result);

						}

					}
				}
			}
		}, onError);
	}
}
export function imp_resolve_reference__state__state__type__yes__has_steps__node_type_path_step (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.state, data, 'TODO!', onResolved, onError)) {
		interface_resolver.imp_resolve_reference__state_group__state__type__yes__has_steps__node_type_path_step($context, function (err, $_ref_state__type__yes__has_steps__node_type_path_step) {
			if (err) {
				data.properties.state.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.state, $context, $_ref_state__type__yes__has_steps__node_type_path_step, 'states', onResolved, onError)) {
					var resolution_result = entry;
					setReferenceWithCounter(data.properties.state, resolution_result);
					onResolved(null, resolution_result);
				}
			}
		}, onError);
	}
}
export function imp_resolve_reference__state_group__state__type__yes__has_steps__node_type_path_step (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.state_group, data, 'TODO!', onResolved, onError)) {
		$context.parent.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
			if (err) {
				data.properties.state_group.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.state_group, $context, $_i_param_context_node, 'attributes', onResolved, onError)) {
					if (checkEntryContentStateStep(data.properties.state_group, entry, "type", "property", data, onResolved, onError)) {
						if (checkEntryContentStateStep(data.properties.state_group, entry.properties.type.state.node, "type", "state group", data, onResolved, onError)) {
							var resolution_result = entry.properties.type.state.node.properties.type.state.node;
							setReferenceWithCounter(data.properties.state_group, resolution_result);
							onResolved(null, resolution_result);

						}

					}
				}
			}
		}, onError);
	}
}
export function imp_resolveStateOutputParameter__has_steps__node_type_path_step(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__has_steps__node_type_path_step[param];
	var $state_group = data.properties.has_steps;
	switch (param) {
		case "result interface node":
			if (switchResolutionStatus($param_data, data, param, onResolved, onError)) {
				switch ($state_group.state.name) {
					case "no":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_interface_node__no__has_steps__node_type_path_step($state_group.state.node, onResolved, onError);
						break;
					case "yes":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_interface_node__yes__has_steps__node_type_path_step($state_group.state.node, onResolved, onError);
						break;
					default:
						onResolved(true);
				}
			}
		break;
		default:
			onResolved(true);
	}
};
function imp_resolveStateOutputArgument__result_interface_node__no__has_steps__node_type_path_step(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__has_steps__node_type_path_step['result interface node'];
	$state_data.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_i_param_context_node);
			onResolved(null, $_i_param_context_node);
		}
	}, onError);
};
function imp_resolveStateOutputArgument__result_interface_node__yes__has_steps__node_type_path_step(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__has_steps__node_type_path_step['result interface node'];
	interface_resolver.resolveComponentOutputParameter_node_type_path_step($state_data.properties["tail"],"result interface node", function (err, $_cto_param_result_interface_node) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_cto_param_result_interface_node);
			onResolved(null, $_cto_param_result_interface_node);
		}
	}, onError);
};
export function resolveComponentOutputParameter_referencer(data, param, onResolved, onError) {
	var $param_context = data;
	var $param_data = data.output_parameters[param];
	switch (param) {
		case "referenced interface node":
			if (switchResolutionStatus($param_data, data, 'referenced interface node', onResolved, onError)) {
				interface_resolver.resolveComponentOutputParameter_node_content_path(data.properties["tail"],"result interface node", function (err, $_cto_param_result_interface_node) {
					if (err) {
						$param_data.resolution_status = 'error';
						onResolved(true)
					} else {
						setReference($param_data, $_cto_param_result_interface_node);
						onResolved(null, $_cto_param_result_interface_node);
					}
				}, onError);
			}
		break;
		default:
			onResolved(true)
	}
}
export function imp_resolve_reference__collection__referencer (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.collection, data, 'TODO!', onResolved, onError)) {
		interface_resolver.resolveComponentOutputParameter_node_selection_path($context.properties["head"],"result interface node", function (err, $_cto_param_result_interface_node) {
			if (err) {
				data.properties.collection.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.collection, $context, $_cto_param_result_interface_node, 'attributes', onResolved, onError)) {
					if (checkEntryContentStateStep(data.properties.collection, entry, "type", "property", data, onResolved, onError)) {
						if (checkEntryContentStateStep(data.properties.collection, entry.properties.type.state.node, "type", "collection", data, onResolved, onError)) {
							var resolution_result = entry.properties.type.state.node.properties.type.state.node;
							setReferenceWithCounter(data.properties.collection, resolution_result);
							onResolved(null, resolution_result);

						}

					}
				}
			}
		}, onError);
	}
}
