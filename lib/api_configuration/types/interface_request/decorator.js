Object.defineProperty(exports, "__esModule", { value: true });
var read_api = require("./read_api");
var resolver = require("./reference_resolver");
var interface_request_resolver = require("./reference_resolver");
function decorateLazy(object, property_name, value_function, lazy) {
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
}
;
function resolveLazy(data, object, meta_table, resolve_function, onError, lazy) {
    if (lazy) {
        Object.defineProperty(object, "referenced_node", {
            get: function () {
                delete object["referenced_node"];
                object["referenced_node"] = null;
                resolve_function(data, function () { }, onError);
                return object["referenced_node"];
            },
            set: function (value) {
                delete object["referenced_node"];
                object["referenced_node"] = value;
            },
            enumerable: true,
            configurable: true
        });
    }
    else {
        meta_table.referencers_to_resolve.push(function (onResolved, onError) { resolve_function(data, onResolved, onError); });
    }
}
function createExternalReference(library, type) {
    var fn = (function () { return fn.referenced_node; });
    fn.library = library;
    fn.type = type;
    fn.referenced_node = null;
    fn.resolution_status = 'unresolved';
    return fn;
}
function createReference(entry) {
    var fn = (function () { return fn.referenced_node; });
    fn.entry = entry;
    fn.referenced_node = null;
    fn.resolution_status = 'unresolved';
    return fn;
}
function resolveLazyWithKey(data, object, key, meta_table, resolve_function, onError, lazy) {
    if (lazy) {
        Object.defineProperty(object[key], "referenced_node", {
            get: function () {
                delete object[key]["referenced_node"];
                object[key]["referenced_node"] = null;
                resolve_function(data, key, function () { }, onError);
                return object[key]["referenced_node"];
            },
            set: function (value) {
                delete object[key]["referenced_node"];
                object[key]["referenced_node"] = value;
            },
            enumerable: true,
            configurable: true
        });
    }
    else {
        meta_table.referencers_to_resolve.push(function (onResolved, onError) { resolve_function(data, key, onResolved, onError); });
    }
}
function imp_decorate_command_execution(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ccommand_execution();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.arguments = decorate_command_arguments(api, $["arguments"], data, "arguments", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "command parameters":
                interface_request_resolver.imp_resolve_reference__command__command_execution(data, function (err, $_ref_command_execution) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        onResolved(null, $_ref_command_execution.properties["parameters"]);
                    }
                }, onError);
                break;
            case "context node":
                interface_request_resolver.resolveComponentOutputParameter_id_path(data.properties["context_node"], "result node", function (err, $_cto_param_result_node) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        onResolved(null, $_cto_param_result_node);
                    }
                }, onError);
                break;
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    data.properties.command = createReference($["command"]);
    resolveLazy(data, data.properties.command, meta_table, resolver.imp_resolve_reference__command__command_execution, onError, lazy);
    data.properties.context_keys = decorate_context_keys(api, $["context keys"], data, "context keys", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "interface":
                data.parent.imp_resolveGlobalInputParameter("interface", function (err, $_i_param_interface) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        onResolved(null, $_i_param_interface);
                    }
                }, onError);
                break;
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    data.properties.context_node = decorate_id_path(api, $["context node"], data, "context node", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                data.parent.imp_resolveGlobalInputParameter("interface", function (err, $_i_param_interface) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        onResolved(null, $_i_param_interface.properties["root"]);
                    }
                }, onError);
                break;
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    return data;
}
exports.imp_decorate_command_execution = imp_decorate_command_execution;
function imp_decorate_no__initialization_data_requested(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cno__initialization_data_requested();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_no__initialization_data_requested = imp_decorate_no__initialization_data_requested;
function imp_decorate_yes__initialization_data_requested(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cyes__initialization_data_requested();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_yes__initialization_data_requested = imp_decorate_yes__initialization_data_requested;
var StateLookup__initialization_data_requested__subscribe = {
    "no": imp_decorate_no__initialization_data_requested,
    "yes": imp_decorate_yes__initialization_data_requested
};
function imp_decorate_subscribe(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Csubscribe();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.context_keys = decorate_context_keys(api, $["context keys"], data, "context keys", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "interface":
                data.parent.imp_resolveGlobalInputParameter("interface", function (err, $_i_param_interface) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        onResolved(null, $_i_param_interface);
                    }
                }, onError);
                break;
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    data.properties.initialization_data_requested = new read_api.StateGroup({ name: $["initialization data requested"][0], node: StateLookup__initialization_data_requested__subscribe[$["initialization data requested"][0]](api, $["initialization data requested"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__initialization_data_requested__subscribe = {};
    return data;
}
exports.imp_decorate_subscribe = imp_decorate_subscribe;
function imp_decorate_unsubscribe(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cunsubscribe();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_unsubscribe = imp_decorate_unsubscribe;
function imp_decorate_file(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["file"], meta_table, resolver.imp_resolveStateContextValue__file__file, onError, lazy);
    data.properties.extension = $["extension"];
    data.properties.token = $["token"];
    return data;
}
exports.imp_decorate_file = imp_decorate_file;
function imp_decorate_entries(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Centries();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.key = collection_key;
    data.properties.arguments = decorate_command_arguments(api, $["arguments"], data, "arguments", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "command parameters":
                interface_request_resolver.imp_resolveStateContextValue__matrix__matrix(data.parent, function (err, $_scv_matrix) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        onResolved(null, $_scv_matrix.properties["parameters"]);
                    }
                }, onError);
                break;
            case "context node":
                data.parent.parent.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        onResolved(null, $_i_param_context_node);
                    }
                }, onError);
                break;
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    return data;
}
exports.imp_decorate_entries = imp_decorate_entries;
function imp_decorate_matrix(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["matrix"], meta_table, resolver.imp_resolveStateContextValue__matrix__matrix, onError, lazy);
    var collection_entries = {};
    var source_collection_entries = $["entries"] || {};
    function collection_entries_value_function(vk) {
        return imp_decorate_entries(api, $["entries"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
    }
    for (var k in source_collection_entries) {
        decorateLazy(collection_entries, k, collection_entries_value_function, lazy);
    }
    data.properties.entries = new read_api.Dictionary(data, "entries", collection_entries);
    return data;
}
exports.imp_decorate_matrix = imp_decorate_matrix;
function imp_decorate_number(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["number"], meta_table, resolver.imp_resolveStateContextValue__number__number, onError, lazy);
    data.properties.number = $["number"];
    return data;
}
exports.imp_decorate_number = imp_decorate_number;
function imp_decorate_reference(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["reference"], meta_table, resolver.imp_resolveStateContextValue__reference__reference, onError, lazy);
    data.properties.entry = $["entry"];
    return data;
}
exports.imp_decorate_reference = imp_decorate_reference;
function imp_decorate_state_group(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["state group"], meta_table, resolver.imp_resolveStateContextValue__state_group__state_group, onError, lazy);
    data.properties.arguments = decorate_command_arguments(api, $["arguments"], data, "arguments", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "command parameters":
                interface_request_resolver.imp_resolve_reference__state__state_group(data, function (err, $_ref_state_group) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        onResolved(null, $_ref_state_group.properties["parameters"]);
                    }
                }, onError);
                break;
            case "context node":
                data.parent.parent.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        onResolved(null, $_i_param_context_node);
                    }
                }, onError);
                break;
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    data.properties.state = createReference($["state"]);
    resolveLazy(data, data.properties.state, meta_table, resolver.imp_resolve_reference__state__state_group, onError, lazy);
    return data;
}
exports.imp_decorate_state_group = imp_decorate_state_group;
function imp_decorate_text(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["text"], meta_table, resolver.imp_resolveStateContextValue__text__text, onError, lazy);
    data.properties.text = $["text"];
    return data;
}
exports.imp_decorate_text = imp_decorate_text;
var StateLookup__type__properties = {
    "file": imp_decorate_file,
    "matrix": imp_decorate_matrix,
    "number": imp_decorate_number,
    "reference": imp_decorate_reference,
    "state group": imp_decorate_state_group,
    "text": imp_decorate_text
};
function imp_decorate_properties(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cproperties();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.key = {
        entry: collection_key,
        referenced_node: null,
        resolution_status: 'unresolved'
    };
    resolveLazy(data, data.key, meta_table, resolver.imp_resolve_matrix_key__properties, onError, lazy);
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__properties[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__properties = {};
    return data;
}
exports.imp_decorate_properties = imp_decorate_properties;
function imp_decorate_command_arguments(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ccommand_arguments();
    data.location = containing_node;
    data.property_component_name = property_name;
    data.output_parameters = {};
    data.imp_resolveInputParameter = resolveInputParameter;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    var collection_properties = {};
    var source_collection_properties = $["properties"] || {};
    function collection_properties_value_function(vk) {
        return imp_decorate_properties(api, $["properties"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
    }
    for (var k in source_collection_properties) {
        decorateLazy(collection_properties, k, collection_properties_value_function, lazy);
    }
    data.properties.properties = new read_api.Matrix(data, "properties", collection_properties);
    meta_table.dense_matrices_to_validate.push(function (onError) {
        imp_verifyDenseness__properties__command_arguments(data, onError);
    });
    return data;
}
exports.imp_decorate_command_arguments = imp_decorate_command_arguments;
function imp_decorate_context_keys__context_keys(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ccontext_keys__context_keys();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.key = {
        entry: collection_key,
        referenced_node: null,
        resolution_status: 'unresolved'
    };
    resolveLazy(data, data.key, meta_table, resolver.imp_resolve_matrix_key__context_keys__context_keys, onError, lazy);
    data.properties.value = $["value"];
    return data;
}
exports.imp_decorate_context_keys__context_keys = imp_decorate_context_keys__context_keys;
function imp_decorate_context_keys__interface_request(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ccontext_keys__interface_request();
    data.location = containing_node;
    data.property_component_name = property_name;
    data.output_parameters = {};
    data.imp_resolveInputParameter = resolveInputParameter;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    var collection_context_keys__context_keys = {};
    var source_collection_context_keys__context_keys = $["context keys"] || {};
    function collection_context_keys__context_keys_value_function(vk) {
        return imp_decorate_context_keys__context_keys(api, $["context keys"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
    }
    for (var k in source_collection_context_keys__context_keys) {
        decorateLazy(collection_context_keys__context_keys, k, collection_context_keys__context_keys_value_function, lazy);
    }
    data.properties.context_keys = new read_api.Matrix(data, "context keys", collection_context_keys__context_keys);
    meta_table.dense_matrices_to_validate.push(function (onError) {
        imp_verifyDenseness__context_keys__context_keys__interface_request(data, onError);
    });
    return data;
}
exports.imp_decorate_context_keys__interface_request = imp_decorate_context_keys__interface_request;
function imp_decorate_no__has_steps(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cno__has_steps();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_no__has_steps = imp_decorate_no__has_steps;
function imp_decorate_collection_entry(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ccollection_entry();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.collection = createReference($["collection"]);
    resolveLazy(data, data.properties.collection, meta_table, resolver.imp_resolve_reference__collection__collection_entry, onError, lazy);
    data.properties.id = $["id"];
    return data;
}
exports.imp_decorate_collection_entry = imp_decorate_collection_entry;
function imp_decorate_component(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ccomponent();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.component = createReference($["component"]);
    resolveLazy(data, data.properties.component, meta_table, resolver.imp_resolve_reference__component__component, onError, lazy);
    return data;
}
exports.imp_decorate_component = imp_decorate_component;
function imp_decorate_group(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cgroup();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.group = createReference($["group"]);
    resolveLazy(data, data.properties.group, meta_table, resolver.imp_resolve_reference__group__group, onError, lazy);
    return data;
}
exports.imp_decorate_group = imp_decorate_group;
function imp_decorate_state(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cstate();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.state = createReference($["state"]);
    resolveLazy(data, data.properties.state, meta_table, resolver.imp_resolve_reference__state__state, onError, lazy);
    data.properties.state_group = createReference($["state group"]);
    resolveLazy(data, data.properties.state_group, meta_table, resolver.imp_resolve_reference__state_group__state, onError, lazy);
    return data;
}
exports.imp_decorate_state = imp_decorate_state;
var StateLookup__type__yes__has_steps = {
    "collection entry": imp_decorate_collection_entry,
    "component": imp_decorate_component,
    "group": imp_decorate_group,
    "state": imp_decorate_state
};
function imp_decorate_yes__has_steps(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cyes__has_steps();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.tail = decorate_id_path(api, $["tail"], data, "tail", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                interface_request_resolver.imp_resolveStateOutputParameter__type__yes__has_steps(data, "result node", function (err, $_sgo_yes__has_steps) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        $_sgo_yes__has_steps.reference_selections_count += 1;
                        onResolved(null, $_sgo_yes__has_steps);
                    }
                }, onError);
                break;
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__yes__has_steps[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__yes__has_steps = {
        "result node": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters__type__yes__has_steps, "result node", meta_table, resolver.imp_resolveStateOutputParameter__type__yes__has_steps, onError, lazy);
    return data;
}
exports.imp_decorate_yes__has_steps = imp_decorate_yes__has_steps;
var StateLookup__has_steps__id_path = {
    "no": imp_decorate_no__has_steps,
    "yes": imp_decorate_yes__has_steps
};
function imp_decorate_id_path(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cid_path();
    data.location = containing_node;
    data.property_component_name = property_name;
    data.output_parameters = {
        "result node": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters, "result node", meta_table, resolver.resolveComponentOutputParameter_id_path, onError, lazy);
    data.imp_resolveInputParameter = resolveInputParameter;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.properties.has_steps = new read_api.StateGroup({ name: $["has steps"][0], node: StateLookup__has_steps__id_path[$["has steps"][0]](api, $["has steps"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__has_steps__id_path = {
        "result node": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters__has_steps__id_path, "result node", meta_table, resolver.imp_resolveStateOutputParameter__has_steps__id_path, onError, lazy);
    return data;
}
exports.imp_decorate_id_path = imp_decorate_id_path;
var StateLookup__type__interface_request = {
    "command execution": imp_decorate_command_execution,
    "subscribe": imp_decorate_subscribe,
    "unsubscribe": imp_decorate_unsubscribe
};
function imp_decorate_interface_request(api, $, containing_node, meta_table, onError, input_parameters, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cinterface_request();
    function resolveGlobalInputParameter(param, onResolved, onError) {
        switch (param) {
            case "interface":
                if (input_parameters["interface"]) {
                    onResolved(null, input_parameters["interface"]);
                }
                else {
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
    }
    ;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__interface_request[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__interface_request = {};
    return data;
}
exports.imp_decorate_interface_request = imp_decorate_interface_request;
var imp_verifyDenseness__properties__command_arguments;
imp_verifyDenseness__properties__command_arguments = function (data, onError) {
    data.imp_resolveInputParameter("command parameters", function (err, $_i_param_command_parameters) {
        if (err) {
        }
        else {
            for (var $_entry in $_i_param_command_parameters.properties.properties["entries"]) {
                if (!$_i_param_command_parameters.properties.properties["entries"].hasOwnProperty($_entry)) {
                    continue;
                }
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
        }
        else {
            for (var $_entry in $_i_param_interface.properties.context_keys["entries"]) {
                if (!$_i_param_interface.properties.context_keys["entries"].hasOwnProperty($_entry)) {
                    continue;
                }
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
function decorate_command_arguments(api, $, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    return imp_decorate_command_arguments(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
exports.decorate_command_arguments = decorate_command_arguments;
function decorate_context_keys(api, $, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    return imp_decorate_context_keys__interface_request(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
exports.decorate_context_keys = decorate_context_keys;
function decorate_id_path(api, $, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    return imp_decorate_id_path(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
exports.decorate_id_path = decorate_id_path;
function int_decorate(api, $, input_parameters, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    var meta_table = { referencers_to_resolve: [], dense_matrices_to_validate: [], constraints_to_check: [] };
    if (!onError) {
        onError = function (err) { console.error(JSON.stringify(err, null, '\t')); };
    }
    var node = imp_decorate_interface_request(api, $, null, meta_table, onError, input_parameters, lazy);
    if (!lazy) {
        //reference resolving
        var ri;
        for (ri = 0; ri < meta_table.referencers_to_resolve.length; ri += 1) {
            meta_table.referencers_to_resolve[ri](function () { }, onError);
        }
        var ry;
        for (ry = 0; ry < meta_table.dense_matrices_to_validate.length; ry += 1) {
            meta_table.dense_matrices_to_validate[ry](onError);
        }
        var rz;
        for (rz = 0; rz < meta_table.constraints_to_check.length; rz += 1) {
            meta_table.constraints_to_check[rz](onError);
        }
    }
    return node;
}
exports.int_decorate = int_decorate;
function decorate($, input_parameters, onError) {
    return int_decorate(read_api, $, input_parameters, onError, false);
}
exports.decorate = decorate;
function lazy_decorate($, input_parameters, onError) {
    return int_decorate(read_api, $, input_parameters, onError, true);
}
exports.lazy_decorate = lazy_decorate;
