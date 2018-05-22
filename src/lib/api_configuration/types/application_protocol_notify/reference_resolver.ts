import * as application_protocol_notify_resolver from "./reference_resolver";
import * as application_protocol_notify from "./read_api";
function switchResolutionStatus(reference_property, context, key, onResolved, onError) {
	let must_resolve = false;
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
			if (!reference_property.referenced_node) throw new Error('Implementation error!');
			onResolved(null, reference_property.referenced_node);
			break;
		case 'unresolved':
			reference_property.resolution_status = 'resolving';
			must_resolve = true;
			break;
	}
	return must_resolve;
}
function checkCollectionEntry(reference, $context, entry_context, entry_collection:string, onResolved, onError) {
	var entry = entry_context.properties[entry_collection].entries[reference.entry];
	if (entry) { return entry; }
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
function checkPluralInputParameterEntry(reference,  $context, input_parameters_context, input_parameter:string, onResolved, onError) {
	var entry = input_parameters_context[reference.entry]; 
	if (entry) { return entry; }
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
	if ($referencee === $referencer) { return true; }
	onError({
		message: 'Unexpected type!',
		path: $context.getPath(),
		actual: $referencer.getPath(),
		expected: $referencee.getPath()
	});
	reference.resolution_status = 'error';
	onResolved(true);
}
function checkStateConstraint(reference, state_context, state_group_property:string, expected_state:string, $context, onResolved, onError) {
	let actual_state = state_context.properties[state_group_property].state.name;
	if (actual_state === expected_state) { return true; }
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
function checkEntryContentStateStep(reference, state_context, state_group_property:string, expected_state:string, $context, onResolved, onError) {
	let actual_state = state_context.properties[state_group_property].state.name;
	if (actual_state === expected_state) { return true; }
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
function checkLocationConstraint(reference, location_context, expected_type, expected_type_path:string, $context, path_step:string, onResolved, onError) {
	if (location_context.location instanceof expected_type) { return true; }
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
