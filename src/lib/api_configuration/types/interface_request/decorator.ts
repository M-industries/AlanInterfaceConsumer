import * as id from './identifier';
import * as read_api from "./read_api";
import * as resolver from "./reference_resolver";
import * as interface_request from "./read_api";
import * as interface_request_resolver from "./reference_resolver";
import * as interface from "../interface/read_api";
import * as interface_resolver from "../interface/reference_resolver";
export interface Tree<T> {
	types: {[name:string]:T};
	substrees: {[name:string]:Tree<T>};}
function decorateLazy(object, property_name:string, value_function:(property_name:string) => any, lazy:boolean) {
	if (!lazy) {
		return object[property_name] = value_function(property_name);
	}
	Object.defineProperty(object, property_name, {
		get: function () {
			delete object[property_name];
			return object[property_name] = value_function(property_name);
		},
		enumerable: true,
		configurable: true,
	});
};

function resolveLazy(data, object, meta_table, resolve_function, onError, lazy:boolean) {
	if (lazy) {
		Object.defineProperty(object, "referenced_node", {
			get: function ( ) {
				delete object["referenced_node"];
				object["referenced_node"] = null;
				resolve_function(data, function () { }, onError);
				return object["referenced_node"]
			},
			set: function (value) {
				delete object["referenced_node"];
				object["referenced_node"] = value;
			},
			enumerable: true,
			configurable: true
		});
	} else {
		meta_table.referencers_to_resolve.push(function (onResolved, onError) { resolve_function(data, onResolved, onError); });
	}
}
export interface ExternalReference<T> extends read_api.ExternalReference<T> {
	resolution_status: 'unresolved'|'resolved'|'resolving'|'error'|'decoupled';
	referenced_node: T;
}
function createExternalReference<T>(library:string, type:string):read_api.ExternalReference<T> {
	let fn = <ExternalReference<T>>(() => { return fn.referenced_node; });
	fn.library = library;
	fn.type = type;
	fn.referenced_node = null;
	fn.resolution_status = 'unresolved';
	return fn;
}
export interface Reference<T> extends read_api.Reference<T> {
	resolution_status: 'unresolved'|'resolved'|'resolving'|'error'|'decoupled';
	referenced_node: T;
}
function createReference<T>(entry:string):read_api.Reference<T> {
	let fn = <Reference<T>>(() => { return fn.referenced_node; });
	fn.entry = entry;
	fn.referenced_node = null;
	fn.resolution_status = 'unresolved';
	return fn;
}
function resolveLazyWithKey(data, object, key, meta_table, resolve_function, onError, lazy:boolean) {
	if (lazy) {
		Object.defineProperty(object[key], "referenced_node", {
			get: function ( ) {
				delete object[key]["referenced_node"];
				object[key]["referenced_node"] = null;
				resolve_function(data, key, function () { }, onError);
				return object[key]["referenced_node"]
			},
			set: function (value) {
				delete object[key]["referenced_node"];
				object[key]["referenced_node"] = value;
			},
			enumerable: true,
			configurable: true
		});
	} else {
		meta_table.referencers_to_resolve.push(function (onResolved, onError) { resolve_function(data, key, onResolved, onError); });
	}
}
export type States_type__interface_request = ['command execution', Naked_command_execution]|['subscribe', Naked_subscribe]|['unsubscribe', Naked_unsubscribe];
export type Naked_command_execution = {
	'arguments': Naked_command_arguments;
	'command': string;
	'context keys': Naked_context_keys__interface_request;
	'context node': Naked_id_path;
	_typescript_dummy_command_execution?:boolean;
};
export type States_initialization_data_requested__subscribe = ['no', Naked_no__initialization_data_requested]|['yes', Naked_yes__initialization_data_requested];
export type Naked_no__initialization_data_requested = {
	_typescript_dummy_no__initialization_data_requested?:boolean;
};
export type Naked_yes__initialization_data_requested = {
	_typescript_dummy_yes__initialization_data_requested?:boolean;
};
export type Naked_subscribe = {
	'context keys': Naked_context_keys__interface_request;
	'initialization data requested': States_initialization_data_requested__subscribe;
	_typescript_dummy_subscribe?:boolean;
};
export type Naked_unsubscribe = {
	_typescript_dummy_unsubscribe?:boolean;
};
export type Naked_interface_request = {
	'type': States_type__interface_request;
	_typescript_dummy_interface_request?:boolean;
};
export type States_type__properties = ['file', Naked_file]|['matrix', Naked_matrix]|['number', Naked_number]|['reference', Naked_reference]|['state group', Naked_state_group]|['text', Naked_text];
export type Naked_file = {
	'extension': string;
	'token': string;
	_typescript_dummy_file?:boolean;
};
export type Naked_entries = {
	'arguments': Naked_command_arguments;
	_typescript_dummy_entries?:boolean;
};
export type Naked_matrix = {
	'entries'?: {[key:string]: Naked_entries};
	_typescript_dummy_matrix?:boolean;
};
export type Naked_number = {
	'number': number;
	_typescript_dummy_number?:boolean;
};
export type Naked_reference = {
	'entry': string;
	_typescript_dummy_reference?:boolean;
};
export type Naked_state_group = {
	'arguments': Naked_command_arguments;
	'state': string;
	_typescript_dummy_state_group?:boolean;
};
export type Naked_text = {
	'text': string;
	_typescript_dummy_text?:boolean;
};
export type Naked_properties = {
	'type': States_type__properties;
	_typescript_dummy_properties?:boolean;
};
export type Naked_command_arguments = {
	'properties'?: {[key:string]: Naked_properties};
	_typescript_dummy_command_arguments?:boolean;
};
export type Naked_context_keys__context_keys = {
	'value': string;
	_typescript_dummy_context_keys__context_keys?:boolean;
};
export type Naked_context_keys__interface_request = {
	'context keys'?: {[key:string]: Naked_context_keys__context_keys};
	_typescript_dummy_context_keys__interface_request?:boolean;
};
export type States_has_steps__id_path = ['no', Naked_no__has_steps]|['yes', Naked_yes__has_steps];
export type Naked_no__has_steps = {
	_typescript_dummy_no__has_steps?:boolean;
};
export type States_type__yes__has_steps = ['collection entry', Naked_collection_entry]|['component', Naked_component]|['group', Naked_group]|['state', Naked_state];
export type Naked_collection_entry = {
	'collection': string;
	'id': string;
	_typescript_dummy_collection_entry?:boolean;
};
export type Naked_component = {
	'component': string;
	_typescript_dummy_component?:boolean;
};
export type Naked_group = {
	'group': string;
	_typescript_dummy_group?:boolean;
};
export type Naked_state = {
	'state': string;
	'state group': string;
	_typescript_dummy_state?:boolean;
};
export type Naked_yes__has_steps = {
	'tail': Naked_id_path;
	'type': States_type__yes__has_steps;
	_typescript_dummy_yes__has_steps?:boolean;
};
export type Naked_id_path = {
	'has steps': States_has_steps__id_path;
	_typescript_dummy_id_path?:boolean;
};
export function imp_decorate_command_execution(api, $:Naked_command_execution, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Ccommand_execution();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.arguments = decorate_command_arguments(api, $["arguments"], data, "arguments", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				case "command parameters":
					interface_request_resolver.imp_resolve_reference__command__command_execution(data, function (err, $_ref_command_execution) {
						if (err) {
							onResolved(true);
						} else {
							onResolved(null, $_ref_command_execution.properties["parameters"]);
						}
					}, onError);
					break;
				case "context node":
					interface_request_resolver.resolveComponentOutputParameter_id_path(data.properties["context_node"],"result node", function (err, $_cto_param_result_node) {
						if (err) {
							onResolved(true);
						} else {
							onResolved(null, $_cto_param_result_node);
						}
					}, onError);
					break;
				default:
					onResolved(true);
			}
		},
		onError, lazy
	);
	meta_table.constraints_to_check.push(function (onError) {
	});
	data.properties.command = createReference($["command"]);
	resolveLazy(data, data.properties.command, meta_table, resolver.imp_resolve_reference__command__command_execution, onError, lazy)
	data.properties.context_keys = decorate_context_keys(api, $["context keys"], data, "context keys", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				case "interface":
					data.parent.imp_resolveGlobalInputParameter("interface", function (err, $_i_param_interface) {
						if (err) {
							onResolved(true);
						} else {
							onResolved(null, $_i_param_interface);
						}
					}, onError);
					break;
				default:
					onResolved(true);
			}
		},
		onError, lazy
	);
	meta_table.constraints_to_check.push(function (onError) {
	});
	data.properties.context_node = decorate_id_path(api, $["context node"], data, "context node", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				case "context node":
					data.parent.imp_resolveGlobalInputParameter("interface", function (err, $_i_param_interface) {
						if (err) {
							onResolved(true);
						} else {
							onResolved(null, $_i_param_interface.properties["root"]);
						}
					}, onError);
					break;
				default:
					onResolved(true);
			}
		},
		onError, lazy
	);
	meta_table.constraints_to_check.push(function (onError) {
	});
	return data;
}
export function imp_decorate_no__initialization_data_requested(api, $:Naked_no__initialization_data_requested, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cno__initialization_data_requested();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	return data;
}
export function imp_decorate_yes__initialization_data_requested(api, $:Naked_yes__initialization_data_requested, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cyes__initialization_data_requested();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	return data;
}
let StateLookup__initialization_data_requested__subscribe = {
"no": imp_decorate_no__initialization_data_requested,
"yes": imp_decorate_yes__initialization_data_requested
};
export function imp_decorate_subscribe(api, $:Naked_subscribe, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Csubscribe();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.context_keys = decorate_context_keys(api, $["context keys"], data, "context keys", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				case "interface":
					data.parent.imp_resolveGlobalInputParameter("interface", function (err, $_i_param_interface) {
						if (err) {
							onResolved(true);
						} else {
							onResolved(null, $_i_param_interface);
						}
					}, onError);
					break;
				default:
					onResolved(true);
			}
		},
		onError, lazy
	);
	meta_table.constraints_to_check.push(function (onError) {
	});
	data.properties.initialization_data_requested = new read_api.StateGroup<any, any>({name:$["initialization data requested"][0], node:(StateLookup__initialization_data_requested__subscribe[$["initialization data requested"][0]] as any)(api, $["initialization data requested"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__initialization_data_requested__subscribe = {
	};
	return data;
}
export function imp_decorate_unsubscribe(api, $:Naked_unsubscribe, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cunsubscribe();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	return data;
}
export function imp_decorate_file(api, $:Naked_file, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cfile();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"file": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["file"], meta_table, resolver.imp_resolveStateContextValue__file__file, onError, lazy)
	data.properties.extension = $["extension"];
	data.properties.token = $["token"];
	return data;
}
export function imp_decorate_entries(api, $:Naked_entries, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy = false) { 
	var data = new api.Centries();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.key = collection_key;
	data.properties.arguments = decorate_command_arguments(api, $["arguments"], data, "arguments", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				case "command parameters":
					interface_request_resolver.imp_resolveStateContextValue__matrix__matrix(data.parent, function (err, $_scv_matrix) {
						if (err) {
							onResolved(true);
						} else {
							onResolved(null, $_scv_matrix.properties["parameters"]);
						}
					}, onError);
					break;
				case "context node":
					data.parent.parent.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
						if (err) {
							onResolved(true);
						} else {
							onResolved(null, $_i_param_context_node);
						}
					}, onError);
					break;
				default:
					onResolved(true);
			}
		},
		onError, lazy
	);
	meta_table.constraints_to_check.push(function (onError) {
	});
	return data;
}
export function imp_decorate_matrix(api, $:Naked_matrix, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cmatrix();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"matrix": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["matrix"], meta_table, resolver.imp_resolveStateContextValue__matrix__matrix, onError, lazy)
	var collection_entries = {};
	var source_collection_entries = $["entries"] || {};
	function collection_entries_value_function(vk:string) {
	return imp_decorate_entries(api, $["entries"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
	}
	for (var k in source_collection_entries ) {
		decorateLazy(collection_entries, k, collection_entries_value_function, lazy);
	}
	data.properties.entries = new read_api.Dictionary(data, "entries", collection_entries);
	return data;
}
export function imp_decorate_number(api, $:Naked_number, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cnumber();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"number": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["number"], meta_table, resolver.imp_resolveStateContextValue__number__number, onError, lazy)
	data.properties.number = $["number"];
	return data;
}
export function imp_decorate_reference(api, $:Naked_reference, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Creference();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"reference": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["reference"], meta_table, resolver.imp_resolveStateContextValue__reference__reference, onError, lazy)
	data.properties.entry = $["entry"];
	return data;
}
export function imp_decorate_state_group(api, $:Naked_state_group, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cstate_group();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"state group": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["state group"], meta_table, resolver.imp_resolveStateContextValue__state_group__state_group, onError, lazy)
	data.properties.arguments = decorate_command_arguments(api, $["arguments"], data, "arguments", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				case "command parameters":
					interface_request_resolver.imp_resolve_reference__state__state_group(data, function (err, $_ref_state_group) {
						if (err) {
							onResolved(true);
						} else {
							onResolved(null, $_ref_state_group.properties["parameters"]);
						}
					}, onError);
					break;
				case "context node":
					data.parent.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
						if (err) {
							onResolved(true);
						} else {
							onResolved(null, $_i_param_context_node);
						}
					}, onError);
					break;
				default:
					onResolved(true);
			}
		},
		onError, lazy
	);
	meta_table.constraints_to_check.push(function (onError) {
	});
	data.properties.state = createReference($["state"]);
	resolveLazy(data, data.properties.state, meta_table, resolver.imp_resolve_reference__state__state_group, onError, lazy)
	return data;
}
export function imp_decorate_text(api, $:Naked_text, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Ctext();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"text": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["text"], meta_table, resolver.imp_resolveStateContextValue__text__text, onError, lazy)
	data.properties.text = $["text"];
	return data;
}
let StateLookup__type__properties = {
"file": imp_decorate_file,
"matrix": imp_decorate_matrix,
"number": imp_decorate_number,
"reference": imp_decorate_reference,
"state group": imp_decorate_state_group,
"text": imp_decorate_text
};
export function imp_decorate_properties(api, $:Naked_properties, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy = false) { 
	var data = new api.Cproperties();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.key = {
		entry: collection_key,
		referenced_node: null,
		resolution_status: 'unresolved'
	};
	resolveLazy(data, data.key, meta_table, resolver.imp_resolve_matrix_key__properties, onError, lazy)
	data.properties.type = new read_api.StateGroup<any, any>({name:$["type"][0], node:(StateLookup__type__properties[$["type"][0]] as any)(api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__type__properties = {
	};
	return data;
}
export function imp_decorate_command_arguments(api, $:Naked_command_arguments, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy = false) { 
	var data = new api.Ccommand_arguments();
	data.location = containing_node;
	data.property_component_name = property_name;
	data.output_parameters = {
	};
	data.imp_resolveInputParameter = resolveInputParameter;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	var collection_properties = {};
	var source_collection_properties = $["properties"] || {};
	function collection_properties_value_function(vk:string) {
	return imp_decorate_properties(api, $["properties"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
	}
	for (var k in source_collection_properties ) {
		decorateLazy(collection_properties, k, collection_properties_value_function, lazy);
	}
	data.properties.properties = new read_api.Matrix(data, "properties", collection_properties);
	meta_table.dense_matrices_to_validate.push(function (onError) {
		imp_verifyDenseness__properties__command_arguments(data, onError);
	});
	return data;
}
export function imp_decorate_context_keys__context_keys(api, $:Naked_context_keys__context_keys, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy = false) { 
	var data = new api.Ccontext_keys__context_keys();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.key = {
		entry: collection_key,
		referenced_node: null,
		resolution_status: 'unresolved'
	};
	resolveLazy(data, data.key, meta_table, resolver.imp_resolve_matrix_key__context_keys__context_keys, onError, lazy)
	data.properties.value = $["value"];
	return data;
}
export function imp_decorate_context_keys__interface_request(api, $:Naked_context_keys__interface_request, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy = false) { 
	var data = new api.Ccontext_keys__interface_request();
	data.location = containing_node;
	data.property_component_name = property_name;
	data.output_parameters = {
	};
	data.imp_resolveInputParameter = resolveInputParameter;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	var collection_context_keys__context_keys = {};
	var source_collection_context_keys__context_keys = $["context keys"] || {};
	function collection_context_keys__context_keys_value_function(vk:string) {
	return imp_decorate_context_keys__context_keys(api, $["context keys"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
	}
	for (var k in source_collection_context_keys__context_keys ) {
		decorateLazy(collection_context_keys__context_keys, k, collection_context_keys__context_keys_value_function, lazy);
	}
	data.properties.context_keys = new read_api.Matrix(data, "context keys", collection_context_keys__context_keys);
	meta_table.dense_matrices_to_validate.push(function (onError) {
		imp_verifyDenseness__context_keys__context_keys__interface_request(data, onError);
	});
	return data;
}
export function imp_decorate_no__has_steps(api, $:Naked_no__has_steps, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cno__has_steps();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	return data;
}
export function imp_decorate_collection_entry(api, $:Naked_collection_entry, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Ccollection_entry();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.collection = createReference($["collection"]);
	resolveLazy(data, data.properties.collection, meta_table, resolver.imp_resolve_reference__collection__collection_entry, onError, lazy)
	data.properties.id = $["id"];
	return data;
}
export function imp_decorate_component(api, $:Naked_component, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Ccomponent();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.component = createReference($["component"]);
	resolveLazy(data, data.properties.component, meta_table, resolver.imp_resolve_reference__component__component, onError, lazy)
	return data;
}
export function imp_decorate_group(api, $:Naked_group, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cgroup();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.group = createReference($["group"]);
	resolveLazy(data, data.properties.group, meta_table, resolver.imp_resolve_reference__group__group, onError, lazy)
	return data;
}
export function imp_decorate_state(api, $:Naked_state, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cstate();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.state = createReference($["state"]);
	resolveLazy(data, data.properties.state, meta_table, resolver.imp_resolve_reference__state__state, onError, lazy)
	data.properties.state_group = createReference($["state group"]);
	resolveLazy(data, data.properties.state_group, meta_table, resolver.imp_resolve_reference__state_group__state, onError, lazy)
	return data;
}
let StateLookup__type__yes__has_steps = {
"collection entry": imp_decorate_collection_entry,
"component": imp_decorate_component,
"group": imp_decorate_group,
"state": imp_decorate_state
};
export function imp_decorate_yes__has_steps(api, $:Naked_yes__has_steps, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cyes__has_steps();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.tail = decorate_id_path(api, $["tail"], data, "tail", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				case "context node":
					interface_request_resolver.imp_resolveStateOutputParameter__type__yes__has_steps(data, "result node", function (err, $_sgo_yes__has_steps) {
						if (err) {
							onResolved(true);
						} else {
							$_sgo_yes__has_steps.reference_selections_count += 1;
							onResolved(null, $_sgo_yes__has_steps);
						}
					}, onError);
					break;
				default:
					onResolved(true);
			}
		},
		onError, lazy
	);
	meta_table.constraints_to_check.push(function (onError) {
	});
	data.properties.type = new read_api.StateGroup<any, any>({name:$["type"][0], node:(StateLookup__type__yes__has_steps[$["type"][0]] as any)(api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__type__yes__has_steps = {
		"result node": {
			"referenced_node": null,
			"resolution_status": "unresolved"
		}
	};
	resolveLazyWithKey(data, data.output_parameters__type__yes__has_steps, "result node", meta_table, resolver.imp_resolveStateOutputParameter__type__yes__has_steps, onError, lazy)
	return data;
}
let StateLookup__has_steps__id_path = {
"no": imp_decorate_no__has_steps,
"yes": imp_decorate_yes__has_steps
};
export function imp_decorate_id_path(api, $:Naked_id_path, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy = false) { 
	var data = new api.Cid_path();
	data.location = containing_node;
	data.property_component_name = property_name;
	data.output_parameters = {
		"result node": {
			"referenced_node": null,
			"resolution_status": "unresolved"
		}
	};
	resolveLazyWithKey(data, data.output_parameters,"result node", meta_table, resolver.resolveComponentOutputParameter_id_path, onError, lazy);
	data.imp_resolveInputParameter = resolveInputParameter;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.properties.has_steps = new read_api.StateGroup<any, any>({name:$["has steps"][0], node:(StateLookup__has_steps__id_path[$["has steps"][0]] as any)(api, $["has steps"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__has_steps__id_path = {
		"result node": {
			"referenced_node": null,
			"resolution_status": "unresolved"
		}
	};
	resolveLazyWithKey(data, data.output_parameters__has_steps__id_path, "result node", meta_table, resolver.imp_resolveStateOutputParameter__has_steps__id_path, onError, lazy)
	return data;
}
let StateLookup__type__interface_request = {
"command execution": imp_decorate_command_execution,
"subscribe": imp_decorate_subscribe,
"unsubscribe": imp_decorate_unsubscribe
};
export function imp_decorate_interface_request(api, $:Naked_interface_request, containing_node, meta_table, onError, input_parameters, lazy = false) { 
	var data = new api.Cinterface_request();
	function resolveGlobalInputParameter(param, onResolved, onError) {
		switch (param) {
			case "interface":
				if (input_parameters["interface"]) {
					onResolved(null, input_parameters["interface"]);
				} else {
					onError({
						message: 'Global type input parameter interface is not defined!',
						path: data.getPath()
					});
					onResolved(true);
				}
				break;
			default:
				onResolved(true);
		}
	};
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.properties.type = new read_api.StateGroup<any, any>({name:$["type"][0], node:(StateLookup__type__interface_request[$["type"][0]] as any)(api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__type__interface_request = {
	};
	return data;
}
var imp_verifyDenseness__properties__command_arguments;
imp_verifyDenseness__properties__command_arguments = function (data, onError) {
	data.imp_resolveInputParameter("command parameters", function (err, $_i_param_command_parameters) {
		if (err) {
		} else {
			for (var $_entry in $_i_param_command_parameters.properties.properties["entries"]) {
				if (!$_i_param_command_parameters.properties.properties["entries"].hasOwnProperty($_entry)) { continue; }
				if (!data.properties.properties["entries"][$_entry]) {
					onError({
						message: 'Missing entry in densematrix for referenced property.',
						path: data.getPath(),
						"target path": $_i_param_command_parameters.getPath(),
						"current entries": Object.keys(data.properties.properties["entries"]),
						entry: $_entry
					});
				}
			}
		}
	}, onError);

};
var imp_verifyDenseness__context_keys__context_keys__interface_request;
imp_verifyDenseness__context_keys__context_keys__interface_request = function (data, onError) {
	data.imp_resolveInputParameter("interface", function (err, $_i_param_interface) {
		if (err) {
		} else {
			for (var $_entry in $_i_param_interface.properties.context_keys["entries"]) {
				if (!$_i_param_interface.properties.context_keys["entries"].hasOwnProperty($_entry)) { continue; }
				if (!data.properties.context_keys["entries"][$_entry]) {
					onError({
						message: 'Missing entry in densematrix for referenced property.',
						path: data.getPath(),
						"target path": $_i_param_interface.getPath(),
						"current entries": Object.keys(data.properties.context_keys["entries"]),
						entry: $_entry
					});
				}
			}
		}
	}, onError);

};
export function decorate_command_arguments (api, $:Naked_command_arguments, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy = false) {
	return imp_decorate_command_arguments(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
export function decorate_context_keys (api, $:Naked_context_keys__interface_request, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy = false) {
	return imp_decorate_context_keys__interface_request(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
export function decorate_id_path (api, $:Naked_id_path, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy = false) {
	return imp_decorate_id_path(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
export function int_decorate(api, $:Naked_interface_request, input_parameters?, onError?:(err?:string) => void, lazy = false) {
	var meta_table = { referencers_to_resolve: [], dense_matrices_to_validate: [], constraints_to_check: [] };
	if (!onError) {
		onError = function (err) { console.error(JSON.stringify(err, null, '\t')); };
	}
	var node = imp_decorate_interface_request(api, $, null, meta_table, onError, input_parameters, lazy);
	if (!lazy) {
		//reference resolving
		var ri;
		for (ri = 0; ri < meta_table.referencers_to_resolve.length; ri += 1) {
			meta_table.referencers_to_resolve[ri](function () {}, onError);
		}
		var ry;
		for (ry = 0; ry < meta_table.dense_matrices_to_validate.length; ry += 1) {
			meta_table.dense_matrices_to_validate[ry](onError);
		}
		var rz;
		for (rz = 0; rz < meta_table.constraints_to_check.length; rz += 1) {
			meta_table.constraints_to_check[rz](onError);
		}
	}return node;
}
export function decorate($:Naked_interface_request, input_parameters:{
'interface':interface.Cinterface}, onError?:(err?:string) => void):read_api.Cinterface_request {
	return int_decorate(read_api, $, input_parameters, onError, false);
}
export function lazy_decorate($:Naked_interface_request, input_parameters:{
'interface':interface.Cinterface}, onError?:(err?:string) => void):read_api.Cinterface_request {
	return int_decorate(read_api, $, input_parameters, onError, true);
}
