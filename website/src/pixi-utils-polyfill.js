
/**
 * PixiJS v7 to v6 Compatibility Polyfill (Bridge V10.0 - DYNAMIC PROXY)
 * This version uses a real-time proxy to window.PIXI, ensuring that 
 * libraries like pixi-live2d-display can see the CDN-loaded PixiJS.
 */

// --- GLOBAL TELEMETRY ---
if (typeof window !== 'undefined') {
    // @ts-ignore
    window.__PIXI_TELEMETRY__ = window.__PIXI_TELEMETRY__ || [];
    // @ts-ignore
    window.__PIXI_TELEMETRY_LOG__ = (msg) => {
        const time = new Date().toLocaleTimeString();
        // @ts-ignore
        window.__PIXI_TELEMETRY__.push(`${time}: ${msg}`);
        // @ts-ignore
        if (window.__PIXI_TELEMETRY__.length > 50) window.__PIXI_TELEMETRY__.shift();
        console.log(`[PIXI-BRIDGE] ${msg}`);
    };
}

const log = (msg) => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.__PIXI_TELEMETRY_LOG__) {
        // @ts-ignore
        window.__PIXI_TELEMETRY_LOG__(msg);
    }
};

// 1. Zero-dependency EventEmitter
class EventEmitter {
    constructor() { this._events = {}; }
    on(event, fn) { (this._events[event] = this._events[event] || []).push(fn); return this; }
    once(event, fn) {
        const wrapper = (...args) => { this.off(event, wrapper); fn(...args); };
        wrapper.fn = fn;
        return this.on(event, wrapper);
    }
    off(event, fn) {
        if (!fn) { this._events[event] = []; } else {
            const list = this._events[event];
            if (list) { this._events[event] = list.filter(f => f !== fn && f.fn !== fn); }
        }
        return this;
    }
    emit(event, ...args) {
        const list = this._events[event];
        if (list) { list.slice().forEach(fn => fn(...args)); return true; }
        return false;
    }
}

// 2. ObservablePoint v6->v7 shim
const createObservablePointShim = (Original) => {
    return class extends Original {
        constructor(cb, scope, x, y) {
            if (typeof cb === 'function') {
                super({ _onUpdate: () => cb.call(scope, this) }, x || 0, y || 0);
                // @ts-ignore - Preserve legacy v6 properties
                this.cb = cb;
                // @ts-ignore
                this.scope = scope;
            } else {
                super(cb, scope || 0, x || 0);
            }
        }
    };
};

// 3. DYNAMIC PROXY to window.PIXI
const PixiProxy = typeof window !== 'undefined' ? new Proxy({}, {
    get: (target, prop) => {
        // @ts-ignore
        const P = window.PIXI;
        if (!P) {
            if (prop === 'Application') return class { constructor() { } };
            if (prop === 'Texture') return { from: () => ({}), EMPTY: {} };
            if (prop === 'Assets') return { load: () => Promise.resolve({}), get: () => null };
            return {};
        }

        const val = P[prop];

        if (prop === 'ObservablePoint') return createObservablePointShim(val);
        if (prop === 'BaseTexture' && !val) return P.Texture;

        if (typeof val === 'function' && !val.prototype) {
            return val.bind(P);
        }
        return val;
    }
}) : {};

// 3. Exports
// @ts-ignore
export const Texture = PixiProxy.Texture;
// @ts-ignore
export const BaseTexture = PixiProxy.BaseTexture || PixiProxy.Texture;
// @ts-ignore
export const Sprite = PixiProxy.Sprite;
// @ts-ignore
export const Container = PixiProxy.Container;
// @ts-ignore
export const DisplayObject = PixiProxy.DisplayObject;
// @ts-ignore
export const Matrix = PixiProxy.Matrix;
// @ts-ignore
export const Transform = PixiProxy.Transform;
// @ts-ignore
export const Point = PixiProxy.Point;
// @ts-ignore
export const ObservablePoint = PixiProxy.ObservablePoint;
// @ts-ignore
export const Ticker = PixiProxy.Ticker;
// @ts-ignore
export const settings = PixiProxy.settings;
// @ts-ignore
export const Application = PixiProxy.Application;
// @ts-ignore
export const Assets = PixiProxy.Assets;

export const utils = {
    TextureCache: {},
    BaseTextureCache: {},
    EventEmitter,
    // @ts-ignore
    get _dynamic() { return PixiProxy.utils || {}; }
};

export { EventEmitter };

export const url = {
    parse: (u) => { try { return new URL(u); } catch (e) { return { href: u, pathname: u }; } },
    resolve: (f, t) => { try { return new URL(t, f).href; } catch (e) { return t; } },
};

export const skipHello = () => { };

export default new Proxy({}, {
    get: (target, prop) => {
        if (prop === 'EventEmitter') return EventEmitter;
        if (prop === 'url') return url;
        if (prop === 'skipHello') return skipHello;
        if (prop === 'utils') return utils;
        // @ts-ignore
        return PixiProxy[prop];
    }
});
