import * as manifest from './alan_api';

function isFunction<T>(p:T): p is T & Function {
	return (typeof p === 'function');
}
function assert(predicate:boolean) {
	if (predicate === false) throw new Error(`Assertion error`);
}
function resolve<T>(context:T) {
	return {
		then: <RT>(callback: (context: T) => RT) => resolve(callback(context)),
		result: context
	};
}
export type dictionary_type<T> = {[key:string]:T};


enum ResolutionStatus {
	Resolved,
	Resolving,
	Unresolved,
	Detached,
}
function cache<T extends AlanObject>(callback:(detach:boolean) => T) {
	let cached_value:T;
	let status:ResolutionStatus = ResolutionStatus.Unresolved;
	return (detach = false) => {
		switch (status) {
			case ResolutionStatus.Resolving:
				throw new Error(`Cyclic dependency detected!`);
			case ResolutionStatus.Detached: {
				if (detach) break;
				(cached_value as any) = undefined;
				status = ResolutionStatus.Resolving;
				cached_value = callback(detach);
				status = ResolutionStatus.Resolved;
			} break;
			case ResolutionStatus.Resolved: {
				if (!detach) break;
				callback(detach);
				status = ResolutionStatus.Detached;
			} break;
			case ResolutionStatus.Unresolved: {
				if (detach) break;
				status = ResolutionStatus.Resolving;
				cached_value = callback(detach);
				status = ResolutionStatus.Resolved;
			} break;
		}
		return cached_value;
	}
}

function maybe_cache<T extends AlanObject>(callback:(detach:boolean) => T|undefined) {
	let cached_value:T|undefined;
	let status:ResolutionStatus = ResolutionStatus.Unresolved;
	return (detach = false) => {
		switch (status) {
			case ResolutionStatus.Resolving:
				throw new Error(`Cyclic dependency detected!`);
			case ResolutionStatus.Detached: {
				if (detach) break;
				cached_value = undefined;
				status = ResolutionStatus.Resolving;
				cached_value = callback(detach);
				status = ResolutionStatus.Resolved;
			} break;
			case ResolutionStatus.Resolved: {
				if (!detach) break;
				callback(detach);
				status = ResolutionStatus.Detached;
			} break;
			case ResolutionStatus.Unresolved: {
				if (detach) break;
				status = ResolutionStatus.Resolving;
				cached_value = callback(detach);
				status = ResolutionStatus.Resolved;
			} break;
		}
		return cached_value;
	}
}

/* number validation */
function number__is_positive(val:number) { assert(val > 0); }
function number__is_negative(val:number) { assert(val < 0); }
function number__is_zero(val:number) { assert(val === 0); }
function number__is_non_positive(val:number) { assert(val <= 0); }
function number__is_non_negative(val:number) { assert(val >= 0); }
function number__is_non_zero(val:number) { assert(val !== 0); }

/* complex value wrappers */
export abstract class AlanObject {
	public abstract get path():string;
}
export abstract class AlanStruct extends AlanObject {
	public abstract get path():string;
	public abstract is(other:AlanStruct):boolean;
}
export interface Tree<T> {
	types: {[name:string]:T};
	subtrees: {[name:string]:Tree<T>};
}
export abstract class Reference<T extends AlanObject, V extends (string|string[])> extends AlanObject {
	constructor(public readonly entry:V, private readonly resolve:() => T) { super(); }
	public get ref() { return this.resolve(); }
}
export abstract class AlanInteger extends AlanObject {
	constructor(public readonly value:number) { super(); }
}
export abstract class AlanDictionary<T extends {node: AlanDictionaryEntry, init: any }, P extends AlanNode> extends AlanObject {
	protected _entries:Map<string,((parent:P) => T['node'])|T['node']>;

	protected load_entry(key:string, entry:((parent:P) => T['node'])|T['node']):T['node'] {
		if (typeof entry === 'function') {
			const loaded_entry = entry(this.parent);
			this._entries.set(key, loaded_entry);
			return loaded_entry;
		}
		return entry;
	}
	constructor (
		entries:{[key:string]:T['init']},
		protected parent:P) {
		super();

		this._entries = new Map(Object.keys(entries).map(entry_key => [entry_key, this.initialize(parent, entry_key, entries[entry_key])]));
	}

	protected abstract initialize(parent:P, key:string, obj:T['init']):T['node'];
	protected abstract finalize(obj:T['node'],detach?:boolean):void;

