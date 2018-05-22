import * as manifest from "./read_api";
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
export class Cmanifest extends AlanNode<{
	fingerprint: string;
	language_fingerprint: string;
	root: Cinode;
}> {
	imp_resolveInputParameter;
	key?:string
	getPath ():string {
		return '';
	}
	type_path:string = "'manifest'";
}
export class Cinode extends AlanNode<{
	type: StateGroup<
		{ name: "directory", node: Cdirectory}
		|{ name: "file", node: Cfile}
		|{ name: "library", node: Clibrary}
		, {"directory": Cdirectory,"file": Cfile,"library": Clibrary}>,
}> {
	location;
	getPath ():string {
		return this.location.getPath() + '\'' + this.property_component_name + '\'';
	}
	imp_resolveInputParameter;
	property_component_name;
	switchOnLocation <T>(cases:{
		"'manifest':'root'":($?:Cmanifest) => T;
		"'manifest'!'inode'?'type'*'directory'.'children':'inode'":($?:Cchildren) => T;
		"'manifest'!'inode'?'type'*'library':'inode'":($?:Clibrary) => T;
	}):T {
		var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
		if (typeof current_case === 'function') {
			return current_case(this.location);
		} else {
			return current_case;
		}
	}
	castToLocation__manifest___root_():Cmanifest{
		return this.location;
	}
	castToLocation__manifest___inode___type___directory___children___inode_():Cchildren{
		return this.location;
	}
	castToLocation__manifest___inode___type___library___inode_():Clibrary{
		return this.location;
	}
	output_parameters;
	type_path:string = "'manifest'!'inode'";
	output_parameters__type__inode;
}
export class Cdirectory extends StateNode<Cinode, {
	children: Dictionary<Cchildren>;
	ordered: StateGroup<
		{ name: "no", node: Cno__ordered__directory}
		|{ name: "yes", node: Cyes__ordered__directory}
		, {"no": Cno__ordered__directory,"yes": Cyes__ordered__directory}>,
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'directory'";
	}
	state_context_values;
	type_path:string = "'manifest'!'inode'?'type'*'directory'";
	output_parameters__ordered__directory;
}
export class Cchildren extends DictionaryNode<Cdirectory, {
	inode: Cinode;
	ordered: StateGroup<
		{ name: "no", node: Cno__ordered__children}
		|{ name: "yes", node: Cyes__ordered__children}
		, {"no": Cno__ordered__children,"yes": Cyes__ordered__children}>,
}> {
	getPath ():string {
		return this.parent.getPath() + ".'children'[" + id.serializeIdentifier(this.key) + "]";
	}
	type_path:string = "'manifest'!'inode'?'type'*'directory'.'children'";
	output_parameters__ordered__children;
}
export class Cno__ordered__children extends StateNode<Cchildren, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'ordered'*'no'";
	}
	state_context_values;
	type_path:string = "'manifest'!'inode'?'type'*'directory'.'children'?'ordered'*'no'";
}
export class Cyes__ordered__children extends StateNode<Cchildren, {
	next: Reference<manifest.Cchildren>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'ordered'*'yes'";
	}
	state_context_values;
	type_path:string = "'manifest'!'inode'?'type'*'directory'.'children'?'ordered'*'yes'";
}
export class Cno__ordered__directory extends StateNode<Cdirectory, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'ordered'*'no'";
	}
	state_context_values;
	type_path:string = "'manifest'!'inode'?'type'*'directory'?'ordered'*'no'";
}
export class Cyes__ordered__directory extends StateNode<Cdirectory, {
	first: Reference<manifest.Cchildren>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'ordered'*'yes'";
	}
	state_context_values;
	type_path:string = "'manifest'!'inode'?'type'*'directory'?'ordered'*'yes'";
}
export class Cfile extends StateNode<Cinode, {
	hash: string;
	suffix: string;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'file'";
	}
	state_context_values;
	type_path:string = "'manifest'!'inode'?'type'*'file'";
}
export class Clibrary extends StateNode<Cinode, {
	inode: Cinode;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'library'";
	}
	state_context_values;
	type_path:string = "'manifest'!'inode'?'type'*'library'";
}
