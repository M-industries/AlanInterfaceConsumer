import * as interface_command from './alan_api';
import * as interface_ from '../interface/alan_api';

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
	protected _root:Cinterface_command|undefined;
	public abstract get root():Cinterface_command;
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
export type Tid_path = {
	'has steps':'no'|['no', {}]|['yes', Tyes];
};
export class Cid_path extends AlanNode {
	public readonly properties:{
		readonly has_steps:Cid_path.Dhas_steps<
			{ name: 'no', node:Cno, init:Tno}|
			{ name: 'yes', node:Cyes, init:Tyes}>
	};
	public readonly output:{
		result_node: () => interface_.Cnode;
	} = {
		result_node: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.has_steps?.state.node.output.result_node()).result!)
	};
	constructor(init:Tid_path, public location:AlanNode, public input: {
		context_node: () => interface_.Cnode
	}) {
		super();
		const $this = this;
		this.properties = {
			has_steps: new Cid_path.Dhas_steps(init['has steps'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.location.root); }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/id path`; }
	public get entity() { return this.location.entity; }
}
export type Tno = {
};
export class Cno extends AlanNode {
	public readonly output:{
		result_node: () => interface_.Cnode;
	} = {
		result_node: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.context_node()).result!)
	}
	constructor(init:Tno, public parent:Cid_path) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has steps?no`; }
	public get entity() { return this.parent.entity; }
}
export type Tyes = {
	'tail':Tid_path;
	'type':['collection entry', Tcollection_entry]|['group', Tgroup__type__yes]|['state', Tstate];
};
export class Cyes extends AlanNode {
	public readonly properties:{
		readonly tail:Cid_path,
		readonly type:Cyes.Dtype<
			{ name: 'collection entry', node:Ccollection_entry, init:Tcollection_entry}|
			{ name: 'group', node:Cgroup__type__yes, init:Tgroup__type__yes}|
			{ name: 'state', node:Cstate, init:Tstate}>
	};
	public readonly output:{
		result_node: () => interface_.Cnode;
	} = {
		result_node: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.tail)
			.then(context => context?.component_root.output.result_node()).result!)
	}
	constructor(init:Tyes, public parent:Cid_path) {
		super();
		const $this = this;
		this.properties = {
			tail: new Cyes.Dtail(init['tail'], $this),
			type: new Cyes.Dtype(init['type'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has steps?yes`; }
	public get entity() { return this.parent.entity; }
}
export type Tcollection_entry = {
	'collection':string;
	'id':string;
};
export class Ccollection_entry extends AlanNode {
	public readonly properties:{
		readonly collection:Ccollection_entry.Dcollection,
		readonly id:string
	};
	public readonly output:{
		result_node: () => interface_.Cnode;
	} = {
		result_node: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.collection?.ref)
			.then(context => context?.properties.node).result!)
	}
	constructor(init:Tcollection_entry, public parent:Cyes) {
		super();
		const $this = this;
		this.properties = {
			collection: new Ccollection_entry.Dcollection(init['collection'], $this),
			id: init['id']
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?collection entry`; }
	public get entity() { return this.parent.entity; }
}
export type Tgroup__type__yes = {
	'group':string;
};
export class Cgroup__type__yes extends AlanNode {
	public readonly properties:{
		readonly group:Cgroup__type__yes.Dgroup
	};
	public readonly output:{
		result_node: () => interface_.Cnode;
	} = {
		result_node: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.group?.ref)
			.then(context => context?.properties.node).result!)
	}
	constructor(init:Tgroup__type__yes, public parent:Cyes) {
		super();
		const $this = this;
		this.properties = {
			group: new Cgroup__type__yes.Dgroup(init['group'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?group`; }
	public get entity() { return this.parent.entity; }
}
export type Tstate = {
	'state':string;
	'state group':string;
};
export class Cstate extends AlanNode {
	public readonly properties:{
		readonly state:Cstate.Dstate,
		readonly state_group:Cstate.Dstate_group
	};
	public readonly output:{
		result_node: () => interface_.Cnode;
	} = {
		result_node: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.state?.ref)
			.then(context => context?.properties.node).result!)
	}
	constructor(init:Tstate, public parent:Cyes) {
		super();
		const $this = this;
		this.properties = {
			state: new Cstate.Dstate(init['state'], $this),
			state_group: new Cstate.Dstate_group(init['state group'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state`; }
	public get entity() { return this.parent.entity; }
}
export type Tcontext_keys__interface_command = {
	'context keys':Record<string, Tcontext_keys__context_keys>;
};
export class Ccontext_keys__interface_command extends AlanNode {
	public readonly properties:{
		readonly context_keys:Ccontext_keys__interface_command.Dcontext_keys
	};
	constructor(init:Tcontext_keys__interface_command, public location:AlanNode) {
		super();
		const $this = this;
		this.properties = {
			context_keys: new Ccontext_keys__interface_command.Dcontext_keys(init['context keys'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.location.root); }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/context keys`; }
	public get entity() { return this.location.entity; }
}
export class Kcontext_keys__context_keys extends Reference<interface_.Ccontext_keys, string> {
	constructor(key:string, $this:Ccontext_keys__context_keys) {
		super(key, cache((detach:boolean) => resolve($this.parent)
			.then(() => $this.parent)
			.then(context => context?.root.input.interface_)
			.then(context => {
				const entry = context?.properties.context_keys.get(this.entry)!;
				return resolve(entry).result;
			}).result!))
	}
	public get path() { return `<unknown>/context keys/key`; }
}
export type Tcontext_keys__context_keys = {
	'value':string;
};
export class Ccontext_keys__context_keys extends AlanDictionaryEntry {
	public key:Kcontext_keys__context_keys;
	public get key_value() { return this.key.entry; }
	public readonly properties:{
		readonly value:string
	};
	constructor(key:string, init:Tcontext_keys__context_keys, public parent:Ccontext_keys__interface_command) {
		super();
		const $this = this;
		this.key = new Kcontext_keys__context_keys(key, $this);
		this.properties = {
			value: init['value']
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/context keys[${this.key.entry}]`; }
	public get entity() { return this; }
}
export type Tcommand_arguments = {
	'properties':Record<string, Tproperties>;
};
export class Ccommand_arguments extends AlanNode {
	public readonly properties:{
		readonly properties:Ccommand_arguments.Dproperties
	};
	constructor(init:Tcommand_arguments, public location:AlanNode, public input: {
		parameter_definition: () => interface_.Cnode
	}) {
		super();
		const $this = this;
		this.properties = {
			properties: new Ccommand_arguments.Dproperties(init['properties'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.location.root); }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/command arguments`; }
	public get entity() { return this.location.entity; }
}
export class Kproperties extends Reference<interface_.Cproperty, string> {
	constructor(key:string, $this:Cproperties) {
		super(key, cache((detach:boolean) => resolve($this.parent)
			.then(() => $this.parent)
			.then(context => context?.component_root.input.parameter_definition())
			.then(context => {
				const entry = context?.properties.attributes.get(this.entry)!;
				return resolve(entry)
				.then(context => {
					if (context?.properties.type.state.name === 'property') {
						return context.properties.type.state.node as interface_.Cproperty;
					} else {
						return undefined;
					}
				}).result;
			}).result!))
	}
	public get path() { return `<unknown>/properties/key`; }
}
export type Tproperties = {
	'type':['collection', Tcollection]|['file', Tfile]|['group', Tgroup__type__properties]|['number', Tnumber]|['state group', Tstate_group]|['text', Ttext];
};
export class Cproperties extends AlanDictionaryEntry {
	public key:Kproperties;
	public get key_value() { return this.key.entry; }
	public readonly properties:{
		readonly type:Cproperties.Dtype<
			{ name: 'collection', node:Ccollection, init:Tcollection}|
			{ name: 'file', node:Cfile, init:Tfile}|
			{ name: 'group', node:Cgroup__type__properties, init:Tgroup__type__properties}|
			{ name: 'number', node:Cnumber, init:Tnumber}|
			{ name: 'state group', node:Cstate_group, init:Tstate_group}|
			{ name: 'text', node:Ctext, init:Ttext}>
	};
	constructor(key:string, init:Tproperties, public parent:Ccommand_arguments) {
		super();
		const $this = this;
		this.key = new Kproperties(key, $this);
		this.properties = {
			type: new Cproperties.Dtype(init['type'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/properties[${this.key.entry}]`; }
	public get entity() { return this; }
}
export type Tcollection = {
	'entries':Tentries[];
};
export class Ccollection extends AlanNode {
	public readonly properties:{
		readonly entries:Ccollection.Dentries
	};
	public readonly inferences:{
		collection: () => interface_.Ccollection
	} = {
		collection: cache((detach:boolean) => {
			const interface_command__command_arguments__properties__type__collection_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.key?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'collection') {
						return resolve(context.properties.type.state.node as interface_.Ccollection).result;
					} else {
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tcollection, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			entries: new Ccollection.Dentries(init['entries'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?collection`; }
	public get entity() { return this.parent.entity; }
}
export type Tentries = {
	'arguments':Tcommand_arguments;
};
export class Centries extends AlanNode {
	public readonly properties:{
		readonly arguments:Ccommand_arguments
	};
	constructor(init:Tentries, public parent:Ccollection) {
		super();
		const $this = this;
		this.properties = {
			arguments: new Centries.Darguments(init['arguments'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/entries`; }
	public get entity() { return this; }
}
export type Tfile = {
	'extension':string;
	'token':string;
};
export class Cfile extends AlanNode {
	public readonly properties:{
		readonly extension:string,
		readonly token:string
	};
	public readonly inferences:{
		file: () => interface_.Cfile
	} = {
		file: cache((detach:boolean) => {
			const interface_command__command_arguments__properties__type__file_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.key?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'file') {
						return resolve(context.properties.type.state.node as interface_.Cfile).result;
					} else {
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tfile, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			extension: init['extension'],
			token: init['token']
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?file`; }
	public get entity() { return this.parent.entity; }
}
export type Tgroup__type__properties = {
	'arguments':Tcommand_arguments;
};
export class Cgroup__type__properties extends AlanNode {
	public readonly properties:{
		readonly arguments:Ccommand_arguments
	};
	public readonly inferences:{
		group: () => interface_.Cgroup__type__property
	} = {
		group: cache((detach:boolean) => {
			const interface_command__command_arguments__properties__type__group_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.key?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'group') {
						return resolve(context.properties.type.state.node as interface_.Cgroup__type__property).result;
					} else {
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tgroup__type__properties, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			arguments: new Cgroup__type__properties.Darguments(init['arguments'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?group`; }
	public get entity() { return this.parent.entity; }
}
export type Tnumber = {
	'type':['integer', Tinteger]|['natural', Tnatural];
};
export class Cnumber extends AlanNode {
	public readonly properties:{
		readonly type:Cnumber.Dtype<
			{ name: 'integer', node:Cinteger, init:Tinteger}|
			{ name: 'natural', node:Cnatural, init:Tnatural}>
	};
	public readonly inferences:{
		number: () => interface_.Cnumber
	} = {
		number: cache((detach:boolean) => {
			const interface_command__command_arguments__properties__type__number_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.key?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'number') {
						return resolve(context.properties.type.state.node as interface_.Cnumber).result;
					} else {
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tnumber, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			type: new Cnumber.Dtype(init['type'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?number`; }
	public get entity() { return this.parent.entity; }
}
export type Tinteger = {
	'value':number;
};
export class Cinteger extends AlanNode {
	public readonly properties:{
		readonly value:Cinteger.Dvalue
	};
	public readonly inferences:{
		integer_type: () => interface_.Cinteger__set
	} = {
		integer_type: cache((detach:boolean) => {
			const interface_command__command_arguments__properties__type__number__type__integer_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.inferences.number())
				.then(context => context?.properties.type)
				.then(context => {
					if (context?.properties.set.state.name === 'integer') {
						return resolve(context.properties.set.state.node as interface_.Cinteger__set).result;
					} else {
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tinteger, public parent:Cnumber) {
		super();
		const $this = this;
		this.properties = {
			value: new Cinteger.Dvalue(init['value'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?integer`; }
	public get entity() { return this.parent.entity; }
}
export type Tnatural = {
	'value':number;
};
export class Cnatural extends AlanNode {
	public readonly properties:{
		readonly value:Cnatural.Dvalue
	};
	public readonly inferences:{
		natural_type: () => interface_.Cnatural__set
	} = {
		natural_type: cache((detach:boolean) => {
			const interface_command__command_arguments__properties__type__number__type__natural_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.inferences.number())
				.then(context => context?.properties.type)
				.then(context => {
					if (context?.properties.set.state.name === 'natural') {
						return resolve(context.properties.set.state.node as interface_.Cnatural__set).result;
					} else {
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tnatural, public parent:Cnumber) {
		super();
		const $this = this;
		this.properties = {
			value: new Cnatural.Dvalue(init['value'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?natural`; }
	public get entity() { return this.parent.entity; }
}
export type Tstate_group = {
	'arguments':Tcommand_arguments;
	'state':string;
};
export class Cstate_group extends AlanNode {
	public readonly properties:{
		readonly arguments:Ccommand_arguments,
		readonly state:Cstate_group.Dstate
	};
	public readonly inferences:{
		state_group: () => interface_.Cstate_group
	} = {
		state_group: cache((detach:boolean) => {
			const interface_command__command_arguments__properties__type__state_group_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.key?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'state group') {
						return resolve(context.properties.type.state.node as interface_.Cstate_group).result;
					} else {
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tstate_group, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			arguments: new Cstate_group.Darguments(init['arguments'], $this),
			state: new Cstate_group.Dstate(init['state'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state group`; }
	public get entity() { return this.parent.entity; }
}
export type Ttext = {
	'value':string;
};
export class Ctext extends AlanNode {
	public readonly properties:{
		readonly value:string
	};
	public readonly inferences:{
		text: () => interface_.Ctext
	} = {
		text: cache((detach:boolean) => {
			const interface_command__command_arguments__properties__type__text_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.key?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'text') {
						return resolve(context.properties.type.state.node as interface_.Ctext).result;
					} else {
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Ttext, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			value: init['value']
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?text`; }
	public get entity() { return this.parent.entity; }
}

export type Tinterface_command = {
	'arguments':Tcommand_arguments;
	'command':string;
	'context keys':Tcontext_keys__interface_command;
	'context node':Tid_path;
};
export class Cinterface_command extends AlanNode {
	public key?:string;
	public get root() { return this; }
	public readonly properties:{
		readonly arguments:Ccommand_arguments,
		readonly command:Cinterface_command.Dcommand,
		readonly context_keys:Ccontext_keys__interface_command,
		readonly context_node:Cid_path
	};
	constructor(init:Tinterface_command, public readonly input: {
	'interface_':interface_.Cinterface}) {
		super();
		const $this = this;
		this.properties = {
			arguments: new Cinterface_command.Darguments(init['arguments'], $this),
			command: new Cinterface_command.Dcommand(init['command'], $this),
			context_keys: new Cinterface_command.Dcontext_keys(init['context keys'], $this),
			context_node: new Cinterface_command.Dcontext_node(init['context node'], $this)
		};
	}
	public get path() { return ``; }
	public get entity() { return this; }
}

/* property classes */
export namespace Ccommand_arguments {
	export class Dproperties extends AlanDictionary<{ node:Cproperties, init:Tproperties},Ccommand_arguments> {
		protected initialize(parent:Ccommand_arguments, key:string, entry_init:Tproperties) { return new Cproperties(key, entry_init, parent); }
		protected finalize = finalize_properties
		protected eval_required_keys(detach:boolean = false):void {
			let this_obj = this.parent;
			function do_include(interface_command__command_arguments__properties_key_nval:interface_.Cproperty):boolean {
				return true;
			};
			resolve(this.parent)
			.then(() => this.parent)
			.then(context => context?.component_root.input.parameter_definition())
			.then(context => {
				for (let [key,val] of context?.properties.attributes) {
					let tail_obj = resolve(val)
					.then(context => {
						if (context?.properties.type.state.name === 'property') {
							return context.properties.type.state.node as interface_.Cproperty;
						} else {
							return undefined;
						}
					}).result;
					if (tail_obj !== undefined && do_include(tail_obj)) {
						assert(this.get(key) !== undefined);
					}
				}
				return undefined;
			});
		}
		public get path() { return `${this.parent.path}/properties`; }
		constructor(data:Tcommand_arguments['properties'], parent:Ccommand_arguments) {
			super(data, parent);
		}
	}
}
export namespace Cproperties {
	export class Dtype<T extends
		{ name: 'collection', node:Ccollection, init:Tcollection}|
		{ name: 'file', node:Cfile, init:Tfile}|
		{ name: 'group', node:Cgroup__type__properties, init:Tgroup__type__properties}|
		{ name: 'number', node:Cnumber, init:Tnumber}|
		{ name: 'state group', node:Cstate_group, init:Tstate_group}|
		{ name: 'text', node:Ctext, init:Ttext}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'collection': return (init:Tcollection, parent:Cproperties) => new Ccollection(init, parent);
				case 'file': return (init:Tfile, parent:Cproperties) => new Cfile(init, parent);
				case 'group': return (init:Tgroup__type__properties, parent:Cproperties) => new Cgroup__type__properties(init, parent);
				case 'number': return (init:Tnumber, parent:Cproperties) => new Cnumber(init, parent);
				case 'state group': return (init:Tstate_group, parent:Cproperties) => new Cstate_group(init, parent);
				case 'text': return (init:Ttext, parent:Cproperties) => new Ctext(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'collection': return finalize_collection;
				case 'file': return finalize_file;
				case 'group': return finalize_group__type__properties;
				case 'number': return finalize_number;
				case 'state group': return finalize_state_group;
				case 'text': return finalize_text;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tproperties['type'], parent:Cproperties) {
			super(data, parent);
		}
		public get path() { return `<unknown>/type`; }
	}
}
export namespace Ccollection {
	export class Dentries extends AlanSet<{ node:Centries, init:Tentries},Ccollection> {
		protected initialize(parent:Ccollection, entry_init:Tentries) { return new Centries(entry_init, parent); }
		protected finalize = finalize_entries
		public get path() { return `${this.parent.path}/entries`; }
		constructor(data:Tcollection['entries'], parent:Ccollection) {
			super(data, parent);
		}
	}
}
export namespace Centries {
	export class Darguments extends Ccommand_arguments {
		constructor(data:Tentries['arguments'], parent:Centries) {
			super(data, parent, {
				parameter_definition: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.parent)
					.then(context => context?.inferences.collection())
					.then(context => context?.properties.node).result!)
			})
		}
	}
}
export namespace Cfile {
}
export namespace Cgroup__type__properties {
	export class Darguments extends Ccommand_arguments {
		constructor(data:Tgroup__type__properties['arguments'], parent:Cgroup__type__properties) {
			super(data, parent, {
				parameter_definition: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.inferences.group())
					.then(context => context?.properties.node).result!)
			})
		}
	}
}
export namespace Cnumber {
	export class Dtype<T extends
		{ name: 'integer', node:Cinteger, init:Tinteger}|
		{ name: 'natural', node:Cnatural, init:Tnatural}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'integer': return (init:Tinteger, parent:Cnumber) => new Cinteger(init, parent);
				case 'natural': return (init:Tnatural, parent:Cnumber) => new Cnatural(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'integer': return finalize_integer;
				case 'natural': return finalize_natural;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tnumber['type'], parent:Cnumber) {
			super(data, parent);
		}
		public get path() { return `<unknown>/type`; }
	}
}
export namespace Cinteger {
	export class Dvalue extends AlanInteger {
		constructor(data:Tinteger['value'], parent:Cinteger) {
			super(data);}
		public get path() { return `<unknown>/value`; }
	}
}
export namespace Cnatural {
	export class Dvalue extends AlanInteger {
		constructor(data:Tnatural['value'], parent:Cnatural) {
			number__is_positive(data);
			super(data);}
		public get path() { return `<unknown>/value`; }
	}
}
export namespace Cstate_group {
	export class Darguments extends Ccommand_arguments {
		constructor(data:Tstate_group['arguments'], parent:Cstate_group) {
			super(data, parent, {
				parameter_definition: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.properties.state?.ref)
					.then(context => context?.properties.node).result!)
			})
		}
	}
	export class Dstate extends Reference<interface_.Cstates,string> {

		constructor(data:string, $this:Cstate_group) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.inferences.state_group())
				.then(context => {
					const entry = context?.properties.states.get(this.entry)!;
					return resolve(entry).result;
				}).result!))
		}
		public get path() { return `<unknown>/state`; }
	}
}
export namespace Ctext {
}
export namespace Ccontext_keys__interface_command {
	export class Dcontext_keys extends AlanDictionary<{ node:Ccontext_keys__context_keys, init:Tcontext_keys__context_keys},Ccontext_keys__interface_command> {
		protected initialize(parent:Ccontext_keys__interface_command, key:string, entry_init:Tcontext_keys__context_keys) { return new Ccontext_keys__context_keys(key, entry_init, parent); }
		protected finalize = finalize_context_keys__context_keys
		protected eval_required_keys(detach:boolean = false):void {
			let this_obj = this.parent;
			function do_include(interface_command__context_keys__context_keys_key_nval:interface_.Ccontext_keys):boolean {
				return true;
			};
			resolve(this.parent)
			.then(() => this.parent)
			.then(context => context?.root.input.interface_)
			.then(context => {
				for (let [key,val] of context?.properties.context_keys) {
					let tail_obj = resolve(val).result;
					if (tail_obj !== undefined && do_include(tail_obj)) {
						assert(this.get(key) !== undefined);
					}
				}
				return undefined;
			});
		}
		public get path() { return `${this.parent.path}/context keys`; }
		constructor(data:Tcontext_keys__interface_command['context keys'], parent:Ccontext_keys__interface_command) {
			super(data, parent);
		}
	}
}
export namespace Ccontext_keys__context_keys {
}
export namespace Cid_path {
	export class Dhas_steps<T extends
		{ name: 'no', node:Cno, init:Tno}|
		{ name: 'yes', node:Cyes, init:Tyes}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno, parent:Cid_path) => new Cno(init, parent);
				case 'yes': return (init:Tyes, parent:Cid_path) => new Cyes(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'no': return finalize_no;
				case 'yes': return finalize_yes;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tid_path['has steps'], parent:Cid_path) {
			super(data, parent);
		}
		public get path() { return `<unknown>/has steps`; }
	}
}
export namespace Cyes {
	export class Dtail extends Cid_path {
		constructor(data:Tyes['tail'], parent:Cyes) {
			super(data, parent, {
				context_node: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.properties.type?.state.node.output.result_node()).result!)
			})
		}
	}
	export class Dtype<T extends
		{ name: 'collection entry', node:Ccollection_entry, init:Tcollection_entry}|
		{ name: 'group', node:Cgroup__type__yes, init:Tgroup__type__yes}|
		{ name: 'state', node:Cstate, init:Tstate}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'collection entry': return (init:Tcollection_entry, parent:Cyes) => new Ccollection_entry(init, parent);
				case 'group': return (init:Tgroup__type__yes, parent:Cyes) => new Cgroup__type__yes(init, parent);
				case 'state': return (init:Tstate, parent:Cyes) => new Cstate(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'collection entry': return finalize_collection_entry;
				case 'group': return finalize_group__type__yes;
				case 'state': return finalize_state;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tyes['type'], parent:Cyes) {
			super(data, parent);
		}
		public get path() { return `<unknown>/type`; }
	}
}
export namespace Ccollection_entry {
	export class Dcollection extends Reference<interface_.Ccollection,string> {

		constructor(data:string, $this:Ccollection_entry) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.component_root.input.context_node())
				.then(context => {
					const entry = context?.properties.attributes.get(this.entry)!;
					return resolve(entry)
					.then(context => {
						if (context?.properties.type.state.name === 'property') {
							return context.properties.type.state.node as interface_.Cproperty;
						} else {
							return undefined;
						}
					})
					.then(context => {
						if (context?.properties.type.state.name === 'collection') {
							return context.properties.type.state.node as interface_.Ccollection;
						} else {
							return undefined;
						}
					}).result;
				}).result!))
		}
		public get path() { return `<unknown>/collection`; }
	}
}
export namespace Cgroup__type__yes {
	export class Dgroup extends Reference<interface_.Cgroup__type__property,string> {

		constructor(data:string, $this:Cgroup__type__yes) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.component_root.input.context_node())
				.then(context => {
					const entry = context?.properties.attributes.get(this.entry)!;
					return resolve(entry)
					.then(context => {
						if (context?.properties.type.state.name === 'property') {
							return context.properties.type.state.node as interface_.Cproperty;
						} else {
							return undefined;
						}
					})
					.then(context => {
						if (context?.properties.type.state.name === 'group') {
							return context.properties.type.state.node as interface_.Cgroup__type__property;
						} else {
							return undefined;
						}
					}).result;
				}).result!))
		}
		public get path() { return `<unknown>/group`; }
	}
}
export namespace Cstate {
	export class Dstate extends Reference<interface_.Cstates,string> {

		constructor(data:string, $this:Cstate) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.properties.state_group?.ref)
				.then(context => {
					const entry = context?.properties.states.get(this.entry)!;
					return resolve(entry).result;
				}).result!))
		}
		public get path() { return `<unknown>/state`; }
	}
	export class Dstate_group extends Reference<interface_.Cstate_group,string> {

		constructor(data:string, $this:Cstate) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.component_root.input.context_node())
				.then(context => {
					const entry = context?.properties.attributes.get(this.entry)!;
					return resolve(entry)
					.then(context => {
						if (context?.properties.type.state.name === 'property') {
							return context.properties.type.state.node as interface_.Cproperty;
						} else {
							return undefined;
						}
					})
					.then(context => {
						if (context?.properties.type.state.name === 'state group') {
							return context.properties.type.state.node as interface_.Cstate_group;
						} else {
							return undefined;
						}
					}).result;
				}).result!))
		}
		public get path() { return `<unknown>/state group`; }
	}
}
export namespace Cinterface_command {
	export class Darguments extends Ccommand_arguments {
		constructor(data:Tinterface_command['arguments'], parent:Cinterface_command) {
			super(data, parent, {
				parameter_definition: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.properties.command?.ref)
					.then(context => context?.properties.parameters).result!)
			})
		}
	}
	export class Dcommand extends Reference<interface_.Ccommand,string> {

		constructor(data:string, $this:Cinterface_command) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.properties.context_node)
				.then(context => context?.component_root.output.result_node())
				.then(context => {
					const entry = context?.properties.attributes.get(this.entry)!;
					return resolve(entry)
					.then(context => {
						if (context?.properties.type.state.name === 'command') {
							return context.properties.type.state.node as interface_.Ccommand;
						} else {
							return undefined;
						}
					}).result;
				}).result!))
		}
		public get path() { return `<unknown>/command`; }
	}
	export class Dcontext_keys extends Ccontext_keys__interface_command {
		constructor(data:Tinterface_command['context keys'], parent:Cinterface_command) {
			super(data, parent)
		}
	}
	export class Dcontext_node extends Cid_path {
		constructor(data:Tinterface_command['context node'], parent:Cinterface_command) {
			super(data, parent, {
				context_node: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.root.input.interface_)
					.then(context => context?.properties.root).result!)
			})
		}
	}
}
function finalize_entries(obj:Centries, detach:boolean = false) {
	finalize_command_arguments(obj.properties.arguments, detach);
}
function finalize_collection(obj:Ccollection, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Ccollection>obj.inferences.collection)(detach) !== undefined || detach);
	for (const entry of obj.properties.entries) {
		finalize_entries(entry, detach);
	}
	if (!detach) {
	}
}
function finalize_file(obj:Cfile, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cfile>obj.inferences.file)(detach) !== undefined || detach);
}
function finalize_group__type__properties(obj:Cgroup__type__properties, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cgroup__type__property>obj.inferences.group)(detach) !== undefined || detach);
	finalize_command_arguments(obj.properties.arguments, detach);
}
function finalize_integer(obj:Cinteger, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cinteger__set>obj.inferences.integer_type)(detach) !== undefined || detach);
}
function finalize_natural(obj:Cnatural, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnatural__set>obj.inferences.natural_type)(detach) !== undefined || detach);
}
function finalize_number(obj:Cnumber, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnumber>obj.inferences.number)(detach) !== undefined || detach);
	switch (obj.properties.type.state.name) {
		case 'integer': finalize_integer(obj.properties.type.state.node, detach); break;
		case 'natural': finalize_natural(obj.properties.type.state.node, detach); break;
	}
}
function finalize_state_group(obj:Cstate_group, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cstate_group>obj.inferences.state_group)(detach) !== undefined || detach);
	finalize_command_arguments(obj.properties.arguments, detach);
	assert((<(detach?:boolean) => interface_.Cstates>(obj.properties.state as any).resolve)(detach) !== undefined || detach);
}
function finalize_text(obj:Ctext, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Ctext>obj.inferences.text)(detach) !== undefined || detach);
}
function finalize_properties(obj:Cproperties, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cproperty>(obj.key as any).resolve)(detach) !== undefined || detach);
	switch (obj.properties.type.state.name) {
		case 'collection': finalize_collection(obj.properties.type.state.node, detach); break;
		case 'file': finalize_file(obj.properties.type.state.node, detach); break;
		case 'group': finalize_group__type__properties(obj.properties.type.state.node, detach); break;
		case 'number': finalize_number(obj.properties.type.state.node, detach); break;
		case 'state group': finalize_state_group(obj.properties.type.state.node, detach); break;
		case 'text': finalize_text(obj.properties.type.state.node, detach); break;
	}
}
function finalize_command_arguments(obj:Ccommand_arguments, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnode>obj.input.parameter_definition)(detach) !== undefined || detach);
	for (const [_key, entry] of obj.properties.properties) {
		finalize_properties(entry, detach);
	}
	if (!detach) {
		(obj.properties.properties as any).eval_required_keys(detach);
	}
}
function finalize_context_keys__context_keys(obj:Ccontext_keys__context_keys, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Ccontext_keys>(obj.key as any).resolve)(detach) !== undefined || detach);
}
function finalize_context_keys__interface_command(obj:Ccontext_keys__interface_command, detach:boolean = false) {
	for (const [_key, entry] of obj.properties.context_keys) {
		finalize_context_keys__context_keys(entry, detach);
	}
	if (!detach) {
		(obj.properties.context_keys as any).eval_required_keys(detach);
	}
}
function finalize_no(obj:Cno, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnode>obj.output.result_node)(detach) !== undefined || detach);
}
function finalize_collection_entry(obj:Ccollection_entry, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnode>obj.output.result_node)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Ccollection>(obj.properties.collection as any).resolve)(detach) !== undefined || detach);
}
function finalize_group__type__yes(obj:Cgroup__type__yes, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnode>obj.output.result_node)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cgroup__type__property>(obj.properties.group as any).resolve)(detach) !== undefined || detach);
}
function finalize_state(obj:Cstate, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnode>obj.output.result_node)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cstates>(obj.properties.state as any).resolve)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cstate_group>(obj.properties.state_group as any).resolve)(detach) !== undefined || detach);
}
function finalize_yes(obj:Cyes, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnode>obj.output.result_node)(detach) !== undefined || detach);
	finalize_id_path(obj.properties.tail, detach);
	switch (obj.properties.type.state.name) {
		case 'collection entry': finalize_collection_entry(obj.properties.type.state.node, detach); break;
		case 'group': finalize_group__type__yes(obj.properties.type.state.node, detach); break;
		case 'state': finalize_state(obj.properties.type.state.node, detach); break;
	}
}
function finalize_id_path(obj:Cid_path, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnode>obj.input.context_node)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnode>obj.output.result_node)(detach) !== undefined || detach);
	switch (obj.properties.has_steps.state.name) {
		case 'no': finalize_no(obj.properties.has_steps.state.node, detach); break;
		case 'yes': finalize_yes(obj.properties.has_steps.state.node, detach); break;
	}
}
function finalize_interface_command(obj:Cinterface_command, detach:boolean = false) {
	finalize_command_arguments(obj.properties.arguments, detach);
	assert((<(detach?:boolean) => interface_.Ccommand>(obj.properties.command as any).resolve)(detach) !== undefined || detach);
	finalize_context_keys__interface_command(obj.properties.context_keys, detach);
	finalize_id_path(obj.properties.context_node, detach);
}

export namespace Cinterface_command {
	export function create(init:Tinterface_command, input: {
	'interface_':interface_.Cinterface}):Cinterface_command {
		const instance = new Cinterface_command(init, input as any);
		finalize_interface_command(instance);
		return instance;
	};
}
