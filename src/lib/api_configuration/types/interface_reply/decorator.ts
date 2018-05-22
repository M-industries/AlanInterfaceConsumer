import * as id from './identifier';
import * as read_api from "./read_api";
import * as resolver from "./reference_resolver";
import * as interface_reply from "./read_api";
import * as interface_reply_resolver from "./reference_resolver";
import * as interface from "../interface/read_api";
import * as interface_resolver from "../interface/reference_resolver";
import * as interface_request from "../interface_request/read_api";
import * as interface_request_resolver from "../interface_request/reference_resolver";
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
export type States_type__interface_reply = ['initialization', Naked_initialization]|['notification', Naked_notification];
export type States_has_initialization_data__initialization = ['no', Naked_no__has_initialization_data]|['yes', Naked_yes__has_initialization_data];
export type Naked_no__has_initialization_data = {
	_typescript_dummy_no__has_initialization_data?:boolean;
};
export type States_context_exists__yes__has_initialization_data = ['no', Naked_no__context_exists]|['yes', Naked_yes__context_exists];
export type Naked_no__context_exists = {
	_typescript_dummy_no__context_exists?:boolean;
};
export type Naked_yes__context_exists = {
	'root': Naked_initialize_node;
	_typescript_dummy_yes__context_exists?:boolean;
};
export type Naked_yes__has_initialization_data = {
	'context exists': States_context_exists__yes__has_initialization_data;
	_typescript_dummy_yes__has_initialization_data?:boolean;
};
export type Naked_initialization = {
	'has initialization data': States_has_initialization_data__initialization;
	_typescript_dummy_initialization?:boolean;
};
export type States_type__notification = ['create', Naked_create__type__notification]|['remove', Naked_remove__type__notification]|['update', Naked_update__type__notification];
export type Naked_create__type__notification = {
	'initialize node': Naked_initialize_node;
	_typescript_dummy_create__type__notification?:boolean;
};
export type Naked_remove__type__notification = {
	_typescript_dummy_remove__type__notification?:boolean;
};
export type Naked_update__type__notification = {
	'update node': Naked_update_node;
	_typescript_dummy_update__type__notification?:boolean;
};
export type Naked_notification = {
	'type': States_type__notification;
	_typescript_dummy_notification?:boolean;
};
export type Naked_interface_reply = {
	'type': States_type__interface_reply;
	_typescript_dummy_interface_reply?:boolean;
};
export type Naked_delete_node = {
	_typescript_dummy_delete_node?:boolean;
};
export type States_type__properties__initialize_node = ['collection', Naked_collection__type__properties__initialize_node]|['component', Naked_component__type__properties__initialize_node]|['file', Naked_file__type__properties__initialize_node]|['group', Naked_group__type__properties__initialize_node]|['number', Naked_number__type__properties__initialize_node]|['reference', Naked_reference__type__properties__initialize_node]|['state group', Naked_state_group__type__properties__initialize_node]|['text', Naked_text__type__properties__initialize_node];
export type Naked_entries__collection__type__properties__initialize_node = {
	'node': Naked_initialize_node;
	_typescript_dummy_entries__collection__type__properties__initialize_node?:boolean;
};
export type States_type__collection__type__properties__initialize_node = ['dictionary', Naked_dictionary__type__collection__type__properties__initialize_node]|['matrix', Naked_matrix__type__collection__type__properties__initialize_node];
export type Naked_dictionary__type__collection__type__properties__initialize_node = {
	_typescript_dummy_dictionary__type__collection__type__properties__initialize_node?:boolean;
};
export type Naked_matrix__type__collection__type__properties__initialize_node = {
	_typescript_dummy_matrix__type__collection__type__properties__initialize_node?:boolean;
};
export type Naked_collection__type__properties__initialize_node = {
	'entries'?: {[key:string]: Naked_entries__collection__type__properties__initialize_node};
	'type': States_type__collection__type__properties__initialize_node;
	_typescript_dummy_collection__type__properties__initialize_node?:boolean;
};
export type Naked_component__type__properties__initialize_node = {
	'node': Naked_initialize_node;
	_typescript_dummy_component__type__properties__initialize_node?:boolean;
};
export type Naked_file__type__properties__initialize_node = {
	'extension': string;
	'token': string;
	_typescript_dummy_file__type__properties__initialize_node?:boolean;
};
export type Naked_group__type__properties__initialize_node = {
	'node': Naked_initialize_node;
	_typescript_dummy_group__type__properties__initialize_node?:boolean;
};
export type States_type__number__type__properties__initialize_node = ['integer', Naked_integer__type__number__type__properties__initialize_node]|['natural', Naked_natural__type__number__type__properties__initialize_node];
export type Naked_integer__type__number__type__properties__initialize_node = {
	'value': number;
	_typescript_dummy_integer__type__number__type__properties__initialize_node?:boolean;
};
export type Naked_natural__type__number__type__properties__initialize_node = {
	'value': number;
	_typescript_dummy_natural__type__number__type__properties__initialize_node?:boolean;
};
export type Naked_number__type__properties__initialize_node = {
	'type': States_type__number__type__properties__initialize_node;
	_typescript_dummy_number__type__properties__initialize_node?:boolean;
};
export type Naked_reference__type__properties__initialize_node = {
	'referenced node': string;
	_typescript_dummy_reference__type__properties__initialize_node?:boolean;
};
export type Naked_state_group__type__properties__initialize_node = {
	'node': Naked_initialize_node;
	'state': string;
	_typescript_dummy_state_group__type__properties__initialize_node?:boolean;
};
export type Naked_text__type__properties__initialize_node = {
	'value': string;
	_typescript_dummy_text__type__properties__initialize_node?:boolean;
};
export type Naked_properties__initialize_node = {
	'type': States_type__properties__initialize_node;
	_typescript_dummy_properties__initialize_node?:boolean;
};
export type Naked_initialize_node = {
	'properties'?: {[key:string]: Naked_properties__initialize_node};
	_typescript_dummy_initialize_node?:boolean;
};
export type States_type__properties__update_node = ['collection', Naked_collection__type__properties__update_node]|['component', Naked_component__type__properties__update_node]|['file', Naked_file__type__properties__update_node]|['group', Naked_group__type__properties__update_node]|['number', Naked_number__type__properties__update_node]|['reference', Naked_reference__type__properties__update_node]|['state group', Naked_state_group__type__properties__update_node]|['text', Naked_text__type__properties__update_node];
export type States_type__entries__collection__type__properties__update_node = ['create', Naked_create__type__entries]|['remove', Naked_remove__type__entries]|['rename', Naked_rename]|['update', Naked_update__type__entries];
export type Naked_create__type__entries = {
	'node': Naked_initialize_node;
	_typescript_dummy_create__type__entries?:boolean;
};
export type Naked_remove__type__entries = {
	'delete node': Naked_delete_node;
	_typescript_dummy_remove__type__entries?:boolean;
};
export type Naked_rename = {
	'old id': string;
	_typescript_dummy_rename?:boolean;
};
export type States_invalidate_referencer__update__type__entries = ['no', Naked_no__invalidate_referencer]|['yes', Naked_yes__invalidate_referencer];
export type Naked_no__invalidate_referencer = {
	_typescript_dummy_no__invalidate_referencer?:boolean;
};
export type Naked_yes__invalidate_referencer = {
	_typescript_dummy_yes__invalidate_referencer?:boolean;
};
export type Naked_update__type__entries = {
	'invalidate referencer': States_invalidate_referencer__update__type__entries;
	'update node': Naked_update_node;
	_typescript_dummy_update__type__entries?:boolean;
};
export type Naked_entries__collection__type__properties__update_node = {
	'type': States_type__entries__collection__type__properties__update_node;
	_typescript_dummy_entries__collection__type__properties__update_node?:boolean;
};
export type States_type__collection__type__properties__update_node = ['dictionary', Naked_dictionary__type__collection__type__properties__update_node]|['matrix', Naked_matrix__type__collection__type__properties__update_node];
export type Naked_dictionary__type__collection__type__properties__update_node = {
	_typescript_dummy_dictionary__type__collection__type__properties__update_node?:boolean;
};
export type Naked_matrix__type__collection__type__properties__update_node = {
	_typescript_dummy_matrix__type__collection__type__properties__update_node?:boolean;
};
export type Naked_collection__type__properties__update_node = {
	'entries'?: {[key:string]: Naked_entries__collection__type__properties__update_node};
	'type': States_type__collection__type__properties__update_node;
	_typescript_dummy_collection__type__properties__update_node?:boolean;
};
export type Naked_component__type__properties__update_node = {
	'update node': Naked_update_node;
	_typescript_dummy_component__type__properties__update_node?:boolean;
};
export type Naked_file__type__properties__update_node = {
	'new extension': string;
	'new token': string;
	_typescript_dummy_file__type__properties__update_node?:boolean;
};
export type Naked_group__type__properties__update_node = {
	'update node': Naked_update_node;
	_typescript_dummy_group__type__properties__update_node?:boolean;
};
export type States_type__number__type__properties__update_node = ['integer', Naked_integer__type__number__type__properties__update_node]|['natural', Naked_natural__type__number__type__properties__update_node];
export type Naked_integer__type__number__type__properties__update_node = {
	'new value': number;
	_typescript_dummy_integer__type__number__type__properties__update_node?:boolean;
};
export type Naked_natural__type__number__type__properties__update_node = {
	'new value': number;
	_typescript_dummy_natural__type__number__type__properties__update_node?:boolean;
};
export type Naked_number__type__properties__update_node = {
	'type': States_type__number__type__properties__update_node;
	_typescript_dummy_number__type__properties__update_node?:boolean;
};
export type Naked_reference__type__properties__update_node = {
	'new referenced node': string;
	_typescript_dummy_reference__type__properties__update_node?:boolean;
};
export type States_type__state_group__type__properties__update_node = ['set', Naked_set]|['update', Naked_update__type__state_group];
export type Naked_set = {
	'delete node': Naked_delete_node;
	'node': Naked_initialize_node;
	_typescript_dummy_set?:boolean;
};
export type Naked_update__type__state_group = {
	'update node': Naked_update_node;
	_typescript_dummy_update__type__state_group?:boolean;
};
export type Naked_state_group__type__properties__update_node = {
	'state': string;
	'type': States_type__state_group__type__properties__update_node;
	_typescript_dummy_state_group__type__properties__update_node?:boolean;
};
export type Naked_text__type__properties__update_node = {
	'new value': string;
	_typescript_dummy_text__type__properties__update_node?:boolean;
};
export type Naked_properties__update_node = {
	'type': States_type__properties__update_node;
	_typescript_dummy_properties__update_node?:boolean;
};
export type Naked_update_node = {
	'properties'?: {[key:string]: Naked_properties__update_node};
	_typescript_dummy_update_node?:boolean;
};
export function imp_decorate_no__has_initialization_data(api, $:Naked_no__has_initialization_data, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cno__has_initialization_data();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"source": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["source"], meta_table, resolver.imp_resolveStateContextValue__source__no__has_initialization_data, onError, lazy)
	return data;
}
export function imp_decorate_no__context_exists(api, $:Naked_no__context_exists, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cno__context_exists();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	return data;
}
export function imp_decorate_yes__context_exists(api, $:Naked_yes__context_exists, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cyes__context_exists();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.root = decorate_initialize_node(api, $["root"], data, "root", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				case "context node":
					data.parent.parent.parent.imp_resolveGlobalInputParameter("interface", function (err, $_i_param_interface) {
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
let StateLookup__context_exists__yes__has_initialization_data = {
"no": imp_decorate_no__context_exists,
"yes": imp_decorate_yes__context_exists
};
export function imp_decorate_yes__has_initialization_data(api, $:Naked_yes__has_initialization_data, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cyes__has_initialization_data();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"source": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["source"], meta_table, resolver.imp_resolveStateContextValue__source__yes__has_initialization_data, onError, lazy)
	data.properties.context_exists = new read_api.StateGroup<any, any>({name:$["context exists"][0], node:(StateLookup__context_exists__yes__has_initialization_data[$["context exists"][0]] as any)(api, $["context exists"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__context_exists__yes__has_initialization_data = {
	};
	return data;
}
let StateLookup__has_initialization_data__initialization = {
"no": imp_decorate_no__has_initialization_data,
"yes": imp_decorate_yes__has_initialization_data
};
export function imp_decorate_initialization(api, $:Naked_initialization, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cinitialization();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"source": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["source"], meta_table, resolver.imp_resolveStateContextValue__source__initialization, onError, lazy)
	data.properties.has_initialization_data = new read_api.StateGroup<any, any>({name:$["has initialization data"][0], node:(StateLookup__has_initialization_data__initialization[$["has initialization data"][0]] as any)(api, $["has initialization data"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__has_initialization_data__initialization = {
	};
	return data;
}
export function imp_decorate_create__type__notification(api, $:Naked_create__type__notification, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Ccreate__type__notification();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.initialize_node = decorate_initialize_node(api, $["initialize node"], data, "initialize node", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				case "context node":
					data.parent.parent.imp_resolveGlobalInputParameter("interface", function (err, $_i_param_interface) {
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
export function imp_decorate_remove__type__notification(api, $:Naked_remove__type__notification, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cremove__type__notification();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	return data;
}
export function imp_decorate_update__type__notification(api, $:Naked_update__type__notification, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cupdate__type__notification();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.update_node = decorate_update_node(api, $["update node"], data, "update node", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				case "context node":
					data.parent.parent.imp_resolveGlobalInputParameter("interface", function (err, $_i_param_interface) {
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
let StateLookup__type__notification = {
"create": imp_decorate_create__type__notification,
"remove": imp_decorate_remove__type__notification,
"update": imp_decorate_update__type__notification
};
export function imp_decorate_notification(api, $:Naked_notification, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cnotification();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"source": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["source"], meta_table, resolver.imp_resolveStateContextValue__source__notification, onError, lazy)
	data.properties.type = new read_api.StateGroup<any, any>({name:$["type"][0], node:(StateLookup__type__notification[$["type"][0]] as any)(api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__type__notification = {
	};
	return data;
}
export function imp_decorate_delete_node(api, $:Naked_delete_node, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy = false) { 
	var data = new api.Cdelete_node();
	data.location = containing_node;
	data.property_component_name = property_name;
	data.output_parameters = {
	};
	data.imp_resolveInputParameter = resolveInputParameter;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	return data;
}
export function imp_decorate_entries__collection__type__properties__initialize_node(api, $:Naked_entries__collection__type__properties__initialize_node, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy = false) { 
	var data = new api.Centries__collection__type__properties__initialize_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.key = collection_key;
	data.properties.node = decorate_initialize_node(api, $["node"], data, "node", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				case "context node":
					interface_reply_resolver.imp_resolveStateContextValue__collection__collection__type__properties__initialize_node(data.parent, function (err, $_scv_collection) {
						if (err) {
							onResolved(true);
						} else {
							onResolved(null, $_scv_collection.properties["node"]);
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
export function imp_decorate_dictionary__type__collection__type__properties__initialize_node(api, $:Naked_dictionary__type__collection__type__properties__initialize_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cdictionary__type__collection__type__properties__initialize_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"dictionary": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["dictionary"], meta_table, resolver.imp_resolveStateContextValue__dictionary__dictionary__type__collection__type__properties__initialize_node, onError, lazy)
	return data;
}
export function imp_decorate_matrix__type__collection__type__properties__initialize_node(api, $:Naked_matrix__type__collection__type__properties__initialize_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cmatrix__type__collection__type__properties__initialize_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"matrix": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["matrix"], meta_table, resolver.imp_resolveStateContextValue__matrix__matrix__type__collection__type__properties__initialize_node, onError, lazy)
	return data;
}
let StateLookup__type__collection__type__properties__initialize_node = {
"dictionary": imp_decorate_dictionary__type__collection__type__properties__initialize_node,
"matrix": imp_decorate_matrix__type__collection__type__properties__initialize_node
};
export function imp_decorate_collection__type__properties__initialize_node(api, $:Naked_collection__type__properties__initialize_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Ccollection__type__properties__initialize_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"collection": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["collection"], meta_table, resolver.imp_resolveStateContextValue__collection__collection__type__properties__initialize_node, onError, lazy)
	var collection_entries__collection__type__properties__initialize_node = {};
	var source_collection_entries__collection__type__properties__initialize_node = $["entries"] || {};
	function collection_entries__collection__type__properties__initialize_node_value_function(vk:string) {
	return imp_decorate_entries__collection__type__properties__initialize_node(api, $["entries"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
	}
	for (var k in source_collection_entries__collection__type__properties__initialize_node ) {
		decorateLazy(collection_entries__collection__type__properties__initialize_node, k, collection_entries__collection__type__properties__initialize_node_value_function, lazy);
	}
	data.properties.entries = new read_api.Dictionary(data, "entries", collection_entries__collection__type__properties__initialize_node);
	data.properties.type = new read_api.StateGroup<any, any>({name:$["type"][0], node:(StateLookup__type__collection__type__properties__initialize_node[$["type"][0]] as any)(api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__type__collection__type__properties__initialize_node = {
	};
	return data;
}
export function imp_decorate_component__type__properties__initialize_node(api, $:Naked_component__type__properties__initialize_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Ccomponent__type__properties__initialize_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"component": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["component"], meta_table, resolver.imp_resolveStateContextValue__component__component__type__properties__initialize_node, onError, lazy)
	data.properties.node = decorate_initialize_node(api, $["node"], data, "node", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				case "context node":
					interface_reply_resolver.imp_resolveStateContextValue__component__component__type__properties__initialize_node(data, function (err, $_scv_component) {
						if (err) {
							onResolved(true);
						} else {
							interface_resolver.imp_resolve_reference__type__component($_scv_component, function (err, $_ref_component) {
								if (err) {
									onResolved(true);
								} else {
									onResolved(null, $_ref_component.properties["node"]);
								}
							}, onError);
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
export function imp_decorate_file__type__properties__initialize_node(api, $:Naked_file__type__properties__initialize_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cfile__type__properties__initialize_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"text": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["text"], meta_table, resolver.imp_resolveStateContextValue__text__file__type__properties__initialize_node, onError, lazy)
	data.properties.extension = $["extension"];
	data.properties.token = $["token"];
	return data;
}
export function imp_decorate_group__type__properties__initialize_node(api, $:Naked_group__type__properties__initialize_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cgroup__type__properties__initialize_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"group": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["group"], meta_table, resolver.imp_resolveStateContextValue__group__group__type__properties__initialize_node, onError, lazy)
	data.properties.node = decorate_initialize_node(api, $["node"], data, "node", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				case "context node":
					interface_reply_resolver.imp_resolveStateContextValue__group__group__type__properties__initialize_node(data, function (err, $_scv_group) {
						if (err) {
							onResolved(true);
						} else {
							onResolved(null, $_scv_group.properties["node"]);
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
export function imp_decorate_integer__type__number__type__properties__initialize_node(api, $:Naked_integer__type__number__type__properties__initialize_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cinteger__type__number__type__properties__initialize_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"integer type": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["integer type"], meta_table, resolver.imp_resolveStateContextValue__integer_type__integer__type__number__type__properties__initialize_node, onError, lazy)
	data.properties.value = $["value"];
	return data;
}
export function imp_decorate_natural__type__number__type__properties__initialize_node(api, $:Naked_natural__type__number__type__properties__initialize_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cnatural__type__number__type__properties__initialize_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"natural type": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["natural type"], meta_table, resolver.imp_resolveStateContextValue__natural_type__natural__type__number__type__properties__initialize_node, onError, lazy)
	data.properties.value = $["value"];
	return data;
}
let StateLookup__type__number__type__properties__initialize_node = {
"integer": imp_decorate_integer__type__number__type__properties__initialize_node,
"natural": imp_decorate_natural__type__number__type__properties__initialize_node
};
export function imp_decorate_number__type__properties__initialize_node(api, $:Naked_number__type__properties__initialize_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cnumber__type__properties__initialize_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"number": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["number"], meta_table, resolver.imp_resolveStateContextValue__number__number__type__properties__initialize_node, onError, lazy)
	data.properties.type = new read_api.StateGroup<any, any>({name:$["type"][0], node:(StateLookup__type__number__type__properties__initialize_node[$["type"][0]] as any)(api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__type__number__type__properties__initialize_node = {
	};
	return data;
}
export function imp_decorate_reference__type__properties__initialize_node(api, $:Naked_reference__type__properties__initialize_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Creference__type__properties__initialize_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"reference": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["reference"], meta_table, resolver.imp_resolveStateContextValue__reference__reference__type__properties__initialize_node, onError, lazy)
	data.properties.referenced_node = $["referenced node"];
	return data;
}
export function imp_decorate_state_group__type__properties__initialize_node(api, $:Naked_state_group__type__properties__initialize_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cstate_group__type__properties__initialize_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"state group": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["state group"], meta_table, resolver.imp_resolveStateContextValue__state_group__state_group__type__properties__initialize_node, onError, lazy)
	data.properties.node = decorate_initialize_node(api, $["node"], data, "node", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				case "context node":
					interface_reply_resolver.imp_resolve_reference__state__state_group__type__properties__initialize_node(data, function (err, $_ref_state_group__type__properties__initialize_node) {
						if (err) {
							onResolved(true);
						} else {
							onResolved(null, $_ref_state_group__type__properties__initialize_node.properties["node"]);
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
	resolveLazy(data, data.properties.state, meta_table, resolver.imp_resolve_reference__state__state_group__type__properties__initialize_node, onError, lazy)
	return data;
}
export function imp_decorate_text__type__properties__initialize_node(api, $:Naked_text__type__properties__initialize_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Ctext__type__properties__initialize_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"text": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["text"], meta_table, resolver.imp_resolveStateContextValue__text__text__type__properties__initialize_node, onError, lazy)
	data.properties.value = $["value"];
	return data;
}
let StateLookup__type__properties__initialize_node = {
"collection": imp_decorate_collection__type__properties__initialize_node,
"component": imp_decorate_component__type__properties__initialize_node,
"file": imp_decorate_file__type__properties__initialize_node,
"group": imp_decorate_group__type__properties__initialize_node,
"number": imp_decorate_number__type__properties__initialize_node,
"reference": imp_decorate_reference__type__properties__initialize_node,
"state group": imp_decorate_state_group__type__properties__initialize_node,
"text": imp_decorate_text__type__properties__initialize_node
};
export function imp_decorate_properties__initialize_node(api, $:Naked_properties__initialize_node, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy = false) { 
	var data = new api.Cproperties__initialize_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.key = {
		entry: collection_key,
		referenced_node: null,
		resolution_status: 'unresolved'
	};
	resolveLazy(data, data.key, meta_table, resolver.imp_resolve_matrix_key__properties__initialize_node, onError, lazy)
	data.properties.type = new read_api.StateGroup<any, any>({name:$["type"][0], node:(StateLookup__type__properties__initialize_node[$["type"][0]] as any)(api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__type__properties__initialize_node = {
	};
	return data;
}
export function imp_decorate_initialize_node(api, $:Naked_initialize_node, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy = false) { 
	var data = new api.Cinitialize_node();
	data.location = containing_node;
	data.property_component_name = property_name;
	data.output_parameters = {
	};
	data.imp_resolveInputParameter = resolveInputParameter;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	var collection_properties__initialize_node = {};
	var source_collection_properties__initialize_node = $["properties"] || {};
	function collection_properties__initialize_node_value_function(vk:string) {
	return imp_decorate_properties__initialize_node(api, $["properties"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
	}
	for (var k in source_collection_properties__initialize_node ) {
		decorateLazy(collection_properties__initialize_node, k, collection_properties__initialize_node_value_function, lazy);
	}
	data.properties.properties = new read_api.Matrix(data, "properties", collection_properties__initialize_node);
	meta_table.dense_matrices_to_validate.push(function (onError) {
		imp_verifyDenseness__properties__initialize_node(data, onError);
	});
	return data;
}
export function imp_decorate_create__type__entries(api, $:Naked_create__type__entries, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Ccreate__type__entries();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.node = decorate_initialize_node(api, $["node"], data, "node", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				case "context node":
					interface_reply_resolver.imp_resolveStateContextValue__collection__collection__type__properties__update_node(data.parent.parent, function (err, $_scv_collection) {
						if (err) {
							onResolved(true);
						} else {
							onResolved(null, $_scv_collection.properties["node"]);
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
export function imp_decorate_remove__type__entries(api, $:Naked_remove__type__entries, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cremove__type__entries();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.delete_node = decorate_delete_node(api, $["delete node"], data, "delete node", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
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
export function imp_decorate_rename(api, $:Naked_rename, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Crename();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.old_id = createReference($["old id"]);
	resolveLazy(data, data.properties.old_id, meta_table, resolver.imp_resolve_reference__old_id__rename, onError, lazy)
	return data;
}
export function imp_decorate_no__invalidate_referencer(api, $:Naked_no__invalidate_referencer, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cno__invalidate_referencer();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	return data;
}
export function imp_decorate_yes__invalidate_referencer(api, $:Naked_yes__invalidate_referencer, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cyes__invalidate_referencer();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"matrix": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["matrix"], meta_table, resolver.imp_resolveStateContextValue__matrix__yes__invalidate_referencer, onError, lazy)
	return data;
}
let StateLookup__invalidate_referencer__update__type__entries = {
"no": imp_decorate_no__invalidate_referencer,
"yes": imp_decorate_yes__invalidate_referencer
};
export function imp_decorate_update__type__entries(api, $:Naked_update__type__entries, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cupdate__type__entries();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.invalidate_referencer = new read_api.StateGroup<any, any>({name:$["invalidate referencer"][0], node:(StateLookup__invalidate_referencer__update__type__entries[$["invalidate referencer"][0]] as any)(api, $["invalidate referencer"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__invalidate_referencer__update__type__entries = {
	};
	data.properties.update_node = decorate_update_node(api, $["update node"], data, "update node", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				case "context node":
					interface_reply_resolver.imp_resolveStateContextValue__collection__collection__type__properties__update_node(data.parent.parent, function (err, $_scv_collection) {
						if (err) {
							onResolved(true);
						} else {
							onResolved(null, $_scv_collection.properties["node"]);
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
let StateLookup__type__entries__collection__type__properties__update_node = {
"create": imp_decorate_create__type__entries,
"remove": imp_decorate_remove__type__entries,
"rename": imp_decorate_rename,
"update": imp_decorate_update__type__entries
};
export function imp_decorate_entries__collection__type__properties__update_node(api, $:Naked_entries__collection__type__properties__update_node, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy = false) { 
	var data = new api.Centries__collection__type__properties__update_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.key = collection_key;
	data.properties.type = new read_api.StateGroup<any, any>({name:$["type"][0], node:(StateLookup__type__entries__collection__type__properties__update_node[$["type"][0]] as any)(api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__type__entries__collection__type__properties__update_node = {
	};
	return data;
}
export function imp_decorate_dictionary__type__collection__type__properties__update_node(api, $:Naked_dictionary__type__collection__type__properties__update_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cdictionary__type__collection__type__properties__update_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"dictionary": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["dictionary"], meta_table, resolver.imp_resolveStateContextValue__dictionary__dictionary__type__collection__type__properties__update_node, onError, lazy)
	return data;
}
export function imp_decorate_matrix__type__collection__type__properties__update_node(api, $:Naked_matrix__type__collection__type__properties__update_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cmatrix__type__collection__type__properties__update_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"matrix": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["matrix"], meta_table, resolver.imp_resolveStateContextValue__matrix__matrix__type__collection__type__properties__update_node, onError, lazy)
	return data;
}
let StateLookup__type__collection__type__properties__update_node = {
"dictionary": imp_decorate_dictionary__type__collection__type__properties__update_node,
"matrix": imp_decorate_matrix__type__collection__type__properties__update_node
};
export function imp_decorate_collection__type__properties__update_node(api, $:Naked_collection__type__properties__update_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Ccollection__type__properties__update_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"collection": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["collection"], meta_table, resolver.imp_resolveStateContextValue__collection__collection__type__properties__update_node, onError, lazy)
	var collection_entries__collection__type__properties__update_node = {};
	var source_collection_entries__collection__type__properties__update_node = $["entries"] || {};
	function collection_entries__collection__type__properties__update_node_value_function(vk:string) {
	return imp_decorate_entries__collection__type__properties__update_node(api, $["entries"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
	}
	for (var k in source_collection_entries__collection__type__properties__update_node ) {
		decorateLazy(collection_entries__collection__type__properties__update_node, k, collection_entries__collection__type__properties__update_node_value_function, lazy);
	}
	data.properties.entries = new read_api.Dictionary(data, "entries", collection_entries__collection__type__properties__update_node);
	data.properties.type = new read_api.StateGroup<any, any>({name:$["type"][0], node:(StateLookup__type__collection__type__properties__update_node[$["type"][0]] as any)(api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__type__collection__type__properties__update_node = {
	};
	return data;
}
export function imp_decorate_component__type__properties__update_node(api, $:Naked_component__type__properties__update_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Ccomponent__type__properties__update_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"component": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["component"], meta_table, resolver.imp_resolveStateContextValue__component__component__type__properties__update_node, onError, lazy)
	data.properties.update_node = decorate_update_node(api, $["update node"], data, "update node", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				case "context node":
					interface_reply_resolver.imp_resolveStateContextValue__component__component__type__properties__update_node(data, function (err, $_scv_component) {
						if (err) {
							onResolved(true);
						} else {
							interface_resolver.imp_resolve_reference__type__component($_scv_component, function (err, $_ref_component) {
								if (err) {
									onResolved(true);
								} else {
									onResolved(null, $_ref_component.properties["node"]);
								}
							}, onError);
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
export function imp_decorate_file__type__properties__update_node(api, $:Naked_file__type__properties__update_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cfile__type__properties__update_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"file": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["file"], meta_table, resolver.imp_resolveStateContextValue__file__file__type__properties__update_node, onError, lazy)
	data.properties.new_extension = $["new extension"];
	data.properties.new_token = $["new token"];
	return data;
}
export function imp_decorate_group__type__properties__update_node(api, $:Naked_group__type__properties__update_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cgroup__type__properties__update_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"group": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["group"], meta_table, resolver.imp_resolveStateContextValue__group__group__type__properties__update_node, onError, lazy)
	data.properties.update_node = decorate_update_node(api, $["update node"], data, "update node", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				case "context node":
					interface_reply_resolver.imp_resolveStateContextValue__group__group__type__properties__update_node(data, function (err, $_scv_group) {
						if (err) {
							onResolved(true);
						} else {
							onResolved(null, $_scv_group.properties["node"]);
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
export function imp_decorate_integer__type__number__type__properties__update_node(api, $:Naked_integer__type__number__type__properties__update_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cinteger__type__number__type__properties__update_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"integer type": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["integer type"], meta_table, resolver.imp_resolveStateContextValue__integer_type__integer__type__number__type__properties__update_node, onError, lazy)
	data.properties.new_value = $["new value"];
	return data;
}
export function imp_decorate_natural__type__number__type__properties__update_node(api, $:Naked_natural__type__number__type__properties__update_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cnatural__type__number__type__properties__update_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"natural type": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["natural type"], meta_table, resolver.imp_resolveStateContextValue__natural_type__natural__type__number__type__properties__update_node, onError, lazy)
	data.properties.new_value = $["new value"];
	return data;
}
let StateLookup__type__number__type__properties__update_node = {
"integer": imp_decorate_integer__type__number__type__properties__update_node,
"natural": imp_decorate_natural__type__number__type__properties__update_node
};
export function imp_decorate_number__type__properties__update_node(api, $:Naked_number__type__properties__update_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cnumber__type__properties__update_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"number": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["number"], meta_table, resolver.imp_resolveStateContextValue__number__number__type__properties__update_node, onError, lazy)
	data.properties.type = new read_api.StateGroup<any, any>({name:$["type"][0], node:(StateLookup__type__number__type__properties__update_node[$["type"][0]] as any)(api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__type__number__type__properties__update_node = {
	};
	return data;
}
export function imp_decorate_reference__type__properties__update_node(api, $:Naked_reference__type__properties__update_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Creference__type__properties__update_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"reference": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["reference"], meta_table, resolver.imp_resolveStateContextValue__reference__reference__type__properties__update_node, onError, lazy)
	data.properties.new_referenced_node = $["new referenced node"];
	return data;
}
export function imp_decorate_set(api, $:Naked_set, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cset();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.delete_node = decorate_delete_node(api, $["delete node"], data, "delete node", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				default:
					onResolved(true);
			}
		},
		onError, lazy
	);
	meta_table.constraints_to_check.push(function (onError) {
	});
	data.properties.node = decorate_initialize_node(api, $["node"], data, "node", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				case "context node":
					interface_reply_resolver.imp_resolve_reference__state__state_group__type__properties__update_node(data.parent, function (err, $_ref_state_group__type__properties__update_node) {
						if (err) {
							onResolved(true);
						} else {
							onResolved(null, $_ref_state_group__type__properties__update_node.properties["node"]);
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
export function imp_decorate_update__type__state_group(api, $:Naked_update__type__state_group, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cupdate__type__state_group();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.update_node = decorate_update_node(api, $["update node"], data, "update node", meta_table, resolveGlobalInputParameter, 
		function (param, onResolved, onError) {
			switch (param) {
				case "context node":
					interface_reply_resolver.imp_resolve_reference__state__state_group__type__properties__update_node(data.parent, function (err, $_ref_state_group__type__properties__update_node) {
						if (err) {
							onResolved(true);
						} else {
							onResolved(null, $_ref_state_group__type__properties__update_node.properties["node"]);
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
let StateLookup__type__state_group__type__properties__update_node = {
"set": imp_decorate_set,
"update": imp_decorate_update__type__state_group
};
export function imp_decorate_state_group__type__properties__update_node(api, $:Naked_state_group__type__properties__update_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cstate_group__type__properties__update_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"state group": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["state group"], meta_table, resolver.imp_resolveStateContextValue__state_group__state_group__type__properties__update_node, onError, lazy)
	data.properties.state = createReference($["state"]);
	resolveLazy(data, data.properties.state, meta_table, resolver.imp_resolve_reference__state__state_group__type__properties__update_node, onError, lazy)
	data.properties.type = new read_api.StateGroup<any, any>({name:$["type"][0], node:(StateLookup__type__state_group__type__properties__update_node[$["type"][0]] as any)(api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__type__state_group__type__properties__update_node = {
	};
	return data;
}
export function imp_decorate_text__type__properties__update_node(api, $:Naked_text__type__properties__update_node, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Ctext__type__properties__update_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
		"text": {
			"referenced_node": null,
			"resolution_status": "unresolved",
			"reference_selections_count": 0
		}
	};
	resolveLazy(data, data.state_context_values["text"], meta_table, resolver.imp_resolveStateContextValue__text__text__type__properties__update_node, onError, lazy)
	data.properties.new_value = $["new value"];
	return data;
}
let StateLookup__type__properties__update_node = {
"collection": imp_decorate_collection__type__properties__update_node,
"component": imp_decorate_component__type__properties__update_node,
"file": imp_decorate_file__type__properties__update_node,
"group": imp_decorate_group__type__properties__update_node,
"number": imp_decorate_number__type__properties__update_node,
"reference": imp_decorate_reference__type__properties__update_node,
"state group": imp_decorate_state_group__type__properties__update_node,
"text": imp_decorate_text__type__properties__update_node
};
export function imp_decorate_properties__update_node(api, $:Naked_properties__update_node, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy = false) { 
	var data = new api.Cproperties__update_node();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.key = {
		entry: collection_key,
		referenced_node: null,
		resolution_status: 'unresolved'
	};
	resolveLazy(data, data.key, meta_table, resolver.imp_resolve_matrix_key__properties__update_node, onError, lazy)
	data.properties.type = new read_api.StateGroup<any, any>({name:$["type"][0], node:(StateLookup__type__properties__update_node[$["type"][0]] as any)(api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__type__properties__update_node = {
	};
	return data;
}
export function imp_decorate_update_node(api, $:Naked_update_node, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy = false) { 
	var data = new api.Cupdate_node();
	data.location = containing_node;
	data.property_component_name = property_name;
	data.output_parameters = {
	};
	data.imp_resolveInputParameter = resolveInputParameter;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	var collection_properties__update_node = {};
	var source_collection_properties__update_node = $["properties"] || {};
	function collection_properties__update_node_value_function(vk:string) {
	return imp_decorate_properties__update_node(api, $["properties"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
	}
	for (var k in source_collection_properties__update_node ) {
		decorateLazy(collection_properties__update_node, k, collection_properties__update_node_value_function, lazy);
	}
	data.properties.properties = new read_api.Matrix(data, "properties", collection_properties__update_node);
	return data;
}
let StateLookup__type__interface_reply = {
"initialization": imp_decorate_initialization,
"notification": imp_decorate_notification
};
export function imp_decorate_interface_reply(api, $:Naked_interface_reply, containing_node, meta_table, onError, input_parameters, lazy = false) { 
	var data = new api.Cinterface_reply();
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
			case "request":
				if (input_parameters["request"]) {
					onResolved(null, input_parameters["request"]);
				} else {
					onError({
						message: 'Global type input parameter request is not defined!',
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
	data.properties.type = new read_api.StateGroup<any, any>({name:$["type"][0], node:(StateLookup__type__interface_reply[$["type"][0]] as any)(api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__type__interface_reply = {
	};
	return data;
}
var imp_verifyDenseness__properties__initialize_node;
imp_verifyDenseness__properties__initialize_node = function (data, onError) {
	data.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
		if (err) {
		} else {
			for (var $_entry in $_i_param_context_node.properties.attributes["entries"]) {
				if (!$_i_param_context_node.properties.attributes["entries"].hasOwnProperty($_entry)) { continue; }
				if ($_i_param_context_node.properties.attributes["entries"][$_entry].properties.type.state.name === 'property') {
					if (!data.properties.properties["entries"][$_entry]) {
						onError({
							message: 'Missing entry in densematrix for referenced property.',
							path: data.getPath(),
							"target path": $_i_param_context_node.getPath(),
							"current entries": Object.keys(data.properties.properties["entries"]),
							entry: $_entry
						});
					}
				}
			}
		}
	}, onError);

};
export function decorate_delete_node (api, $:Naked_delete_node, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy = false) {
	return imp_decorate_delete_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
export function decorate_initialize_node (api, $:Naked_initialize_node, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy = false) {
	return imp_decorate_initialize_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
export function decorate_update_node (api, $:Naked_update_node, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy = false) {
	return imp_decorate_update_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
export function int_decorate(api, $:Naked_interface_reply, input_parameters?, onError?:(err?:string) => void, lazy = false) {
	var meta_table = { referencers_to_resolve: [], dense_matrices_to_validate: [], constraints_to_check: [] };
	if (!onError) {
		onError = function (err) { console.error(JSON.stringify(err, null, '\t')); };
	}
	var node = imp_decorate_interface_reply(api, $, null, meta_table, onError, input_parameters, lazy);
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
export function decorate($:Naked_interface_reply, input_parameters:{
'interface':interface.Cinterface,
'request':interface_request.Cinterface_request}, onError?:(err?:string) => void):read_api.Cinterface_reply {
	return int_decorate(read_api, $, input_parameters, onError, false);
}
export function lazy_decorate($:Naked_interface_reply, input_parameters:{
'interface':interface.Cinterface,
'request':interface_request.Cinterface_request}, onError?:(err?:string) => void):read_api.Cinterface_reply {
	return int_decorate(read_api, $, input_parameters, onError, true);
}
