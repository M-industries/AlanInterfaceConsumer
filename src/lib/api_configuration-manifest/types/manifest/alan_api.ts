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
	public abstract get root():Cmanifest;
	public is(other:AlanNode):boolean {
		return this === other;
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
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/inode`; }
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
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/type?directory`; }
}
export type Tchildren = {
	'inode':Tinode;
	'ordered':'no'|['no', {}]|['yes', Tyes__ordered__children];
};
export class Cchildren extends AlanNode {
	public key:string;
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
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/children[${this.key}]`; }
}
export type Tno__ordered__children = {
};
export class Cno__ordered__children extends AlanNode {
	constructor(init:Tno__ordered__children, public parent:Cchildren) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/ordered?no`; }
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
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/ordered?yes`; }
}
export type Tno__ordered__directory = {
};
export class Cno__ordered__directory extends AlanNode {
	constructor(init:Tno__ordered__directory, public parent:Cdirectory) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/ordered?no`; }
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
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/ordered?yes`; }
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
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/type?file`; }
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
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/type?library`; }
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
	constructor(init:Tmanifest, public lazy_eval:boolean) {
		super();
		const $this = this;
		this.properties = {
			fingerprint: init['fingerprint'],
			language_fingerprint: init['language fingerprint'],
			root: new Cmanifest.Droot(init['root'], $this)
		};
	}
	public get path() { return ``; }
}

/* property classes */export namespace Cinode {
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
		protected resolver(state:T['name']) {
			switch (state) {
				case 'directory': return resolve_directory;
				case 'file': return resolve_file;
				case 'library': return resolve_library;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tinode['type'], parent:Cinode) {
			super(data, parent);
		}
	}
}
export namespace Cdirectory {
	export class Dchildren extends AlanDictionary<{ node:Cchildren, init:Tchildren},Cdirectory> {
		protected graph_iterator(graph:string):(node:Cchildren) => Cchildren { throw new Error(`Dictionary has no graph iterators.`); }
		protected initialize(parent:Cdirectory, key:string, entry_init:Tchildren) { return new Cchildren(key, entry_init, parent); }
		protected resolve = resolve_children
		protected get path() { return `${this.parent.path}/children`; }
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
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__ordered__directory;
				case 'yes': return resolve_yes__ordered__directory;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tdirectory['ordered'], parent:Cdirectory) {
			super(data, parent);
		}
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
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__ordered__children;
				case 'yes': return resolve_yes__ordered__children;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tchildren['ordered'], parent:Cchildren) {
			super(data, parent);
		}
	}
}
export namespace Cyes__ordered__children {
	export class Dnext extends Reference<manifest.Cchildren,string> {

		constructor(data:string, $this:Cyes__ordered__children) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.parent)
				.then(context => context?.parent)
				.then(context => context?.properties.children.get(this.entry))
				.result!, true))
		}
	}
}
export namespace Cyes__ordered__directory {
	export class Dfirst extends Reference<manifest.Cchildren,string> {

		constructor(data:string, $this:Cyes__ordered__directory) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.parent)
				.then(context => context?.properties.children.get(this.entry))
				.result!, true))
		}
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
/* de(resolution) */
function auto_defer<T extends (...args:any) => void>(root:Cmanifest, callback:T):T {
	return callback;
}
function resolve_no__ordered__children(obj:Cno__ordered__children, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_yes__ordered__children(obj:Cyes__ordered__children, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => manifest.Cchildren>(obj.properties.next as any).resolve)(detach) !== undefined || detach);
}
function resolve_children(obj:Cchildren, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_inode(obj.properties.inode, detach);
	obj.properties.ordered.switch({
		'no': node => resolve_no__ordered__children(node, detach),
		'yes': node => resolve_yes__ordered__children(node, detach)
	});
}
function resolve_no__ordered__directory(obj:Cno__ordered__directory, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_yes__ordered__directory(obj:Cyes__ordered__directory, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => manifest.Cchildren>(obj.properties.first as any).resolve)(detach) !== undefined || detach);
}
function resolve_directory(obj:Cdirectory, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.children.forEach(entry => resolve_children(entry, detach));
	obj.properties.ordered.switch({
		'no': node => resolve_no__ordered__directory(node, detach),
		'yes': node => resolve_yes__ordered__directory(node, detach)
	});
}
function resolve_file(obj:Cfile, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_library(obj:Clibrary, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_inode(obj.properties.inode, detach);
}
function resolve_inode(obj:Cinode, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.type.switch({
		'directory': node => resolve_directory(node, detach),
		'file': node => resolve_file(node, detach),
		'library': node => resolve_library(node, detach)
	});
}
function resolve_manifest(obj:Cmanifest, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_inode(obj.properties.root, detach);
}

export namespace Cmanifest {
	export function create(init:Tmanifest, lazy_eval:boolean = false):Cmanifest {
		const instance = new Cmanifest(init, lazy_eval);
		if (!lazy_eval) resolve_manifest(instance);
		return instance;
	};
}
