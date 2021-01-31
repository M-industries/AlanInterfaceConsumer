import * as application_protocol_hand from './alan_api';

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
function depend<T>(detach:boolean, obj:T):T {
	return obj;
}
export type dictionary_type<T> = {[key:string]:T};


enum ResolutionStatus {
	Resolved,
	Resolving,
	Unresolved,
}
function cache<T extends AlanObject>(callback:(detach:boolean) => T) {
	let cached_value:T;
	let status:ResolutionStatus = ResolutionStatus.Unresolved;
	return (detach = false) => {
		switch (status) {
			case ResolutionStatus.Resolving:
				throw new Error(`Cyclic dependency detected!`);
			case ResolutionStatus.Resolved: {
				if (!detach) break;
				callback(detach);
				(cached_value as any) = undefined;
				status = ResolutionStatus.Unresolved;
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
			case ResolutionStatus.Resolved: {
				if (!detach) break;
				callback(detach);
				cached_value = undefined;
				status = ResolutionStatus.Unresolved;
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

	private load_entry(key:string, entry:((parent:P) => T['node'])|T['node']):T['node'] {
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
	protected abstract resolve(obj:T['node'],detach?:boolean):void;

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
	protected abstract resolve(obj:T['node'],detach?:boolean):void;

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
	protected abstract resolver(state:T['name']): ($:T['node'], detach?:boolean) => void;

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
	protected _root:Capplication_protocol_hand|undefined;
	public abstract get root():Capplication_protocol_hand;
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
		Array.from(this.topo_entries(graph)).forEach(entry => walk_function(entry));
	}
	topo_entries(graph:G):IterableIterator<T['node']> {
		return this._graphs[graph][Symbol.iterator]();
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
			let connected = false;
			prev._edges[g].forEach(e => { connected = (connected || e.ref.entity === curr) });
			if (!connected)
				throw new Error(`Totally ordered graph constraint violation.`);
			return curr;
		});
	}
}

/* alan objects */


export type Tapplication_protocol_hand = {
	'interface version':string;
};
export class Capplication_protocol_hand extends AlanNode {
	public key?:string;
	public get root() { return this; }
	public readonly properties:{
		readonly interface_version:string
	};
	constructor(init:Tapplication_protocol_hand) {
		super();
		const $this = this;
		this.properties = {
			interface_version: init['interface version']
		};
	}
	public get path() { return ``; }
	public get entity() { return this; }
}

/* property classes */
export namespace Capplication_protocol_hand {
}
/* de(resolution) */
function auto_defer_validator<T extends (...args:any) => void>(root:Capplication_protocol_hand, callback:T):T {
	return callback;
}
function finalize_application_protocol_hand(obj:Capplication_protocol_hand, detach:boolean = false) {
}

export namespace Capplication_protocol_hand {
	export function create(init:Tapplication_protocol_hand):Capplication_protocol_hand {
		const instance = new Capplication_protocol_hand(init);
		finalize_application_protocol_hand(instance);
		;
		return instance;
	};
}
