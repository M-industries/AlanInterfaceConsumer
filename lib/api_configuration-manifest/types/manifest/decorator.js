Object.defineProperty(exports, "__esModule", { value: true });
var read_api = require("./read_api");
var resolver = require("./reference_resolver");
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
function imp_decorate_no__ordered__children(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cno__ordered__children();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_no__ordered__children = imp_decorate_no__ordered__children;
function imp_decorate_yes__ordered__children(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cyes__ordered__children();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.next = createReference($["next"]);
    resolveLazy(data, data.properties.next, meta_table, resolver.imp_resolve_reference__next__yes__ordered__children, onError, lazy);
    return data;
}
exports.imp_decorate_yes__ordered__children = imp_decorate_yes__ordered__children;
var StateLookup__ordered__children = {
    "no": imp_decorate_no__ordered__children,
    "yes": imp_decorate_yes__ordered__children
};
function imp_decorate_children(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, collection_key, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cchildren();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.key = collection_key;
    data.properties.inode = decorate_inode(api, $["inode"], data, "inode", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    data.properties.ordered = new read_api.StateGroup({ name: $["ordered"][0], node: StateLookup__ordered__children[$["ordered"][0]](api, $["ordered"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__ordered__children = {};
    return data;
}
exports.imp_decorate_children = imp_decorate_children;
function imp_decorate_no__ordered__directory(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cno__ordered__directory();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    return data;
}
exports.imp_decorate_no__ordered__directory = imp_decorate_no__ordered__directory;
function imp_decorate_yes__ordered__directory(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cyes__ordered__directory();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.first = createReference($["first"]);
    resolveLazy(data, data.properties.first, meta_table, resolver.imp_resolve_reference__first__yes__ordered__directory, onError, lazy);
    return data;
}
exports.imp_decorate_yes__ordered__directory = imp_decorate_yes__ordered__directory;
var StateLookup__ordered__directory = {
    "no": imp_decorate_no__ordered__directory,
    "yes": imp_decorate_yes__ordered__directory
};
function imp_decorate_directory(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cdirectory();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    var collection_children = {};
    var source_collection_children = $["children"] || {};
    function collection_children_value_function(vk) {
        return imp_decorate_children(api, $["children"][vk], data, meta_table, onError, resolveGlobalInputParameter, vk, lazy);
    }
    for (var k in source_collection_children) {
        decorateLazy(collection_children, k, collection_children_value_function, lazy);
    }
    data.properties.children = new read_api.Dictionary(data, "children", collection_children);
    data.properties.ordered = new read_api.StateGroup({ name: $["ordered"][0], node: StateLookup__ordered__directory[$["ordered"][0]](api, $["ordered"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__ordered__directory = {};
    return data;
}
exports.imp_decorate_directory = imp_decorate_directory;
function imp_decorate_file(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cfile();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.hash = $["hash"];
    data.properties.suffix = $["suffix"];
    return data;
}
exports.imp_decorate_file = imp_decorate_file;
function imp_decorate_library(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Clibrary();
    data.parent = containing_node;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.state_context_values = {};
    data.properties.inode = decorate_inode(api, $["inode"], data, "inode", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    return data;
}
exports.imp_decorate_library = imp_decorate_library;
var StateLookup__type__inode = {
    "directory": imp_decorate_directory,
    "file": imp_decorate_file,
    "library": imp_decorate_library
};
function imp_decorate_inode(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cinode();
    data.location = containing_node;
    data.property_component_name = property_name;
    data.output_parameters = {};
    data.imp_resolveInputParameter = resolveInputParameter;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.properties.type = new read_api.StateGroup({ name: $["type"][0], node: StateLookup__type__inode[$["type"][0]](api, $["type"][1], data, meta_table, onError, resolveGlobalInputParameter, lazy) });
    data.output_parameters__type__inode = {};
    return data;
}
exports.imp_decorate_inode = imp_decorate_inode;
function imp_decorate_manifest(api, $, containing_node, meta_table, onError, input_parameters, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Cmanifest();
    function resolveGlobalInputParameter(param, onResolved, onError) {
        switch (param) {
            default:
                onResolved(true);
        }
    }
    ;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.properties.fingerprint = $["fingerprint"];
    data.properties.language_fingerprint = $["language fingerprint"];
    data.properties.root = decorate_inode(api, $["root"], data, "root", meta_table, resolveGlobalInputParameter, function (param, onResolved, onError) {
        switch (param) {
            default:
                onResolved(true);
        }
    }, onError, lazy);
    meta_table.constraints_to_check.push(function (onError) {
    });
    return data;
}
exports.imp_decorate_manifest = imp_decorate_manifest;
function decorate_inode(api, $, containing_node, property_name, meta_table, resolveGlobalInputParameter, resolveInputParameter, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    return imp_decorate_inode(api, $, containing_node, meta_table, onError, resolveGlobalInputParameter, resolveInputParameter, property_name, lazy);
}
exports.decorate_inode = decorate_inode;
function int_decorate(api, $, input_parameters, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    var meta_table = { referencers_to_resolve: [], dense_matrices_to_validate: [], constraints_to_check: [] };
    if (!onError) {
        onError = function (err) { console.error(JSON.stringify(err, null, '\t')); };
    }
    var node = imp_decorate_manifest(api, $, null, meta_table, onError, input_parameters, lazy);
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
