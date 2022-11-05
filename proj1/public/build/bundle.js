
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function each(items, fn) {
        let str = '';
        for (let i = 0; i < items.length; i += 1) {
            str += fn(items[i], i);
        }
        return str;
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.52.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\Modal.svelte generated by Svelte v3.52.0 */

    const file$1 = "src\\Modal.svelte";

    // (8:4) {#if showModal}
    function create_if_block(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*message*/ ctx[1]);
    			t1 = space();
    			button = element("button");
    			button.textContent = "close";
    			attr_dev(div0, "class", "svelte-1bwg5a8");
    			add_location(div0, file$1, 10, 16, 235);
    			attr_dev(button, "class", "svelte-1bwg5a8");
    			add_location(button, file$1, 11, 16, 273);
    			attr_dev(div1, "class", "modal svelte-1bwg5a8");
    			add_location(div1, file$1, 9, 12, 198);
    			attr_dev(div2, "class", "backdrop svelte-1bwg5a8");
    			add_location(div2, file$1, 8, 8, 162);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*message*/ 2) set_data_dev(t0, /*message*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(8:4) {#if showModal}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let if_block = /*showModal*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block) if_block.c();
    			add_location(main, file$1, 6, 0, 125);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block) if_block.m(main, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showModal*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modal', slots, []);
    	let { showModal = false } = $$props;
    	let { message = "default" } = $$props;

    	const handleModal = () => {
    		
    	};

    	const writable_props = ['showModal', 'message'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, showModal = false);

    	$$self.$$set = $$props => {
    		if ('showModal' in $$props) $$invalidate(0, showModal = $$props.showModal);
    		if ('message' in $$props) $$invalidate(1, message = $$props.message);
    	};

    	$$self.$capture_state = () => ({ showModal, message, handleModal });

    	$$self.$inject_state = $$props => {
    		if ('showModal' in $$props) $$invalidate(0, showModal = $$props.showModal);
    		if ('message' in $$props) $$invalidate(1, message = $$props.message);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showModal, message, click_handler];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { showModal: 0, message: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get showModal() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showModal(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get message() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.52.0 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (81:2) {:else}
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "No item in cart";
    			add_location(div, file, 81, 2, 1725);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(81:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (73:2) {#each cart as item (item.item_id)}
    function create_each_block(key_1, ctx) {
    	let div1;
    	let div0;
    	let h3;
    	let t0;
    	let t1_value = /*item*/ ctx[13].item_name + "";
    	let t1;
    	let t2;
    	let t3_value = /*item*/ ctx[13].item_cost + "";
    	let t3;
    	let t4;
    	let button;
    	let t6;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[11](/*item*/ ctx[13]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			t0 = text("product: ");
    			t1 = text(t1_value);
    			t2 = text("\n\t\t\t\t\tprice: ");
    			t3 = text(t3_value);
    			t4 = space();
    			button = element("button");
    			button.textContent = "delete item";
    			t6 = space();
    			add_location(h3, file, 75, 5, 1552);
    			attr_dev(div0, "class", "svelte-1og7ioc");
    			add_location(div0, file, 74, 4, 1541);
    			attr_dev(button, "class", "svelte-1og7ioc");
    			add_location(button, file, 78, 4, 1631);
    			attr_dev(div1, "class", "cart_item svelte-1og7ioc");
    			add_location(div1, file, 73, 3, 1513);
    			this.first = div1;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h3);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			append_dev(div0, t2);
    			append_dev(div0, t3);
    			append_dev(div1, t4);
    			append_dev(div1, button);
    			append_dev(div1, t6);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*cart*/ 8 && t1_value !== (t1_value = /*item*/ ctx[13].item_name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*cart*/ 8 && t3_value !== (t3_value = /*item*/ ctx[13].item_cost + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(73:2) {#each cart as item (item.item_id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let modal;
    	let t0;
    	let main;
    	let h1;
    	let t4;
    	let p;
    	let t6;
    	let div0;
    	let t7;
    	let t8;
    	let div1;
    	let t9;
    	let t10;
    	let button0;
    	let t12;
    	let input0;
    	let t13;
    	let hr0;
    	let t14;
    	let div2;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t15;
    	let hr1;
    	let t16;
    	let div4;
    	let input1;
    	let t17;
    	let button1;
    	let t19;
    	let div3;
    	let t20;
    	let current;
    	let mounted;
    	let dispose;

    	modal = new Modal({
    			props: {
    				message: "Item deleted",
    				showModal: /*showModal*/ ctx[0]
    			},
    			$$inline: true
    		});

    	let each_value = /*cart*/ ctx[3];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[13].item_id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block(ctx);
    	}

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    			t0 = space();
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = `Hello ${/*name*/ ctx[5]}!`;
    			t4 = space();
    			p = element("p");
    			p.textContent = "Hello Om.";
    			t6 = space();
    			div0 = element("div");
    			t7 = text(/*beltColour*/ ctx[1]);
    			t8 = space();
    			div1 = element("div");
    			t9 = text("The colour will change here");
    			t10 = space();
    			button0 = element("button");
    			button0.textContent = "Change colour";
    			t12 = space();
    			input0 = element("input");
    			t13 = space();
    			hr0 = element("hr");
    			t14 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			t15 = space();
    			hr1 = element("hr");
    			t16 = space();
    			div4 = element("div");
    			input1 = element("input");
    			t17 = space();
    			button1 = element("button");
    			button1.textContent = "Search";
    			t19 = space();
    			div3 = element("div");
    			t20 = text(/*ress*/ ctx[4]);
    			attr_dev(h1, "class", "svelte-1og7ioc");
    			add_location(h1, file, 63, 1, 1125);
    			add_location(p, file, 64, 1, 1149);
    			set_style(div0, "background-color", /*beltColour*/ ctx[1]);
    			add_location(div0, file, 65, 1, 1167);
    			set_style(div1, "background-color", /*boxColour*/ ctx[2]);
    			add_location(div1, file, 66, 1, 1232);
    			add_location(button0, file, 67, 1, 1311);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "input colour");
    			add_location(input0, file, 68, 1, 1367);
    			add_location(hr0, file, 69, 1, 1442);
    			attr_dev(div2, "class", "cart_box");
    			add_location(div2, file, 70, 1, 1448);
    			add_location(hr1, file, 86, 1, 1776);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "Type the number");
    			add_location(input1, file, 88, 2, 1812);
    			add_location(button1, file, 89, 2, 1886);
    			attr_dev(div3, "class", "res");
    			add_location(div3, file, 90, 2, 1934);
    			attr_dev(div4, "class", "condition_box");
    			add_location(div4, file, 87, 1, 1782);
    			attr_dev(main, "class", "svelte-1og7ioc");
    			add_location(main, file, 62, 0, 1117);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t4);
    			append_dev(main, p);
    			append_dev(main, t6);
    			append_dev(main, div0);
    			append_dev(div0, t7);
    			append_dev(main, t8);
    			append_dev(main, div1);
    			append_dev(div1, t9);
    			append_dev(main, t10);
    			append_dev(main, button0);
    			append_dev(main, t12);
    			append_dev(main, input0);
    			append_dev(main, t13);
    			append_dev(main, hr0);
    			append_dev(main, t14);
    			append_dev(main, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div2, null);
    			}

    			append_dev(main, t15);
    			append_dev(main, hr1);
    			append_dev(main, t16);
    			append_dev(main, div4);
    			append_dev(div4, input1);
    			append_dev(div4, t17);
    			append_dev(div4, button1);
    			append_dev(div4, t19);
    			append_dev(div4, div3);
    			append_dev(div3, t20);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*handleColour*/ ctx[6], false, false, false),
    					listen_dev(input0, "input", /*changeBoxColour*/ ctx[7], false, false, false),
    					listen_dev(input1, "input", /*handleText*/ ctx[9], false, false, false),
    					listen_dev(button1, "click", /*searchNumb*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};
    			if (dirty & /*showModal*/ 1) modal_changes.showModal = /*showModal*/ ctx[0];
    			modal.$set(modal_changes);
    			if (!current || dirty & /*beltColour*/ 2) set_data_dev(t7, /*beltColour*/ ctx[1]);

    			if (!current || dirty & /*beltColour*/ 2) {
    				set_style(div0, "background-color", /*beltColour*/ ctx[1]);
    			}

    			if (!current || dirty & /*boxColour*/ 4) {
    				set_style(div1, "background-color", /*boxColour*/ ctx[2]);
    			}

    			if (dirty & /*handleClick, cart*/ 264) {
    				each_value = /*cart*/ ctx[3];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div2, destroy_block, create_each_block, null, get_each_context);

    				if (!each_value.length && each_1_else) {
    					each_1_else.p(ctx, dirty);
    				} else if (!each_value.length) {
    					each_1_else = create_else_block(ctx);
    					each_1_else.c();
    					each_1_else.m(div2, null);
    				} else if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			}

    			if (!current || dirty & /*ress*/ 16) set_data_dev(t20, /*ress*/ ctx[4]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (each_1_else) each_1_else.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let showModal = false;
    	let name = 'Om';
    	let beltColour = 'black';
    	let boxColour = 'orange';

    	const handleColour = () => {
    		if (beltColour != '#ff3e00') {
    			$$invalidate(1, beltColour = '#ff3e00');
    		} else $$invalidate(1, beltColour = 'black');
    	};

    	const changeBoxColour = e => {
    		$$invalidate(2, boxColour = e.target.value);
    	};

    	const handleClick = id => {
    		$$invalidate(3, cart = cart.filter(cart => cart.item_id != id));
    		$$invalidate(0, showModal = !showModal);
    		console.log(showModal);

    		if (showModal === false) {
    			$$invalidate(0, showModal = true);
    		}
    	};

    	let cart = [
    		{
    			item_id: 1,
    			item_name: 'Earphones',
    			item_cost: 3000
    		},
    		{
    			item_id: 2,
    			item_name: 'Power bank',
    			item_cost: 5000
    		},
    		{
    			item_id: 3,
    			item_name: 'Iphone',
    			item_cost: 80000
    		},
    		{
    			item_id: 4,
    			item_name: 'Power bank',
    			item_cost: 5000
    		}
    	];

    	let numb;

    	const handleText = e => {
    		numb = e.target.value;
    		console.log(parseInt(numb));
    	};

    	let ress = "Input the number";

    	const searchNumb = () => {
    		if (numb > 5000) {
    			$$invalidate(4, ress = "greater than 5000");
    		} else {
    			$$invalidate(4, ress = "less than 5000");
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = item => {
    		handleClick(item.item_id);
    	};

    	$$self.$capture_state = () => ({
    		each,
    		Modal,
    		showModal,
    		name,
    		beltColour,
    		boxColour,
    		handleColour,
    		changeBoxColour,
    		handleClick,
    		cart,
    		numb,
    		handleText,
    		ress,
    		searchNumb
    	});

    	$$self.$inject_state = $$props => {
    		if ('showModal' in $$props) $$invalidate(0, showModal = $$props.showModal);
    		if ('name' in $$props) $$invalidate(5, name = $$props.name);
    		if ('beltColour' in $$props) $$invalidate(1, beltColour = $$props.beltColour);
    		if ('boxColour' in $$props) $$invalidate(2, boxColour = $$props.boxColour);
    		if ('cart' in $$props) $$invalidate(3, cart = $$props.cart);
    		if ('numb' in $$props) numb = $$props.numb;
    		if ('ress' in $$props) $$invalidate(4, ress = $$props.ress);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		showModal,
    		beltColour,
    		boxColour,
    		cart,
    		ress,
    		name,
    		handleColour,
    		changeBoxColour,
    		handleClick,
    		handleText,
    		searchNumb,
    		click_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
