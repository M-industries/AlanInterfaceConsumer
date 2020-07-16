import * as application_protocol_request from './alan_api';

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


function cache<T extends AlanObject>(callback:() => T, update_ref_count = false) {
	let cached_value:T;
	let resolving:boolean = false;
	return (detach = false) => {
		if (resolving) {
			throw new Error(`Cyclic dependency detected!`);
		}
		if (detach && update_ref_count && cached_value !== undefined) {
			--cached_value.reference_count;
			(cached_value as any) = undefined;
		} else if (cached_value === undefined) {
			resolving = true;
			cached_value = callback();
			resolving = false;
			if (update_ref_count && cached_value !== undefined) {
				++cached_value.reference_count;
			}
		}
		return cached_value;
	}
}

/* complex value wrappers */
export interface Tree<T> {
	types: {[name:string]:T};
	subtrees: {[name:string]:Tree<T>};
}
export abstract class Reference<T extends AlanObject, V extends (string|string[])> {
	constructor(public readonly entry:V, private readonly resolve:() => T) {}
	public get ref() { return this.resolve(); }
}
export abstract class AlanDictionary<T extends {node: AlanNode & {key:(string|Reference<AlanObject,string>)}, init: any }, P extends AlanNode, GT extends string = never> {
	private _entries:Map<string,((parent:P) => T['node'])|T['node']>;

	private load_entry(key:string, entry:((parent:P) => T['node'])|T['node']):T['node'] {
		if (typeof entry === 'function') {
			const loaded_entry = entry(this.parent);
			this._entries.set(key, loaded_entry);
			return loaded_entry;
		}
		return entry;
	}
	private findFirst(iterator:(entry:T['node']) => T['node']) {
		const $this = this;
		const key_of = (entry:T['node']) => typeof entry.key === 'string' ? entry.key : entry.key.entry;
		let done:Record<string, boolean> = {};
		let first:T['node']|undefined = undefined;
		for (let [k,v] of $this._entries) {
			let current = $this.load_entry(k, v);
			let entry_id:string = k;
			if (!done[entry_id]) {
				first = current;
				while (current && !done[entry_id]) {
					done[entry_id] = true;
					current = iterator(current);
					if (current !== undefined) {
						entry_id = key_of(current);
					}
				}
			}
		}
		return first;
	}
	constructor (
		entries:{[key:string]:T['init']},
		protected parent:P) {

		if (parent.root.lazy_eval) {
			this._entries = new Map(Object.keys(entries).map(entry_key => [entry_key, (parent:P) => this.initialize(parent, entry_key, entries[entry_key])]));
		} else {
			this._entries = new Map(Object.keys(entries).map(entry_key => [entry_key, this.initialize(parent, entry_key, entries[entry_key])]));
		}
	}

