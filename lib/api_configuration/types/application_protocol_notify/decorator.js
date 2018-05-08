Object.defineProperty(exports, "__esModule", { value: true });
var read_api = require("./read_api");
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
function imp_decorate_application_protocol_notify(api, $, containing_node, meta_table, onError, input_parameters, lazy) {
    if (lazy === void 0) { lazy = false; }
    var data = new api.Capplication_protocol_notify();
    function resolveGlobalInputParameter(param, onResolved, onError) {
        switch (param) {
            default:
                onResolved(true);
        }
    }
    ;
    data.imp_resolveGlobalInputParameter = resolveGlobalInputParameter;
    data.properties.notification = $["notification"];
    return data;
}
exports.imp_decorate_application_protocol_notify = imp_decorate_application_protocol_notify;
function int_decorate(api, $, input_parameters, onError, lazy) {
    if (lazy === void 0) { lazy = false; }
    var meta_table = { referencers_to_resolve: [], dense_matrices_to_validate: [], constraints_to_check: [] };
    if (!onError) {
        onError = function (err) { console.error(JSON.stringify(err, null, '\t')); };
    }
    var node = imp_decorate_application_protocol_notify(api, $, null, meta_table, onError, input_parameters, lazy);
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