	get size() { return this._entries.size; }
	[Symbol.iterator]():IterableIterator<[string,T['node']]> {
		const $this = this;
		const iterator = this._entries.entries();
		return {
			next() {
				const next = iterator.next();
				if (next.done) {
					return next;
				} else {
					return {
						value: [next.value[0], $this.load_entry(next.value[0], next.value[1])]
					}
				}
			},
			[Symbol.iterator]() {
				return this;
			}
		};
	}
	entries():IterableIterator<[string,T['node']]> {
		return this[Symbol.iterator]();}
	forEach(walk_function: ($:T['node']) => void) {
		Array.from(this.entries()).forEach(entry => walk_function(entry[1]));
	}
	toArray():[string, T['node']][] {
		return Array.from(this.entries());
	}
	map<RT>(callback:(value:T['node']) => RT):Record<string, RT> {
		const result:Record<string, RT> = {};
		this._entries.forEach((value, key) => {
			result[key] = callback(this.load_entry(key, value));
		});
		return result;
	}
	get(key:string):T['node']|undefined {
		const entry = this._entries.get(key);
		if (entry)
			return this.load_entry(key, entry);
		else
			return undefined;
	}
	has(key:string):boolean { return this._entries.has(key); }
	switchOnEntryExists<RT>(key:string, onExists:(($: T['node']) => RT)|Exclude<RT, Function>, onNotExists:(() => RT)|Exclude<RT, Function>): RT {
		const entry = this._entries.get(key);
		if (entry === undefined) {
			return isFunction(onNotExists) ? onNotExists() : onNotExists;
		} else {
			return isFunction(onExists) ? onExists(this.load_entry(key, entry)) : onExists;
		}
	}
}	

export abstract class AlanSet<T extends {node: AlanNode, init: any }, P extends AlanNode> extends AlanObject {
	private _entries:Set<T['node']>;
	constructor (
		entries:Array<T['init']>,
		protected parent:P) {
		super();
		this._entries = new Set(entries.map(entry => this.initialize(parent, entry)));
	}

	protected abstract initialize(parent:P, obj:T['init']):T['node'];
	protected abstract finalize(obj:T['node'],detach?:boolean):void;

