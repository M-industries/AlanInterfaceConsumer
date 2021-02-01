import * as interface_ from './alan_api';

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
	protected _root:Cinterface|undefined;
	public abstract get root():Cinterface;
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
export type Twhere_clause = {
	'has rule':'no'|['no', {}]|['yes', Tyes__has_rule];
	'rules':Record<string, Trules>;
};
export class Cwhere_clause extends AlanNode {
	public readonly properties:{
		readonly has_rule:Cwhere_clause.Dhas_rule<
			{ name: 'no', node:Cno__has_rule, init:Tno__has_rule}|
			{ name: 'yes', node:Cyes__has_rule, init:Tyes__has_rule}>,
		readonly rules:Cwhere_clause.Drules
	};
	constructor(init:Twhere_clause, public location:AlanNode, public input: {
		context: () => interface_.Coptional_navigation_context,
		context_phase: () => interface_.Cevaluation_phase,
		this_: () => interface_.Coptional_target_context
	}) {
		super();
		const $this = this;
		this.properties = {
			has_rule: new Cwhere_clause.Dhas_rule(init['has rule'], $this),
			rules: new Cwhere_clause.Drules(init['rules'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.location.root); }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/where clause`; }
	public get entity() { return this.location.entity; }
}
export type Tno__has_rule = {
};
export class Cno__has_rule extends AlanNode {
	constructor(init:Tno__has_rule, public parent:Cwhere_clause) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has rule?no`; }
	public get entity() { return this.parent.entity; }
}
export type Tyes__has_rule = {
	'first':string;
};
export class Cyes__has_rule extends AlanNode {
	public readonly properties:{
		readonly first:Cyes__has_rule.Dfirst
	};
	constructor(init:Tyes__has_rule, public parent:Cwhere_clause) {
		super();
		const $this = this;
		this.properties = {
			first: new Cyes__has_rule.Dfirst(init['first'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has rule?yes`; }
	public get entity() { return this.parent.entity; }
}
export type Trules = {
	'context':['context', Tcontext]|['sibling rule', Tsibling_rule];
	'evaluation':Toptional_evaluation_annotation;
	'has successor':'no'|['no', {}]|['yes', Tyes__has_successor];
	'tail':Tnode_path_tail;
};
export class Crules extends AlanGraphVertex {
	public key:string;
	public get key_value() { return this.key; }
	_edges: {
		'dependencies': Set<AlanGraphEdge<Crules>>,
		'order': Set<AlanGraphEdge<Crules>>
	} = {
		'dependencies': new Set(),
		'order': new Set()
	}; /** @internal */
	public readonly properties:{
		readonly context:Crules.Dcontext<
			{ name: 'context', node:Ccontext, init:Tcontext}|
			{ name: 'sibling rule', node:Csibling_rule, init:Tsibling_rule}>,
		readonly evaluation:Coptional_evaluation_annotation,
		readonly has_successor:Crules.Dhas_successor<
			{ name: 'no', node:Cno__has_successor, init:Tno__has_successor}|
			{ name: 'yes', node:Cyes__has_successor, init:Tyes__has_successor}>,
		readonly tail:Cnode_path_tail
	};
	constructor(key:string, init:Trules, public parent:Cwhere_clause) {
		super();
		const $this = this;
		this.key = key;
		this.properties = {
			context: new Crules.Dcontext(init['context'], $this),
			evaluation: new Crules.Devaluation(init['evaluation'], $this),
			has_successor: new Crules.Dhas_successor(init['has successor'], $this),
			tail: new Crules.Dtail(init['tail'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/rules[${this.key}]`; }
	public get entity() { return this; }
}
export type Tcontext = {
	'path':Tcontext_node_path;
};
export class Ccontext extends AlanNode {
	public readonly properties:{
		readonly path:Ccontext_node_path
	};
	public readonly output:{
		context: () => interface_.Cnavigation_context;
		phase: () => interface_.Cevaluation_phase;
	} = {
		context: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.path)
			.then(context => context?.component_root.output.context()).result!),
		phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.path)
			.then(context => context?.component_root.output.phase()).result!)
	}
	constructor(init:Tcontext, public parent:Crules) {
		super();
		const $this = this;
		this.properties = {
			path: new Ccontext.Dpath(init['path'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/context?context`; }
	public get entity() { return this.parent.entity; }
}
export type Tsibling_rule = {
	'rule':string;
};
export class Csibling_rule extends AlanNode {
	public readonly properties:{
		readonly rule:Csibling_rule.Drule
	};
	public readonly output:{
		context: () => interface_.Cnavigation_context;
		phase: () => interface_.Cevaluation_phase;
	} = {
		context: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.rule?.ref)
			.then(context => context?.properties.tail)
			.then(context => context?.component_root.output.context())
			.then(context => context?.component_root.output.node())
			.then(context => {
				const conv_context = resolve(context).result!;
				return new Cnavigation_context({name: 'node', definition: conv_context});
			}).result!),
		phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.rule?.inferences.evaluation()).result!)
	}
	constructor(init:Tsibling_rule, public parent:Crules) {
		super();
		const $this = this;
		this.properties = {
			rule: new Csibling_rule.Drule(init['rule'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/context?sibling rule`; }
	public get entity() { return this.parent.entity; }
}
export type Tno__has_successor = {
};
export class Cno__has_successor extends AlanNode {
	constructor(init:Tno__has_successor, public parent:Crules) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/has successor?no`; }
	public get entity() { return this.parent.entity; }
}
export type Tyes__has_successor = {
	'rule':string;
};
export class Cyes__has_successor extends AlanNode {
	public readonly properties:{
		readonly rule:Cyes__has_successor.Drule
	};
	constructor(init:Tyes__has_successor, public parent:Crules) {
		super();
		const $this = this;
		this.properties = {
			rule: new Cyes__has_successor.Drule(init['rule'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/has successor?yes`; }
	public get entity() { return this.parent.entity; }
}
type Vnode_location = { name: 'group', definition: Cgroup__type__property}|{ name: 'state', definition: Cstates}|{ name: 'collection', definition: Ccollection}|{ name: 'root', definition: Croot_location}
export class Cnode_location extends AlanStruct {
	constructor(
		public readonly variant:Vnode_location, public input: {
			member: () => interface_.Cmember,
			node: () => interface_.Cnode_parent,
			root: () => interface_.Croot_location
		}) { super(); }
	public readonly output:{
		member: () => interface_.Cmember;
		node: () => interface_.Cnode_parent;
		root: () => interface_.Croot_location;
	} = {
		member: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.member()).result!),
		node: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.node()).result!),
		root: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.root()).result!)
	};
	public cast<K extends Vnode_location['name']>(_variant:K):Extract<Vnode_location, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vnode_location['name']]:(($:Extract<Vnode_location, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/node location`; }
	public is(other:Cnode_location):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
type Vroot_location = { name: 'command', definition: Ccommand}|{ name: 'dataset', definition: Cinterface}
export class Croot_location extends AlanStruct {
	constructor(
		public readonly variant:Vroot_location) { super(); }
	public definitions:{
		node_location: Cnode_location;
	} = {
		node_location: new Cnode_location({name:'root', definition: this}, {
			member: cache((detach:boolean) => resolve(this)
				.then(() => this)
				.then(() => interface_.Cmember.Proot).result!),
			node: cache((detach:boolean) => resolve(this)
				.then(() => this)
				.then(() => interface_.Cnode_parent.Pnone).result!),
			root: cache((detach:boolean) => resolve(this)
				.then(() => this).result!)
		})
	}
	public cast<K extends Vroot_location['name']>(_variant:K):Extract<Vroot_location, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vroot_location['name']]:(($:Extract<Vroot_location, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/root location`; }
	public is(other:Croot_location):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
type Vreference__interface = { name: 'undefined', definition: (typeof Creference__interface.Pundefined)}|{ name: 'defined', definition: Creferencer}
export class Creference__interface extends AlanStruct {
	public static Pundefined:Creference__interface = new class PrimitiveInstance extends Creference__interface {
		constructor () {
			super({name: 'undefined', definition: undefined as unknown as Creference__interface})
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Vreference__interface) { super(); }
	public cast<K extends Vreference__interface['name']>(_variant:K):Extract<Vreference__interface, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vreference__interface['name']]:(($:Extract<Vreference__interface, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/reference`; }
	public is(other:Creference__interface):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
export import Cundefined = interface_.Creference__interface;
export type Treferencer = {
	'evaluation':Texplicit_evaluation_annotation;
	'path':Tpath;
	'rules':Twhere_clause;
	'tail':Tnode_path_tail;
	'type':['sibling', Tsibling]|['unrestricted', Tunrestricted];
};
export class Creferencer extends AlanNode {
	public definitions:{
		reference: Creference__interface;
	} = {
		reference: new Creference__interface({name:'defined', definition: this})
	}
	public readonly properties:{
		readonly evaluation:Cexplicit_evaluation_annotation,
		readonly path:Cpath,
		readonly rules:Cwhere_clause,
		readonly tail:Cnode_path_tail,
		readonly type:Creferencer.Dtype<
			{ name: 'sibling', node:Csibling, init:Tsibling}|
			{ name: 'unrestricted', node:Cunrestricted, init:Tunrestricted}>
	};
	public readonly output:{
		phase: () => interface_.Cevaluation_phase;
		referenced_node: () => interface_.Cnode;
	} = {
		phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.evaluation)
			.then(context => context?.component_root.output.phase()).result!),
		referenced_node: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.tail)
			.then(context => context?.component_root.output.context())
			.then(context => context?.component_root.output.node()).result!)
	};
	constructor(init:Treferencer, public location:AlanNode, public input: {
		this_: () => interface_.Cattributes
	}) {
		super();
		const $this = this;
		this.properties = {
			evaluation: new Creferencer.Devaluation(init['evaluation'], $this),
			path: new Cpath(init['path'], $this),
			rules: new Creferencer.Drules(init['rules'], $this),
			tail: new Creferencer.Dtail(init['tail'], $this),
			type: new Creferencer.Dtype(init['type'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.location.root); }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/referencer`; }
	public get entity() { return this.location.entity; }
}
export type Tpath = {
	'head':Tcontext_node_path;
	'tail':Tnode_path_tail;
};
export class Cpath extends AlanNode {
	public readonly properties:{
		readonly head:Ccontext_node_path,
		readonly tail:Cnode_path_tail
	};
	constructor(init:Tpath, public parent:Creferencer) {
		super();
		const $this = this;
		this.properties = {
			head: new Cpath.Dhead(init['head'], $this),
			tail: new Cpath.Dtail(init['tail'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/path`; }
	public get entity() { return this.parent.entity; }
}
export type Tsibling = {
	'graph participation':'no'|['no', {}]|['yes', Tyes__graph_participation];
};
export class Csibling extends AlanNode {
	public readonly properties:{
		readonly graph_participation:Csibling.Dgraph_participation<
			{ name: 'no', node:Cno__graph_participation, init:Tno__graph_participation}|
			{ name: 'yes', node:Cyes__graph_participation, init:Tyes__graph_participation}>
	};
	public readonly output:{
		collection: () => interface_.Ccollection;
	} = {
		collection: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.inferences.collection()).result!)
	}
	public readonly inferences:{
		collection: () => interface_.Ccollection
	} = {
		collection: cache((detach:boolean) => {
			const interface__referencer__type__sibling_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.properties.path)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.context())
				.then(context => context?.component_root.output.node())
				.then(context => context?.component_root.output.location())
				.then(context => context?.variant.name === 'collection' ? context.variant.definition as interface_.Ccollection : undefined).result!;
		})

	}
	constructor(init:Tsibling, public parent:Creferencer) {
		super();
		const $this = this;
		this.properties = {
			graph_participation: new Csibling.Dgraph_participation(init['graph participation'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/type?sibling`; }
	public get entity() { return this.parent.entity; }
}
export type Tno__graph_participation = {
};
export class Cno__graph_participation extends AlanNode {
	constructor(init:Tno__graph_participation, public parent:Csibling) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/graph participation?no`; }
	public get entity() { return this.parent.entity; }
}
export type Tyes__graph_participation = {
	'graphs':Record<string, {}>;
};
export class Cyes__graph_participation extends AlanNode {
	public readonly properties:{
		readonly graphs:Cyes__graph_participation.Dgraphs
	};
	public readonly inferences:{
		head_result_ancestor: () => interface_.Cattributes
	} = {
		head_result_ancestor: cache((detach:boolean) => {
			const interface__referencer__type__sibling__graph_participation__yes_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.parent)
				.then(context => context?.properties.path)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.context())
				.then(context => context?.variant.name === 'attribute' ? context.variant.definition as interface_.Cattributes : undefined).result!;
		})

	}
	constructor(init:Tyes__graph_participation, public parent:Csibling) {
		super();
		const $this = this;
		this.properties = {
			graphs: new Cyes__graph_participation.Dgraphs(init['graphs'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/graph participation?yes`; }
	public get entity() { return this.parent.entity; }
}
export class Kgraphs__yes extends Reference<interface_.Cgraphs__graphs_definition, string> {
	constructor(key:string, $this:Cgraphs__yes) {
		super(key, cache((detach:boolean) => resolve($this.parent)
			.then(() => $this.parent)
			.then(context => context?.parent)
			.then(context => context?.inferences.collection())
			.then(context => context?.properties.graphs)
			.then(context => {
				const entry = context?.properties.graphs.get(this.entry)!;
				return resolve(entry).result;
			}).result!))
	}
	public get path() { return `<unknown>/graphs/key`; }
}
export type Tgraphs__yes = {
};
export class Cgraphs__yes extends AlanDictionaryEntry {
	public key:Kgraphs__yes;
	public get key_value() { return this.key.entry; }
	constructor(key:string, init:Tgraphs__yes, public parent:Cyes__graph_participation) {
		super();
		const $this = this;
		this.key = new Kgraphs__yes(key, $this);
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/graphs[${this.key.entry}]`; }
	public get entity() { return this; }
}
export type Tunrestricted = {
	'collection step':Tproperty_step;
};
export class Cunrestricted extends AlanNode {
	public readonly properties:{
		readonly collection_step:Cproperty_step & { readonly inferences: {
			collection: () => interface_.Ccollection;
		} }
	};
	public readonly output:{
		collection: () => interface_.Ccollection;
	} = {
		collection: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.collection_step?.inferences.collection()).result!)
	}
	constructor(init:Tunrestricted, public parent:Creferencer) {
		super();
		const $this = this;
		this.properties = {
			collection_step: new Cunrestricted.Dcollection_step(init['collection step'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/type?unrestricted`; }
	public get entity() { return this.parent.entity; }
}
export type Treference_property_step = {
	'property':Tproperty_step;
};
export class Creference_property_step extends AlanNode {
	public readonly properties:{
		readonly property:Cproperty_step & { readonly inferences: {
			existing_entry: () => interface_.Cexisting;
			reference: () => interface_.Cyes__has_constraint;
			text: () => interface_.Ctext;
		} }
	};
	public readonly output:{
		referencer: () => interface_.Creferencer;
	} = {
		referencer: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.property?.inferences.reference())
			.then(context => context?.properties.referencer).result!)
	};
	constructor(init:Treference_property_step, public location:AlanNode, public input: {
		context: () => interface_.Cnavigation_context,
		context_phase: () => interface_.Cevaluation_phase
	}) {
		super();
		const $this = this;
		this.properties = {
			property: new Creference_property_step.Dproperty(init['property'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.location.root); }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/reference property step`; }
	public get entity() { return this.location.entity; }
}
export type Tproperty_step = {
	'property':string;
};
export class Cproperty_step extends AlanNode {
	public readonly properties:{
		readonly property:Cproperty_step.Dproperty
	};
	public readonly output:{
		property: () => interface_.Cproperty;
	} = {
		property: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.property?.ref).result!)
	};
	constructor(init:Tproperty_step, public location:AlanNode, public input: {
		context: () => interface_.Cnavigation_context,
		context_phase: () => interface_.Cevaluation_phase
	}) {
		super();
		const $this = this;
		this.properties = {
			property: new Cproperty_step.Dproperty(init['property'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.location.root); }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/property step`; }
	public get entity() { return this.location.entity; }
}
type Vparticipation = { name: 'singular', definition: (typeof Cparticipation.Psingular)}|{ name: 'conditional', definition: (typeof Cparticipation.Pconditional)}
export class Cparticipation extends AlanStruct {
	public static Psingular:Cparticipation = new class PrimitiveInstance extends Cparticipation {
		constructor () {
			super({name: 'singular', definition: undefined as unknown as Cparticipation})
			this.variant.definition = this;
		}
	}
	public static Pconditional:Cparticipation = new class PrimitiveInstance extends Cparticipation {
		constructor () {
			super({name: 'conditional', definition: undefined as unknown as Cparticipation})
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Vparticipation) { super(); }
	public cast<K extends Vparticipation['name']>(_variant:K):Extract<Vparticipation, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vparticipation['name']]:(($:Extract<Vparticipation, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/participation`; }
	public is(other:Cparticipation):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
export import Cconditional = interface_.Cparticipation;
export import Csingular = interface_.Cparticipation;
type Voptional_target_context = { name: 'inaccessible', definition: (typeof Coptional_target_context.Pinaccessible)}|{ name: 'member', definition: Cmember}
export class Coptional_target_context extends AlanStruct {
	public static Pinaccessible:Coptional_target_context = new class PrimitiveInstance extends Coptional_target_context {
		constructor () {
			super({name: 'inaccessible', definition: undefined as unknown as Coptional_target_context})
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Voptional_target_context) { super(); }
	public cast<K extends Voptional_target_context['name']>(_variant:K):Extract<Voptional_target_context, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Voptional_target_context['name']]:(($:Extract<Voptional_target_context, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/optional target context`; }
	public is(other:Coptional_target_context):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
export import Cinaccessible = interface_.Coptional_target_context;
type Voptional_navigation_context = { name: 'none', definition: (typeof Coptional_navigation_context.Pnone)}|{ name: 'context', definition: Cnavigation_context}
export class Coptional_navigation_context extends AlanStruct {
	public static Pnone:Coptional_navigation_context = new class PrimitiveInstance extends Coptional_navigation_context {
		constructor () {
			super({name: 'none', definition: undefined as unknown as Coptional_navigation_context})
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Voptional_navigation_context) { super(); }
	public cast<K extends Voptional_navigation_context['name']>(_variant:K):Extract<Voptional_navigation_context, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Voptional_navigation_context['name']]:(($:Extract<Voptional_navigation_context, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/optional navigation context`; }
	public is(other:Coptional_navigation_context):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
export import Cnone__optional_navigation_context = interface_.Coptional_navigation_context;
export type Toptional_evaluation_annotation = {
	'phase':'downstream'|['downstream', {}]|'inherited'|['inherited', {}];
};
export class Coptional_evaluation_annotation extends AlanNode {
	public readonly properties:{
		readonly phase:Coptional_evaluation_annotation.Dphase<
			{ name: 'downstream', node:Cdownstream__phase__optional_evaluation_annotation, init:Tdownstream__phase__optional_evaluation_annotation}|
			{ name: 'inherited', node:Cinherited, init:Tinherited}>
	};
	public readonly output:{
		phase: () => interface_.Cevaluation_phase;
	} = {
		phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.phase?.state.node.output.phase()).result!)
	};
	constructor(init:Toptional_evaluation_annotation, public location:AlanNode, public input: {
		context: () => interface_.Coptional_navigation_context,
		context_phase: () => interface_.Cevaluation_phase
	}) {
		super();
		const $this = this;
		this.properties = {
			phase: new Coptional_evaluation_annotation.Dphase(init['phase'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.location.root); }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/optional evaluation annotation`; }
	public get entity() { return this.location.entity; }
}
export type Tdownstream__phase__optional_evaluation_annotation = {
};
export class Cdownstream__phase__optional_evaluation_annotation extends AlanNode {
	public readonly output:{
		phase: () => interface_.Cevaluation_phase;
	} = {
		phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(() => interface_.Cevaluation_phase.Pdownstream_expressions).result!)
	}
	public readonly inferences:{
		no_referenced_context: () => interface_.Cnone__optional_navigation_context
	} = {
		no_referenced_context: cache((detach:boolean) => {
			const interface__optional_evaluation_annotation__phase__downstream_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.component_root.input.context())
				.then(context => context?.variant.name === 'none' ? context.variant.definition as interface_.Cnone__optional_navigation_context : undefined).result!;
		})

	}
	constructor(init:Tdownstream__phase__optional_evaluation_annotation, public parent:Coptional_evaluation_annotation) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/phase?downstream`; }
	public get entity() { return this.parent.entity; }
}
export type Tinherited = {
};
export class Cinherited extends AlanNode {
	public readonly output:{
		phase: () => interface_.Cevaluation_phase;
	} = {
		phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.context_phase()).result!)
	}
	constructor(init:Tinherited, public parent:Coptional_evaluation_annotation) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/phase?inherited`; }
	public get entity() { return this.parent.entity; }
}
export type Tnumber_type = {
	'decimal places':'no'|['no', {}]|['yes', Tyes__decimal_places];
	'set':'integer'|['integer', {}]|'natural'|['natural', {}];
	'type':string;
};
export class Cnumber_type extends AlanNode {
	public readonly properties:{
		readonly decimal_places:Cnumber_type.Ddecimal_places<
			{ name: 'no', node:Cno__decimal_places, init:Tno__decimal_places}|
			{ name: 'yes', node:Cyes__decimal_places, init:Tyes__decimal_places}>,
		readonly set:Cnumber_type.Dset<
			{ name: 'integer', node:Cinteger__set, init:Tinteger__set}|
			{ name: 'natural', node:Cnatural__set, init:Tnatural__set}>,
		readonly type:Cnumber_type.Dtype
	};
	constructor(init:Tnumber_type, public location:AlanNode) {
		super();
		const $this = this;
		this.properties = {
			decimal_places: new Cnumber_type.Ddecimal_places(init['decimal places'], $this),
			set: new Cnumber_type.Dset(init['set'], $this),
			type: new Cnumber_type.Dtype(init['type'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.location.root); }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/number type`; }
	public get entity() { return this.location.entity; }
}
export type Tno__decimal_places = {
};
export class Cno__decimal_places extends AlanNode {
	constructor(init:Tno__decimal_places, public parent:Cnumber_type) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/decimal places?no`; }
	public get entity() { return this.parent.entity; }
}
export type Tyes__decimal_places = {
	'places':number;
};
export class Cyes__decimal_places extends AlanNode {
	public readonly properties:{
		readonly places:Cyes__decimal_places.Dplaces
	};
	constructor(init:Tyes__decimal_places, public parent:Cnumber_type) {
		super();
		const $this = this;
		this.properties = {
			places: new Cyes__decimal_places.Dplaces(init['places'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/decimal places?yes`; }
	public get entity() { return this.parent.entity; }
}
export type Tinteger__set = {
};
export class Cinteger__set extends AlanNode {
	public readonly output:{
		set_type: () => interface_.Cnumber_set_type;
	} = {
		set_type: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(() => interface_.Cnumber_set_type.Pinteger).result!)
	}
	constructor(init:Tinteger__set, public parent:Cnumber_type) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/set?integer`; }
	public get entity() { return this.parent.entity; }
}
export type Tnatural__set = {
};
export class Cnatural__set extends AlanNode {
	public readonly output:{
		set_type: () => interface_.Cnumber_set_type;
	} = {
		set_type: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(() => interface_.Cnumber_set_type.Pnatural).result!)
	}
	constructor(init:Tnatural__set, public parent:Cnumber_type) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/set?natural`; }
	public get entity() { return this.parent.entity; }
}
type Vnumber_set_type = { name: 'natural', definition: (typeof Cnumber_set_type.Pnatural)}|{ name: 'integer', definition: (typeof Cnumber_set_type.Pinteger)}
export class Cnumber_set_type extends AlanStruct {
	public static Pnatural:Cnumber_set_type = new class PrimitiveInstance extends Cnumber_set_type {
		constructor () {
			super({name: 'natural', definition: undefined as unknown as Cnumber_set_type})
			this.variant.definition = this;
		}
	}
	public static Pinteger:Cnumber_set_type = new class PrimitiveInstance extends Cnumber_set_type {
		constructor () {
			super({name: 'integer', definition: undefined as unknown as Cnumber_set_type})
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Vnumber_set_type) { super(); }
	public cast<K extends Vnumber_set_type['name']>(_variant:K):Extract<Vnumber_set_type, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vnumber_set_type['name']]:(($:Extract<Vnumber_set_type, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/number set type`; }
	public is(other:Cnumber_set_type):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
export import Cinteger__number_set_type = interface_.Cnumber_set_type;
export import Cnatural__number_set_type = interface_.Cnumber_set_type;
export type Tnode_path_tail = {
	'has steps':'no'|['no', {}]|['yes', Tyes__has_steps];
};
export class Cnode_path_tail extends AlanNode {
	public readonly properties:{
		readonly has_steps:Cnode_path_tail.Dhas_steps<
			{ name: 'no', node:Cno__has_steps, init:Tno__has_steps}|
			{ name: 'yes', node:Cyes__has_steps, init:Tyes__has_steps}>
	};
	public readonly output:{
		context: () => interface_.Cnavigation_context;
		context_phase: () => interface_.Cevaluation_phase;
	} = {
		context: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.has_steps?.state.node.output.context()).result!),
		context_phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.has_steps?.state.node.output.context_phase()).result!)
	};
	constructor(init:Tnode_path_tail, public location:AlanNode, public input: {
		context: () => interface_.Cnavigation_context,
		context_phase: () => interface_.Cevaluation_phase,
		dependency_step: () => interface_.Cdependency_step,
		participation: () => interface_.Cparticipation
	}) {
		super();
		const $this = this;
		this.properties = {
			has_steps: new Cnode_path_tail.Dhas_steps(init['has steps'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.location.root); }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/node path tail`; }
	public get entity() { return this.location.entity; }
}
export type Tno__has_steps = {
};
export class Cno__has_steps extends AlanNode {
	public readonly output:{
		context: () => interface_.Cnavigation_context;
		context_phase: () => interface_.Cevaluation_phase;
	} = {
		context: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.context()).result!),
		context_phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.context_phase()).result!)
	}
	constructor(init:Tno__has_steps, public parent:Cnode_path_tail) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has steps?no`; }
	public get entity() { return this.parent.entity; }
}
export type Tyes__has_steps = {
	'tail':Tnode_path_tail;
	'type':['group', Tgroup__type__yes]|'parent'|['parent', {}]|['reference', Treference__type]|['reference rule', Treference_rule]|['state', Tstate]|['state context rule', Tstate_context_rule];
};
export class Cyes__has_steps extends AlanNode {
	public readonly properties:{
		readonly tail:Cnode_path_tail,
		readonly type:Cyes__has_steps.Dtype<
			{ name: 'group', node:Cgroup__type__yes, init:Tgroup__type__yes}|
			{ name: 'parent', node:Cparent, init:Tparent}|
			{ name: 'reference', node:Creference__type, init:Treference__type}|
			{ name: 'reference rule', node:Creference_rule, init:Treference_rule}|
			{ name: 'state', node:Cstate, init:Tstate}|
			{ name: 'state context rule', node:Cstate_context_rule, init:Tstate_context_rule}>
	};
	public readonly output:{
		context: () => interface_.Cnavigation_context;
		context_phase: () => interface_.Cevaluation_phase;
	} = {
		context: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.tail)
			.then(context => context?.component_root.output.context()).result!),
		context_phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.tail)
			.then(context => context?.component_root.output.context_phase()).result!)
	}
	constructor(init:Tyes__has_steps, public parent:Cnode_path_tail) {
		super();
		const $this = this;
		this.properties = {
			tail: new Cyes__has_steps.Dtail(init['tail'], $this),
			type: new Cyes__has_steps.Dtype(init['type'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has steps?yes`; }
	public get entity() { return this.parent.entity; }
}
export type Tgroup__type__yes = {
	'group step':Tproperty_step;
};
export class Cgroup__type__yes extends AlanNode {
	public readonly properties:{
		readonly group_step:Cproperty_step & { readonly inferences: {
			group: () => interface_.Cgroup__type__property;
		} }
	};
	public readonly output:{
		context: () => interface_.Cnavigation_context;
		context_phase: () => interface_.Cevaluation_phase;
		dependency_step: () => interface_.Cdependency_step;
	} = {
		context: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.group_step?.inferences.group())
			.then(context => context?.properties.node)
			.then(context => {
				const conv_context = resolve(context).result!;
				return new Cnavigation_context({name: 'node', definition: conv_context});
			}).result!),
		context_phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.context_phase()).result!),
		dependency_step: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.dependency_step()).result!)
	}
	constructor(init:Tgroup__type__yes, public parent:Cyes__has_steps) {
		super();
		const $this = this;
		this.properties = {
			group_step: new Cgroup__type__yes.Dgroup_step(init['group step'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?group`; }
	public get entity() { return this.parent.entity; }
}
export type Tparent = {
};
export class Cparent extends AlanNode {
	public readonly output:{
		context: () => interface_.Cnavigation_context;
		context_phase: () => interface_.Cevaluation_phase;
		dependency_step: () => interface_.Cdependency_step;
	} = {
		context: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.inferences.parent_context()).result!),
		context_phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.context_phase()).result!),
		dependency_step: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.dependency_step()).result!)
	}
	public readonly inferences:{
		parent_context: () => interface_.Cnavigation_context,
		parent_entity: () => interface_.Centity
	} = {
		parent_context: cache((detach:boolean) => {
			const interface__node_path_tail__has_steps__yes__type__parent_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.component_root.input.context())
				.then(context => {
					switch (context?.variant.name) {
						case 'attribute': {
							const interface__node_path_tail__has_steps__yes__type__parent_inf___parent_context___attribute_nval = context.cast('attribute');
							return resolve(context)
								.then(context => interface__node_path_tail__has_steps__yes__type__parent_inf___parent_context___attribute_nval)
								.then(context => context?.component_root.output.location())
								.then(context => context?.component_root.output.member())
								.then(context => context?.variant.name === 'attribute' ? context.variant.definition as interface_.Cattributes : undefined)
								.then(context => {
									const conv_context = resolve(context).result!;
									return new Cnavigation_context({name: 'attribute', definition: conv_context});
								}).result;
						}
						case 'node': {
							const interface__node_path_tail__has_steps__yes__type__parent_inf___parent_context___node_nval = context.cast('node');
							return resolve(context)
								.then(context => interface__node_path_tail__has_steps__yes__type__parent_inf___parent_context___node_nval)
								.then(context => context?.component_root.output.location())
								.then(context => context?.component_root.output.node())
								.then(context => context?.variant.name === 'node' ? context.variant.definition as interface_.Cnode : undefined)
								.then(context => {
									const conv_context = resolve(context).result!;
									return new Cnavigation_context({name: 'node', definition: conv_context});
								}).result;
						}
						case undefined: return undefined;
						default: throw new Error(`Unexpected subtype '${(<any>context).variant.name}'`);
					};
				}).result!;
		})
		,
		parent_entity: cache((detach:boolean) => {
			const interface__node_path_tail__has_steps__yes__type__parent_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.component_root.input.context())
				.then(context => {
					switch (context?.variant.name) {
						case 'attribute': {
							return resolve(context)
								.then(() => this.inferences.parent_context())
								.then(context => context?.component_root.output.node())
								.then(context => context?.component_root.output.entity()).result;
						}
						case 'node': {
							return resolve(context)
								.then(context => {
									const left = resolve(context)
										.then(() => this.inferences.parent_context())
										.then(context => context?.component_root.output.node())
										.then(context => context?.component_root.output.entity()).result;
									const right = resolve(context)
										.then(() => this.parent)
										.then(context => context?.component_root.input.context())
										.then(context => context?.component_root.output.node())
										.then(context => context?.component_root.output.entity()).result;
									return left?.is(right) ? left : undefined
								}).result;
						}
						case undefined: return undefined;
						default: throw new Error(`Unexpected subtype '${(<any>context).variant.name}'`);
					};
				}).result!;
		})

	}
	constructor(init:Tparent, public parent:Cyes__has_steps) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?parent`; }
	public get entity() { return this.parent.entity; }
}
export type Treference__type = {
	'reference':Treference_property_step;
};
export class Creference__type extends AlanNode {
	public readonly properties:{
		readonly reference:Creference_property_step & { readonly inferences: {
			evaluation: () => interface_.Cevaluation_phase;
		} }
	};
	public readonly output:{
		context: () => interface_.Cnavigation_context;
		context_phase: () => interface_.Cevaluation_phase;
		dependency_step: () => interface_.Cdependency_step;
	} = {
		context: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.reference)
			.then(context => context?.component_root.output.referencer())
			.then(context => context?.component_root.output.referenced_node())
			.then(context => {
				const conv_context = resolve(context).result!;
				return new Cnavigation_context({name: 'node', definition: conv_context});
			}).result!),
		context_phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.reference?.inferences.evaluation()).result!),
		dependency_step: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.dependency_step()).result!)
	}
	public readonly inferences:{
		dependency_allowed: () => interface_.Callowed
	} = {
		dependency_allowed: cache((detach:boolean) => {
			const interface__node_path_tail__has_steps__yes__type__reference_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.component_root.input.dependency_step())
				.then(context => context?.variant.name === 'allowed' ? context.variant.definition as interface_.Callowed : undefined).result!;
		})

	}
	constructor(init:Treference__type, public parent:Cyes__has_steps) {
		super();
		const $this = this;
		this.properties = {
			reference: new Creference__type.Dreference(init['reference'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?reference`; }
	public get entity() { return this.parent.entity; }
}
export type Treference_rule = {
	'reference':Treference_property_step;
	'rule':string;
};
export class Creference_rule extends AlanNode {
	public readonly properties:{
		readonly reference:Creference_property_step,
		readonly rule:Creference_rule.Drule
	};
	public readonly output:{
		context: () => interface_.Cnavigation_context;
		context_phase: () => interface_.Cevaluation_phase;
		dependency_step: () => interface_.Cdependency_step;
	} = {
		context: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.rule?.ref)
			.then(context => context?.properties.tail)
			.then(context => context?.component_root.output.context())
			.then(context => context?.component_root.output.node())
			.then(context => {
				const conv_context = resolve(context).result!;
				return new Cnavigation_context({name: 'node', definition: conv_context});
			}).result!),
		context_phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.rule?.inferences.evaluation()).result!),
		dependency_step: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.dependency_step()).result!)
	}
	public readonly inferences:{
		dependency_allowed: () => interface_.Callowed
	} = {
		dependency_allowed: cache((detach:boolean) => {
			const interface__node_path_tail__has_steps__yes__type__reference_rule_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.component_root.input.dependency_step())
				.then(context => context?.variant.name === 'allowed' ? context.variant.definition as interface_.Callowed : undefined).result!;
		})

	}
	constructor(init:Treference_rule, public parent:Cyes__has_steps) {
		super();
		const $this = this;
		this.properties = {
			reference: new Creference_rule.Dreference(init['reference'], $this),
			rule: new Creference_rule.Drule(init['rule'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?reference rule`; }
	public get entity() { return this.parent.entity; }
}
export type Tstate = {
	'state':string;
	'state group step':Tproperty_step;
};
export class Cstate extends AlanNode {
	public readonly properties:{
		readonly state:Cstate.Dstate,
		readonly state_group_step:Cproperty_step & { readonly inferences: {
			state_group: () => interface_.Cstate_group;
		} }
	};
	public readonly output:{
		context: () => interface_.Cnavigation_context;
		context_phase: () => interface_.Cevaluation_phase;
		dependency_step: () => interface_.Cdependency_step;
	} = {
		context: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.state?.ref)
			.then(context => context?.properties.node)
			.then(context => {
				const conv_context = resolve(context).result!;
				return new Cnavigation_context({name: 'node', definition: conv_context});
			}).result!),
		context_phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.context_phase()).result!),
		dependency_step: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(() => interface_.Cdependency_step.Pdisallowed).result!)
	}
	public readonly inferences:{
		conditional_result: () => interface_.Cconditional
	} = {
		conditional_result: cache((detach:boolean) => {
			const interface__node_path_tail__has_steps__yes__type__state_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.component_root.input.participation())
				.then(context => context?.variant.name === 'conditional' ? context.variant.definition as interface_.Cconditional : undefined).result!;
		})

	}
	constructor(init:Tstate, public parent:Cyes__has_steps) {
		super();
		const $this = this;
		this.properties = {
			state: new Cstate.Dstate(init['state'], $this),
			state_group_step: new Cstate.Dstate_group_step(init['state group step'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state`; }
	public get entity() { return this.parent.entity; }
}
export type Tstate_context_rule = {
	'context rule':string;
};
export class Cstate_context_rule extends AlanNode {
	public readonly properties:{
		readonly context_rule:Cstate_context_rule.Dcontext_rule
	};
	public readonly output:{
		context: () => interface_.Cnavigation_context;
		context_phase: () => interface_.Cevaluation_phase;
		dependency_step: () => interface_.Cdependency_step;
	} = {
		context: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.context_rule?.ref)
			.then(context => context?.properties.tail)
			.then(context => context?.component_root.output.context())
			.then(context => context?.component_root.output.node())
			.then(context => {
				const conv_context = resolve(context).result!;
				return new Cnavigation_context({name: 'node', definition: conv_context});
			}).result!),
		context_phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.context_rule?.inferences.evaluation()).result!),
		dependency_step: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.dependency_step()).result!)
	}
	public readonly inferences:{
		state: () => interface_.Cstates
	} = {
		state: cache((detach:boolean) => {
			const interface__node_path_tail__has_steps__yes__type__state_context_rule_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.component_root.input.context())
				.then(context => context?.component_root.output.node())
				.then(context => context?.component_root.output.location())
				.then(context => context?.variant.name === 'state' ? context.variant.definition as interface_.Cstates : undefined).result!;
		})

	}
	constructor(init:Tstate_context_rule, public parent:Cyes__has_steps) {
		super();
		const $this = this;
		this.properties = {
			context_rule: new Cstate_context_rule.Dcontext_rule(init['context rule'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state context rule`; }
	public get entity() { return this.parent.entity; }
}
type Vnode_parent = { name: 'node', definition: Cnode}|{ name: 'none', definition: (typeof Cnode_parent.Pnone)}
export class Cnode_parent extends AlanStruct {
	public static Pnone:Cnode_parent = new class PrimitiveInstance extends Cnode_parent {
		constructor () {
			super({name: 'none', definition: undefined as unknown as Cnode_parent})
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Vnode_parent) { super(); }
	public cast<K extends Vnode_parent['name']>(_variant:K):Extract<Vnode_parent, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vnode_parent['name']]:(($:Extract<Vnode_parent, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/node parent`; }
	public is(other:Cnode_parent):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
export import Cnone__node_parent = interface_.Cnode_parent;
type Vmember = { name: 'attribute', definition: Cattributes}|{ name: 'root', definition: (typeof Cmember.Proot)}
export class Cmember extends AlanStruct {
	public static Proot:Cmember = new class PrimitiveInstance extends Cmember {
		constructor () {
			super({name: 'root', definition: undefined as unknown as Cmember}, { 
				context_root_member: () => resolve(this)
				.then(() => interface_.Cmember.Proot).result,member_type: () => resolve(this)
				.then(() => interface_.Cmember_type.Psimple).result}
			)
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Vmember, public input: {
			context_root_member: () => interface_.Cmember,
			member_type: () => interface_.Cmember_type
		}) { super(); }
	public readonly output:{
		context_root_member: () => interface_.Cmember;
		member_type: () => interface_.Cmember_type;
	} = {
		context_root_member: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.context_root_member()).result!),
		member_type: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.member_type()).result!)
	};
	public cast<K extends Vmember['name']>(_variant:K):Extract<Vmember, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vmember['name']]:(($:Extract<Vmember, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/member`; }
	public is(other:Cmember):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
export import Croot = interface_.Cmember;
type Ventity = { name: 'root', definition: Cinterface}|{ name: 'collection', definition: Ccollection}
export class Centity extends AlanStruct {
	constructor(
		public readonly variant:Ventity) { super(); }
	public cast<K extends Ventity['name']>(_variant:K):Extract<Ventity, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Ventity['name']]:(($:Extract<Ventity, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/entity`; }
	public is(other:Centity):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
export type Tnode = {
	'attributes':Record<string, Tattributes>;
};
export class Cnode extends AlanNode {
	public definitions:{
		node_parent: Cnode_parent;
	} = {
		node_parent: new Cnode_parent({name:'node', definition: this})
	}
	public readonly properties:{
		readonly attributes:Cnode.Dattributes
	};
	public readonly output:{
		entity: () => interface_.Centity;
		location: () => interface_.Cnode_location;
	} = {
		entity: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.entity()).result!),
		location: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.location()).result!)
	};
	constructor(init:Tnode, public location:AlanNode, public input: {
		entity: () => interface_.Centity,
		location: () => interface_.Cnode_location
	}) {
		super();
		const $this = this;
		this.properties = {
			attributes: new Cnode.Dattributes(init['attributes'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.location.root); }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/node`; }
	public get entity() { return this.location.entity; }
}
export type Tattributes = {
	'has predecessor':'no'|['no', {}]|['yes', Tyes__has_predecessor];
	'type':['command', Tcommand]|['property', Tproperty];
};
export class Cattributes extends AlanGraphVertex {
	public key:string;
	public get key_value() { return this.key; }
	_edges: {
		'downstream attributes': Set<AlanGraphEdge<Cattributes>>,
		'upstream attributes': Set<AlanGraphEdge<Cattributes>>
	} = {
		'downstream attributes': new Set(),
		'upstream attributes': new Set()
	}; /** @internal */
	public definitions:{
		member: Cmember;
	} = {
		member: new Cmember({name:'attribute', definition: this}, {
			context_root_member: cache((detach:boolean) => resolve(this)
				.then(() => this)
				.then(context => context?.component_root.input.location())
				.then(context => context?.component_root.output.member())
				.then(context => {
					switch (context?.variant.name) {
						case 'attribute': {
							const interface__node__attributes_var___member_in___context_root_member___attribute_nval = context.cast('attribute');
							return resolve(context)
								.then(context => interface__node__attributes_var___member_in___context_root_member___attribute_nval)
								.then(context => context?.definitions.member).result;
						}
						case 'root': {
							return resolve(context)
								.then(() => this)
								.then(context => context?.definitions.member).result;
						}
						case undefined: return undefined;
						default: throw new Error(`Unexpected subtype '${(<any>context).variant.name}'`);
					};
				}).result!),
			member_type: cache((detach:boolean) => resolve(this)
				.then(() => this)
				.then(context => context?.component_root.input.entity())
				.then(context => {
					switch (context?.variant.name) {
						case 'collection': {
							const interface__node__attributes_var___member_in___member_type___collection_nval = context.cast('collection');
							return resolve(context)
								.then(match_context => { 
									const expression_context = resolve(match_context)
									.then(context => {
										const left = resolve(context)
											.then(() => this).result;
										const right = resolve(context)
											.then(context => interface__node__attributes_var___member_in___member_type___collection_nval)
											.then(context => context?.properties.key_property?.ref)
											.then(context => context?.parent)
											.then(context => context?.parent).result;
										return left?.is(right) ? left : undefined
									}).result;
									if (expression_context !== undefined) {
									return resolve(match_context)
									.then(() => this)
									.then(() => interface_.Cmember_type.Pkey).result
									} else {
										return resolve(match_context)
										.then(() => this)
										.then(() => interface_.Cmember_type.Psimple).result
									}
								}).result;
						}
						case 'root': {
							return resolve(context)
								.then(() => this)
								.then(() => interface_.Cmember_type.Psimple).result;
						}
						case undefined: return undefined;
						default: throw new Error(`Unexpected subtype '${(<any>context).variant.name}'`);
					};
				}).result!)
		})
	}
	public readonly properties:{
		readonly has_predecessor:Cattributes.Dhas_predecessor<
			{ name: 'no', node:Cno__has_predecessor, init:Tno__has_predecessor}|
			{ name: 'yes', node:Cyes__has_predecessor, init:Tyes__has_predecessor}>,
		readonly type:Cattributes.Dtype<
			{ name: 'command', node:Ccommand, init:Tcommand}|
			{ name: 'property', node:Cproperty, init:Tproperty}>
	};
	constructor(key:string, init:Tattributes, public parent:Cnode) {
		super();
		const $this = this;
		this.key = key;
		this.properties = {
			has_predecessor: new Cattributes.Dhas_predecessor(init['has predecessor'], $this),
			type: new Cattributes.Dtype(init['type'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/attributes[${this.key}]`; }
	public get entity() { return this; }
}
export type Tno__has_predecessor = {
};
export class Cno__has_predecessor extends AlanNode {
	constructor(init:Tno__has_predecessor, public parent:Cattributes) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/has predecessor?no`; }
	public get entity() { return this.parent.entity; }
}
export type Tyes__has_predecessor = {
	'attribute':string;
};
export class Cyes__has_predecessor extends AlanNode {
	public readonly properties:{
		readonly attribute:Cyes__has_predecessor.Dattribute
	};
	constructor(init:Tyes__has_predecessor, public parent:Cattributes) {
		super();
		const $this = this;
		this.properties = {
			attribute: new Cyes__has_predecessor.Dattribute(init['attribute'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/has predecessor?yes`; }
	public get entity() { return this.parent.entity; }
}
export type Tcommand = {
	'parameters':Tnode;
};
export class Ccommand extends AlanNode {
	public definitions:{
		root_location: Croot_location;
	} = {
		root_location: new Croot_location({name:'command', definition: this})
	}
	public readonly properties:{
		readonly parameters:Cnode
	};
	public readonly inferences:{
		dataset_attribute: () => interface_.Cinterface
	} = {
		dataset_attribute: cache((detach:boolean) => {
			const interface__node__attributes__type__command_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.component_root.input.location())
				.then(context => context?.component_root.output.root())
				.then(context => context?.variant.name === 'dataset' ? context.variant.definition as interface_.Cinterface : undefined).result!;
		})

	}
	constructor(init:Tcommand, public parent:Cattributes) {
		super();
		const $this = this;
		this.properties = {
			parameters: new Ccommand.Dparameters(init['parameters'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?command`; }
	public get entity() { return this.parent.entity; }
}
export type Tproperty = {
	'type':['collection', Tcollection]|'file'|['file', {}]|['group', Tgroup__type__property]|['number', Tnumber]|['state group', Tstate_group]|['text', Ttext];
};
export class Cproperty extends AlanNode {
	public readonly properties:{
		readonly type:Cproperty.Dtype<
			{ name: 'collection', node:Ccollection, init:Tcollection}|
			{ name: 'file', node:Cfile, init:Tfile}|
			{ name: 'group', node:Cgroup__type__property, init:Tgroup__type__property}|
			{ name: 'number', node:Cnumber, init:Tnumber}|
			{ name: 'state group', node:Cstate_group, init:Tstate_group}|
			{ name: 'text', node:Ctext, init:Ttext}>
	};
	constructor(init:Tproperty, public parent:Cattributes) {
		super();
		const $this = this;
		this.properties = {
			type: new Cproperty.Dtype(init['type'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?property`; }
	public get entity() { return this.parent.entity; }
}
export type Tcollection = {
	'graphs':Tgraphs_definition;
	'key property':string;
	'node':Tnode;
	'type':'dense map'|['dense map', {}]|'simple'|['simple', {}];
};
export class Ccollection extends AlanNode {
	public definitions:{
		entity: Centity;
		node_location: Cnode_location;
	} = {
		entity: new Centity({name:'collection', definition: this}),
		node_location: new Cnode_location({name:'collection', definition: this}, {
			member: cache((detach:boolean) => resolve(this)
				.then(() => this)
				.then(context => context?.parent)
				.then(context => context?.parent)
				.then(context => context?.definitions.member).result!),
			node: cache((detach:boolean) => resolve(this)
				.then(() => this)
				.then(context => context?.parent)
				.then(context => context?.parent)
				.then(context => context?.parent)
				.then(context => context?.definitions.node_parent).result!),
			root: cache((detach:boolean) => resolve(this)
				.then(() => this)
				.then(context => context?.component_root.input.location())
				.then(context => context?.component_root.output.root()).result!)
		})
	}
	public readonly properties:{
		readonly graphs:Cgraphs_definition,
		readonly key_property:Ccollection.Dkey_property,
		readonly node:Cnode,
		readonly type:Ccollection.Dtype<
			{ name: 'dense map', node:Cdense_map, init:Tdense_map}|
			{ name: 'simple', node:Csimple__type, init:Tsimple__type}>
	};
	constructor(init:Tcollection, public parent:Cproperty) {
		super();
		const $this = this;
		this.properties = {
			graphs: new Ccollection.Dgraphs(init['graphs'], $this),
			key_property: new Ccollection.Dkey_property(init['key property'], $this),
			node: new Ccollection.Dnode(init['node'], $this),
			type: new Ccollection.Dtype(init['type'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?collection`; }
	public get entity() { return this.parent.entity; }
}
export type Tdense_map = {
};
export class Cdense_map extends AlanNode {
	public readonly inferences:{
		command_parameter: () => interface_.Ccommand,
		key_constraint: () => interface_.Cyes__has_constraint
	} = {
		command_parameter: cache((detach:boolean) => {
			const interface__node__attributes__type__property__type__collection__type__dense_map_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.component_root.input.location())
				.then(context => context?.component_root.output.root())
				.then(context => context?.variant.name === 'command' ? context.variant.definition as interface_.Ccommand : undefined).result!;
		})
		,
		key_constraint: cache((detach:boolean) => {
			const interface__node__attributes__type__property__type__collection__type__dense_map_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.properties.key_property?.ref)
				.then(context => {
					if (context?.properties.has_constraint.state.name === 'yes') {
						return resolve(context.properties.has_constraint.state.node as interface_.Cyes__has_constraint).result;
					} else {
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tdense_map, public parent:Ccollection) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?dense map`; }
	public get entity() { return this.parent.entity; }
}
export type Tsimple__type = {
};
export class Csimple__type extends AlanNode {
	constructor(init:Tsimple__type, public parent:Ccollection) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?simple`; }
	public get entity() { return this.parent.entity; }
}
export type Tfile = {
};
export class Cfile extends AlanNode {
	constructor(init:Tfile, public parent:Cproperty) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?file`; }
	public get entity() { return this.parent.entity; }
}
export type Tgroup__type__property = {
	'node':Tnode;
};
export class Cgroup__type__property extends AlanNode {
	public definitions:{
		node_location: Cnode_location;
	} = {
		node_location: new Cnode_location({name:'group', definition: this}, {
			member: cache((detach:boolean) => resolve(this)
				.then(() => this)
				.then(context => context?.parent)
				.then(context => context?.parent)
				.then(context => context?.definitions.member).result!),
			node: cache((detach:boolean) => resolve(this)
				.then(() => this)
				.then(context => context?.parent)
				.then(context => context?.parent)
				.then(context => context?.parent)
				.then(context => context?.definitions.node_parent).result!),
			root: cache((detach:boolean) => resolve(this)
				.then(() => this)
				.then(context => context?.component_root.input.location())
				.then(context => context?.component_root.output.root()).result!)
		})
	}
	public readonly properties:{
		readonly node:Cnode
	};
	constructor(init:Tgroup__type__property, public parent:Cproperty) {
		super();
		const $this = this;
		this.properties = {
			node: new Cgroup__type__property.Dnode(init['node'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?group`; }
	public get entity() { return this.parent.entity; }
}
export type Tnumber = {
	'type':Tnumber_type;
};
export class Cnumber extends AlanNode {
	public readonly properties:{
		readonly type:Cnumber_type
	};
	constructor(init:Tnumber, public parent:Cproperty) {
		super();
		const $this = this;
		this.properties = {
			type: new Cnumber.Dtype(init['type'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?number`; }
	public get entity() { return this.parent.entity; }
}
export type Tstate_group = {
	'states':Record<string, Tstates>;
};
export class Cstate_group extends AlanNode {
	public readonly properties:{
		readonly states:Cstate_group.Dstates
	};
	constructor(init:Tstate_group, public parent:Cproperty) {
		super();
		const $this = this;
		this.properties = {
			states: new Cstate_group.Dstates(init['states'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?state group`; }
	public get entity() { return this.parent.entity; }
}
export type Tstates = {
	'context rules':Twhere_clause;
	'node':Tnode;
};
export class Cstates extends AlanDictionaryEntry {
	public key:string;
	public get key_value() { return this.key; }
	public definitions:{
		node_location: Cnode_location;
	} = {
		node_location: new Cnode_location({name:'state', definition: this}, {
			member: cache((detach:boolean) => resolve(this)
				.then(() => this)
				.then(context => context?.parent)
				.then(context => context?.parent)
				.then(context => context?.parent)
				.then(context => context?.definitions.member).result!),
			node: cache((detach:boolean) => resolve(this)
				.then(() => this)
				.then(context => context?.parent)
				.then(context => context?.parent)
				.then(context => context?.parent)
				.then(context => context?.parent)
				.then(context => context?.definitions.node_parent).result!),
			root: cache((detach:boolean) => resolve(this)
				.then(() => this)
				.then(context => context?.component_root.input.location())
				.then(context => context?.component_root.output.root()).result!)
		})
	}
	public readonly properties:{
		readonly context_rules:Cwhere_clause,
		readonly node:Cnode
	};
	constructor(key:string, init:Tstates, public parent:Cstate_group) {
		super();
		const $this = this;
		this.key = key;
		this.properties = {
			context_rules: new Cstates.Dcontext_rules(init['context rules'], $this),
			node: new Cstates.Dnode(init['node'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/states[${this.key}]`; }
	public get entity() { return this; }
}
export type Ttext = {
	'has constraint':'no'|['no', {}]|['yes', Tyes__has_constraint];
};
export class Ctext extends AlanNode {
	public readonly properties:{
		readonly has_constraint:Ctext.Dhas_constraint<
			{ name: 'no', node:Cno__has_constraint, init:Tno__has_constraint}|
			{ name: 'yes', node:Cyes__has_constraint, init:Tyes__has_constraint}>
	};
	constructor(init:Ttext, public parent:Cproperty) {
		super();
		const $this = this;
		this.properties = {
			has_constraint: new Ctext.Dhas_constraint(init['has constraint'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?text`; }
	public get entity() { return this.parent.entity; }
}
export type Tno__has_constraint = {
};
export class Cno__has_constraint extends AlanNode {
	public readonly output:{
		reference: () => interface_.Creference__interface;
	} = {
		reference: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(() => interface_.Creference__interface.Pundefined).result!)
	}
	constructor(init:Tno__has_constraint, public parent:Ctext) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/has constraint?no`; }
	public get entity() { return this.parent.entity; }
}
export type Tyes__has_constraint = {
	'referencer':Treferencer;
	'type':'existing'|['existing', {}]|'nonexisting'|['nonexisting', {}];
};
export class Cyes__has_constraint extends AlanNode {
	public readonly properties:{
		readonly referencer:Creferencer,
		readonly type:Cyes__has_constraint.Dtype<
			{ name: 'existing', node:Cexisting, init:Texisting}|
			{ name: 'nonexisting', node:Cnonexisting, init:Tnonexisting}>
	};
	public readonly output:{
		reference: () => interface_.Creference__interface;
	} = {
		reference: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.referencer)
			.then(context => context?.definitions.reference).result!)
	}
	constructor(init:Tyes__has_constraint, public parent:Ctext) {
		super();
		const $this = this;
		this.properties = {
			referencer: new Cyes__has_constraint.Dreferencer(init['referencer'], $this),
			type: new Cyes__has_constraint.Dtype(init['type'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/has constraint?yes`; }
	public get entity() { return this.parent.entity; }
}
export type Texisting = {
};
export class Cexisting extends AlanNode {
	constructor(init:Texisting, public parent:Cyes__has_constraint) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?existing`; }
	public get entity() { return this.parent.entity; }
}
export type Tnonexisting = {
};
export class Cnonexisting extends AlanNode {
	public readonly inferences:{
		command_parameter: () => interface_.Ccommand
	} = {
		command_parameter: cache((detach:boolean) => {
			const interface__node__attributes__type__property__type__text__has_constraint__yes__type__nonexisting_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.component_root.input.location())
				.then(context => context?.component_root.output.root())
				.then(context => context?.variant.name === 'command' ? context.variant.definition as interface_.Ccommand : undefined).result!;
		})

	}
	constructor(init:Tnonexisting, public parent:Cyes__has_constraint) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?nonexisting`; }
	public get entity() { return this.parent.entity; }
}
type Vnavigation_context = { name: 'node', definition: Cnode}|{ name: 'attribute', definition: Cattributes}
export class Cnavigation_context extends AlanStruct {
	constructor(
		public readonly variant:Vnavigation_context) { super(); }
	public definitions:{
		optional_navigation_context: Coptional_navigation_context;
	} = {
		optional_navigation_context: new Coptional_navigation_context({name:'context', definition: this})
	}
	public readonly output:{
		node: () => interface_.Cnode;
	} = {
		node: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => {
				switch (context?.variant.name) {
					case 'attribute': {
						const interface__navigation_context_out___node___attribute_nval = context.cast('attribute');
						return resolve(context)
							.then(context => interface__navigation_context_out___node___attribute_nval)
							.then(context => context?.parent).result;
					}
					case 'node': {
						const interface__navigation_context_out___node___node_nval = context.cast('node');
						return resolve(context)
							.then(context => interface__navigation_context_out___node___node_nval).result;
					}
					case undefined: return undefined;
					default: throw new Error(`Unexpected subtype '${(<any>context).variant.name}'`);
				};
			}).result!)
	};
	public cast<K extends Vnavigation_context['name']>(_variant:K):Extract<Vnavigation_context, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vnavigation_context['name']]:(($:Extract<Vnavigation_context, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/navigation context`; }
	public is(other:Cnavigation_context):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
type Vmember_type = { name: 'simple', definition: (typeof Cmember_type.Psimple)}|{ name: 'key', definition: (typeof Cmember_type.Pkey)}
export class Cmember_type extends AlanStruct {
	public static Psimple:Cmember_type = new class PrimitiveInstance extends Cmember_type {
		constructor () {
			super({name: 'simple', definition: undefined as unknown as Cmember_type})
			this.variant.definition = this;
		}
	}
	public static Pkey:Cmember_type = new class PrimitiveInstance extends Cmember_type {
		constructor () {
			super({name: 'key', definition: undefined as unknown as Cmember_type})
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Vmember_type) { super(); }
	public cast<K extends Vmember_type['name']>(_variant:K):Extract<Vmember_type, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vmember_type['name']]:(($:Extract<Vmember_type, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/member type`; }
	public is(other:Cmember_type):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
export import Ckey = interface_.Cmember_type;
export import Csimple__member_type = interface_.Cmember_type;
export type Tgraphs_definition = {
	'graphs':Record<string, Tgraphs__graphs_definition>;
};
export class Cgraphs_definition extends AlanNode {
	public readonly properties:{
		readonly graphs:Cgraphs_definition.Dgraphs
	};
	constructor(init:Tgraphs_definition, public location:AlanNode, public input: {
		collection: () => interface_.Ccollection
	}) {
		super();
		const $this = this;
		this.properties = {
			graphs: new Cgraphs_definition.Dgraphs(init['graphs'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.location.root); }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/graphs definition`; }
	public get entity() { return this.location.entity; }
}
export type Tgraphs__graphs_definition = {
	'type':'acyclic'|['acyclic', {}]|['ordered', Tordered];
};
export class Cgraphs__graphs_definition extends AlanDictionaryEntry {
	public key:string;
	public get key_value() { return this.key; }
	public readonly properties:{
		readonly type:Cgraphs__graphs_definition.Dtype<
			{ name: 'acyclic', node:Cacyclic, init:Tacyclic}|
			{ name: 'ordered', node:Cordered, init:Tordered}>
	};
	constructor(key:string, init:Tgraphs__graphs_definition, public parent:Cgraphs_definition) {
		super();
		const $this = this;
		this.key = key;
		this.properties = {
			type: new Cgraphs__graphs_definition.Dtype(init['type'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/graphs[${this.key}]`; }
	public get entity() { return this; }
}
export type Tacyclic = {
};
export class Cacyclic extends AlanNode {
	constructor(init:Tacyclic, public parent:Cgraphs__graphs_definition) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?acyclic`; }
	public get entity() { return this.parent.entity; }
}
export type Tordered = {
	'ordering property':string;
	'path':Tnode_path_tail;
};
export class Cordered extends AlanNode {
	public readonly properties:{
		readonly ordering_property:Cordered.Dordering_property,
		readonly path:Cnode_path_tail
	};
	constructor(init:Tordered, public parent:Cgraphs__graphs_definition) {
		super();
		const $this = this;
		this.properties = {
			ordering_property: new Cordered.Dordering_property(init['ordering property'], $this),
			path: new Cordered.Dpath(init['path'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?ordered`; }
	public get entity() { return this.parent.entity; }
}
export type Texplicit_evaluation_annotation = {
	'phase':'downstream'|['downstream', {}]|'upstream'|['upstream', {}];
};
export class Cexplicit_evaluation_annotation extends AlanNode {
	public readonly properties:{
		readonly phase:Cexplicit_evaluation_annotation.Dphase<
			{ name: 'downstream', node:Cdownstream__phase__explicit_evaluation_annotation, init:Tdownstream__phase__explicit_evaluation_annotation}|
			{ name: 'upstream', node:Cupstream, init:Tupstream}>
	};
	public readonly output:{
		phase: () => interface_.Cevaluation_phase;
	} = {
		phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.phase?.state.node.output.phase()).result!)
	};
	constructor(init:Texplicit_evaluation_annotation, public location:AlanNode) {
		super();
		const $this = this;
		this.properties = {
			phase: new Cexplicit_evaluation_annotation.Dphase(init['phase'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.location.root); }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/explicit evaluation annotation`; }
	public get entity() { return this.location.entity; }
}
export type Tdownstream__phase__explicit_evaluation_annotation = {
};
export class Cdownstream__phase__explicit_evaluation_annotation extends AlanNode {
	public readonly output:{
		phase: () => interface_.Cevaluation_phase;
	} = {
		phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(() => interface_.Cevaluation_phase.Pdownstream_expressions).result!)
	}
	constructor(init:Tdownstream__phase__explicit_evaluation_annotation, public parent:Cexplicit_evaluation_annotation) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/phase?downstream`; }
	public get entity() { return this.parent.entity; }
}
export type Tupstream = {
};
export class Cupstream extends AlanNode {
	public readonly output:{
		phase: () => interface_.Cevaluation_phase;
	} = {
		phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(() => interface_.Cevaluation_phase.Pupstream_expressions).result!)
	}
	constructor(init:Tupstream, public parent:Cexplicit_evaluation_annotation) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/phase?upstream`; }
	public get entity() { return this.parent.entity; }
}
type Vevaluation_phase = { name: 'downstream expressions', definition: (typeof Cevaluation_phase.Pdownstream_expressions), widening_index: 0}|{ name: 'upstream expressions', definition: (typeof Cevaluation_phase.Pupstream_expressions), widening_index: 1}
export class Cevaluation_phase extends AlanStruct {
	public static Pdownstream_expressions:Cevaluation_phase = new class PrimitiveInstance extends Cevaluation_phase {
		constructor () {
			super({name: 'downstream expressions', definition: undefined as unknown as Cevaluation_phase, widening_index: 0})
			this.variant.definition = this;
		}
	}
	public static Pupstream_expressions:Cevaluation_phase = new class PrimitiveInstance extends Cevaluation_phase {
		constructor () {
			super({name: 'upstream expressions', definition: undefined as unknown as Cevaluation_phase, widening_index: 1})
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Vevaluation_phase) { super(); }
	public cast<K extends Vevaluation_phase['name']>(_variant:K):Extract<Vevaluation_phase, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vevaluation_phase['name']]:(($:Extract<Vevaluation_phase, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/evaluation phase`; }
	public is(other:Cevaluation_phase):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
export import Cdownstream_expressions = interface_.Cevaluation_phase;
export import Cupstream_expressions = interface_.Cevaluation_phase;
type Vdependency_step = { name: 'disallowed', definition: (typeof Cdependency_step.Pdisallowed)}|{ name: 'allowed', definition: (typeof Cdependency_step.Pallowed)}
export class Cdependency_step extends AlanStruct {
	public static Pdisallowed:Cdependency_step = new class PrimitiveInstance extends Cdependency_step {
		constructor () {
			super({name: 'disallowed', definition: undefined as unknown as Cdependency_step})
			this.variant.definition = this;
		}
	}
	public static Pallowed:Cdependency_step = new class PrimitiveInstance extends Cdependency_step {
		constructor () {
			super({name: 'allowed', definition: undefined as unknown as Cdependency_step})
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Vdependency_step) { super(); }
	public cast<K extends Vdependency_step['name']>(_variant:K):Extract<Vdependency_step, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vdependency_step['name']]:(($:Extract<Vdependency_step, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/dependency step`; }
	public is(other:Cdependency_step):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
export import Callowed = interface_.Cdependency_step;
export import Cdisallowed = interface_.Cdependency_step;
export type Tcontext_node_path = {
	'context':'dataset root'|['dataset root', {}]|'expression context'|['expression context', {}]|'this dataset node'|['this dataset node', {}]|'this parameter node'|['this parameter node', {}];
};
export class Ccontext_node_path extends AlanNode {
	public readonly properties:{
		readonly context:Ccontext_node_path.Dcontext<
			{ name: 'dataset root', node:Cdataset_root, init:Tdataset_root}|
			{ name: 'expression context', node:Cexpression_context, init:Texpression_context}|
			{ name: 'this dataset node', node:Cthis_dataset_node, init:Tthis_dataset_node}|
			{ name: 'this parameter node', node:Cthis_parameter_node, init:Tthis_parameter_node}>
	};
	public readonly output:{
		context: () => interface_.Cnavigation_context;
		phase: () => interface_.Cevaluation_phase;
	} = {
		context: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.context?.state.node.output.context()).result!),
		phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.context?.state.node.output.phase()).result!)
	};
	constructor(init:Tcontext_node_path, public location:AlanNode, public input: {
		context: () => interface_.Coptional_navigation_context,
		context_phase: () => interface_.Cevaluation_phase,
		this_: () => interface_.Coptional_target_context,
		this_phase: () => interface_.Cevaluation_phase
	}) {
		super();
		const $this = this;
		this.properties = {
			context: new Ccontext_node_path.Dcontext(init['context'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.location.root); }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/context node path`; }
	public get entity() { return this.location.entity; }
}
export type Tdataset_root = {
};
export class Cdataset_root extends AlanNode {
	public readonly output:{
		context: () => interface_.Cnavigation_context;
		phase: () => interface_.Cevaluation_phase;
	} = {
		context: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.inferences.root_context()).result!),
		phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.this_phase()).result!)
	}
	public readonly inferences:{
		accessible_this_context: () => interface_.Cmember,
		root_context: () => interface_.Cnavigation_context
	} = {
		accessible_this_context: cache((detach:boolean) => {
			const interface__context_node_path__context__dataset_root_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.component_root.input.this_())
				.then(context => context?.variant.name === 'member' ? context.variant.definition as interface_.Cmember : undefined).result!;
		})
		,
		root_context: cache((detach:boolean) => {
			const interface__context_node_path__context__dataset_root_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.inferences.accessible_this_context())
				.then(context => context?.component_root.output.context_root_member())
				.then(context => {
					switch (context?.variant.name) {
						case 'attribute': {
							const interface__context_node_path__context__dataset_root_inf___root_context___attribute_nval = context.cast('attribute');
							return resolve(context)
								.then(context => interface__context_node_path__context__dataset_root_inf___root_context___attribute_nval)
								.then(context => {
									const conv_context = resolve(context).result!;
									return new Cnavigation_context({name: 'attribute', definition: conv_context});
								}).result;
						}
						case 'root': {
							return resolve(context)
								.then(() => this.parent)
								.then(context => context?.root)
								.then(context => context?.properties.root)
								.then(context => {
									const conv_context = resolve(context).result!;
									return new Cnavigation_context({name: 'node', definition: conv_context});
								}).result;
						}
						case undefined: return undefined;
						default: throw new Error(`Unexpected subtype '${(<any>context).variant.name}'`);
					};
				}).result!;
		})

	}
	constructor(init:Tdataset_root, public parent:Ccontext_node_path) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/context?dataset root`; }
	public get entity() { return this.parent.entity; }
}
export type Texpression_context = {
};
export class Cexpression_context extends AlanNode {
	public readonly output:{
		context: () => interface_.Cnavigation_context;
		phase: () => interface_.Cevaluation_phase;
	} = {
		context: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.inferences.context()).result!),
		phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.context_phase()).result!)
	}
	public readonly inferences:{
		context: () => interface_.Cnavigation_context
	} = {
		context: cache((detach:boolean) => {
			const interface__context_node_path__context__expression_context_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.component_root.input.context())
				.then(context => context?.variant.name === 'context' ? context.variant.definition as interface_.Cnavigation_context : undefined).result!;
		})

	}
	constructor(init:Texpression_context, public parent:Ccontext_node_path) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/context?expression context`; }
	public get entity() { return this.parent.entity; }
}
export type Tthis_dataset_node = {
};
export class Cthis_dataset_node extends AlanNode {
	public readonly output:{
		context: () => interface_.Cnavigation_context;
		phase: () => interface_.Cevaluation_phase;
	} = {
		context: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.inferences.data_attribute())
			.then(context => {
				const conv_context = resolve(context).result!;
				return new Cnavigation_context({name: 'attribute', definition: conv_context});
			}).result!),
		phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.this_phase()).result!)
	}
	public readonly inferences:{
		accessible_this_context: () => interface_.Cattributes,
		data_attribute: () => interface_.Cattributes
	} = {
		accessible_this_context: cache((detach:boolean) => {
			const interface__context_node_path__context__this_dataset_node_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.component_root.input.this_())
				.then(context => context?.variant.name === 'member' ? context.variant.definition as interface_.Cmember : undefined)
				.then(context => context?.variant.name === 'attribute' ? context.variant.definition as interface_.Cattributes : undefined).result!;
		})
		,
		data_attribute: cache((detach:boolean) => {
			const interface__context_node_path__context__this_dataset_node_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.inferences.accessible_this_context())
				.then(context => context?.component_root.output.location())
				.then(context => context?.component_root.output.root())
				.then(context => {
					switch (context?.variant.name) {
						case 'command': {
							const interface__context_node_path__context__this_dataset_node_inf___data_attribute___command_nval = context.cast('command');
							return resolve(context)
								.then(context => interface__context_node_path__context__this_dataset_node_inf___data_attribute___command_nval)
								.then(context => context?.parent).result;
						}
						case 'dataset': {
							return resolve(context)
								.then(() => this.inferences.accessible_this_context()).result;
						}
						case undefined: return undefined;
						default: throw new Error(`Unexpected subtype '${(<any>context).variant.name}'`);
					};
				}).result!;
		})

	}
	constructor(init:Tthis_dataset_node, public parent:Ccontext_node_path) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/context?this dataset node`; }
	public get entity() { return this.parent.entity; }
}
export type Tthis_parameter_node = {
};
export class Cthis_parameter_node extends AlanNode {
	public readonly output:{
		context: () => interface_.Cnavigation_context;
		phase: () => interface_.Cevaluation_phase;
	} = {
		context: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.inferences.accessible_this_context())
			.then(context => {
				const conv_context = resolve(context).result!;
				return new Cnavigation_context({name: 'attribute', definition: conv_context});
			}).result!),
		phase: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.this_phase()).result!)
	}
	public readonly inferences:{
		accessible_this_context: () => interface_.Cattributes,
		command: () => interface_.Ccommand
	} = {
		accessible_this_context: cache((detach:boolean) => {
			const interface__context_node_path__context__this_parameter_node_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.component_root.input.this_())
				.then(context => context?.variant.name === 'member' ? context.variant.definition as interface_.Cmember : undefined)
				.then(context => context?.variant.name === 'attribute' ? context.variant.definition as interface_.Cattributes : undefined).result!;
		})
		,
		command: cache((detach:boolean) => {
			const interface__context_node_path__context__this_parameter_node_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.inferences.accessible_this_context())
				.then(context => context?.component_root.output.location())
				.then(context => context?.component_root.output.root())
				.then(context => context?.variant.name === 'command' ? context.variant.definition as interface_.Ccommand : undefined).result!;
		})

	}
	constructor(init:Tthis_parameter_node, public parent:Ccontext_node_path) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/context?this parameter node`; }
	public get entity() { return this.parent.entity; }
}

export type Tinterface = {
	'context keys':Record<string, {}>;
	'numerical types':Record<string, {}>;
	'root':Tnode;
};
export class Cinterface extends AlanNode {
	public key?:string;
	public get root() { return this; }
	public definitions:{
		entity: Centity;
		root_location: Croot_location;
	} = {
		entity: new Centity({name:'root', definition: this}),
		root_location: new Croot_location({name:'dataset', definition: this})
	}
	public readonly properties:{
		readonly context_keys:Cinterface.Dcontext_keys,
		readonly numerical_types:Cinterface.Dnumerical_types,
		readonly root:Cnode
	};
	constructor(init:Tinterface) {
		super();
		const $this = this;
		this.properties = {
			context_keys: new Cinterface.Dcontext_keys(init['context keys'], $this),
			numerical_types: new Cinterface.Dnumerical_types(init['numerical types'], $this),
			root: new Cinterface.Droot(init['root'], $this)
		};
	}
	public get path() { return ``; }
	public get entity() { return this; }
}
export type Tcontext_keys = {
};
export class Ccontext_keys extends AlanDictionaryEntry {
	public key:string;
	public get key_value() { return this.key; }
	constructor(key:string, init:Tcontext_keys, public parent:Cinterface) {
		super();
		const $this = this;
		this.key = key;
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/context keys[${this.key}]`; }
	public get entity() { return this; }
}
export type Tnumerical_types = {
};
export class Cnumerical_types extends AlanDictionaryEntry {
	public key:string;
	public get key_value() { return this.key; }
	constructor(key:string, init:Tnumerical_types, public parent:Cinterface) {
		super();
		const $this = this;
		this.key = key;
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/numerical types[${this.key}]`; }
	public get entity() { return this; }
}

/* property classes */
export namespace Ccontext_node_path {
	export class Dcontext<T extends
		{ name: 'dataset root', node:Cdataset_root, init:Tdataset_root}|
		{ name: 'expression context', node:Cexpression_context, init:Texpression_context}|
		{ name: 'this dataset node', node:Cthis_dataset_node, init:Tthis_dataset_node}|
		{ name: 'this parameter node', node:Cthis_parameter_node, init:Tthis_parameter_node}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'dataset root': return (init:Tdataset_root, parent:Ccontext_node_path) => new Cdataset_root(init, parent);
				case 'expression context': return (init:Texpression_context, parent:Ccontext_node_path) => new Cexpression_context(init, parent);
				case 'this dataset node': return (init:Tthis_dataset_node, parent:Ccontext_node_path) => new Cthis_dataset_node(init, parent);
				case 'this parameter node': return (init:Tthis_parameter_node, parent:Ccontext_node_path) => new Cthis_parameter_node(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'dataset root': return finalize_dataset_root;
				case 'expression context': return finalize_expression_context;
				case 'this dataset node': return finalize_this_dataset_node;
				case 'this parameter node': return finalize_this_parameter_node;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tcontext_node_path['context'], parent:Ccontext_node_path) {
			super(data, parent);
		}
		public get path() { return `<unknown>/context`; }
	}
}
export namespace Cexplicit_evaluation_annotation {
	export class Dphase<T extends
		{ name: 'downstream', node:Cdownstream__phase__explicit_evaluation_annotation, init:Tdownstream__phase__explicit_evaluation_annotation}|
		{ name: 'upstream', node:Cupstream, init:Tupstream}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'downstream': return (init:Tdownstream__phase__explicit_evaluation_annotation, parent:Cexplicit_evaluation_annotation) => new Cdownstream__phase__explicit_evaluation_annotation(init, parent);
				case 'upstream': return (init:Tupstream, parent:Cexplicit_evaluation_annotation) => new Cupstream(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'downstream': return finalize_downstream__phase__explicit_evaluation_annotation;
				case 'upstream': return finalize_upstream;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Texplicit_evaluation_annotation['phase'], parent:Cexplicit_evaluation_annotation) {
			super(data, parent);
		}
		public get path() { return `<unknown>/phase`; }
	}
}
export namespace Cgraphs_definition {
	export class Dgraphs extends AlanDictionary<{ node:Cgraphs__graphs_definition, init:Tgraphs__graphs_definition},Cgraphs_definition> {
		protected initialize(parent:Cgraphs_definition, key:string, entry_init:Tgraphs__graphs_definition) { return new Cgraphs__graphs_definition(key, entry_init, parent); }
		protected finalize = finalize_graphs__graphs_definition
		public get path() { return `${this.parent.path}/graphs`; }
		constructor(data:Tgraphs_definition['graphs'], parent:Cgraphs_definition) {
			super(data, parent);
		}
	}
}
export namespace Cgraphs__graphs_definition {
	export class Dtype<T extends
		{ name: 'acyclic', node:Cacyclic, init:Tacyclic}|
		{ name: 'ordered', node:Cordered, init:Tordered}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'acyclic': return (init:Tacyclic, parent:Cgraphs__graphs_definition) => new Cacyclic(init, parent);
				case 'ordered': return (init:Tordered, parent:Cgraphs__graphs_definition) => new Cordered(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'acyclic': return finalize_acyclic;
				case 'ordered': return finalize_ordered;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tgraphs__graphs_definition['type'], parent:Cgraphs__graphs_definition) {
			super(data, parent);
		}
		public get path() { return `<unknown>/type`; }
	}
}
export namespace Cordered {
	export class Dordering_property extends Reference<interface_.Cproperty,string> {
		public readonly inferences:{
			graph_participation: () => interface_.Cyes__graph_participation,
			participates_in_this_graph: () => interface_.Cgraphs__yes,
			reference: () => interface_.Cyes__has_constraint
		}

		constructor(data:string, $this:Cordered) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.properties.path)
				.then(context => context?.component_root.output.context())
				.then(context => context?.component_root.output.node())
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
			this.inferences = {
				graph_participation: cache((detach:boolean) => {
					const interface__graphs_definition__graphs__type__ordered__ordering_property_nval = $this.properties.ordering_property.ref;
					return resolve($this.properties.ordering_property.ref)
						.then(() => $this.properties.ordering_property.inferences.reference())
						.then(context => context?.properties.referencer)
						.then(context => {
							if (context?.properties.type.state.name === 'sibling') {
								return resolve(context.properties.type.state.node as interface_.Csibling)
								.then(context => {
									if (context?.properties.graph_participation.state.name === 'yes') {
										return context.properties.graph_participation.state.node as interface_.Cyes__graph_participation;
									} else {
										return undefined;
									}
								}).result;
							} else {
								return undefined;
							}
						}).result!;
				})
				,
				participates_in_this_graph: cache((detach:boolean) => {
					const interface__graphs_definition__graphs__type__ordered__ordering_property_nval = $this.properties.ordering_property.ref;
					return resolve($this.properties.ordering_property.ref)
						.then(context => {
							const col_object = resolve(context)
								.then(() => $this.properties.ordering_property.inferences.graph_participation()).result;
							const key_object = resolve(context)
								.then(() => $this)
								.then(context => context?.parent).result;
							return resolve(col_object.properties.graphs.get(key_object?.key)).result;
						}).result!;
				})
				,
				reference: cache((detach:boolean) => {
					const interface__graphs_definition__graphs__type__ordered__ordering_property_nval = $this.properties.ordering_property.ref;
					return resolve($this.properties.ordering_property.ref)
						.then(context => interface__graphs_definition__graphs__type__ordered__ordering_property_nval)
						.then(context => {
							if (context?.properties.type.state.name === 'text') {
								return resolve(context.properties.type.state.node as interface_.Ctext)
								.then(context => {
									if (context?.properties.has_constraint.state.name === 'yes') {
										return context.properties.has_constraint.state.node as interface_.Cyes__has_constraint;
									} else {
										return undefined;
									}
								}).result;
							} else {
								return undefined;
							}
						}).result!;
				})

			}
		}
		public get path() { return `<unknown>/ordering property`; }
	}
	export class Dpath extends Cnode_path_tail {
		constructor(data:Tordered['path'], parent:Cordered) {
			super(data, parent, {
				context: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.collection())
					.then(context => context?.properties.node)
					.then(context => {
						const conv_context = resolve(context).result!;
						return new Cnavigation_context({name: 'node', definition: conv_context});
					}).result!),
				context_phase: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(() => interface_.Cevaluation_phase.Pupstream_expressions).result!),
				dependency_step: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(() => interface_.Cdependency_step.Pdisallowed).result!),
				participation: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(() => interface_.Cparticipation.Pconditional).result!)
			})
		}
	}
}
export namespace Cnode {
	export class Dattributes extends AlanTopology<{ node:Cattributes, init:Tattributes},Cnode,'downstream attributes'|'upstream attributes'> {
		protected _graphs: {
			'downstream attributes': Array<Cattributes>,
			'upstream attributes': Array<Cattributes>
		} = {

			'downstream attributes': [],
			'upstream attributes': []
		}
		protected initialize(parent:Cnode, key:string, entry_init:Tattributes) { return new Cattributes(key, entry_init, parent); }
		protected finalize = finalize_attributes
		public get path() { return `${this.parent.path}/attributes`; }
		constructor(data:Tnode['attributes'], parent:Cnode) {
			super(data, parent);
		}
	}
}
export namespace Cattributes {
	export class Dhas_predecessor<T extends
		{ name: 'no', node:Cno__has_predecessor, init:Tno__has_predecessor}|
		{ name: 'yes', node:Cyes__has_predecessor, init:Tyes__has_predecessor}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__has_predecessor, parent:Cattributes) => new Cno__has_predecessor(init, parent);
				case 'yes': return (init:Tyes__has_predecessor, parent:Cattributes) => new Cyes__has_predecessor(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'no': return finalize_no__has_predecessor;
				case 'yes': return finalize_yes__has_predecessor;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tattributes['has predecessor'], parent:Cattributes) {
			super(data, parent);
		}
		public get path() { return `<unknown>/has predecessor`; }
	}
	export class Dtype<T extends
		{ name: 'command', node:Ccommand, init:Tcommand}|
		{ name: 'property', node:Cproperty, init:Tproperty}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'command': return (init:Tcommand, parent:Cattributes) => new Ccommand(init, parent);
				case 'property': return (init:Tproperty, parent:Cattributes) => new Cproperty(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'command': return finalize_command;
				case 'property': return finalize_property;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tattributes['type'], parent:Cattributes) {
			super(data, parent);
		}
		public get path() { return `<unknown>/type`; }
	}
}
export namespace Cyes__has_predecessor {
	export class Dattribute extends Reference<interface_.Cattributes,string> {

		constructor(data:string, $this:Cyes__has_predecessor) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.parent)
				.then(context => {
					const entry = context?.parent.properties.attributes.get(this.entry)!;
					if (detach) {
						context._edges[`upstream attributes`].delete(this);
					} else {
						context._edges[`upstream attributes`].add(this);
					}return resolve(entry).result;
				}).result!))
		}
		public get path() { return `<unknown>/attribute`; }
	}
}
export namespace Ccommand {
	export class Dparameters extends Cnode {
		constructor(data:Tcommand['parameters'], parent:Ccommand) {
			super(data, parent, {
				entity: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.entity()).result!),
				location: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.definitions.root_location)
					.then(context => context?.definitions.node_location).result!)
			})
		}
	}
}
export namespace Cproperty {
	export class Dtype<T extends
		{ name: 'collection', node:Ccollection, init:Tcollection}|
		{ name: 'file', node:Cfile, init:Tfile}|
		{ name: 'group', node:Cgroup__type__property, init:Tgroup__type__property}|
		{ name: 'number', node:Cnumber, init:Tnumber}|
		{ name: 'state group', node:Cstate_group, init:Tstate_group}|
		{ name: 'text', node:Ctext, init:Ttext}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'collection': return (init:Tcollection, parent:Cproperty) => new Ccollection(init, parent);
				case 'file': return (init:Tfile, parent:Cproperty) => new Cfile(init, parent);
				case 'group': return (init:Tgroup__type__property, parent:Cproperty) => new Cgroup__type__property(init, parent);
				case 'number': return (init:Tnumber, parent:Cproperty) => new Cnumber(init, parent);
				case 'state group': return (init:Tstate_group, parent:Cproperty) => new Cstate_group(init, parent);
				case 'text': return (init:Ttext, parent:Cproperty) => new Ctext(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'collection': return finalize_collection;
				case 'file': return finalize_file;
				case 'group': return finalize_group__type__property;
				case 'number': return finalize_number;
				case 'state group': return finalize_state_group;
				case 'text': return finalize_text;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tproperty['type'], parent:Cproperty) {
			super(data, parent);
		}
		public get path() { return `<unknown>/type`; }
	}
}
export namespace Ccollection {
	export class Dgraphs extends Cgraphs_definition {
		constructor(data:Tcollection['graphs'], parent:Ccollection) {
			super(data, parent, {
				collection: cache((detach:boolean) => resolve(this)
					.then(() => parent).result!)
			})
		}
	}
	export class Dkey_property extends Reference<interface_.Ctext,string> {

		constructor(data:string, $this:Ccollection) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.properties.node)
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
						if (context?.properties.type.state.name === 'text') {
							return context.properties.type.state.node as interface_.Ctext;
						} else {
							return undefined;
						}
					}).result;
				}).result!))
		}
		public get path() { return `<unknown>/key property`; }
	}
	export class Dnode extends Cnode {
		constructor(data:Tcollection['node'], parent:Ccollection) {
			super(data, parent, {
				entity: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.definitions.entity).result!),
				location: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.definitions.node_location).result!)
			})
		}
	}
	export class Dtype<T extends
		{ name: 'dense map', node:Cdense_map, init:Tdense_map}|
		{ name: 'simple', node:Csimple__type, init:Tsimple__type}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'dense map': return (init:Tdense_map, parent:Ccollection) => new Cdense_map(init, parent);
				case 'simple': return (init:Tsimple__type, parent:Ccollection) => new Csimple__type(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'dense map': return finalize_dense_map;
				case 'simple': return finalize_simple__type;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tcollection['type'], parent:Ccollection) {
			super(data, parent);
		}
		public get path() { return `<unknown>/type`; }
	}
}
export namespace Cgroup__type__property {
	export class Dnode extends Cnode {
		constructor(data:Tgroup__type__property['node'], parent:Cgroup__type__property) {
			super(data, parent, {
				entity: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.entity()).result!),
				location: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.definitions.node_location).result!)
			})
		}
	}
}
export namespace Cnumber {
	export class Dtype extends Cnumber_type {
		constructor(data:Tnumber['type'], parent:Cnumber) {
			super(data, parent)
		}
	}
}
export namespace Cstate_group {
	export class Dstates extends AlanDictionary<{ node:Cstates, init:Tstates},Cstate_group> {
		protected initialize(parent:Cstate_group, key:string, entry_init:Tstates) { return new Cstates(key, entry_init, parent); }
		protected finalize = finalize_states
		public get path() { return `${this.parent.path}/states`; }
		constructor(data:Tstate_group['states'], parent:Cstate_group) {
			super(data, parent);
		}
	}
}
export namespace Cstates {
	export class Dcontext_rules extends Cwhere_clause {
		constructor(data:Tstates['context rules'], parent:Cstates) {
			super(data, parent, {
				context: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(() => interface_.Coptional_navigation_context.Pnone).result!),
				context_phase: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(() => interface_.Cevaluation_phase.Pupstream_expressions).result!),
				this_: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.parent)
					.then(context => context?.parent)
					.then(context => context?.parent)
					.then(context => {
						const conv_context = resolve(context)
							.then(context => context?.definitions.member).result!;
						return new Coptional_target_context({name: 'member', definition: conv_context});
					}).result!)
			})
		}
	}
	export class Dnode extends Cnode {
		constructor(data:Tstates['node'], parent:Cstates) {
			super(data, parent, {
				entity: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.entity()).result!),
				location: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.definitions.node_location).result!)
			})
		}
	}
}
export namespace Ctext {
	export class Dhas_constraint<T extends
		{ name: 'no', node:Cno__has_constraint, init:Tno__has_constraint}|
		{ name: 'yes', node:Cyes__has_constraint, init:Tyes__has_constraint}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__has_constraint, parent:Ctext) => new Cno__has_constraint(init, parent);
				case 'yes': return (init:Tyes__has_constraint, parent:Ctext) => new Cyes__has_constraint(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'no': return finalize_no__has_constraint;
				case 'yes': return finalize_yes__has_constraint;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Ttext['has constraint'], parent:Ctext) {
			super(data, parent);
		}
		public get path() { return `<unknown>/has constraint`; }
	}
}
export namespace Cyes__has_constraint {
	export class Dreferencer extends Creferencer {
		constructor(data:Tyes__has_constraint['referencer'], parent:Cyes__has_constraint) {
			super(data, parent, {
				this_: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.parent)
					.then(context => context?.parent)
					.then(context => context?.parent).result!)
			})
		}
	}
	export class Dtype<T extends
		{ name: 'existing', node:Cexisting, init:Texisting}|
		{ name: 'nonexisting', node:Cnonexisting, init:Tnonexisting}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'existing': return (init:Texisting, parent:Cyes__has_constraint) => new Cexisting(init, parent);
				case 'nonexisting': return (init:Tnonexisting, parent:Cyes__has_constraint) => new Cnonexisting(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'existing': return finalize_existing;
				case 'nonexisting': return finalize_nonexisting;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tyes__has_constraint['type'], parent:Cyes__has_constraint) {
			super(data, parent);
		}
		public get path() { return `<unknown>/type`; }
	}
}
export namespace Cnode_path_tail {
	export class Dhas_steps<T extends
		{ name: 'no', node:Cno__has_steps, init:Tno__has_steps}|
		{ name: 'yes', node:Cyes__has_steps, init:Tyes__has_steps}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__has_steps, parent:Cnode_path_tail) => new Cno__has_steps(init, parent);
				case 'yes': return (init:Tyes__has_steps, parent:Cnode_path_tail) => new Cyes__has_steps(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'no': return finalize_no__has_steps;
				case 'yes': return finalize_yes__has_steps;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tnode_path_tail['has steps'], parent:Cnode_path_tail) {
			super(data, parent);
		}
		public get path() { return `<unknown>/has steps`; }
	}
}
export namespace Cyes__has_steps {
	export class Dtail extends Cnode_path_tail {
		constructor(data:Tyes__has_steps['tail'], parent:Cyes__has_steps) {
			super(data, parent, {
				context: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.properties.type?.state.node.output.context()).result!),
				context_phase: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.properties.type?.state.node.output.context_phase()).result!),
				dependency_step: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.properties.type?.state.node.output.dependency_step()).result!),
				participation: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.participation()).result!)
			})
		}
	}
	export class Dtype<T extends
		{ name: 'group', node:Cgroup__type__yes, init:Tgroup__type__yes}|
		{ name: 'parent', node:Cparent, init:Tparent}|
		{ name: 'reference', node:Creference__type, init:Treference__type}|
		{ name: 'reference rule', node:Creference_rule, init:Treference_rule}|
		{ name: 'state', node:Cstate, init:Tstate}|
		{ name: 'state context rule', node:Cstate_context_rule, init:Tstate_context_rule}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'group': return (init:Tgroup__type__yes, parent:Cyes__has_steps) => new Cgroup__type__yes(init, parent);
				case 'parent': return (init:Tparent, parent:Cyes__has_steps) => new Cparent(init, parent);
				case 'reference': return (init:Treference__type, parent:Cyes__has_steps) => new Creference__type(init, parent);
				case 'reference rule': return (init:Treference_rule, parent:Cyes__has_steps) => new Creference_rule(init, parent);
				case 'state': return (init:Tstate, parent:Cyes__has_steps) => new Cstate(init, parent);
				case 'state context rule': return (init:Tstate_context_rule, parent:Cyes__has_steps) => new Cstate_context_rule(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'group': return finalize_group__type__yes;
				case 'parent': return finalize_parent;
				case 'reference': return finalize_reference__type;
				case 'reference rule': return finalize_reference_rule;
				case 'state': return finalize_state;
				case 'state context rule': return finalize_state_context_rule;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tyes__has_steps['type'], parent:Cyes__has_steps) {
			super(data, parent);
		}
		public get path() { return `<unknown>/type`; }
	}
}
export namespace Cgroup__type__yes {
	export class Dgroup_step extends Cproperty_step {
		public readonly inferences:{
			group: () => interface_.Cgroup__type__property
		}
		constructor(data:Tgroup__type__yes['group step'], parent:Cgroup__type__yes) {
			super(data, parent, {
				context: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.context()).result!),
				context_phase: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.context_phase()).result!)
			})
			this.inferences = {
				group: cache((detach:boolean) => {
					const interface__node_path_tail__has_steps__yes__type__group__group_step_nval = this;
					return resolve(this)
						.then(context => interface__node_path_tail__has_steps__yes__type__group__group_step_nval)
						.then(context => context?.component_root.output.property())
						.then(context => {
							if (context?.properties.type.state.name === 'group') {
								return resolve(context.properties.type.state.node as interface_.Cgroup__type__property).result;
							} else {
								return undefined;
							}
						}).result!;
				})

			}
		}
	}
}
export namespace Creference__type {
	export class Dreference extends Creference_property_step {
		public readonly inferences:{
			evaluation: () => interface_.Cevaluation_phase
		}
		constructor(data:Treference__type['reference'], parent:Creference__type) {
			super(data, parent, {
				context: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.context()).result!),
				context_phase: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.context_phase()).result!)
			})
			this.inferences = {
				evaluation: cache((detach:boolean) => {
					const interface__node_path_tail__has_steps__yes__type__reference__reference_nval = this;
					return resolve(this)
						.then(context => {
							const left = resolve(context)
								.then(context => interface__node_path_tail__has_steps__yes__type__reference__reference_nval)
								.then(context => context?.component_root.output.referencer())
								.then(context => context?.component_root.output.phase()).result;
							const right = resolve(context)
								.then(() => parent)
								.then(context => context?.component_root.input.context_phase()).result;
							return left!.variant.widening_index >= right.variant.widening_index ? left : undefined
						}).result!;
				})

			}
		}
	}
}
export namespace Creference_rule {
	export class Dreference extends Creference_property_step {
		constructor(data:Treference_rule['reference'], parent:Creference_rule) {
			super(data, parent, {
				context: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.context()).result!),
				context_phase: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.context_phase()).result!)
			})
		}
	}
	export class Drule extends Reference<interface_.Crules,string> {
		public readonly inferences:{
			evaluation: () => interface_.Cevaluation_phase
		}

		constructor(data:string, $this:Creference_rule) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.properties.reference)
				.then(context => context?.component_root.output.referencer())
				.then(context => context?.properties.rules)
				.then(context => {
					const entry = context?.properties.rules.get(this.entry)!;
					return resolve(entry).result;
				}).result!))
			this.inferences = {
				evaluation: cache((detach:boolean) => {
					const interface__node_path_tail__has_steps__yes__type__reference_rule__rule_nval = $this.properties.rule.ref;
					return resolve($this.properties.rule.ref)
						.then(context => {
							const left = resolve(context)
								.then(context => interface__node_path_tail__has_steps__yes__type__reference_rule__rule_nval)
								.then(context => context?.properties.evaluation)
								.then(context => context?.component_root.output.phase()).result;
							const right = resolve(context)
								.then(() => $this)
								.then(context => context?.component_root.input.context_phase()).result;
							return left!.variant.widening_index >= right.variant.widening_index ? left : undefined
						}).result!;
				})

			}
		}
		public get path() { return `<unknown>/rule`; }
	}
}
export namespace Cstate {
	export class Dstate extends Reference<interface_.Cstates,string> {

		constructor(data:string, $this:Cstate) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.properties.state_group_step?.inferences.state_group())
				.then(context => {
					const entry = context?.properties.states.get(this.entry)!;
					return resolve(entry).result;
				}).result!))
		}
		public get path() { return `<unknown>/state`; }
	}
	export class Dstate_group_step extends Cproperty_step {
		public readonly inferences:{
			state_group: () => interface_.Cstate_group
		}
		constructor(data:Tstate['state group step'], parent:Cstate) {
			super(data, parent, {
				context: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.context()).result!),
				context_phase: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.context_phase()).result!)
			})
			this.inferences = {
				state_group: cache((detach:boolean) => {
					const interface__node_path_tail__has_steps__yes__type__state__state_group_step_nval = this;
					return resolve(this)
						.then(context => interface__node_path_tail__has_steps__yes__type__state__state_group_step_nval)
						.then(context => context?.component_root.output.property())
						.then(context => {
							if (context?.properties.type.state.name === 'state group') {
								return resolve(context.properties.type.state.node as interface_.Cstate_group).result;
							} else {
								return undefined;
							}
						}).result!;
				})

			}
		}
	}
}
export namespace Cstate_context_rule {
	export class Dcontext_rule extends Reference<interface_.Crules,string> {
		public readonly inferences:{
			evaluation: () => interface_.Cevaluation_phase
		}

		constructor(data:string, $this:Cstate_context_rule) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.inferences.state())
				.then(context => context?.properties.context_rules)
				.then(context => {
					const entry = context?.properties.rules.get(this.entry)!;
					return resolve(entry).result;
				}).result!))
			this.inferences = {
				evaluation: cache((detach:boolean) => {
					const interface__node_path_tail__has_steps__yes__type__state_context_rule__context_rule_nval = $this.properties.context_rule.ref;
					return resolve($this.properties.context_rule.ref)
						.then(context => {
							const left = resolve(context)
								.then(context => interface__node_path_tail__has_steps__yes__type__state_context_rule__context_rule_nval)
								.then(context => context?.properties.evaluation)
								.then(context => context?.component_root.output.phase()).result;
							const right = resolve(context)
								.then(() => $this)
								.then(context => context?.component_root.input.context_phase()).result;
							return left!.variant.widening_index >= right.variant.widening_index ? left : undefined
						}).result!;
				})

			}
		}
		public get path() { return `<unknown>/context rule`; }
	}
}
export namespace Cnumber_type {
	export class Ddecimal_places<T extends
		{ name: 'no', node:Cno__decimal_places, init:Tno__decimal_places}|
		{ name: 'yes', node:Cyes__decimal_places, init:Tyes__decimal_places}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__decimal_places, parent:Cnumber_type) => new Cno__decimal_places(init, parent);
				case 'yes': return (init:Tyes__decimal_places, parent:Cnumber_type) => new Cyes__decimal_places(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'no': return finalize_no__decimal_places;
				case 'yes': return finalize_yes__decimal_places;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tnumber_type['decimal places'], parent:Cnumber_type) {
			super(data, parent);
		}
		public get path() { return `<unknown>/decimal places`; }
	}
	export class Dset<T extends
		{ name: 'integer', node:Cinteger__set, init:Tinteger__set}|
		{ name: 'natural', node:Cnatural__set, init:Tnatural__set}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'integer': return (init:Tinteger__set, parent:Cnumber_type) => new Cinteger__set(init, parent);
				case 'natural': return (init:Tnatural__set, parent:Cnumber_type) => new Cnatural__set(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'integer': return finalize_integer__set;
				case 'natural': return finalize_natural__set;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tnumber_type['set'], parent:Cnumber_type) {
			super(data, parent);
		}
		public get path() { return `<unknown>/set`; }
	}
	export class Dtype extends Reference<interface_.Cnumerical_types,string> {

		constructor(data:string, $this:Cnumber_type) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.root)
				.then(context => {
					const entry = context?.properties.numerical_types.get(this.entry)!;
					return resolve(entry).result;
				}).result!))
		}
		public get path() { return `<unknown>/type`; }
	}
}
export namespace Cyes__decimal_places {
	export class Dplaces extends AlanInteger {
		constructor(data:Tyes__decimal_places['places'], parent:Cyes__decimal_places) {
			number__is_positive(data);
			super(data);}
		public get path() { return `<unknown>/places`; }
	}
}
export namespace Coptional_evaluation_annotation {
	export class Dphase<T extends
		{ name: 'downstream', node:Cdownstream__phase__optional_evaluation_annotation, init:Tdownstream__phase__optional_evaluation_annotation}|
		{ name: 'inherited', node:Cinherited, init:Tinherited}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'downstream': return (init:Tdownstream__phase__optional_evaluation_annotation, parent:Coptional_evaluation_annotation) => new Cdownstream__phase__optional_evaluation_annotation(init, parent);
				case 'inherited': return (init:Tinherited, parent:Coptional_evaluation_annotation) => new Cinherited(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'downstream': return finalize_downstream__phase__optional_evaluation_annotation;
				case 'inherited': return finalize_inherited;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Toptional_evaluation_annotation['phase'], parent:Coptional_evaluation_annotation) {
			super(data, parent);
		}
		public get path() { return `<unknown>/phase`; }
	}
}
export namespace Cproperty_step {
	export class Dproperty extends Reference<interface_.Cproperty,string> {

		constructor(data:string, $this:Cproperty_step) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.component_root.input.context_phase())
				.then(context => {
					switch (context?.variant.name) {
						case 'downstream expressions': {
							return resolve(context)
								.then(() => $this)
								.then(context => context?.component_root.input.context())
								.then(context => {
									switch (context?.variant.name) {
										case 'attribute': {
											const interface__property_step__property___downstream_expressions___attribute_nval = context.cast('attribute');
											return resolve(context)
												.then(context => interface__property_step__property___downstream_expressions___attribute_nval)
												.then(context => {
													const entry = context?.parent.properties.attributes.get(this.entry)!;
													if (detach) {
														context._edges[`downstream attributes`].delete(this);
													} else {
														context._edges[`downstream attributes`].add(this);
													}return resolve(entry)
													.then(context => {
														if (context?.properties.type.state.name === 'property') {
															return context.properties.type.state.node as interface_.Cproperty;
														} else {
															return undefined;
														}
													}).result;
												}).result;
										}
										case 'node': {
											const interface__property_step__property___downstream_expressions___node_nval = context.cast('node');
											return resolve(context)
												.then(context => interface__property_step__property___downstream_expressions___node_nval)
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
												}).result;
										}
										case undefined: return undefined;
										default: throw new Error(`Unexpected subtype '${(<any>context).variant.name}'`);
									};
								}).result;
						}
						case 'upstream expressions': {
							return resolve(context)
								.then(() => $this)
								.then(context => context?.component_root.input.context())
								.then(context => {
									switch (context?.variant.name) {
										case 'attribute': {
											const interface__property_step__property___upstream_expressions___attribute_nval = context.cast('attribute');
											return resolve(context)
												.then(context => interface__property_step__property___upstream_expressions___attribute_nval)
												.then(context => {
													const entry = context?.parent.properties.attributes.get(this.entry)!;
													if (detach) {
														context._edges[`upstream attributes`].delete(this);
													} else {
														context._edges[`upstream attributes`].add(this);
													}return resolve(entry)
													.then(context => {
														if (context?.properties.type.state.name === 'property') {
															return context.properties.type.state.node as interface_.Cproperty;
														} else {
															return undefined;
														}
													}).result;
												}).result;
										}
										case 'node': {
											const interface__property_step__property___upstream_expressions___node_nval = context.cast('node');
											return resolve(context)
												.then(context => interface__property_step__property___upstream_expressions___node_nval)
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
												}).result;
										}
										case undefined: return undefined;
										default: throw new Error(`Unexpected subtype '${(<any>context).variant.name}'`);
									};
								}).result;
						}
						case undefined: return undefined;
						default: throw new Error(`Unexpected subtype '${(<any>context).variant.name}'`);
					};
				}).result!))
		}
		public get path() { return `<unknown>/property`; }
	}
}
export namespace Creference_property_step {
	export class Dproperty extends Cproperty_step {
		public readonly inferences:{
			existing_entry: () => interface_.Cexisting,
			reference: () => interface_.Cyes__has_constraint,
			text: () => interface_.Ctext
		}
		constructor(data:Treference_property_step['property'], parent:Creference_property_step) {
			super(data, parent, {
				context: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.context()).result!),
				context_phase: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.context_phase()).result!)
			})
			this.inferences = {
				existing_entry: cache((detach:boolean) => {
					const interface__reference_property_step__property_nval = this;
					return resolve(this)
						.then(() => parent.properties.property.inferences.reference())
						.then(context => {
							if (context?.properties.type.state.name === 'existing') {
								return resolve(context.properties.type.state.node as interface_.Cexisting).result;
							} else {
								return undefined;
							}
						}).result!;
				})
				,
				reference: cache((detach:boolean) => {
					const interface__reference_property_step__property_nval = this;
					return resolve(this)
						.then(() => parent.properties.property.inferences.text())
						.then(context => {
							if (context?.properties.has_constraint.state.name === 'yes') {
								return resolve(context.properties.has_constraint.state.node as interface_.Cyes__has_constraint).result;
							} else {
								return undefined;
							}
						}).result!;
				})
				,
				text: cache((detach:boolean) => {
					const interface__reference_property_step__property_nval = this;
					return resolve(this)
						.then(context => interface__reference_property_step__property_nval)
						.then(context => context?.properties.property?.ref)
						.then(context => {
							if (context?.properties.type.state.name === 'text') {
								return resolve(context.properties.type.state.node as interface_.Ctext).result;
							} else {
								return undefined;
							}
						}).result!;
				})

			}
		}
	}
}
export namespace Creferencer {
	export class Devaluation extends Cexplicit_evaluation_annotation {
		constructor(data:Treferencer['evaluation'], parent:Creferencer) {
			super(data, parent)
		}
	}
	export class Drules extends Cwhere_clause {
		constructor(data:Treferencer['rules'], parent:Creferencer) {
			super(data, parent, {
				context: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.properties.tail)
					.then(context => context?.component_root.output.context())
					.then(context => context?.definitions.optional_navigation_context).result!),
				context_phase: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.properties.tail)
					.then(context => context?.component_root.output.context_phase()).result!),
				this_: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(() => interface_.Coptional_target_context.Pinaccessible).result!)
			})
		}
	}
	export class Dtail extends Cnode_path_tail {
		constructor(data:Treferencer['tail'], parent:Creferencer) {
			super(data, parent, {
				context: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.properties.type?.state.node.output.collection())
					.then(context => context?.properties.node)
					.then(context => {
						const conv_context = resolve(context).result!;
						return new Cnavigation_context({name: 'node', definition: conv_context});
					}).result!),
				context_phase: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.properties.path)
					.then(context => context?.properties.tail)
					.then(context => context?.component_root.output.context_phase()).result!),
				dependency_step: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(() => interface_.Cdependency_step.Pdisallowed).result!),
				participation: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(() => interface_.Cparticipation.Pconditional).result!)
			})
		}
	}
	export class Dtype<T extends
		{ name: 'sibling', node:Csibling, init:Tsibling}|
		{ name: 'unrestricted', node:Cunrestricted, init:Tunrestricted}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'sibling': return (init:Tsibling, parent:Creferencer) => new Csibling(init, parent);
				case 'unrestricted': return (init:Tunrestricted, parent:Creferencer) => new Cunrestricted(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'sibling': return finalize_sibling;
				case 'unrestricted': return finalize_unrestricted;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Treferencer['type'], parent:Creferencer) {
			super(data, parent);
		}
		public get path() { return `<unknown>/type`; }
	}
}
export namespace Cpath {
	export class Dhead extends Ccontext_node_path {
		constructor(data:Tpath['head'], parent:Cpath) {
			super(data, parent, {
				context: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(() => interface_.Coptional_navigation_context.Pnone).result!),
				context_phase: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(() => interface_.Cevaluation_phase.Pupstream_expressions).result!),
				this_: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.this_())
					.then(context => {
						const conv_context = resolve(context)
							.then(context => context?.definitions.member).result!;
						return new Coptional_target_context({name: 'member', definition: conv_context});
					}).result!),
				this_phase: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.parent)
					.then(context => context?.properties.evaluation)
					.then(context => context?.component_root.output.phase()).result!)
			})
		}
	}
	export class Dtail extends Cnode_path_tail {
		constructor(data:Tpath['tail'], parent:Cpath) {
			super(data, parent, {
				context: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.properties.head)
					.then(context => context?.component_root.output.context()).result!),
				context_phase: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.properties.head)
					.then(context => context?.component_root.output.phase()).result!),
				dependency_step: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(() => interface_.Cdependency_step.Pallowed).result!),
				participation: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(() => interface_.Cparticipation.Psingular).result!)
			})
		}
	}
}
export namespace Csibling {
	export class Dgraph_participation<T extends
		{ name: 'no', node:Cno__graph_participation, init:Tno__graph_participation}|
		{ name: 'yes', node:Cyes__graph_participation, init:Tyes__graph_participation}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__graph_participation, parent:Csibling) => new Cno__graph_participation(init, parent);
				case 'yes': return (init:Tyes__graph_participation, parent:Csibling) => new Cyes__graph_participation(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'no': return finalize_no__graph_participation;
				case 'yes': return finalize_yes__graph_participation;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tsibling['graph participation'], parent:Csibling) {
			super(data, parent);
		}
		public get path() { return `<unknown>/graph participation`; }
	}
}
export namespace Cyes__graph_participation {
	export class Dgraphs extends AlanDictionary<{ node:Cgraphs__yes, init:Tgraphs__yes},Cyes__graph_participation> {
		protected initialize(parent:Cyes__graph_participation, key:string) { return new Cgraphs__yes(key, {}, parent); }
		protected finalize = finalize_graphs__yes
		public get path() { return `${this.parent.path}/graphs`; }
		constructor(data:Tyes__graph_participation['graphs'], parent:Cyes__graph_participation) {
			super(data, parent);
		}
	}
}
export namespace Cunrestricted {
	export class Dcollection_step extends Cproperty_step {
		public readonly inferences:{
			collection: () => interface_.Ccollection
		}
		constructor(data:Tunrestricted['collection step'], parent:Cunrestricted) {
			super(data, parent, {
				context: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.parent)
					.then(context => context?.properties.path)
					.then(context => context?.properties.tail)
					.then(context => context?.component_root.output.context()).result!),
				context_phase: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.parent)
					.then(context => context?.properties.path)
					.then(context => context?.properties.tail)
					.then(context => context?.component_root.output.context_phase()).result!)
			})
			this.inferences = {
				collection: cache((detach:boolean) => {
					const interface__referencer__type__unrestricted__collection_step_nval = this;
					return resolve(this)
						.then(context => interface__referencer__type__unrestricted__collection_step_nval)
						.then(context => context?.component_root.output.property())
						.then(context => {
							if (context?.properties.type.state.name === 'collection') {
								return resolve(context.properties.type.state.node as interface_.Ccollection).result;
							} else {
								return undefined;
							}
						}).result!;
				})

			}
		}
	}
}
export namespace Cwhere_clause {
	export class Dhas_rule<T extends
		{ name: 'no', node:Cno__has_rule, init:Tno__has_rule}|
		{ name: 'yes', node:Cyes__has_rule, init:Tyes__has_rule}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__has_rule, parent:Cwhere_clause) => new Cno__has_rule(init, parent);
				case 'yes': return (init:Tyes__has_rule, parent:Cwhere_clause) => new Cyes__has_rule(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'no': return finalize_no__has_rule;
				case 'yes': return finalize_yes__has_rule;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Twhere_clause['has rule'], parent:Cwhere_clause) {
			super(data, parent);
		}
		public get path() { return `<unknown>/has rule`; }
	}
	export class Drules extends AlanTopology<{ node:Crules, init:Trules},Cwhere_clause,'dependencies'|'order'> {
		protected _graphs: {
			'dependencies': Array<Crules>,
			'order': Array<Crules>
		} = {

			'dependencies': [],
			'order': []
		}
		protected initialize(parent:Cwhere_clause, key:string, entry_init:Trules) { return new Crules(key, entry_init, parent); }
		protected finalize = finalize_rules
		public get path() { return `${this.parent.path}/rules`; }
		constructor(data:Twhere_clause['rules'], parent:Cwhere_clause) {
			super(data, parent);
		}
	}
}
export namespace Cyes__has_rule {
	export class Dfirst extends Reference<interface_.Crules,string> {

		constructor(data:string, $this:Cyes__has_rule) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.parent)
				.then(context => {
					const entry = context?.properties.rules.get(this.entry)!;
					return resolve(entry).result;
				}).result!))
		}
		public get path() { return `<unknown>/first`; }
	}
}
export namespace Crules {
	export class Dcontext<T extends
		{ name: 'context', node:Ccontext, init:Tcontext}|
		{ name: 'sibling rule', node:Csibling_rule, init:Tsibling_rule}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'context': return (init:Tcontext, parent:Crules) => new Ccontext(init, parent);
				case 'sibling rule': return (init:Tsibling_rule, parent:Crules) => new Csibling_rule(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'context': return finalize_context;
				case 'sibling rule': return finalize_sibling_rule;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Trules['context'], parent:Crules) {
			super(data, parent);
		}
		public get path() { return `<unknown>/context`; }
	}
	export class Devaluation extends Coptional_evaluation_annotation {
		constructor(data:Trules['evaluation'], parent:Crules) {
			super(data, parent, {
				context: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.context()).result!),
				context_phase: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.context_phase()).result!)
			})
		}
	}
	export class Dhas_successor<T extends
		{ name: 'no', node:Cno__has_successor, init:Tno__has_successor}|
		{ name: 'yes', node:Cyes__has_successor, init:Tyes__has_successor}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__has_successor, parent:Crules) => new Cno__has_successor(init, parent);
				case 'yes': return (init:Tyes__has_successor, parent:Crules) => new Cyes__has_successor(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'no': return finalize_no__has_successor;
				case 'yes': return finalize_yes__has_successor;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Trules['has successor'], parent:Crules) {
			super(data, parent);
		}
		public get path() { return `<unknown>/has successor`; }
	}
	export class Dtail extends Cnode_path_tail {
		constructor(data:Trules['tail'], parent:Crules) {
			super(data, parent, {
				context: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.properties.context?.state.node.output.context()).result!),
				context_phase: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.properties.context?.state.node.output.phase()).result!),
				dependency_step: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(() => interface_.Cdependency_step.Pallowed).result!),
				participation: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(() => interface_.Cparticipation.Pconditional).result!)
			})
		}
	}
}
export namespace Ccontext {
	export class Dpath extends Ccontext_node_path {
		constructor(data:Tcontext['path'], parent:Ccontext) {
			super(data, parent, {
				context: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.context()).result!),
				context_phase: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.context_phase()).result!),
				this_: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.component_root.input.this_()).result!),
				this_phase: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.parent)
					.then(context => context?.properties.evaluation)
					.then(context => context?.component_root.output.phase()).result!)
			})
		}
	}
}
export namespace Csibling_rule {
	export class Drule extends Reference<interface_.Crules,string> {
		public readonly inferences:{
			evaluation: () => interface_.Cevaluation_phase
		}

		constructor(data:string, $this:Csibling_rule) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.parent)
				.then(context => {
					const entry = context?.parent.properties.rules.get(this.entry)!;
					if (detach) {
						context._edges[`dependencies`].delete(this);
					} else {
						context._edges[`dependencies`].add(this);
					}return resolve(entry).result;
				}).result!))
			this.inferences = {
				evaluation: cache((detach:boolean) => {
					const interface__where_clause__rules__context__sibling_rule__rule_nval = $this.properties.rule.ref;
					return resolve($this.properties.rule.ref)
						.then(context => {
							const left = resolve(context)
								.then(context => interface__where_clause__rules__context__sibling_rule__rule_nval)
								.then(context => context?.properties.evaluation)
								.then(context => context?.component_root.output.phase()).result;
							const right = resolve(context)
								.then(() => $this)
								.then(context => context?.parent)
								.then(context => context?.properties.evaluation)
								.then(context => context?.component_root.output.phase()).result;
							return left!.variant.widening_index >= right.variant.widening_index ? left : undefined
						}).result!;
				})

			}
		}
		public get path() { return `<unknown>/rule`; }
	}
}
export namespace Cyes__has_successor {
	export class Drule extends Reference<interface_.Crules,string> {

		constructor(data:string, $this:Cyes__has_successor) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.parent)
				.then(context => {
					const entry = context?.parent.properties.rules.get(this.entry)!;
					if (detach) {
						context._edges[`order`].delete(this);
					} else {
						context._edges[`order`].add(this);
					}return resolve(entry).result;
				}).result!))
		}
		public get path() { return `<unknown>/rule`; }
	}
}
export namespace Cinterface {
	export class Dcontext_keys extends AlanDictionary<{ node:Ccontext_keys, init:Tcontext_keys},Cinterface> {
		protected initialize(parent:Cinterface, key:string) { return new Ccontext_keys(key, {}, parent); }
		protected finalize = finalize_context_keys
		public get path() { return `${this.parent.path}/context keys`; }
		constructor(data:Tinterface['context keys'], parent:Cinterface) {
			super(data, parent);
		}
	}
	export class Dnumerical_types extends AlanDictionary<{ node:Cnumerical_types, init:Tnumerical_types},Cinterface> {
		protected initialize(parent:Cinterface, key:string) { return new Cnumerical_types(key, {}, parent); }
		protected finalize = finalize_numerical_types
		public get path() { return `${this.parent.path}/numerical types`; }
		constructor(data:Tinterface['numerical types'], parent:Cinterface) {
			super(data, parent);
		}
	}
	export class Droot extends Cnode {
		constructor(data:Tinterface['root'], parent:Cinterface) {
			super(data, parent, {
				entity: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.definitions.entity).result!),
				location: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.definitions.root_location)
					.then(context => context?.definitions.node_location).result!)
			})
		}
	}
}
function finalize_dataset_root(obj:Cdataset_root, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cmember>obj.inferences.accessible_this_context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.inferences.root_context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.output.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.phase)(detach) !== undefined || detach);
}
function finalize_expression_context(obj:Cexpression_context, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.inferences.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.output.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.phase)(detach) !== undefined || detach);
}
function finalize_this_dataset_node(obj:Cthis_dataset_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cattributes>obj.inferences.accessible_this_context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cattributes>obj.inferences.data_attribute)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.output.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.phase)(detach) !== undefined || detach);
}
function finalize_this_parameter_node(obj:Cthis_parameter_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cattributes>obj.inferences.accessible_this_context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Ccommand>obj.inferences.command)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.output.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.phase)(detach) !== undefined || detach);
}
function finalize_context_node_path(obj:Ccontext_node_path, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Coptional_navigation_context>obj.input.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.input.context_phase)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Coptional_target_context>obj.input.this_)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.input.this_phase)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.output.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.phase)(detach) !== undefined || detach);
	switch (obj.properties.context.state.name) {
		case 'dataset root': finalize_dataset_root(obj.properties.context.state.node, detach); break;
		case 'expression context': finalize_expression_context(obj.properties.context.state.node, detach); break;
		case 'this dataset node': finalize_this_dataset_node(obj.properties.context.state.node, detach); break;
		case 'this parameter node': finalize_this_parameter_node(obj.properties.context.state.node, detach); break;
	}
}
function finalize_dependency_step(obj:Cdependency_step, detach:boolean = false) {
}
function finalize_entity(obj:Centity, detach:boolean = false) {
}
function finalize_evaluation_phase(obj:Cevaluation_phase, detach:boolean = false) {
}
function finalize_downstream__phase__explicit_evaluation_annotation(obj:Cdownstream__phase__explicit_evaluation_annotation, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.phase)(detach) !== undefined || detach);
}
function finalize_upstream(obj:Cupstream, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.phase)(detach) !== undefined || detach);
}
function finalize_explicit_evaluation_annotation(obj:Cexplicit_evaluation_annotation, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.phase)(detach) !== undefined || detach);
	switch (obj.properties.phase.state.name) {
		case 'downstream': finalize_downstream__phase__explicit_evaluation_annotation(obj.properties.phase.state.node, detach); break;
		case 'upstream': finalize_upstream(obj.properties.phase.state.node, detach); break;
	}
}
function finalize_acyclic(obj:Cacyclic, detach:boolean = false) {
}
function finalize_ordered(obj:Cordered, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cproperty>(obj.properties.ordering_property as any).resolve)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cyes__graph_participation>obj.properties.ordering_property.inferences.graph_participation)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cgraphs__yes>obj.properties.ordering_property.inferences.participates_in_this_graph)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cyes__has_constraint>obj.properties.ordering_property.inferences.reference)(detach) !== undefined || detach);
	finalize_node_path_tail(obj.properties.path, detach);
}
function finalize_graphs__graphs_definition(obj:Cgraphs__graphs_definition, detach:boolean = false) {
	switch (obj.properties.type.state.name) {
		case 'acyclic': finalize_acyclic(obj.properties.type.state.node, detach); break;
		case 'ordered': finalize_ordered(obj.properties.type.state.node, detach); break;
	}
}
function finalize_graphs_definition(obj:Cgraphs_definition, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Ccollection>obj.input.collection)(detach) !== undefined || detach);
	for (const [_key, entry] of obj.properties.graphs) {
		finalize_graphs__graphs_definition(entry, detach);
	}
	if (!detach) {
	}
}
function finalize_member(obj:Cmember, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cmember>obj.input.context_root_member)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cmember_type>obj.input.member_type)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cmember>obj.output.context_root_member)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cmember_type>obj.output.member_type)(detach) !== undefined || detach);
}
function finalize_member_type(obj:Cmember_type, detach:boolean = false) {
}
function finalize_navigation_context(obj:Cnavigation_context, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnode>obj.output.node)(detach) !== undefined || detach);
	finalize_optional_navigation_context(obj.definitions.optional_navigation_context, detach);
}
function finalize_no__has_predecessor(obj:Cno__has_predecessor, detach:boolean = false) {
}
function finalize_yes__has_predecessor(obj:Cyes__has_predecessor, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cattributes>(obj.properties.attribute as any).resolve)(detach) !== undefined || detach);
}
function finalize_command(obj:Ccommand, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cinterface>obj.inferences.dataset_attribute)(detach) !== undefined || detach);
	finalize_root_location(obj.definitions.root_location, detach);
	finalize_node(obj.properties.parameters, detach);
}
function finalize_dense_map(obj:Cdense_map, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Ccommand>obj.inferences.command_parameter)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cyes__has_constraint>obj.inferences.key_constraint)(detach) !== undefined || detach);
}
function finalize_simple__type(obj:Csimple__type, detach:boolean = false) {
}
function finalize_collection(obj:Ccollection, detach:boolean = false) {
	finalize_entity(obj.definitions.entity, detach);
	finalize_node_location(obj.definitions.node_location, detach);
	finalize_graphs_definition(obj.properties.graphs, detach);
	assert((<(detach?:boolean) => interface_.Ctext>(obj.properties.key_property as any).resolve)(detach) !== undefined || detach);
	finalize_node(obj.properties.node, detach);
	switch (obj.properties.type.state.name) {
		case 'dense map': finalize_dense_map(obj.properties.type.state.node, detach); break;
		case 'simple': finalize_simple__type(obj.properties.type.state.node, detach); break;
	}
}
function finalize_file(obj:Cfile, detach:boolean = false) {
}
function finalize_group__type__property(obj:Cgroup__type__property, detach:boolean = false) {
	finalize_node_location(obj.definitions.node_location, detach);
	finalize_node(obj.properties.node, detach);
}
function finalize_number(obj:Cnumber, detach:boolean = false) {
	finalize_number_type(obj.properties.type, detach);
}
function finalize_states(obj:Cstates, detach:boolean = false) {
	finalize_node_location(obj.definitions.node_location, detach);
	finalize_where_clause(obj.properties.context_rules, detach);
	finalize_node(obj.properties.node, detach);
}
function finalize_state_group(obj:Cstate_group, detach:boolean = false) {
	for (const [_key, entry] of obj.properties.states) {
		finalize_states(entry, detach);
	}
	if (!detach) {
		if (obj.properties.states.size === 0) {
			throw new Error(`Collection cannot be empty!`);
		}
	}
}
function finalize_no__has_constraint(obj:Cno__has_constraint, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Creference__interface>obj.output.reference)(detach) !== undefined || detach);
}
function finalize_existing(obj:Cexisting, detach:boolean = false) {
}
function finalize_nonexisting(obj:Cnonexisting, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Ccommand>obj.inferences.command_parameter)(detach) !== undefined || detach);
}
function finalize_yes__has_constraint(obj:Cyes__has_constraint, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Creference__interface>obj.output.reference)(detach) !== undefined || detach);
	finalize_referencer(obj.properties.referencer, detach);
	switch (obj.properties.type.state.name) {
		case 'existing': finalize_existing(obj.properties.type.state.node, detach); break;
		case 'nonexisting': finalize_nonexisting(obj.properties.type.state.node, detach); break;
	}
}
function finalize_text(obj:Ctext, detach:boolean = false) {
	switch (obj.properties.has_constraint.state.name) {
		case 'no': finalize_no__has_constraint(obj.properties.has_constraint.state.node, detach); break;
		case 'yes': finalize_yes__has_constraint(obj.properties.has_constraint.state.node, detach); break;
	}
}
function finalize_property(obj:Cproperty, detach:boolean = false) {
	switch (obj.properties.type.state.name) {
		case 'collection': finalize_collection(obj.properties.type.state.node, detach); break;
		case 'file': finalize_file(obj.properties.type.state.node, detach); break;
		case 'group': finalize_group__type__property(obj.properties.type.state.node, detach); break;
		case 'number': finalize_number(obj.properties.type.state.node, detach); break;
		case 'state group': finalize_state_group(obj.properties.type.state.node, detach); break;
		case 'text': finalize_text(obj.properties.type.state.node, detach); break;
	}
}
function finalize_attributes(obj:Cattributes, detach:boolean = false) {
	finalize_member(obj.definitions.member, detach);
	switch (obj.properties.has_predecessor.state.name) {
		case 'no': finalize_no__has_predecessor(obj.properties.has_predecessor.state.node, detach); break;
		case 'yes': finalize_yes__has_predecessor(obj.properties.has_predecessor.state.node, detach); break;
	}
	switch (obj.properties.type.state.name) {
		case 'command': finalize_command(obj.properties.type.state.node, detach); break;
		case 'property': finalize_property(obj.properties.type.state.node, detach); break;
	}
}
function finalize_node(obj:Cnode, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Centity>obj.input.entity)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnode_location>obj.input.location)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Centity>obj.output.entity)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnode_location>obj.output.location)(detach) !== undefined || detach);
	finalize_node_parent(obj.definitions.node_parent, detach);
	for (const [_key, entry] of obj.properties.attributes) {
		finalize_attributes(entry, detach);
	}
	if (!detach) {
		(obj.properties.attributes as unknown as AlanTopology<{node:Cattributes,init:Tattributes}, Cnode, 'downstream attributes'>).topo_sort(`downstream attributes`);
		(obj.properties.attributes as unknown as AlanTopology<{node:Cattributes,init:Tattributes}, Cnode, 'upstream attributes'>).topo_sort(`upstream attributes`);
		(obj.properties.attributes as unknown as AlanTopology<{node:Cattributes,init:Tattributes}, Cnode, 'upstream attributes'>).totally_ordered(`upstream attributes`);
	}
}
function finalize_node_location(obj:Cnode_location, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cmember>obj.input.member)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnode_parent>obj.input.node)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Croot_location>obj.input.root)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cmember>obj.output.member)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnode_parent>obj.output.node)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Croot_location>obj.output.root)(detach) !== undefined || detach);
}
function finalize_node_parent(obj:Cnode_parent, detach:boolean = false) {
}
function finalize_no__has_steps(obj:Cno__has_steps, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.output.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.context_phase)(detach) !== undefined || detach);
}
function finalize_group__type__yes(obj:Cgroup__type__yes, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.output.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.context_phase)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cdependency_step>obj.output.dependency_step)(detach) !== undefined || detach);
	finalize_property_step(obj.properties.group_step, detach);
	assert((<(detach?:boolean) => interface_.Cgroup__type__property>obj.properties.group_step.inferences.group)(detach) !== undefined || detach);
}
function finalize_parent(obj:Cparent, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.inferences.parent_context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Centity>obj.inferences.parent_entity)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.output.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.context_phase)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cdependency_step>obj.output.dependency_step)(detach) !== undefined || detach);
}
function finalize_reference__type(obj:Creference__type, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Callowed>obj.inferences.dependency_allowed)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.output.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.context_phase)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cdependency_step>obj.output.dependency_step)(detach) !== undefined || detach);
	finalize_reference_property_step(obj.properties.reference, detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.properties.reference.inferences.evaluation)(detach) !== undefined || detach);
}
function finalize_reference_rule(obj:Creference_rule, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Callowed>obj.inferences.dependency_allowed)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.output.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.context_phase)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cdependency_step>obj.output.dependency_step)(detach) !== undefined || detach);
	finalize_reference_property_step(obj.properties.reference, detach);
	assert((<(detach?:boolean) => interface_.Crules>(obj.properties.rule as any).resolve)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.properties.rule.inferences.evaluation)(detach) !== undefined || detach);
}
function finalize_state(obj:Cstate, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cconditional>obj.inferences.conditional_result)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.output.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.context_phase)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cdependency_step>obj.output.dependency_step)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cstates>(obj.properties.state as any).resolve)(detach) !== undefined || detach);
	finalize_property_step(obj.properties.state_group_step, detach);
	assert((<(detach?:boolean) => interface_.Cstate_group>obj.properties.state_group_step.inferences.state_group)(detach) !== undefined || detach);
}
function finalize_state_context_rule(obj:Cstate_context_rule, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cstates>obj.inferences.state)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.output.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.context_phase)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cdependency_step>obj.output.dependency_step)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Crules>(obj.properties.context_rule as any).resolve)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.properties.context_rule.inferences.evaluation)(detach) !== undefined || detach);
}
function finalize_yes__has_steps(obj:Cyes__has_steps, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.output.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.context_phase)(detach) !== undefined || detach);
	finalize_node_path_tail(obj.properties.tail, detach);
	switch (obj.properties.type.state.name) {
		case 'group': finalize_group__type__yes(obj.properties.type.state.node, detach); break;
		case 'parent': finalize_parent(obj.properties.type.state.node, detach); break;
		case 'reference': finalize_reference__type(obj.properties.type.state.node, detach); break;
		case 'reference rule': finalize_reference_rule(obj.properties.type.state.node, detach); break;
		case 'state': finalize_state(obj.properties.type.state.node, detach); break;
		case 'state context rule': finalize_state_context_rule(obj.properties.type.state.node, detach); break;
	}
}
function finalize_node_path_tail(obj:Cnode_path_tail, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.input.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.input.context_phase)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cdependency_step>obj.input.dependency_step)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cparticipation>obj.input.participation)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.output.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.context_phase)(detach) !== undefined || detach);
	switch (obj.properties.has_steps.state.name) {
		case 'no': finalize_no__has_steps(obj.properties.has_steps.state.node, detach); break;
		case 'yes': finalize_yes__has_steps(obj.properties.has_steps.state.node, detach); break;
	}
}
function finalize_number_set_type(obj:Cnumber_set_type, detach:boolean = false) {
}
function finalize_no__decimal_places(obj:Cno__decimal_places, detach:boolean = false) {
}
function finalize_yes__decimal_places(obj:Cyes__decimal_places, detach:boolean = false) {
}
function finalize_integer__set(obj:Cinteger__set, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnumber_set_type>obj.output.set_type)(detach) !== undefined || detach);
}
function finalize_natural__set(obj:Cnatural__set, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnumber_set_type>obj.output.set_type)(detach) !== undefined || detach);
}
function finalize_number_type(obj:Cnumber_type, detach:boolean = false) {
	switch (obj.properties.decimal_places.state.name) {
		case 'no': finalize_no__decimal_places(obj.properties.decimal_places.state.node, detach); break;
		case 'yes': finalize_yes__decimal_places(obj.properties.decimal_places.state.node, detach); break;
	}
	switch (obj.properties.set.state.name) {
		case 'integer': finalize_integer__set(obj.properties.set.state.node, detach); break;
		case 'natural': finalize_natural__set(obj.properties.set.state.node, detach); break;
	}
	assert((<(detach?:boolean) => interface_.Cnumerical_types>(obj.properties.type as any).resolve)(detach) !== undefined || detach);
}
function finalize_downstream__phase__optional_evaluation_annotation(obj:Cdownstream__phase__optional_evaluation_annotation, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnone__optional_navigation_context>obj.inferences.no_referenced_context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.phase)(detach) !== undefined || detach);
}
function finalize_inherited(obj:Cinherited, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.phase)(detach) !== undefined || detach);
}
function finalize_optional_evaluation_annotation(obj:Coptional_evaluation_annotation, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Coptional_navigation_context>obj.input.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.input.context_phase)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.phase)(detach) !== undefined || detach);
	switch (obj.properties.phase.state.name) {
		case 'downstream': finalize_downstream__phase__optional_evaluation_annotation(obj.properties.phase.state.node, detach); break;
		case 'inherited': finalize_inherited(obj.properties.phase.state.node, detach); break;
	}
}
function finalize_optional_navigation_context(obj:Coptional_navigation_context, detach:boolean = false) {
}
function finalize_optional_target_context(obj:Coptional_target_context, detach:boolean = false) {
}
function finalize_participation(obj:Cparticipation, detach:boolean = false) {
}
function finalize_property_step(obj:Cproperty_step, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.input.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.input.context_phase)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cproperty>obj.output.property)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cproperty>(obj.properties.property as any).resolve)(detach) !== undefined || detach);
}
function finalize_reference__interface(obj:Creference__interface, detach:boolean = false) {
}
function finalize_reference_property_step(obj:Creference_property_step, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.input.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.input.context_phase)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Creferencer>obj.output.referencer)(detach) !== undefined || detach);
	finalize_property_step(obj.properties.property, detach);
	assert((<(detach?:boolean) => interface_.Cexisting>obj.properties.property.inferences.existing_entry)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cyes__has_constraint>obj.properties.property.inferences.reference)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Ctext>obj.properties.property.inferences.text)(detach) !== undefined || detach);
}
function finalize_path(obj:Cpath, detach:boolean = false) {
	finalize_context_node_path(obj.properties.head, detach);
	finalize_node_path_tail(obj.properties.tail, detach);
}
function finalize_no__graph_participation(obj:Cno__graph_participation, detach:boolean = false) {
}
function finalize_graphs__yes(obj:Cgraphs__yes, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cgraphs__graphs_definition>(obj.key as any).resolve)(detach) !== undefined || detach);
}
function finalize_yes__graph_participation(obj:Cyes__graph_participation, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cattributes>obj.inferences.head_result_ancestor)(detach) !== undefined || detach);
	for (const [_key, entry] of obj.properties.graphs) {
		finalize_graphs__yes(entry, detach);
	}
	if (!detach) {
		if (obj.properties.graphs.size === 0) {
			throw new Error(`Collection cannot be empty!`);
		}
	}
}
function finalize_sibling(obj:Csibling, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Ccollection>obj.inferences.collection)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Ccollection>obj.output.collection)(detach) !== undefined || detach);
	switch (obj.properties.graph_participation.state.name) {
		case 'no': finalize_no__graph_participation(obj.properties.graph_participation.state.node, detach); break;
		case 'yes': finalize_yes__graph_participation(obj.properties.graph_participation.state.node, detach); break;
	}
}
function finalize_unrestricted(obj:Cunrestricted, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Ccollection>obj.output.collection)(detach) !== undefined || detach);
	finalize_property_step(obj.properties.collection_step, detach);
	assert((<(detach?:boolean) => interface_.Ccollection>obj.properties.collection_step.inferences.collection)(detach) !== undefined || detach);
}
function finalize_referencer(obj:Creferencer, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cattributes>obj.input.this_)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.phase)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnode>obj.output.referenced_node)(detach) !== undefined || detach);
	finalize_reference__interface(obj.definitions.reference, detach);
	finalize_explicit_evaluation_annotation(obj.properties.evaluation, detach);
	finalize_path(obj.properties.path, detach);
	finalize_where_clause(obj.properties.rules, detach);
	finalize_node_path_tail(obj.properties.tail, detach);
	switch (obj.properties.type.state.name) {
		case 'sibling': finalize_sibling(obj.properties.type.state.node, detach); break;
		case 'unrestricted': finalize_unrestricted(obj.properties.type.state.node, detach); break;
	}
}
function finalize_root_location(obj:Croot_location, detach:boolean = false) {
	finalize_node_location(obj.definitions.node_location, detach);
}
function finalize_no__has_rule(obj:Cno__has_rule, detach:boolean = false) {
}
function finalize_yes__has_rule(obj:Cyes__has_rule, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Crules>(obj.properties.first as any).resolve)(detach) !== undefined || detach);
}
function finalize_context(obj:Ccontext, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.output.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.phase)(detach) !== undefined || detach);
	finalize_context_node_path(obj.properties.path, detach);
}
function finalize_sibling_rule(obj:Csibling_rule, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnavigation_context>obj.output.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.output.phase)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Crules>(obj.properties.rule as any).resolve)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.properties.rule.inferences.evaluation)(detach) !== undefined || detach);
}
function finalize_no__has_successor(obj:Cno__has_successor, detach:boolean = false) {
}
function finalize_yes__has_successor(obj:Cyes__has_successor, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Crules>(obj.properties.rule as any).resolve)(detach) !== undefined || detach);
}
function finalize_rules(obj:Crules, detach:boolean = false) {
	switch (obj.properties.context.state.name) {
		case 'context': finalize_context(obj.properties.context.state.node, detach); break;
		case 'sibling rule': finalize_sibling_rule(obj.properties.context.state.node, detach); break;
	}
	finalize_optional_evaluation_annotation(obj.properties.evaluation, detach);
	switch (obj.properties.has_successor.state.name) {
		case 'no': finalize_no__has_successor(obj.properties.has_successor.state.node, detach); break;
		case 'yes': finalize_yes__has_successor(obj.properties.has_successor.state.node, detach); break;
	}
	finalize_node_path_tail(obj.properties.tail, detach);
}
function finalize_where_clause(obj:Cwhere_clause, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Coptional_navigation_context>obj.input.context)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cevaluation_phase>obj.input.context_phase)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Coptional_target_context>obj.input.this_)(detach) !== undefined || detach);
	switch (obj.properties.has_rule.state.name) {
		case 'no': finalize_no__has_rule(obj.properties.has_rule.state.node, detach); break;
		case 'yes': finalize_yes__has_rule(obj.properties.has_rule.state.node, detach); break;
	}
	for (const [_key, entry] of obj.properties.rules) {
		finalize_rules(entry, detach);
	}
	if (!detach) {
		(obj.properties.rules as unknown as AlanTopology<{node:Crules,init:Trules}, Cwhere_clause, 'dependencies'>).topo_sort(`dependencies`);
		(obj.properties.rules as unknown as AlanTopology<{node:Crules,init:Trules}, Cwhere_clause, 'order'>).topo_sort(`order`);
		(obj.properties.rules as unknown as AlanTopology<{node:Crules,init:Trules}, Cwhere_clause, 'order'>).totally_ordered(`order`);
	}
}
function finalize_context_keys(obj:Ccontext_keys, detach:boolean = false) {
}
function finalize_numerical_types(obj:Cnumerical_types, detach:boolean = false) {
}
function finalize_interface(obj:Cinterface, detach:boolean = false) {
	finalize_entity(obj.definitions.entity, detach);
	finalize_root_location(obj.definitions.root_location, detach);
	for (const [_key, entry] of obj.properties.context_keys) {
		finalize_context_keys(entry, detach);
	}
	if (!detach) {
	}
	for (const [_key, entry] of obj.properties.numerical_types) {
		finalize_numerical_types(entry, detach);
	}
	if (!detach) {
	}
	finalize_node(obj.properties.root, detach);
}

export namespace Cinterface {
	export function create(init:Tinterface):Cinterface {
		const instance = new Cinterface(init);
		finalize_interface(instance);
		return instance;
	};
}
