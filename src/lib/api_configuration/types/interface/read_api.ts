import * as interface from "./read_api";
import * as resolver from "./reference_resolver";
import * as id from './identifier';
export type collection_type<T> = {[key:string]:T};
export class AlanNode<T> {
	properties:T;
	removed:boolean;
	reference_count:number = 0;
	imp_resolveGlobalInputParameter;
	constructor () {
		(<any>this).properties = {};
	}
	isRemoved ():boolean {
		return this.removed === true;
	}
}
export interface Reference<T> {
	entry:string;
	():T
}
export interface ExternalReference<T> {
	library:string;
	type:string
	():T
}
export class DictionaryNode<PT, T> extends AlanNode<T> {
	parent: PT;
	getParent (): PT {
		return this.parent;
	}
	getCollectionParent (): PT {
		return this.parent;
	}
	key: string;
	getKey () {
		return this.key;
	}
	getDictionaryKey () {
		return this.key;
	}
}
export class MatrixNode<PT, KT, T> extends AlanNode<T> {
	parent: PT;
	getParent (): PT {
		return this.parent;
	}
	getCollectionParent (): PT {
		return this.parent;
	}
	key: { referenced_node: KT; resolution_status:"resolving"|"error"|"resolved"|"unresolved"|"decoupled"; entry:string; };
	getKey (): KT {
		return this.key.referenced_node
	}
	getMatrixKey (): KT {
		return this.key.referenced_node;
	}
}
export class StateNode<PT, T> extends AlanNode<T> {
	parent: PT;
	getParent () {
		return this.parent;
	}
	getStateParent () {
		return this.parent;
	}
}
export class GroupNode<PT, T> extends AlanNode<T> { 
	parent: PT;
	getParent () {
		return this.parent;
	}
	getGroupParent () {
		return this.parent;
	}
}
export class Collection<T extends AlanNode<{}>> {
	protected entries:{[key:string]:T} = {};
	private parent;
	private collection_name:string
	constructor (parent, collection_name:string, entries:{[key:string]:T}) {
		this.parent = parent;
		this.collection_name = collection_name;
		this.entries = entries
	}
	walk(walkFunc: ($?:T) => void) {
		var k;
		for (k in this.entries) {
			walkFunc(this.entries[k]);
		}
	}
	toList<TL>(sortFunc, mapFunc: ($?:T) => TL): TL[] {
		var mapped_array = [];
		var k;
		for (k in this.entries) {
			mapped_array.push(this.entries[k]);
		}
		return mapped_array.sort(sortFunc).map(mapFunc);
	}
	getEntry(key:string): T {
		var entry;
		if ((entry = this.entries[key]) === undefined) { throw new Error('Entry ' + key + ' does not exist in collection "' + this.collection_name + '" in ' + this.parent.getPath() + '.'); }
		return entry;
	}
	switchOnEntryExists<RT>(key:string, onExists: (($?: T) => RT) | RT, onNotExists: (() => RT) | RT): RT {
		var entry = this.entries[key];
		if (entry === undefined) {
			if (typeof onNotExists === 'function') {
				return (<() => RT>onNotExists)();
			} else {
				return <RT>onNotExists;
			}
		} else {
			if (typeof onExists === 'function') {
				return (<($?: T) => RT>onExists)(this.entries[key]);
			} else {
				return <RT>onExists;
			}
		}
	}
}
export class Matrix<T extends AlanNode<{}>> extends Collection<T> {
	constructor (parent, collection_name:string, entries:{[key:string]:T}) {
		super(parent, collection_name, entries);
	}
	mapToDictionary<RT>(mapFunc: ($?: T) => RT | RT): collection_type<RT> {
		var mapped_object:collection_type<RT> = {};
		var k;
		for (k in this.entries) {
			mapped_object[k] = mapFunc(this.entries[k]);
		}
		return mapped_object;
	}
}
export class Dictionary<T extends AlanNode<{}>> extends Collection<T> {
	constructor (parent, collection_name:string, entries:{[key:string]:T}) {
		super(parent, collection_name, entries);
	}
	map<RT>(mapFunc: ($?: T) => RT | RT): collection_type<RT> {
		var mapped_object:collection_type<RT> = {};
		var k;
		for (k in this.entries) {
			mapped_object[k] = mapFunc(this.entries[k]);
		}
		return mapped_object;
	}
}
export class StateGroup<T extends {name:keyof K, node:AlanNode<{}>}, K extends {[key:string]:AlanNode<{}>}> {
	state:T;
	constructor (s:T) {
		this.state = s;
	}
	switch<TS> (cases:{[key in keyof K]:(($?:K[key]) => TS) | TS}):TS {
		let handler = cases[this.state.name];
		if (typeof handler === "function") {
			return handler(this.state.node);
		} else {
			return handler as TS;
		}
	}

	cast<S extends keyof K>(state:S):K[S] {
		return this.state.node;
	}
}
export interface Tree<T> {
	types: {[name:string]:T};
	substrees: {[name:string]:Tree<T>};}
