Object.defineProperty(exports, "__esModule", { value: true });
var read_api = require("./read_api");
var resolver = require("./reference_resolver");
var interface_reply_resolver = require("./reference_resolver");
var interface_resolver = require("../interface/reference_resolver");
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
function imp_decorate_no__has_initialization_data(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["source"], meta_table, resolver.imp_resolveStateContextValue__source__no__has_initialization_data, onError, lazy);
    return data;
}
exports.imp_decorate_no__has_initialization_data = imp_decorate_no__has_initialization_data;
function imp_decorate_no__context_exists(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cno__context_exists();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_no__context_exists = imp_decorate_no__context_exists;
function imp_decorate_yes__context_exists(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cyes__context_exists();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.root = decorate_initialize_node(api, $["root"], data, "root", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                data.parent.parent.parent.imp_resolveGlobalInputParameter("interface", function (err, $_i_param_interface) {
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
exports.imp_decorate_yes__context_exists = imp_decorate_yes__context_exists;
var StateLookup__context_exists__yes__has_initialization_data = {
    "no": imp_decorate_no__context_exists,
    "yes": imp_decorate_yes__context_exists
};
function imp_decorate_yes__has_initialization_data(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["source"], meta_table, resolver.imp_resolveStateContextValue__source__yes__has_initialization_data, onError, lazy);
    data.properties.context_exists = new read_api.StateGroup({ name: $["context exists"][0], node: StateLookup__context_exists__yes__has_initialization_data[$["context exists"][0]](api, $["context exists"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__context_exists__yes__has_initialization_data = {};
    return data;
}
exports.imp_decorate_yes__has_initialization_data = imp_decorate_yes__has_initialization_data;
var StateLookup__has_initialization_data__initialization = {
    "no": imp_decorate_no__has_initialization_data,
    "yes": imp_decorate_yes__has_initialization_data
};
function imp_decorate_initialization(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["source"], meta_table, resolver.imp_resolveStateContextValue__source__initialization, onError, lazy);
    data.properties.has_initialization_data = new read_api.StateGroup({ name: $["has initialization data"][0], node: StateLookup__has_initialization_data__initialization[$["has initialization data"][0]](api, $["has initialization data"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__has_initialization_data__initialization = {};
    return data;
}
exports.imp_decorate_initialization = imp_decorate_initialization;
function imp_decorate_create__type__notification(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ccreate__type__notification();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.initialize_node = decorate_initialize_node(api, $["initialize node"], data, "initialize node", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                data.parent.parent.imp_resolveGlobalInputParameter("interface", function (err, $_i_param_interface) {
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
exports.imp_decorate_create__type__notification = imp_decorate_create__type__notification;
function imp_decorate_remove__type__notification(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cremove__type__notification();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_remove__type__notification = imp_decorate_remove__type__notification;
function imp_decorate_update__type__notification(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cupdate__type__notification();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.update_node = decorate_update_node(api, $["update node"], data, "update node", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                data.parent.parent.imp_resolveGlobalInputParameter("interface", function (err, $_i_param_interface) {
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
exports.imp_decorate_update__type__notification = imp_decorate_update__type__notification;
var StateLookup__type__notification = {
    "create": imp_decorate_create__type__notification,
    "remove": imp_decorate_remove__type__notification,
    "update": imp_decorate_update__type__notification
};
function imp_decorate_notification(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["source"], meta_table, resolver.imp_resolveStateContextValue__source__notification, onError, lazy);
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__notification[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__notification = {};
    return data;
}
exports.imp_decorate_notification = imp_decorate_notification;
function imp_decorate_delete_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cdelete_node();
    data.location = containing_node;
    data.property_component_name = property_name;
    data.output_parameters = {};
    data.imp_resolveInputParameter = resolveInputParameter;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    return data;
}
exports.imp_decorate_delete_node = imp_decorate_delete_node;
function imp_decorate_entries__collection__type__properties__initialize_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Centries__collection__type__properties__initialize_node();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.key = collection_key;
    data.properties.node = decorate_initialize_node(api, $["node"], data, "node", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                interface_reply_resolver.imp_resolveStateContextValue__collection__collection__type__properties__initialize_node(data.parent, function (err, $_scv_collection) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        onResolved(null, $_scv_collection.properties["node"]);
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
exports.imp_decorate_entries__collection__type__properties__initialize_node = imp_decorate_entries__collection__type__properties__initialize_node;
function imp_decorate_dictionary__type__collection__type__properties__initialize_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["dictionary"], meta_table, resolver.imp_resolveStateContextValue__dictionary__dictionary__type__collection__type__properties__initialize_node, onError, lazy);
    return data;
}
exports.imp_decorate_dictionary__type__collection__type__properties__initialize_node = imp_decorate_dictionary__type__collection__type__properties__initialize_node;
function imp_decorate_matrix__type__collection__type__properties__initialize_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["matrix"], meta_table, resolver.imp_resolveStateContextValue__matrix__matrix__type__collection__type__properties__initialize_node, onError, lazy);
    return data;
}
exports.imp_decorate_matrix__type__collection__type__properties__initialize_node = imp_decorate_matrix__type__collection__type__properties__initialize_node;
var StateLookup__type__collection__type__properties__initialize_node = {
    "dictionary": imp_decorate_dictionary__type__collection__type__properties__initialize_node,
    "matrix": imp_decorate_matrix__type__collection__type__properties__initialize_node
};
function imp_decorate_collection__type__properties__initialize_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["collection"], meta_table, resolver.imp_resolveStateContextValue__collection__collection__type__properties__initialize_node, onError, lazy);
    var collection_entries__collection__type__properties__initialize_node = {};
    var source_collection_entries__collection__type__properties__initialize_node = $["entries"] || {};
    function collection_entries__collection__type__properties__initialize_node_value_function(vk) {
        return imp_decorate_entries__collection__type__properties__initialize_node(api, $["entries"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
    }
    for (var k in source_collection_entries__collection__type__properties__initialize_node) {
        decorateLazy(collection_entries__collection__type__properties__initialize_node, k, collection_entries__collection__type__properties__initialize_node_value_function, lazy);
    }
    data.properties.entries = new read_api.Dictionary(data, "entries", collection_entries__collection__type__properties__initialize_node);
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__collection__type__properties__initialize_node[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__collection__type__properties__initialize_node = {};
    return data;
}
exports.imp_decorate_collection__type__properties__initialize_node = imp_decorate_collection__type__properties__initialize_node;
function imp_decorate_component__type__properties__initialize_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["component"], meta_table, resolver.imp_resolveStateContextValue__component__component__type__properties__initialize_node, onError, lazy);
    data.properties.node = decorate_initialize_node(api, $["node"], data, "node", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                interface_reply_resolver.imp_resolveStateContextValue__component__component__type__properties__initialize_node(data, function (err, $_scv_component) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        interface_resolver.imp_resolve_reference__type__component($_scv_component, function (err, $_ref_component) {
                            if (err) {
                                onResolved(true);
                            }
                            else {
                                onResolved(null, $_ref_component.properties["node"]);
                            }
                        }, onError);
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
exports.imp_decorate_component__type__properties__initialize_node = imp_decorate_component__type__properties__initialize_node;
function imp_decorate_file__type__properties__initialize_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["text"], meta_table, resolver.imp_resolveStateContextValue__text__file__type__properties__initialize_node, onError, lazy);
    data.properties.extension = $["extension"];
    data.properties.token = $["token"];
    return data;
}
exports.imp_decorate_file__type__properties__initialize_node = imp_decorate_file__type__properties__initialize_node;
function imp_decorate_group__type__properties__initialize_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["group"], meta_table, resolver.imp_resolveStateContextValue__group__group__type__properties__initialize_node, onError, lazy);
    data.properties.node = decorate_initialize_node(api, $["node"], data, "node", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                interface_reply_resolver.imp_resolveStateContextValue__group__group__type__properties__initialize_node(data, function (err, $_scv_group) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        onResolved(null, $_scv_group.properties["node"]);
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
exports.imp_decorate_group__type__properties__initialize_node = imp_decorate_group__type__properties__initialize_node;
function imp_decorate_integer__type__number__type__properties__initialize_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["integer type"], meta_table, resolver.imp_resolveStateContextValue__integer_type__integer__type__number__type__properties__initialize_node, onError, lazy);
    data.properties.value = $["value"];
    return data;
}
exports.imp_decorate_integer__type__number__type__properties__initialize_node = imp_decorate_integer__type__number__type__properties__initialize_node;
function imp_decorate_natural__type__number__type__properties__initialize_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["natural type"], meta_table, resolver.imp_resolveStateContextValue__natural_type__natural__type__number__type__properties__initialize_node, onError, lazy);
    data.properties.value = $["value"];
    return data;
}
exports.imp_decorate_natural__type__number__type__properties__initialize_node = imp_decorate_natural__type__number__type__properties__initialize_node;
var StateLookup__type__number__type__properties__initialize_node = {
    "integer": imp_decorate_integer__type__number__type__properties__initialize_node,
    "natural": imp_decorate_natural__type__number__type__properties__initialize_node
};
function imp_decorate_number__type__properties__initialize_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["number"], meta_table, resolver.imp_resolveStateContextValue__number__number__type__properties__initialize_node, onError, lazy);
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__number__type__properties__initialize_node[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__number__type__properties__initialize_node = {};
    return data;
}
exports.imp_decorate_number__type__properties__initialize_node = imp_decorate_number__type__properties__initialize_node;
function imp_decorate_reference__type__properties__initialize_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["reference"], meta_table, resolver.imp_resolveStateContextValue__reference__reference__type__properties__initialize_node, onError, lazy);
    data.properties.referenced_node = $["referenced node"];
    return data;
}
exports.imp_decorate_reference__type__properties__initialize_node = imp_decorate_reference__type__properties__initialize_node;
function imp_decorate_state_group__type__properties__initialize_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["state group"], meta_table, resolver.imp_resolveStateContextValue__state_group__state_group__type__properties__initialize_node, onError, lazy);
    data.properties.node = decorate_initialize_node(api, $["node"], data, "node", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                interface_reply_resolver.imp_resolve_reference__state__state_group__type__properties__initialize_node(data, function (err, $_ref_state_group__type__properties__initialize_node) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        onResolved(null, $_ref_state_group__type__properties__initialize_node.properties["node"]);
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
    resolveLazy(data, data.properties.state, meta_table, resolver.imp_resolve_reference__state__state_group__type__properties__initialize_node, onError, lazy);
    return data;
}
exports.imp_decorate_state_group__type__properties__initialize_node = imp_decorate_state_group__type__properties__initialize_node;
function imp_decorate_text__type__properties__initialize_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["text"], meta_table, resolver.imp_resolveStateContextValue__text__text__type__properties__initialize_node, onError, lazy);
    data.properties.value = $["value"];
    return data;
}
exports.imp_decorate_text__type__properties__initialize_node = imp_decorate_text__type__properties__initialize_node;
var StateLookup__type__properties__initialize_node = {
    "collection": imp_decorate_collection__type__properties__initialize_node,
    "component": imp_decorate_component__type__properties__initialize_node,
    "file": imp_decorate_file__type__properties__initialize_node,
    "group": imp_decorate_group__type__properties__initialize_node,
    "number": imp_decorate_number__type__properties__initialize_node,
    "reference": imp_decorate_reference__type__properties__initialize_node,
    "state group": imp_decorate_state_group__type__properties__initialize_node,
    "text": imp_decorate_text__type__properties__initialize_node
};
function imp_decorate_properties__initialize_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cproperties__initialize_node();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.key = {
        entry: collection_key,
        referenced_node: null,
        resolution_status: 'unresolved'
    };
    resolveLazy(data, data.key, meta_table, resolver.imp_resolve_matrix_key__properties__initialize_node, onError, lazy);
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__properties__initialize_node[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__properties__initialize_node = {};
    return data;
}
exports.imp_decorate_properties__initialize_node = imp_decorate_properties__initialize_node;
function imp_decorate_initialize_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cinitialize_node();
    data.location = containing_node;
    data.property_component_name = property_name;
    data.output_parameters = {};
    data.imp_resolveInputParameter = resolveInputParameter;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    var collection_properties__initialize_node = {};
    var source_collection_properties__initialize_node = $["properties"] || {};
    function collection_properties__initialize_node_value_function(vk) {
        return imp_decorate_properties__initialize_node(api, $["properties"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
    }
    for (var k in source_collection_properties__initialize_node) {
        decorateLazy(collection_properties__initialize_node, k, collection_properties__initialize_node_value_function, lazy);
    }
    data.properties.properties = new read_api.Matrix(data, "properties", collection_properties__initialize_node);
    meta_table.dense_matrices_to_validate.push(function (onError) {
        imp_verifyDenseness__properties__initialize_node(data, onError);
    });
    return data;
}
exports.imp_decorate_initialize_node = imp_decorate_initialize_node;
function imp_decorate_create__type__entries(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Ccreate__type__entries();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.node = decorate_initialize_node(api, $["node"], data, "node", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                interface_reply_resolver.imp_resolveStateContextValue__collection__collection__type__properties__update_node(data.parent.parent, function (err, $_scv_collection) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        onResolved(null, $_scv_collection.properties["node"]);
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
exports.imp_decorate_create__type__entries = imp_decorate_create__type__entries;
function imp_decorate_remove__type__entries(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cremove__type__entries();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.delete_node = decorate_delete_node(api, $["delete node"], data, "delete node", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    return data;
}
exports.imp_decorate_remove__type__entries = imp_decorate_remove__type__entries;
function imp_decorate_rename(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Crename();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.old_id = createReference($["old id"]);
    resolveLazy(data, data.properties.old_id, meta_table, resolver.imp_resolve_reference__old_id__rename, onError, lazy);
    return data;
}
exports.imp_decorate_rename = imp_decorate_rename;
function imp_decorate_no__invalidate_referencer(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cno__invalidate_referencer();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_no__invalidate_referencer = imp_decorate_no__invalidate_referencer;
function imp_decorate_yes__invalidate_referencer(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["matrix"], meta_table, resolver.imp_resolveStateContextValue__matrix__yes__invalidate_referencer, onError, lazy);
    return data;
}
exports.imp_decorate_yes__invalidate_referencer = imp_decorate_yes__invalidate_referencer;
var StateLookup__invalidate_referencer__update__type__entries = {
    "no": imp_decorate_no__invalidate_referencer,
    "yes": imp_decorate_yes__invalidate_referencer
};
function imp_decorate_update__type__entries(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cupdate__type__entries();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.invalidate_referencer = new read_api.StateGroup({ name: $["invalidate referencer"][0], node: StateLookup__invalidate_referencer__update__type__entries[$["invalidate referencer"][0]](api, $["invalidate referencer"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__invalidate_referencer__update__type__entries = {};
    data.properties.update_node = decorate_update_node(api, $["update node"], data, "update node", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                interface_reply_resolver.imp_resolveStateContextValue__collection__collection__type__properties__update_node(data.parent.parent, function (err, $_scv_collection) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        onResolved(null, $_scv_collection.properties["node"]);
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
exports.imp_decorate_update__type__entries = imp_decorate_update__type__entries;
var StateLookup__type__entries__collection__type__properties__update_node = {
    "create": imp_decorate_create__type__entries,
    "remove": imp_decorate_remove__type__entries,
    "rename": imp_decorate_rename,
    "update": imp_decorate_update__type__entries
};
function imp_decorate_entries__collection__type__properties__update_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Centries__collection__type__properties__update_node();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.key = collection_key;
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__entries__collection__type__properties__update_node[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__entries__collection__type__properties__update_node = {};
    return data;
}
exports.imp_decorate_entries__collection__type__properties__update_node = imp_decorate_entries__collection__type__properties__update_node;
function imp_decorate_dictionary__type__collection__type__properties__update_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["dictionary"], meta_table, resolver.imp_resolveStateContextValue__dictionary__dictionary__type__collection__type__properties__update_node, onError, lazy);
    return data;
}
exports.imp_decorate_dictionary__type__collection__type__properties__update_node = imp_decorate_dictionary__type__collection__type__properties__update_node;
function imp_decorate_matrix__type__collection__type__properties__update_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["matrix"], meta_table, resolver.imp_resolveStateContextValue__matrix__matrix__type__collection__type__properties__update_node, onError, lazy);
    return data;
}
exports.imp_decorate_matrix__type__collection__type__properties__update_node = imp_decorate_matrix__type__collection__type__properties__update_node;
var StateLookup__type__collection__type__properties__update_node = {
    "dictionary": imp_decorate_dictionary__type__collection__type__properties__update_node,
    "matrix": imp_decorate_matrix__type__collection__type__properties__update_node
};
function imp_decorate_collection__type__properties__update_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["collection"], meta_table, resolver.imp_resolveStateContextValue__collection__collection__type__properties__update_node, onError, lazy);
    var collection_entries__collection__type__properties__update_node = {};
    var source_collection_entries__collection__type__properties__update_node = $["entries"] || {};
    function collection_entries__collection__type__properties__update_node_value_function(vk) {
        return imp_decorate_entries__collection__type__properties__update_node(api, $["entries"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
    }
    for (var k in source_collection_entries__collection__type__properties__update_node) {
        decorateLazy(collection_entries__collection__type__properties__update_node, k, collection_entries__collection__type__properties__update_node_value_function, lazy);
    }
    data.properties.entries = new read_api.Dictionary(data, "entries", collection_entries__collection__type__properties__update_node);
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__collection__type__properties__update_node[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__collection__type__properties__update_node = {};
    return data;
}
exports.imp_decorate_collection__type__properties__update_node = imp_decorate_collection__type__properties__update_node;
function imp_decorate_component__type__properties__update_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["component"], meta_table, resolver.imp_resolveStateContextValue__component__component__type__properties__update_node, onError, lazy);
    data.properties.update_node = decorate_update_node(api, $["update node"], data, "update node", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                interface_reply_resolver.imp_resolveStateContextValue__component__component__type__properties__update_node(data, function (err, $_scv_component) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        interface_resolver.imp_resolve_reference__type__component($_scv_component, function (err, $_ref_component) {
                            if (err) {
                                onResolved(true);
                            }
                            else {
                                onResolved(null, $_ref_component.properties["node"]);
                            }
                        }, onError);
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
exports.imp_decorate_component__type__properties__update_node = imp_decorate_component__type__properties__update_node;
function imp_decorate_file__type__properties__update_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["file"], meta_table, resolver.imp_resolveStateContextValue__file__file__type__properties__update_node, onError, lazy);
    data.properties.new_extension = $["new extension"];
    data.properties.new_token = $["new token"];
    return data;
}
exports.imp_decorate_file__type__properties__update_node = imp_decorate_file__type__properties__update_node;
function imp_decorate_group__type__properties__update_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["group"], meta_table, resolver.imp_resolveStateContextValue__group__group__type__properties__update_node, onError, lazy);
    data.properties.update_node = decorate_update_node(api, $["update node"], data, "update node", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                interface_reply_resolver.imp_resolveStateContextValue__group__group__type__properties__update_node(data, function (err, $_scv_group) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        onResolved(null, $_scv_group.properties["node"]);
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
exports.imp_decorate_group__type__properties__update_node = imp_decorate_group__type__properties__update_node;
function imp_decorate_integer__type__number__type__properties__update_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["integer type"], meta_table, resolver.imp_resolveStateContextValue__integer_type__integer__type__number__type__properties__update_node, onError, lazy);
    data.properties.new_value = $["new value"];
    return data;
}
exports.imp_decorate_integer__type__number__type__properties__update_node = imp_decorate_integer__type__number__type__properties__update_node;
function imp_decorate_natural__type__number__type__properties__update_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["natural type"], meta_table, resolver.imp_resolveStateContextValue__natural_type__natural__type__number__type__properties__update_node, onError, lazy);
    data.properties.new_value = $["new value"];
    return data;
}
exports.imp_decorate_natural__type__number__type__properties__update_node = imp_decorate_natural__type__number__type__properties__update_node;
var StateLookup__type__number__type__properties__update_node = {
    "integer": imp_decorate_integer__type__number__type__properties__update_node,
    "natural": imp_decorate_natural__type__number__type__properties__update_node
};
function imp_decorate_number__type__properties__update_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["number"], meta_table, resolver.imp_resolveStateContextValue__number__number__type__properties__update_node, onError, lazy);
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__number__type__properties__update_node[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__number__type__properties__update_node = {};
    return data;
}
exports.imp_decorate_number__type__properties__update_node = imp_decorate_number__type__properties__update_node;
function imp_decorate_reference__type__properties__update_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["reference"], meta_table, resolver.imp_resolveStateContextValue__reference__reference__type__properties__update_node, onError, lazy);
    data.properties.new_referenced_node = $["new referenced node"];
    return data;
}
exports.imp_decorate_reference__type__properties__update_node = imp_decorate_reference__type__properties__update_node;
function imp_decorate_set(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cset();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.delete_node = decorate_delete_node(api, $["delete node"], data, "delete node", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    data.properties.node = decorate_initialize_node(api, $["node"], data, "node", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                interface_reply_resolver.imp_resolve_reference__state__state_group__type__properties__update_node(data.parent, function (err, $_ref_state_group__type__properties__update_node) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        onResolved(null, $_ref_state_group__type__properties__update_node.properties["node"]);
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
exports.imp_decorate_set = imp_decorate_set;
function imp_decorate_update__type__state_group(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cupdate__type__state_group();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.update_node = decorate_update_node(api, $["update node"], data, "update node", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            case "context node":
                interface_reply_resolver.imp_resolve_reference__state__state_group__type__properties__update_node(data.parent, function (err, $_ref_state_group__type__properties__update_node) {
                    if (err) {
                        onResolved(true);
                    }
                    else {
                        onResolved(null, $_ref_state_group__type__properties__update_node.properties["node"]);
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
exports.imp_decorate_update__type__state_group = imp_decorate_update__type__state_group;
var StateLookup__type__state_group__type__properties__update_node = {
    "set": imp_decorate_set,
    "update": imp_decorate_update__type__state_group
};
function imp_decorate_state_group__type__properties__update_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["state group"], meta_table, resolver.imp_resolveStateContextValue__state_group__state_group__type__properties__update_node, onError, lazy);
    data.properties.state = createReference($["state"]);
    resolveLazy(data, data.properties.state, meta_table, resolver.imp_resolve_reference__state__state_group__type__properties__update_node, onError, lazy);
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__state_group__type__properties__update_node[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__state_group__type__properties__update_node = {};
    return data;
}
exports.imp_decorate_state_group__type__properties__update_node = imp_decorate_state_group__type__properties__update_node;
function imp_decorate_text__type__properties__update_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
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
    resolveLazy(data, data.state_context_values["text"], meta_table, resolver.imp_resolveStateContextValue__text__text__type__properties__update_node, onError, lazy);
    data.properties.new_value = $["new value"];
    return data;
}
exports.imp_decorate_text__type__properties__update_node = imp_decorate_text__type__properties__update_node;
var StateLookup__type__properties__update_node = {
    "collection": imp_decorate_collection__type__properties__update_node,
    "component": imp_decorate_component__type__properties__update_node,
    "file": imp_decorate_file__type__properties__update_node,
    "group": imp_decorate_group__type__properties__update_node,
    "number": imp_decorate_number__type__properties__update_node,
    "reference": imp_decorate_reference__type__properties__update_node,
    "state group": imp_decorate_state_group__type__properties__update_node,
    "text": imp_decorate_text__type__properties__update_node
};
function imp_decorate_properties__update_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cproperties__update_node();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.key = {
        entry: collection_key,
        referenced_node: null,
        resolution_status: 'unresolved'
    };
    resolveLazy(data, data.key, meta_table, resolver.imp_resolve_matrix_key__properties__update_node, onError, lazy);
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__properties__update_node[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__properties__update_node = {};
    return data;
}
exports.imp_decorate_properties__update_node = imp_decorate_properties__update_node;
function imp_decorate_update_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cupdate_node();
    data.location = containing_node;
    data.property_component_name = property_name;
    data.output_parameters = {};
    data.imp_resolveInputParameter = resolveInputParameter;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    var collection_properties__update_node = {};
    var source_collection_properties__update_node = $["properties"] || {};
    function collection_properties__update_node_value_function(vk) {
        return imp_decorate_properties__update_node(api, $["properties"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
    }
    for (var k in source_collection_properties__update_node) {
        decorateLazy(collection_properties__update_node, k, collection_properties__update_node_value_function, lazy);
    }
    data.properties.properties = new read_api.Matrix(data, "properties", collection_properties__update_node);
    return data;
}
exports.imp_decorate_update_node = imp_decorate_update_node;
var StateLookup__type__interface_reply = {
    "initialization": imp_decorate_initialization,
    "notification": imp_decorate_notification
};
function imp_decorate_interface_reply(api, $, containing_node, meta_table, onError, input_parameters, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cinterface_reply();
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
            case "request":
                if (input_parameters["request"]) {
                    onResolved(null, input_parameters["request"]);
                }
                else {
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
    }
    ;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__interface_reply[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__interface_reply = {};
    return data;
}
exports.imp_decorate_interface_reply = imp_decorate_interface_reply;
var imp_verifyDenseness__properties__initialize_node;
imp_verifyDenseness__properties__initialize_node = function (data, onError) {
    data.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
        if (err) {
        }
        else {
            for (var $_entry in $_i_param_context_node.properties.attributes["entries"]) {
                if (!$_i_param_context_node.properties.attributes["entries"].hasOwnProperty($_entry)) {
                    continue;
                }
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
function decorate_delete_node(api, $, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    return imp_decorate_delete_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
exports.decorate_delete_node = decorate_delete_node;
function decorate_initialize_node(api, $, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    return imp_decorate_initialize_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
exports.decorate_initialize_node = decorate_initialize_node;
function decorate_update_node(api, $, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    return imp_decorate_update_node(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
exports.decorate_update_node = decorate_update_node;
function int_decorate(api, $, input_parameters, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    var meta_table = { referencers_to_resolve: [], dense_matrices_to_validate: [], constraints_to_check: [] };
    if (!onError) {
        onError = function (err) { console.error(JSON.stringify(err, null, '\t')); };
    }
    var node = imp_decorate_interface_reply(api, $, null, meta_table, onError, input_parameters, lazy);
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
