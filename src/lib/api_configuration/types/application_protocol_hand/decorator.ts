import * as id from './identifier';
import * as read_api from "./read_api";
import * as resolver from "./reference_resolver";
import * as application_protocol_hand from "./read_api";
import * as application_protocol_hand_resolver from "./reference_resolver";
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
export type States_subscribe__application_protocol_hand = ['no', Naked_no]|['yes', Naked_yes];
export type Naked_no = {
	_typescript_dummy_no?:boolean;
};
export type Naked_yes = {
	'subscription': string;
	_typescript_dummy_yes?:boolean;
};
export type Naked_application_protocol_hand = {
	'interface version': string;
	'subscribe': States_subscribe__application_protocol_hand;
	_typescript_dummy_application_protocol_hand?:boolean;
};
export function imp_decorate_no(api, $:Naked_no, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cno();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	return data;
}
export function imp_decorate_yes(api, $:Naked_yes, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy = false) { 
	var data = new api.Cyes();
	data.parent = containing_node;
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.state_context_values = {
	};
	data.properties.subscription = $["subscription"];
	return data;
}
let StateLookup__subscribe__application_protocol_hand = {
"no": imp_decorate_no,
"yes": imp_decorate_yes
};
export function imp_decorate_application_protocol_hand(api, $:Naked_application_protocol_hand, containing_node, meta_table, onError, input_parameters, lazy = false) { 
	var data = new api.Capplication_protocol_hand();
	function resolveGlobalInputParameter(param, onResolved, onError) {
		switch (param) {
			default:
				onResolved(true);
		}
	};
	data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
	data.properties.interface_version = $["interface version"];
	data.properties.subscribe = new read_api.StateGroup<any, any>({name:$["subscribe"][0], node:(StateLookup__subscribe__application_protocol_hand[$["subscribe"][0]] as any)(api, $["subscribe"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy)});
	data.output_parameters__subscribe__application_protocol_hand = {
	};
	return data;
}
export function int_decorate(api, $:Naked_application_protocol_hand, input_parameters?, onError?:(err?:string) => void, lazy = false) {
	var meta_table = { referencers_to_resolve: [], dense_matrices_to_validate: [], constraints_to_check: [] };
	if (!onError) {
		onError = function (err) { console.error(JSON.stringify(err, null, '\t')); };
	}
	var node = imp_decorate_application_protocol_hand(api, $, null, meta_table, onError, input_parameters, lazy);
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
export function decorate($:Naked_application_protocol_hand, input_parameters:{}, onError?:(err?:string) => void):read_api.Capplication_protocol_hand {
	return int_decorate(read_api, $, input_parameters, onError, false);
}
export function lazy_decorate($:Naked_application_protocol_hand, input_parameters:{}, onError?:(err?:string) => void):read_api.Capplication_protocol_hand {
	return int_decorate(read_api, $, input_parameters, onError, true);
}