export class Cinterface extends AlanNode<{
	component_types: Dictionary<Ccomponent_types>;
	context_keys: Dictionary<Ccontext_keys>;
	numerical_types: Dictionary<Cnumerical_types>;
	root: Cnode;
}> {
	imp_resolveInputParameter;
	key?:string
	getPath ():string {
		return '';
	}
	type_path:string = "'interface'";
}
export class Ccomponent_types extends DictionaryNode<Cinterface, {
	node: Cnode;
}> {
	getPath ():string {
		return this.parent.getPath() + ".'component types'[" + id.serializeIdentifier(this.key) + "]";
	}
	type_path:string = "'interface'.'component types'";
}
export class Ccontext_keys extends DictionaryNode<Cinterface, {
}> {
	getPath ():string {
		return this.parent.getPath() + ".'context keys'[" + id.serializeIdentifier(this.key) + "]";
	}
	type_path:string = "'interface'.'context keys'";
}
export class Cnumerical_types extends DictionaryNode<Cinterface, {
	has_factor: StateGroup<
		{ name: "no", node: Cno__has_factor}
		|{ name: "yes", node: Cyes__has_factor}
		, {"no": Cno__has_factor,"yes": Cyes__has_factor}>,
}> {
	getPath ():string {
		return this.parent.getPath() + ".'numerical types'[" + id.serializeIdentifier(this.key) + "]";
	}
	type_path:string = "'interface'.'numerical types'";
	output_parameters__has_factor__numerical_types;
}
export class Cno__has_factor extends StateNode<Cnumerical_types, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'has factor'*'no'";
	}
	state_context_values;
	type_path:string = "'interface'.'numerical types'?'has factor'*'no'";
}
export class Cyes__has_factor extends StateNode<Cnumerical_types, {
	base: number;
	exponent: number;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'has factor'*'yes'";
	}
	state_context_values;
	type_path:string = "'interface'.'numerical types'?'has factor'*'yes'";
}
export class Cancestor_parameters_selection extends AlanNode<{
	has_steps: StateGroup<
		{ name: "no", node: Cno__has_steps__ancestor_parameters_selection}
		|{ name: "yes", node: Cyes__has_steps__ancestor_parameters_selection}
		, {"no": Cno__has_steps__ancestor_parameters_selection,"yes": Cyes__has_steps__ancestor_parameters_selection}>,
}> {
	location;
	getPath ():string {
		return this.location.getPath() + '\'' + this.property_component_name + '\'';
	}
	imp_resolveInputParameter;
	property_component_name;
	switchOnLocation <T>(cases:{
		"'interface'!'ancestor parameters selection'?'has steps'*'yes':'tail'":($?:Cyes__has_steps__ancestor_parameters_selection) => T;
		"'interface'!'command parameter referencer'?'context type'*'command parameter':'ancestor selection'":($?:Ccommand_parameter) => T;
	}):T {
		var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
		if (typeof current_case === 'function') {
			return current_case(this.location);
		} else {
			return current_case;
		}
	}
	castToLocation__interface___ancestor_parameters_selection___has_steps___yes___tail_():Cyes__has_steps__ancestor_parameters_selection{
		return this.location;
	}
	castToLocation__interface___command_parameter_referencer___context_type___command_parameter___ancestor_selection_():Ccommand_parameter{
		return this.location;
	}
	getInputParameter_context_parameters (): interface.Ccommand_parameters {
		var param_res;
		this.imp_resolveInputParameter("context parameters", function (err, paramval) {
			if (err) {
				throw "Unexpected resolution error for input parameter!";
			} else {
				param_res = paramval;
			}
		}, function () { throw new Error('Input parameter could not be resolved'); });
		return param_res;
	}
	output_parameters;
	getOutputParameter_result_parameters (): interface.Ccommand_parameters {
		return this.output_parameters["result parameters"].referenced_node;
	}
	type_path:string = "'interface'!'ancestor parameters selection'";
	output_parameters__has_steps__ancestor_parameters_selection;
	get_has_stepsOutputParameter_result_parameters ():interface.Ccommand_parameters {
		return this.output_parameters__has_steps__ancestor_parameters_selection["result parameters"].referenced_node;
	}
}
export class Cno__has_steps__ancestor_parameters_selection extends StateNode<Cancestor_parameters_selection, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'has steps'*'no'";
	}
	state_context_values;
	type_path:string = "'interface'!'ancestor parameters selection'?'has steps'*'no'";
}
export class Cyes__has_steps__ancestor_parameters_selection extends StateNode<Cancestor_parameters_selection, {
	tail: Cancestor_parameters_selection;
	type: StateGroup<
		{ name: "matrix parent", node: Cmatrix_parent}
		|{ name: "state parent", node: Cstate_parent__type__yes__has_steps__ancestor_parameters_selection}
		, {"matrix parent": Cmatrix_parent,"state parent": Cstate_parent__type__yes__has_steps__ancestor_parameters_selection}>,
}> {
	getPath ():string {
		return this.parent.getPath() + "?'has steps'*'yes'";
	}
	state_context_values;
	type_path:string = "'interface'!'ancestor parameters selection'?'has steps'*'yes'";
	output_parameters__type__yes__has_steps__ancestor_parameters_selection;
	get_typeOutputParameter_result_parameters ():interface.Ccommand_parameters {
		return this.output_parameters__type__yes__has_steps__ancestor_parameters_selection["result parameters"].referenced_node;
	}
}
export class Cmatrix_parent extends StateNode<Cyes__has_steps__ancestor_parameters_selection, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'matrix parent'";
	}
	state_context_values;
	getConstrainingContextValue_matrix ():interface.Cmatrix__type__properties {
		return this.state_context_values["matrix"].referenced_node;
	}
	type_path:string = "'interface'!'ancestor parameters selection'?'has steps'*'yes'?'type'*'matrix parent'";
}
export class Cstate_parent__type__yes__has_steps__ancestor_parameters_selection extends StateNode<Cyes__has_steps__ancestor_parameters_selection, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'state parent'";
	}
	state_context_values;
	getConstrainingContextValue_state ():interface.Cstates__state_group__type__properties {
		return this.state_context_values["state"].referenced_node;
	}
	type_path:string = "'interface'!'ancestor parameters selection'?'has steps'*'yes'?'type'*'state parent'";
}
export class Ccommand_parameter_referencer extends AlanNode<{
	collection: Reference<interface.Ccollection__type__property>;
	context_type: StateGroup<
		{ name: "command parameter", node: Ccommand_parameter}
		|{ name: "context node", node: Ccontext_node}
		, {"command parameter": Ccommand_parameter,"context node": Ccontext_node}>,
	head: Cnode_selection_path;
	tail: Cnode_content_path;
}> {
	location;
	getPath ():string {
		return this.location.getPath() + '\'' + this.property_component_name + '\'';
	}
	imp_resolveInputParameter;
	property_component_name;
	switchOnLocation <T>(cases:{
		"'interface'!'command parameters'.'properties'?'type'*'matrix':'referencer'":($?:Cmatrix__type__properties) => T;
		"'interface'!'command parameters'.'properties'?'type'*'reference':'referencer'":($?:Creference__type__properties) => T;
	}):T {
		var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
		if (typeof current_case === 'function') {
			return current_case(this.location);
		} else {
			return current_case;
		}
	}
	castToLocation__interface___command_parameters___properties___type___matrix___referencer_():Cmatrix__type__properties{
		return this.location;
	}
	castToLocation__interface___command_parameters___properties___type___reference___referencer_():Creference__type__properties{
		return this.location;
	}
	getInputParameter_context_node (): interface.Cnode {
		var param_res;
		this.imp_resolveInputParameter("context node", function (err, paramval) {
			if (err) {
				throw "Unexpected resolution error for input parameter!";
			} else {
				param_res = paramval;
			}
		}, function () { throw new Error('Input parameter could not be resolved'); });
		return param_res;
	}
	getInputParameter_parameter (): interface.Cproperties {
		var param_res;
		this.imp_resolveInputParameter("parameter", function (err, paramval) {
			if (err) {
				throw "Unexpected resolution error for input parameter!";
			} else {
				param_res = paramval;
			}
		}, function () { throw new Error('Input parameter could not be resolved'); });
		return param_res;
	}
	output_parameters;
	getOutputParameter_referenced_node (): interface.Cnode {
		return this.output_parameters["referenced node"].referenced_node;
	}
	type_path:string = "'interface'!'command parameter referencer'";
	output_parameters__context_type__command_parameter_referencer;
	get_context_typeOutputParameter_result_node ():interface.Cnode {
		return this.output_parameters__context_type__command_parameter_referencer["result node"].referenced_node;
	}
}
export class Ccommand_parameter extends StateNode<Ccommand_parameter_referencer, {
	ancestor_selection: Cancestor_parameters_selection;
	type: StateGroup<
		{ name: "key", node: Ckey}
		|{ name: "reference", node: Creference__type__command_parameter}
		, {"key": Ckey,"reference": Creference__type__command_parameter}>,
}> {
	getPath ():string {
		return this.parent.getPath() + "?'context type'*'command parameter'";
	}
	state_context_values;
	type_path:string = "'interface'!'command parameter referencer'?'context type'*'command parameter'";
	output_parameters__type__command_parameter;
	get_typeOutputParameter_result_node ():interface.Cnode {
		return this.output_parameters__type__command_parameter["result node"].referenced_node;
	}
}
export class Ckey extends StateNode<Ccommand_parameter, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'key'";
	}
	state_context_values;
	getConstrainingContextValue_matrix ():interface.Cmatrix__type__properties {
		return this.state_context_values["matrix"].referenced_node;
	}
	type_path:string = "'interface'!'command parameter referencer'?'context type'*'command parameter'?'type'*'key'";
}
export class Creference__type__command_parameter extends StateNode<Ccommand_parameter, {
	reference: Reference<interface.Creference__type__properties>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'reference'";
	}
	state_context_values;
	type_path:string = "'interface'!'command parameter referencer'?'context type'*'command parameter'?'type'*'reference'";
}
export class Ccontext_node extends StateNode<Ccommand_parameter_referencer, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'context type'*'context node'";
	}
	state_context_values;
	type_path:string = "'interface'!'command parameter referencer'?'context type'*'context node'";
}
export class Ccommand_parameters extends AlanNode<{
	properties: Dictionary<Cproperties>;
}> {
	location;
	getPath ():string {
		return this.location.getPath() + '\'' + this.property_component_name + '\'';
	}
	imp_resolveInputParameter;
	property_component_name;
	switchOnLocation <T>(cases:{
		"'interface'!'command parameters'.'properties'?'type'*'matrix':'parameters'":($?:Cmatrix__type__properties) => T;
		"'interface'!'command parameters'.'properties'?'type'*'state group'.'states':'parameters'":($?:Cstates__state_group__type__properties) => T;
		"'interface'!'node'.'attributes'?'type'*'command':'parameters'":($?:Ccommand) => T;
	}):T {
		var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
		if (typeof current_case === 'function') {
			return current_case(this.location);
		} else {
			return current_case;
		}
	}
	castToLocation__interface___command_parameters___properties___type___matrix___parameters_():Cmatrix__type__properties{
		return this.location;
	}
	castToLocation__interface___command_parameters___properties___type___state_group___states___parameters_():Cstates__state_group__type__properties{
		return this.location;
	}
	castToLocation__interface___node___attributes___type___command___parameters_():Ccommand{
		return this.location;
	}
	getInputParameter_context_node (): interface.Cnode {
		var param_res;
		this.imp_resolveInputParameter("context node", function (err, paramval) {
			if (err) {
				throw "Unexpected resolution error for input parameter!";
			} else {
				param_res = paramval;
			}
		}, function () { throw new Error('Input parameter could not be resolved'); });
		return param_res;
	}
	getInputParameter_interface (): interface.Cinterface {
		var param_res;
		this.imp_resolveInputParameter("interface", function (err, paramval) {
			if (err) {
				throw "Unexpected resolution error for input parameter!";
			} else {
				param_res = paramval;
			}
		}, function () { throw new Error('Input parameter could not be resolved'); });
		return param_res;
	}
	output_parameters;
	type_path:string = "'interface'!'command parameters'";
}
export class Cproperties extends DictionaryNode<Ccommand_parameters, {
	type: StateGroup<
		{ name: "file", node: Cfile__type__properties}
		|{ name: "matrix", node: Cmatrix__type__properties}
		|{ name: "number", node: Cnumber__type__properties}
		|{ name: "reference", node: Creference__type__properties}
		|{ name: "state group", node: Cstate_group__type__properties}
		|{ name: "text", node: Ctext__type__properties}
		, {"file": Cfile__type__properties,"matrix": Cmatrix__type__properties,"number": Cnumber__type__properties,"reference": Creference__type__properties,"state group": Cstate_group__type__properties,"text": Ctext__type__properties}>,
}> {
	getPath ():string {
		return this.parent.getPath() + ".'properties'[" + id.serializeIdentifier(this.key) + "]";
	}
	type_path:string = "'interface'!'command parameters'.'properties'";
	output_parameters__type__properties;
}
export class Cfile__type__properties extends StateNode<Cproperties, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'file'";
	}
	state_context_values;
	type_path:string = "'interface'!'command parameters'.'properties'?'type'*'file'";
}
export class Cmatrix__type__properties extends StateNode<Cproperties, {
	parameters: Ccommand_parameters;
	referencer: Ccommand_parameter_referencer;
	type: StateGroup<
		{ name: "dense", node: Cdense}
		|{ name: "sparse", node: Csparse}
		, {"dense": Cdense,"sparse": Csparse}>,
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'matrix'";
	}
	state_context_values;
	type_path:string = "'interface'!'command parameters'.'properties'?'type'*'matrix'";
	output_parameters__type__matrix__type__properties;
}
export class Cdense extends StateNode<Cmatrix__type__properties, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'dense'";
	}
	state_context_values;
	type_path:string = "'interface'!'command parameters'.'properties'?'type'*'matrix'?'type'*'dense'";
}
export class Csparse extends StateNode<Cmatrix__type__properties, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'sparse'";
	}
	state_context_values;
	type_path:string = "'interface'!'command parameters'.'properties'?'type'*'matrix'?'type'*'sparse'";
}
export class Cnumber__type__properties extends StateNode<Cproperties, {
	numerical_type: Reference<interface.Cnumerical_types>;
	set: StateGroup<
		{ name: "integer", node: Cinteger__set__number__type__properties}
		|{ name: "natural", node: Cnatural__set__number__type__properties}
		, {"integer": Cinteger__set__number__type__properties,"natural": Cnatural__set__number__type__properties}>,
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'number'";
	}
	state_context_values;
	type_path:string = "'interface'!'command parameters'.'properties'?'type'*'number'";
	output_parameters__set__number__type__properties;
}
export class Cinteger__set__number__type__properties extends StateNode<Cnumber__type__properties, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'set'*'integer'";
	}
	state_context_values;
	type_path:string = "'interface'!'command parameters'.'properties'?'type'*'number'?'set'*'integer'";
}
export class Cnatural__set__number__type__properties extends StateNode<Cnumber__type__properties, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'set'*'natural'";
	}
	state_context_values;
	type_path:string = "'interface'!'command parameters'.'properties'?'type'*'number'?'set'*'natural'";
}
export class Creference__type__properties extends StateNode<Cproperties, {
	referencer: Ccommand_parameter_referencer;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'reference'";
	}
	state_context_values;
	type_path:string = "'interface'!'command parameters'.'properties'?'type'*'reference'";
}
export class Cstate_group__type__properties extends StateNode<Cproperties, {
	states: Dictionary<Cstates__state_group__type__properties>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'state group'";
	}
	state_context_values;
	type_path:string = "'interface'!'command parameters'.'properties'?'type'*'state group'";
}
export class Cstates__state_group__type__properties extends DictionaryNode<Cstate_group__type__properties, {
	parameters: Ccommand_parameters;
}> {
	getPath ():string {
		return this.parent.getPath() + ".'states'[" + id.serializeIdentifier(this.key) + "]";
	}
	type_path:string = "'interface'!'command parameters'.'properties'?'type'*'state group'.'states'";
}
export class Ctext__type__properties extends StateNode<Cproperties, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'text'";
	}
	state_context_values;
	type_path:string = "'interface'!'command parameters'.'properties'?'type'*'text'";
}
export class Cnode extends AlanNode<{
	attributes: Dictionary<Cattributes>;
}> {
	location;
	getPath ():string {
		return this.location.getPath() + '\'' + this.property_component_name + '\'';
	}
	imp_resolveInputParameter;
	property_component_name;
	switchOnLocation <T>(cases:{
		"'interface'.'component types':'node'":($?:Ccomponent_types) => T;
		"'interface':'root'":($?:Cinterface) => T;
		"'interface'!'node'.'attributes'?'type'*'property'?'type'*'collection':'node'":($?:Ccollection__type__property) => T;
		"'interface'!'node'.'attributes'?'type'*'property'?'type'*'group':'node'":($?:Cgroup__type__property) => T;
		"'interface'!'node'.'attributes'?'type'*'property'?'type'*'state group'.'states':'node'":($?:Cstates__state_group__type__property) => T;
	}):T {
		var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
		if (typeof current_case === 'function') {
			return current_case(this.location);
		} else {
			return current_case;
		}
	}
	castToLocation__interface___component_types___node_():Ccomponent_types{
		return this.location;
	}
	castToLocation__interface___root_():Cinterface{
		return this.location;
	}
	castToLocation__interface___node___attributes___type___property___type___collection___node_():Ccollection__type__property{
		return this.location;
	}
	castToLocation__interface___node___attributes___type___property___type___group___node_():Cgroup__type__property{
		return this.location;
	}
	castToLocation__interface___node___attributes___type___property___type___state_group___states___node_():Cstates__state_group__type__property{
		return this.location;
	}
	getInputParameter_interface (): interface.Cinterface {
		var param_res;
		this.imp_resolveInputParameter("interface", function (err, paramval) {
			if (err) {
				throw "Unexpected resolution error for input parameter!";
			} else {
				param_res = paramval;
			}
		}, function () { throw new Error('Input parameter could not be resolved'); });
		return param_res;
	}
	output_parameters;
	type_path:string = "'interface'!'node'";
}
export class Cattributes extends DictionaryNode<Cnode, {
	type: StateGroup<
		{ name: "command", node: Ccommand}
		|{ name: "property", node: Cproperty}
		, {"command": Ccommand,"property": Cproperty}>,
}> {
	getPath ():string {
		return this.parent.getPath() + ".'attributes'[" + id.serializeIdentifier(this.key) + "]";
	}
	type_path:string = "'interface'!'node'.'attributes'";
	output_parameters__type__attributes;
}
export class Ccommand extends StateNode<Cattributes, {
	parameters: Ccommand_parameters;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'command'";
	}
	state_context_values;
	type_path:string = "'interface'!'node'.'attributes'?'type'*'command'";
}
export class Cproperty extends StateNode<Cattributes, {
	type: StateGroup<
		{ name: "collection", node: Ccollection__type__property}
		|{ name: "component", node: Ccomponent}
		|{ name: "file", node: Cfile__type__property}
		|{ name: "group", node: Cgroup__type__property}
		|{ name: "number", node: Cnumber__type__property}
		|{ name: "reference", node: Creference__type__property}
		|{ name: "state group", node: Cstate_group__type__property}
		|{ name: "text", node: Ctext__type__property}
		, {"collection": Ccollection__type__property,"component": Ccomponent,"file": Cfile__type__property,"group": Cgroup__type__property,"number": Cnumber__type__property,"reference": Creference__type__property,"state group": Cstate_group__type__property,"text": Ctext__type__property}>,
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'property'";
	}
	state_context_values;
	type_path:string = "'interface'!'node'.'attributes'?'type'*'property'";
	output_parameters__type__property;
}
export class Ccollection__type__property extends StateNode<Cproperty, {
	node: Cnode;
	type: StateGroup<
		{ name: "dictionary", node: Cdictionary}
		|{ name: "matrix", node: Cmatrix__type__collection}
		, {"dictionary": Cdictionary,"matrix": Cmatrix__type__collection}>,
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'collection'";
	}
	state_context_values;
	type_path:string = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'collection'";
	output_parameters__type__collection__type__property;
}
export class Cdictionary extends StateNode<Ccollection__type__property, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'dictionary'";
	}
	state_context_values;
	type_path:string = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'collection'?'type'*'dictionary'";
}
export class Cmatrix__type__collection extends StateNode<Ccollection__type__property, {
	referencer: Creferencer;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'matrix'";
	}
	state_context_values;
	type_path:string = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'collection'?'type'*'matrix'";
}
export class Ccomponent extends StateNode<Cproperty, {
	type: Reference<interface.Ccomponent_types>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'component'";
	}
	state_context_values;
	type_path:string = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'component'";
}
export class Cfile__type__property extends StateNode<Cproperty, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'file'";
	}
	state_context_values;
	type_path:string = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'file'";
}
export class Cgroup__type__property extends StateNode<Cproperty, {
	node: Cnode;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'group'";
	}
	state_context_values;
	type_path:string = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'group'";
}
export class Cnumber__type__property extends StateNode<Cproperty, {
	set: StateGroup<
		{ name: "integer", node: Cinteger__set__number__type__property}
		|{ name: "natural", node: Cnatural__set__number__type__property}
		, {"integer": Cinteger__set__number__type__property,"natural": Cnatural__set__number__type__property}>,
	type: Reference<interface.Cnumerical_types>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'number'";
	}
	state_context_values;
	type_path:string = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'number'";
	output_parameters__set__number__type__property;
}
export class Cinteger__set__number__type__property extends StateNode<Cnumber__type__property, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'set'*'integer'";
	}
	state_context_values;
	type_path:string = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'number'?'set'*'integer'";
}
export class Cnatural__set__number__type__property extends StateNode<Cnumber__type__property, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'set'*'natural'";
	}
	state_context_values;
	type_path:string = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'number'?'set'*'natural'";
}
export class Creference__type__property extends StateNode<Cproperty, {
	referencer: Creferencer;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'reference'";
	}
	state_context_values;
	type_path:string = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'reference'";
}
export class Cstate_group__type__property extends StateNode<Cproperty, {
	output_parameters: Dictionary<Coutput_parameters>;
	states: Dictionary<Cstates__state_group__type__property>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'state group'";
	}
	state_context_values;
	type_path:string = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'state group'";
}
export class Coutput_parameters extends DictionaryNode<Cstate_group__type__property, {
	node_selection: Cnode_type_path;
}> {
	getPath ():string {
		return this.parent.getPath() + ".'output parameters'[" + id.serializeIdentifier(this.key) + "]";
	}
	type_path:string = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'state group'.'output parameters'";
}
export class Cstates__state_group__type__property extends DictionaryNode<Cstate_group__type__property, {
	node: Cnode;
	output_arguments: Matrix<Coutput_arguments>;
}> {
	getPath ():string {
		return this.parent.getPath() + ".'states'[" + id.serializeIdentifier(this.key) + "]";
	}
	type_path:string = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'state group'.'states'";
}
export class Coutput_arguments extends MatrixNode<Cstates__state_group__type__property, interface.Coutput_parameters, {
	path: Cnode_selection_path;
}> {
	getPath ():string {
		return this.parent.getPath() + ".'output arguments'[" + id.serializeIdentifier(this.key.entry) + "]";
	}
	type_path:string = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'state group'.'states'.'output arguments'";
}
export class Ctext__type__property extends StateNode<Cproperty, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'text'";
	}
	state_context_values;
	type_path:string = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'text'";
}
export class Cnode_content_path extends AlanNode<{
	has_steps: StateGroup<
		{ name: "no", node: Cno__has_steps__node_content_path}
		|{ name: "yes", node: Cyes__has_steps__node_content_path}
		, {"no": Cno__has_steps__node_content_path,"yes": Cyes__has_steps__node_content_path}>,
}> {
	location;
	getPath ():string {
		return this.location.getPath() + '\'' + this.property_component_name + '\'';
	}
	imp_resolveInputParameter;
	property_component_name;
	switchOnLocation <T>(cases:{
		"'interface'!'command parameter referencer':'tail'":($?:Ccommand_parameter_referencer) => T;
		"'interface'!'node content path'?'has steps'*'yes':'tail'":($?:Cyes__has_steps__node_content_path) => T;
		"'interface'!'referencer':'tail'":($?:Creferencer) => T;
	}):T {
		var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
		if (typeof current_case === 'function') {
			return current_case(this.location);
		} else {
			return current_case;
		}
	}
	castToLocation__interface___command_parameter_referencer___tail_():Ccommand_parameter_referencer{
		return this.location;
	}
	castToLocation__interface___node_content_path___has_steps___yes___tail_():Cyes__has_steps__node_content_path{
		return this.location;
	}
	castToLocation__interface___referencer___tail_():Creferencer{
		return this.location;
	}
	getInputParameter_context_node (): interface.Cnode {
		var param_res;
		this.imp_resolveInputParameter("context node", function (err, paramval) {
			if (err) {
				throw "Unexpected resolution error for input parameter!";
			} else {
				param_res = paramval;
			}
		}, function () { throw new Error('Input parameter could not be resolved'); });
		return param_res;
	}
	output_parameters;
	getOutputParameter_result_interface_node (): interface.Cnode {
		return this.output_parameters["result interface node"].referenced_node;
	}
	type_path:string = "'interface'!'node content path'";
	output_parameters__has_steps__node_content_path;
	get_has_stepsOutputParameter_result_interface_node ():interface.Cnode {
		return this.output_parameters__has_steps__node_content_path["result interface node"].referenced_node;
	}
}
export class Cno__has_steps__node_content_path extends StateNode<Cnode_content_path, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'has steps'*'no'";
	}
	state_context_values;
	type_path:string = "'interface'!'node content path'?'has steps'*'no'";
}
export class Cyes__has_steps__node_content_path extends StateNode<Cnode_content_path, {
	tail: Cnode_content_path;
	type: StateGroup<
		{ name: "group", node: Cgroup__type__yes__has_steps__node_content_path}
		|{ name: "state", node: Cstate__type__yes__has_steps__node_content_path}
		, {"group": Cgroup__type__yes__has_steps__node_content_path,"state": Cstate__type__yes__has_steps__node_content_path}>,
}> {
	getPath ():string {
		return this.parent.getPath() + "?'has steps'*'yes'";
	}
	state_context_values;
	type_path:string = "'interface'!'node content path'?'has steps'*'yes'";
	output_parameters__type__yes__has_steps__node_content_path;
	get_typeOutputParameter_result_interface_node ():interface.Cnode {
		return this.output_parameters__type__yes__has_steps__node_content_path["result interface node"].referenced_node;
	}
}
export class Cgroup__type__yes__has_steps__node_content_path extends StateNode<Cyes__has_steps__node_content_path, {
	group: Reference<interface.Cgroup__type__property>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'group'";
	}
	state_context_values;
	type_path:string = "'interface'!'node content path'?'has steps'*'yes'?'type'*'group'";
}
export class Cstate__type__yes__has_steps__node_content_path extends StateNode<Cyes__has_steps__node_content_path, {
	state: Reference<interface.Cstates__state_group__type__property>;
	state_group: Reference<interface.Cstate_group__type__property>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'state'";
	}
	state_context_values;
	type_path:string = "'interface'!'node content path'?'has steps'*'yes'?'type'*'state'";
}
export class Cnode_selection_path extends AlanNode<{
	has_steps: StateGroup<
		{ name: "no", node: Cno__has_steps__node_selection_path}
		|{ name: "yes", node: Cyes__has_steps__node_selection_path}
		, {"no": Cno__has_steps__node_selection_path,"yes": Cyes__has_steps__node_selection_path}>,
}> {
	location;
	getPath ():string {
		return this.location.getPath() + '\'' + this.property_component_name + '\'';
	}
	imp_resolveInputParameter;
	property_component_name;
	switchOnLocation <T>(cases:{
		"'interface'!'command parameter referencer':'head'":($?:Ccommand_parameter_referencer) => T;
		"'interface'!'node'.'attributes'?'type'*'property'?'type'*'state group'.'states'.'output arguments':'path'":($?:Coutput_arguments) => T;
		"'interface'!'node selection path'?'has steps'*'yes':'tail'":($?:Cyes__has_steps__node_selection_path) => T;
		"'interface'!'referencer':'head'":($?:Creferencer) => T;
	}):T {
		var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
		if (typeof current_case === 'function') {
			return current_case(this.location);
		} else {
			return current_case;
		}
	}
	castToLocation__interface___command_parameter_referencer___head_():Ccommand_parameter_referencer{
		return this.location;
	}
	castToLocation__interface___node___attributes___type___property___type___state_group___states___output_arguments___path_():Coutput_arguments{
		return this.location;
	}
	castToLocation__interface___node_selection_path___has_steps___yes___tail_():Cyes__has_steps__node_selection_path{
		return this.location;
	}
	castToLocation__interface___referencer___head_():Creferencer{
		return this.location;
	}
	getInputParameter_context_node (): interface.Cnode {
		var param_res;
		this.imp_resolveInputParameter("context node", function (err, paramval) {
			if (err) {
				throw "Unexpected resolution error for input parameter!";
			} else {
				param_res = paramval;
			}
		}, function () { throw new Error('Input parameter could not be resolved'); });
		return param_res;
	}
	output_parameters;
	getOutputParameter_result_interface_node (): interface.Cnode {
		return this.output_parameters["result interface node"].referenced_node;
	}
	type_path:string = "'interface'!'node selection path'";
	output_parameters__has_steps__node_selection_path;
	get_has_stepsOutputParameter_result_interface_node ():interface.Cnode {
		return this.output_parameters__has_steps__node_selection_path["result interface node"].referenced_node;
	}
}
export class Cno__has_steps__node_selection_path extends StateNode<Cnode_selection_path, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'has steps'*'no'";
	}
	state_context_values;
	type_path:string = "'interface'!'node selection path'?'has steps'*'no'";
}
export class Cyes__has_steps__node_selection_path extends StateNode<Cnode_selection_path, {
	tail: Cnode_selection_path;
	type: StateGroup<
		{ name: "collection parent", node: Ccollection_parent}
		|{ name: "group", node: Cgroup__type__yes__has_steps__node_selection_path}
		|{ name: "group parent", node: Cgroup_parent}
		|{ name: "matrix key", node: Cmatrix_key}
		|{ name: "reference", node: Creference__type__yes}
		|{ name: "state group output parameter", node: Cstate_group_output_parameter}
		|{ name: "state parent", node: Cstate_parent__type__yes__has_steps__node_selection_path}
		, {"collection parent": Ccollection_parent,"group": Cgroup__type__yes__has_steps__node_selection_path,"group parent": Cgroup_parent,"matrix key": Cmatrix_key,"reference": Creference__type__yes,"state group output parameter": Cstate_group_output_parameter,"state parent": Cstate_parent__type__yes__has_steps__node_selection_path}>,
}> {
	getPath ():string {
		return this.parent.getPath() + "?'has steps'*'yes'";
	}
	state_context_values;
	type_path:string = "'interface'!'node selection path'?'has steps'*'yes'";
	output_parameters__type__yes__has_steps__node_selection_path;
	get_typeOutputParameter_result_interface_node ():interface.Cnode {
		return this.output_parameters__type__yes__has_steps__node_selection_path["result interface node"].referenced_node;
	}
}
export class Ccollection_parent extends StateNode<Cyes__has_steps__node_selection_path, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'collection parent'";
	}
	state_context_values;
	getConstrainingContextValue_collection ():interface.Ccollection__type__property {
		return this.state_context_values["collection"].referenced_node;
	}
	type_path:string = "'interface'!'node selection path'?'has steps'*'yes'?'type'*'collection parent'";
}
export class Cgroup__type__yes__has_steps__node_selection_path extends StateNode<Cyes__has_steps__node_selection_path, {
	group: Reference<interface.Cgroup__type__property>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'group'";
	}
	state_context_values;
	type_path:string = "'interface'!'node selection path'?'has steps'*'yes'?'type'*'group'";
}
export class Cgroup_parent extends StateNode<Cyes__has_steps__node_selection_path, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'group parent'";
	}
	state_context_values;
	getConstrainingContextValue_group ():interface.Cgroup__type__property {
		return this.state_context_values["group"].referenced_node;
	}
	type_path:string = "'interface'!'node selection path'?'has steps'*'yes'?'type'*'group parent'";
}
export class Cmatrix_key extends StateNode<Cyes__has_steps__node_selection_path, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'matrix key'";
	}
	state_context_values;
	getConstrainingContextValue_matrix ():interface.Cmatrix__type__collection {
		return this.state_context_values["matrix"].referenced_node;
	}
	type_path:string = "'interface'!'node selection path'?'has steps'*'yes'?'type'*'matrix key'";
}
export class Creference__type__yes extends StateNode<Cyes__has_steps__node_selection_path, {
	reference: Reference<interface.Creference__type__property>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'reference'";
	}
	state_context_values;
	type_path:string = "'interface'!'node selection path'?'has steps'*'yes'?'type'*'reference'";
}
export class Cstate_group_output_parameter extends StateNode<Cyes__has_steps__node_selection_path, {
	output_parameter: Reference<interface.Coutput_parameters>;
	state_group: Reference<interface.Cstate_group__type__property>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'state group output parameter'";
	}
	state_context_values;
	type_path:string = "'interface'!'node selection path'?'has steps'*'yes'?'type'*'state group output parameter'";
}
export class Cstate_parent__type__yes__has_steps__node_selection_path extends StateNode<Cyes__has_steps__node_selection_path, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'state parent'";
	}
	state_context_values;
	getConstrainingContextValue_state ():interface.Cstates__state_group__type__property {
		return this.state_context_values["state"].referenced_node;
	}
	type_path:string = "'interface'!'node selection path'?'has steps'*'yes'?'type'*'state parent'";
}
export class Cnode_type_path extends AlanNode<{
	root_type: StateGroup<
		{ name: "component type", node: Ccomponent_type}
		|{ name: "root", node: Croot}
		, {"component type": Ccomponent_type,"root": Croot}>,
	steps: Cnode_type_path_step;
}> {
	location;
	getPath ():string {
		return this.location.getPath() + '\'' + this.property_component_name + '\'';
	}
	imp_resolveInputParameter;
	property_component_name;
	switchOnLocation <T>(cases:{
		"'interface'!'node'.'attributes'?'type'*'property'?'type'*'state group'.'output parameters':'node selection'":($?:Coutput_parameters) => T;
	}):T {
		var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
		if (typeof current_case === 'function') {
			return current_case(this.location);
		} else {
			return current_case;
		}
	}
	castToLocation__interface___node___attributes___type___property___type___state_group___output_parameters___node_selection_():Coutput_parameters{
		return this.location;
	}
	getInputParameter_interface (): interface.Cinterface {
		var param_res;
		this.imp_resolveInputParameter("interface", function (err, paramval) {
			if (err) {
				throw "Unexpected resolution error for input parameter!";
			} else {
				param_res = paramval;
			}
		}, function () { throw new Error('Input parameter could not be resolved'); });
		return param_res;
	}
	output_parameters;
	getOutputParameter_result_interface_node (): interface.Cnode {
		return this.output_parameters["result interface node"].referenced_node;
	}
	type_path:string = "'interface'!'node type path'";
	output_parameters__root_type__node_type_path;
	get_root_typeOutputParameter_root_type_interface_node ():interface.Cnode {
		return this.output_parameters__root_type__node_type_path["root type interface node"].referenced_node;
	}
}
export class Ccomponent_type extends StateNode<Cnode_type_path, {
	component_type: Reference<interface.Ccomponent_types>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'root type'*'component type'";
	}
	state_context_values;
	type_path:string = "'interface'!'node type path'?'root type'*'component type'";
}
export class Croot extends StateNode<Cnode_type_path, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'root type'*'root'";
	}
	state_context_values;
	type_path:string = "'interface'!'node type path'?'root type'*'root'";
}
export class Cnode_type_path_step extends AlanNode<{
	has_steps: StateGroup<
		{ name: "no", node: Cno__has_steps__node_type_path_step}
		|{ name: "yes", node: Cyes__has_steps__node_type_path_step}
		, {"no": Cno__has_steps__node_type_path_step,"yes": Cyes__has_steps__node_type_path_step}>,
}> {
	location;
	getPath ():string {
		return this.location.getPath() + '\'' + this.property_component_name + '\'';
	}
	imp_resolveInputParameter;
	property_component_name;
	switchOnLocation <T>(cases:{
		"'interface'!'node type path':'steps'":($?:Cnode_type_path) => T;
		"'interface'!'node type path step'?'has steps'*'yes':'tail'":($?:Cyes__has_steps__node_type_path_step) => T;
	}):T {
		var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
		if (typeof current_case === 'function') {
			return current_case(this.location);
		} else {
			return current_case;
		}
	}
	castToLocation__interface___node_type_path___steps_():Cnode_type_path{
		return this.location;
	}
	castToLocation__interface___node_type_path_step___has_steps___yes___tail_():Cyes__has_steps__node_type_path_step{
		return this.location;
	}
	getInputParameter_context_node (): interface.Cnode {
		var param_res;
		this.imp_resolveInputParameter("context node", function (err, paramval) {
			if (err) {
				throw "Unexpected resolution error for input parameter!";
			} else {
				param_res = paramval;
			}
		}, function () { throw new Error('Input parameter could not be resolved'); });
		return param_res;
	}
	output_parameters;
	getOutputParameter_result_interface_node (): interface.Cnode {
		return this.output_parameters["result interface node"].referenced_node;
	}
	type_path:string = "'interface'!'node type path step'";
	output_parameters__has_steps__node_type_path_step;
	get_has_stepsOutputParameter_result_interface_node ():interface.Cnode {
		return this.output_parameters__has_steps__node_type_path_step["result interface node"].referenced_node;
	}
}
export class Cno__has_steps__node_type_path_step extends StateNode<Cnode_type_path_step, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'has steps'*'no'";
	}
	state_context_values;
	type_path:string = "'interface'!'node type path step'?'has steps'*'no'";
}
export class Cyes__has_steps__node_type_path_step extends StateNode<Cnode_type_path_step, {
	tail: Cnode_type_path_step;
	type: StateGroup<
		{ name: "collection", node: Ccollection__type__yes}
		|{ name: "group", node: Cgroup__type__yes__has_steps__node_type_path_step}
		|{ name: "state", node: Cstate__type__yes__has_steps__node_type_path_step}
		, {"collection": Ccollection__type__yes,"group": Cgroup__type__yes__has_steps__node_type_path_step,"state": Cstate__type__yes__has_steps__node_type_path_step}>,
}> {
	getPath ():string {
		return this.parent.getPath() + "?'has steps'*'yes'";
	}
	state_context_values;
	type_path:string = "'interface'!'node type path step'?'has steps'*'yes'";
	output_parameters__type__yes__has_steps__node_type_path_step;
	get_typeOutputParameter_result_interface_node ():interface.Cnode {
		return this.output_parameters__type__yes__has_steps__node_type_path_step["result interface node"].referenced_node;
	}
}
export class Ccollection__type__yes extends StateNode<Cyes__has_steps__node_type_path_step, {
	collection: Reference<interface.Ccollection__type__property>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'collection'";
	}
	state_context_values;
	type_path:string = "'interface'!'node type path step'?'has steps'*'yes'?'type'*'collection'";
}
export class Cgroup__type__yes__has_steps__node_type_path_step extends StateNode<Cyes__has_steps__node_type_path_step, {
	group: Reference<interface.Cgroup__type__property>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'group'";
	}
	state_context_values;
	type_path:string = "'interface'!'node type path step'?'has steps'*'yes'?'type'*'group'";
}
export class Cstate__type__yes__has_steps__node_type_path_step extends StateNode<Cyes__has_steps__node_type_path_step, {
	state: Reference<interface.Cstates__state_group__type__property>;
	state_group: Reference<interface.Cstate_group__type__property>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'state'";
	}
	state_context_values;
	type_path:string = "'interface'!'node type path step'?'has steps'*'yes'?'type'*'state'";
}
export class Creferencer extends AlanNode<{
	collection: Reference<interface.Ccollection__type__property>;
	head: Cnode_selection_path;
	tail: Cnode_content_path;
}> {
	location;
	getPath ():string {
		return this.location.getPath() + '\'' + this.property_component_name + '\'';
	}
	imp_resolveInputParameter;
	property_component_name;
	switchOnLocation <T>(cases:{
		"'interface'!'node'.'attributes'?'type'*'property'?'type'*'collection'?'type'*'matrix':'referencer'":($?:Cmatrix__type__collection) => T;
		"'interface'!'node'.'attributes'?'type'*'property'?'type'*'reference':'referencer'":($?:Creference__type__property) => T;
	}):T {
		var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
		if (typeof current_case === 'function') {
			return current_case(this.location);
		} else {
			return current_case;
		}
	}
	castToLocation__interface___node___attributes___type___property___type___collection___type___matrix___referencer_():Cmatrix__type__collection{
		return this.location;
	}
	castToLocation__interface___node___attributes___type___property___type___reference___referencer_():Creference__type__property{
		return this.location;
	}
	getInputParameter_context_node (): interface.Cnode {
		var param_res;
		this.imp_resolveInputParameter("context node", function (err, paramval) {
			if (err) {
				throw "Unexpected resolution error for input parameter!";
			} else {
				param_res = paramval;
			}
		}, function () { throw new Error('Input parameter could not be resolved'); });
		return param_res;
	}
	output_parameters;
	getOutputParameter_referenced_interface_node (): interface.Cnode {
		return this.output_parameters["referenced interface node"].referenced_node;
	}
	type_path:string = "'interface'!'referencer'";
}
