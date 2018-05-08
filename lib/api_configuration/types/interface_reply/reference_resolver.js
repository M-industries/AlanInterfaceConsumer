Object.defineProperty(exports, "__esModule", { value: true });
var interface_reply_resolver = require("./reference_resolver");
function switchResolutionStatus(reference_property, context, key, onResolved, onError) {
    var must_resolve = false;
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
            if (!reference_property.referenced_node)
                throw new Error('Implementation error!');
            onResolved(null, reference_property.referenced_node);
            break;
        case 'unresolved':
            reference_property.resolution_status = 'resolving';
            must_resolve = true;
            break;
    }
    return must_resolve;
}
function checkCollectionEntry(reference, $context, entry_context, entry_collection, onResolved, onError) {
    var entry = entry_context.properties[entry_collection].entries[reference.entry];
    if (entry) {
        return entry;
    }
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
function checkPluralInputParameterEntry(reference, $context, input_parameters_context, input_parameter, onResolved, onError) {
    var entry = input_parameters_context[reference.entry];
    if (entry) {
        return entry;
    }
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
    if ($referencee === $referencer) {
        return true;
    }
    onError({
        message: 'Unexpected type!',
        path: $context.getPath(),
        actual: $referencer.getPath(),
        expected: $referencee.getPath()
    });
    reference.resolution_status = 'error';
    onResolved(true);
}
function checkStateConstraint(reference, state_context, state_group_property, expected_state, $context, onResolved, onError) {
    var actual_state = state_context.properties[state_group_property].state.name;
    if (actual_state === expected_state) {
        return true;
    }
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
function checkEntryContentStateStep(reference, state_context, state_group_property, expected_state, $context, onResolved, onError) {
    var actual_state = state_context.properties[state_group_property].state.name;
    if (actual_state === expected_state) {
        return true;
    }
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
function checkLocationConstraint(reference, location_context, expected_type, expected_type_path, $context, path_step, onResolved, onError) {
    if (location_context.location instanceof expected_type) {
        return true;
    }
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
function imp_resolveStateOutputParameter__has_initialization_data__initialization(data, param, onResolved, onError) {
    var $param_data = data.output_parameters__has_initialization_data__initialization[param];
    var $state_group = data.properties.has_initialization_data;
    switch (param) {
        default:
            onResolved(true);
    }
}
exports.imp_resolveStateOutputParameter__has_initialization_data__initialization = imp_resolveStateOutputParameter__has_initialization_data__initialization;
;
function imp_resolveStateContextValue__source__no__has_initialization_data(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["source"];
    if (switchResolutionStatus($state_context_value, data, 'source', onResolved, onError)) {
        interface_reply_resolver.imp_resolveStateContextValue__source__initialization(data.parent, function (err, $_scv_source) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, $_scv_source, 'initialization_data_requested', 'no', data, onResolved, onError)) {
                    setReference($state_context_value, $_scv_source.properties.initialization_data_requested.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__source__no__has_initialization_data = imp_resolveStateContextValue__source__no__has_initialization_data;
;
function imp_resolveStateContextValue__source__yes__has_initialization_data(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["source"];
    if (switchResolutionStatus($state_context_value, data, 'source', onResolved, onError)) {
        interface_reply_resolver.imp_resolveStateContextValue__source__initialization(data.parent, function (err, $_scv_source) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, $_scv_source, 'initialization_data_requested', 'yes', data, onResolved, onError)) {
                    setReference($state_context_value, $_scv_source.properties.initialization_data_requested.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__source__yes__has_initialization_data = imp_resolveStateContextValue__source__yes__has_initialization_data;
;
function imp_resolveStateOutputParameter__context_exists__yes__has_initialization_data(data, param, onResolved, onError) {
    var $param_data = data.output_parameters__context_exists__yes__has_initialization_data[param];
    var $state_group = data.properties.context_exists;
    switch (param) {
        default:
            onResolved(true);
    }
}
exports.imp_resolveStateOutputParameter__context_exists__yes__has_initialization_data = imp_resolveStateOutputParameter__context_exists__yes__has_initialization_data;
;
function imp_resolveStateOutputParameter__type__notification(data, param, onResolved, onError) {
    var $param_data = data.output_parameters__type__notification[param];
    var $state_group = data.properties.type;
    switch (param) {
        default:
            onResolved(true);
    }
}
exports.imp_resolveStateOutputParameter__type__notification = imp_resolveStateOutputParameter__type__notification;
;
function resolveComponentOutputParameter_delete_node(data, param, onResolved, onError) {
    var $param_context = data;
    var $param_data = data.output_parameters[param];
    switch (param) {
        default:
            onResolved(true);
    }
}
exports.resolveComponentOutputParameter_delete_node = resolveComponentOutputParameter_delete_node;
function resolveComponentOutputParameter_initialize_node(data, param, onResolved, onError) {
    var $param_context = data;
    var $param_data = data.output_parameters[param];
    switch (param) {
        default:
            onResolved(true);
    }
}
exports.resolveComponentOutputParameter_initialize_node = resolveComponentOutputParameter_initialize_node;
function imp_resolveStateOutputParameter__type__properties__initialize_node(data, param, onResolved, onError) {
    var $param_data = data.output_parameters__type__properties__initialize_node[param];
    var $state_group = data.properties.type;
    switch (param) {
        default:
            onResolved(true);
    }
}
exports.imp_resolveStateOutputParameter__type__properties__initialize_node = imp_resolveStateOutputParameter__type__properties__initialize_node;
;
function imp_resolveStateContextValue__collection__collection__type__properties__initialize_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["collection"];
    if (switchResolutionStatus($state_context_value, data, 'collection', onResolved, onError)) {
        interface_reply_resolver.imp_resolve_matrix_key__properties__initialize_node(data.parent, function (err, key) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, key, 'type', 'collection', data, onResolved, onError)) {
                    setReference($state_context_value, key.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__collection__collection__type__properties__initialize_node = imp_resolveStateContextValue__collection__collection__type__properties__initialize_node;
;
function imp_resolveStateContextValue__component__component__type__properties__initialize_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["component"];
    if (switchResolutionStatus($state_context_value, data, 'component', onResolved, onError)) {
        interface_reply_resolver.imp_resolve_matrix_key__properties__initialize_node(data.parent, function (err, key) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, key, 'type', 'component', data, onResolved, onError)) {
                    setReference($state_context_value, key.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__component__component__type__properties__initialize_node = imp_resolveStateContextValue__component__component__type__properties__initialize_node;
;
function imp_resolveStateContextValue__text__file__type__properties__initialize_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["text"];
    if (switchResolutionStatus($state_context_value, data, 'text', onResolved, onError)) {
        interface_reply_resolver.imp_resolve_matrix_key__properties__initialize_node(data.parent, function (err, key) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, key, 'type', 'file', data, onResolved, onError)) {
                    setReference($state_context_value, key.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__text__file__type__properties__initialize_node = imp_resolveStateContextValue__text__file__type__properties__initialize_node;
;
function imp_resolveStateContextValue__group__group__type__properties__initialize_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["group"];
    if (switchResolutionStatus($state_context_value, data, 'group', onResolved, onError)) {
        interface_reply_resolver.imp_resolve_matrix_key__properties__initialize_node(data.parent, function (err, key) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, key, 'type', 'group', data, onResolved, onError)) {
                    setReference($state_context_value, key.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__group__group__type__properties__initialize_node = imp_resolveStateContextValue__group__group__type__properties__initialize_node;
;
function imp_resolveStateContextValue__number__number__type__properties__initialize_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["number"];
    if (switchResolutionStatus($state_context_value, data, 'number', onResolved, onError)) {
        interface_reply_resolver.imp_resolve_matrix_key__properties__initialize_node(data.parent, function (err, key) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, key, 'type', 'number', data, onResolved, onError)) {
                    setReference($state_context_value, key.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__number__number__type__properties__initialize_node = imp_resolveStateContextValue__number__number__type__properties__initialize_node;
;
function imp_resolveStateContextValue__reference__reference__type__properties__initialize_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["reference"];
    if (switchResolutionStatus($state_context_value, data, 'reference', onResolved, onError)) {
        interface_reply_resolver.imp_resolve_matrix_key__properties__initialize_node(data.parent, function (err, key) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, key, 'type', 'reference', data, onResolved, onError)) {
                    setReference($state_context_value, key.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__reference__reference__type__properties__initialize_node = imp_resolveStateContextValue__reference__reference__type__properties__initialize_node;
;
function imp_resolveStateContextValue__state_group__state_group__type__properties__initialize_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["state group"];
    if (switchResolutionStatus($state_context_value, data, 'state group', onResolved, onError)) {
        interface_reply_resolver.imp_resolve_matrix_key__properties__initialize_node(data.parent, function (err, key) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, key, 'type', 'state group', data, onResolved, onError)) {
                    setReference($state_context_value, key.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__state_group__state_group__type__properties__initialize_node = imp_resolveStateContextValue__state_group__state_group__type__properties__initialize_node;
;
function imp_resolveStateContextValue__text__text__type__properties__initialize_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["text"];
    if (switchResolutionStatus($state_context_value, data, 'text', onResolved, onError)) {
        interface_reply_resolver.imp_resolve_matrix_key__properties__initialize_node(data.parent, function (err, key) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, key, 'type', 'text', data, onResolved, onError)) {
                    setReference($state_context_value, key.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__text__text__type__properties__initialize_node = imp_resolveStateContextValue__text__text__type__properties__initialize_node;
;
function imp_resolveStateOutputParameter__type__collection__type__properties__initialize_node(data, param, onResolved, onError) {
    var $param_data = data.output_parameters__type__collection__type__properties__initialize_node[param];
    var $state_group = data.properties.type;
    switch (param) {
        default:
            onResolved(true);
    }
}
exports.imp_resolveStateOutputParameter__type__collection__type__properties__initialize_node = imp_resolveStateOutputParameter__type__collection__type__properties__initialize_node;
;
function imp_resolveStateContextValue__dictionary__dictionary__type__collection__type__properties__initialize_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["dictionary"];
    if (switchResolutionStatus($state_context_value, data, 'dictionary', onResolved, onError)) {
        interface_reply_resolver.imp_resolveStateContextValue__collection__collection__type__properties__initialize_node(data.parent, function (err, $_scv_collection) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, $_scv_collection, 'type', 'dictionary', data, onResolved, onError)) {
                    setReference($state_context_value, $_scv_collection.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__dictionary__dictionary__type__collection__type__properties__initialize_node = imp_resolveStateContextValue__dictionary__dictionary__type__collection__type__properties__initialize_node;
;
function imp_resolveStateContextValue__matrix__matrix__type__collection__type__properties__initialize_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["matrix"];
    if (switchResolutionStatus($state_context_value, data, 'matrix', onResolved, onError)) {
        interface_reply_resolver.imp_resolveStateContextValue__collection__collection__type__properties__initialize_node(data.parent, function (err, $_scv_collection) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, $_scv_collection, 'type', 'matrix', data, onResolved, onError)) {
                    setReference($state_context_value, $_scv_collection.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__matrix__matrix__type__collection__type__properties__initialize_node = imp_resolveStateContextValue__matrix__matrix__type__collection__type__properties__initialize_node;
;
function imp_resolveStateOutputParameter__type__number__type__properties__initialize_node(data, param, onResolved, onError) {
    var $param_data = data.output_parameters__type__number__type__properties__initialize_node[param];
    var $state_group = data.properties.type;
    switch (param) {
        default:
            onResolved(true);
    }
}
exports.imp_resolveStateOutputParameter__type__number__type__properties__initialize_node = imp_resolveStateOutputParameter__type__number__type__properties__initialize_node;
;
function imp_resolveStateContextValue__integer_type__integer__type__number__type__properties__initialize_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["integer type"];
    if (switchResolutionStatus($state_context_value, data, 'integer type', onResolved, onError)) {
        interface_reply_resolver.imp_resolveStateContextValue__number__number__type__properties__initialize_node(data.parent, function (err, $_scv_number) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, $_scv_number, 'set', 'integer', data, onResolved, onError)) {
                    setReference($state_context_value, $_scv_number.properties.set.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__integer_type__integer__type__number__type__properties__initialize_node = imp_resolveStateContextValue__integer_type__integer__type__number__type__properties__initialize_node;
;
function imp_resolveStateContextValue__natural_type__natural__type__number__type__properties__initialize_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["natural type"];
    if (switchResolutionStatus($state_context_value, data, 'natural type', onResolved, onError)) {
        interface_reply_resolver.imp_resolveStateContextValue__number__number__type__properties__initialize_node(data.parent, function (err, $_scv_number) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, $_scv_number, 'set', 'natural', data, onResolved, onError)) {
                    setReference($state_context_value, $_scv_number.properties.set.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__natural_type__natural__type__number__type__properties__initialize_node = imp_resolveStateContextValue__natural_type__natural__type__number__type__properties__initialize_node;
;
function imp_resolve_reference__state__state_group__type__properties__initialize_node(data, onResolved, onError) {
    var $context = data;
    if (switchResolutionStatus(data.properties.state, data, 'TODO!', onResolved, onError)) {
        interface_reply_resolver.imp_resolveStateContextValue__state_group__state_group__type__properties__initialize_node($context, function (err, $_scv_state_group) {
            if (err) {
                data.properties.state.resolution_status = 'error';
                onResolved(true);
            }
            else {
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
exports.imp_resolve_reference__state__state_group__type__properties__initialize_node = imp_resolve_reference__state__state_group__type__properties__initialize_node;
function imp_resolve_matrix_key__properties__initialize_node(data, onResolved, onError) {
    var $context = data.parent;
    if (switchResolutionStatus(data.key, data, 'TODO!', onResolved, onError)) {
        $context.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
            if (err) {
                data.key.resolution_status = 'error';
                onResolved(true);
            }
            else {
                var entry;
                if (entry = checkCollectionEntry(data.key, $context, $_i_param_context_node, 'attributes', onResolved, onError)) {
                    if (checkEntryContentStateStep(data.key, entry, "type", "property", data, onResolved, onError)) {
                        var resolution_result = entry.properties.type.state.node;
                        setReferenceWithCounter(data.key, resolution_result);
                        onResolved(null, resolution_result);
                    }
                }
            }
        }, onError);
    }
}
exports.imp_resolve_matrix_key__properties__initialize_node = imp_resolve_matrix_key__properties__initialize_node;
function resolveComponentOutputParameter_update_node(data, param, onResolved, onError) {
    var $param_context = data;
    var $param_data = data.output_parameters[param];
    switch (param) {
        default:
            onResolved(true);
    }
}
exports.resolveComponentOutputParameter_update_node = resolveComponentOutputParameter_update_node;
function imp_resolveStateOutputParameter__type__properties__update_node(data, param, onResolved, onError) {
    var $param_data = data.output_parameters__type__properties__update_node[param];
    var $state_group = data.properties.type;
    switch (param) {
        default:
            onResolved(true);
    }
}
exports.imp_resolveStateOutputParameter__type__properties__update_node = imp_resolveStateOutputParameter__type__properties__update_node;
;
function imp_resolveStateContextValue__collection__collection__type__properties__update_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["collection"];
    if (switchResolutionStatus($state_context_value, data, 'collection', onResolved, onError)) {
        interface_reply_resolver.imp_resolve_matrix_key__properties__update_node(data.parent, function (err, key) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, key, 'type', 'collection', data, onResolved, onError)) {
                    setReference($state_context_value, key.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__collection__collection__type__properties__update_node = imp_resolveStateContextValue__collection__collection__type__properties__update_node;
;
function imp_resolveStateContextValue__component__component__type__properties__update_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["component"];
    if (switchResolutionStatus($state_context_value, data, 'component', onResolved, onError)) {
        interface_reply_resolver.imp_resolve_matrix_key__properties__update_node(data.parent, function (err, key) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, key, 'type', 'component', data, onResolved, onError)) {
                    setReference($state_context_value, key.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__component__component__type__properties__update_node = imp_resolveStateContextValue__component__component__type__properties__update_node;
;
function imp_resolveStateContextValue__file__file__type__properties__update_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["file"];
    if (switchResolutionStatus($state_context_value, data, 'file', onResolved, onError)) {
        interface_reply_resolver.imp_resolve_matrix_key__properties__update_node(data.parent, function (err, key) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, key, 'type', 'file', data, onResolved, onError)) {
                    setReference($state_context_value, key.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__file__file__type__properties__update_node = imp_resolveStateContextValue__file__file__type__properties__update_node;
;
function imp_resolveStateContextValue__group__group__type__properties__update_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["group"];
    if (switchResolutionStatus($state_context_value, data, 'group', onResolved, onError)) {
        interface_reply_resolver.imp_resolve_matrix_key__properties__update_node(data.parent, function (err, key) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, key, 'type', 'group', data, onResolved, onError)) {
                    setReference($state_context_value, key.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__group__group__type__properties__update_node = imp_resolveStateContextValue__group__group__type__properties__update_node;
;
function imp_resolveStateContextValue__number__number__type__properties__update_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["number"];
    if (switchResolutionStatus($state_context_value, data, 'number', onResolved, onError)) {
        interface_reply_resolver.imp_resolve_matrix_key__properties__update_node(data.parent, function (err, key) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, key, 'type', 'number', data, onResolved, onError)) {
                    setReference($state_context_value, key.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__number__number__type__properties__update_node = imp_resolveStateContextValue__number__number__type__properties__update_node;
;
function imp_resolveStateContextValue__reference__reference__type__properties__update_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["reference"];
    if (switchResolutionStatus($state_context_value, data, 'reference', onResolved, onError)) {
        interface_reply_resolver.imp_resolve_matrix_key__properties__update_node(data.parent, function (err, key) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, key, 'type', 'reference', data, onResolved, onError)) {
                    setReference($state_context_value, key.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__reference__reference__type__properties__update_node = imp_resolveStateContextValue__reference__reference__type__properties__update_node;
;
function imp_resolveStateContextValue__state_group__state_group__type__properties__update_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["state group"];
    if (switchResolutionStatus($state_context_value, data, 'state group', onResolved, onError)) {
        interface_reply_resolver.imp_resolve_matrix_key__properties__update_node(data.parent, function (err, key) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, key, 'type', 'state group', data, onResolved, onError)) {
                    setReference($state_context_value, key.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__state_group__state_group__type__properties__update_node = imp_resolveStateContextValue__state_group__state_group__type__properties__update_node;
;
function imp_resolveStateContextValue__text__text__type__properties__update_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["text"];
    if (switchResolutionStatus($state_context_value, data, 'text', onResolved, onError)) {
        interface_reply_resolver.imp_resolve_matrix_key__properties__update_node(data.parent, function (err, key) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, key, 'type', 'text', data, onResolved, onError)) {
                    setReference($state_context_value, key.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__text__text__type__properties__update_node = imp_resolveStateContextValue__text__text__type__properties__update_node;
;
function imp_resolveStateOutputParameter__type__collection__type__properties__update_node(data, param, onResolved, onError) {
    var $param_data = data.output_parameters__type__collection__type__properties__update_node[param];
    var $state_group = data.properties.type;
    switch (param) {
        default:
            onResolved(true);
    }
}
exports.imp_resolveStateOutputParameter__type__collection__type__properties__update_node = imp_resolveStateOutputParameter__type__collection__type__properties__update_node;
;
function imp_resolveStateContextValue__dictionary__dictionary__type__collection__type__properties__update_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["dictionary"];
    if (switchResolutionStatus($state_context_value, data, 'dictionary', onResolved, onError)) {
        interface_reply_resolver.imp_resolveStateContextValue__collection__collection__type__properties__update_node(data.parent, function (err, $_scv_collection) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, $_scv_collection, 'type', 'dictionary', data, onResolved, onError)) {
                    setReference($state_context_value, $_scv_collection.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__dictionary__dictionary__type__collection__type__properties__update_node = imp_resolveStateContextValue__dictionary__dictionary__type__collection__type__properties__update_node;
;
function imp_resolveStateContextValue__matrix__matrix__type__collection__type__properties__update_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["matrix"];
    if (switchResolutionStatus($state_context_value, data, 'matrix', onResolved, onError)) {
        interface_reply_resolver.imp_resolveStateContextValue__collection__collection__type__properties__update_node(data.parent, function (err, $_scv_collection) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, $_scv_collection, 'type', 'matrix', data, onResolved, onError)) {
                    setReference($state_context_value, $_scv_collection.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__matrix__matrix__type__collection__type__properties__update_node = imp_resolveStateContextValue__matrix__matrix__type__collection__type__properties__update_node;
;
function imp_resolveStateOutputParameter__type__entries__collection__type__properties__update_node(data, param, onResolved, onError) {
    var $param_data = data.output_parameters__type__entries__collection__type__properties__update_node[param];
    var $state_group = data.properties.type;
    switch (param) {
        default:
            onResolved(true);
    }
}
exports.imp_resolveStateOutputParameter__type__entries__collection__type__properties__update_node = imp_resolveStateOutputParameter__type__entries__collection__type__properties__update_node;
;
function imp_resolve_reference__old_id__rename(data, onResolved, onError) {
    var $context = data;
    if (switchResolutionStatus(data.properties.old_id, data, 'TODO!', onResolved, onError)) {
        var entry;
        if (entry = checkCollectionEntry(data.properties.old_id, $context, $context.parent.parent, 'entries', onResolved, onError)) {
            if (checkEntryContentStateStep(data.properties.old_id, entry, "type", "update", data, onResolved, onError)) {
                if (checkEntryContentStateStep(data.properties.old_id, entry.properties.type.state.node, "invalidate_referencer", "no", data, onResolved, onError)) {
                    var resolution_result = entry.properties.type.state.node.properties.invalidate_referencer.state.node;
                    setReferenceWithCounter(data.properties.old_id, resolution_result);
                    onResolved(null, resolution_result);
                }
            }
        }
    }
}
exports.imp_resolve_reference__old_id__rename = imp_resolve_reference__old_id__rename;
function imp_resolveStateOutputParameter__invalidate_referencer__update__type__entries(data, param, onResolved, onError) {
    var $param_data = data.output_parameters__invalidate_referencer__update__type__entries[param];
    var $state_group = data.properties.invalidate_referencer;
    switch (param) {
        default:
            onResolved(true);
    }
}
exports.imp_resolveStateOutputParameter__invalidate_referencer__update__type__entries = imp_resolveStateOutputParameter__invalidate_referencer__update__type__entries;
;
function imp_resolveStateContextValue__matrix__yes__invalidate_referencer(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["matrix"];
    if (switchResolutionStatus($state_context_value, data, 'matrix', onResolved, onError)) {
        if (checkStateConstraint($state_context_value, data.parent.parent.parent, 'type', 'matrix', data, onResolved, onError)) {
            setReference($state_context_value, data.parent.parent.parent.properties.type.state.node);
            onResolved(null, $state_context_value.referenced_node);
        }
    }
}
exports.imp_resolveStateContextValue__matrix__yes__invalidate_referencer = imp_resolveStateContextValue__matrix__yes__invalidate_referencer;
;
function imp_resolveStateOutputParameter__type__number__type__properties__update_node(data, param, onResolved, onError) {
    var $param_data = data.output_parameters__type__number__type__properties__update_node[param];
    var $state_group = data.properties.type;
    switch (param) {
        default:
            onResolved(true);
    }
}
exports.imp_resolveStateOutputParameter__type__number__type__properties__update_node = imp_resolveStateOutputParameter__type__number__type__properties__update_node;
;
function imp_resolveStateContextValue__integer_type__integer__type__number__type__properties__update_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["integer type"];
    if (switchResolutionStatus($state_context_value, data, 'integer type', onResolved, onError)) {
        interface_reply_resolver.imp_resolveStateContextValue__number__number__type__properties__update_node(data.parent, function (err, $_scv_number) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, $_scv_number, 'set', 'integer', data, onResolved, onError)) {
                    setReference($state_context_value, $_scv_number.properties.set.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__integer_type__integer__type__number__type__properties__update_node = imp_resolveStateContextValue__integer_type__integer__type__number__type__properties__update_node;
;
function imp_resolveStateContextValue__natural_type__natural__type__number__type__properties__update_node(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["natural type"];
    if (switchResolutionStatus($state_context_value, data, 'natural type', onResolved, onError)) {
        interface_reply_resolver.imp_resolveStateContextValue__number__number__type__properties__update_node(data.parent, function (err, $_scv_number) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, $_scv_number, 'set', 'natural', data, onResolved, onError)) {
                    setReference($state_context_value, $_scv_number.properties.set.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__natural_type__natural__type__number__type__properties__update_node = imp_resolveStateContextValue__natural_type__natural__type__number__type__properties__update_node;
;
function imp_resolve_reference__state__state_group__type__properties__update_node(data, onResolved, onError) {
    var $context = data;
    if (switchResolutionStatus(data.properties.state, data, 'TODO!', onResolved, onError)) {
        interface_reply_resolver.imp_resolveStateContextValue__state_group__state_group__type__properties__update_node($context, function (err, $_scv_state_group) {
            if (err) {
                data.properties.state.resolution_status = 'error';
                onResolved(true);
            }
            else {
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
exports.imp_resolve_reference__state__state_group__type__properties__update_node = imp_resolve_reference__state__state_group__type__properties__update_node;
function imp_resolveStateOutputParameter__type__state_group__type__properties__update_node(data, param, onResolved, onError) {
    var $param_data = data.output_parameters__type__state_group__type__properties__update_node[param];
    var $state_group = data.properties.type;
    switch (param) {
        default:
            onResolved(true);
    }
}
exports.imp_resolveStateOutputParameter__type__state_group__type__properties__update_node = imp_resolveStateOutputParameter__type__state_group__type__properties__update_node;
;
function imp_resolve_matrix_key__properties__update_node(data, onResolved, onError) {
    var $context = data.parent;
    if (switchResolutionStatus(data.key, data, 'TODO!', onResolved, onError)) {
        $context.imp_resolveInputParameter("context node", function (err, $_i_param_context_node) {
            if (err) {
                data.key.resolution_status = 'error';
                onResolved(true);
            }
            else {
                var entry;
                if (entry = checkCollectionEntry(data.key, $context, $_i_param_context_node, 'attributes', onResolved, onError)) {
                    if (checkEntryContentStateStep(data.key, entry, "type", "property", data, onResolved, onError)) {
                        var resolution_result = entry.properties.type.state.node;
                        setReferenceWithCounter(data.key, resolution_result);
                        onResolved(null, resolution_result);
                    }
                }
            }
        }, onError);
    }
}
exports.imp_resolve_matrix_key__properties__update_node = imp_resolve_matrix_key__properties__update_node;
function imp_resolveStateOutputParameter__type__interface_reply(data, param, onResolved, onError) {
    var $param_data = data.output_parameters__type__interface_reply[param];
    var $state_group = data.properties.type;
    switch (param) {
        default:
            onResolved(true);
    }
}
exports.imp_resolveStateOutputParameter__type__interface_reply = imp_resolveStateOutputParameter__type__interface_reply;
;
function imp_resolveStateContextValue__source__initialization(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["source"];
    if (switchResolutionStatus($state_context_value, data, 'source', onResolved, onError)) {
        data.parent.imp_resolveGlobalInputParameter("request", function (err, $_i_param_request) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, $_i_param_request, 'type', 'subscribe', data, onResolved, onError)) {
                    setReference($state_context_value, $_i_param_request.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__source__initialization = imp_resolveStateContextValue__source__initialization;
;
function imp_resolveStateContextValue__source__notification(data, onResolved, onError) {
    var $state_context_value = data.state_context_values["source"];
    if (switchResolutionStatus($state_context_value, data, 'source', onResolved, onError)) {
        data.parent.imp_resolveGlobalInputParameter("request", function (err, $_i_param_request) {
            if (err) {
                $state_context_value.resolution_status = 'error';
                onResolved(true);
            }
            else {
                if (checkStateConstraint($state_context_value, $_i_param_request, 'type', 'subscribe', data, onResolved, onError)) {
                    setReference($state_context_value, $_i_param_request.properties.type.state.node);
                    onResolved(null, $state_context_value.referenced_node);
                }
            }
        }, onError);
    }
}
exports.imp_resolveStateContextValue__source__notification = imp_resolveStateContextValue__source__notification;
;
