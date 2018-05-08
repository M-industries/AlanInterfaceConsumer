Object.defineProperty(exports, "__esModule", { value: true });
var read_api = require("./read_api");
var resolver = require("./reference_resolver");
var interface_resolver = require("./reference_resolver");
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
function imp_decorate_component_types(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ccomponent_types();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.key = collection_key;
    data.properties.node = decorate_node(api, $["node"], data, "node", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "interface":
                onResolved(null, data.parent);
                break;
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    return data;
}
exports.imp_decorate_component_types = imp_decorate_component_types;
function imp_decorate_context_keys(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ccontext_keys();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.key = collection_key;
    return data;
}
exports.imp_decorate_context_keys = imp_decorate_context_keys;
function imp_decorate_no__has_factor(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cno__has_factor();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_no__has_factor = imp_decorate_no__has_factor;
function imp_decorate_yes__has_factor(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cyes__has_factor();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.base = $["base"];
    data.properties.exponent = $["exponent"];
    return data;
}
exports.imp_decorate_yes__has_factor = imp_decorate_yes__has_factor;
var StateLookup__has_factor__numerical_types = {
    "no": imp_decorate_no__has_factor,
    "yes": imp_decorate_yes__has_factor
};
function imp_decorate_numerical_types(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cnumerical_types();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.key = collection_key;
    data.properties.has_factor = new read_api.StateGroup({ name: $["has factor"][0], node: StateLookup__has_factor__numerical_types[$["has factor"][0]](api, $["has factor"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__has_factor__numerical_types = {};
    return data;
}
exports.imp_decorate_numerical_types = imp_decorate_numerical_types;
function imp_decorate_no__has_steps__ancestor_parameters_selection(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cno__has_steps__ancestor_parameters_selection();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_no__has_steps__ancestor_parameters_selection = imp_decorate_no__has_steps__ancestor_parameters_selection;
function imp_decorate_matrix_parent(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cmatrix_parent();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {
        "matrix": {
            "referenced_node": null,
            "resolution_status": "unresolved",
            "reference_selections_count": 0
        }
    };
    resolveLazy(data, data.state_context_values["matrix"], meta_table, resolver.imp_resolveStateContextValue__matrix__matrix_parent, onError, lazy);
    return data;
}
exports.imp_decorate_matrix_parent = imp_decorate_matrix_parent;
function imp_decorate_state_parent__type__yes__has_steps__ancestor_parameters_selection(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cstate_parent__type__yes__has_steps__ancestor_parameters_selection();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {
        "state": {
            "referenced_node": null,
            "resolution_status": "unresolved",
            "reference_selections_count": 0
        }
    };
    resolveLazy(data, data.state_context_values["state"], meta_table, resolver.imp_resolveStateContextValue__state__state_parent__type__yes__has_steps__ancestor_parameters_selection, onError, lazy);
    return data;
}
exports.imp_decorate_state_parent__type__yes__has_steps__ancestor_parameters_selection = imp_decorate_state_parent__type__yes__has_steps__ancestor_parameters_selection;
var StateLookup__type__yes__has_steps__ancestor_parameters_selection = {
    "matrix parent": imp_decorate_matrix_parent,
    "state parent": imp_decorate_state_parent__type__yes__has_steps__ancestor_parameters_selection
};
function imp_decorate_yes__has_steps__ancestor_parameters_selection(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cyes__has_steps__ancestor_parameters_selection();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.tail = decorate_ancestor_parameters_selection(api, $["tail"], data, "tail", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context parameters":
                interface_resolver.imp_resolveStateOutputParameter__type__yes__has_steps__ancestor_parameters_selection(data, "result parameters", function (err, $_sgo_yes__has_steps__ancestor_parameters_selection) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        $_sgo_yes__has_steps__ancestor_parameters_selection.reference_selections_count += 1;
                        onResolved(null, $_sgo_yes__has_steps__ancestor_parameters_selection);
                    }
                }, onError);
                break;
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__yes__has_steps__ancestor_parameters_selection[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__yes__has_steps__ancestor_parameters_selection = {
        "result parameters": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters__type__yes__has_steps__ancestor_parameters_selection, "result parameters", meta_table, resolver.imp_resolveStateOutputParameter__type__yes__has_steps__ancestor_parameters_selection, onError, lazy);
    return data;
}
exports.imp_decorate_yes__has_steps__ancestor_parameters_selection = imp_decorate_yes__has_steps__ancestor_parameters_selection;
var StateLookup__has_steps__ancestor_parameters_selection = {
    "no": imp_decorate_no__has_steps__ancestor_parameters_selection,
    "yes": imp_decorate_yes__has_steps__ancestor_parameters_selection
};
function imp_decorate_ancestor_parameters_selection(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cancestor_parameters_selection();
    data.location = containing_node;
    data.property_component_name = property_name;
    data.output_parameters = {
        "result parameters": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters, "result parameters", meta_table, resolver.resolveComponentOutputParameter_ancestor_parameters_selection, onError, lazy);
    data.imp_resolveInputParameter = resolveInputParameter;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.properties.has_steps = new read_api.StateGroup({ name: $["has steps"][0], node: StateLookup__has_steps__ancestor_parameters_selection[$["has steps"][0]](api, $["has steps"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__has_steps__ancestor_parameters_selection = {
        "result parameters": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters__has_steps__ancestor_parameters_selection, "result parameters", meta_table, resolver.imp_resolveStateOutputParameter__has_steps__ancestor_parameters_selection, onError, lazy);
    return data;
}
exports.imp_decorate_ancestor_parameters_selection = imp_decorate_ancestor_parameters_selection;
function imp_decorate_key(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ckey();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {
        "matrix": {
            "referenced_node": null,
            "resolution_status": "unresolved",
            "reference_selections_count": 0
        }
    };
    resolveLazy(data, data.state_context_values["matrix"], meta_table, resolver.imp_resolveStateContextValue__matrix__key, onError, lazy);
    return data;
}
exports.imp_decorate_key = imp_decorate_key;
function imp_decorate_reference__type__command_parameter(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Creference__type__command_parameter();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.reference = createReference($["reference"]);
    resolveLazy(data, data.properties.reference, meta_table, resolver.imp_resolve_reference__reference__reference__type__command_parameter, onError, lazy);
    return data;
}
exports.imp_decorate_reference__type__command_parameter = imp_decorate_reference__type__command_parameter;
var StateLookup__type__command_parameter = {
    "key": imp_decorate_key,
    "reference": imp_decorate_reference__type__command_parameter
};
function imp_decorate_command_parameter(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ccommand_parameter();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.ancestor_selection = decorate_ancestor_parameters_selection(api, $["ancestor selection"], data, "ancestor selection", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context parameters":
                data.parent.imp_resolveInputParameter("parameter", function (err, $_i_param_parameter) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        onResolved(null, $_i_param_parameter.parent);
                    }
                }, onError);
                break;
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__command_parameter[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__command_parameter = {
        "result node": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters__type__command_parameter, "result node", meta_table, resolver.imp_resolveStateOutputParameter__type__command_parameter, onError, lazy);
    return data;
}
exports.imp_decorate_command_parameter = imp_decorate_command_parameter;
function imp_decorate_context_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ccontext_node();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_context_node = imp_decorate_context_node;
var StateLookup__context_type__command_parameter_referencer = {
    "command parameter": imp_decorate_command_parameter,
    "context node": imp_decorate_context_node
};
function imp_decorate_command_parameter_referencer(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ccommand_parameter_referencer();
    data.location = containing_node;
    data.property_component_name = property_name;
    data.output_parameters = {
        "referenced node": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters, "referenced node", meta_table, resolver.resolveComponentOutputParameter_command_parameter_referencer, onError, lazy);
    data.imp_resolveInputParameter = resolveInputParameter;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.properties.collection = createReference($["collection"]);
    resolveLazy(data, data.properties.collection, meta_table, resolver.imp_resolve_reference__collection__command_parameter_referencer, onError, lazy);
    data.properties.context_type = new read_api.StateGroup({ name: $["context type"][0], node: StateLookup__context_type__command_parameter_referencer[$["context type"][0]](api, $["context type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__context_type__command_parameter_referencer = {
        "result node": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters__context_type__command_parameter_referencer, "result node", meta_table, resolver.imp_resolveStateOutputParameter__context_type__command_parameter_referencer, onError, lazy);
    data.properties.head = decorate_node_selection_path(api, $["head"], data, "head", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                interface_resolver.imp_resolveStateOutputParameter__context_type__command_parameter_referencer(data, "result node", function (err, $_sgo_command_parameter_referencer) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        $_sgo_command_parameter_referencer.reference_selections_count += 1;
                        onResolved(null, $_sgo_command_parameter_referencer);
                    }
                }, onError);
                break;
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    data.properties.tail = decorate_node_content_path(api, $["tail"], data, "tail", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                interface_resolver.imp_resolve_reference__collection__command_parameter_referencer(data, function (err, $_ref_command_parameter_referencer) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        onResolved(null, $_ref_command_parameter_referencer.properties["node"]);
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
exports.imp_decorate_command_parameter_referencer = imp_decorate_command_parameter_referencer;
function imp_decorate_file__type__properties(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cfile__type__properties();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_file__type__properties = imp_decorate_file__type__properties;
function imp_decorate_dense(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cdense();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_dense = imp_decorate_dense;
function imp_decorate_sparse(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Csparse();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_sparse = imp_decorate_sparse;
var StateLookup__type__matrix__type__properties = {
    "dense": imp_decorate_dense,
    "sparse": imp_decorate_sparse
};
function imp_decorate_matrix__type__properties(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cmatrix__type__properties();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.parameters = decorate_command_parameters(api, $["parameters"], data, "parameters", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
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
            case "interface":
                data.parent.parent.imp_resolveInputParameter("interface", function (err, $_i_param_interface) {
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
    data.properties.referencer = decorate_command_parameter_referencer(api, $["referencer"], data, "referencer", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
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
            case "parameter":
                onResolved(null, data.parent);
                break;
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__matrix__type__properties[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__matrix__type__properties = {};
    return data;
}
exports.imp_decorate_matrix__type__properties = imp_decorate_matrix__type__properties;
function imp_decorate_integer__set__number__type__properties(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cinteger__set__number__type__properties();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_integer__set__number__type__properties = imp_decorate_integer__set__number__type__properties;
function imp_decorate_natural__set__number__type__properties(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cnatural__set__number__type__properties();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_natural__set__number__type__properties = imp_decorate_natural__set__number__type__properties;
var StateLookup__set__number__type__properties = {
    "integer": imp_decorate_integer__set__number__type__properties,
    "natural": imp_decorate_natural__set__number__type__properties
};
function imp_decorate_number__type__properties(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cnumber__type__properties();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.numerical_type = createReference($["numerical type"]);
    resolveLazy(data, data.properties.numerical_type, meta_table, resolver.imp_resolve_reference__numerical_type__number__type__properties, onError, lazy);
    data.properties.set = new read_api.StateGroup({ name: $["set"][0], node: StateLookup__set__number__type__properties[$["set"][0]](api, $["set"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__set__number__type__properties = {};
    return data;
}
exports.imp_decorate_number__type__properties = imp_decorate_number__type__properties;
function imp_decorate_reference__type__properties(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Creference__type__properties();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.referencer = decorate_command_parameter_referencer(api, $["referencer"], data, "referencer", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
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
            case "parameter":
                onResolved(null, data.parent);
                break;
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    return data;
}
exports.imp_decorate_reference__type__properties = imp_decorate_reference__type__properties;
function imp_decorate_states__state_group__type__properties(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cstates__state_group__type__properties();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.key = collection_key;
    data.properties.parameters = decorate_command_parameters(api, $["parameters"], data, "parameters", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
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
            case "interface":
                data.parent.parent.parent.imp_resolveInputParameter("interface", function (err, $_i_param_interface) {
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
    return data;
}
exports.imp_decorate_states__state_group__type__properties = imp_decorate_states__state_group__type__properties;
function imp_decorate_state_group__type__properties(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cstate_group__type__properties();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    var collection_states__state_group__type__properties = {};
    var source_collection_states__state_group__type__properties = $["states"] || {};
    function collection_states__state_group__type__properties_value_function(vk) {
        return imp_decorate_states__state_group__type__properties(api, $["states"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
    }
    for (var k in source_collection_states__state_group__type__properties) {
        decorateLazy(collection_states__state_group__type__properties, k, collection_states__state_group__type__properties_value_function, lazy);
    }
    data.properties.states = new read_api.Dictionary(data, "states", collection_states__state_group__type__properties);
    return data;
}
exports.imp_decorate_state_group__type__properties = imp_decorate_state_group__type__properties;
function imp_decorate_text__type__properties(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ctext__type__properties();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_text__type__properties = imp_decorate_text__type__properties;
var StateLookup__type__properties = {
    "file": imp_decorate_file__type__properties,
    "matrix": imp_decorate_matrix__type__properties,
    "number": imp_decorate_number__type__properties,
    "reference": imp_decorate_reference__type__properties,
    "state group": imp_decorate_state_group__type__properties,
    "text": imp_decorate_text__type__properties
};
function imp_decorate_properties(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cproperties();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.key = collection_key;
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__properties[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__properties = {};
    return data;
}
exports.imp_decorate_properties = imp_decorate_properties;
function imp_decorate_command_parameters(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ccommand_parameters();
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
    data.properties.properties = new read_api.Dictionary(data, "properties", collection_properties);
    return data;
}
exports.imp_decorate_command_parameters = imp_decorate_command_parameters;
function imp_decorate_command(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ccommand();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.parameters = decorate_command_parameters(api, $["parameters"], data, "parameters", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                onResolved(null, data.parent.parent);
                break;
            case "interface":
                data.parent.parent.imp_resolveInputParameter("interface", function (err, $_i_param_interface) {
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
    return data;
}
exports.imp_decorate_command = imp_decorate_command;
function imp_decorate_dictionary(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cdictionary();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_dictionary = imp_decorate_dictionary;
function imp_decorate_matrix__type__collection(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cmatrix__type__collection();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.referencer = decorate_referencer(api, $["referencer"], data, "referencer", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                onResolved(null, data.parent.parent.parent.parent);
                break;
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    return data;
}
exports.imp_decorate_matrix__type__collection = imp_decorate_matrix__type__collection;
var StateLookup__type__collection__type__property = {
    "dictionary": imp_decorate_dictionary,
    "matrix": imp_decorate_matrix__type__collection
};
function imp_decorate_collection__type__property(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ccollection__type__property();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.node = decorate_node(api, $["node"], data, "node", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "interface":
                data.parent.parent.parent.imp_resolveInputParameter("interface", function (err, $_i_param_interface) {
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
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__collection__type__property[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__collection__type__property = {};
    return data;
}
exports.imp_decorate_collection__type__property = imp_decorate_collection__type__property;
function imp_decorate_component(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ccomponent();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.type = createReference($["type"]);
    resolveLazy(data, data.properties.type, meta_table, resolver.imp_resolve_reference__type__component, onError, lazy);
    return data;
}
exports.imp_decorate_component = imp_decorate_component;
function imp_decorate_file__type__property(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cfile__type__property();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_file__type__property = imp_decorate_file__type__property;
function imp_decorate_group__type__property(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cgroup__type__property();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.node = decorate_node(api, $["node"], data, "node", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "interface":
                data.parent.parent.parent.imp_resolveInputParameter("interface", function (err, $_i_param_interface) {
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
    return data;
}
exports.imp_decorate_group__type__property = imp_decorate_group__type__property;
function imp_decorate_integer__set__number__type__property(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cinteger__set__number__type__property();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_integer__set__number__type__property = imp_decorate_integer__set__number__type__property;
function imp_decorate_natural__set__number__type__property(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cnatural__set__number__type__property();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_natural__set__number__type__property = imp_decorate_natural__set__number__type__property;
var StateLookup__set__number__type__property = {
    "integer": imp_decorate_integer__set__number__type__property,
    "natural": imp_decorate_natural__set__number__type__property
};
function imp_decorate_number__type__property(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cnumber__type__property();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.set = new read_api.StateGroup({ name: $["set"][0], node: StateLookup__set__number__type__property[$["set"][0]](api, $["set"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__set__number__type__property = {};
    data.properties.type = createReference($["type"]);
    resolveLazy(data, data.properties.type, meta_table, resolver.imp_resolve_reference__type__number__type__property, onError, lazy);
    return data;
}
exports.imp_decorate_number__type__property = imp_decorate_number__type__property;
function imp_decorate_reference__type__property(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Creference__type__property();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.referencer = decorate_referencer(api, $["referencer"], data, "referencer", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                onResolved(null, data.parent.parent.parent);
                break;
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    return data;
}
exports.imp_decorate_reference__type__property = imp_decorate_reference__type__property;
function imp_decorate_output_parameters(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Coutput_parameters();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.key = collection_key;
    data.properties.node_selection = decorate_node_type_path(api, $["node selection"], data, "node selection", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "interface":
                data.parent.parent.parent.parent.imp_resolveInputParameter("interface", function (err, $_i_param_interface) {
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
    return data;
}
exports.imp_decorate_output_parameters = imp_decorate_output_parameters;
function imp_decorate_output_arguments(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Coutput_arguments();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.key = {
        entry: collection_key,
        referenced_node: null,
        resolution_status: 'unresolved'
    };
    resolveLazy(data, data.key, meta_table, resolver.imp_resolve_matrix_key__output_arguments, onError, lazy);
    data.properties.path = decorate_node_selection_path(api, $["path"], data, "path", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                onResolved(null, data.parent.properties["node"]);
                break;
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
        interface_resolver.imp_resolve_matrix_key__output_arguments(data, function (err, key) {
            if (err) {
            }
            else {
                interface_resolver.resolveComponentOutputParameter_node_type_path(key.properties["node_selection"], "result interface node", function (err, $_cto_param_result_interface_node) {
                    if (err) {
                    }
                    else {
                        interface_resolver.resolveComponentOutputParameter_node_selection_path(data.properties.path, "result interface node", function (err, $output_param_result) {
                            if (!err) {
                                if ($output_param_result !== $_cto_param_result_interface_node) {
                                    onError({
                                        message: 'Unexpected result type!',
                                        path: data.getPath(),
                                        actual: $output_param_result.getPath(),
                                        expected: $_cto_param_result_interface_node.getPath()
                                    });
                                }
                            }
                        }, function () { throw "Fatal error in api implementation!"; });
                    }
                }, onError);
            }
        }, onError);
    });
    return data;
}
exports.imp_decorate_output_arguments = imp_decorate_output_arguments;
function imp_decorate_states__state_group__type__property(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cstates__state_group__type__property();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.key = collection_key;
    data.properties.node = decorate_node(api, $["node"], data, "node", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "interface":
                data.parent.parent.parent.parent.imp_resolveInputParameter("interface", function (err, $_i_param_interface) {
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
    var collection_output_arguments = {};
    var source_collection_output_arguments = $["output arguments"] || {};
    function collection_output_arguments_value_function(vk) {
        return imp_decorate_output_arguments(api, $["output arguments"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
    }
    for (var k in source_collection_output_arguments) {
        decorateLazy(collection_output_arguments, k, collection_output_arguments_value_function, lazy);
    }
    data.properties.output_arguments = new read_api.Matrix(data, "output arguments", collection_output_arguments);
    meta_table.dense_matrices_to_validate.push(function (onError) {
        imp_verifyDenseness__output_arguments__states__state_group__type__property(data, onError);
    });
    return data;
}
exports.imp_decorate_states__state_group__type__property = imp_decorate_states__state_group__type__property;
function imp_decorate_state_group__type__property(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cstate_group__type__property();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    var collection_output_parameters = {};
    var source_collection_output_parameters = $["output parameters"] || {};
    function collection_output_parameters_value_function(vk) {
        return imp_decorate_output_parameters(api, $["output parameters"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
    }
    for (var k in source_collection_output_parameters) {
        decorateLazy(collection_output_parameters, k, collection_output_parameters_value_function, lazy);
    }
    data.properties.output_parameters = new read_api.Dictionary(data, "output parameters", collection_output_parameters);
    var collection_states__state_group__type__property = {};
    var source_collection_states__state_group__type__property = $["states"] || {};
    function collection_states__state_group__type__property_value_function(vk) {
        return imp_decorate_states__state_group__type__property(api, $["states"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
    }
    for (var k in source_collection_states__state_group__type__property) {
        decorateLazy(collection_states__state_group__type__property, k, collection_states__state_group__type__property_value_function, lazy);
    }
    data.properties.states = new read_api.Dictionary(data, "states", collection_states__state_group__type__property);
    return data;
}
exports.imp_decorate_state_group__type__property = imp_decorate_state_group__type__property;
function imp_decorate_text__type__property(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ctext__type__property();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_text__type__property = imp_decorate_text__type__property;
var StateLookup__type__property = {
    "collection": imp_decorate_collection__type__property,
    "component": imp_decorate_component,
    "file": imp_decorate_file__type__property,
    "group": imp_decorate_group__type__property,
    "number": imp_decorate_number__type__property,
    "reference": imp_decorate_reference__type__property,
    "state group": imp_decorate_state_group__type__property,
    "text": imp_decorate_text__type__property
};
function imp_decorate_property(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cproperty();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__property[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__property = {};
    return data;
}
exports.imp_decorate_property = imp_decorate_property;
var StateLookup__type__attributes = {
    "command": imp_decorate_command,
    "property": imp_decorate_property
};
function imp_decorate_attributes(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cattributes();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.key = collection_key;
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__attributes[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__attributes = {};
    return data;
}
exports.imp_decorate_attributes = imp_decorate_attributes;
function imp_decorate_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cnode();
    data.location = containing_node;
    data.property_component_name = property_name;
    data.output_parameters = {};
    data.imp_resolveInputParameter = resolveInputParameter;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    var collection_attributes = {};
    var source_collection_attributes = $["attributes"] || {};
    function collection_attributes_value_function(vk) {
        return imp_decorate_attributes(api, $["attributes"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
    }
    for (var k in source_collection_attributes) {
        decorateLazy(collection_attributes, k, collection_attributes_value_function, lazy);
    }
    data.properties.attributes = new read_api.Dictionary(data, "attributes", collection_attributes);
    return data;
}
exports.imp_decorate_node = imp_decorate_node;
function imp_decorate_no__has_steps__node_content_path(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cno__has_steps__node_content_path();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_no__has_steps__node_content_path = imp_decorate_no__has_steps__node_content_path;
function imp_decorate_group__type__yes__has_steps__node_content_path(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cgroup__type__yes__has_steps__node_content_path();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.group = createReference($["group"]);
    resolveLazy(data, data.properties.group, meta_table, resolver.imp_resolve_reference__group__group__type__yes__has_steps__node_content_path, onError, lazy);
    return data;
}
exports.imp_decorate_group__type__yes__has_steps__node_content_path = imp_decorate_group__type__yes__has_steps__node_content_path;
function imp_decorate_state__type__yes__has_steps__node_content_path(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cstate__type__yes__has_steps__node_content_path();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.state = createReference($["state"]);
    resolveLazy(data, data.properties.state, meta_table, resolver.imp_resolve_reference__state__state__type__yes__has_steps__node_content_path, onError, lazy);
    data.properties.state_group = createReference($["state group"]);
    resolveLazy(data, data.properties.state_group, meta_table, resolver.imp_resolve_reference__state_group__state__type__yes__has_steps__node_content_path, onError, lazy);
    return data;
}
exports.imp_decorate_state__type__yes__has_steps__node_content_path = imp_decorate_state__type__yes__has_steps__node_content_path;
var StateLookup__type__yes__has_steps__node_content_path = {
    "group": imp_decorate_group__type__yes__has_steps__node_content_path,
    "state": imp_decorate_state__type__yes__has_steps__node_content_path
};
function imp_decorate_yes__has_steps__node_content_path(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cyes__has_steps__node_content_path();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.tail = decorate_node_content_path(api, $["tail"], data, "tail", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                interface_resolver.imp_resolveStateOutputParameter__type__yes__has_steps__node_content_path(data, "result interface node", function (err, $_sgo_yes__has_steps__node_content_path) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        $_sgo_yes__has_steps__node_content_path.reference_selections_count += 1;
                        onResolved(null, $_sgo_yes__has_steps__node_content_path);
                    }
                }, onError);
                break;
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__yes__has_steps__node_content_path[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__yes__has_steps__node_content_path = {
        "result interface node": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters__type__yes__has_steps__node_content_path, "result interface node", meta_table, resolver.imp_resolveStateOutputParameter__type__yes__has_steps__node_content_path, onError, lazy);
    return data;
}
exports.imp_decorate_yes__has_steps__node_content_path = imp_decorate_yes__has_steps__node_content_path;
var StateLookup__has_steps__node_content_path = {
    "no": imp_decorate_no__has_steps__node_content_path,
    "yes": imp_decorate_yes__has_steps__node_content_path
};
function imp_decorate_node_content_path(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cnode_content_path();
    data.location = containing_node;
    data.property_component_name = property_name;
    data.output_parameters = {
        "result interface node": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters, "result interface node", meta_table, resolver.resolveComponentOutputParameter_node_content_path, onError, lazy);
    data.imp_resolveInputParameter = resolveInputParameter;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.properties.has_steps = new read_api.StateGroup({ name: $["has steps"][0], node: StateLookup__has_steps__node_content_path[$["has steps"][0]](api, $["has steps"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__has_steps__node_content_path = {
        "result interface node": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters__has_steps__node_content_path, "result interface node", meta_table, resolver.imp_resolveStateOutputParameter__has_steps__node_content_path, onError, lazy);
    return data;
}
exports.imp_decorate_node_content_path = imp_decorate_node_content_path;
function imp_decorate_no__has_steps__node_selection_path(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cno__has_steps__node_selection_path();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_no__has_steps__node_selection_path = imp_decorate_no__has_steps__node_selection_path;
function imp_decorate_collection_parent(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ccollection_parent();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {
        "collection": {
            "referenced_node": null,
            "resolution_status": "unresolved",
            "reference_selections_count": 0
        }
    };
    resolveLazy(data, data.state_context_values["collection"], meta_table, resolver.imp_resolveStateContextValue__collection__collection_parent, onError, lazy);
    return data;
}
exports.imp_decorate_collection_parent = imp_decorate_collection_parent;
function imp_decorate_group__type__yes__has_steps__node_selection_path(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cgroup__type__yes__has_steps__node_selection_path();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.group = createReference($["group"]);
    resolveLazy(data, data.properties.group, meta_table, resolver.imp_resolve_reference__group__group__type__yes__has_steps__node_selection_path, onError, lazy);
    return data;
}
exports.imp_decorate_group__type__yes__has_steps__node_selection_path = imp_decorate_group__type__yes__has_steps__node_selection_path;
function imp_decorate_group_parent(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cgroup_parent();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {
        "group": {
            "referenced_node": null,
            "resolution_status": "unresolved",
            "reference_selections_count": 0
        }
    };
    resolveLazy(data, data.state_context_values["group"], meta_table, resolver.imp_resolveStateContextValue__group__group_parent, onError, lazy);
    return data;
}
exports.imp_decorate_group_parent = imp_decorate_group_parent;
function imp_decorate_matrix_key(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cmatrix_key();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {
        "matrix": {
            "referenced_node": null,
            "resolution_status": "unresolved",
            "reference_selections_count": 0
        }
    };
    resolveLazy(data, data.state_context_values["matrix"], meta_table, resolver.imp_resolveStateContextValue__matrix__matrix_key, onError, lazy);
    return data;
}
exports.imp_decorate_matrix_key = imp_decorate_matrix_key;
function imp_decorate_reference__type__yes(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Creference__type__yes();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.reference = createReference($["reference"]);
    resolveLazy(data, data.properties.reference, meta_table, resolver.imp_resolve_reference__reference__reference__type__yes, onError, lazy);
    return data;
}
exports.imp_decorate_reference__type__yes = imp_decorate_reference__type__yes;
function imp_decorate_state_group_output_parameter(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cstate_group_output_parameter();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.output_parameter = createReference($["output parameter"]);
    resolveLazy(data, data.properties.output_parameter, meta_table, resolver.imp_resolve_reference__output_parameter__state_group_output_parameter, onError, lazy);
    data.properties.state_group = createReference($["state group"]);
    resolveLazy(data, data.properties.state_group, meta_table, resolver.imp_resolve_reference__state_group__state_group_output_parameter, onError, lazy);
    return data;
}
exports.imp_decorate_state_group_output_parameter = imp_decorate_state_group_output_parameter;
function imp_decorate_state_parent__type__yes__has_steps__node_selection_path(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cstate_parent__type__yes__has_steps__node_selection_path();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {
        "state": {
            "referenced_node": null,
            "resolution_status": "unresolved",
            "reference_selections_count": 0
        }
    };
    resolveLazy(data, data.state_context_values["state"], meta_table, resolver.imp_resolveStateContextValue__state__state_parent__type__yes__has_steps__node_selection_path, onError, lazy);
    return data;
}
exports.imp_decorate_state_parent__type__yes__has_steps__node_selection_path = imp_decorate_state_parent__type__yes__has_steps__node_selection_path;
var StateLookup__type__yes__has_steps__node_selection_path = {
    "collection parent": imp_decorate_collection_parent,
    "group": imp_decorate_group__type__yes__has_steps__node_selection_path,
    "group parent": imp_decorate_group_parent,
    "matrix key": imp_decorate_matrix_key,
    "reference": imp_decorate_reference__type__yes,
    "state group output parameter": imp_decorate_state_group_output_parameter,
    "state parent": imp_decorate_state_parent__type__yes__has_steps__node_selection_path
};
function imp_decorate_yes__has_steps__node_selection_path(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cyes__has_steps__node_selection_path();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.tail = decorate_node_selection_path(api, $["tail"], data, "tail", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                interface_resolver.imp_resolveStateOutputParameter__type__yes__has_steps__node_selection_path(data, "result interface node", function (err, $_sgo_yes__has_steps__node_selection_path) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        $_sgo_yes__has_steps__node_selection_path.reference_selections_count += 1;
                        onResolved(null, $_sgo_yes__has_steps__node_selection_path);
                    }
                }, onError);
                break;
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__yes__has_steps__node_selection_path[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__yes__has_steps__node_selection_path = {
        "result interface node": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters__type__yes__has_steps__node_selection_path, "result interface node", meta_table, resolver.imp_resolveStateOutputParameter__type__yes__has_steps__node_selection_path, onError, lazy);
    return data;
}
exports.imp_decorate_yes__has_steps__node_selection_path = imp_decorate_yes__has_steps__node_selection_path;
var StateLookup__has_steps__node_selection_path = {
    "no": imp_decorate_no__has_steps__node_selection_path,
    "yes": imp_decorate_yes__has_steps__node_selection_path
};
function imp_decorate_node_selection_path(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cnode_selection_path();
    data.location = containing_node;
    data.property_component_name = property_name;
    data.output_parameters = {
        "result interface node": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters, "result interface node", meta_table, resolver.resolveComponentOutputParameter_node_selection_path, onError, lazy);
    data.imp_resolveInputParameter = resolveInputParameter;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.properties.has_steps = new read_api.StateGroup({ name: $["has steps"][0], node: StateLookup__has_steps__node_selection_path[$["has steps"][0]](api, $["has steps"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__has_steps__node_selection_path = {
        "result interface node": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters__has_steps__node_selection_path, "result interface node", meta_table, resolver.imp_resolveStateOutputParameter__has_steps__node_selection_path, onError, lazy);
    return data;
}
exports.imp_decorate_node_selection_path = imp_decorate_node_selection_path;
function imp_decorate_component_type(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ccomponent_type();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.component_type = createReference($["component type"]);
    resolveLazy(data, data.properties.component_type, meta_table, resolver.imp_resolve_reference__component_type__component_type, onError, lazy);
    return data;
}
exports.imp_decorate_component_type = imp_decorate_component_type;
function imp_decorate_root(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Croot();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_root = imp_decorate_root;
var StateLookup__root_type__node_type_path = {
    "component type": imp_decorate_component_type,
    "root": imp_decorate_root
};
function imp_decorate_node_type_path(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cnode_type_path();
    data.location = containing_node;
    data.property_component_name = property_name;
    data.output_parameters = {
        "result interface node": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters, "result interface node", meta_table, resolver.resolveComponentOutputParameter_node_type_path, onError, lazy);
    data.imp_resolveInputParameter = resolveInputParameter;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.properties.root_type = new read_api.StateGroup({ name: $["root type"][0], node: StateLookup__root_type__node_type_path[$["root type"][0]](api, $["root type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__root_type__node_type_path = {
        "root type interface node": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters__root_type__node_type_path, "root type interface node", meta_table, resolver.imp_resolveStateOutputParameter__root_type__node_type_path, onError, lazy);
    data.properties.steps = decorate_node_type_path_step(api, $["steps"], data, "steps", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                interface_resolver.imp_resolveStateOutputParameter__root_type__node_type_path(data, "root type interface node", function (err, $_sgo_node_type_path) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        $_sgo_node_type_path.reference_selections_count += 1;
                        onResolved(null, $_sgo_node_type_path);
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
exports.imp_decorate_node_type_path = imp_decorate_node_type_path;
function imp_decorate_no__has_steps__node_type_path_step(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cno__has_steps__node_type_path_step();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_no__has_steps__node_type_path_step = imp_decorate_no__has_steps__node_type_path_step;
function imp_decorate_collection__type__yes(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ccollection__type__yes();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.collection = createReference($["collection"]);
    resolveLazy(data, data.properties.collection, meta_table, resolver.imp_resolve_reference__collection__collection__type__yes, onError, lazy);
    return data;
}
exports.imp_decorate_collection__type__yes = imp_decorate_collection__type__yes;
function imp_decorate_group__type__yes__has_steps__node_type_path_step(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cgroup__type__yes__has_steps__node_type_path_step();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.group = createReference($["group"]);
    resolveLazy(data, data.properties.group, meta_table, resolver.imp_resolve_reference__group__group__type__yes__has_steps__node_type_path_step, onError, lazy);
    return data;
}
exports.imp_decorate_group__type__yes__has_steps__node_type_path_step = imp_decorate_group__type__yes__has_steps__node_type_path_step;
function imp_decorate_state__type__yes__has_steps__node_type_path_step(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cstate__type__yes__has_steps__node_type_path_step();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.state = createReference($["state"]);
    resolveLazy(data, data.properties.state, meta_table, resolver.imp_resolve_reference__state__state__type__yes__has_steps__node_type_path_step, onError, lazy);
    data.properties.state_group = createReference($["state group"]);
    resolveLazy(data, data.properties.state_group, meta_table, resolver.imp_resolve_reference__state_group__state__type__yes__has_steps__node_type_path_step, onError, lazy);
    return data;
}
exports.imp_decorate_state__type__yes__has_steps__node_type_path_step = imp_decorate_state__type__yes__has_steps__node_type_path_step;
var StateLookup__type__yes__has_steps__node_type_path_step = {
    "collection": imp_decorate_collection__type__yes,
    "group": imp_decorate_group__type__yes__has_steps__node_type_path_step,
    "state": imp_decorate_state__type__yes__has_steps__node_type_path_step
};
function imp_decorate_yes__has_steps__node_type_path_step(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cyes__has_steps__node_type_path_step();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.tail = decorate_node_type_path_step(api, $["tail"], data, "tail", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                interface_resolver.imp_resolveStateOutputParameter__type__yes__has_steps__node_type_path_step(data, "result interface node", function (err, $_sgo_yes__has_steps__node_type_path_step) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        $_sgo_yes__has_steps__node_type_path_step.reference_selections_count += 1;
                        onResolved(null, $_sgo_yes__has_steps__node_type_path_step);
                    }
                }, onError);
                break;
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__yes__has_steps__node_type_path_step[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__yes__has_steps__node_type_path_step = {
        "result interface node": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters__type__yes__has_steps__node_type_path_step, "result interface node", meta_table, resolver.imp_resolveStateOutputParameter__type__yes__has_steps__node_type_path_step, onError, lazy);
    return data;
}
exports.imp_decorate_yes__has_steps__node_type_path_step = imp_decorate_yes__has_steps__node_type_path_step;
var StateLookup__has_steps__node_type_path_step = {
    "no": imp_decorate_no__has_steps__node_type_path_step,
    "yes": imp_decorate_yes__has_steps__node_type_path_step
};
function imp_decorate_node_type_path_step(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cnode_type_path_step();
    data.location = containing_node;
    data.property_component_name = property_name;
    data.output_parameters = {
        "result interface node": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters, "result interface node", meta_table, resolver.resolveComponentOutputParameter_node_type_path_step, onError, lazy);
    data.imp_resolveInputParameter = resolveInputParameter;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.properties.has_steps = new read_api.StateGroup({ name: $["has steps"][0], node: StateLookup__has_steps__node_type_path_step[$["has steps"][0]](api, $["has steps"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__has_steps__node_type_path_step = {
        "result interface node": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters__has_steps__node_type_path_step, "result interface node", meta_table, resolver.imp_resolveStateOutputParameter__has_steps__node_type_path_step, onError, lazy);
    return data;
}
exports.imp_decorate_node_type_path_step = imp_decorate_node_type_path_step;
function imp_decorate_referencer(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Creferencer();
    data.location = containing_node;
    data.property_component_name = property_name;
    data.output_parameters = {
        "referenced interface node": {
            "referenced_node": null,
            "resolution_status": "unresolved"
        }
    };
    resolveLazyWithKey(data, data.output_parameters, "referenced interface node", meta_table, resolver.resolveComponentOutputParameter_referencer, onError, lazy);
    data.imp_resolveInputParameter = resolveInputParameter;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.properties.collection = createReference($["collection"]);
    resolveLazy(data, data.properties.collection, meta_table, resolver.imp_resolve_reference__collection__referencer, onError, lazy);
    data.properties.head = decorate_node_selection_path(api, $["head"], data, "head", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                data.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
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
    data.properties.tail = decorate_node_content_path(api, $["tail"], data, "tail", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                interface_resolver.imp_resolve_reference__collection__referencer(data, function (err, $_ref_referencer) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        onResolved(null, $_ref_referencer.properties["node"]);
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
exports.imp_decorate_referencer = imp_decorate_referencer;
function imp_decorate_interface(api, $, containing_node, meta_table, onError, input_parameters, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cinterface();
    function resolveGlobalInputParameter(param, onResolved, onError) {
        switch (param) {
            default:
                onResolved(true);
        }
    }
    ;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    var collection_component_types = {};
    var source_collection_component_types = $["component types"] || {};
    function collection_component_types_value_function(vk) {
        return imp_decorate_component_types(api, $["component types"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
    }
    for (var k in source_collection_component_types) {
        decorateLazy(collection_component_types, k, collection_component_types_value_function, lazy);
    }
    data.properties.component_types = new read_api.Dictionary(data, "component types", collection_component_types);
    var collection_context_keys = {};
    var source_collection_context_keys = $["context keys"] || {};
    function collection_context_keys_value_function(vk) {
        return imp_decorate_context_keys(api, $["context keys"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
    }
    for (var k in source_collection_context_keys) {
        decorateLazy(collection_context_keys, k, collection_context_keys_value_function, lazy);
    }
    data.properties.context_keys = new read_api.Dictionary(data, "context keys", collection_context_keys);
    var collection_numerical_types = {};
    var source_collection_numerical_types = $["numerical types"] || {};
    function collection_numerical_types_value_function(vk) {
        return imp_decorate_numerical_types(api, $["numerical types"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
    }
    for (var k in source_collection_numerical_types) {
        decorateLazy(collection_numerical_types, k, collection_numerical_types_value_function, lazy);
    }
    data.properties.numerical_types = new read_api.Dictionary(data, "numerical types", collection_numerical_types);
    data.properties.root = decorate_node(api, $["root"], data, "root", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "interface":
                onResolved(null, data);
                break;
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    return data;
}
exports.imp_decorate_interface = imp_decorate_interface;
var imp_verifyDenseness__output_arguments__states__state_group__type__property;
imp_verifyDenseness__output_arguments__states__state_group__type__property = function (data, onError) {
    for (var $_entry in data.parent.properties.output_parameters["entries"]) {
        if (!data.parent.properties.output_parameters["entries"].hasOwnProperty($_entry)) {
            continue;
        }
        if (!data.properties.output_arguments["entries"][$_entry]) {
            onError({
                message: 'Missing entry in densematrix for referenced property.',
                path: data.getPath(),
                "target path": data.parent.getPath(),
                "current entries": Object.keys(data.properties.output_arguments["entries"]),
                entry: $_entry
            });
        }
    }
};
function decorate_ancestor_parameters_selection(api, $, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    return imp_decorate_ancestor_parameters_selection(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
exports.decorate_ancestor_parameters_selection = decorate_ancestor_parameters_selection;
function decorate_command_parameter_referencer(api, $, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    return imp_decorate_command_parameter_referencer(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
exports.decorate_command_parameter_referencer = decorate_command_parameter_referencer;
function decorate_command_parameters(api, $, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    return imp_decorate_command_parameters(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
exports.decorate_command_parameters = decorate_command_parameters;
function decorate_node(api, $, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    return imp_decorate_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
exports.decorate_node = decorate_node;
function decorate_node_content_path(api, $, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    return imp_decorate_node_content_path(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
exports.decorate_node_content_path = decorate_node_content_path;
function decorate_node_selection_path(api, $, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    return imp_decorate_node_selection_path(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
exports.decorate_node_selection_path = decorate_node_selection_path;
function decorate_node_type_path(api, $, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    return imp_decorate_node_type_path(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
exports.decorate_node_type_path = decorate_node_type_path;
function decorate_node_type_path_step(api, $, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    return imp_decorate_node_type_path_step(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
exports.decorate_node_type_path_step = decorate_node_type_path_step;
function decorate_referencer(api, $, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    return imp_decorate_referencer(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
exports.decorate_referencer = decorate_referencer;
function int_decorate(api, $, input_parameters, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    var meta_table = { referencers_to_resolve: [], dense_matrices_to_validate: [], constraints_to_check: [] };
    if (!onError) {
        onError = function (err) { console.error(JSON.stringify(err, null, '\t')); };
    }
    var node = imp_decorate_interface(api, $, null, meta_table, onError, input_parameters, lazy);
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
