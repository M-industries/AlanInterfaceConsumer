import * as id from './identifier';
import * as read_api from "./read_api";
import * as resolver from "./reference_resolver";
import * as manifest from "./read_api";
import * as manifest_resolver from "./reference_resolver";
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
export type Naked_manifest = {
	'fingerprint': string;
	'language fingerprint': string;
	'root': Naked_inode;
	_typescript_dummy_manifest?:boolean;
};
export type States_type__inode = ['directory', Naked_directory]|['file', Naked_file]|['library', Naked_library];
export type States_ordered__children = ['no', Naked_no__ordered__children]|['yes', Naked_yes__ordered__children];
export type Naked_no__ordered__children = {
	_typescript_dummy_no__ordered__children?:boolean;
};
export type Naked_yes__ordered__children = {
	'next': string;
	_typescript_dummy_yes__ordered__children?:boolean;
};
export type Naked_children = {
	'inode': Naked_inode;
	'ordered': States_ordered__children;
	_typescript_dummy_children?:boolean;
};
export type States_ordered__directory = ['no', Naked_no__ordered__directory]|['yes', Naked_yes__ordered__directory];
export type Naked_no__ordered__directory = {
	_typescript_dummy_no__ordered__directory?:boolean;
};
export type Naked_yes__ordered__directory = {
	'first': string;
	_typescript_dummy_yes__ordered__directory?:boolean;
};
export type Naked_directory = {
	'children'?: {[key:string]: Naked_children};
	'ordered': States_ordered__directory;
	_typescript_dummy_directory?:boolean;
};
export type Naked_file = {
	'hash': string;
	'suffix': string;
	_typescript_dummy_file?:boolean;
};
export type Naked_library = {
	'inode': Naked_inode;
	_typescript_dummy_library?:boolean;
};
export type Naked_inode = {
	'type': States_type__inode;
	_typescript_dummy_inode?:boolean;
};
export function imp_decorate_no__ordered__children(api, $:Naked_no__ordered__children, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cno__ordered__children();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	return data;
}
export function imp_decorate_yes__ordered__children(api, $:Naked_yes__ordered__children, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cyes__ordered__children();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.next = createReference($["next"]);
	resolveLazy(data, data.properties.next, meta_table, resolver.imp_resolve_reference__next__yes__ordered__children, onError, lazy)
	return data;
}
let StateLookup__ordered__children = {
"no": imp_decorate_no__ordered__children,
"yes": imp_decorate_yes__ordered__children
};
export function imp_decorate_children(api, $:Naked_children, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy = false) { 
	var data = new api.Cchildren();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.key = collection_key;
	data.properties.inode = decorate_inode(api, $["inode"], data, "inode", meta_table, resolveGlobalInputParameter, 
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
	data.properties.ordered = new read_api.StateGroup<any, any>({name:$["ordered"][0], node:(StateLookup__ordered__children[$["ordered"][0]] as any)(api, $["ordered"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__ordered__children = {
	};
	return data;
}
export function imp_decorate_no__ordered__directory(api, $:Naked_no__ordered__directory, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cno__ordered__directory();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	return data;
}
export function imp_decorate_yes__ordered__directory(api, $:Naked_yes__ordered__directory, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cyes__ordered__directory();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.first = createReference($["first"]);
	resolveLazy(data, data.properties.first, meta_table, resolver.imp_resolve_reference__first__yes__ordered__directory, onError, lazy)
	return data;
}
let StateLookup__ordered__directory = {
"no": imp_decorate_no__ordered__directory,
"yes": imp_decorate_yes__ordered__directory
};
export function imp_decorate_directory(api, $:Naked_directory, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cdirectory();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	var collection_children = {};
	var source_collection_children = $["children"] || {};
	function collection_children_value_function(vk:string) {
	return imp_decorate_children(api, $["children"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
	}
	for (var k in source_collection_children ) {
		decorateLazy(collection_children, k, collection_children_value_function, lazy);
	}
	data.properties.children = new read_api.Dictionary(data, "children", collection_children);
	data.properties.ordered = new read_api.StateGroup<any, any>({name:$["ordered"][0], node:(StateLookup__ordered__directory[$["ordered"][0]] as any)(api, $["ordered"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__ordered__directory = {
	};
	return data;
}
export function imp_decorate_file(api, $:Naked_file, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cfile();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.hash = $["hash"];
	data.properties.suffix = $["suffix"];
	return data;
}
export function imp_decorate_library(api, $:Naked_library, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Clibrary();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.inode = decorate_inode(api, $["inode"], data, "inode", meta_table, resolveGlobalInputParameter, 
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
let StateLookup__type__inode = {
"directory": imp_decorate_directory,
"file": imp_decorate_file,
"library": imp_decorate_library
};
export function imp_decorate_inode(api, $:Naked_inode, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy = false) { 
	var data = new api.Cinode();
	data.location = containing_node;
	data.property_component_name = property_name;
	data.output_parameters = {
	};
	data.imp_resolveInputParameter = resolveInputParameter;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.properties.type = new read_api.StateGroup<any, any>({name:$["type"][0], node:(StateLookup__type__inode[$["type"][0]] as any)(api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__type__inode = {
	};
	return data;
}
export function imp_decorate_manifest(api, $:Naked_manifest, containing_node, meta_table, onError, input_parameters, lazy = false) { 
	var data = new api.Cmanifest();
	function resolveGlobalInputParameter(param, onResolved, onError) {
		switch (param) {
			default:
				onResolved(true);
		}
	};
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.properties.fingerprint = $["fingerprint"];
	data.properties.language_fingerprint = $["language fingerprint"];
	data.properties.root = decorate_inode(api, $["root"], data, "root", meta_table, resolveGlobalInputParameter, 
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
export function decorate_inode (api, $:Naked_inode, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy = false) {
	return imp_decorate_inode(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
export function int_decorate(api, $:Naked_manifest, input_parameters?, onError?:(err?:string) => void, lazy = false) {
	var meta_table = { referencers_to_resolve: [], dense_matrices_to_validate: [], constraints_to_check: [] };
	if (!onError) {
		onError = function (err) { console.error(JSON.stringify(err, null, '\t')); };
	}
	var node = imp_decorate_manifest(api, $, null, meta_table, onError, input_parameters, lazy);
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
export function decorate($:Naked_manifest, input_parameters:{}, onError?:(err?:string) => void):read_api.Cmanifest {
	return int_decorate(read_api, $, input_parameters, onError, false);
}
export function lazy_decorate($:Naked_manifest, input_parameters:{}, onError?:(err?:string) => void):read_api.Cmanifest {
	return int_decorate(read_api, $, input_parameters, onError, true);
}