	get size() { return this._entries.size; }
	[Symbol.iterator]() {
		return this._entries[Symbol.iterator]();
	}
	entries() {
		return this._entries.entries();
	}
	forEach(walk_function: ($:T['node']) => void) {
		this._entries.forEach(walk_function);
	}
	has(key:T['node']):boolean { return this._entries.has(key); }
}
type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export abstract class StateGroup<T extends {name:string, node:AlanNode & {parent:AlanNode}, init:any}> extends AlanObject {
	public state: DistributiveOmit<T,'init'>;
	private init(state_name:T['name'], init:T['init'], parent:AlanNode) {
		this.state = {
			name: state_name,
			node: this.initializer(state_name)(init, parent),
		} as DistributiveOmit<T,'init'>;
	}
	constructor (s:[T['name'],T['init']]|T['name'], private parent:AlanNode) {
		super();
		const state_name:T['name'] = (typeof s === 'string') ? s : s[0];
		this.init(state_name, typeof s === 'string' ? {} : s[1], parent);
	}

	protected abstract initializer(state_name:T['name']): ($:T['init'], parent:AlanNode) => T['node'];
	protected abstract finalizer(state:T['name']): ($:T['node'], detach?:boolean) => void;

	switch<TS> (cases:{[K in T['name']]:(($:Extract<T, {name:K}>['node']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.state.name as T['name']];
		if (isFunction(handler)) {
			return handler(this.state.node);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	cast<S extends T['name']>(state:S):Extract<T, {name:S}>['node'] {
		if (this.state.name === state) {
			return this.state.node;
		} else {
			throw new Error(`Invalid cast to state '${state}'; actual state is '${this.state.name}' at ${this.state.node.path} .`);
		}
	}

}

export abstract class AlanCombinator extends AlanObject {}
export abstract class AlanNode extends AlanStruct {
	protected _root:Cmanifest|undefined;
	public abstract get root():Cmanifest;
	public abstract get entity():AlanNode;
	public is(other:AlanNode):boolean {
		return this === other;
	}
}

abstract class AlanDictionaryEntry extends AlanNode {
	public abstract key:(string|Reference<AlanObject,string>);
	public abstract get key_value():string;
};
type AlanGraphEdge<T extends AlanNode> = {
	ref: {
		entity: T
	}
};
abstract class AlanGraphVertex extends AlanDictionaryEntry {
	abstract _edges: { [key: string ]: Set<AlanGraphEdge<AlanGraphVertex>> }
}
export abstract class AlanTopology<T extends { node:AlanGraphVertex, init:any }, P extends AlanNode, G extends string> extends AlanDictionary<T,P> {
	protected abstract _graphs: { [key: string ]: T['node'][] };
	topo_forEach(graph:G, walk_function: ($:T['node']) => void) {
		for (let entry of this.topo_entries(graph)) { walk_function(entry); }
	}
	topo_entries(graph:G):IterableIterator<T['node']> {
		return this._graphs[graph][Symbol.iterator]();
	}
	topo_toArray(graph:G):T['node'][] {
		return Array.from(this.topo_entries(graph));
	}
	topo_sort(g:G) {
		const $this = this;
		$this._graphs[g] = []
		const indegree:Map<T['node'], number> = new Map(Array.from($this.entries()).map(([_,v]) => [v as T['node'],0]));
		for (let [_,v] of $this.entries()) {
			v._edges[g].forEach(edge => indegree.set(edge.ref.entity as AlanGraphVertex, indegree.get(edge.ref.entity as AlanGraphVertex)! + 1));
		}
		let queue: T['node'][] = [];

		//find all vertices with indegree 0
		indegree.forEach((v,k) => { if (v === 0) queue.push(k); });
		let visited = 0;
		while (queue.length > 0) {
			++visited;
			const v = queue.pop()!;
			$this._graphs[g].push(v);
			v._edges[g].forEach(edge => {
				const u = indegree.get(edge.ref.entity as T['node'])!;
				if (u === 1) {
					queue.push(edge.ref.entity as T['node']);
				} else {
					indegree.set(edge.ref.entity as T['node'], u - 1)
				}
			});
		}

		// Check if there was a cycle
		if (visited !== this._entries.size) {
			throw new Error(`Cycle found in graph.`);
		}
	}
	totally_ordered(g:G) {
		if (this._graphs[g].length < 2) return;
		this._graphs[g].reduce((prev, curr) => {
			if (prev._edges[g].size === 0) { return curr; }
			let connected = false;
			prev._edges[g].forEach(e => { connected = (connected || e.ref.entity === curr) });
			if (!connected)
				throw new Error(`Totally ordered graph constraint violation.`);
			return curr;
		});
	}
}

/* alan objects */
export type Tinode = {
	'type':['directory', Tdirectory]|['file', Tfile]|['library', Tlibrary];
};
export class Cinode extends AlanNode {
	public readonly properties:{
		readonly type:Cinode.Dtype<
			{ name: 'directory', node:Cdirectory, init:Tdirectory}|
			{ name: 'file', node:Cfile, init:Tfile}|
			{ name: 'library', node:Clibrary, init:Tlibrary}>
	};
	constructor(init:Tinode, public location:AlanNode) {
		super();
		const $this = this;
		this.properties = {
			type: new Cinode.Dtype(init['type'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.location.root); }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/inode`; }
	public get entity() { return this.location.entity; }
}
export type Tdirectory = {
	'children':Record<string, Tchildren>;
	'ordered':'no'|['no', {}]|['yes', Tyes__ordered__directory];
};
export class Cdirectory extends AlanNode {
	public readonly properties:{
		readonly children:Cdirectory.Dchildren,
		readonly ordered:Cdirectory.Dordered<
			{ name: 'no', node:Cno__ordered__directory, init:Tno__ordered__directory}|
			{ name: 'yes', node:Cyes__ordered__directory, init:Tyes__ordered__directory}>
	};
	constructor(init:Tdirectory, public parent:Cinode) {
		super();
		const $this = this;
		this.properties = {
			children: new Cdirectory.Dchildren(init['children'], $this),
			ordered: new Cdirectory.Dordered(init['ordered'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/type?directory`; }
	public get entity() { return this.parent.entity; }
}
export type Tchildren = {
	'inode':Tinode;
	'ordered':'no'|['no', {}]|['yes', Tyes__ordered__children];
};
export class Cchildren extends AlanDictionaryEntry {
	public key:string;
	public get key_value() { return this.key; }
	public readonly properties:{
		readonly inode:Cinode,
		readonly ordered:Cchildren.Dordered<
			{ name: 'no', node:Cno__ordered__children, init:Tno__ordered__children}|
			{ name: 'yes', node:Cyes__ordered__children, init:Tyes__ordered__children}>
	};
	constructor(key:string, init:Tchildren, public parent:Cdirectory) {
		super();
		const $this = this;
		this.key = key;
		this.properties = {
			inode: new Cchildren.Dinode(init['inode'], $this),
			ordered: new Cchildren.Dordered(init['ordered'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/children[${this.key}]`; }
	public get entity() { return this; }
}
export type Tno__ordered__children = {
};
export class Cno__ordered__children extends AlanNode {
	constructor(init:Tno__ordered__children, public parent:Cchildren) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/ordered?no`; }
	public get entity() { return this.parent.entity; }
}
export type Tyes__ordered__children = {
	'next':string;
};
export class Cyes__ordered__children extends AlanNode {
	public readonly properties:{
		readonly next:Cyes__ordered__children.Dnext
	};
	constructor(init:Tyes__ordered__children, public parent:Cchildren) {
		super();
		const $this = this;
		this.properties = {
			next: new Cyes__ordered__children.Dnext(init['next'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/ordered?yes`; }
	public get entity() { return this.parent.entity; }
}
export type Tno__ordered__directory = {
};
export class Cno__ordered__directory extends AlanNode {
	constructor(init:Tno__ordered__directory, public parent:Cdirectory) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/ordered?no`; }
	public get entity() { return this.parent.entity; }
}
export type Tyes__ordered__directory = {
	'first':string;
};
export class Cyes__ordered__directory extends AlanNode {
	public readonly properties:{
		readonly first:Cyes__ordered__directory.Dfirst
	};
	constructor(init:Tyes__ordered__directory, public parent:Cdirectory) {
		super();
		const $this = this;
		this.properties = {
			first: new Cyes__ordered__directory.Dfirst(init['first'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/ordered?yes`; }
	public get entity() { return this.parent.entity; }
}
export type Tfile = {
	'hash':string;
	'suffix':string;
};
export class Cfile extends AlanNode {
	public readonly properties:{
		readonly hash:string,
		readonly suffix:string
	};
	constructor(init:Tfile, public parent:Cinode) {
		super();
		const $this = this;
		this.properties = {
			hash: init['hash'],
			suffix: init['suffix']
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/type?file`; }
	public get entity() { return this.parent.entity; }
}
export type Tlibrary = {
	'inode':Tinode;
};
export class Clibrary extends AlanNode {
	public readonly properties:{
		readonly inode:Cinode
	};
	constructor(init:Tlibrary, public parent:Cinode) {
		super();
		const $this = this;
		this.properties = {
			inode: new Clibrary.Dinode(init['inode'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/type?library`; }
	public get entity() { return this.parent.entity; }
}

export type Tmanifest = {
	'fingerprint':string;
	'language fingerprint':string;
	'root':Tinode;
};
export class Cmanifest extends AlanNode {
	public key?:string;
	public get root() { return this; }
	public readonly properties:{
		readonly fingerprint:string,
		readonly language_fingerprint:string,
		readonly root:Cinode
	};
	constructor(init:Tmanifest) {
		super();
		const $this = this;
		this.properties = {
			fingerprint: init['fingerprint'],
			language_fingerprint: init['language fingerprint'],
			root: new Cmanifest.Droot(init['root'], $this)
		};
	}
	public get path() { return ``; }
	public get entity() { return this; }
}

/* property classes */
export namespace Cinode {
	export class Dtype<T extends
		{ name: 'directory', node:Cdirectory, init:Tdirectory}|
		{ name: 'file', node:Cfile, init:Tfile}|
		{ name: 'library', node:Clibrary, init:Tlibrary}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'directory': return (init:Tdirectory, parent:Cinode) => new Cdirectory(init, parent);
				case 'file': return (init:Tfile, parent:Cinode) => new Cfile(init, parent);
				case 'library': return (init:Tlibrary, parent:Cinode) => new Clibrary(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'directory': return finalize_directory;
				case 'file': return finalize_file;
				case 'library': return finalize_library;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tinode['type'], parent:Cinode) {
			super(data, parent);
		}
		public get path() { return `<unknown>/type`; }
	}
}
export namespace Cdirectory {
	export class Dchildren extends AlanDictionary<{ node:Cchildren, init:Tchildren},Cdirectory> {
		protected initialize(parent:Cdirectory, key:string, entry_init:Tchildren) { return new Cchildren(key, entry_init, parent); }
		protected finalize = finalize_children
		public get path() { return `${this.parent.path}/children`; }
		constructor(data:Tdirectory['children'], parent:Cdirectory) {
			super(data, parent);
		}
	}
	export class Dordered<T extends
		{ name: 'no', node:Cno__ordered__directory, init:Tno__ordered__directory}|
		{ name: 'yes', node:Cyes__ordered__directory, init:Tyes__ordered__directory}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__ordered__directory, parent:Cdirectory) => new Cno__ordered__directory(init, parent);
				case 'yes': return (init:Tyes__ordered__directory, parent:Cdirectory) => new Cyes__ordered__directory(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'no': return finalize_no__ordered__directory;
				case 'yes': return finalize_yes__ordered__directory;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tdirectory['ordered'], parent:Cdirectory) {
			super(data, parent);
		}
		public get path() { return `<unknown>/ordered`; }
	}
}
export namespace Cchildren {
	export class Dinode extends Cinode {
		constructor(data:Tchildren['inode'], parent:Cchildren) {
			super(data, parent)
		}
	}
	export class Dordered<T extends
		{ name: 'no', node:Cno__ordered__children, init:Tno__ordered__children}|
		{ name: 'yes', node:Cyes__ordered__children, init:Tyes__ordered__children}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__ordered__children, parent:Cchildren) => new Cno__ordered__children(init, parent);
				case 'yes': return (init:Tyes__ordered__children, parent:Cchildren) => new Cyes__ordered__children(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'no': return finalize_no__ordered__children;
				case 'yes': return finalize_yes__ordered__children;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tchildren['ordered'], parent:Cchildren) {
			super(data, parent);
		}
		public get path() { return `<unknown>/ordered`; }
	}
}
export namespace Cyes__ordered__children {
	export class Dnext extends Reference<manifest.Cchildren,string> {

		constructor(data:string, $this:Cyes__ordered__children) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.parent)
				.then(context => context?.parent)
				.then(context => {
					const entry = context?.properties.children.get(this.entry)!;
					return resolve(entry).result;
				}).result!))
		}
		public get path() { return `<unknown>/next`; }
	}
}
export namespace Cyes__ordered__directory {
	export class Dfirst extends Reference<manifest.Cchildren,string> {

		constructor(data:string, $this:Cyes__ordered__directory) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.parent)
				.then(context => {
					const entry = context?.properties.children.get(this.entry)!;
					return resolve(entry).result;
				}).result!))
		}
		public get path() { return `<unknown>/first`; }
	}
}
export namespace Cfile {
}
export namespace Clibrary {
	export class Dinode extends Cinode {
		constructor(data:Tlibrary['inode'], parent:Clibrary) {
			super(data, parent)
		}
	}
}
export namespace Cmanifest {
	export class Droot extends Cinode {
		constructor(data:Tmanifest['root'], parent:Cmanifest) {
			super(data, parent)
		}
	}
}
function finalize_no__ordered__children(obj:Cno__ordered__children, detach:boolean = false) {
}
function finalize_yes__ordered__children(obj:Cyes__ordered__children, detach:boolean = false) {
	assert((<(detach?:boolean) => manifest.Cchildren>(obj.properties.next as any).resolve)(detach) !== undefined || detach);
}
function finalize_children(obj:Cchildren, detach:boolean = false) {
	finalize_inode(obj.properties.inode, detach);
	switch (obj.properties.ordered.state.name) {
		case 'no': finalize_no__ordered__children(obj.properties.ordered.state.node, detach); break;
		case 'yes': finalize_yes__ordered__children(obj.properties.ordered.state.node, detach); break;
	}
}
function finalize_no__ordered__directory(obj:Cno__ordered__directory, detach:boolean = false) {
}
function finalize_yes__ordered__directory(obj:Cyes__ordered__directory, detach:boolean = false) {
	assert((<(detach?:boolean) => manifest.Cchildren>(obj.properties.first as any).resolve)(detach) !== undefined || detach);
}
function finalize_directory(obj:Cdirectory, detach:boolean = false) {
	for (const [_key, entry] of obj.properties.children) {
		finalize_children(entry, detach);
	}
	if (!detach) {
	}
	switch (obj.properties.ordered.state.name) {
		case 'no': finalize_no__ordered__directory(obj.properties.ordered.state.node, detach); break;
		case 'yes': finalize_yes__ordered__directory(obj.properties.ordered.state.node, detach); break;
	}
}
function finalize_file(obj:Cfile, detach:boolean = false) {
}
function finalize_library(obj:Clibrary, detach:boolean = false) {
	finalize_inode(obj.properties.inode, detach);
}
function finalize_inode(obj:Cinode, detach:boolean = false) {
	switch (obj.properties.type.state.name) {
		case 'directory': finalize_directory(obj.properties.type.state.node, detach); break;
		case 'file': finalize_file(obj.properties.type.state.node, detach); break;
		case 'library': finalize_library(obj.properties.type.state.node, detach); break;
	}
}
function finalize_manifest(obj:Cmanifest, detach:boolean = false) {
	finalize_inode(obj.properties.root, detach);
}

export namespace Cmanifest {
	export function create(init:Tmanifest):Cmanifest {
		const instance = new Cmanifest(init);
		finalize_manifest(instance);
		return instance;
	};
}
