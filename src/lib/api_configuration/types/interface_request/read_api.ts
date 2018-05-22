import * as interface_request from "./read_api";
import * as resolver from "./reference_resolver";
import * as interface from "../interface/read_api";
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
export class Cinterface_request extends AlanNode<{
	type: StateGroup<
		{ name: "command execution", node: Ccommand_execution}
		|{ name: "subscribe", node: Csubscribe}
		|{ name: "unsubscribe", node: Cunsubscribe}
		, {"command execution": Ccommand_execution,"subscribe": Csubscribe,"unsubscribe": Cunsubscribe}>,
}> {
	imp_resolveInputParameter;
	key?:string
	getInputParameter_interface ():interface.Cinterface{
		var param_res;
		this.imp_resolveGlobalInputParameter("interface", function (err, paramval) {
			if (err) {
				throw "Unexpected resolution error for input parameter!";
			} else {
				param_res = paramval;
			}
		}, function () { throw new Error('Input parameter could not be resolved'); });
		return param_res;
	}
	getPath ():string {
		return '';
	}
	type_path:string = "'interface_request'";
	output_parameters__type__interface_request;
}
export class Ccommand_execution extends StateNode<Cinterface_request, {
	arguments: Ccommand_arguments;
	command: Reference<interface.Ccommand>;
	context_keys: Ccontext_keys__interface_request;
	context_node: Cid_path;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'command execution'";
	}
	state_context_values;
	type_path:string = "'interface_request'?'type'*'command execution'";
}
export class Csubscribe extends StateNode<Cinterface_request, {
	context_keys: Ccontext_keys__interface_request;
	initialization_data_requested: StateGroup<
		{ name: "no", node: Cno__initialization_data_requested}
		|{ name: "yes", node: Cyes__initialization_data_requested}
		, {"no": Cno__initialization_data_requested,"yes": Cyes__initialization_data_requested}>,
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'subscribe'";
	}
	state_context_values;
	type_path:string = "'interface_request'?'type'*'subscribe'";
	output_parameters__initialization_data_requested__subscribe;
}
export class Cno__initialization_data_requested extends StateNode<Csubscribe, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'initialization data requested'*'no'";
	}
	state_context_values;
	type_path:string = "'interface_request'?'type'*'subscribe'?'initialization data requested'*'no'";
}
export class Cyes__initialization_data_requested extends StateNode<Csubscribe, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'initialization data requested'*'yes'";
	}
	state_context_values;
	type_path:string = "'interface_request'?'type'*'subscribe'?'initialization data requested'*'yes'";
}
export class Cunsubscribe extends StateNode<Cinterface_request, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'unsubscribe'";
	}
	state_context_values;
	type_path:string = "'interface_request'?'type'*'unsubscribe'";
}
export class Ccommand_arguments extends AlanNode<{
	properties: Matrix<Cproperties>;
}> {
	location;
	getPath ():string {
		return this.location.getPath() + '\'' + this.property_component_name + '\'';
	}
	imp_resolveInputParameter;
	property_component_name;
	switchOnLocation <T>(cases:{
		"'interface_request'?'type'*'command execution':'arguments'":($?:Ccommand_execution) => T;
		"'interface_request'!'command arguments'.'properties'?'type'*'matrix'.'entries':'arguments'":($?:Centries) => T;
		"'interface_request'!'command arguments'.'properties'?'type'*'state group':'arguments'":($?:Cstate_group) => T;
	}):T {
		var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
		if (typeof current_case === 'function') {
			return current_case(this.location);
		} else {
			return current_case;
		}
	}
	castToLocation__interface_request___type___command_execution___arguments_():Ccommand_execution{
		return this.location;
	}
	castToLocation__interface_request___command_arguments___properties___type___matrix___entries___arguments_():Centries{
		return this.location;
	}
	castToLocation__interface_request___command_arguments___properties___type___state_group___arguments_():Cstate_group{
		return this.location;
	}
	getInputParameter_command_parameters (): interface.Ccommand_parameters {
		var param_res;
		this.imp_resolveInputParameter("command parameters", function (err, paramval) {
			if (err) {
				throw "Unexpected resolution error for input parameter!";
			} else {
				param_res = paramval;
			}
		}, function () { throw new Error('Input parameter could not be resolved'); });
		return param_res;
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
	type_path:string = "'interface_request'!'command arguments'";
}
export class Cproperties extends MatrixNode<Ccommand_arguments, interface.Cproperties, {
	type: StateGroup<
		{ name: "file", node: Cfile}
		|{ name: "matrix", node: Cmatrix}
		|{ name: "number", node: Cnumber}
		|{ name: "reference", node: Creference}
		|{ name: "state group", node: Cstate_group}
		|{ name: "text", node: Ctext}
		, {"file": Cfile,"matrix": Cmatrix,"number": Cnumber,"reference": Creference,"state group": Cstate_group,"text": Ctext}>,
}> {
	getPath ():string {
		return this.parent.getPath() + ".'properties'[" + id.serializeIdentifier(this.key.entry) + "]";
	}
	type_path:string = "'interface_request'!'command arguments'.'properties'";
	output_parameters__type__properties;
}
export class Cfile extends StateNode<Cproperties, {
	extension: string;
	token: string;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'file'";
	}
	state_context_values;
	getConstrainingContextValue_file ():interface.Cfile__type__properties {
		return this.state_context_values["file"].referenced_node;
	}
	type_path:string = "'interface_request'!'command arguments'.'properties'?'type'*'file'";
}
export class Cmatrix extends StateNode<Cproperties, {
	entries: Dictionary<Centries>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'matrix'";
	}
	state_context_values;
	getConstrainingContextValue_matrix ():interface.Cmatrix__type__properties {
		return this.state_context_values["matrix"].referenced_node;
	}
	type_path:string = "'interface_request'!'command arguments'.'properties'?'type'*'matrix'";
}
export class Centries extends DictionaryNode<Cmatrix, {
	arguments: Ccommand_arguments;
}> {
	getPath ():string {
		return this.parent.getPath() + ".'entries'[" + id.serializeIdentifier(this.key) + "]";
	}
	type_path:string = "'interface_request'!'command arguments'.'properties'?'type'*'matrix'.'entries'";
}
export class Cnumber extends StateNode<Cproperties, {
	number: number;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'number'";
	}
	state_context_values;
	getConstrainingContextValue_number ():interface.Cnumber__type__properties {
		return this.state_context_values["number"].referenced_node;
	}
	type_path:string = "'interface_request'!'command arguments'.'properties'?'type'*'number'";
}
export class Creference extends StateNode<Cproperties, {
	entry: string;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'reference'";
	}
	state_context_values;
	getConstrainingContextValue_reference ():interface.Creference__type__properties {
		return this.state_context_values["reference"].referenced_node;
	}
	type_path:string = "'interface_request'!'command arguments'.'properties'?'type'*'reference'";
}
export class Cstate_group extends StateNode<Cproperties, {
	arguments: Ccommand_arguments;
	state: Reference<interface.Cstates__state_group__type__properties>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'state group'";
	}
	state_context_values;
	getConstrainingContextValue_state_group ():interface.Cstate_group__type__properties {
		return this.state_context_values["state group"].referenced_node;
	}
	type_path:string = "'interface_request'!'command arguments'.'properties'?'type'*'state group'";
}
export class Ctext extends StateNode<Cproperties, {
	text: string;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'text'";
	}
	state_context_values;
	getConstrainingContextValue_text ():interface.Ctext__type__properties {
		return this.state_context_values["text"].referenced_node;
	}
	type_path:string = "'interface_request'!'command arguments'.'properties'?'type'*'text'";
}
export class Ccontext_keys__interface_request extends AlanNode<{
	context_keys: Matrix<Ccontext_keys__context_keys>;
}> {
	location;
	getPath ():string {
		return this.location.getPath() + '\'' + this.property_component_name + '\'';
	}
	imp_resolveInputParameter;
	property_component_name;
	switchOnLocation <T>(cases:{
		"'interface_request'?'type'*'command execution':'context keys'":($?:Ccommand_execution) => T;
		"'interface_request'?'type'*'subscribe':'context keys'":($?:Csubscribe) => T;
	}):T {
		var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
		if (typeof current_case === 'function') {
			return current_case(this.location);
		} else {
			return current_case;
		}
	}
	castToLocation__interface_request___type___command_execution___context_keys_():Ccommand_execution{
		return this.location;
	}
	castToLocation__interface_request___type___subscribe___context_keys_():Csubscribe{
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
	type_path:string = "'interface_request'!'context keys'";
}
export class Ccontext_keys__context_keys extends MatrixNode<Ccontext_keys__interface_request, interface.Ccontext_keys, {
	value: string;
}> {
	getPath ():string {
		return this.parent.getPath() + ".'context keys'[" + id.serializeIdentifier(this.key.entry) + "]";
	}
	type_path:string = "'interface_request'!'context keys'.'context keys'";
}
export class Cid_path extends AlanNode<{
	has_steps: StateGroup<
		{ name: "no", node: Cno__has_steps}
		|{ name: "yes", node: Cyes__has_steps}
		, {"no": Cno__has_steps,"yes": Cyes__has_steps}>,
}> {
	location;
	getPath ():string {
		return this.location.getPath() + '\'' + this.property_component_name + '\'';
	}
	imp_resolveInputParameter;
	property_component_name;
	switchOnLocation <T>(cases:{
		"'interface_request'?'type'*'command execution':'context node'":($?:Ccommand_execution) => T;
		"'interface_request'!'id path'?'has steps'*'yes':'tail'":($?:Cyes__has_steps) => T;
	}):T {
		var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
		if (typeof current_case === 'function') {
			return current_case(this.location);
		} else {
			return current_case;
		}
	}
	castToLocation__interface_request___type___command_execution___context_node_():Ccommand_execution{
		return this.location;
	}
	castToLocation__interface_request___id_path___has_steps___yes___tail_():Cyes__has_steps{
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
	getOutputParameter_result_node (): interface.Cnode {
		return this.output_parameters["result node"].referenced_node;
	}
	type_path:string = "'interface_request'!'id path'";
	output_parameters__has_steps__id_path;
	get_has_stepsOutputParameter_result_node ():interface.Cnode {
		return this.output_parameters__has_steps__id_path["result node"].referenced_node;
	}
}
export class Cno__has_steps extends StateNode<Cid_path, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'has steps'*'no'";
	}
	state_context_values;
	type_path:string = "'interface_request'!'id path'?'has steps'*'no'";
}
export class Cyes__has_steps extends StateNode<Cid_path, {
	tail: Cid_path;
	type: StateGroup<
		{ name: "collection entry", node: Ccollection_entry}
		|{ name: "component", node: Ccomponent}
		|{ name: "group", node: Cgroup}
		|{ name: "state", node: Cstate}
		, {"collection entry": Ccollection_entry,"component": Ccomponent,"group": Cgroup,"state": Cstate}>,
}> {
	getPath ():string {
		return this.parent.getPath() + "?'has steps'*'yes'";
	}
	state_context_values;
	type_path:string = "'interface_request'!'id path'?'has steps'*'yes'";
	output_parameters__type__yes__has_steps;
	get_typeOutputParameter_result_node ():interface.Cnode {
		return this.output_parameters__type__yes__has_steps["result node"].referenced_node;
	}
}
export class Ccollection_entry extends StateNode<Cyes__has_steps, {
	collection: Reference<interface.Ccollection__type__property>;
	id: string;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'collection entry'";
	}
	state_context_values;
	type_path:string = "'interface_request'!'id path'?'has steps'*'yes'?'type'*'collection entry'";
}
export class Ccomponent extends StateNode<Cyes__has_steps, {
	component: Reference<interface.Ccomponent>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'component'";
	}
	state_context_values;
	type_path:string = "'interface_request'!'id path'?'has steps'*'yes'?'type'*'component'";
}
export class Cgroup extends StateNode<Cyes__has_steps, {
	group: Reference<interface.Cgroup__type__property>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'group'";
	}
	state_context_values;
	type_path:string = "'interface_request'!'id path'?'has steps'*'yes'?'type'*'group'";
}
export class Cstate extends StateNode<Cyes__has_steps, {
	state: Reference<interface.Cstates__state_group__type__property>;
	state_group: Reference<interface.Cstate_group__type__property>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'state'";
	}
	state_context_values;
	type_path:string = "'interface_request'!'id path'?'has steps'*'yes'?'type'*'state'";
}
