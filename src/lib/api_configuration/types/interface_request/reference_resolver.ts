import * as interface_request_resolver from "./reference_resolver";
import * as interface_request from "./read_api";
import * as interface from "../interface/read_api";
import * as interface_resolver from "../interface/reference_resolver";
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
export function imp_resolve_reference__command__command_execution (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.command, data, 'TODO!', onResolved, onError)) {
		interface_request_resolver.resolveComponentOutputParameter_id_path($context.properties["context_node"],"result node", function (err, $_cto_param_result_node) {
			if (err) {
				data.properties.command.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.command, $context, $_cto_param_result_node, 'attributes', onResolved, onError)) {
					if (checkEntryContentStateStep(data.properties.command, entry, "type", "command", data, onResolved, onError)) {
						var resolution_result = entry.properties.type.state.node;
						setReferenceWithCounter(data.properties.command, resolution_result);
						onResolved(null, resolution_result);

					}
				}
			}
		}, onError);
	}
}
export function imp_resolveStateOutputParameter__initialization_data_requested__subscribe(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__initialization_data_requested__subscribe[param];
	var $state_group = data.properties.initialization_data_requested;
	switch (param) {
		default:
			onResolved(true);
	}
};
export function resolveComponentOutputParameter_command_arguments(data, param, onResolved, onError) {
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
export function imp_resolveStateContextValue__file__file(data, onResolved, onError) {
	var $state_context_value = data.state_context_values["file"];
	if (switchResolutionStatus($state_context_value, data, 'file', onResolved, onError)) {
		interface_request_resolver.imp_resolve_matrix_key__properties(data.parent, function (err, key) {
			if (err) {
				$state_context_value.resolution_status = 'error';
				onResolved(true)
			} else {
				if (checkStateConstraint($state_context_value, key, 'type', 'file', data, onResolved, onError)) {
					setReference($state_context_value, key.properties.type.state.node);
					onResolved(null, $state_context_value.referenced_node);

				}
			}
		}, onError);
	}
};
export function imp_resolveStateContextValue__matrix__matrix(data, onResolved, onError) {
	var $state_context_value = data.state_context_values["matrix"];
	if (switchResolutionStatus($state_context_value, data, 'matrix', onResolved, onError)) {
		interface_request_resolver.imp_resolve_matrix_key__properties(data.parent, function (err, key) {
			if (err) {
				$state_context_value.resolution_status = 'error';
				onResolved(true)
			} else {
				if (checkStateConstraint($state_context_value, key, 'type', 'matrix', data, onResolved, onError)) {
					setReference($state_context_value, key.properties.type.state.node);
					onResolved(null, $state_context_value.referenced_node);

				}
			}
		}, onError);
	}
};
export function imp_resolveStateContextValue__number__number(data, onResolved, onError) {
	var $state_context_value = data.state_context_values["number"];
	if (switchResolutionStatus($state_context_value, data, 'number', onResolved, onError)) {
		interface_request_resolver.imp_resolve_matrix_key__properties(data.parent, function (err, key) {
			if (err) {
				$state_context_value.resolution_status = 'error';
				onResolved(true)
			} else {
				if (checkStateConstraint($state_context_value, key, 'type', 'number', data, onResolved, onError)) {
					setReference($state_context_value, key.properties.type.state.node);
					onResolved(null, $state_context_value.referenced_node);

				}
			}
		}, onError);
	}
};
export function imp_resolveStateContextValue__reference__reference(data, onResolved, onError) {
	var $state_context_value = data.state_context_values["reference"];
	if (switchResolutionStatus($state_context_value, data, 'reference', onResolved, onError)) {
		interface_request_resolver.imp_resolve_matrix_key__properties(data.parent, function (err, key) {
			if (err) {
				$state_context_value.resolution_status = 'error';
				onResolved(true)
			} else {
				if (checkStateConstraint($state_context_value, key, 'type', 'reference', data, onResolved, onError)) {
					setReference($state_context_value, key.properties.type.state.node);
					onResolved(null, $state_context_value.referenced_node);

				}
			}
		}, onError);
	}
};
export function imp_resolveStateContextValue__state_group__state_group(data, onResolved, onError) {
	var $state_context_value = data.state_context_values["state group"];
	if (switchResolutionStatus($state_context_value, data, 'state group', onResolved, onError)) {
		interface_request_resolver.imp_resolve_matrix_key__properties(data.parent, function (err, key) {
			if (err) {
				$state_context_value.resolution_status = 'error';
				onResolved(true)
			} else {
				if (checkStateConstraint($state_context_value, key, 'type', 'state group', data, onResolved, onError)) {
					setReference($state_context_value, key.properties.type.state.node);
					onResolved(null, $state_context_value.referenced_node);

				}
			}
		}, onError);
	}
};
export function imp_resolveStateContextValue__text__text(data, onResolved, onError) {
	var $state_context_value = data.state_context_values["text"];
	if (switchResolutionStatus($state_context_value, data, 'text', onResolved, onError)) {
		interface_request_resolver.imp_resolve_matrix_key__properties(data.parent, function (err, key) {
			if (err) {
				$state_context_value.resolution_status = 'error';
				onResolved(true)
			} else {
				if (checkStateConstraint($state_context_value, key, 'type', 'text', data, onResolved, onError)) {
					setReference($state_context_value, key.properties.type.state.node);
					onResolved(null, $state_context_value.referenced_node);

				}
			}
		}, onError);
	}
};
export function imp_resolve_reference__state__state_group (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.state, data, 'TODO!', onResolved, onError)) {
		interface_request_resolver.imp_resolveStateContextValue__state_group__state_group($context, function (err, $_scv_state_group) {
			if (err) {
				data.properties.state.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.state, $context, $_scv_state_group, 'states', onResolved, onError)) {
					var resolution_result = entry;
					setReferenceWithCounter(data.properties.state, resolution_result);
					onResolved(null, resolution_result);
				}
			}
		}, onError);
	}
}
export function imp_resolve_matrix_key__properties (data, onResolved, onError) {
	var $context = data.parent;
	if (switchResolutionStatus(data.key, data, 'TODO!', onResolved, onError)) {
		$context.imp_resolveInputParameter("command parameters", function (err, $_i_param_command_parameters) {
			if (err) {
				data.key.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.key, $context, $_i_param_command_parameters, 'properties', onResolved, onError)) {
					var resolution_result = entry;
					setReferenceWithCounter(data.key, resolution_result);
					onResolved(null, resolution_result);
				}
			}
		}, onError);
	}
}
export function resolveComponentOutputParameter_context_keys__interface_request(data, param, onResolved, onError) {
	var $param_context = data;
	var $param_data = data.output_parameters[param];
	switch (param) {
		default:
			onResolved(true)
	}
}
export function imp_resolve_matrix_key__context_keys__context_keys (data, onResolved, onError) {
	var $context = data.parent;
	if (switchResolutionStatus(data.key, data, 'TODO!', onResolved, onError)) {
		$context.imp_resolveInputParameter("interface", function (err, $_i_param_interface) {
			if (err) {
				data.key.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.key, $context, $_i_param_interface, 'context_keys', onResolved, onError)) {
					var resolution_result = entry;
					setReferenceWithCounter(data.key, resolution_result);
					onResolved(null, resolution_result);
				}
			}
		}, onError);
	}
}
export function resolveComponentOutputParameter_id_path(data, param, onResolved, onError) {
	var $param_context = data;
	var $param_data = data.output_parameters[param];
	switch (param) {
		case "result node":
			if (switchResolutionStatus($param_data, data, 'result node', onResolved, onError)) {
				interface_request_resolver.imp_resolveStateOutputParameter__has_steps__id_path(data, "result node", function (err, $_sgo_id_path) {
					if (err) {
						$param_data.resolution_status = 'error';
						onResolved(true)
					} else {
						$_sgo_id_path.reference_selections_count += 1;
						setReference($param_data, $_sgo_id_path);
						onResolved(null, $_sgo_id_path);
					}
				}, onError);
			}
		break;
		default:
			onResolved(true)
	}
}
export function imp_resolveStateOutputParameter__type__yes__has_steps(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__type__yes__has_steps[param];
	var $state_group = data.properties.type;
	switch (param) {
		case "result node":
			if (switchResolutionStatus($param_data, data, param, onResolved, onError)) {
				switch ($state_group.state.name) {
					case "collection entry":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_node__collection_entry($state_group.state.node, onResolved, onError);
						break;
					case "component":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_node__component($state_group.state.node, onResolved, onError);
						break;
					case "group":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_node__group($state_group.state.node, onResolved, onError);
						break;
					case "state":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_node__state($state_group.state.node, onResolved, onError);
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
function imp_resolveStateOutputArgument__result_node__collection_entry(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__type__yes__has_steps['result node'];
	interface_request_resolver.imp_resolve_reference__collection__collection_entry($state_data, function (err, $_ref_collection_entry) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_ref_collection_entry.properties["node"]);
			onResolved(null, $_ref_collection_entry.properties["node"]);
		}
	}, onError);
};
function imp_resolveStateOutputArgument__result_node__component(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__type__yes__has_steps['result node'];
	interface_request_resolver.imp_resolve_reference__component__component($state_data, function (err, $_ref_component) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			interface_resolver.imp_resolve_reference__type__component($_ref_component, function (err, $_ref_component) {
				if (err) {
					$param_data.resolution_status = 'error';
					onResolved(true);
				} else {
					setReference($param_data, $_ref_component.properties["node"]);
					onResolved(null, $_ref_component.properties["node"]);
				}
			}, onError);
		}
	}, onError);
};
function imp_resolveStateOutputArgument__result_node__group(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__type__yes__has_steps['result node'];
	interface_request_resolver.imp_resolve_reference__group__group($state_data, function (err, $_ref_group) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_ref_group.properties["node"]);
			onResolved(null, $_ref_group.properties["node"]);
		}
	}, onError);
};
function imp_resolveStateOutputArgument__result_node__state(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__type__yes__has_steps['result node'];
	interface_request_resolver.imp_resolve_reference__state__state($state_data, function (err, $_ref_state) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_ref_state.properties["node"]);
			onResolved(null, $_ref_state.properties["node"]);
		}
	}, onError);
};
export function imp_resolve_reference__collection__collection_entry (data, onResolved, onError) {
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
export function imp_resolve_reference__component__component (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.component, data, 'TODO!', onResolved, onError)) {
		$context.parent.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
			if (err) {
				data.properties.component.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.component, $context, $_i_param_context_node, 'attributes', onResolved, onError)) {
					if (checkEntryContentStateStep(data.properties.component, entry, "type", "property", data, onResolved, onError)) {
						if (checkEntryContentStateStep(data.properties.component, entry.properties.type.state.node, "type", "component", data, onResolved, onError)) {
							var resolution_result = entry.properties.type.state.node.properties.type.state.node;
							setReferenceWithCounter(data.properties.component, resolution_result);
							onResolved(null, resolution_result);

						}

					}
				}
			}
		}, onError);
	}
}
export function imp_resolve_reference__group__group (data, onResolved, onError) {
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
export function imp_resolve_reference__state__state (data, onResolved, onError) {
	var $context = data;
	if (switchResolutionStatus(data.properties.state, data, 'TODO!', onResolved, onError)) {
		interface_request_resolver.imp_resolve_reference__state_group__state($context, function (err, $_ref_state) {
			if (err) {
				data.properties.state.resolution_status = 'error';
				onResolved(true);
			} else {
				var entry;
				if (entry = checkCollectionEntry(data.properties.state, $context, $_ref_state, 'states', onResolved, onError)) {
					var resolution_result = entry;
					setReferenceWithCounter(data.properties.state, resolution_result);
					onResolved(null, resolution_result);
				}
			}
		}, onError);
	}
}
export function imp_resolve_reference__state_group__state (data, onResolved, onError) {
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
export function imp_resolveStateOutputParameter__has_steps__id_path(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__has_steps__id_path[param];
	var $state_group = data.properties.has_steps;
	switch (param) {
		case "result node":
			if (switchResolutionStatus($param_data, data, param, onResolved, onError)) {
				switch ($state_group.state.name) {
					case "no":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_node__no__has_steps($state_group.state.node, onResolved, onError);
						break;
					case "yes":
						$param_data.resolution_status = 'resolving';
						imp_resolveStateOutputArgument__result_node__yes__has_steps($state_group.state.node, onResolved, onError);
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
function imp_resolveStateOutputArgument__result_node__no__has_steps(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__has_steps__id_path['result node'];
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
function imp_resolveStateOutputArgument__result_node__yes__has_steps(data, onResolved, onError) {
	var $state_data = data;
	var $param_data = $state_data.parent.output_parameters__has_steps__id_path['result node'];
	interface_request_resolver.resolveComponentOutputParameter_id_path($state_data.properties["tail"],"result node", function (err, $_cto_param_result_node) {
		if (err) {
			$param_data.resolution_status = 'error';
			onResolved(true);
		} else {
			setReference($param_data, $_cto_param_result_node);
			onResolved(null, $_cto_param_result_node);
		}
	}, onError);
};
export function imp_resolveStateOutputParameter__type__interface_request(data, param, onResolved, onError) {
	var $param_data = data.output_parameters__type__interface_request[param];
	var $state_group = data.properties.type;
	switch (param) {
		default:
			onResolved(true);
	}
};