	protected abstract graph_iterator(key:string):(entry:T['node']) => T['node'];
	protected abstract initialize(parent:P, key:string, obj:T['init']):T['node'];
	protected abstract resolve(obj:T['node'],detach?:boolean):void;
	protected abstract get path():string;

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
	entries(graph?:GT, first?:T['node']):IterableIterator<[string,T['node']]> {
		if (graph !== undefined) {
			let iterator = this.graph_iterator(graph);
			let current = first || this.findFirst(iterator);
			return {
				next() {
					if (current !== undefined) {
						const entry = current;
						current = iterator(current);
						return {
							value:[
								typeof entry.key === 'string' ? entry.key : entry.key.entry,
								entry
							]
						};
					} else {
						return {
							done: true,
							value: undefined
						}
					}
				},
				[Symbol.iterator]() {
					return this;
				}
			};
		} else {
			return this[Symbol.iterator]();		}
	}
	forEach(walk_function: ($:T['node']) => void, iterator_name?:GT, first?:T['node']) {
		Array.from(this.entries(iterator_name, first)).forEach(entry => walk_function(entry[1]));
	}
	toArray(graph?:GT, first?:T['node']):[string, T['node']][] {
		return Array.from(this.entries(graph, first));
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

export abstract class AlanSet<T extends {node: AlanNode, init: any }, P extends AlanNode> {
	private _entries:Set<T['node']>;
	constructor (
		entries:Array<T['init']>,
		protected parent:P) {
		this._entries = new Set(entries.map(entry => this.initialize(parent, entry)));
	}

	protected abstract initialize(parent:P, obj:T['init']):T['node'];
	protected abstract resolve(obj:T['node'],detach?:boolean):void;
	protected abstract get path():string;

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
export abstract class StateGroup<T extends {name:string, node:AlanNode & {parent:AlanNode}, init:any}> {
	public state: DistributiveOmit<T,'init'>;
	private init(state_name:T['name'], init:T['init'], parent:AlanNode) {
		this.state = {
			name: state_name,
			node: this.initializer(state_name)(init, parent),
		} as DistributiveOmit<T,'init'>;
	}
	constructor (s:[T['name'],T['init']]|T['name'], private parent:AlanNode) {
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

/* alan object base classes */
export abstract class AlanObject {
	public abstract get path():string;
	public abstract is(other:AlanObject):boolean;
	reference_count:number = 0;
	public destroyed?:true;
}
export abstract class AlanCombinator extends AlanObject {public is(other:AlanCombinator):boolean {
		return this === other;
	}
}
export abstract class AlanNode extends AlanObject {
	public abstract get root():Capplication_protocol_request;
	public is(other:AlanNode):boolean {
		return this === other;
	}
}

/* alan objects */

export type Tapplication_protocol_request = {
	'type':['invoke', Tinvoke]|['subscribe', Tsubscribe]|['unsubscribe', Tunsubscribe];
};
export class Capplication_protocol_request extends AlanNode {
	public key?:string;
	public get root() { return this; }
	public readonly properties:{
		readonly type:Capplication_protocol_request.Dtype<
			{ name: 'invoke', node:Cinvoke, init:Tinvoke}|
			{ name: 'subscribe', node:Csubscribe, init:Tsubscribe}|
			{ name: 'unsubscribe', node:Cunsubscribe, init:Tunsubscribe}>
	};
	constructor(init:Tapplication_protocol_request, public lazy_eval:boolean) {
		super();
		const $this = this;
		this.properties = {
			type: new Capplication_protocol_request.Dtype(init['type'], $this)
		};
	}
	public get path() { return ``; }
}
export type Tinvoke = {
	'command':string;
};
export class Cinvoke extends AlanNode {
	public readonly properties:{
		readonly command:string
	};
	constructor(init:Tinvoke, public parent:Capplication_protocol_request) {
		super();
		const $this = this;
		this.properties = {
			command: init['command']
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/type?invoke`; }
}
export type Tsubscribe = {
	'id':string;
	'subscription':string;
};
export class Csubscribe extends AlanNode {
	public readonly properties:{
		readonly id:string,
		readonly subscription:string
	};
	constructor(init:Tsubscribe, public parent:Capplication_protocol_request) {
		super();
		const $this = this;
		this.properties = {
			id: init['id'],
			subscription: init['subscription']
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/type?subscribe`; }
}
export type Tunsubscribe = {
	'id':string;
};
export class Cunsubscribe extends AlanNode {
	public readonly properties:{
		readonly id:string
	};
	constructor(init:Tunsubscribe, public parent:Capplication_protocol_request) {
		super();
		const $this = this;
		this.properties = {
			id: init['id']
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/type?unsubscribe`; }
}

/* property classes */export namespace Capplication_protocol_request {
	export class Dtype<T extends
		{ name: 'invoke', node:Cinvoke, init:Tinvoke}|
		{ name: 'subscribe', node:Csubscribe, init:Tsubscribe}|
		{ name: 'unsubscribe', node:Cunsubscribe, init:Tunsubscribe}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'invoke': return (init:Tinvoke, parent:Capplication_protocol_request) => new Cinvoke(init, parent);
				case 'subscribe': return (init:Tsubscribe, parent:Capplication_protocol_request) => new Csubscribe(init, parent);
				case 'unsubscribe': return (init:Tunsubscribe, parent:Capplication_protocol_request) => new Cunsubscribe(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'invoke': return resolve_invoke;
				case 'subscribe': return resolve_subscribe;
				case 'unsubscribe': return resolve_unsubscribe;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tapplication_protocol_request['type'], parent:Capplication_protocol_request) {
			super(data, parent);
		}
	}
}
export namespace Cinvoke {
}
export namespace Csubscribe {
}
export namespace Cunsubscribe {
}
/* de(resolution) */
function auto_defer<T extends (...args:any) => void>(root:Capplication_protocol_request, callback:T):T {
	return callback;
}
function resolve_invoke(obj:Cinvoke, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_subscribe(obj:Csubscribe, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_unsubscribe(obj:Cunsubscribe, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_application_protocol_request(obj:Capplication_protocol_request, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.type.switch({
		'invoke': node => resolve_invoke(node, detach),
		'subscribe': node => resolve_subscribe(node, detach),
		'unsubscribe': node => resolve_unsubscribe(node, detach)
	});
}

export namespace Capplication_protocol_request {
	export function create(init:Tapplication_protocol_request, lazy_eval:boolean = false):Capplication_protocol_request {
		const instance = new Capplication_protocol_request(init, lazy_eval);
		if (!lazy_eval) resolve_application_protocol_request(instance);
		return instance;
	};
}
