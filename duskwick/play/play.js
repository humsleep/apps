//#region ../../core/hash.ts
function e(e) {
	let t = 2166136261;
	for (let n of e) t = Math.imul(t ^ n, 16777619);
	return t >>> 0;
}
//#endregion
//#region ../../core/game.ts
var t = {
	lanterns: 1,
	seedlock: 2,
	doorfall: 3,
	hueblend: 4,
	lanternsPips: 5
};
//#endregion
//#region ../../core/bytes.ts
function n(e) {
	let t = [];
	for (let n = 0; n < e.length; n++) {
		let r = e.charCodeAt(n);
		if (r >= 55296 && r <= 57343) {
			let t = n + 1 < e.length ? e.charCodeAt(n + 1) : 0;
			r <= 56319 && t >= 56320 && t <= 57343 ? (r = 65536 + (r - 55296 << 10) + (t - 56320), n++) : r = 65533;
		}
		r < 128 ? t.push(r) : r < 2048 ? t.push(192 | r >> 6, 128 | r & 63) : r < 65536 ? t.push(224 | r >> 12, 128 | r >> 6 & 63, 128 | r & 63) : t.push(240 | r >> 18, 128 | r >> 12 & 63, 128 | r >> 6 & 63, 128 | r & 63);
	}
	return Uint8Array.from(t);
}
function r(e, t, n) {
	e[t] = n & 255, e[t + 1] = n >>> 8 & 255, e[t + 2] = n >>> 16 & 255, e[t + 3] = n >>> 24 & 255;
}
var i = {
	lo: 0,
	hi: 0
};
function a(e, t) {
	return t << 3 | e;
}
function o(e, t) {
	return ((t < 32 ? e.lo >>> t : e.hi >>> t - 32) & 1) == 1;
}
function s(e, t, n) {
	if (t < 32) {
		let r = 1 << t >>> 0;
		return {
			lo: (n ? e.lo | r : e.lo & ~r) >>> 0,
			hi: e.hi
		};
	}
	let r = 1 << t - 32 >>> 0;
	return {
		lo: e.lo,
		hi: (n ? e.hi | r : e.hi & ~r) >>> 0
	};
}
function c(e) {
	return e -= e >>> 1 & 1431655765, e = (e & 858993459) + (e >>> 2 & 858993459), Math.imul(e + (e >>> 4) & 252645135, 16843009) >>> 24;
}
function l(e) {
	return c(e.lo) + c(e.hi);
}
function u(e, t) {
	let n = i;
	for (let r = 0; r < t; r++) for (let t = 0; t < e; t++) n = s(n, a(t, r), !0);
	return n;
}
function d(e) {
	let t = u(e.w, e.h);
	return {
		lo: (t.lo & ~e.stones.lo) >>> 0,
		hi: (t.hi & ~e.stones.hi) >>> 0
	};
}
var f = [
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1]
];
function p(e) {
	let t = i, n = i;
	for (let r = 0; r < 64; r++) if (o(e.lanterns, r)) {
		t = s(t, r, !0);
		for (let [i, c] of f) {
			let l = (r & 7) + i, u = (r >> 3) + c;
			for (; l >= 0 && u >= 0 && l < e.w && u < e.h;) {
				let d = a(l, u);
				if (o(e.stones, d)) break;
				t = s(t, d, !0), o(e.lanterns, d) && (n = s(n, r, !0)), l += i, u += c;
			}
		}
	}
	return {
		lit: t,
		conflicts: n,
		used: l(e.lanterns)
	};
}
//#endregion
//#region ../../games/lanterns/index.ts
function m(e) {
	let t = (e) => Number.isInteger(e) && e >= 0 && e < 8;
	if (!t(e.x) || !t(e.y)) throw RangeError(`move (${e.x},${e.y}) not encodable`);
	return Uint8Array.of(a(e.x, e.y));
}
function h(e) {
	if (e.length !== 1) return null;
	let t = e[0];
	return t & 192 ? null : {
		x: t & 7,
		y: t >> 3 & 7
	};
}
t.lanterns;
function g(e, t, n) {
	let r = n & 7, i = n >> 3, a = [];
	return i > 0 && a.push(n - 8), r > 0 && a.push(n - 1), r < e - 1 && a.push(n + 1), i < t - 1 && a.push(n + 8), a;
}
function _(e) {
	let t = 0, n = 0;
	for (let r = 0; r < 64; r++) e.clues[r] !== 255 && (r < 32 ? t |= 1 << r : n |= 1 << r - 32);
	return {
		lo: t >>> 0,
		hi: n >>> 0
	};
}
function v(e) {
	let t = (e) => Number.isInteger(e) && e >= 5 && e <= 8;
	if (!t(e.w) || !t(e.h)) throw RangeError(`board size ${e.w}x${e.h} out of range`);
	let n = (e) => Number.isInteger(e) && e >= 0 && e <= 4294967295;
	if (!n(e.stones.lo) || !n(e.stones.hi)) throw RangeError("stones words must be integers in 0..0xFFFFFFFF");
	let r = u(e.w, e.h);
	if ((e.stones.lo & ~r.lo) !== 0 || (e.stones.hi & ~r.hi) !== 0) throw RangeError("stone outside board");
	if (e.clues.length !== 64) throw RangeError("clues must have 64 entries");
	for (let t = 0; t < 64; t++) {
		let n = e.clues[t];
		if (n !== 255) {
			if (!Number.isInteger(n) || n < 0 || n > 4) throw RangeError(`clue ${n} at cell ${t} out of range`);
			if (!o(e.stones, t)) throw RangeError(`clue at cell ${t} is not on a stone`);
			if (n > g(e.w, e.h, t).length) throw RangeError(`clue ${n} at cell ${t} exceeds its neighbours`);
		}
	}
}
function y(e) {
	return v(e), {
		w: e.w,
		h: e.h,
		stones: e.stones,
		clues: e.clues,
		lanterns: i
	};
}
function b(e, t) {
	let n = 0;
	for (let r of g(e.w, e.h, t)) o(e.lanterns, r) && n++;
	return n;
}
function x(e) {
	let t = p({
		w: e.w,
		h: e.h,
		budget: 0,
		stones: e.stones,
		lanterns: e.lanterns
	}), n = 0, r = 0, i = 0, a = 0;
	for (let t = 0; t < 64; t++) {
		let o = e.clues[t];
		if (o === 255) continue;
		let s = b(e, t);
		s !== o && (t < 32 ? n |= 1 << t : r |= 1 << t - 32, s > o && (t < 32 ? i |= 1 << t : a |= 1 << t - 32));
	}
	return {
		lit: t.lit,
		conflicts: t.conflicts,
		used: t.used,
		unmatched: {
			lo: n >>> 0,
			hi: r >>> 0
		},
		over: {
			lo: i >>> 0,
			hi: a >>> 0
		}
	};
}
function S(e) {
	let t = x(e);
	if (l(t.conflicts) !== 0 || l(t.unmatched) !== 0) return !1;
	let n = d(e);
	return (n.lo & ~t.lit.lo) === 0 && (n.hi & ~t.lit.hi) === 0;
}
function C(e, t) {
	let { x: n, y: r } = t;
	if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || n >= e.w || r >= e.h) return null;
	let i = a(n, r);
	if (o(e.stones, i) || S(e)) return null;
	let s = !o(e.lanterns, i), c = i < 32 ? {
		lo: (s ? e.lanterns.lo | 1 << i : e.lanterns.lo & ~(1 << i)) >>> 0,
		hi: e.lanterns.hi
	} : {
		lo: e.lanterns.lo,
		hi: (s ? e.lanterns.hi | 1 << i - 32 : e.lanterns.hi & ~(1 << i - 32)) >>> 0
	};
	return {
		...e,
		lanterns: c
	};
}
function w(e) {
	let t = /* @__PURE__ */ new Uint8Array(60), n = _(e);
	t[0] = e.w, t[1] = e.h, t[2] = l(n), r(t, 4, e.stones.lo), r(t, 8, e.stones.hi), r(t, 12, n.lo), r(t, 16, n.hi), r(t, 20, e.lanterns.lo), r(t, 24, e.lanterns.hi);
	for (let n = 0; n < 64; n++) {
		let r = e.clues[n], i = r === 255 ? 15 : r, a = 28 + (n >> 1);
		t[a] = t[a] | (n & 1 ? i << 4 : i);
	}
	return t;
}
//#endregion
//#region ../../core/sha256.ts
var T = new Uint32Array([
	1116352408,
	1899447441,
	3049323471,
	3921009573,
	961987163,
	1508970993,
	2453635748,
	2870763221,
	3624381080,
	310598401,
	607225278,
	1426881987,
	1925078388,
	2162078206,
	2614888103,
	3248222580,
	3835390401,
	4022224774,
	264347078,
	604807628,
	770255983,
	1249150122,
	1555081692,
	1996064986,
	2554220882,
	2821834349,
	2952996808,
	3210313671,
	3336571891,
	3584528711,
	113926993,
	338241895,
	666307205,
	773529912,
	1294757372,
	1396182291,
	1695183700,
	1986661051,
	2177026350,
	2456956037,
	2730485921,
	2820302411,
	3259730800,
	3345764771,
	3516065817,
	3600352804,
	4094571909,
	275423344,
	430227734,
	506948616,
	659060556,
	883997877,
	958139571,
	1322822218,
	1537002063,
	1747873779,
	1955562222,
	2024104815,
	2227730452,
	2361852424,
	2428436474,
	2756734187,
	3204031479,
	3329325298
]), E = (e, t) => e >>> t | e << 32 - t;
function D(e) {
	if (e.length >= 536870912) throw RangeError("sha256: input too large");
	let t = e.length << 3 >>> 0, n = new Uint8Array((e.length + 8 >> 6) + 1 << 6);
	n.set(e), n[e.length] = 128;
	let r = n.length;
	for (let e = 0; e < 4; e++) n[r - 1 - e] = t >>> 8 * e & 255;
	let i = new Uint32Array([
		1779033703,
		3144134277,
		1013904242,
		2773480762,
		1359893119,
		2600822924,
		528734635,
		1541459225
	]), a = /* @__PURE__ */ new Uint32Array(64);
	for (let e = 0; e < r; e += 64) {
		for (let t = 0; t < 16; t++) {
			let r = e + t * 4;
			a[t] = n[r] << 24 | n[r + 1] << 16 | n[r + 2] << 8 | n[r + 3];
		}
		for (let e = 16; e < 64; e++) {
			let t = a[e - 15], n = a[e - 2], r = E(t, 7) ^ E(t, 18) ^ t >>> 3, i = E(n, 17) ^ E(n, 19) ^ n >>> 10;
			a[e] = a[e - 16] + r + a[e - 7] + i | 0;
		}
		let t = i[0], r = i[1], o = i[2], s = i[3], c = i[4], l = i[5], u = i[6], d = i[7];
		for (let e = 0; e < 64; e++) {
			let n = E(c, 6) ^ E(c, 11) ^ E(c, 25), i = c & l ^ ~c & u, f = d + n + i + T[e] + a[e] | 0, p = (E(t, 2) ^ E(t, 13) ^ E(t, 22)) + (t & r ^ t & o ^ r & o) | 0;
			d = u, u = l, l = c, c = s + f | 0, s = o, o = r, r = t, t = f + p | 0;
		}
		i[0] += t, i[1] += r, i[2] += o, i[3] += s, i[4] += c, i[5] += l, i[6] += u, i[7] += d;
	}
	let o = /* @__PURE__ */ new Uint8Array(32);
	for (let e = 0; e < 8; e++) {
		let t = i[e];
		o[e * 4] = t >>> 24, o[e * 4 + 1] = t >>> 16 & 255, o[e * 4 + 2] = t >>> 8 & 255, o[e * 4 + 3] = t & 255;
	}
	return o;
}
//#endregion
//#region \0@oxc-project+runtime@0.153.0/helpers/esm/typeof.js
function O(e) {
	"@babel/helpers - typeof";
	return O = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, O(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.153.0/helpers/esm/toPrimitive.js
function ee(e, t) {
	if (O(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (O(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.153.0/helpers/esm/toPropertyKey.js
function k(e) {
	var t = ee(e, "string");
	return O(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.153.0/helpers/esm/defineProperty.js
function A(e, t, n) {
	return (t = k(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region ../../core/rng.ts
function te(e) {
	if (typeof e == "string") return D(n(e)).slice(0, 16);
	if (e.length !== 16) throw RangeError("seed must be 16 bytes");
	return e.slice();
}
var j = (e, t) => (e << t | e >>> 32 - t) >>> 0, ne = class e {
	constructor(e, t, n, r) {
		if (A(this, "s0", void 0), A(this, "s1", void 0), A(this, "s2", void 0), A(this, "s3", void 0), this.s0 = e >>> 0, this.s1 = t >>> 0, this.s2 = n >>> 0, this.s3 = r >>> 0, (this.s0 | this.s1 | this.s2 | this.s3) === 0) throw RangeError("xoshiro state must not be all zero");
	}
	static from(t) {
		let n = te(t), r = (e) => (n[e] | n[e + 1] << 8 | n[e + 2] << 16 | n[e + 3] << 24) >>> 0;
		return new e(r(0), r(4), r(8), r(12));
	}
	state() {
		return [
			this.s0,
			this.s1,
			this.s2,
			this.s3
		];
	}
	clone() {
		return new e(this.s0, this.s1, this.s2, this.s3);
	}
	nextU32() {
		let e = Math.imul(j(Math.imul(this.s1, 5) >>> 0, 7), 9) >>> 0, t = this.s1 << 9 >>> 0;
		return this.s2 = (this.s2 ^ this.s0) >>> 0, this.s3 = (this.s3 ^ this.s1) >>> 0, this.s1 = (this.s1 ^ this.s2) >>> 0, this.s0 = (this.s0 ^ this.s3) >>> 0, this.s2 = (this.s2 ^ t) >>> 0, this.s3 = j(this.s3, 11), e;
	}
	nextInt(e) {
		if (!Number.isInteger(e) || e < 1 || e > 4294967295) throw RangeError("nextInt: n out of range");
		let t = (4294967296 - e >>> 0) % e;
		for (;;) {
			let n = this.nextU32();
			if (n >= t) return n % e;
		}
	}
	shuffle(e) {
		for (let t = e.length - 1; t > 0; t--) {
			let n = this.nextInt(t + 1), r = e[t];
			e[t] = e[n], e[n] = r;
		}
		return e;
	}
};
//#endregion
//#region ../../games/lanterns/solver.ts
function M(e) {
	return e -= e >>> 1 & 1431655765, e = (e & 858993459) + (e >>> 2 & 858993459), Math.imul(e + (e >>> 4) & 252645135, 16843009) >>> 24;
}
function N(e) {
	return 31 - Math.clz32(e & -e);
}
var P = [
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1]
];
function re(e) {
	let t = Array(64).fill(0), n = Array(64).fill(0), r = d(e);
	for (let r = 0; r < e.h; r++) for (let i = 0; i < e.w; i++) {
		let s = a(i, r);
		if (o(e.stones, s)) continue;
		let c = 0, l = 0, u = (e) => {
			e < 32 ? c = (c | 1 << e) >>> 0 : l = (l | 1 << e - 32) >>> 0;
		};
		u(s);
		for (let [t, n] of P) {
			let s = i + t, c = r + n;
			for (; s >= 0 && c >= 0 && s < e.w && c < e.h && !o(e.stones, a(s, c));) u(a(s, c)), s += t, c += n;
		}
		t[s] = c, n[s] = l;
	}
	return {
		w: e.w,
		h: e.h,
		floorLo: r.lo,
		floorHi: r.hi,
		lo: t,
		hi: n
	};
}
//#endregion
//#region ../../games/lanterns/generator.ts
function F(e, t) {
	let n = 0, r = 0;
	for (let i = 30; i >= 0; i--) r = r << 1 | e >>> i & 1, r >= t && (r -= t, n |= 1 << i);
	return n;
}
var ie = /^(\d{4})-(\d{2})-(\d{2})$/;
function ae(e) {
	let t = ie.exec(e);
	if (!t) throw RangeError(`date must be YYYY-MM-DD, got ${e}`);
	let n = parseInt(t[1], 10), r = parseInt(t[2], 10), i = parseInt(t[3], 10), a = [
		31,
		n % 4 == 0 && n % 100 != 0 || n % 400 == 0 ? 29 : 28,
		31,
		30,
		31,
		30,
		31,
		31,
		30,
		31,
		30,
		31
	];
	if (n < 2e3 || n > 2399 || r < 1 || r > 12 || i < 1 || i > a[r - 1]) throw RangeError(`invalid date ${e}`);
	return {
		y: n,
		m: r,
		d: i
	};
}
//#endregion
//#region ../../games/lanterns-pips/solver.ts
function I(e, t) {
	let n = t ?? re(e), r = [], i = [], a = [], o = [];
	for (let t = 0; t < 64; t++) {
		let s = e.clues[t];
		if (s === 255) continue;
		let c = 0, l = 0;
		for (let r of g(e.w, e.h, t)) (r < 32 ? n.floorLo >>> r : n.floorHi >>> r - 32) & 1 && (r < 32 ? c |= 1 << r : l |= 1 << r - 32);
		r.push(t), i.push(s), a.push(c >>> 0), o.push(l >>> 0);
	}
	return {
		r: n,
		clueCell: r,
		clueVal: i,
		adjLo: a,
		adjHi: o
	};
}
function oe(e, t = 2, n = 2e5, r, a) {
	let o = r ?? I(e), s = o.r, c = s.floorLo, l = s.floorHi, u = o.clueCell.length, d = 0, f = 0, p = !1, m = !1, h = 0, g = 0, _ = (e, r, i, a, v, y) => {
		if (++d > n) {
			p = !0, m = !0;
			return;
		}
		let b = e, x = r, S = i, C = a, w = v, T = y, E = -1, D = 99;
		for (;;) {
			let e = (c & ~S & ~w) >>> 0, t = (l & ~C & ~T) >>> 0, n = !1;
			for (let r = 0; r < u && !n; r++) {
				let i = o.clueVal[r], a = M((o.adjLo[r] & b) >>> 0) + M((o.adjHi[r] & x) >>> 0), c = (o.adjLo[r] & e) >>> 0, l = (o.adjHi[r] & t) >>> 0, u = M(c) + M(l);
				if (a > i || a + u < i) return;
				if (u !== 0) {
					if (a === i) w = (w | c) >>> 0, T = (T | l) >>> 0, n = !0;
					else if (a + u === i) {
						for (let e = c; e !== 0; e = (e & e - 1) >>> 0) {
							let t = N(e);
							S |= s.lo[t], C |= s.hi[t];
						}
						for (let e = l; e !== 0; e = (e & e - 1) >>> 0) {
							let t = N(e) + 32;
							S |= s.lo[t], C |= s.hi[t];
						}
						S >>>= 0, C >>>= 0, b = (b | c) >>> 0, x = (x | l) >>> 0, n = !0;
					}
				}
			}
			if (n) continue;
			let r = (c & ~S) >>> 0, i = (l & ~C) >>> 0;
			if ((r | i) === 0) break;
			E = -1, D = 99;
			for (let n = r; n !== 0 && D > 1; n = (n & n - 1) >>> 0) {
				let r = N(n), i = M((s.lo[r] & e) >>> 0) + M((s.hi[r] & t) >>> 0);
				i < D && (E = r, D = i);
			}
			for (let n = i; n !== 0 && D > 1; n = (n & n - 1) >>> 0) {
				let r = N(n) + 32, i = M((s.lo[r] & e) >>> 0) + M((s.hi[r] & t) >>> 0);
				i < D && (E = r, D = i);
			}
			if (D === 0) return;
			if (D === 1) {
				let n = (s.lo[E] & e) >>> 0, r = n === 0 ? N((s.hi[E] & t) >>> 0) + 32 : N(n);
				r < 32 ? b = (b | 1 << r) >>> 0 : x = (x | 1 << r - 32) >>> 0, S = (S | s.lo[r]) >>> 0, C = (C | s.hi[r]) >>> 0;
			} else break;
		}
		if ((c & ~S | l & ~C) === 0) {
			f === 0 && (h = b, g = x), f++, f >= t && (p = !0);
			return;
		}
		let O = (c & ~S & ~w) >>> 0, ee = (l & ~C & ~T) >>> 0, k = w, A = T, te = (s.lo[E] & O) >>> 0, j = (s.hi[E] & ee) >>> 0;
		for (let e = te; e !== 0 && !p; e = (e & e - 1) >>> 0) {
			let t = N(e);
			_((b | 1 << t) >>> 0, x, (S | s.lo[t]) >>> 0, (C | s.hi[t]) >>> 0, k, A), k = (k | 1 << t) >>> 0;
		}
		for (let e = j; e !== 0 && !p; e = (e & e - 1) >>> 0) {
			let t = N(e) + 32;
			_(b, (x | 1 << t - 32) >>> 0, (S | s.lo[t]) >>> 0, (C | s.hi[t]) >>> 0, k, A), A = (A | 1 << t - 32) >>> 0;
		}
	};
	if (a === void 0 || (a.lo | a.hi) === 0) _(0, 0, 0, 0, 0, 0);
	else {
		let e = 0, t = 0, n = (a.lo & ~c) === 0 && (a.hi & ~l) === 0;
		for (let r = 0; r < 2 && n; r++) for (let i = r === 0 ? a.lo >>> 0 : a.hi >>> 0; i !== 0; i = (i & i - 1) >>> 0) {
			let o = N(i) + (r << 5);
			(s.lo[o] & a.lo & ~(o < 32 ? 1 << o : 0)) >>> 0 | (s.hi[o] & a.hi & ~(o >= 32 ? 1 << o - 32 : 0)) >>> 0 && (n = !1), e = (e | s.lo[o]) >>> 0, t = (t | s.hi[o]) >>> 0;
		}
		n && _(a.lo >>> 0, a.hi >>> 0, e, t, 0, 0);
	}
	return {
		count: f,
		solution: f > 0 ? {
			lo: h,
			hi: g
		} : i,
		nodes: d,
		aborted: m
	};
}
//#endregion
//#region ../../games/lanterns-pips/deduce.ts
var se = () => ({
	pLo: 0,
	pHi: 0,
	lLo: 0,
	lHi: 0,
	mLo: 0,
	mHi: 0
}), ce = (e) => ({ ...e });
function L(e, t) {
	let n = [];
	for (let t = e >>> 0; t !== 0; t = (t & t - 1) >>> 0) n.push(N(t));
	for (let e = t >>> 0; e !== 0; e = (e & e - 1) >>> 0) n.push(N(e) + 32);
	return n;
}
function R(e, t, n) {
	n < 32 ? t.pLo = (t.pLo | 1 << n) >>> 0 : t.pHi = (t.pHi | 1 << n - 32) >>> 0, t.lLo = (t.lLo | e.r.lo[n]) >>> 0, t.lHi = (t.lHi | e.r.hi[n]) >>> 0;
}
function z(e, t) {
	t < 32 ? e.mLo = (e.mLo | 1 << t) >>> 0 : e.mHi = (e.mHi | 1 << t - 32) >>> 0;
}
function le(e, t, n) {
	for (let r of n.place) R(e, t, r);
	for (let e of n.mark) z(t, e);
}
function ue(e, t, n, r, i, a, o) {
	let s = e.r, c = (s.floorLo & ~r & ~a) >>> 0, l = (s.floorHi & ~i & ~o) >>> 0;
	for (let r = 0; r < e.clueCell.length; r++) {
		let i = e.clueVal[r], a = M((e.adjLo[r] & t) >>> 0) + M((e.adjHi[r] & n) >>> 0), o = M((e.adjLo[r] & c) >>> 0) + M((e.adjHi[r] & l) >>> 0);
		if (a > i || a + o < i) return !0;
	}
	for (let e = (s.floorLo & ~r) >>> 0; e !== 0; e = (e & e - 1) >>> 0) {
		let t = N(e);
		if ((s.lo[t] & c | s.hi[t] & l) === 0) return !0;
	}
	for (let e = (s.floorHi & ~i) >>> 0; e !== 0; e = (e & e - 1) >>> 0) {
		let t = N(e) + 32;
		if ((s.lo[t] & c | s.hi[t] & l) === 0) return !0;
	}
	return !1;
}
function de(e, t) {
	return ue(e, t.pLo, t.pHi, t.lLo, t.lHi, t.mLo, t.mHi);
}
function fe(e, t) {
	return (e.r.floorLo & ~t.lLo | e.r.floorHi & ~t.lHi) === 0;
}
function pe(e, t) {
	let n = [], r = (e.r.floorLo & ~t.lLo & ~t.mLo) >>> 0, i = (e.r.floorHi & ~t.lHi & ~t.mHi) >>> 0;
	for (let a = 0; a < e.clueCell.length; a++) {
		let o = e.clueVal[a], s = M((e.adjLo[a] & t.pLo) >>> 0) + M((e.adjHi[a] & t.pHi) >>> 0), c = (e.adjLo[a] & r) >>> 0, l = (e.adjHi[a] & i) >>> 0, u = M(c) + M(l);
		u !== 0 && (s === o ? n.push({
			tier: 1,
			place: [],
			mark: L(c, l)
		}) : s + u === o && n.push({
			tier: 1,
			place: L(c, l),
			mark: []
		}));
	}
	return n;
}
function me(e, t) {
	let n = e.r, r = [], i = [], a = (n.floorLo & ~t.lLo & ~t.mLo) >>> 0, o = (n.floorHi & ~t.lHi & ~t.mHi) >>> 0;
	for (let e of L((n.floorLo & ~t.lLo) >>> 0, (n.floorHi & ~t.lHi) >>> 0)) {
		let t = (n.lo[e] & a) >>> 0, s = (n.hi[e] & o) >>> 0;
		if (M(t) + M(s) !== 1) continue;
		let c = t === 0 ? N(s) + 32 : N(t);
		i.includes(c) || (i.push(c), r.push({
			tier: 2,
			place: [c],
			mark: []
		}));
	}
	return r;
}
function he(e, t, n) {
	return ue(e, n < 32 ? (t.pLo | 1 << n) >>> 0 : t.pLo, n < 32 ? t.pHi : (t.pHi | 1 << n - 32) >>> 0, (t.lLo | e.r.lo[n]) >>> 0, (t.lHi | e.r.hi[n]) >>> 0, t.mLo, t.mHi);
}
function ge(e, t) {
	return L((e.r.floorLo & ~t.lLo & ~t.mLo) >>> 0, (e.r.floorHi & ~t.lHi & ~t.mHi) >>> 0);
}
function _e(e, t) {
	let n = (e.r.floorLo & ~t.lLo & ~t.mLo) >>> 0, r = (e.r.floorHi & ~t.lHi & ~t.mHi) >>> 0;
	for (let i = 0; i < e.clueCell.length; i++) {
		let a = e.clueVal[i], o = (e.adjLo[i] & n) >>> 0, s = (e.adjHi[i] & r) >>> 0, c = M(o) + M(s);
		if (c === 0) continue;
		let l = M((e.adjLo[i] & t.pLo) >>> 0) + M((e.adjHi[i] & t.pHi) >>> 0);
		if (l === a) return t.mLo = (t.mLo | o) >>> 0, t.mHi = (t.mHi | s) >>> 0, i;
		if (l + c === a) {
			for (let n = o; n !== 0; n = (n & n - 1) >>> 0) R(e, t, N(n));
			for (let n = s; n !== 0; n = (n & n - 1) >>> 0) R(e, t, N(n) + 32);
			return i;
		}
	}
	return -1;
}
function ve(e, t) {
	let n = e.r, r = (n.floorLo & ~t.lLo & ~t.mLo) >>> 0, i = (n.floorHi & ~t.lHi & ~t.mHi) >>> 0;
	for (let e = 0; e < 2; e++) for (let a = e === 0 ? (n.floorLo & ~t.lLo) >>> 0 : (n.floorHi & ~t.lHi) >>> 0; a !== 0; a = (a & a - 1) >>> 0) {
		let t = N(a) + (e << 5), o = (n.lo[t] & r) >>> 0, s = (n.hi[t] & i) >>> 0;
		if (M(o) + M(s) === 1) return t * 64 + (o === 0 ? N(s) + 32 : N(o));
	}
	return -1;
}
function B(e, t = 3, n) {
	let r = n ?? I(e), i = se(), a = 0, o = 0, s = 0, c = 0, l = 0, u = 0;
	for (let e = 0; e < 512 && !de(r, i); e++) {
		if (fe(r, i)) return {
			solved: !0,
			t1: a,
			t2: o,
			t3: s,
			maxTierUsed: s > 0 ? 3 : o > 0 ? 2 : +(a > 0),
			t2zero: c
		};
		let e = i.mLo, n = i.mHi, d = _e(r, i);
		if (d >= 0) {
			r.clueVal[d] === 0 && (l = (l | i.mLo & ~e) >>> 0, u = (u | i.mHi & ~n) >>> 0), a++;
			continue;
		}
		if (t < 2) break;
		let f = ve(r, i);
		if (f >= 0) {
			let e = f >> 6, t = f & 63;
			(r.r.lo[e] & ~i.lLo & l & ~(t < 32 ? 1 << t : 0)) >>> 0 | (r.r.hi[e] & ~i.lHi & u & ~(t >= 32 ? 1 << t - 32 : 0)) >>> 0 && c++, R(r, i, t), o++;
			continue;
		}
		if (t < 3) break;
		let p = -1;
		for (let e of ge(r, i)) if (he(r, i, e)) {
			p = e;
			break;
		}
		if (p < 0) break;
		z(i, p), s++;
	}
	return {
		solved: !1,
		t1: a,
		t2: o,
		t3: s,
		maxTierUsed: s > 0 ? 3 : o > 0 ? 2 : +(a > 0),
		t2zero: c
	};
}
var ye = {
	place: 4,
	remove: 2,
	deadEnd: 6,
	t2: 2,
	t3: 6,
	trial: 1
};
function be(e) {
	let t = ye;
	return e.placements * t.place + e.removals * t.remove + e.deadEnds * t.deadEnd + e.t2 * t.t2 + e.t3 * t.t3 + e.trials * t.trial;
}
function xe(e, t = {}, n) {
	let r = n ?? I(e), i = r.r, a = t.rng ?? null, o = t.lapsePermille ?? 150, s = t.maxActions ?? 400, c = t.record ?? !0, l = [], u = se(), d = 0, f = 0, p = 0, m = 0, h = 0, g = 0, _ = 0, v = 0, y = null, b = (e) => e[a && e.length > 1 ? a.nextInt(e.length) : 0], x = (e) => {
		R(r, u, e), d++, c && l.push({
			x: e & 7,
			y: e >> 3
		});
	}, S = (e) => ({
		completed: e,
		placements: d,
		removals: f,
		deadEnds: p,
		guesses: m,
		t1: h,
		t2: g,
		t3: _,
		trials: v,
		moves: l
	}), C = () => {
		let e = y, t = L((u.pLo & ~e.snap.pLo) >>> 0, (u.pHi & ~e.snap.pHi) >>> 0);
		for (let e = t.length - 1; e >= 0; e--) {
			let n = t[e];
			f++, c && l.push({
				x: n & 7,
				y: n >> 3
			});
		}
		p++, u = ce(e.snap), z(u, e.cell), y = null;
	}, w = (e) => {
		for (let t = 0; t < r.clueCell.length; t++) if ((e < 32 ? r.adjLo[t] >>> e & 1 : r.adjHi[t] >>> e - 32 & 1) && M((r.adjLo[t] & u.pLo) >>> 0) + M((r.adjHi[t] & u.pHi) >>> 0) + 1 > r.clueVal[t]) return !0;
		return !1;
	}, T = () => {
		let e = (i.floorLo & ~u.lLo & ~u.mLo) >>> 0, t = (i.floorHi & ~u.lHi & ~u.mHi) >>> 0, n = 99, r = [];
		for (let a of L((i.floorLo & ~u.lLo) >>> 0, (i.floorHi & ~u.lHi) >>> 0)) {
			let o = L((i.lo[a] & e) >>> 0, (i.hi[a] & t) >>> 0).filter((e) => !w(e));
			o.length !== 0 && o.length < n && (n = o.length, r = o);
		}
		if (r.length === 0) return !1;
		let a = b(r);
		return y = {
			cell: a,
			snap: ce(u)
		}, m++, x(a), !0;
	};
	for (; d + f < s;) {
		if (de(r, u)) {
			if (y === null) return S(!1);
			C();
			continue;
		}
		if (fe(r, u)) return S(!0);
		let e = pe(r, u);
		if (e.length > 0) {
			let t = b(e);
			for (let e of t.place) x(e);
			for (let e of t.mark) z(u, e);
			h++;
		} else {
			if (!(y === null && a !== null && a.nextInt(1e3) < o)) {
				let e = me(r, u);
				if (e.length > 0) {
					x(b(e).place[0]), g++;
					continue;
				}
				let t = ge(r, u);
				a && a.shuffle(t);
				let n = -1;
				for (let e of t) {
					if (he(r, u, e)) {
						n = e;
						break;
					}
					v++;
				}
				if (n >= 0) {
					z(u, n), _++;
					continue;
				}
			}
			if (y !== null) C();
			else if (!T()) return S(!1);
		}
	}
	return S(!1);
}
function Se(e) {
	let t = se();
	for (let n = 0; n < 256; n++) {
		let n = pe(e, t);
		if (n.length === 0) return !1;
		for (let r of n) {
			if (r.place.length > 0) return !0;
			le(e, t, r);
		}
	}
	return !1;
}
function Ce(e, t) {
	let n = t ?? I(e), r = se();
	for (let e = 0; e < 256; e++) {
		let e = pe(n, r);
		if (e.length === 0) break;
		for (let t of e) le(n, r, t);
	}
	return L(r.pLo, r.pHi);
}
function we(e, t) {
	let n = e.r, r = (n.floorLo & ~t.lLo & ~t.mLo) >>> 0, i = (n.floorHi & ~t.lHi & ~t.mHi) >>> 0;
	for (let n = 0; n < e.clueCell.length; n++) {
		let a = e.clueVal[n], o = M((e.adjLo[n] & t.pLo) >>> 0) + M((e.adjHi[n] & t.pHi) >>> 0), s = M((e.adjLo[n] & r) >>> 0) + M((e.adjHi[n] & i) >>> 0);
		if (o > a || o + s < a) return {
			at: e.clueCell[n],
			kind: "number"
		};
	}
	for (let e of L((n.floorLo & ~t.lLo) >>> 0, (n.floorHi & ~t.lHi) >>> 0)) if ((n.lo[e] & r | n.hi[e] & i) === 0) return {
		at: e,
		kind: "cell"
	};
	return null;
}
function Te(e, t, n = 4) {
	let r = se();
	for (let n of L(t.lo & e.r.floorLo, t.hi & e.r.floorHi)) R(e, r, n);
	for (let t = 0;; t++) {
		let i = we(e, r);
		if (i !== null) return t === 0 ? null : {
			...i,
			rounds: t
		};
		if (t >= n || fe(e, r)) return null;
		let a = [...pe(e, r), ...me(e, r)];
		if (a.length === 0) return null;
		for (let e of a) for (let t of e.mark) z(r, t);
		for (let n of a) for (let i of n.place) if (!Ee(r.pLo, r.pHi, i)) {
			if (Ee(r.lLo, r.lHi, i) || Ee(r.mLo, r.mHi, i)) return {
				at: i,
				kind: "cell",
				rounds: t + 1
			};
			R(e, r, i);
		}
	}
}
var Ee = (e, t, n) => ((n < 32 ? e >>> n : t >>> n - 32) & 1) == 1, De = [
	"self-light",
	"boxed-mixed",
	"self-mixed",
	"line-mixed",
	"boxed-mark",
	"self-mark",
	"boxed-light",
	"line-light",
	"line-mark"
];
function Oe(e, t, n, r) {
	let i = 0, s = (t & 7) + n, c = (t >> 3) + r;
	for (; s >= 0 && c >= 0 && s < e.w && c < e.h && !o(e.stones, a(s, c));) i++, s += n, c += r;
	return i;
}
function ke(e, t) {
	let n = [];
	for (let t = e >>> 0; t !== 0; t = (t & t - 1) >>> 0) n.push(N(t));
	for (let e = t >>> 0; e !== 0; e = (e & e - 1) >>> 0) n.push(N(e) + 32);
	return n;
}
var Ae = (e, t, n) => ((n < 32 ? e >>> n : t >>> n - 32) & 1) == 1;
function je(e, t, n, r, i) {
	let a = 1 + Oe(e, r, -1, 0) + Oe(e, r, 1, 0), o = 1 + Oe(e, r, 0, -1) + Oe(e, r, 0, 1), s = i === r ? "self" : a === 1 || o === 1 ? "boxed" : "line", c = !1, l = !1;
	for (let e of ke(t.r.lo[r], t.r.hi[r])) e !== i && (Ae(n.lLo, n.lHi, e) ? c = !0 : Ae(n.mLo, n.mHi, e) && (l = !0));
	return `${s}-${c && l ? "mixed" : l ? "mark" : "light"}`;
}
function Me(e, t) {
	let n = t ?? I(e), r = n.r, i = se(), a = [], o = [];
	for (let t = 0; t < 512 && !(de(n, i) || fe(n, i)); t++) {
		if (_e(n, i) >= 0) continue;
		let t = (r.floorLo & ~i.lLo & ~i.mLo) >>> 0, s = (r.floorHi & ~i.lHi & ~i.mHi) >>> 0, c = -1, l = -1;
		for (let e of ke((r.floorLo & ~i.lLo) >>> 0, (r.floorHi & ~i.lHi) >>> 0)) {
			let n = (r.lo[e] & t) >>> 0, i = (r.hi[e] & s) >>> 0;
			if (M(n) + M(i) === 1) {
				c = e, l = n === 0 ? N(i) + 32 : N(n);
				break;
			}
		}
		if (c < 0) break;
		a.push(je(e, n, i, c, l)), o.push(l), R(n, i, l);
	}
	return Ne(a, o);
}
function Ne(e, t = []) {
	let n = De.map((t) => e.filter((e) => e === t).length), r = 0, i = [];
	for (let e = 0; e < De.length; e++) r += n[e] * (e + 1), n[e] > 0 && i.push(`${De[e]}×${n[e]}`);
	return {
		kinds: e,
		spots: t,
		signature: i.join(" "),
		bucket: r % 5
	};
}
function Pe(e, t) {
	let n = t ?? Me(e), r = [];
	return n.kinds.forEach((e, t) => {
		e === "self-light" && r.push(n.spots[t]);
	}), r.sort((e, t) => e - t);
}
function Fe(e, t) {
	return t < 32 ? {
		lo: (e.lo | 1 << t) >>> 0,
		hi: e.hi
	} : {
		lo: e.lo,
		hi: (e.hi | 1 << t - 32) >>> 0
	};
}
function V(e, t) {
	return ((t < 32 ? e.lo >>> t : e.hi >>> t - 32) & 1) == 1;
}
function Ie(e, t, n, r) {
	let i = r & 7, o = r >> 3;
	return e === "rot180" ? a(t - 1 - i, n - 1 - o) : e === "mirror" ? a(t - 1 - i, o) : r;
}
function Le(e, t) {
	if (e.symmetry !== "any") return e.symmetry;
	let n = t.nextInt(4);
	return n < 2 ? "rot180" : n === 2 ? "mirror" : "none";
}
function Re(e, t, n) {
	let r = F(e.w * e.h * (e.densityMin + t.nextInt(e.densityMax - e.densityMin + 1)) + 50, 100), o = [];
	for (let t = 0; t < e.h; t++) for (let n = 0; n < e.w; n++) o.push(a(n, t));
	t.shuffle(o);
	let s = i, c = 0;
	for (let t of o) {
		if (c >= r) break;
		if (V(s, t)) continue;
		let i = Ie(n, e.w, e.h, t);
		i !== t && c + 2 > r + 1 || (s = Fe(s, t), c++, i !== t && (s = Fe(s, i), c++));
	}
	return s;
}
function ze(e) {
	if ((e.floorLo | e.floorHi) === 0) return !1;
	let t = {
		lo: e.floorLo,
		hi: e.floorHi
	}, n = e.floorLo === 0 ? N(e.floorHi) + 32 : N(e.floorLo), r = Fe(i, n), a = [n];
	for (; a.length > 0;) {
		let n = a.pop();
		for (let i of g(e.w, e.h, n)) !V(r, i) && V(t, i) && (r = Fe(r, i), a.push(i));
	}
	return r.lo === e.floorLo && r.hi === e.floorHi;
}
function Be(e) {
	for (let t = 0; t < 64; t++) if (M(e.lo[t]) + M(e.hi[t]) === 1) return !0;
	return !1;
}
function Ve(e, t, n) {
	let r = 0;
	for (let i = 0; i < t; i++) for (let o = 0; o < e; o++) for (let s = i; s < t; s++) for (let t = o; t < e; t++) {
		let e = !0;
		for (let r = i; r <= s && e; r++) for (let i = o; i <= t && e; i++) V(n, a(i, r)) && (e = !1);
		if (!e) break;
		let c = (t - o + 1) * (s - i + 1);
		c > r && (r = c);
	}
	return r;
}
function He(e, t, n) {
	let r = M(e), i = n < r ? e : t;
	for (let e = n < r ? n : n - r; e > 0; e--) i = (i & i - 1) >>> 0;
	return N(i) + (n < r ? 0 : 32);
}
function Ue(e, t) {
	let n = 0, r = 0, i = e.floorLo, a = e.floorHi;
	for (; (i | a) !== 0;) {
		let o = He(i, a, t.nextInt(M(i) + M(a))), s = (e.lo[o] & i) >>> 0, c = (e.hi[o] & a) >>> 0, l = He(s, c, t.nextInt(M(s) + M(c)));
		l < 32 ? n = (n | 1 << l) >>> 0 : r = (r | 1 << l - 32) >>> 0, i = (i & ~e.lo[l]) >>> 0, a = (a & ~e.hi[l]) >>> 0;
	}
	return {
		lo: n,
		hi: r
	};
}
function We(e, t, n, r) {
	let i = Array(64).fill(255);
	for (let a = 0; a < 64; a++) {
		if (!V(n, a)) continue;
		let o = 0;
		for (let n of g(e, t, a)) V(r, n) && o++;
		i[a] = o;
	}
	return i;
}
function Ge(e, t, n) {
	let r = t & 7, i = t >> 3, o = e - 1;
	switch (n) {
		case 0: return t;
		case 1: return a(o - i, r);
		case 2: return a(o - r, o - i);
		case 3: return a(i, o - r);
		case 4: return a(o - r, i);
		case 5: return a(r, o - i);
		case 6: return a(i, r);
		case 7: return a(o - i, o - r);
		default: throw RangeError(`transform ${n} out of range`);
	}
}
function Ke(e, t, n) {
	let r = i;
	for (let i = 0; i < 64; i++) V(t, i) && (r = Fe(r, Ge(e, i, n)));
	return r;
}
function qe(e, t) {
	if (t === 0) return e;
	if (e.w !== e.h) throw RangeError("transforms need a square board");
	let n = Array(64).fill(255);
	for (let r = 0; r < 64; r++) e.clues[r] !== 255 && (n[Ge(e.w, r, t)] = e.clues[r]);
	return {
		w: e.w,
		h: e.h,
		stones: Ke(e.w, e.stones, t),
		clues: n
	};
}
function Je(t, n) {
	return e(Uint8Array.from(t)) % n;
}
function Ye(e, t, n, r, i) {
	let a = i ?? I(e);
	for (let i = 0; i < n; i++) {
		let n = xe(e, {
			rng: new ne(t.nextU32(), t.nextU32(), t.nextU32(), t.nextU32() | 1),
			record: !1
		}, a), i = n.completed ? be(n) : 300;
		r.push(i < 300 ? i : 300);
	}
	return r;
}
function Xe(e) {
	let t = e.slice().sort((e, t) => e - t), n = (e) => t[F((t.length - 1) * e, 1e3)];
	return {
		fast: n(200),
		median: n(500),
		tail: n(880),
		runs: t.length
	};
}
function Ze(e, t, n) {
	let r = e.median < t.lo ? t.lo - e.median : e.median > t.hi ? e.median - t.hi : 0;
	return n !== void 0 && e.tail > n ? r + e.tail - n : r;
}
var Qe = 2e6;
function $e(e, t) {
	let n = 0, r = 0;
	for (let t = 0; t < 64; t++) e[t] !== 255 && e[t] !== void 0 && (r++, e[t] === 0 && n++);
	return n * 100 <= t * r;
}
function et(e) {
	let t = (t) => !V(e.stones, t), n = [];
	for (let r = 0; r < 64; r++) {
		let i = e.clues[r];
		if (i === 255 || i === 0) continue;
		let a = g(e.w, e.h, r).filter(t);
		if (a.length === i) for (let e of a) n.includes(e) || n.push(e);
	}
	return n.sort((e, t) => e - t);
}
function tt(e, t, n, r) {
	let i = 0;
	for (let a = 0; a < 64; a++) V(r, a) && (g(e, t, a).some((e) => V(n, e)) || i++);
	return i;
}
function nt(e, t) {
	let n = F(e * 4, t);
	return n < 4 ? n : 4;
}
function rt(e) {
	v({
		w: e.w,
		h: e.h,
		stones: i,
		clues: Array(64).fill(255)
	});
	let t = ne.from(e.seedKey), n = {
		disconnected: 0,
		isolated: 0,
		openRoom: 0,
		notUnique: 0,
		tooDeep: 0,
		solverLimit: 0,
		tooShallow: 0,
		opening: 0,
		t2Range: 0,
		zeros: 0,
		noStart: 0,
		trick: 0,
		singles: 0
	}, r = F(e.w * e.h * 36, 100), a = e.search, o = (e) => a?.realT2 === !0 ? e.t2 - e.t2zero : e.t2, s = a === void 0 ? e.maxAttempts * 20 : e.maxAttempts * 2, c = null, l = 0, u = 0, d = 0, f = 0;
	for (; f < s && !(c !== null && f >= e.maxAttempts || c !== null && a?.afterFound !== void 0 && f >= u + a.afterFound); f++) {
		a !== void 0 && c === null && (d = nt(f, e.maxAttempts), d === 1 && e.trick === void 0 && (d = 0));
		let i = e.t2 === void 0 || d >= 4 ? 0 : d >= 3 && e.t2.lo > 0 ? e.t2.lo - 1 : e.t2.lo, s = d >= 4 ? void 0 : e.isolatedMax, p = d >= 1 ? void 0 : e.trick, m = e.opening === void 0 || d >= 4 ? void 0 : d >= 2 ? {
			...e.opening,
			mod: 1,
			want: 0
		} : e.opening, h = a?.zeroMax === void 0 || d >= 4 ? void 0 : a.zeroMax, _ = Le(e, t), v = Re(e, t, _), y = re({
			w: e.w,
			h: e.h,
			stones: v
		});
		if (!ze(y)) {
			n.disconnected++;
			continue;
		}
		if (Be(y)) {
			n.isolated++;
			continue;
		}
		if (Ve(e.w, e.h, v) > r) {
			n.openRoom++;
			continue;
		}
		let b = Ue(y, t), x, S;
		if (a !== void 0) {
			let r = [b];
			for (let n = 1; n < (e.solutionPicks ?? 1); n++) r.push(Ue(y, t));
			let i = (t) => {
				let n = M(t.lo) + M(t.hi), r = a.score === "lanterns" ? 0 : tt(e.w, e.h, v, t);
				if (a.score === "free") return r * 64 + n;
				if (a.score !== "sumNoZero") return (r + n) * 64 + n;
				let i = 0;
				for (let n = 0; n < 64; n++) V(v, n) && !g(e.w, e.h, n).some((e) => V(t, e)) && i++;
				return (r + n - i + 64) * 64 + n;
			}, s = r.map((e, t) => ({
				b: e,
				k: t,
				s: i(e)
			})).sort((e, t) => t.s - e.s || e.k - t.k), c = null, l = "tooDeep";
			for (let t of s) {
				let n = We(e.w, e.h, v, t.b), r = {
					w: e.w,
					h: e.h,
					stones: v,
					clues: n
				}, i = B(r, e.tierCap, I(r, y));
				if (i.solved) {
					if (e.t2 !== void 0 && o(i) > e.t2.hi || a.t2Total !== void 0 && i.t2 > a.t2Total.hi) l = "t2Range";
					else {
						c = {
							sol: t.b,
							clues: n
						};
						break;
					}
				}
			}
			if (c === null) {
				n[l]++;
				continue;
			}
			b = c.sol, S = c.clues, x = {
				w: e.w,
				h: e.h,
				stones: v,
				clues: S
			};
		} else {
			for (let n = 1; n < (e.solutionPicks ?? 1); n++) {
				let e = Ue(y, t);
				M(e.lo) + M(e.hi) > M(b.lo) + M(b.hi) && (b = e);
			}
			S = We(e.w, e.h, v, b), x = {
				w: e.w,
				h: e.h,
				stones: v,
				clues: S
			};
			let r = B(x, e.tierCap, I(x, y));
			if (!r.solved) {
				let e = oe(x, 2);
				e.aborted ? n.solverLimit++ : e.count === 1 ? n.tooDeep++ : n.notUnique++;
				continue;
			}
			if (e.t2 !== void 0 && r.t2 > e.t2.hi) {
				n.t2Range++;
				continue;
			}
		}
		let C = [];
		for (let e = 0; e < 64; e++) S[e] !== 255 && C.push(e);
		if (t.shuffle(C), e.zeroMaxPct !== void 0 && (C = [...C.filter((e) => S[e] === 0), ...C.filter((e) => S[e] !== 0)]), a?.bigFirst === !0) {
			let e = a.zeroMax === void 0 ? [
				4,
				3,
				2,
				1,
				0
			] : [
				0,
				4,
				3,
				2,
				1
			], t = 0, n = C.slice();
			for (let r of e) for (let e of n) S[e] === r && (C[t++] = e);
		}
		let w = (t) => {
			let n = S.slice();
			for (let r of t) {
				let t = n[r];
				n[r] = 255;
				let i = {
					w: e.w,
					h: e.h,
					stones: v,
					clues: n.slice()
				}, s = I(i, y), c = B(i, e.tierCap, s);
				(!c.solved || e.t2 !== void 0 && o(c) > e.t2.hi || a?.t2Total !== void 0 && c.t2 > a.t2Total.hi || a !== void 0 && e.opening?.nonEmpty === !0 && !Se(s)) && (n[r] = t);
			}
			return n;
		}, T = w(C);
		if (a?.orders !== void 0 && a.orders > 1 && e.t2 !== void 0) {
			let n = (t) => h !== void 0 && t.filter((e) => e === 0).length > h ? -1 : o(B({
				w: e.w,
				h: e.h,
				stones: v,
				clues: t
			}, e.tierCap)), r = n(T);
			for (let e = 1; e < a.orders && r < i - 1; e++) {
				let e = C.filter((e) => S[e] === 0), i = C.filter((e) => S[e] !== 0);
				t.shuffle(i);
				let a = w([...e, ...i]), o = n(a);
				o > r && (r = o, T = a);
			}
		}
		x = {
			w: e.w,
			h: e.h,
			stones: v,
			clues: T
		};
		let E = oe(x, 2, Qe);
		if (E.aborted || E.count !== 1) {
			E.aborted ? n.solverLimit++ : n.notUnique++;
			continue;
		}
		let D = b;
		if (e.requireT3 === !0 && B(x, 2).solved) {
			n.tooShallow++;
			continue;
		}
		if (e.zeroMaxPct !== void 0 && !$e(T, e.zeroMaxPct) || h !== void 0 && T.filter((e) => e === 0).length > h) {
			n.zeros++;
			continue;
		}
		if (e.startVisible === !0 && et(x).length === 0) {
			n.noStart++;
			continue;
		}
		let O = 0, ee = Ce(x), k = "", A = -1;
		if (a !== void 0 && e.t2 !== void 0 && e.tierCap === 2 && o(B(x, 2)) + 2 < i) {
			n.t2Range++;
			continue;
		}
		if (m !== void 0 || p !== void 0 || s !== void 0 || a !== void 0 && e.t2 !== void 0) {
			O = -1;
			let t = !1, r = !1, c = !1;
			for (let n = 0; n < 8 && O < 0; n++) {
				let l = qe(x, n), u = I(l), f = n === 0 ? ee : Ce(l, u);
				if (m !== void 0 && (m.nonEmpty && f.length === 0 || Je(f, m.mod) !== m.want % m.mod)) continue;
				t = !0;
				let h = Me(l, u);
				if (a !== void 0 && e.t2 !== void 0 && e.tierCap === 2) {
					let t = a.realT2 === !0 ? o(B(l, 2, u)) : h.kinds.length;
					if (t < i || t > e.t2.hi) continue;
					let n = a.t2Total;
					if (n !== void 0 && d < 4 && (h.kinds.length < n.lo || h.kinds.length > n.hi)) continue;
				}
				if (c = !0, p !== void 0 && h.bucket !== p.want % p.mod) continue;
				r = !0;
				let g = Pe(l, h).length;
				s !== void 0 && g > s || (k = h.signature, A = g, O = n, ee = f);
			}
			if (O < 0) {
				r ? n.singles++ : c ? n.trick++ : t ? n.t2Range++ : n.opening++;
				continue;
			}
			x = qe(x, O), D = Ke(e.w, b, O);
		}
		if (A < 0) {
			let e = Me(x);
			k = e.signature, A = Pe(x, e).length;
		}
		let te = I(x), j = B(x, e.tierCap, te), ne = a?.t2Total;
		if (e.t2 !== void 0 && (o(j) < i || o(j) > e.t2.hi) || ne !== void 0 && d < 4 && (j.t2 < ne.lo || j.t2 > ne.hi)) {
			n.t2Range++;
			continue;
		}
		let N = Ye(x, t, 8, [], te), P = Xe(N), F = Ze(P, e.target, e.tailMax);
		(F === 0 || c === null || F < c.dist) && (P = Xe(Ye(x, t, 24, N, te)), F = Ze(P, e.target, e.tailMax));
		let ie = 0;
		for (let e = 0; e < 64; e++) T[e] !== 255 && ie++;
		let ae = {
			solution: D,
			lanterns: M(b.lo) + M(b.hi),
			stones: M(v.lo) + M(v.hi),
			clues: ie,
			grade: j,
			difficultyFast: P.fast,
			difficulty: P.median,
			difficultyTail: P.tail,
			symmetry: _,
			opening: ee,
			transform: O,
			trick: k,
			singles: A,
			...a === void 0 ? {} : { relaxed: d }
		};
		if (c === null && (u = f), (c === null || F < c.dist) && (c = {
			level: x,
			meta: ae,
			dist: F
		}), F === 0) break;
		if (l++, a !== void 0 && l >= a.scoredMax) {
			f++;
			break;
		}
	}
	if (c === null) throw Error(`pips generator: no valid level for ${e.seedKey}`);
	v(c.level);
	let p = oe(c.level, 2, Qe);
	if (p.aborted || p.count !== 1) throw Error(`pips generator: non-unique board for ${e.seedKey}`);
	return {
		seedKey: e.seedKey,
		levelId: e.levelId,
		tag: e.tag,
		level: c.level,
		meta: {
			...c.meta,
			inBand: c.dist === 0,
			attempts: f + +(c.dist === 0),
			rejected: n
		}
	};
}
var it = {
	5: {
		lo: 16,
		hi: 24
	},
	6: {
		lo: 17,
		hi: 26
	},
	7: {
		lo: 18,
		hi: 28
	}
}, at = {
	lo: 1,
	hi: 2
};
function ot(e, t, n) {
	let r = [
		0,
		31,
		59,
		90,
		120,
		151,
		181,
		212,
		243,
		273,
		304,
		334
	], i = e % 4 == 0 && e % 100 != 0 || e % 400 == 0, a = (e) => F(e, 4) - F(e, 100) + F(e, 400), o = a(e - 1) - a(1999);
	return (e - 2e3) * 365 + o + r[t - 1] + (i && t > 2 ? 1 : 0) + n - 1;
}
function st(e) {
	return (e + 6) % 7;
}
var ct = {
	week: {
		lo: 36,
		hi: 46
	},
	sunday: {
		lo: 42,
		hi: 50
	}
};
function lt(e) {
	let { y: t, m: n, d: r } = ae(e), i = ot(t, n, r), a = st(i) === 0, o = it[6];
	return {
		seedKey: `lanterns-pips:daily:g3:${e}`,
		levelId: t * 1e4 + n * 100 + r,
		w: 6,
		h: 6,
		densityMin: o.lo,
		densityMax: o.hi,
		symmetry: "any",
		tierCap: 2,
		target: a ? ct.sunday : ct.week,
		maxAttempts: 400,
		solutionPicks: a ? 32 : 8,
		t2: at,
		search: {
			score: "lanterns",
			bigFirst: !1,
			scoredMax: a ? 32 : 8
		},
		tag: a ? "daily-sunday" : "daily",
		band: a ? 3 : 2,
		beat: a ? "peak" : "steady",
		opening: {
			mod: 10,
			want: i % 10,
			nonEmpty: !0
		}
	};
}
var ut = 33554432, dt = {
	week: {
		lo: 54,
		hi: 90
	},
	sunday: {
		lo: 60,
		hi: 98
	}
}, ft = {
	lo: 18,
	hi: 28
};
function pt(e) {
	return ae(e), `lanterns-pips:daily-deep:g1:${e}`;
}
function mt(e) {
	let { y: t, m: n, d: r } = ae(e);
	return (ut | ot(t, n, r)) >>> 0;
}
function ht(e) {
	let { y: t, m: n, d: r } = ae(e), i = ot(t, n, r), a = st(i) === 0, o = a ? 8 : 7;
	return {
		seedKey: pt(e),
		levelId: mt(e),
		w: o,
		h: o,
		densityMin: ft.lo,
		densityMax: ft.hi,
		symmetry: "any",
		maxAttempts: 400,
		tierCap: 3,
		requireT3: !0,
		target: a ? dt.sunday : dt.week,
		tailMax: 180,
		zeroMaxPct: 40,
		tag: a ? "daily-deep-sunday" : "daily-deep",
		band: a ? 2 : 1,
		beat: a ? "peak" : "steady",
		opening: {
			mod: 10,
			want: i % 10,
			nonEmpty: !1
		}
	};
}
var gt = 64, _t = /* @__PURE__ */ new Map();
function vt(e, t) {
	let n = _t.get(e);
	if (n !== void 0) return _t.delete(e), _t.set(e, n), n;
	let r = t();
	return _t.set(e, r), _t.size > gt && _t.delete(_t.keys().next().value), r;
}
function yt(e) {
	let t = lt(e);
	return vt(t.seedKey, () => rt(t));
}
function bt(e) {
	return yt(e).level;
}
function xt(e) {
	let t = ht(e);
	return vt(t.seedKey, () => rt(t));
}
function St(e) {
	return xt(e).level;
}
//#endregion
//#region ../../games/lanterns-pips/analysis.ts
var Ct = (e, t, n) => ((n < 32 ? e >>> n : t >>> n - 32) & 1) == 1;
function wt(e, t) {
	let n = [];
	for (let t = e >>> 0; t !== 0; t = (t & t - 1) >>> 0) n.push(N(t));
	for (let e = t >>> 0; e !== 0; e = (e & e - 1) >>> 0) n.push(N(e) + 32);
	return n;
}
function Tt(e, t) {
	return Et(e, t).a;
}
function Et(e, t) {
	let n = re(e), r = wt((t.lanterns.lo & n.floorLo) >>> 0, (t.lanterns.hi & n.floorHi) >>> 0), i = /* @__PURE__ */ new Uint8Array(64), a = 0, s = 0;
	for (let e of r) {
		a = (a | n.lo[e]) >>> 0, s = (s | n.hi[e]) >>> 0;
		for (let t of wt(n.lo[e], n.hi[e])) i[t] = i[t] + 1;
	}
	let c = /* @__PURE__ */ new Uint8Array(64), l = wt((a & n.floorLo) >>> 0, (s & n.floorHi) >>> 0);
	for (let e of l) c[e] = 1;
	let u = M(n.floorLo) + M(n.floorHi), d = [];
	for (let e = 0; e < r.length; e++) {
		let t = r[e];
		for (let i = e + 1; i < r.length; i++) {
			let e = r[i];
			Ct(n.lo[t], n.hi[t], e) && d.push([t, e]);
		}
	}
	let f = /* @__PURE__ */ new Uint8Array(64), p = /* @__PURE__ */ new Uint8Array(64), m = wt((n.floorLo & ~a) >>> 0, (n.floorHi & ~s) >>> 0);
	for (let e of m) p[e] = 1;
	let h = Array.from({ length: 64 }, () => []), _ = [];
	for (let n = 0; n < 64; n++) {
		let r = e.clues[n];
		if (r === 255) continue;
		_.push(n);
		let i = g(e.w, e.h, n), a = 0;
		for (let e of i) o(t.lanterns, e) && a++;
		if (f[n] = a, a >= r) for (let e of i) p[e] = 0, h[e].push(n);
	}
	let v = [];
	for (let t of _) {
		let n = e.clues[t], r = f[t], i;
		if (r > n) i = "over";
		else if (r === n) i = "ok";
		else {
			let a = 0;
			for (let n of g(e.w, e.h, t)) a += p[n];
			i = r + a < n ? "blocked" : "under";
		}
		v.push({
			cell: t,
			need: n,
			have: r,
			status: i
		});
	}
	let y = Array.from({ length: 64 }, () => []);
	for (let e of r) for (let t of wt(n.lo[e], n.hi[e])) y[t].push(e);
	let b = [];
	for (let e of m) {
		let t = wt(n.lo[e], n.hi[e]);
		if (t.some((e) => p[e] === 1)) continue;
		let r = [], i = [], a = [];
		for (let e of t) if (Ct(n.floorLo, n.floorHi, e)) {
			if (c[e] === 1) {
				let t = h[e].length === 0 ? i : a;
				for (let n of y[e]) t.includes(n) || t.push(n), t !== a && !a.includes(n) && a.push(n);
			} else for (let t of h[e]) r.includes(t) || r.push(t);
		}
		let o = (i.length > 0 ? i : a).sort((e, t) => e - t), s = [];
		o.length > 0 && s.push("light"), r.length > 0 && s.push("stone"), b.push({
			cell: e,
			by: o.length > 0 ? "light" : "stone",
			stones: r.sort((e, t) => e - t),
			lanterns: o,
			causes: s
		});
	}
	return {
		a: {
			litCount: l.length,
			floorCount: u,
			lit: c,
			litBy: i,
			conflicts: d,
			stones: v,
			blocked: b,
			deadCells: b.map((e) => e.cell),
			complete: S(t)
		},
		x: {
			lanterns: r,
			lightFrom: y,
			fullNext: h,
			legal: p
		}
	};
}
var Dt = /* @__PURE__ */ new WeakMap();
function Ot(e) {
	if (Dt.has(e)) return Dt.get(e);
	let t = oe(e, 1, Qe), n = t.count > 0 ? t.solution : null;
	return Dt.set(e, n), n;
}
var kt = /* @__PURE__ */ new WeakMap();
function At(e) {
	let t = kt.get(e);
	return t === void 0 && (t = I(e), kt.set(e, t)), t;
}
var jt = /* @__PURE__ */ new WeakMap(), Mt = 512;
function Nt(e, t) {
	let n = jt.get(e);
	n === void 0 && (n = /* @__PURE__ */ new Map(), jt.set(e, n));
	let r = `${t.lo >>> 0}:${t.hi >>> 0}`, i = n.get(r);
	if (i !== void 0) return i;
	let a = oe(e, 1, Qe, At(e), t).count > 0;
	return n.size >= Mt && n.delete(n.keys().next().value), n.set(r, a), a;
}
function Pt(e, t, n) {
	return t.blocked.length > 0 || t.stones.some((e) => e.status === "over" || e.status === "blocked") ? !0 : t.conflicts.length > 0 || (n.lo | n.hi) === 0 ? !1 : Te(At(e), n, 4) !== null;
}
function Ft(e, t) {
	return t < 32 ? {
		lo: (e.lo & ~(1 << t)) >>> 0,
		hi: e.hi
	} : {
		lo: e.lo,
		hi: (e.hi & ~(1 << t - 32)) >>> 0
	};
}
function It(e, t) {
	let n = (e & 7) - (t & 7), r = (e >> 3) - (t >> 3);
	return (n < 0 ? -n : n) + (r < 0 ? -r : r);
}
function Lt(e, t) {
	let n = new Set(t.deadCells), r = 0;
	for (let t of e.deadCells) n.has(t) || r++;
	let i = new Map(t.stones.map((e) => [e.cell, e.status]));
	for (let t of e.stones) (t.status === "over" || t.status === "blocked") && i.get(t.cell) !== t.status && r++;
	return r;
}
function Rt(e, t, n, r, i) {
	let a = Tt(e, t), o = -1, s = [];
	for (let c of n) {
		let n = Ft(t.lanterns, c), l = Tt(e, {
			...t,
			lanterns: n
		}), u = [
			+!!Nt(e, n),
			+!Pt(e, l, n),
			Lt(a, l),
			i.lastIndexOf(c),
			a.conflicts.length - l.conflicts.length,
			r >= 0 ? -It(c, r) : 0,
			-c
		], d = o < 0;
		for (let e = 0; e < u.length && !d; e++) if (u[e] > s[e]) d = !0;
		else if (u[e] < s[e]) break;
		d && ([o, s] = [c, u]);
	}
	return o;
}
var zt = (e, t) => ((t < 32 ? e.lo >>> t : e.hi >>> t - 32) & 1) == 1;
function Bt(e, t) {
	for (let n of t) e.includes(n) || e.push(n);
}
function Vt(e, t, n) {
	let { a: r, x: i } = Et(e, t), a = i.lanterns.length > 0 && (r.blocked.length > 0 || r.stones.some((e) => e.status === "over" || e.status === "blocked")) ? Ot(e) : null, s = (e) => a !== null && !zt(a, e), c = (t) => g(e.w, e.h, t).filter((e) => i.lanterns.includes(e)), l = re(e), u = r.blocked.map((e) => {
		let t = [];
		for (let n of wt(l.lo[e.cell], l.hi[e.cell])) {
			Bt(t, i.lightFrom[n]);
			for (let e of i.fullNext[n]) Bt(t, c(e));
		}
		return {
			...e,
			culprits: t.filter(s).sort((e, t) => e - t)
		};
	}), d = [];
	for (let t of r.stones) {
		if (t.status !== "over" && t.status !== "blocked") continue;
		let n = c(t.cell);
		if (t.status === "blocked") {
			for (let r of g(e.w, e.h, t.cell)) if (!(i.legal[r] === 1 || i.lanterns.includes(r) || o(e.stones, r))) {
				Bt(n, i.lightFrom[r]);
				for (let e of i.fullNext[r]) e !== t.cell && Bt(n, c(e));
			}
		}
		let r = n.filter(s);
		d.push({
			stone: t.cell,
			reason: t.status === "over" ? "over" : "cannotReach",
			lanterns: (r.length > 0 ? r : n).sort((e, t) => e - t)
		});
	}
	let f = [];
	for (let e of u) Bt(f, e.culprits);
	for (let e of d) Bt(f, e.lanterns.filter(s));
	let p = null;
	if (u.length === 0 && d.length === 0 && r.conflicts.length === 0 && i.lanterns.length > 0 && (p = Te(At(e), t.lanterns, 4), p !== null)) {
		let t = Ot(e);
		t !== null && Bt(f, i.lanterns.filter((e) => !zt(t, e)));
	}
	f.sort((e, t) => e - t);
	let m = n ?? [], h = m.length > 0 ? m[m.length - 1] : -1, _ = f.length === 0 ? null : Rt(e, t, f, h, m);
	return {
		...r,
		blocked: u,
		stuckStones: d,
		culprit: _,
		deadEnd: p
	};
}
//#endregion
//#region ../../games/lanterns-pips/hint.ts
var Ht = /* @__PURE__ */ new WeakMap();
function Ut(e) {
	let t = Ht.get(e);
	if (t !== void 0) return t;
	let n = {
		m: I(e),
		sol: Ot(e)
	};
	return Ht.set(e, n), n;
}
function Wt(e) {
	return Ut(e).sol;
}
var Gt = (e, t, n) => ((n < 32 ? e >>> n : t >>> n - 32) & 1) == 1;
function Kt(e, t) {
	let n = [];
	for (let t = e >>> 0; t !== 0; t = (t & t - 1) >>> 0) n.push(N(t));
	for (let e = t >>> 0; e !== 0; e = (e & e - 1) >>> 0) n.push(N(e) + 32);
	return n;
}
function qt(e, t) {
	let n = (e & 7) - (t & 7), r = (e >> 3) - (t >> 3);
	return (n < 0 ? -n : n) + (r < 0 ? -r : r);
}
function Jt(e, t) {
	for (let n = 0; n < 64; n++) {
		let n = !1, r = (e.r.floorLo & ~t.lLo & ~t.mLo) >>> 0, i = (e.r.floorHi & ~t.lHi & ~t.mHi) >>> 0;
		for (let a = 0; a < e.clueCell.length; a++) {
			let o = M((e.adjLo[a] & t.pLo) >>> 0) + M((e.adjHi[a] & t.pHi) >>> 0), s = (e.adjLo[a] & r) >>> 0, c = (e.adjHi[a] & i) >>> 0;
			(s | c) !== 0 && o === e.clueVal[a] && (t.mLo = (t.mLo | s) >>> 0, t.mHi = (t.mHi | c) >>> 0, n = !0);
		}
		if (!n) return;
	}
}
function Yt(e, t) {
	let n = [], r = (e.r.floorLo & ~t.lLo & ~t.mLo) >>> 0, i = (e.r.floorHi & ~t.lHi & ~t.mHi) >>> 0;
	for (let a = 0; a < e.clueCell.length; a++) {
		let o = M((e.adjLo[a] & t.pLo) >>> 0) + M((e.adjHi[a] & t.pHi) >>> 0), s = (e.adjLo[a] & r) >>> 0, c = (e.adjHi[a] & i) >>> 0, l = M(s) + M(c);
		if (l !== 0 && o + l === e.clueVal[a]) for (let t of Kt(s, c)) n.push({
			cell: t,
			anchor: e.clueCell[a]
		});
	}
	return n;
}
function Xt(e, t) {
	let n = e.r, r = [], i = (n.floorLo & ~t.lLo & ~t.mLo) >>> 0, a = (n.floorHi & ~t.lHi & ~t.mHi) >>> 0;
	for (let e of Kt((n.floorLo & ~t.lLo) >>> 0, (n.floorHi & ~t.lHi) >>> 0)) {
		let t = (n.lo[e] & i) >>> 0, o = (n.hi[e] & a) >>> 0;
		M(t) + M(o) === 1 && r.push({
			cell: t === 0 ? N(o) + 32 : N(t),
			anchor: e
		});
	}
	return r;
}
function Zt(e, t) {
	for (let n = t.length - 1; n >= 0; n--) {
		let r = t[n];
		if (!Number.isInteger(r) || r < 0 || r > 63) continue;
		let i = -1;
		for (let t of g(e.w, e.h, r)) e.clues[t] !== 255 && (i < 0 || t < i) && (i = t);
		if (i >= 0) return i;
	}
	return -1;
}
function Qt(e, t, n) {
	let r = e[0], i = (e) => [
		t >= 0 ? qt(e.cell, t) : 0,
		n >= 0 ? qt(e.cell, n) : 0,
		qt(e.cell, e.anchor),
		e.cell
	], a = i(r);
	for (let t of e) {
		let e = i(t);
		for (let n = 0; n < 4; n++) {
			if (e[n] < a[n]) {
				r = t, a = e;
				break;
			}
			if (e[n] > a[n]) break;
		}
	}
	return r;
}
function $t(e, t, n, r, i) {
	return Rt(e, t, n, r, i);
}
function en(e, t, n, r) {
	let i = {
		hint: { kind: "none" },
		tier: -1
	};
	if (S(t)) return i;
	let { m: a, sol: o } = Ut(e);
	if (o === null) return i;
	let s = a.r, c = (t.lanterns.lo & s.floorLo) >>> 0, l = (t.lanterns.hi & s.floorHi) >>> 0, u = Kt((c & ~o.lo) >>> 0, (l & ~o.hi) >>> 0), d = n !== void 0 && Number.isInteger(n) && n >= 0 && n < 64 ? n : -1, f = r ?? (d >= 0 ? [d] : []);
	if (u.length > 0) return {
		hint: {
			kind: "removeWrong",
			cells: [$t(e, t, u, d, f)],
			remaining: u.length
		},
		tier: -1
	};
	let p = Zt(e, f), m = se();
	for (let e of Kt(c, l)) R(a, m, e);
	let h = (e) => Gt(o.lo, o.hi, e.cell) && !Gt(m.lLo, m.lHi, e.cell), _ = [];
	for (let t = 0; t < 128; t++) {
		Jt(a, m);
		let t = 1, n = Yt(a, m).filter(h);
		if (n.length === 0 && (t = 2, n = Xt(a, m).filter(h)), n.length > 0) {
			let r = Qt(n, d, p);
			if (_.length === 0) return {
				hint: {
					kind: "place",
					cell: r.cell,
					reason: t === 1 ? "stone" : "onlyLight",
					anchor: r.anchor
				},
				tier: t
			};
			let i = e.clues[r.anchor] !== 255 && Gt(e.stones.lo, e.stones.hi, r.anchor), a = (t) => i ? g(e.w, e.h, r.anchor).includes(t) : Gt(s.lo[r.anchor], s.hi[r.anchor], t), o = [..._.filter(a).sort((e, t) => e - t), ..._.filter((e) => !a(e)).sort((e, t) => e - t)];
			return {
				hint: {
					kind: "place",
					cell: r.cell,
					reason: "contradiction",
					anchor: r.anchor,
					ruledOut: o
				},
				tier: 3
			};
		}
		let r = Kt((s.floorLo & ~m.lLo & ~m.mLo) >>> 0, (s.floorHi & ~m.lHi & ~m.mHi) >>> 0).filter((e) => he(a, m, e));
		if (r.length === 0) break;
		for (let e of r) z(m, e), _.push(e);
	}
	let v = Kt((o.lo & ~c) >>> 0, (o.hi & ~l) >>> 0).map((e) => ({
		cell: e,
		anchor: e
	}));
	if (v.length === 0) return i;
	let y = Qt(v, d, p), b = y.cell, x = 99, C = (s.floorLo & ~m.lLo) >>> 0, w = (s.floorHi & ~m.lHi) >>> 0;
	for (let e of Kt((s.lo[y.cell] & C) >>> 0, (s.hi[y.cell] & w) >>> 0)) {
		let t = M((s.lo[e] & C) >>> 0) + M((s.hi[e] & w) >>> 0);
		t < x && ([x, b] = [t, e]);
	}
	return {
		hint: {
			kind: "place",
			cell: y.cell,
			reason: "contradiction",
			anchor: b,
			ruledOut: _.slice().sort((e, t) => e - t)
		},
		tier: 0
	};
}
function tn(e, t, n, r) {
	return en(e, t, n, r).hint;
}
//#endregion
//#region ../../games/lanterns-pips/share.ts
var nn = "Duskwick", rn = "2026-11-01";
function an(e) {
	let { y: t, m: n, d: r } = ae(e);
	return ot(t, n, r);
}
function on(e) {
	return an(e) - an(rn) + 1;
}
var sn = 295306, cn = 57597, ln = [
	"🌑",
	"🌒",
	"🌓",
	"🌔",
	"🌕",
	"🌖",
	"🌗",
	"🌘"
];
function un(e) {
	return F((an(e) * 1e4 + 5e3 + sn - cn) % sn * 8 + 147653, sn) % 8;
}
function dn(e, t) {
	return !Number.isFinite(e) || e <= 0 ? 0 : e > t ? t : e | 0;
}
function fn(e) {
	let t = dn(e, 35999), n = F(t, 60), r = t - n * 60;
	return `${n}:${r < 10 ? "0" : ""}${r}`;
}
var pn = "https://humsleep.github.io/apps/duskwick/", mn = "share";
function hn(e, t = mn) {
	return `${pn}${e >= 1 ? e | 0 : ""}?ct=${t}`;
}
function gn(e, t = mn) {
	return `${pn}${e >= 1 ? `${e | 0}/` : ""}?deep&ct=${t}`;
}
var _n = { showTime: !0 };
function vn(e, t, n) {
	let r = n?.showTime ?? _n.showTime, i = dn(t.hints, 999), a = dn(t.streak, 99999), o = on(t.dateISO), s = n?.deep === !0, c = `${nn} #${o} ${ln[un(t.dateISO)]}${s ? " 🌙" : ""}`, l = n?.strip?.trim() ?? "", u = [
		...i === 0 ? ["✨"] : [`💡${i}`],
		...r ? [`⏱ ${fn(t.seconds)}`] : [],
		`🔥${a}`
	].join(" ");
	return [
		c,
		...l !== "" && !/[A-Za-z\r\n]/.test(l) ? [l] : [],
		u,
		s ? gn(o) : hn(o)
	].join("\n");
}
//#endregion
//#region ../../games/lanterns-pips/index.ts
var yn = {
	id: t.lanternsPips,
	moveWidth: 1,
	init: (e, t) => y(t),
	apply: C,
	isComplete: S,
	encodeMove: m,
	decodeMove: h,
	stateBytes: w
};
//#endregion
//#region src/game/pipsApi.ts
function bn(e) {
	let [t, n, r] = e.split("-").map(Number);
	return Math.floor(Date.UTC(t, n - 1, r) / 864e5);
}
function xn(e) {
	return (/* @__PURE__ */ new Date(e * 864e5)).toISOString().slice(0, 10);
}
function Sn(e, t, n) {
	let r = vn(e, t, n ?? { showTime: !0 }), i = on(t.dateISO);
	return i > 0 ? r : r.replace(` #${i}`, "");
}
//#endregion
//#region src/game/aha.ts
var Cn = (e, t) => ((t < 32 ? e.pLo >>> t : e.pHi >>> t - 32) & 1) == 1;
function wn(e, t, n, r) {
	for (let i = 0; i < 512; i++) {
		if (Cn(t, n)) return !0;
		if (_e(e, t) >= 0) continue;
		if (r < 2) return !1;
		let i = ve(e, t);
		if (i >= 0) {
			R(e, t, i & 63);
			continue;
		}
		if (r < 3) return !1;
		let a = -1;
		for (let n of ge(e, t)) if (he(e, t, n)) {
			a = n;
			break;
		}
		if (a < 0) return !1;
		z(t, a);
	}
	return Cn(t, n);
}
function Tn(e, t, n, r, i) {
	if (!o(r, n) || (t.lo & ~r.lo | t.hi & ~r.hi) !== 0) return 0;
	let a = i ?? I(e), s = se();
	for (let e = 0; e < 64; e++) o(t, e) && R(a, s, e);
	for (let e of [1, 2]) if (wn(a, { ...s }, n, e)) return e;
	return 3;
}
function En(e, t, n, r) {
	return n >= 3 ? 0 : e === 3 ? 3 : e === 2 && t >= 2 && r < 2 ? 2 : 0;
}
//#endregion
//#region src/game/ahaStrip.ts
var Dn = [
	"🏮",
	"🏮",
	"💫",
	"🌟"
];
function On(e, t) {
	let n = Wt(e);
	if (!n) return "";
	let r = I(e), i = yn.init("strip", e), a = 0, s = 0, c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map();
	return t.forEach((t, u) => {
		if (!Number.isInteger(t) || t < 0 || t > 63) return;
		let d = yn.apply(i, {
			x: t & 7,
			y: t >> 3
		});
		if (!d) return;
		let f = i.lanterns;
		if (i = d, !o(i.lanterns, t)) {
			l.delete(t);
			return;
		}
		if (l.set(t, u), c.has(t)) return;
		let p = 0;
		for (let e = 0; e < 64; e++) o(n, e) && !o(i.lanterns, e) && p++;
		let m = En(Tn(e, f, t, n, r), p, a, s);
		m && (a++, m === 2 && s++, c.set(t, m));
	}), [...l.entries()].sort((e, t) => e[1] - t[1]).map(([e]) => Dn[c.get(e) ?? 0]).join("");
}
function kn(e, t) {
	let n = bn(t), r = 0;
	for (let t of e) {
		let e = n - bn(t);
		e >= 0 && e < 30 && (r |= 1 << e);
	}
	return `${t.replaceAll("-", "")}.${(r >>> 0).toString(16)}`;
}
//#endregion
//#region src/a11y/strings.ts
var H = [
	"en",
	"ko",
	"ja",
	"de",
	"fr",
	"es",
	"pt-BR",
	"it",
	"zh-Hans",
	"zh-Hant"
], An = {
	settings: "Settings",
	close: "Close",
	undo: "Undo",
	hint: "Hint",
	street: "Town street",
	home: "Home",
	daily: "Today's puzzle",
	dailyDone: "Today's puzzle, solved",
	tower: "Go to the tower",
	house: "Go to the house",
	nextLevel: "Next puzzle",
	share: "Share",
	adBreak: "Watch an ad for 30 minutes without ads",
	level: "Puzzle {n}",
	soundOn: "Sound on",
	soundOff: "Sound off",
	hapticsOn: "Vibration on",
	hapticsOff: "Vibration off",
	numbersDigits: "Show numbers as digits",
	numbersDots: "Show numbers as dots",
	shareTimeOn: "Include time when sharing",
	shareTimeOff: "Leave time out when sharing",
	replayGuide: "Replay the guide",
	board: "Puzzle, {rows} by {cols}",
	"cell.pos": "Row {row}, column {col}",
	"cell.dark": "dark",
	"cell.lit": "lit",
	"cell.lantern": "lantern",
	"cell.conflict": "lantern, sees another lantern",
	"cell.rock": "stone",
	"cell.rockN": "stone {n}",
	"cell.ok": "done",
	"cell.needs": "needs {k} more",
	"cell.over": "{k} too many",
	"cell.stuck": "can't be met",
	"ann.placed": "Lantern placed",
	"ann.removed": "Lantern removed",
	"ann.undone": "Undone",
	"ann.conflict": "Two lanterns see each other",
	"ann.solved": "Solved",
	"ann.hint": "Hint shown",
	"ann.stuck": "Stuck: one lantern blocks the rest",
	"town.house": "House {n}: show its solved puzzle",
	shields: "Shields: {n} left this month, one per missed day",
	"sync.synced": "Saved to iCloud",
	"sync.pending": "Saving to iCloud…",
	"sync.off": "Saved on this device only"
}, jn = {
	settings: "설정",
	close: "닫기",
	undo: "되돌리기",
	hint: "힌트",
	street: "마을 거리",
	home: "집으로",
	daily: "오늘의 퍼즐",
	dailyDone: "오늘의 퍼즐, 완료",
	tower: "탑으로 가기",
	house: "집으로 가기",
	nextLevel: "다음 퍼즐",
	share: "공유",
	adBreak: "광고 하나 보고 30분 동안 광고 없이",
	level: "퍼즐 {n}",
	soundOn: "소리 켬",
	soundOff: "소리 끔",
	hapticsOn: "진동 켬",
	hapticsOff: "진동 끔",
	numbersDigits: "숫자로 표시",
	numbersDots: "숫자를 점으로 표시",
	shareTimeOn: "공유할 때 시간 포함",
	shareTimeOff: "공유할 때 시간 제외",
	replayGuide: "안내 다시 보기",
	board: "퍼즐, {rows}×{cols}",
	"cell.pos": "{row}행 {col}열",
	"cell.dark": "어두움",
	"cell.lit": "밝음",
	"cell.lantern": "등불",
	"cell.conflict": "등불, 다른 등불과 마주 봄",
	"cell.rock": "돌",
	"cell.rockN": "돌 {n}",
	"cell.ok": "맞음",
	"cell.needs": "{k}개 더 필요",
	"cell.over": "{k}개 많음",
	"cell.stuck": "채울 수 없음",
	"ann.placed": "등불 놓음",
	"ann.removed": "등불 뺌",
	"ann.undone": "되돌림",
	"ann.conflict": "등불 두 개가 마주 봄",
	"ann.solved": "완성",
	"ann.hint": "힌트 표시",
	"ann.stuck": "막혔어요: 등불 하나가 길을 막아요",
	"town.house": "{n}번 집: 푼 퍼즐 보기",
	shields: "지킴이: 이번 달 {n}개, 쉬어 간 날을 하루씩 지켜 줘요",
	"sync.synced": "iCloud에 저장됨",
	"sync.pending": "iCloud에 저장 중",
	"sync.off": "이 기기에만 저장됨"
}, Mn = {
	settings: "設定",
	close: "閉じる",
	undo: "元に戻す",
	hint: "ヒント",
	street: "村の通り",
	home: "家に戻る",
	daily: "今日のパズル",
	dailyDone: "今日のパズル、クリア済み",
	tower: "塔へ行く",
	house: "家へ行く",
	nextLevel: "次のパズル",
	share: "共有",
	adBreak: "広告を見て30分間広告なし",
	level: "パズル {n}",
	soundOn: "サウンド オン",
	soundOff: "サウンド オフ",
	hapticsOn: "振動 オン",
	hapticsOff: "振動 オフ",
	numbersDigits: "数字で表示",
	numbersDots: "ドットで表示",
	shareTimeOn: "共有時にタイムを含める",
	shareTimeOff: "共有時にタイムを含めない",
	replayGuide: "ガイドをもう一度見る",
	board: "パズル、{rows}×{cols}",
	"cell.pos": "{row}行 {col}列",
	"cell.dark": "暗い",
	"cell.lit": "明るい",
	"cell.lantern": "ランタン",
	"cell.conflict": "ランタン、ほかのランタンと向き合っている",
	"cell.rock": "石",
	"cell.rockN": "石 {n}",
	"cell.ok": "達成",
	"cell.needs": "あと{k}個",
	"cell.over": "{k}個多い",
	"cell.stuck": "満たせない",
	"ann.placed": "ランタンを置きました",
	"ann.removed": "ランタンを外しました",
	"ann.undone": "元に戻しました",
	"ann.conflict": "ランタンどうしが照らし合っています",
	"ann.solved": "クリア",
	"ann.hint": "ヒントを表示",
	"ann.stuck": "行き詰まり：ランタンがひとつ、まちがっています",
	"town.house": "{n}番の家：解いたパズルを見る",
	shields: "お守り：今月あと{n}つ、休んだ日を1日ずつ守る",
	"sync.synced": "iCloudに保存済み",
	"sync.pending": "iCloudに保存中",
	"sync.off": "この端末にだけ保存"
}, Nn = {
	settings: "Einstellungen",
	close: "Schließen",
	undo: "Rückgängig",
	hint: "Tipp",
	street: "Dorfstraße",
	home: "Nach Hause",
	daily: "Rätsel des Tages",
	dailyDone: "Rätsel des Tages, gelöst",
	tower: "Zum Turm",
	house: "Zum Haus",
	nextLevel: "Nächstes Rätsel",
	share: "Teilen",
	adBreak: "Werbung ansehen und 30 Minuten ohne Werbung spielen",
	level: "Rätsel {n}",
	soundOn: "Ton an",
	soundOff: "Ton aus",
	hapticsOn: "Vibration an",
	hapticsOff: "Vibration aus",
	numbersDigits: "Zahlen als Ziffern",
	numbersDots: "Zahlen als Punkte",
	shareTimeOn: "Zeit beim Teilen zeigen",
	shareTimeOff: "Zeit beim Teilen weglassen",
	replayGuide: "Anleitung wiederholen",
	board: "Rätsel, {rows} mal {cols}",
	"cell.pos": "Zeile {row}, Spalte {col}",
	"cell.dark": "dunkel",
	"cell.lit": "hell",
	"cell.lantern": "Laterne",
	"cell.conflict": "Laterne, sieht eine andere Laterne",
	"cell.rock": "Stein",
	"cell.rockN": "Stein {n}",
	"cell.ok": "erfüllt",
	"cell.needs": "noch {k}",
	"cell.over": "{k} zu viel",
	"cell.stuck": "nicht erfüllbar",
	"ann.placed": "Laterne gesetzt",
	"ann.removed": "Laterne entfernt",
	"ann.undone": "Rückgängig gemacht",
	"ann.conflict": "Zwei Laternen sehen sich",
	"ann.solved": "Gelöst",
	"ann.hint": "Tipp angezeigt",
	"ann.stuck": "Festgefahren: Eine Laterne steht im Weg",
	"town.house": "Haus {n}: gelöstes Rätsel zeigen",
	shields: "Schutz: noch {n} diesen Monat, einer pro verpasstem Tag",
	"sync.synced": "In iCloud gesichert",
	"sync.pending": "Wird in iCloud gesichert",
	"sync.off": "Nur auf diesem Gerät gespeichert"
}, Pn = {
	settings: "Réglages",
	close: "Fermer",
	undo: "Annuler",
	hint: "Indice",
	street: "Rue du village",
	home: "Maison",
	daily: "Énigme du jour",
	dailyDone: "Énigme du jour, résolue",
	tower: "Aller à la tour",
	house: "Aller à la maison",
	nextLevel: "Énigme suivante",
	share: "Partager",
	adBreak: "Regarder une pub pour 30 minutes sans pub",
	level: "Énigme {n}",
	soundOn: "Son activé",
	soundOff: "Son coupé",
	hapticsOn: "Vibrations activées",
	hapticsOff: "Vibrations coupées",
	numbersDigits: "Nombres en chiffres",
	numbersDots: "Nombres en points",
	shareTimeOn: "Inclure le temps dans le partage",
	shareTimeOff: "Ne pas inclure le temps dans le partage",
	replayGuide: "Revoir le guide",
	board: "Énigme, {rows} sur {cols}",
	"cell.pos": "Ligne {row}, colonne {col}",
	"cell.dark": "sombre",
	"cell.lit": "éclairée",
	"cell.lantern": "lanterne",
	"cell.conflict": "lanterne, voit une autre lanterne",
	"cell.rock": "pierre",
	"cell.rockN": "pierre {n}",
	"cell.ok": "complet",
	"cell.needs": "encore {k}",
	"cell.over": "{k} de trop",
	"cell.stuck": "impossible à remplir",
	"ann.placed": "Lanterne posée",
	"ann.removed": "Lanterne retirée",
	"ann.undone": "Annulé",
	"ann.conflict": "Deux lanternes se voient",
	"ann.solved": "Résolu",
	"ann.hint": "Indice affiché",
	"ann.stuck": "Bloqué\xA0: une lanterne gêne les autres",
	"town.house": "Maison {n}\xA0: voir l'énigme résolue",
	shields: "Protections\xA0: {n} ce mois-ci, une par jour manqué",
	"sync.synced": "Enregistré dans iCloud",
	"sync.pending": "Enregistrement dans iCloud…",
	"sync.off": "Enregistré sur cet appareil uniquement"
}, Fn = {
	settings: "Ajustes",
	close: "Cerrar",
	undo: "Deshacer",
	hint: "Pista",
	street: "Calle del pueblo",
	home: "Volver a casa",
	daily: "Acertijo del día",
	dailyDone: "Acertijo del día, resuelto",
	tower: "Ir a la torre",
	house: "Ir a la casa",
	nextLevel: "Siguiente acertijo",
	share: "Compartir",
	adBreak: "Ver un anuncio y jugar 30 minutos sin anuncios",
	level: "Acertijo {n}",
	soundOn: "Sonido activado",
	soundOff: "Sonido desactivado",
	hapticsOn: "Vibración activada",
	hapticsOff: "Vibración desactivada",
	numbersDigits: "Números en cifras",
	numbersDots: "Números en puntos",
	shareTimeOn: "Incluir el tiempo al compartir",
	shareTimeOff: "No incluir el tiempo al compartir",
	replayGuide: "Ver la guía otra vez",
	board: "Acertijo, {rows} por {cols}",
	"cell.pos": "Fila {row}, columna {col}",
	"cell.dark": "oscura",
	"cell.lit": "iluminada",
	"cell.lantern": "farol",
	"cell.conflict": "farol, ilumina a otro farol",
	"cell.rock": "roca",
	"cell.rockN": "roca {n}",
	"cell.ok": "completa",
	"cell.needs": "necesita {k} más",
	"cell.over": "{k} de más",
	"cell.stuck": "imposible de completar",
	"ann.placed": "Farol colocado",
	"ann.removed": "Farol quitado",
	"ann.undone": "Movimiento deshecho",
	"ann.conflict": "Dos faroles se iluminan entre sí",
	"ann.solved": "Resuelto",
	"ann.hint": "Pista mostrada",
	"ann.stuck": "Atascado: un farol bloquea el resto",
	"town.house": "Casa {n}: ver el acertijo resuelto",
	shields: "Escudos este mes: {n}, uno por cada día sin jugar",
	"sync.synced": "Guardado en iCloud",
	"sync.pending": "Guardando en iCloud…",
	"sync.off": "Guardado solo en este dispositivo"
}, In = {
	settings: "Ajustes",
	close: "Fechar",
	undo: "Desfazer",
	hint: "Dica",
	street: "Rua da vila",
	home: "Casa",
	daily: "Quebra-cabeça do dia",
	dailyDone: "Quebra-cabeça do dia, resolvido",
	tower: "Ir para a torre",
	house: "Ir para a casa",
	nextLevel: "Próximo quebra-cabeça",
	share: "Compartilhar",
	adBreak: "Ver um anúncio e jogar 30 minutos sem anúncios",
	level: "Quebra-cabeça {n}",
	soundOn: "Som ligado",
	soundOff: "Som desligado",
	hapticsOn: "Vibração ligada",
	hapticsOff: "Vibração desligada",
	numbersDigits: "Números em algarismos",
	numbersDots: "Números em pontos",
	shareTimeOn: "Incluir o tempo ao compartilhar",
	shareTimeOff: "Não incluir o tempo ao compartilhar",
	replayGuide: "Rever o guia",
	board: "Quebra-cabeça, {rows} por {cols}",
	"cell.pos": "Linha {row}, coluna {col}",
	"cell.dark": "escuro",
	"cell.lit": "iluminado",
	"cell.lantern": "lanterna",
	"cell.conflict": "lanterna, vê outra lanterna",
	"cell.rock": "pedra",
	"cell.rockN": "pedra {n}",
	"cell.ok": "completo",
	"cell.needs": "faltando {k}",
	"cell.over": "{k} a mais",
	"cell.stuck": "impossível de completar",
	"ann.placed": "Lanterna colocada",
	"ann.removed": "Lanterna retirada",
	"ann.undone": "Desfeito",
	"ann.conflict": "Duas lanternas se veem",
	"ann.solved": "Resolvido",
	"ann.hint": "Dica mostrada",
	"ann.stuck": "Sem saída: uma lanterna impede as outras",
	"town.house": "Casa {n}: ver o quebra-cabeça resolvido",
	shields: "Escudos: {n} neste mês, um por dia perdido",
	"sync.synced": "Salvo no iCloud",
	"sync.pending": "Salvando no iCloud…",
	"sync.off": "Salvo só neste aparelho"
}, Ln = {
	settings: "Impostazioni",
	close: "Chiudi",
	undo: "Annulla",
	hint: "Indizio",
	street: "Via del borgo",
	home: "Casa",
	daily: "Enigma del giorno",
	dailyDone: "Enigma del giorno, risolto",
	tower: "Vai alla torre",
	house: "Vai alla casa",
	nextLevel: "Prossimo enigma",
	share: "Condividi",
	adBreak: "Guarda un annuncio: 30 minuti senza pubblicità",
	level: "Enigma {n}",
	soundOn: "Suono attivo",
	soundOff: "Suono disattivo",
	hapticsOn: "Vibrazione attiva",
	hapticsOff: "Vibrazione disattiva",
	numbersDigits: "Numeri in cifre",
	numbersDots: "Numeri a puntini",
	shareTimeOn: "Includi il tempo quando condividi",
	shareTimeOff: "Non includere il tempo quando condividi",
	replayGuide: "Rivedi la guida",
	board: "Enigma, {rows} per {cols}",
	"cell.pos": "Riga {row}, colonna {col}",
	"cell.dark": "buia",
	"cell.lit": "illuminata",
	"cell.lantern": "lanterna",
	"cell.conflict": "lanterna, ne illumina un'altra",
	"cell.rock": "pietra",
	"cell.rockN": "pietra {n}",
	"cell.ok": "a posto",
	"cell.needs": "ancora {k}",
	"cell.over": "{k} di troppo",
	"cell.stuck": "non si può più completare",
	"ann.placed": "Lanterna aggiunta",
	"ann.removed": "Lanterna tolta",
	"ann.undone": "Annullato",
	"ann.conflict": "Due lanterne si illuminano a vicenda",
	"ann.solved": "Risolto",
	"ann.hint": "Indizio mostrato",
	"ann.stuck": "Vicolo cieco: una lanterna blocca il resto",
	"town.house": "Casa {n}: rivedi l'enigma risolto",
	shields: "Scudi rimasti: {n} questo mese, uno per ogni giorno saltato",
	"sync.synced": "Salvato su iCloud",
	"sync.pending": "Salvataggio su iCloud…",
	"sync.off": "Salvato solo su questo dispositivo"
}, Rn = {
	settings: "设置",
	close: "关闭",
	undo: "撤销",
	hint: "提示",
	street: "小镇街道",
	home: "回家",
	daily: "今日谜题",
	dailyDone: "今日谜题，已完成",
	tower: "前往高塔",
	house: "前往小屋",
	nextLevel: "下一题",
	share: "分享",
	adBreak: "看一则广告，换 30 分钟无广告",
	level: "第 {n} 题",
	soundOn: "音效已开启",
	soundOff: "音效已关闭",
	hapticsOn: "振动已开启",
	hapticsOff: "振动已关闭",
	numbersDigits: "用数字显示",
	numbersDots: "用圆点显示",
	shareTimeOn: "分享时附上用时",
	shareTimeOff: "分享时不附上用时",
	replayGuide: "重看指南",
	board: "谜题，{rows} 行 {cols} 列",
	"cell.pos": "第 {row} 行，第 {col} 列",
	"cell.dark": "未照亮",
	"cell.lit": "已照亮",
	"cell.lantern": "灯笼",
	"cell.conflict": "灯笼，照到了另一盏灯笼",
	"cell.rock": "石头",
	"cell.rockN": "数字 {n} 的石头",
	"cell.ok": "刚好",
	"cell.needs": "还差 {k} 盏",
	"cell.over": "多了 {k} 盏",
	"cell.stuck": "已无法满足",
	"ann.placed": "已放下灯笼",
	"ann.removed": "已拿掉灯笼",
	"ann.undone": "已撤销",
	"ann.conflict": "两盏灯笼互相照到",
	"ann.solved": "完成",
	"ann.hint": "已显示提示",
	"ann.stuck": "卡住了：有一盏灯笼让剩下的解不开了",
	"town.house": "第 {n} 间小屋：查看已解开的谜题",
	shields: "护盾：本月还有 {n} 个，每缺一天用一个",
	"sync.synced": "已保存到 iCloud",
	"sync.pending": "正在保存到 iCloud…",
	"sync.off": "仅保存在这台设备上"
}, zn = {
	settings: "設定",
	close: "關閉",
	undo: "還原",
	hint: "提示",
	street: "小鎮街道",
	home: "回家",
	daily: "今日謎題",
	dailyDone: "今日謎題，已完成",
	tower: "前往高塔",
	house: "前往小屋",
	nextLevel: "下一題",
	share: "分享",
	adBreak: "看完一則廣告，換 30 分鐘無廣告",
	level: "第 {n} 題",
	soundOn: "音效已開啟",
	soundOff: "音效已關閉",
	hapticsOn: "震動已開啟",
	hapticsOff: "震動已關閉",
	numbersDigits: "以數字顯示",
	numbersDots: "以圓點顯示",
	shareTimeOn: "分享時附上時間",
	shareTimeOff: "分享時不附上時間",
	replayGuide: "重看說明",
	board: "謎題，{rows} 列 {cols} 欄",
	"cell.pos": "第 {row} 列，第 {col} 欄",
	"cell.dark": "未照亮",
	"cell.lit": "已照亮",
	"cell.lantern": "燈籠",
	"cell.conflict": "燈籠，照到了另一盞燈籠",
	"cell.rock": "石頭",
	"cell.rockN": "數字 {n} 的石頭",
	"cell.ok": "剛好",
	"cell.needs": "還差 {k} 盞",
	"cell.over": "多了 {k} 盞",
	"cell.stuck": "已無法滿足",
	"ann.placed": "已放上燈籠",
	"ann.removed": "已拿掉燈籠",
	"ann.undone": "已還原",
	"ann.conflict": "兩盞燈籠互相照到",
	"ann.solved": "完成",
	"ann.hint": "已顯示提示",
	"ann.stuck": "卡住了：有一盞燈籠讓這題解不開",
	"town.house": "第 {n} 間小屋：查看已解開的謎題",
	shields: "護盾：本月還有 {n} 個，每缺一天用一個",
	"sync.synced": "已儲存到 iCloud",
	"sync.pending": "正在儲存到 iCloud…",
	"sync.off": "只儲存在這部裝置上"
}, Bn = {
	en: {
		"cap.sound": "Sound",
		"cap.numbers": "Numbers",
		"cap.shareTime": "Time in share",
		"cap.haptics": "Vibration",
		"cap.notify": "Daily reminder",
		"cap.replay": "Guide",
		"cap.restart": "Restart puzzle",
		"cap.privacy": "Privacy choices",
		"cap.policy": "Privacy policy",
		policy: "Privacy policy, opens in Safari",
		notifyOn: "Daily reminder on",
		notifyOff: "Daily reminder off",
		restart: "Restart puzzle, from the beginning",
		privacy: "Privacy choices",
		"ask.notify": "A gentle reminder for tomorrow's puzzle?",
		"ask.yes": "Remind me",
		"ask.later": "Not now",
		"ask.restart": "Start this puzzle over?",
		"ask.restartYes": "Start over",
		"ask.cancel": "Cancel",
		"ask.break": "Watch one short ad for 30 minutes without ads?",
		"ask.breakYes": "Watch",
		tomorrow: "Tomorrow's puzzle",
		month: "This month: lit {done}, covered {shield}",
		milestone: "{n} days in a row",
		gift: "One hour without ads",
		alley: "This street: puzzle {n} of 10",
		floor: "Tower floor {n}",
		leaveDaily: "Back, leave today's puzzle",
		streetOff: "Town street, after today's puzzle"
	},
	ko: {
		"cap.sound": "소리",
		"cap.numbers": "숫자",
		"cap.shareTime": "공유에 시간 표시",
		"cap.haptics": "진동",
		"cap.notify": "매일 알림",
		"cap.replay": "안내",
		"cap.restart": "이 퍼즐 다시",
		"cap.privacy": "개인정보 선택",
		"cap.policy": "개인정보 처리방침",
		policy: "개인정보 처리방침, Safari에서 열림",
		notifyOn: "매일 알림 켬",
		notifyOff: "매일 알림 끔",
		restart: "이 퍼즐 다시, 처음부터",
		privacy: "개인정보 선택",
		"ask.notify": "내일 퍼즐을 조용히 알려 드릴까요?",
		"ask.yes": "알려 주세요",
		"ask.later": "나중에",
		"ask.restart": "이 퍼즐을 처음부터 할까요?",
		"ask.restartYes": "처음부터",
		"ask.cancel": "취소",
		"ask.break": "짧은 광고 하나 보고 30분 동안 광고 없이?",
		"ask.breakYes": "보기",
		tomorrow: "내일의 퍼즐",
		month: "이번 달: {done}일 켬, 지킴이 {shield}일",
		milestone: "{n}일 연속",
		gift: "한 시간 광고 없음",
		alley: "이 골목: 10개 중 {n}번째",
		floor: "탑 {n}층",
		leaveDaily: "돌아가기, 오늘의 퍼즐 나가기",
		streetOff: "마을 거리, 오늘의 퍼즐 뒤에"
	},
	ja: {
		"cap.sound": "サウンド",
		"cap.numbers": "数字",
		"cap.shareTime": "タイムも共有",
		"cap.haptics": "振動",
		"cap.notify": "毎日のお知らせ",
		"cap.replay": "ガイド",
		"cap.restart": "パズルを最初から",
		"cap.privacy": "プライバシーの選択",
		"cap.policy": "プライバシーポリシー",
		policy: "プライバシーポリシー、Safariで開きます",
		notifyOn: "毎日のお知らせ オン",
		notifyOff: "毎日のお知らせ オフ",
		restart: "このパズルを最初から",
		privacy: "プライバシーの選択",
		"ask.notify": "明日のパズルをそっとお知らせしますか？",
		"ask.yes": "お知らせする",
		"ask.later": "あとで",
		"ask.restart": "このパズルを最初からやり直しますか？",
		"ask.restartYes": "最初から",
		"ask.cancel": "キャンセル",
		"ask.break": "短い広告を1本見て30分間広告なしにしますか？",
		"ask.breakYes": "見る",
		tomorrow: "明日のパズル",
		month: "今月：{done}日点灯、{shield}日はお守り",
		milestone: "{n}日連続",
		gift: "1時間広告なし",
		alley: "この道：10軒中{n}軒目",
		floor: "塔の{n}階",
		leaveDaily: "戻る、今日のパズルを出る",
		streetOff: "村の通り、今日のパズルのあとで"
	},
	de: {
		"cap.sound": "Ton",
		"cap.numbers": "Zahlen",
		"cap.shareTime": "Zeit beim Teilen",
		"cap.haptics": "Vibration",
		"cap.notify": "Tägliche Erinnerung",
		"cap.replay": "Anleitung",
		"cap.restart": "Rätsel neu beginnen",
		"cap.privacy": "Datenschutz",
		"cap.policy": "Datenschutzerklärung",
		policy: "Datenschutzerklärung, öffnet sich in Safari",
		notifyOn: "Tägliche Erinnerung an",
		notifyOff: "Tägliche Erinnerung aus",
		restart: "Dieses Rätsel neu beginnen",
		privacy: "Datenschutz-Optionen",
		"ask.notify": "Leise an das Rätsel von morgen erinnern?",
		"ask.yes": "Erinnern",
		"ask.later": "Nicht jetzt",
		"ask.restart": "Dieses Rätsel neu beginnen?",
		"ask.restartYes": "Neu beginnen",
		"ask.cancel": "Abbrechen",
		"ask.break": "Eine kurze Werbung für 30 Minuten ohne Werbung?",
		"ask.breakYes": "Ansehen",
		tomorrow: "Rätsel von morgen",
		month: "Diesen Monat – helle Tage: {done}, geschützte Tage: {shield}",
		milestone: "{n} Tage in Folge",
		gift: "Eine Stunde ohne Werbung",
		alley: "Diese Gasse: Rätsel {n} von 10",
		floor: "Turm, Etage {n}",
		leaveDaily: "Zurück, heutiges Rätsel verlassen",
		streetOff: "Gasse, nach dem heutigen Rätsel"
	},
	fr: {
		"cap.sound": "Son",
		"cap.numbers": "Chiffres",
		"cap.shareTime": "Temps inclus",
		"cap.haptics": "Vibrations",
		"cap.notify": "Rappel quotidien",
		"cap.replay": "Guide",
		"cap.restart": "Recommencer l'énigme",
		"cap.privacy": "Confidentialité",
		"cap.policy": "Politique de confidentialité",
		policy: "Politique de confidentialité, s'ouvre dans Safari",
		notifyOn: "Rappel quotidien activé",
		notifyOff: "Rappel quotidien désactivé",
		restart: "Recommencer l'énigme",
		privacy: "Choix de confidentialité",
		"ask.notify": "Un rappel discret pour l'énigme de demain\xA0?",
		"ask.yes": "Me le rappeler",
		"ask.later": "Plus tard",
		"ask.restart": "Recommencer cette énigme\xA0?",
		"ask.restartYes": "Recommencer",
		"ask.cancel": "Annuler",
		"ask.break": "Une courte pub pour 30 minutes sans pub\xA0?",
		"ask.breakYes": "Regarder",
		tomorrow: "Énigme de demain",
		month: "Ce mois-ci\xA0: jours allumés {done}, protégés {shield}",
		milestone: "{n} jours d'affilée",
		gift: "Une heure sans pub",
		alley: "Cette rue\xA0: énigme {n} sur 10",
		floor: "Tour, étage {n}",
		leaveDaily: "Retour, quitter l'énigme du jour",
		streetOff: "La rue, après l'énigme du jour"
	},
	es: {
		"cap.sound": "Sonido",
		"cap.numbers": "Números",
		"cap.shareTime": "Tiempo al compartir",
		"cap.haptics": "Vibración",
		"cap.notify": "Aviso diario",
		"cap.replay": "Guía",
		"cap.restart": "Reiniciar acertijo",
		"cap.privacy": "Privacidad",
		"cap.policy": "Política de privacidad",
		policy: "Política de privacidad, se abre en Safari",
		notifyOn: "Aviso diario activado",
		notifyOff: "Aviso diario desactivado",
		restart: "Reiniciar acertijo, desde el principio",
		privacy: "Opciones de privacidad",
		"ask.notify": "¿Te avisamos del acertijo de mañana?",
		"ask.yes": "Avisarme",
		"ask.later": "Ahora no",
		"ask.restart": "¿Empezar este acertijo de nuevo?",
		"ask.restartYes": "Reiniciar",
		"ask.cancel": "Cancelar",
		"ask.break": "¿Ver un anuncio corto y jugar 30 minutos sin anuncios?",
		"ask.breakYes": "Ver",
		tomorrow: "Acertijo de mañana",
		month: "Este mes, días iluminados: {done}, con escudo: {shield}",
		milestone: "{n} días seguidos",
		gift: "Una hora sin anuncios",
		alley: "Esta calle: acertijo {n} de 10",
		floor: "Torre, piso {n}",
		leaveDaily: "Volver, salir del acertijo de hoy",
		streetOff: "La calle, después del acertijo de hoy"
	},
	"pt-BR": {
		"cap.sound": "Som",
		"cap.numbers": "Números",
		"cap.shareTime": "Tempo ao compartilhar",
		"cap.haptics": "Vibração",
		"cap.notify": "Lembrete diário",
		"cap.replay": "Guia",
		"cap.restart": "Recomeçar quebra-cabeça",
		"cap.privacy": "Privacidade",
		"cap.policy": "Política de privacidade",
		policy: "Política de privacidade, abre no Safari",
		notifyOn: "Lembrete diário ligado",
		notifyOff: "Lembrete diário desligado",
		restart: "Recomeçar quebra-cabeça, desde o início",
		privacy: "Opções de privacidade",
		"ask.notify": "Um lembrete leve para o quebra-cabeça de amanhã?",
		"ask.yes": "Lembrar",
		"ask.later": "Agora não",
		"ask.restart": "Recomeçar este quebra-cabeça?",
		"ask.restartYes": "Recomeçar",
		"ask.cancel": "Cancelar",
		"ask.break": "Ver um anúncio e jogar 30 minutos sem anúncios?",
		"ask.breakYes": "Assistir",
		tomorrow: "Quebra-cabeça de amanhã",
		month: "Este mês: dias acesos {done}, cobertos {shield}",
		milestone: "{n} dias seguidos",
		gift: "Uma hora sem anúncios",
		alley: "Esta rua: quebra-cabeça {n} de 10",
		floor: "Torre, andar {n}",
		leaveDaily: "Voltar, sair do quebra-cabeça de hoje",
		streetOff: "A rua, depois do quebra-cabeça de hoje"
	},
	it: {
		"cap.sound": "Suono",
		"cap.numbers": "Numeri",
		"cap.shareTime": "Condividi il tempo",
		"cap.haptics": "Vibrazione",
		"cap.notify": "Promemoria",
		"cap.replay": "Guida",
		"cap.restart": "Ricomincia l'enigma",
		"cap.privacy": "Preferenze privacy",
		"cap.policy": "Informativa privacy",
		policy: "Informativa sulla privacy, si apre in Safari",
		notifyOn: "Promemoria giornaliero attivo",
		notifyOff: "Promemoria giornaliero disattivo",
		restart: "Ricomincia l'enigma da capo",
		privacy: "Preferenze sulla privacy",
		"ask.notify": "Un piccolo promemoria per l'enigma di domani?",
		"ask.yes": "Ricordamelo",
		"ask.later": "Non ora",
		"ask.restart": "Ricominciare questo enigma?",
		"ask.restartYes": "Ricomincia",
		"ask.cancel": "Annulla",
		"ask.break": "Un breve annuncio, poi 30 minuti senza pubblicità?",
		"ask.breakYes": "Guarda",
		tomorrow: "L'enigma di domani",
		month: "Questo mese: giorni illuminati {done}, con lo scudo {shield}",
		milestone: "{n} giorni di fila",
		gift: "Un'ora senza pubblicità",
		alley: "Questa via: enigma {n} di 10",
		floor: "Torre, piano {n}",
		leaveDaily: "Indietro, esci dall'enigma del giorno",
		streetOff: "Via del borgo, si apre dopo l'enigma del giorno"
	},
	"zh-Hans": {
		"cap.sound": "音效",
		"cap.numbers": "数字",
		"cap.shareTime": "分享带用时",
		"cap.haptics": "振动",
		"cap.notify": "每日提醒",
		"cap.replay": "指南",
		"cap.restart": "重新开始这道题",
		"cap.privacy": "隐私选项",
		"cap.policy": "隐私政策",
		policy: "隐私政策，将在 Safari 中打开",
		notifyOn: "每日提醒已开启",
		notifyOff: "每日提醒已关闭",
		restart: "重新开始这道题",
		privacy: "隐私选项",
		"ask.notify": "明天的谜题出来时，要提醒你一声吗？",
		"ask.yes": "提醒我",
		"ask.later": "以后再说",
		"ask.restart": "要重新开始这道题吗？",
		"ask.restartYes": "重新开始",
		"ask.cancel": "取消",
		"ask.break": "看一则短广告，换 30 分钟无广告？",
		"ask.breakYes": "观看",
		tomorrow: "明天的谜题",
		month: "本月：点亮 {done} 天，护盾补上 {shield} 天",
		milestone: "连续 {n} 天",
		gift: "一小时无广告",
		alley: "这条街：第 {n} 题，共 10 题",
		floor: "高塔第 {n} 层",
		leaveDaily: "返回，离开今日谜题",
		streetOff: "小镇街道，完成今日谜题后开放"
	},
	"zh-Hant": {
		"cap.sound": "音效",
		"cap.numbers": "數字",
		"cap.shareTime": "分享含時間",
		"cap.haptics": "震動",
		"cap.notify": "每日提醒",
		"cap.replay": "說明",
		"cap.restart": "重新開始這一題",
		"cap.privacy": "隱私選項",
		"cap.policy": "隱私權政策",
		policy: "隱私權政策，將在 Safari 中開啟",
		notifyOn: "每日提醒已開啟",
		notifyOff: "每日提醒已關閉",
		restart: "重新開始這一題",
		privacy: "隱私選項",
		"ask.notify": "明天的謎題，要提醒你一聲嗎？",
		"ask.yes": "提醒我",
		"ask.later": "以後再說",
		"ask.restart": "要重新開始這一題嗎？",
		"ask.restartYes": "重新開始",
		"ask.cancel": "取消",
		"ask.break": "看完一則短廣告，換 30 分鐘無廣告？",
		"ask.breakYes": "觀看",
		tomorrow: "明天的謎題",
		month: "本月：點亮 {done} 天，護盾補上 {shield} 天",
		milestone: "連續 {n} 天",
		gift: "一小時無廣告",
		alley: "這條巷子：第 {n} 題，共 10 題",
		floor: "高塔第 {n} 層",
		leaveDaily: "返回，離開今日謎題",
		streetOff: "小鎮街道，解完今日謎題後開放"
	}
}, Vn = {
	en: {
		"err.conflict": "Lanterns can't shine on each other.",
		"err.over": "Too many lanterns by this {n}.",
		"err.zero": "0 means no lanterns beside it.",
		"err.stuckNum": "This {n} has no room for more lanterns.",
		"err.stuckCell": "This tile can't be lit anymore.",
		"err.early": "One lantern is in the wrong spot.",
		"err.earlySub": "Tap Hint to see which.",
		"err.numbers": "All lit! Now check the numbers.",
		"err.stone": "Lanterns go on tiles, not stones.",
		"hint.remove": "Remove this lantern.",
		"hint.removeSub": "Tap Hint again to take it back.",
		"hint.place": "A lantern fits here.",
		"tut.t1": "Tap a tile to place a lantern.",
		"tut.t1ok": "Its light fills the row.",
		"tut.t2a": "Stones block the light.",
		"tut.t2b": "Light up every tile to win.",
		"tut.t2c": "Light the last dark tile.",
		"tut.lit": "That tile is lit. Try a dark one.",
		"tut.t3a": "Lanterns can't shine on each other.",
		"tut.t3b": "Oops, one too many. Tap it to take it back.",
		"tut.t3c": "Light the two dark tiles.",
		"tut.t3ok": "A stone between them is fine.",
		"tut.t3wrong": "First, remove the extra lantern.",
		"tut.t4a": "A number counts lanterns beside it.",
		"tut.t4b": "Up, down, left, right. Not corners.",
		"tut.t4ok": "This 2 is done.",
		"tut.t4c": "Light the rest.",
		"tut.t4corner": "Corners don't count for numbers.",
		"tut.t4over": "Too many! The 2 wants exactly 2.",
		"tut.t5a": "0 means no lantern beside it.",
		"tut.t5wrong": "Not next to the 0.",
		"tut.follow": "Tap where the hand points.",
		"tut.nice": "Nice!",
		"tut.end": "You're ready. Light up the town!",
		"tut.end2": "No guessing needed, ever.",
		"tut.start": "Start",
		"tut.skip": "Skip",
		"how.title": "Rules",
		"how.c1": "Tap a tile to place a lantern.",
		"how.c1s": "Light shines until a stone.",
		"how.c2": "Light up every tile.",
		"how.c2s": "Tap a lantern to remove it.",
		"how.c3": "Lanterns can't shine on each other.",
		"how.c3s": "A stone between them is fine.",
		"how.c4": "A number = lanterns right beside it.",
		"how.c4s": "Corners don't count. 0 means none.",
		"how.replay": "Replay tutorial",
		howTo: "Rules",
		"cap.town": "Village",
		"cap.today": "Today",
		"cap.undo": "Undo",
		"cap.hint": "Hint",
		"cap.how": "Rules",
		"cap.back": "Back",
		"done.solved": "Solved!",
		"done.next": "Next house →",
		"res.time": "Time",
		"res.streak1": "1-day streak",
		"res.streak": "{n}-day streak",
		"res.shields1": "1 shield left",
		"res.shields": "{n} shields left",
		"res.month": "This month",
		"res.continue": "Continue",
		"daily.intro": "A new puzzle every day.",
		"daily.intro2": "Everyone gets the same puzzle.",
		"daily.ok": "Let's go"
	},
	ko: {
		"err.conflict": "등불끼리 서로 비추면 안 돼요.",
		"err.over": "{n} 숫자 옆에 등불이 너무 많아요.",
		"err.zero": "0 옆에는 등불을 두지 않아요.",
		"err.stuckNum": "숫자 {n} 옆에 등불을 더 놓을 자리가 없어요.",
		"err.stuckCell": "이 칸은 이제 밝힐 수 없어요.",
		"err.early": "등불 하나가 자리를 잘못 잡았어요.",
		"err.earlySub": "힌트를 누르면 알려 줘요.",
		"err.numbers": "다 밝혔어요! 숫자를 확인해요.",
		"err.stone": "등불은 돌이 아닌 칸에 놓아요.",
		"hint.remove": "이 등불을 빼 보세요.",
		"hint.removeSub": "힌트를 한 번 더 누르면 빠져요.",
		"hint.place": "여기에 등불이 들어가요.",
		"tut.t1": "칸을 눌러 등불을 놓아요.",
		"tut.t1ok": "빛이 줄을 따라 퍼져요.",
		"tut.t2a": "돌은 빛을 막아요.",
		"tut.t2b": "모든 칸을 밝히면 완성!",
		"tut.t2c": "마지막 어두운 칸을 밝혀요.",
		"tut.lit": "이미 밝은 칸이에요. 어두운 칸을 눌러요.",
		"tut.t3a": "등불끼리 서로 비추면 안 돼요.",
		"tut.t3b": "앗, 하나 더 놓였어요. 눌러서 빼 볼까요?",
		"tut.t3c": "어두운 두 칸을 밝혀요.",
		"tut.t3ok": "사이에 돌이 있으면 괜찮아요.",
		"tut.t3wrong": "먼저 남는 등불 하나를 빼요.",
		"tut.t4a": "숫자는 바로 옆 등불 개수예요.",
		"tut.t4b": "위·아래·왼쪽·오른쪽만 세요.",
		"tut.t4ok": "2가 딱 맞아요!",
		"tut.t4c": "나머지를 밝혀요.",
		"tut.t4corner": "대각선은 세지 않아요.",
		"tut.t4over": "너무 많아요! 2는 딱 2개.",
		"tut.t5a": "0 옆에는 등불을 두지 않아요.",
		"tut.t5wrong": "0 옆에는 안 돼요.",
		"tut.follow": "손가락이 가리키는 칸을 눌러요.",
		"tut.nice": "좋아요!",
		"tut.end": "준비 끝! 마을을 밝혀 볼까요?",
		"tut.end2": "찍지 않아도 돼요. 차근차근 따지면 꼭 풀려요.",
		"tut.start": "시작",
		"tut.skip": "건너뛰기",
		"how.title": "규칙",
		"how.c1": "칸을 눌러 등불을 놓아요.",
		"how.c1s": "빛은 돌 앞까지 퍼져요.",
		"how.c2": "모든 칸을 밝혀요.",
		"how.c2s": "등불을 다시 누르면 빠져요.",
		"how.c3": "등불끼리 서로 비추면 안 돼요.",
		"how.c3s": "사이에 돌이 있으면 괜찮아요.",
		"how.c4": "숫자 = 바로 옆 등불 개수.",
		"how.c4s": "대각선은 세지 않아요. 0이면 하나도 없어요.",
		"how.replay": "튜토리얼 다시 하기",
		howTo: "규칙",
		"cap.town": "마을",
		"cap.today": "오늘",
		"cap.undo": "되돌리기",
		"cap.hint": "힌트",
		"cap.how": "규칙",
		"cap.back": "돌아가기",
		"done.solved": "완성!",
		"done.next": "다음 집 →",
		"res.time": "시간",
		"res.streak1": "1일 연속",
		"res.streak": "{n}일 연속",
		"res.shields1": "지킴이 1개",
		"res.shields": "지킴이 {n}개",
		"res.month": "이번 달",
		"res.continue": "계속",
		"daily.intro": "매일 새 퍼즐 하나.",
		"daily.intro2": "모두가 같은 퍼즐을 풀어요.",
		"daily.ok": "좋아요"
	},
	ja: {
		"err.conflict": "ランタンどうしが照らし合わないように",
		"err.over": "この{n}のとなりにランタンが多すぎます",
		"err.zero": "0のとなりにはランタンを置きません",
		"err.stuckNum": "この{n}のとなりには、もうランタンを置く場所がありません",
		"err.stuckCell": "このマスはもう照らせません",
		"err.early": "ランタンがひとつ、ちがう場所にあります",
		"err.earlySub": "ヒントでどれかわかります",
		"err.numbers": "すべて照らせました！数字も確かめましょう",
		"err.stone": "ランタンは石ではなくマスに置きます",
		"hint.remove": "このランタンを外してみましょう",
		"hint.removeSub": "もう一度ヒントをタップすると外れます",
		"hint.place": "ここにランタンが入ります",
		"tut.t1": "マスをタップして、ランタンを置きましょう",
		"tut.t1ok": "光が横いっぱいに広がります",
		"tut.t2a": "石は光をさえぎります",
		"tut.t2b": "すべてのマスを照らせばクリア！",
		"tut.t2c": "最後の暗いマスを照らしましょう",
		"tut.lit": "もう明るいマスです。暗いマスを照らしましょう",
		"tut.t3a": "ランタンどうしが照らし合わないように",
		"tut.t3b": "あっ、ひとつ多く置かれました。タップして外してみましょう",
		"tut.t3c": "暗いマスを2つ照らしましょう",
		"tut.t3ok": "間に石があれば大丈夫",
		"tut.t3wrong": "まず、余分なランタンを外しましょう",
		"tut.t4a": "数字は、となりのランタンの数",
		"tut.t4b": "上下左右だけ。ななめは数えません",
		"tut.t4ok": "この2はぴったり！",
		"tut.t4c": "残りを照らしましょう",
		"tut.t4corner": "ななめは数に入りません",
		"tut.t4over": "多すぎ！2はちょうど2個です",
		"tut.t5a": "0のとなりにはランタンを置きません",
		"tut.t5wrong": "0のとなりには置けません",
		"tut.follow": "指がさすマスをタップしましょう",
		"tut.nice": "いいね！",
		"tut.end": "準備OK！村を照らしに行きましょう",
		"tut.end2": "カンに頼らなくても、かならず解けますよ",
		"tut.start": "はじめる",
		"tut.skip": "スキップ",
		"how.title": "ルール",
		"how.c1": "マスをタップして、ランタンを置きましょう",
		"how.c1s": "光は石の手前まで届きます",
		"how.c2": "すべてのマスを照らしましょう",
		"how.c2s": "ランタンをもう一度タップで外せます",
		"how.c3": "ランタンどうしが照らし合わないように",
		"how.c3s": "間に石があれば大丈夫",
		"how.c4": "数字＝となりのランタンの数",
		"how.c4s": "ななめは数えません。0は「なし」",
		"how.replay": "チュートリアルをもう一度",
		howTo: "ルール",
		"cap.town": "村",
		"cap.today": "今日",
		"cap.undo": "元に戻す",
		"cap.hint": "ヒント",
		"cap.how": "ルール",
		"cap.back": "戻る",
		"done.solved": "クリア！",
		"done.next": "次の家へ →",
		"res.time": "タイム",
		"res.streak1": "1日連続",
		"res.streak": "{n}日連続",
		"res.shields1": "お守り 1つ",
		"res.shields": "お守り {n}つ",
		"res.month": "今月",
		"res.continue": "続ける",
		"daily.intro": "毎日、新しいパズルがひとつ",
		"daily.intro2": "みんなで同じパズルを解きます",
		"daily.ok": "はじめる"
	},
	de: {
		"err.conflict": "Zwei Laternen dürfen sich nicht sehen.",
		"err.over": "Zu viele Laternen neben dieser {n}.",
		"err.zero": "Neben einer 0 darf keine Laterne stehen.",
		"err.stuckNum": "Diese {n} lässt sich so nicht mehr erfüllen.",
		"err.stuckCell": "Dieses Feld wird nicht mehr hell.",
		"err.early": "Eine Laterne steht am falschen Platz.",
		"err.earlySub": "„Tipp“ zeigt dir, welche.",
		"err.numbers": "Alles hell! Jetzt die Zahlen prüfen.",
		"err.stone": "Laternen kommen auf Felder, nicht auf Steine.",
		"hint.remove": "Nimm diese Laterne weg.",
		"hint.removeSub": "Noch mal „Tipp“, und sie ist weg.",
		"hint.place": "Hier passt eine Laterne hin.",
		"tut.t1": "Tippe auf ein Feld für eine Laterne.",
		"tut.t1ok": "Das Licht füllt die ganze Reihe.",
		"tut.t2a": "Steine halten das Licht auf.",
		"tut.t2b": "Mach jedes Feld hell – dann ist das Haus fertig.",
		"tut.t2c": "Erhelle das letzte dunkle Feld.",
		"tut.lit": "Das ist schon hell. Nimm ein dunkles.",
		"tut.t3a": "Zwei Laternen dürfen sich nicht sehen.",
		"tut.t3b": "Ups, eine zu viel. Tippe\xA0sie\xA0an, dann ist sie weg.",
		"tut.t3c": "Erhelle die zwei dunklen Felder.",
		"tut.t3ok": "Ein Stein dazwischen ist in Ordnung.",
		"tut.t3wrong": "Nimm zuerst die überzählige Laterne weg.",
		"tut.t4a": "Eine Zahl zählt die Laternen daneben.",
		"tut.t4b": "Oben, unten, links, rechts. Keine Ecken.",
		"tut.t4ok": "Diese 2 ist erfüllt.",
		"tut.t4c": "Erhelle den Rest.",
		"tut.t4corner": "Ecken zählen bei Zahlen nicht.",
		"tut.t4over": "Zu viele! Die 2 will genau 2.",
		"tut.t5a": "Eine 0 heißt: keine Laterne daneben.",
		"tut.t5wrong": "Nicht neben die 0.",
		"tut.follow": "Tippe dort, wo die Hand zeigt.",
		"tut.nice": "Schön!",
		"tut.end": "Bereit! Bring das Dorf zum Leuchten.",
		"tut.end2": "Raten musst du nie.",
		"tut.start": "Los geht's",
		"tut.skip": "Überspringen",
		"how.title": "Regeln",
		"how.c1": "Tippe auf ein Feld für eine Laterne.",
		"how.c1s": "Licht scheint bis zum nächsten Stein.",
		"how.c2": "Mach jedes Feld hell.",
		"how.c2s": "Laterne noch mal antippen: weg.",
		"how.c3": "Laternen dürfen sich nicht gegenseitig anleuchten.",
		"how.c3s": "Ein Stein dazwischen ist in Ordnung.",
		"how.c4": "Zahl = Laternen direkt daneben.",
		"how.c4s": "Ecken zählen nicht. 0 heißt keine.",
		"how.replay": "Einführung wiederholen",
		howTo: "Regeln",
		"cap.town": "Dorf",
		"cap.today": "Heute",
		"cap.undo": "Rückgängig",
		"cap.hint": "Tipp",
		"cap.how": "Regeln",
		"cap.back": "Zurück",
		"done.solved": "Gelöst!",
		"done.next": "Nächstes Haus →",
		"res.time": "Zeit",
		"res.streak1": "1 Tag in Folge",
		"res.streak": "{n} Tage in Folge",
		"res.shields1": "Schutz: 1",
		"res.shields": "Schutz: {n}",
		"res.month": "Diesen Monat",
		"res.continue": "Weiter",
		"daily.intro": "Jeden Tag ein neues Rätsel.",
		"daily.intro2": "Alle bekommen dasselbe Rätsel.",
		"daily.ok": "Los geht's"
	},
	fr: {
		"err.conflict": "Deux lanternes ne doivent pas se voir.",
		"err.over": "Trop de lanternes à côté de ce {n}.",
		"err.zero": "Le 0\xA0: aucune lanterne à côté.",
		"err.stuckNum": "Ce {n} n'a plus de place pour ses lanternes.",
		"err.stuckCell": "Cette case ne peut plus être éclairée.",
		"err.early": "Une lanterne n'est pas à sa place.",
		"err.earlySub": "L'indice vous montre laquelle.",
		"err.numbers": "Tout est éclairé\xA0! Vérifiez les chiffres.",
		"err.stone": "Les lanternes vont sur les cases, pas sur les pierres.",
		"hint.remove": "Retirez cette lanterne.",
		"hint.removeSub": "Touchez Indice encore pour la retirer.",
		"hint.place": "Une lanterne va ici.",
		"tut.t1": "Touchez une case pour poser une lanterne.",
		"tut.t1ok": "Sa lumière remplit toute la ligne.",
		"tut.t2a": "Les pierres arrêtent la lumière.",
		"tut.t2b": "Éclairez toutes les cases pour gagner.",
		"tut.t2c": "Éclairez la dernière case sombre.",
		"tut.lit": "Déjà éclairée. Touchez une case sombre.",
		"tut.t3a": "Deux lanternes ne doivent pas se voir.",
		"tut.t3b": "Oups, une de trop. Touchez-la pour la retirer.",
		"tut.t3c": "Éclairez les deux cases sombres.",
		"tut.t3ok": "Une pierre entre elles, c'est permis.",
		"tut.t3wrong": "D'abord, retirez la lanterne en trop.",
		"tut.t4a": "Un chiffre compte les lanternes voisines.",
		"tut.t4b": "Haut, bas, gauche, droite. Pas les diagonales.",
		"tut.t4ok": "Ce 2 est complet.",
		"tut.t4c": "Éclairez le reste.",
		"tut.t4corner": "Les diagonales ne comptent pas.",
		"tut.t4over": "Trop\xA0! Le 2 en veut exactement 2.",
		"tut.t5a": "0\xA0: aucune lanterne à côté.",
		"tut.t5wrong": "Pas à côté du 0.",
		"tut.follow": "Touchez là où pointe la main.",
		"tut.nice": "Bravo\xA0!",
		"tut.end": "À vous de jouer\xA0! Illuminez le village.",
		"tut.end2": "Jamais besoin de deviner.",
		"tut.start": "Commencer",
		"tut.skip": "Passer",
		"how.title": "Règles",
		"how.c1": "Touchez une case pour poser une lanterne.",
		"how.c1s": "La lumière va jusqu'à une pierre.",
		"how.c2": "Éclairez toutes les cases.",
		"how.c2s": "Touchez une lanterne pour la retirer.",
		"how.c3": "Deux lanternes ne doivent pas se voir.",
		"how.c3s": "Une pierre entre elles, c'est permis.",
		"how.c4": "Chiffre = lanternes juste à côté.",
		"how.c4s": "Pas les diagonales. 0 veut dire aucune.",
		"how.replay": "Revoir le tutoriel",
		howTo: "Règles",
		"cap.town": "Village",
		"cap.today": "Du jour",
		"cap.undo": "Annuler",
		"cap.hint": "Indice",
		"cap.how": "Règles",
		"cap.back": "Retour",
		"done.solved": "Réussi\xA0!",
		"done.next": "Maison suivante →",
		"res.time": "Temps",
		"res.streak1": "1 jour d'affilée",
		"res.streak": "{n} jours d'affilée",
		"res.shields1": "1 protection",
		"res.shields": "{n} protections",
		"res.month": "Ce mois-ci",
		"res.continue": "Continuer",
		"daily.intro": "Une nouvelle énigme chaque jour.",
		"daily.intro2": "La même énigme pour tout le monde.",
		"daily.ok": "C'est parti"
	},
	es: {
		"err.conflict": "Un farol no puede iluminar a otro.",
		"err.over": "Demasiados faroles junto a este {n}.",
		"err.zero": "El 0 quiere decir: ningún farol al lado.",
		"err.stuckNum": "Este {n} ya no tiene sitio para más faroles.",
		"err.stuckCell": "Esta casilla ya no se puede iluminar.",
		"err.early": "Un farol está mal colocado.",
		"err.earlySub": "Toca Pista para ver cuál.",
		"err.numbers": "¡Todo iluminado! Ahora revisa los números.",
		"err.stone": "Los faroles van en casillas, no en rocas.",
		"hint.remove": "Quita este farol.",
		"hint.removeSub": "Toca Pista otra vez para quitarlo.",
		"hint.place": "Aquí va un farol.",
		"tut.t1": "Toca una casilla para poner un farol.",
		"tut.t1ok": "Su luz llena toda la fila.",
		"tut.t2a": "Las rocas detienen la luz.",
		"tut.t2b": "Ilumina todas las casillas para ganar.",
		"tut.t2c": "Ilumina la última casilla oscura.",
		"tut.lit": "Esa ya tiene luz. Elige una oscura.",
		"tut.t3a": "Un farol no puede iluminar a otro.",
		"tut.t3b": "Uy, sobra uno. Tócalo para quitarlo.",
		"tut.t3c": "Ilumina las dos casillas oscuras.",
		"tut.t3ok": "Con una roca en medio, no hay problema.",
		"tut.t3wrong": "Primero, quita el farol que sobra.",
		"tut.t4a": "Un número cuenta los faroles de al lado.",
		"tut.t4b": "Solo arriba, abajo y a los lados.",
		"tut.t4ok": "Este 2 ya está completo.",
		"tut.t4c": "Ilumina el resto.",
		"tut.t4corner": "Las diagonales no cuentan.",
		"tut.t4over": "¡Demasiados! El 2 quiere justo 2.",
		"tut.t5a": "El 0 quiere decir: ningún farol al lado.",
		"tut.t5wrong": "Junto al 0, no.",
		"tut.follow": "Toca donde señala la mano.",
		"tut.nice": "¡Bien!",
		"tut.end": "¡Listo! Ilumina el pueblo.",
		"tut.end2": "Nunca hace falta adivinar.",
		"tut.start": "Empezar",
		"tut.skip": "Saltar",
		"how.title": "Reglas",
		"how.c1": "Toca una casilla para poner un farol.",
		"how.c1s": "La luz llega hasta una roca.",
		"how.c2": "Ilumina todas las casillas.",
		"how.c2s": "Toca un farol para quitarlo.",
		"how.c3": "Un farol no puede iluminar a otro.",
		"how.c3s": "Con una roca en medio, no hay problema.",
		"how.c4": "Número = faroles justo al lado.",
		"how.c4s": "Las diagonales no cuentan. 0 = ninguno.",
		"how.replay": "Repetir el tutorial",
		howTo: "Reglas",
		"cap.town": "Pueblo",
		"cap.today": "Hoy",
		"cap.undo": "Deshacer",
		"cap.hint": "Pista",
		"cap.how": "Reglas",
		"cap.back": "Volver",
		"done.solved": "¡Resuelto!",
		"done.next": "Siguiente casa →",
		"res.time": "Tiempo",
		"res.streak1": "Racha de 1 día",
		"res.streak": "Racha de {n} días",
		"res.shields1": "Queda 1 escudo",
		"res.shields": "Quedan {n} escudos",
		"res.month": "Este mes",
		"res.continue": "Continuar",
		"daily.intro": "Un acertijo nuevo cada día.",
		"daily.intro2": "El mismo acertijo para todos.",
		"daily.ok": "Vamos"
	},
	"pt-BR": {
		"err.conflict": "Uma lanterna não pode iluminar outra.",
		"err.over": "Lanternas demais ao lado deste {n}.",
		"err.zero": "O 0 quer dizer: nenhuma lanterna ao lado.",
		"err.stuckNum": "Este {n} não tem mais espaço para lanternas.",
		"err.stuckCell": "Este quadrado não pode mais ser iluminado.",
		"err.early": "Uma lanterna está no lugar errado.",
		"err.earlySub": "A dica mostra qual.",
		"err.numbers": "Tudo iluminado! Agora confira os números.",
		"err.stone": "Lanternas vão nos quadrados, não nas pedras.",
		"hint.remove": "Tire esta lanterna.",
		"hint.removeSub": "Toque em Dica de novo para tirar.",
		"hint.place": "Aqui cabe uma lanterna.",
		"tut.t1": "Toque num quadrado para pôr uma lanterna.",
		"tut.t1ok": "A luz enche a linha toda.",
		"tut.t2a": "As pedras barram a luz.",
		"tut.t2b": "Ilumine todos os quadrados para vencer.",
		"tut.t2c": "Ilumine o último quadrado escuro.",
		"tut.lit": "Esse já está iluminado. Escolha um escuro.",
		"tut.t3a": "Uma lanterna não pode iluminar outra.",
		"tut.t3b": "Ops, uma a mais. Toque nela para tirá-la.",
		"tut.t3c": "Ilumine os dois quadrados escuros.",
		"tut.t3ok": "Uma pedra no meio, tudo bem.",
		"tut.t3wrong": "Primeiro, tire a lanterna que sobra.",
		"tut.t4a": "O número conta as lanternas ao lado.",
		"tut.t4b": "Só cima, baixo e lados. Sem diagonais.",
		"tut.t4ok": "Este 2 está completo.",
		"tut.t4c": "Ilumine o resto.",
		"tut.t4corner": "Diagonais não contam para os números.",
		"tut.t4over": "Lanternas demais! O 2 quer exatamente 2.",
		"tut.t5a": "O 0 quer dizer: nenhuma lanterna ao lado.",
		"tut.t5wrong": "Ao lado do 0, não.",
		"tut.follow": "Toque onde a mão aponta.",
		"tut.nice": "Boa!",
		"tut.end": "Tudo pronto! Ilumine a vila.",
		"tut.end2": "Nunca precisa chutar.",
		"tut.start": "Começar",
		"tut.skip": "Pular",
		"how.title": "Regras",
		"how.c1": "Toque num quadrado para pôr uma lanterna.",
		"how.c1s": "A luz vai até uma pedra.",
		"how.c2": "Ilumine todos os quadrados.",
		"how.c2s": "Toque numa lanterna para tirá-la.",
		"how.c3": "Uma lanterna não pode iluminar outra.",
		"how.c3s": "Uma pedra no meio, tudo bem.",
		"how.c4": "Número = lanternas bem ao lado.",
		"how.c4s": "Diagonais não contam. 0 é nenhuma.",
		"how.replay": "Refazer o tutorial",
		howTo: "Regras",
		"cap.town": "Vila",
		"cap.today": "Hoje",
		"cap.undo": "Desfazer",
		"cap.hint": "Dica",
		"cap.how": "Regras",
		"cap.back": "Voltar",
		"done.solved": "Resolvido!",
		"done.next": "Próxima casa →",
		"res.time": "Tempo",
		"res.streak1": "1 dia seguido",
		"res.streak": "{n} dias seguidos",
		"res.shields1": "1 escudo",
		"res.shields": "{n} escudos",
		"res.month": "Este mês",
		"res.continue": "Continuar",
		"daily.intro": "Um quebra-cabeça novo todo dia.",
		"daily.intro2": "O mesmo quebra-cabeça para todo mundo.",
		"daily.ok": "Vamos lá"
	},
	it: {
		"err.conflict": "Le lanterne non si illuminano a vicenda.",
		"err.over": "Troppe lanterne accanto a questo {n}.",
		"err.zero": "Lo 0 vuol dire: niente lanterne accanto.",
		"err.stuckNum": "Questo {n} non ha più posto per altre lanterne.",
		"err.stuckCell": "Questa casella non si può più illuminare.",
		"err.early": "Una lanterna è al posto sbagliato.",
		"err.earlySub": "Tocca Indizio per scoprire quale.",
		"err.numbers": "Tutto illuminato! Ora controlla i numeri.",
		"err.stone": "Le lanterne vanno sulle caselle, non sulle pietre.",
		"hint.remove": "Togli questa lanterna.",
		"hint.removeSub": "Tocca di nuovo Indizio per toglierla.",
		"hint.place": "Qui ci va una lanterna.",
		"tut.t1": "Tocca una casella per mettere una lanterna.",
		"tut.t1ok": "La sua luce illumina tutta la riga.",
		"tut.t2a": "Le pietre fermano la luce.",
		"tut.t2b": "Illumina tutte le caselle per vincere.",
		"tut.t2c": "Illumina l'ultima casella buia.",
		"tut.lit": "Questa è già illuminata. Provane una buia.",
		"tut.t3a": "Le lanterne non si illuminano a vicenda.",
		"tut.t3b": "Ops, una di troppo. Toccala per toglierla.",
		"tut.t3c": "Illumina le due caselle buie.",
		"tut.t3ok": "Se in mezzo c'è una pietra, va bene.",
		"tut.t3wrong": "Prima togli la lanterna di troppo.",
		"tut.t4a": "Un numero conta le lanterne accanto.",
		"tut.t4b": "Su, giù, sinistra, destra: niente diagonali.",
		"tut.t4ok": "Questo 2 è a posto!",
		"tut.t4c": "Illumina il resto.",
		"tut.t4corner": "Le diagonali non contano.",
		"tut.t4over": "Troppe! Il 2 ne vuole esattamente 2.",
		"tut.t5a": "Lo 0 vuol dire: niente lanterne accanto.",
		"tut.t5wrong": "Non accanto allo 0.",
		"tut.follow": "Tocca dove indica la mano.",
		"tut.nice": "Ottimo!",
		"tut.end": "Tutto pronto! Illumina il borgo.",
		"tut.end2": "Non serve mai tirare a indovinare.",
		"tut.start": "Inizia",
		"tut.skip": "Salta",
		"how.title": "Regole",
		"how.c1": "Tocca una casella per mettere una lanterna.",
		"how.c1s": "La luce arriva fino a una pietra.",
		"how.c2": "Illumina tutte le caselle.",
		"how.c2s": "Tocca una lanterna per toglierla.",
		"how.c3": "Le lanterne non si illuminano a vicenda.",
		"how.c3s": "Se in mezzo c'è una pietra, va bene.",
		"how.c4": "Numero = lanterne proprio accanto.",
		"how.c4s": "Le diagonali non contano. 0 = nessuna.",
		"how.replay": "Rivedi il tutorial",
		howTo: "Regole",
		"cap.town": "Borgo",
		"cap.today": "Oggi",
		"cap.undo": "Annulla",
		"cap.hint": "Indizio",
		"cap.how": "Regole",
		"cap.back": "Indietro",
		"done.solved": "Risolto!",
		"done.next": "Prossima casa →",
		"res.time": "Tempo",
		"res.streak1": "1 giorno di fila",
		"res.streak": "{n} giorni di fila",
		"res.shields1": "1 scudo rimasto",
		"res.shields": "{n} scudi rimasti",
		"res.month": "Questo mese",
		"res.continue": "Continua",
		"daily.intro": "Un nuovo enigma ogni giorno.",
		"daily.intro2": "Lo stesso enigma per tutti.",
		"daily.ok": "Andiamo"
	},
	"zh-Hans": {
		"err.conflict": "灯笼不能互相照到。",
		"err.over": "这个 {n} 旁边的灯笼太多了。",
		"err.zero": "0 的旁边不能放灯笼。",
		"err.stuckNum": "这个 {n} 旁边已经没有足够的空位放灯笼了。",
		"err.stuckCell": "这一格已经没法照亮了。",
		"err.early": "有一盏灯笼放错位置了。",
		"err.earlySub": "点“提示”就知道是哪一盏。",
		"err.numbers": "全都照亮了！再检查一下数字。",
		"err.stone": "灯笼要放在格子上，不能放在石头上。",
		"hint.remove": "试着拿掉这盏灯笼。",
		"hint.removeSub": "再点一次“提示”就会拿掉。",
		"hint.place": "这里要放一盏灯笼。",
		"tut.t1": "点一下格子，放一盏灯笼。",
		"tut.t1ok": "灯光照亮了整行。",
		"tut.t2a": "石头会挡住灯光。",
		"tut.t2b": "照亮每一格就过关！",
		"tut.t2c": "照亮最后一个暗格。",
		"tut.lit": "这格已经亮了，换个暗格试试。",
		"tut.t3a": "灯笼不能互相照到。",
		"tut.t3b": "哎呀，多放了一盏。点一下就能拿掉。",
		"tut.t3c": "照亮这两个暗格。",
		"tut.t3ok": "中间隔着石头就没关系。",
		"tut.t3wrong": "先把多出来的灯笼拿掉。",
		"tut.t4a": "数字表示旁边有几盏灯笼。",
		"tut.t4b": "只算上下左右，斜对角不算。",
		"tut.t4ok": "这个 2 完成了！",
		"tut.t4c": "把剩下的照亮。",
		"tut.t4corner": "斜对角的不算进数字里。",
		"tut.t4over": "太多了！2 只要刚好 2 盏。",
		"tut.t5a": "0 的旁边不能放灯笼。",
		"tut.t5wrong": "不能放在 0 的旁边。",
		"tut.follow": "点手指指着的格子。",
		"tut.nice": "真棒！",
		"tut.end": "准备好了！去点亮小镇吧。",
		"tut.end2": "每道题都不用靠猜。",
		"tut.start": "开始",
		"tut.skip": "跳过",
		"how.title": "规则",
		"how.c1": "点一下格子，放一盏灯笼。",
		"how.c1s": "灯光会一直照到石头前。",
		"how.c2": "照亮每一格。",
		"how.c2s": "再点一次灯笼就能拿掉。",
		"how.c3": "灯笼不能互相照到。",
		"how.c3s": "中间隔着石头就没关系。",
		"how.c4": "数字表示紧挨着的灯笼数。",
		"how.c4s": "斜对角不算。0 就是一盏都没有。",
		"how.replay": "再玩一遍教程",
		howTo: "规则",
		"cap.town": "小镇",
		"cap.today": "今日",
		"cap.undo": "撤销",
		"cap.hint": "提示",
		"cap.how": "规则",
		"cap.back": "返回",
		"done.solved": "完成！",
		"done.next": "下一间小屋 →",
		"res.time": "用时",
		"res.streak1": "连续 1 天",
		"res.streak": "连续 {n} 天",
		"res.shields1": "还剩 1 个护盾",
		"res.shields": "还剩 {n} 个护盾",
		"res.month": "本月",
		"res.continue": "继续",
		"daily.intro": "每天一道新谜题。",
		"daily.intro2": "大家解的都是同一道题。",
		"daily.ok": "开始吧"
	},
	"zh-Hant": {
		"err.conflict": "燈籠不能互相照到。",
		"err.over": "這個 {n} 旁邊的燈籠太多了。",
		"err.zero": "0 的旁邊不能放燈籠。",
		"err.stuckNum": "這個 {n} 旁邊已經沒有足夠的空格放燈籠了。",
		"err.stuckCell": "這一格已經沒辦法照亮了。",
		"err.early": "有一盞燈籠放錯位置了。",
		"err.earlySub": "點「提示」就知道是哪一盞。",
		"err.numbers": "全部照亮了！再檢查一下數字。",
		"err.stone": "燈籠要放在格子上，不能放在石頭上。",
		"hint.remove": "把這盞燈籠拿掉看看。",
		"hint.removeSub": "再點一次「提示」就會拿掉。",
		"hint.place": "這裡要放一盞燈籠。",
		"tut.t1": "點一下格子，放一盞燈籠。",
		"tut.t1ok": "燈光照亮了整排。",
		"tut.t2a": "石頭會擋住燈光。",
		"tut.t2b": "照亮每一格就過關！",
		"tut.t2c": "照亮最後一個暗格。",
		"tut.lit": "這格已經亮了，換個暗格試試。",
		"tut.t3a": "燈籠不能互相照到。",
		"tut.t3b": "哎呀，多放了一盞。點一下就能拿掉。",
		"tut.t3c": "照亮這兩個暗格。",
		"tut.t3ok": "中間隔著石頭就沒關係。",
		"tut.t3wrong": "先把多出來的燈籠拿掉。",
		"tut.t4a": "數字代表旁邊有幾盞燈籠。",
		"tut.t4b": "只算上下左右，斜對角不算。",
		"tut.t4ok": "這個 2 完成了！",
		"tut.t4c": "把其餘的照亮。",
		"tut.t4corner": "斜對角不算在數字裡。",
		"tut.t4over": "太多了！2 只要剛好 2 盞。",
		"tut.t5a": "0 的旁邊不能放燈籠。",
		"tut.t5wrong": "不能放在 0 的旁邊。",
		"tut.follow": "點手指指著的格子。",
		"tut.nice": "很棒！",
		"tut.end": "準備好了！去點亮小鎮吧。",
		"tut.end2": "完全不需要用猜的。",
		"tut.start": "開始",
		"tut.skip": "略過",
		"how.title": "規則",
		"how.c1": "點一下格子，放一盞燈籠。",
		"how.c1s": "燈光會一直照到石頭前。",
		"how.c2": "照亮每一格。",
		"how.c2s": "再點一次燈籠就能拿掉。",
		"how.c3": "燈籠不能互相照到。",
		"how.c3s": "中間隔著石頭就沒關係。",
		"how.c4": "數字表示緊鄰的燈籠數。",
		"how.c4s": "斜對角不算。0 代表一盞都沒有。",
		"how.replay": "再玩一次教學",
		howTo: "規則",
		"cap.town": "小鎮",
		"cap.today": "今日",
		"cap.undo": "還原",
		"cap.hint": "提示",
		"cap.how": "規則",
		"cap.back": "返回",
		"done.solved": "完成！",
		"done.next": "下一間小屋 →",
		"res.time": "時間",
		"res.streak1": "連續 1 天",
		"res.streak": "連續 {n} 天",
		"res.shields1": "護盾剩 1 個",
		"res.shields": "護盾剩 {n} 個",
		"res.month": "本月",
		"res.continue": "繼續",
		"daily.intro": "每天一道新謎題。",
		"daily.intro2": "大家解的都是同一道題。",
		"daily.ok": "開始吧"
	}
}, U = {
	en: An,
	ko: jn,
	ja: Mn,
	de: Nn,
	fr: Pn,
	es: Fn,
	"pt-BR": In,
	it: Ln,
	"zh-Hans": Rn,
	"zh-Hant": zn
};
for (let e of H) {
	let t = U[e];
	Object.assign(t, Bn[e], Vn[e]), t["cap.replay"] = t.howTo, t.replayGuide = t.howTo;
}
var Hn = {
	en: {
		"cap.faces": "Lantern faces",
		facesOn: "Lantern faces on",
		facesOff: "Lantern faces off",
		"tut.followWick": "Tap the tile where Wick hops."
	},
	ko: {
		"cap.faces": "등불 얼굴",
		facesOn: "등불 얼굴 켬",
		facesOff: "등불 얼굴 끔",
		"tut.followWick": "윅이 뛰어오르는 칸을 눌러요."
	},
	ja: {
		"cap.faces": "ランタンの顔",
		facesOn: "ランタンの顔 オン",
		facesOff: "ランタンの顔 オフ",
		"tut.followWick": "ウィックがはねるマスをタップしましょう"
	},
	de: {
		"cap.faces": "Laternengesichter",
		facesOn: "Laternengesichter an",
		facesOff: "Laternengesichter aus",
		"tut.followWick": "Tippe auf das Feld, auf das Wick hüpft."
	},
	fr: {
		"cap.faces": "Visages des lanternes",
		facesOn: "Visages des lanternes activés",
		facesOff: "Visages des lanternes désactivés",
		"tut.followWick": "Touchez la case où saute Wick."
	},
	es: {
		"cap.faces": "Caras de los faroles",
		facesOn: "Caras de los faroles activadas",
		facesOff: "Caras de los faroles desactivadas",
		"tut.followWick": "Toca la casilla donde salta Wick."
	},
	"pt-BR": {
		"cap.faces": "Rostinhos das lanternas",
		facesOn: "Rostinhos das lanternas ligados",
		facesOff: "Rostinhos das lanternas desligados",
		"tut.followWick": "Toque no quadrado onde o Wick pula."
	},
	it: {
		"cap.faces": "Faccine delle lanterne",
		facesOn: "Faccine delle lanterne attive",
		facesOff: "Faccine delle lanterne disattivate",
		"tut.followWick": "Tocca la casella dove salta Wick."
	},
	"zh-Hans": {
		"cap.faces": "灯笼表情",
		facesOn: "灯笼表情 开",
		facesOff: "灯笼表情 关",
		"tut.followWick": "点小烛跳上去的格子。"
	},
	"zh-Hant": {
		"cap.faces": "燈籠表情",
		facesOn: "燈籠表情 開",
		facesOff: "燈籠表情 關",
		"tut.followWick": "點小燭跳上去的格子。"
	}
};
for (let e of H) Object.assign(U[e], Hn[e]);
var Un = {
	en: {
		"res.streakLbl": "Streak",
		"res.shieldsLbl": "Shields",
		"res.noHints": "No hints",
		"res.order": "Lanterns, in order",
		"card.yourTurn": "Your turn!",
		postcard: "Postcard: today's house, lit, with Wick's stamp"
	},
	ko: {
		"res.streakLbl": "연속 기록",
		"res.shieldsLbl": "지킴이",
		"res.noHints": "힌트 없이",
		"res.order": "등불 놓은 순서",
		"card.yourTurn": "이제 해 볼 차례!",
		postcard: "엽서: 불 켜진 오늘의 집과 윅 우표"
	},
	ja: {
		"res.streakLbl": "連続記録",
		"res.shieldsLbl": "お守り",
		"res.noHints": "ヒントなし",
		"res.order": "ランタンを置いた順",
		"card.yourTurn": "次はあなたの番！",
		postcard: "はがき：明かりのついた今日の家とウィックの切手"
	},
	de: {
		"res.streakLbl": "Serie",
		"res.shieldsLbl": "Schutz",
		"res.noHints": "Ohne Tipps",
		"res.order": "So hast du sie gesetzt",
		"card.yourTurn": "Du bist dran!",
		postcard: "Postkarte: das Haus von heute, beleuchtet, mit Wick-Marke"
	},
	fr: {
		"res.streakLbl": "Série",
		"res.shieldsLbl": "Protections",
		"res.noHints": "Sans indice",
		"res.order": "Lanternes, dans l'ordre",
		"card.yourTurn": "À vous\xA0!",
		postcard: "Carte postale\xA0: la maison du jour et le timbre de Wick"
	},
	es: {
		"res.streakLbl": "Racha",
		"res.shieldsLbl": "Escudos",
		"res.noHints": "Sin pistas",
		"res.order": "Faroles, en orden",
		"card.yourTurn": "¡Te toca!",
		postcard: "Postal: la casa de hoy, iluminada, con el sello de Wick"
	},
	"pt-BR": {
		"res.streakLbl": "Sequência",
		"res.shieldsLbl": "Escudos",
		"res.noHints": "Sem dicas",
		"res.order": "Lanternas, em ordem",
		"card.yourTurn": "Sua vez!",
		postcard: "Cartão-postal: a casa de hoje e o selo do Wick"
	},
	it: {
		"res.streakLbl": "Serie",
		"res.shieldsLbl": "Scudi",
		"res.noHints": "Senza indizi",
		"res.order": "Lanterne, in ordine",
		"card.yourTurn": "Tocca a te!",
		postcard: "Cartolina: la casa di oggi e il francobollo di Wick"
	},
	"zh-Hans": {
		"res.streakLbl": "连续记录",
		"res.shieldsLbl": "护盾",
		"res.noHints": "未使用提示",
		"res.order": "放灯笼的顺序",
		"card.yourTurn": "轮到你了！",
		postcard: "明信片：点亮的今日小屋和小烛的邮票"
	},
	"zh-Hant": {
		"res.streakLbl": "連續紀錄",
		"res.shieldsLbl": "護盾",
		"res.noHints": "未使用提示",
		"res.order": "放燈籠的順序",
		"card.yourTurn": "換你了！",
		postcard: "明信片：點亮的今日小屋和小燭的郵票"
	}
};
for (let e of H) Object.assign(U[e], Un[e]);
var Wn = {
	en: {
		"cap.settings": "Settings",
		"daily.title": "Today's puzzle",
		"daily.offerYes": "Play"
	},
	ko: {
		"cap.settings": "설정",
		"daily.title": "오늘의 퍼즐",
		"daily.offerYes": "풀어 보기"
	},
	ja: {
		"cap.settings": "設定",
		"daily.title": "今日のパズル",
		"daily.offerYes": "あそぶ"
	},
	de: {
		"cap.settings": "Einstellungen",
		"daily.title": "Rätsel des Tages",
		"daily.offerYes": "Spielen"
	},
	fr: {
		"cap.settings": "Réglages",
		"daily.title": "Énigme du jour",
		"daily.offerYes": "Jouer"
	},
	es: {
		"cap.settings": "Ajustes",
		"daily.title": "Acertijo del día",
		"daily.offerYes": "Jugar"
	},
	"pt-BR": {
		"cap.settings": "Ajustes",
		"daily.title": "Quebra-cabeça do dia",
		"daily.offerYes": "Jogar"
	},
	it: {
		"cap.settings": "Impostazioni",
		"daily.title": "Enigma del giorno",
		"daily.offerYes": "Gioca"
	},
	"zh-Hans": {
		"cap.settings": "设置",
		"daily.title": "今日谜题",
		"daily.offerYes": "开始玩"
	},
	"zh-Hant": {
		"cap.settings": "設定",
		"daily.title": "今日謎題",
		"daily.offerYes": "開始玩"
	}
};
for (let e of H) Object.assign(U[e], Wn[e]);
var Gn = {
	en: { village: "Village" },
	ko: { village: "마을" },
	ja: { village: "村" },
	de: { village: "Dorf" },
	fr: { village: "Village" },
	es: { village: "Pueblo" },
	"pt-BR": { village: "Vila" },
	it: { village: "Borgo" },
	"zh-Hans": { village: "小镇" },
	"zh-Hant": { village: "小鎮" }
};
for (let e of H) Object.assign(U[e], Gn[e]);
var Kn = {
	en: {
		"tower.intro": "The tower has harder puzzles.",
		"tower.introSub": "Each one you solve lights up a floor.",
		"town.caption": "Each house is a puzzle you solved. Tap one to see it.",
		"town.captionTower": "The tower on the hill holds harder puzzles."
	},
	ko: {
		"tower.intro": "탑에는 조금 더 어려운 퍼즐이 있어요.",
		"tower.introSub": "하나 풀 때마다 탑 한 층에 불이 켜져요.",
		"town.caption": "집 하나는 내가 푼 퍼즐 하나예요. 누르면 다시 볼 수 있어요.",
		"town.captionTower": "언덕 위 탑에는 더 어려운 퍼즐이 있어요."
	},
	ja: {
		"tower.intro": "塔には、少しむずかしいパズルがあります",
		"tower.introSub": "1問解くごとに、1階ずつ明かりがつきます",
		"town.caption": "家はひとつずつ、解いたパズルです。タップで見られます",
		"town.captionTower": "丘の上の塔には、むずかしいパズルがあります"
	},
	de: {
		"tower.intro": "Im Turm warten schwerere Rätsel.",
		"tower.introSub": "Jedes gelöste Rätsel erhellt ein Stockwerk.",
		"town.caption": "Jedes Haus ist ein gelöstes Rätsel. Tippe, um es anzusehen.",
		"town.captionTower": "Im Turm auf dem Hügel warten schwerere Rätsel."
	},
	fr: {
		"tower.intro": "La tour cache des énigmes plus difficiles.",
		"tower.introSub": "Chaque énigme résolue allume un étage.",
		"town.caption": "Chaque maison est une énigme résolue. Touchez pour la voir.",
		"town.captionTower": "La tour sur la colline cache des énigmes plus difficiles."
	},
	es: {
		"tower.intro": "La torre tiene acertijos más difíciles.",
		"tower.introSub": "Cada uno que resuelves ilumina un piso.",
		"town.caption": "Cada casa es un acertijo resuelto. Tócala para verlo.",
		"town.captionTower": "La torre de la colina guarda acertijos más difíciles."
	},
	"pt-BR": {
		"tower.intro": "A torre tem quebra-cabeças mais difíceis.",
		"tower.introSub": "Cada um que você resolve acende um andar.",
		"town.caption": "Cada casa é um quebra-cabeça resolvido. Toque para ver.",
		"town.captionTower": "A torre no morro guarda quebra-cabeças mais difíceis."
	},
	it: {
		"tower.intro": "La torre ha enigmi più difficili.",
		"tower.introSub": "Ogni enigma risolto accende un piano.",
		"town.caption": "Ogni casa è un enigma risolto. Toccala per rivederlo.",
		"town.captionTower": "La torre sulla collina custodisce enigmi più difficili."
	},
	"zh-Hans": {
		"tower.intro": "高塔里有更难一点的谜题。",
		"tower.introSub": "每解开一题，就点亮一层。",
		"town.caption": "每间小屋都是你解开的一道谜题，点一下就能再看。",
		"town.captionTower": "山丘上的高塔里有更难的谜题。"
	},
	"zh-Hant": {
		"tower.intro": "高塔裡有更難一點的謎題。",
		"tower.introSub": "每解開一題，就點亮一層。",
		"town.caption": "每間小屋都是你解開的一道謎題，點一下就能再看。",
		"town.captionTower": "山丘上的高塔裡有更難的謎題。"
	}
};
for (let e of H) Object.assign(U[e], Kn[e]);
var qn = {
	en: { "cozy.evening": "Cozy evening: no ads for the next 30 minutes." },
	ko: { "cozy.evening": "아늑한 저녁: 30분 동안 광고가 나오지 않아요." },
	ja: { "cozy.evening": "くつろぎの夜：これから30分は広告なし" },
	de: { "cozy.evening": "Gemütlicher Abend: 30 Minuten ohne Werbung." },
	fr: { "cozy.evening": "Soirée douillette : 30 minutes sans pub." },
	es: { "cozy.evening": "Tarde acogedora: 30 minutos sin anuncios." },
	"pt-BR": { "cozy.evening": "Noite aconchegante: 30 minutos sem anúncios." },
	it: { "cozy.evening": "Serata accogliente: 30 minuti senza pubblicità." },
	"zh-Hans": { "cozy.evening": "温馨夜晚：接下来 30 分钟没有广告。" },
	"zh-Hant": { "cozy.evening": "溫馨夜晚：接下來 30 分鐘沒有廣告。" }
};
for (let e of H) Object.assign(U[e], qn[e]);
var Jn = {
	en: {
		"cap.rank": "Ranking",
		rank: "Rankings: today's fastest times (Game Center)"
	},
	ko: {
		"cap.rank": "순위",
		rank: "순위: 오늘 가장 빠른 기록 (Game Center)"
	},
	ja: {
		"cap.rank": "ランキング",
		rank: "ランキング：今日のベストタイム（Game Center）"
	},
	de: {
		"cap.rank": "Rangliste",
		rank: "Rangliste: die schnellsten Zeiten heute (Game Center)"
	},
	fr: {
		"cap.rank": "Classement",
		rank: "Classement : les meilleurs temps du jour (Game Center)"
	},
	es: {
		"cap.rank": "Ranking",
		rank: "Ranking: los tiempos más rápidos de hoy (Game Center)"
	},
	"pt-BR": {
		"cap.rank": "Ranking",
		rank: "Ranking: os tempos mais rápidos de hoje (Game Center)"
	},
	it: {
		"cap.rank": "Classifica",
		rank: "Classifica: i tempi migliori di oggi (Game Center)"
	},
	"zh-Hans": {
		"cap.rank": "排行榜",
		rank: "排行榜：今日最快纪录（Game Center）"
	},
	"zh-Hant": {
		"cap.rank": "排行榜",
		rank: "排行榜：今日最快紀錄（Game Center）"
	}
};
for (let e of H) Object.assign(U[e], Jn[e]);
var Yn = {
	en: {
		"ann.visitor": "{name} came to watch.",
		"ann.aha": "Lantern placed. Nicely reasoned.",
		"stamp.clean": "No take-backs",
		"stamp.star": "Starlit thinking",
		"ann.stamps": "Stamps: {list}",
		"res.melody": "Play your melody again"
	},
	ko: {
		"ann.visitor": "구경 온 이웃: {name}",
		"ann.aha": "등불 놓음. 멋진 추론이에요.",
		"stamp.clean": "망설임 없이",
		"stamp.star": "별빛 추론",
		"ann.stamps": "우표: {list}",
		"res.melody": "내 멜로디 다시 듣기"
	},
	ja: {
		"ann.visitor": "{name}が見に来ました。",
		"ann.aha": "ランタンを置きました。いい読みです。",
		"stamp.clean": "迷いなし",
		"stamp.star": "星あかりの推理",
		"ann.stamps": "切手：{list}",
		"res.melody": "ランタンのメロディをもう一度"
	},
	de: {
		"ann.visitor": "{name} schaut zu.",
		"ann.aha": "Laterne gesetzt. Gut kombiniert.",
		"stamp.clean": "Ohne Zurücknehmen",
		"stamp.star": "Sternklar gedacht",
		"ann.stamps": "Marken: {list}",
		"res.melody": "Deine Melodie noch einmal hören"
	},
	fr: {
		"ann.visitor": "{name} vient jeter un œil.",
		"ann.aha": "Lanterne posée. Bien déduit\xA0!",
		"stamp.clean": "Sans retouche",
		"stamp.star": "Raisonnement étoilé",
		"ann.stamps": "Timbres\xA0: {list}",
		"res.melody": "Réécouter votre mélodie"
	},
	es: {
		"ann.visitor": "{name} vino a mirar.",
		"ann.aha": "Farol colocado. ¡Bien deducido!",
		"stamp.clean": "Sin titubeos",
		"stamp.star": "Razonamiento estelar",
		"ann.stamps": "Sellos: {list}",
		"res.melody": "Volver a escuchar tu melodía"
	},
	"pt-BR": {
		"ann.visitor": "{name} veio assistir.",
		"ann.aha": "Lanterna colocada. Bem deduzido!",
		"stamp.clean": "Sem voltar atrás",
		"stamp.star": "Raciocínio estrelado",
		"ann.stamps": "Selos: {list}",
		"res.melody": "Ouvir sua melodia de novo"
	},
	it: {
		"ann.visitor": "{name} viene a guardare.",
		"ann.aha": "Lanterna aggiunta. Ben ragionato!",
		"stamp.clean": "Senza ripensamenti",
		"stamp.star": "Ragionamento stellare",
		"ann.stamps": "Francobolli: {list}",
		"res.melody": "Riascolta la tua melodia"
	},
	"zh-Hans": {
		"ann.visitor": "有邻居来看你解谜了：{name}",
		"ann.aha": "已放下灯笼。推理得真漂亮。",
		"stamp.clean": "一气呵成",
		"stamp.star": "星光推理",
		"ann.stamps": "邮票：{list}",
		"res.melody": "再听一次你的旋律"
	},
	"zh-Hant": {
		"ann.visitor": "有鄰居來看你解謎了：{name}",
		"ann.aha": "已放上燈籠。推理得真漂亮。",
		"stamp.clean": "一氣呵成",
		"stamp.star": "星光推理",
		"ann.stamps": "郵票：{list}",
		"res.melody": "再聽一次你的旋律"
	}
};
for (let e of H) Object.assign(U[e], Yn[e]);
var Xn = {
	en: {
		"cap.diag": "Export diagnostics",
		diag: "Export diagnostics, opens the share sheet"
	},
	ko: {
		"cap.diag": "진단 내보내기",
		diag: "진단 내보내기, 공유 시트 열림"
	},
	ja: {
		"cap.diag": "診断の書き出し",
		diag: "診断の書き出し、共有シートが開きます"
	},
	de: {
		"cap.diag": "Diagnose exportieren",
		diag: "Diagnose exportieren, öffnet das Teilen-Menü"
	},
	fr: {
		"cap.diag": "Exporter le diagnostic",
		diag: "Exporter le diagnostic, ouvre le menu de partage"
	},
	es: {
		"cap.diag": "Exportar diagnóstico",
		diag: "Exportar diagnóstico, abre el menú para compartir"
	},
	"pt-BR": {
		"cap.diag": "Exportar diagnóstico",
		diag: "Exportar diagnóstico, abre o menu de compartilhamento"
	},
	it: {
		"cap.diag": "Esporta diagnostica",
		diag: "Esporta diagnostica, apre il menu di condivisione"
	},
	"zh-Hans": {
		"cap.diag": "导出诊断数据",
		diag: "导出诊断数据，将打开共享菜单"
	},
	"zh-Hant": {
		"cap.diag": "匯出診斷資料",
		diag: "匯出診斷資料，將開啟分享選單"
	}
};
for (let e of H) Object.assign(U[e], Xn[e]);
var Zn = {
	en: {
		"next.bell": "Remind me tomorrow at {time}?",
		"next.bellA": "Remind me tomorrow at {time}?",
		"next.eve": "New neighbor {name} moves in tomorrow.",
		"next.story": "{name} has something to tell you.",
		"next.storyA": "{name} has something to tell you. Read it here",
		"next.letter": "Letter",
		"next.letterA": "A letter from {name}. Go to the village",
		"next.board": "Next",
		"next.houseA": "Next house puzzle",
		"next.floorA": "Next tower floor",
		"next.tower": "Tower",
		"next.towerA": "Go to the tower",
		"res.practice": "Practice",
		"res.practiceA": "Practice: your streak stays as it is",
		"res.lateA": "Yesterday's lantern, lit today",
		"arch.late": "{date}, yesterday: solve it today and your streak goes on",
		"arch.practice": "{date}: puzzle #{n}, practice"
	},
	ko: {
		"next.bell": "내일 {time}에 알려 드릴까요?",
		"next.bellA": "내일 {time}에 알려 드릴까요?",
		"next.eve": "새 이웃 {name}{이가} 내일 이사 와요.",
		"next.story": "{name}{이가} 할 말이 있대요.",
		"next.storyA": "{name}{이가} 할 말이 있대요. 여기서 읽기",
		"next.letter": "편지",
		"next.letterA": "{name}의 편지. 마을로 가기",
		"next.board": "다음 판",
		"next.houseA": "다음 집 퍼즐",
		"next.floorA": "탑의 다음 층",
		"next.tower": "탑",
		"next.towerA": "탑으로 가기",
		"res.practice": "연습",
		"res.practiceA": "연습: 연속 기록은 그대로예요",
		"res.lateA": "어제의 등불을 오늘 켰어요",
		"arch.late": "{date}, 어제 퍼즐: 오늘 풀어도 연속 기록이 이어져요",
		"arch.practice": "{date}: 퍼즐 #{n}, 연습"
	},
	ja: {
		"next.bell": "明日 {time} にお知らせしましょうか？",
		"next.bellA": "明日 {time} にお知らせしましょうか？",
		"next.eve": "明日、新しいご近所さんの{name}が引っ越してきます。",
		"next.story": "{name}が、話したいことがあるそうです。",
		"next.storyA": "{name}が、話したいことがあるそうです。ここで読む",
		"next.letter": "手紙",
		"next.letterA": "{name}からの手紙。村へ行く",
		"next.board": "次へ",
		"next.houseA": "次の家のパズル",
		"next.floorA": "塔の次の階",
		"next.tower": "塔",
		"next.towerA": "塔へ行く",
		"res.practice": "練習",
		"res.practiceA": "練習：連続記録はそのまま",
		"res.lateA": "昨日のランタンを今日ともしました",
		"arch.late": "{date}、昨日のパズル：今日解いても連続記録が続きます",
		"arch.practice": "{date}：パズル #{n}、練習"
	},
	de: {
		"next.bell": "Morgen um {time} erinnern?",
		"next.bellA": "Morgen um {time} erinnern?",
		"next.eve": "Neu im Dorf: {name} zieht morgen ein.",
		"next.story": "{name} möchte dir etwas erzählen.",
		"next.storyA": "{name} möchte dir etwas erzählen. Hier lesen",
		"next.letter": "Brief",
		"next.letterA": "Ein Brief von {name}. Ins Dorf gehen",
		"next.board": "Weiter",
		"next.houseA": "Nächstes Haus-Rätsel",
		"next.floorA": "Nächste Turmetage",
		"next.tower": "Turm",
		"next.towerA": "Zum Turm gehen",
		"res.practice": "Übung",
		"res.practiceA": "Übung: Deine Serie bleibt, wie sie ist",
		"res.lateA": "Die Laterne von gestern, heute angezündet",
		"arch.late": "{date}, gestern: Löst du es heute, geht deine Serie weiter",
		"arch.practice": "{date}: Rätsel #{n}, Übung"
	},
	fr: {
		"next.bell": "Un rappel demain à {time}\xA0?",
		"next.bellA": "Un rappel demain à {time}\xA0?",
		"next.eve": "Du nouveau\xA0: {name} emménage demain.",
		"next.story": "{name} a quelque chose à vous dire.",
		"next.storyA": "{name} a quelque chose à vous dire. À lire ici",
		"next.letter": "Lettre",
		"next.letterA": "Une lettre de {name}. Aller au village",
		"next.board": "Suite",
		"next.houseA": "Énigme de la maison suivante",
		"next.floorA": "Étage suivant de la tour",
		"next.tower": "Tour",
		"next.towerA": "Aller à la tour",
		"res.practice": "Entraînement",
		"res.practiceA": "Entraînement\xA0: votre série ne change pas",
		"res.lateA": "La lanterne d'hier, allumée aujourd'hui",
		"arch.late": "{date}, hier\xA0: résolue aujourd'hui, votre série continue",
		"arch.practice": "{date}\xA0: énigme n°\xA0{n}, entraînement"
	},
	es: {
		"next.bell": "¿Te aviso mañana a las {time}?",
		"next.bellA": "¿Te aviso mañana a las {time}?",
		"next.eve": "Alguien nuevo: {name} se muda mañana.",
		"next.story": "{name} tiene algo que contarte.",
		"next.storyA": "{name} tiene algo que contarte. Léelo aquí",
		"next.letter": "Carta",
		"next.letterA": "Una carta de {name}. Ir al pueblo",
		"next.board": "Siguiente",
		"next.houseA": "Acertijo de la casa siguiente",
		"next.floorA": "Siguiente piso de la torre",
		"next.tower": "Torre",
		"next.towerA": "Ir a la torre",
		"res.practice": "Práctica",
		"res.practiceA": "Práctica: tu racha sigue igual",
		"res.lateA": "El farol de ayer, encendido hoy",
		"arch.late": "{date}, ayer: si lo resuelves hoy, tu racha sigue",
		"arch.practice": "{date}: acertijo #{n}, práctica"
	},
	"pt-BR": {
		"next.bell": "Quer um lembrete amanhã às {time}?",
		"next.bellA": "Quer um lembrete amanhã às {time}?",
		"next.eve": "Gente nova na vila: {name} se muda amanhã.",
		"next.story": "{name} tem algo para te contar.",
		"next.storyA": "{name} tem algo para te contar. Leia aqui",
		"next.letter": "Carta",
		"next.letterA": "Uma carta de {name}. Ir à vila",
		"next.board": "Próximo",
		"next.houseA": "Quebra-cabeça da próxima casa",
		"next.floorA": "Próximo andar da torre",
		"next.tower": "Torre",
		"next.towerA": "Ir à torre",
		"res.practice": "Treino",
		"res.practiceA": "Treino: sua sequência continua igual",
		"res.lateA": "A lanterna de ontem, acesa hoje",
		"arch.late": "{date}, ontem: resolva hoje e a sequência segue",
		"arch.practice": "{date}: quebra-cabeça #{n}, treino"
	},
	it: {
		"next.bell": "Un promemoria domani alle {time}?",
		"next.bellA": "Un promemoria domani alle {time}?",
		"next.eve": "Novità nel borgo: {name} arriva domani.",
		"next.story": "{name} ha qualcosa da raccontarti.",
		"next.storyA": "{name} ha qualcosa da raccontarti. Leggilo qui",
		"next.letter": "Lettera",
		"next.letterA": "Una lettera da {name}. Vai al villaggio",
		"next.board": "Avanti",
		"next.houseA": "Enigma della prossima casa",
		"next.floorA": "Prossimo piano della torre",
		"next.tower": "Torre",
		"next.towerA": "Vai alla torre",
		"res.practice": "Allenamento",
		"res.practiceA": "Allenamento: la tua serie resta com'è",
		"res.lateA": "La lanterna di ieri, accesa oggi",
		"arch.late": "{date}, ieri: se lo risolvi oggi, la serie continua",
		"arch.practice": "{date}: enigma n. {n}, allenamento"
	},
	"zh-Hans": {
		"next.bell": "明天 {time} 提醒你吗？",
		"next.bellA": "明天 {time} 提醒你吗？",
		"next.eve": "明天搬来的新邻居：{name}",
		"next.story": "故事翻开新的一页：{name}",
		"next.storyA": "故事翻开新的一页：{name}。在这里读",
		"next.letter": "来信",
		"next.letterA": "来信：{name}。去村庄",
		"next.board": "下一题",
		"next.houseA": "下一座小屋的谜题",
		"next.floorA": "塔的下一层",
		"next.tower": "塔",
		"next.towerA": "去塔那里",
		"res.practice": "练习",
		"res.practiceA": "练习：连续记录不变",
		"res.lateA": "昨天的灯笼，今天点亮了",
		"arch.late": "{date}，昨天的谜题：今天解开，连续记录也能延续",
		"arch.practice": "{date}：谜题 #{n}，练习"
	},
	"zh-Hant": {
		"next.bell": "明日 {time} 提醒你嗎？",
		"next.bellA": "明日 {time} 提醒你嗎？",
		"next.eve": "明天搬來的新鄰居：{name}",
		"next.story": "故事翻開新的一頁：{name}",
		"next.storyA": "故事翻開新的一頁：{name}。在這裡讀",
		"next.letter": "來信",
		"next.letterA": "來信：{name}。去村莊",
		"next.board": "下一題",
		"next.houseA": "下一座小屋的謎題",
		"next.floorA": "塔的下一層",
		"next.tower": "塔",
		"next.towerA": "去塔那裡",
		"res.practice": "練習",
		"res.practiceA": "練習：連續紀錄不變",
		"res.lateA": "昨天的燈籠，今天點亮了",
		"arch.late": "{date}，昨天的謎題：今天解開，連續紀錄也能延續",
		"arch.practice": "{date}：謎題 #{n}，練習"
	}
};
for (let e of H) Object.assign(U[e], Zn[e]);
var Qn = {
	en: {
		"cap.deep": "Deep night",
		deep: "Deep night: one more puzzle tonight",
		"next.deepA": "Open tonight's deep night",
		postcardDeep: "Postcard: tonight's deep night, lit, with Wick's stamp"
	},
	ko: {
		"cap.deep": "깊은 밤",
		deep: "깊은 밤: 오늘 밤 한 판 더",
		"next.deepA": "오늘의 깊은 밤 열기",
		postcardDeep: "엽서: 불 켜진 오늘의 깊은 밤과 윅 우표"
	},
	ja: {
		"cap.deep": "深い夜",
		deep: "深い夜：今夜もう1問",
		"next.deepA": "今夜の深い夜をひらく",
		postcardDeep: "はがき：明かりのついた今夜の深い夜とウィックの切手"
	},
	de: {
		"cap.deep": "Tiefe Nacht",
		deep: "Tiefe Nacht: noch ein Rätsel heute Nacht",
		"next.deepA": "Die tiefe Nacht von heute öffnen",
		postcardDeep: "Postkarte: die tiefe Nacht von heute mit Wick-Marke"
	},
	fr: {
		"cap.deep": "Nuit profonde",
		deep: "Nuit profonde\xA0: une énigme de plus ce soir",
		"next.deepA": "Ouvrir la nuit profonde de ce soir",
		postcardDeep: "Carte postale\xA0: la nuit profonde et le timbre de Wick"
	},
	es: {
		"cap.deep": "Noche profunda",
		deep: "Noche profunda: un acertijo más esta noche",
		"next.deepA": "Abrir la noche profunda de hoy",
		postcardDeep: "Postal: la noche profunda de hoy con el sello de Wick"
	},
	"pt-BR": {
		"cap.deep": "Noite profunda",
		deep: "Noite profunda: mais um quebra-cabeça hoje à noite",
		"next.deepA": "Abrir a noite profunda de hoje",
		postcardDeep: "Cartão-postal: a noite profunda de hoje e o selo do Wick"
	},
	it: {
		"cap.deep": "Notte fonda",
		deep: "Notte fonda: un altro enigma stanotte",
		"next.deepA": "Apri la notte fonda di oggi",
		postcardDeep: "Cartolina: la notte fonda di oggi e il francobollo di Wick"
	},
	"zh-Hans": {
		"cap.deep": "深夜",
		deep: "深夜：今晚再来一题",
		"next.deepA": "打开今晚的深夜谜题",
		postcardDeep: "明信片：点亮的今晚深夜谜题和小烛的邮票"
	},
	"zh-Hant": {
		"cap.deep": "深夜",
		deep: "深夜：今晚再來一題",
		"next.deepA": "打開今晚的深夜謎題",
		postcardDeep: "明信片：點亮的今晚深夜謎題和小燭的郵票"
	}
};
for (let e of H) Object.assign(U[e], Qn[e]);
var $n = {
	en: {
		villageNew: "Village, something new",
		"res.bestA": "Streak {n}, best {best}"
	},
	ko: {
		villageNew: "마을, 새로운 것이 있어요",
		"res.bestA": "연속 기록 {n}, 최고 {best}"
	},
	ja: {
		villageNew: "村、新しいことがあります",
		"res.bestA": "連続記録 {n}、最高 {best}"
	},
	de: {
		villageNew: "Dorf, es gibt etwas Neues",
		"res.bestA": "Serie {n}, Bestwert {best}"
	},
	fr: {
		villageNew: "Village, il y a du nouveau",
		"res.bestA": "Série {n}, record {best}"
	},
	es: {
		villageNew: "Pueblo, hay algo nuevo",
		"res.bestA": "Racha {n}, mejor {best}"
	},
	"pt-BR": {
		villageNew: "Vila, há algo novo",
		"res.bestA": "Sequência {n}, melhor {best}"
	},
	it: {
		villageNew: "Borgo, c'è qualcosa di nuovo",
		"res.bestA": "Serie {n}, record {best}"
	},
	"zh-Hans": {
		villageNew: "小镇，有新东西",
		"res.bestA": "连续记录 {n}，最佳 {best}"
	},
	"zh-Hant": {
		villageNew: "小鎮，有新東西",
		"res.bestA": "連續紀錄 {n}，最佳 {best}"
	}
};
for (let e of H) Object.assign(U[e], $n[e]);
var er = {
	en: {
		"res.stickerA": "{name}: “{word}”",
		"res.timeA": "Time {t}",
		"res.streakA": "{n}-day streak",
		leaveArchive: "Back, leave this past puzzle",
		leaveDeep: "Back, leave the deep night",
		"done.nextA": "Next house",
		"tut.tryA": ", try here",
		"deep.first": "Deep night: one more, a bit harder. If you like.",
		"hint.why.stone": "Look at this {n}: it settles this tile.",
		"hint.why.onlyLight": "That dark tile can only be lit from here.",
		"hint.why.contradiction": "Anywhere else runs into trouble.",
		"cell.marked": ", marked: no lantern",
		"how.mark": "Long-press an empty tile to mark it with a dot (no lantern).",
		"res.archLine": "Yesterday's puzzle waits. Tap its dot.",
		"res.refundLine": "Your shield came back."
	},
	ko: {
		"res.stickerA": "{name}: “{word}”",
		"res.timeA": "시간 {t}",
		"res.streakA": "{n}일 연속",
		leaveArchive: "돌아가기, 지난 퍼즐 나가기",
		leaveDeep: "돌아가기, 깊은 밤 나가기",
		"done.nextA": "다음 집",
		"tut.tryA": ", 여기를 눌러 보세요",
		"deep.first": "깊은 밤: 조금 더 어려운 한 판. 하고 싶을 때만요.",
		"hint.why.stone": "숫자 {n} 덕분에 이 칸이 정해져요.",
		"hint.why.onlyLight": "저 어두운 칸은 여기서만 밝힐 수 있어요.",
		"hint.why.contradiction": "다른 자리에 놓으면 어디선가 막혀요.",
		"cell.marked": ", 표시함: 등불 없음",
		"how.mark": "빈 칸을 길게 누르면 점을 찍어 둘 수 있어요(등불 아님).",
		"res.archLine": "어제 퍼즐이 기다려요. 점을 눌러 보세요.",
		"res.refundLine": "지킴이가 돌아왔어요."
	},
	ja: {
		"res.stickerA": "{name}：「{word}」",
		"res.timeA": "タイム {t}",
		"res.streakA": "{n}日連続",
		leaveArchive: "戻る、前のパズルを出る",
		leaveDeep: "戻る、深い夜を出る",
		"done.nextA": "次の家へ",
		"tut.tryA": "、ここをタップしてみて",
		"deep.first": "深い夜：もう1問、少しむずかしめ。お好みで",
		"hint.why.stone": "この{n}を見てください。このマスが決まります。",
		"hint.why.onlyLight": "あの暗いマスは、ここからしか照らせません。",
		"hint.why.contradiction": "ほかの場所だと、どこかで行きづまります。",
		"cell.marked": "、しるし：ランタンなし",
		"how.mark": "空いたマスを長押しすると、点でしるしを付けられます（ランタンではありません）",
		"res.archLine": "昨日のパズルも解けます。点をタップしてね",
		"res.refundLine": "お守りがもどってきました"
	},
	de: {
		"res.stickerA": "{name}: „{word}“",
		"res.timeA": "Zeit {t}",
		"res.streakA": "Serie: {n}",
		leaveArchive: "Zurück, früheres Rätsel verlassen",
		leaveDeep: "Zurück, tiefe Nacht verlassen",
		"done.nextA": "Nächstes Haus",
		"tut.tryA": ", hier tippen",
		"deep.first": "Tiefe Nacht: eins mehr, schwerer. Wenn du magst.",
		"hint.why.stone": "Die {n} hier legt dieses Feld fest.",
		"hint.why.onlyLight": "Das dunkle Feld wird nur von hier hell.",
		"hint.why.contradiction": "Überall sonst geht es nicht auf.",
		"cell.marked": ", markiert: keine Laterne",
		"how.mark": "Leeres Feld lange drücken: Punkt setzen (keine Laterne).",
		"res.archLine": "Gestern ist noch offen: Tippe auf den Punkt.",
		"res.refundLine": "Dein Schutz ist zurück."
	},
	fr: {
		"res.stickerA": "{name}\xA0: «\xA0{word}\xA0»",
		"res.timeA": "Temps\xA0: {t}",
		"res.streakA": "Série\xA0: {n}",
		leaveArchive: "Retour, quitter cette énigme passée",
		leaveDeep: "Retour, quitter la nuit profonde",
		"done.nextA": "Maison suivante",
		"tut.tryA": ", touchez ici",
		"deep.first": "Nuit profonde\xA0: une de plus, plus corsée. Au choix.",
		"hint.why.stone": "Regardez ce {n}\xA0: il décide de cette case.",
		"hint.why.onlyLight": "Cette case sombre ne s'éclaire que d'ici.",
		"hint.why.contradiction": "Partout ailleurs, ça coince.",
		"cell.marked": ", marquée\xA0: pas de lanterne",
		"how.mark": "Appui long sur une case vide\xA0: un point (pas une lanterne).",
		"res.archLine": "L'énigme d'hier attend\xA0: touchez son point.",
		"res.refundLine": "Votre protection est revenue."
	},
	es: {
		"res.stickerA": "{name}: «{word}»",
		"res.timeA": "Tiempo {t}",
		"res.streakA": "Racha: {n}",
		leaveArchive: "Volver, salir del acertijo anterior",
		leaveDeep: "Volver, salir de la noche profunda",
		"done.nextA": "Siguiente casa",
		"tut.tryA": ", toca aquí",
		"deep.first": "Noche profunda: otro más, más difícil. Si quieres.",
		"hint.why.stone": "Mira este {n}: decide esta casilla.",
		"hint.why.onlyLight": "Esa casilla oscura solo se ilumina desde aquí.",
		"hint.why.contradiction": "En cualquier otro sitio, algo falla.",
		"cell.marked": ", marcada: sin farol",
		"how.mark": "Toca y mantén una casilla vacía: un punto (sin farol).",
		"res.archLine": "El acertijo de ayer espera: toca su punto.",
		"res.refundLine": "Tu escudo volvió."
	},
	"pt-BR": {
		"res.stickerA": "{name}: “{word}”",
		"res.timeA": "Tempo {t}",
		"res.streakA": "Sequência: {n}",
		leaveArchive: "Voltar, sair do quebra-cabeça anterior",
		leaveDeep: "Voltar, sair da noite profunda",
		"done.nextA": "Próxima casa",
		"tut.tryA": ", toque aqui",
		"deep.first": "Noite profunda: mais um, mais difícil. Se quiser.",
		"hint.why.stone": "Olhe este {n}: ele define este quadrado.",
		"hint.why.onlyLight": "Aquele quadrado escuro só se ilumina daqui.",
		"hint.why.contradiction": "Em qualquer outro lugar, algo trava.",
		"cell.marked": ", marcado: sem lanterna",
		"how.mark": "Toque e segure um quadrado vazio: um ponto (sem lanterna).",
		"res.archLine": "O de ontem ainda espera: toque no ponto.",
		"res.refundLine": "Seu escudo voltou."
	},
	it: {
		"res.stickerA": "{name}: «{word}»",
		"res.timeA": "Tempo {t}",
		"res.streakA": "Serie: {n}",
		leaveArchive: "Indietro, esci dall'enigma passato",
		leaveDeep: "Indietro, esci dalla notte fonda",
		"done.nextA": "Prossima casa",
		"tut.tryA": ", tocca qui",
		"deep.first": "Notte fonda: un altro, più difficile. Se ti va.",
		"hint.why.stone": "Guarda questo {n}: decide questa casella.",
		"hint.why.onlyLight": "Quella casella buia si illumina solo da qui.",
		"hint.why.contradiction": "In ogni altro punto, qualcosa non torna.",
		"cell.marked": ", segnata: niente lanterna",
		"how.mark": "Premi a lungo una casella vuota: un punto (niente lanterna).",
		"res.archLine": "L'enigma di ieri ti aspetta: tocca il punto.",
		"res.refundLine": "Il tuo scudo è tornato."
	},
	"zh-Hans": {
		"res.stickerA": "{name}：“{word}”",
		"res.timeA": "用时 {t}",
		"res.streakA": "连续 {n} 天",
		leaveArchive: "返回，离开往日谜题",
		leaveDeep: "返回，离开深夜谜题",
		"done.nextA": "下一间小屋",
		"tut.tryA": "，点这里试试",
		"deep.first": "深夜：再来一题，稍难一点。想玩再玩。",
		"hint.why.stone": "看这个 {n}：它决定了这一格。",
		"hint.why.onlyLight": "那个暗格只能从这里照亮。",
		"hint.why.contradiction": "放在别处，都会卡住。",
		"cell.marked": "，已标记：不放灯笼",
		"how.mark": "长按空格子，可以点上一个小点作记号（不是灯笼）。",
		"res.archLine": "昨天的谜题还在等你，点一下它的小点。",
		"res.refundLine": "护盾回来了。"
	},
	"zh-Hant": {
		"res.stickerA": "{name}：「{word}」",
		"res.timeA": "時間 {t}",
		"res.streakA": "連續 {n} 天",
		leaveArchive: "返回，離開往日謎題",
		leaveDeep: "返回，離開深夜謎題",
		"done.nextA": "下一間小屋",
		"tut.tryA": "，點這裡試試",
		"deep.first": "深夜：再來一題，稍難一點。想玩再玩。",
		"hint.why.stone": "看這個 {n}：它決定了這一格。",
		"hint.why.onlyLight": "那個暗格只能從這裡照亮。",
		"hint.why.contradiction": "放在別處，都會卡住。",
		"cell.marked": "，已標記：不放燈籠",
		"how.mark": "長按空格子，可以點上一個小點作記號（不是燈籠）。",
		"res.archLine": "昨天的謎題還在等你，點一下它的小點。",
		"res.refundLine": "護盾回來了。"
	}
};
for (let e of H) Object.assign(U[e], er[e]);
var tr = {
	en: {
		"err.stuckFar": "This {n} can't be finished from here.",
		"err.stuckFarCell": "This tile can't be lit from here.",
		"stuck.byA": "caused by the lantern at {pos}",
		"arch.lateNew": "{date}: puzzle #{n}, you can still light it",
		"res.archLine": "Play yesterday's puzzle",
		"res.archLineA": "Play yesterday's puzzle, {date}",
		"res.refundBoth": "Yesterday's lantern lit · shield is back",
		"res.orderA": "Lanterns, in order: {n}",
		"res.melodyHint": "Double-tap to hear your melody again",
		"stamp.deepA": "Deep night stamp",
		postcardPast: "Postcard: the house of {date}, lit, with Wick's stamp",
		"disc.pastA": "{date}: past puzzle",
		"disc.deepA": "Deep night, tonight's puzzle",
		"cap.dot": "Dot",
		dotOn: "Dot mode on",
		dotOff: "Dot mode off",
		"dot.first": "Tip: long-press a tile or use Dot to mark it.",
		"how.mark": "Long-press a tile (or use Dot) to mark it. Again to clear.",
		"ask.remindAt": "A gentle reminder tomorrow at {time}?",
		"next.bell": "Tomorrow's reminder · {time}",
		"sync.off": "Saved on this phone · iCloud off",
		"sync.offWhy": "Safe here. Turn on iCloud to move it to a new phone.",
		"err.conflict": "Lanterns can't shine on each other.",
		"tut.t4a": "A number counts lanterns right beside it.",
		"err.zero": "0 means no lanterns beside it.",
		"tut.t4b": "Up, down, left, right. Not corners.",
		"how.c4s": "Up, down, left, right. Not corners. 0 = none.",
		"hint.place": "A lantern must go here.",
		"hint.why.stone": "This {n} needs a lantern on every free side.",
		"hint.why.contradiction": "Anywhere else leads to a dead end.",
		"tut.t5wrong": "This tile is right next to the 0."
	},
	ko: {
		"err.stuckFar": "숫자 {n} 쪽은 지금 등불로는 끝낼 수 없어요.",
		"err.stuckFarCell": "지금 등불로는 이 칸을 밝힐 수 없어요.",
		"stuck.byA": "{pos} 등불 때문",
		"arch.lateNew": "{date}: 퍼즐 #{n}, 지금도 켤 수 있어요",
		"res.archLine": "어제 퍼즐도 풀어 보세요",
		"res.archLineA": "어제 퍼즐 풀기, {date}",
		"res.refundBoth": "어제 등불을 켰어요 · 지킴이가 돌아왔어요",
		"res.orderA": "등불 놓은 순서: {n}개",
		"res.melodyHint": "두 번 탭하면 멜로디를 다시 들어요",
		"stamp.deepA": "깊은 밤 우표",
		postcardPast: "엽서: 불 켜진 {date}의 집과 윅 우표",
		"disc.pastA": "{date}: 지난 퍼즐",
		"disc.deepA": "깊은 밤, 오늘 밤 퍼즐",
		"cap.dot": "점",
		dotOn: "점 모드 켬",
		dotOff: "점 모드 끔",
		"dot.first": "팁: 칸을 길게 누르거나 ‘점’을 켜면 표시할 수 있어요.",
		"how.mark": "칸을 길게 누르거나 ‘점’을 켜고 누르면 점을 찍어요. 다시 하면 지워져요.",
		"ask.remindAt": "내일 {time}에 조용히 알려 드릴까요?",
		"next.bell": "내일 알림 · {time}",
		"sync.off": "이 기기에 저장 · iCloud 꺼짐",
		"sync.offWhy": "기록은 이 기기에 안전하게 있어요. 새 폰으로 옮기려면 iCloud를 켜요.",
		"err.conflict": "등불끼리 서로 비추면 안 돼요.",
		"tut.t4a": "숫자는 바로 옆 등불 개수예요.",
		"err.zero": "0 옆에는 등불을 두지 않아요.",
		"tut.t4b": "위·아래·옆만 세요.",
		"how.c4s": "위·아래·옆만 세요. 0이면 없어요.",
		"hint.place": "여기에는 꼭 등불이 들어가요.",
		"hint.why.stone": "이 {n} 옆 빈칸에는 모두 등불이 들어가요.",
		"hint.why.contradiction": "다른 자리에 놓으면 어디선가 막혀요.",
		"tut.t5wrong": "이 칸은 0 바로 옆이에요.",
		"how.replay": "연습 다시 하기"
	},
	ja: {
		"err.stuckFar": "このままでは、この{n}はそろいません",
		"err.stuckFarCell": "このままでは、このマスは照らせません",
		"stuck.byA": "{pos}のランタンが原因",
		"arch.lateNew": "{date}：パズル #{n}、今からでも灯せます",
		"res.archLine": "昨日のパズルもどうぞ",
		"res.archLineA": "昨日のパズルをあそぶ、{date}",
		"res.refundBoth": "昨日のランタンがともり、お守りがもどりました",
		"res.orderA": "ランタンを置いた順：{n}個",
		"res.melodyHint": "ダブルタップでメロディをもう一度",
		"stamp.deepA": "深い夜の切手",
		postcardPast: "はがき：明かりのついた{date}の家とウィックの切手",
		"disc.pastA": "{date}：前のパズル",
		"disc.deepA": "深い夜、今夜のパズル",
		"cap.dot": "しるし",
		dotOn: "しるしモード オン",
		dotOff: "しるしモード オフ",
		"dot.first": "コツ：マスを長押しするか「しるし」をオンにすると、しるしを付けられます",
		"how.mark": "マスを長押しするか「しるし」をオンにしてタップすると、しるしが付きます。もう一度で消えます",
		"ask.remindAt": "明日 {time} に、そっとお知らせしますか？",
		"next.bell": "明日のお知らせ {time}",
		"sync.off": "保存先：この端末のみ（iCloud オフ）",
		"sync.offWhy": "記録はこの端末に残ります。新しい端末へ移すときはiCloudをオンにしてください",
		"err.conflict": "ランタンどうしが照らし合わないように",
		"tut.t4a": "数字は、となりのランタンの数",
		"err.zero": "0のとなりにはランタンを置きません",
		"tut.t4b": "上下左右だけ数えます",
		"how.c4s": "上下左右だけ数えます。0は「なし」",
		"hint.place": "ここには必ずランタンが入ります",
		"hint.why.stone": "この{n}を見ると、ここに入るとわかります",
		"hint.why.onlyLight": "あの暗いマスは、ここからしか照らせません",
		"hint.why.contradiction": "ほかの場所だと、どこかで行きづまります",
		"tut.t5wrong": "このマスは0のすぐとなりです",
		"tut.t3b": "あっ、ひとつ多すぎました。タップして外してみましょう",
		"deep.first": "深い夜：もう1問、少しむずかしめ。よかったら、どうぞ",
		"cap.restart": "このパズルを最初から",
		"how.c2s": "ランタンをもう一度タップすると外せます"
	},
	de: {
		"err.stuckFar": "Diese {n} lässt sich so nicht mehr erfüllen.",
		"err.stuckFarCell": "Dieses Feld wird so nicht mehr hell.",
		"stuck.byA": "wegen der Laterne bei {pos}",
		"arch.lateNew": "{date}: Rätsel #{n}, du kannst es noch erhellen",
		"res.archLine": "Das Rätsel von gestern spielen",
		"res.archLineA": "Rätsel von gestern spielen, {date}",
		"res.refundBoth": "Gestern leuchtet · dein Schutz ist zurück",
		"res.orderA": "So hast du die Laternen gesetzt: {n}",
		"res.melodyHint": "Doppeltippen, um die Melodie noch mal zu hören",
		"stamp.deepA": "Marke der tiefen Nacht",
		postcardPast: "Postkarte: das Haus vom {date}, beleuchtet, mit Wick-Marke",
		"disc.pastA": "{date}: früheres Rätsel",
		"disc.deepA": "Tiefe Nacht, das Rätsel von heute Nacht",
		"cap.dot": "Punkt",
		dotOn: "Punkt-Modus an",
		dotOff: "Punkt-Modus aus",
		"dot.first": "Markieren: Feld lange drücken oder „Punkt“ an.",
		"how.mark": "Feld lange drücken (oder „Punkt“): markieren. Nochmal: weg.",
		"ask.remindAt": "Morgen um {time} leise erinnern?",
		"next.bell": "Erinnerung morgen · {time}",
		"sync.off": "Auf diesem Gerät gespeichert · iCloud aus",
		"sync.offWhy": "Sicher gespeichert. Mit iCloud zieht es aufs neue Gerät um.",
		"err.conflict": "Zwei Laternen dürfen sich nicht sehen.",
		"tut.t4a": "Eine Zahl zählt die Laternen daneben.",
		"err.zero": "Neben einer 0 darf keine Laterne stehen.",
		"tut.t4b": "Nur oben, unten, links, rechts.",
		"how.c4s": "Nur oben, unten, links, rechts. 0 = keine.",
		"hint.place": "Hier muss eine Laterne hin.",
		"hint.why.stone": "Die {n} braucht jedes freie Feld daneben.",
		"hint.why.contradiction": "Überall sonst geht es nicht auf.",
		"tut.t5wrong": "Dieses Feld liegt direkt neben der 0.",
		"deep.first": "Noch ein Rätsel, etwas schwerer. Nur wenn du magst.",
		"res.order": "So hast du die Laternen gesetzt",
		"daily.intro": "Jeden Tag ein neues.",
		"daily.intro2": "Für alle dasselbe."
	},
	fr: {
		"err.stuckFar": "Ce {n} ne peut plus être complété ainsi.",
		"err.stuckFarCell": "Cette case ne peut plus être éclairée ainsi.",
		"stuck.byA": "à cause de la lanterne en {pos}",
		"arch.lateNew": "{date}\xA0: énigme n° {n}, encore possible de l'allumer",
		"res.archLine": "Jouer l'énigme d'hier",
		"res.archLineA": "Jouer l'énigme d'hier, {date}",
		"res.refundBoth": "Hier est allumé · votre protection est revenue",
		"res.orderA": "Lanternes, dans l'ordre\xA0: {n}",
		"res.melodyHint": "Touchez deux fois pour réécouter la mélodie",
		"stamp.deepA": "Timbre de la nuit profonde",
		postcardPast: "Carte postale\xA0: la maison du {date} et le timbre de Wick",
		"disc.pastA": "{date}\xA0: énigme passée",
		"disc.deepA": "Nuit profonde, l'énigme de ce soir",
		"cap.dot": "Point",
		dotOn: "Point, mode activé",
		dotOff: "Point, mode désactivé",
		"dot.first": "Astuce\xA0: appui long ou Point pour marquer.",
		"how.mark": "Appui long (ou Point)\xA0: un point. Encore une fois\xA0: effacé.",
		"ask.remindAt": "Un rappel discret demain à {time}\xA0?",
		"next.bell": "Rappel demain · {time}",
		"sync.off": "Enregistré sur cet appareil · iCloud désactivé",
		"sync.offWhy": "En sécurité ici. Activez iCloud pour changer d'appareil.",
		"err.conflict": "Deux lanternes ne doivent pas se voir.",
		"tut.t4a": "Un chiffre compte les lanternes voisines.",
		"err.zero": "Le 0\xA0: aucune lanterne à côté.",
		"tut.t4b": "Haut, bas, gauche, droite.",
		"how.c4s": "Haut, bas, gauche, droite. 0 = aucune.",
		"hint.place": "Une lanterne doit aller ici.",
		"hint.why.stone": "Ce {n} veut une lanterne sur chaque case libre.",
		"hint.why.contradiction": "Partout ailleurs, c'est l'impasse.",
		"tut.t5wrong": "Cette case touche le 0."
	},
	es: {
		"err.stuckFar": "Este {n} ya no se puede completar así.",
		"err.stuckFarCell": "Esta casilla ya no se puede iluminar así.",
		"stuck.byA": "por el farol en {pos}",
		"arch.lateNew": "{date}: acertijo #{n}, aún puedes encenderlo",
		"res.archLine": "Juega el acertijo de ayer",
		"res.archLineA": "Jugar el acertijo de ayer, {date}",
		"res.refundBoth": "El farol de ayer brilla · tu escudo volvió",
		"res.orderA": "Faroles, en orden: {n}",
		"res.melodyHint": "Toca dos veces para volver a oír la melodía",
		"stamp.deepA": "Sello de la noche profunda",
		postcardPast: "Postal: la casa del {date}, iluminada, con el sello de Wick",
		"disc.pastA": "{date}: acertijo anterior",
		"disc.deepA": "Noche profunda, el acertijo de esta noche",
		"cap.dot": "Punto",
		dotOn: "Punto, modo activado",
		dotOff: "Punto, modo desactivado",
		"dot.first": "Truco: mantén pulsado o usa Punto para marcar.",
		"how.mark": "Mantén pulsado (o usa Punto) para marcar. Otra vez: borrar.",
		"ask.remindAt": "¿Te avisamos mañana a las {time}?",
		"next.bell": "Aviso de mañana · {time}",
		"sync.off": "Guardado en este dispositivo · iCloud desactivado",
		"sync.offWhy": "Seguro aquí. Activa iCloud para pasarlo a otro dispositivo.",
		"err.conflict": "Un farol no puede iluminar a otro.",
		"tut.t4a": "Un número cuenta los faroles de al lado.",
		"err.zero": "El 0 quiere decir: ningún farol al lado.",
		"tut.t4b": "Solo arriba, abajo y a los lados.",
		"how.c4s": "Solo arriba, abajo y a los lados. 0 = ninguno.",
		"hint.place": "Aquí tiene que ir un farol.",
		"hint.why.stone": "Este {n} necesita un farol en cada lado libre.",
		"hint.why.contradiction": "En cualquier otro sitio, no hay salida.",
		"tut.t5wrong": "Esta casilla está justo al lado del 0."
	},
	"pt-BR": {
		"err.stuckFar": "Este {n} não pode mais ser completado assim.",
		"err.stuckFarCell": "Este quadrado não pode mais ser iluminado assim.",
		"stuck.byA": "por causa da lanterna em {pos}",
		"arch.lateNew": "{date}: quebra-cabeça #{n}, ainda dá para acender",
		"res.archLine": "Jogue o quebra-cabeça de ontem",
		"res.archLineA": "Jogar o quebra-cabeça de ontem, {date}",
		"res.refundBoth": "Ontem brilha · seu escudo voltou",
		"res.orderA": "Lanternas, em ordem: {n}",
		"res.melodyHint": "Toque duas vezes para ouvir a melodia de novo",
		"stamp.deepA": "Selo da noite profunda",
		postcardPast: "Cartão-postal: a casa de {date} e o selo do Wick",
		"disc.pastA": "{date}: quebra-cabeça anterior",
		"disc.deepA": "Noite profunda, o quebra-cabeça desta noite",
		"cap.dot": "Ponto",
		dotOn: "Ponto, modo ligado",
		dotOff: "Ponto, modo desligado",
		"dot.first": "Truque: segure ou use Ponto para marcar.",
		"how.mark": "Segure (ou use Ponto) para marcar. De novo para apagar.",
		"ask.remindAt": "Um lembrete leve amanhã às {time}?",
		"next.bell": "Lembrete amanhã · {time}",
		"sync.off": "Salvo neste aparelho · iCloud desligado",
		"sync.offWhy": "Seguro aqui. Ative o iCloud para levar a um novo aparelho.",
		"err.conflict": "Uma lanterna não pode iluminar outra.",
		"tut.t4a": "O número conta as lanternas ao lado.",
		"err.zero": "O 0 quer dizer: nenhuma lanterna ao lado.",
		"tut.t4b": "Só cima, baixo e lados.",
		"how.c4s": "Só cima, baixo e lados. 0 é nenhuma.",
		"hint.place": "Aqui precisa ir uma lanterna.",
		"hint.why.stone": "Este {n} precisa de lanterna em cada lado livre.",
		"hint.why.contradiction": "Em qualquer outro lugar, não tem saída.",
		"tut.t5wrong": "Este quadrado fica bem ao lado do 0."
	},
	it: {
		"err.stuckFar": "Questo {n} così non si può più completare.",
		"err.stuckFarCell": "Questa casella così non si può più illuminare.",
		"stuck.byA": "per colpa della lanterna in {pos}",
		"arch.lateNew": "{date}: enigma n. {n}, puoi ancora accenderlo",
		"res.archLine": "Gioca l'enigma di ieri",
		"res.archLineA": "Gioca l'enigma di ieri, {date}",
		"res.refundBoth": "Ieri brilla · il tuo scudo è tornato",
		"res.orderA": "Lanterne, in ordine: {n}",
		"res.melodyHint": "Tocca due volte per riascoltare la melodia",
		"stamp.deepA": "Francobollo della notte fonda",
		postcardPast: "Cartolina: la casa del {date} e il francobollo di Wick",
		"disc.pastA": "{date}: enigma passato",
		"disc.deepA": "Notte fonda, l'enigma di stanotte",
		"cap.dot": "Punto",
		dotOn: "Punto, modalità attiva",
		dotOff: "Punto, modalità disattivata",
		"dot.first": "Trucco: premi a lungo o usa Punto per segnare.",
		"how.mark": "Premi a lungo (o usa Punto) per segnare. Ancora: cancella.",
		"ask.remindAt": "Un piccolo promemoria domani alle {time}?",
		"next.bell": "Promemoria domani · {time}",
		"sync.off": "Salvato su questo dispositivo · iCloud disattivato",
		"sync.offWhy": "Al sicuro qui. Attiva iCloud per un nuovo dispositivo.",
		"err.conflict": "Le lanterne non si illuminano a vicenda.",
		"tut.t4a": "Un numero conta le lanterne accanto.",
		"err.zero": "Lo 0 vuol dire: niente lanterne accanto.",
		"tut.t4b": "Su, giù, sinistra, destra.",
		"how.c4s": "Su, giù, sinistra, destra. 0 = nessuna.",
		"hint.place": "Qui ci va per forza una lanterna.",
		"hint.why.stone": "Questo {n} vuole lanterne su ogni lato libero.",
		"hint.why.contradiction": "In ogni altro punto, è un vicolo cieco.",
		"tut.t5wrong": "Questa casella è proprio accanto allo 0."
	},
	"zh-Hans": {
		"err.stuckFar": "照现在这样，这个 {n} 凑不齐了。",
		"err.stuckFarCell": "照现在这样，这一格没法照亮了。",
		"stuck.byA": "因为 {pos} 的灯笼",
		"arch.lateNew": "{date}：谜题 #{n}，现在也还能点亮",
		"res.archLine": "也来玩玩昨天的谜题",
		"res.archLineA": "玩昨天的谜题，{date}",
		"res.refundBoth": "昨天的灯笼点亮了 · 护盾回来了",
		"res.orderA": "放灯笼的顺序：{n} 盏",
		"res.melodyHint": "点两下再听一次旋律",
		"stamp.deepA": "深夜邮票",
		postcardPast: "明信片：点亮的 {date} 小屋和小烛的邮票",
		"disc.pastA": "{date}：往日谜题",
		"disc.deepA": "深夜，今晚的谜题",
		"cap.dot": "记号",
		dotOn: "记号模式 开",
		dotOff: "记号模式 关",
		"dot.first": "小技巧：长按格子或打开“记号”，就能做标记。",
		"how.mark": "长按格子（或打开“记号”）可以点上小点作记号，再按一次就取消。",
		"ask.remindAt": "明天 {time} 轻轻提醒你一声吗？",
		"next.bell": "明天的提醒 · {time}",
		"sync.off": "保存在这台设备上 · iCloud 已关闭",
		"sync.offWhy": "进度安全地存在这里。打开 iCloud，就能搬到新手机上。",
		"err.conflict": "灯笼不能互相照到。",
		"tut.t4a": "数字表示旁边有几盏灯笼。",
		"err.zero": "0 的旁边不能放灯笼。",
		"tut.t4b": "只算上下左右。",
		"how.c4s": "只算上下左右。0 就是一盏都没有。",
		"hint.place": "这里一定要放灯笼。",
		"hint.why.stone": "这个 {n} 旁边每个空格都要放灯笼。",
		"hint.why.contradiction": "放在别处，都会走进死胡同。",
		"tut.t5wrong": "这一格就在 0 的旁边。"
	},
	"zh-Hant": {
		"err.stuckFar": "照現在這樣，這個 {n} 湊不齊了。",
		"err.stuckFarCell": "照現在這樣，這一格沒辦法照亮了。",
		"stuck.byA": "因為 {pos} 的燈籠",
		"arch.lateNew": "{date}：謎題 #{n}，現在也還能點亮",
		"res.archLine": "也來玩玩昨天的謎題",
		"res.archLineA": "玩昨天的謎題，{date}",
		"res.refundBoth": "昨天的燈籠點亮了 · 護盾回來了",
		"res.orderA": "放燈籠的順序：{n} 盞",
		"res.melodyHint": "點兩下再聽一次旋律",
		"stamp.deepA": "深夜郵票",
		postcardPast: "明信片：點亮的 {date} 小屋和小燭的郵票",
		"disc.pastA": "{date}：往日謎題",
		"disc.deepA": "深夜，今晚的謎題",
		"cap.dot": "記號",
		dotOn: "記號模式 開",
		dotOff: "記號模式 關",
		"dot.first": "小技巧：長按格子或打開「記號」，就能做標記。",
		"how.mark": "長按格子（或打開「記號」）可以點上小點作記號，再按一次就取消。",
		"ask.remindAt": "明天 {time} 輕輕提醒你一聲嗎？",
		"next.bell": "明日的提醒 · {time}",
		"sync.off": "儲存在這部裝置上 · iCloud 已關閉",
		"sync.offWhy": "進度安全地存在這裡。打開 iCloud，就能搬到新手機上。",
		"err.conflict": "燈籠不能互相照到。",
		"tut.t4a": "數字代表旁邊有幾盞燈籠。",
		"err.zero": "0 的旁邊不能放燈籠。",
		"tut.t4b": "只數上下左右。",
		"how.c4s": "只數上下左右。0 代表一盞都沒有。",
		"hint.place": "這裡一定要放燈籠。",
		"hint.why.stone": "這個 {n} 旁邊每個空格都要放燈籠。",
		"hint.why.contradiction": "放在別處，都會走進死胡同。",
		"tut.t5wrong": "這一格就在 0 的旁邊。"
	}
}, nr = {
	en: {
		"cap.dot": "Mark",
		"cap.dotOn": "Marking",
		dotOn: "Marking, on",
		dotOff: "Mark, off",
		"dot.first": "Tip: turn on Mark, then tap a tile to dot it.",
		"how.mark": "Long-press a tile (or use Mark) to dot it. Again to clear.",
		"arch.lateCovered": "{date}, yesterday: a shield kept it. Light it to get it back",
		"stuck.take": "Try taking back the flickering lantern first.",
		"cozy.rewardA": "New in your cottage's cozy panel: {name}",
		"res.refundBoth": "Yesterday is lit · your shield is back"
	},
	ko: {
		"cap.dot": "표시",
		"cap.dotOn": "표시 중",
		dotOn: "표시 중, 켬",
		dotOff: "표시, 끔",
		numbersDots: "숫자 대신 주사위 눈",
		"dot.first": "팁: ‘표시’를 켜고 칸을 누르면 점만 찍혀요.",
		"how.mark": "칸을 길게 누르거나 ‘표시’를 켜고 누르면 점을 찍어요. 다시 하면 지워져요.",
		"arch.lateCovered": "{date}, 어제 퍼즐: 지킴이가 지켜 준 날이에요. 켜면 지킴이가 돌아와요",
		"err.stuckFar": "지금 등불로는 이 숫자를 채울 수 없어요.",
		"stuck.take": "빛이 흔들리는 등불부터 빼 보세요.",
		"cozy.rewardA": "오두막 아늑함에 새 등불: {name}"
	},
	ja: {
		"cap.dot": "しるし",
		"cap.dotOn": "しるし中",
		dotOn: "しるし中、オン",
		dotOff: "しるし、オフ",
		"dot.first": "コツ：「しるし」をオンにしてマスをタップすると、点だけが付きます",
		"how.mark": "マスを長押しするか「しるし」をオンにしてタップすると、点が付きます。もう一度で消えます",
		"arch.lateCovered": "{date}、昨日のパズル：お守りが守った日です。ともすと、お守りがもどります",
		"err.stuckFar": "このままだと、この{n}を満たせません",
		"stuck.take": "ゆれているランタンから外してみましょう",
		"cozy.rewardA": "おうちのくつろぎに新しいランタン：{name}",
		"deep.first": "深い夜：少しむずかしいもう1問、よかったらどうぞ",
		"hint.why.stone": "この{n}を見るとわかります"
	},
	de: {
		"cap.dot": "Markieren",
		"cap.dotOn": "Markieren an",
		dotOn: "Markieren an",
		dotOff: "Markieren aus",
		"dot.first": "Tipp: Mit „Markieren“ setzt ein Tippen nur einen Punkt.",
		"how.mark": "Lange drücken (oder „Markieren“): Punkt. Nochmal: weg.",
		"arch.lateCovered": "{date}, gestern: vom Schutz bewahrt. Lösen bringt ihn zurück",
		"stuck.take": "Nimm zuerst die flackernde Laterne weg.",
		"cozy.rewardA": "In deiner Hütte wartet eine neue Laterne: {name}"
	},
	fr: {
		"cap.dot": "Marquer",
		"cap.dotOn": "Marquer activé",
		dotOn: "Marquer activé",
		dotOff: "Marquer désactivé",
		"dot.first": "Astuce\xA0: avec Marquer, un toucher pose un point.",
		"how.mark": "Appui long (ou Marquer)\xA0: un point. Encore\xA0: effacé.",
		"arch.lateCovered": "{date}, hier\xA0: protégé. Allumez-le, la protection revient",
		"stuck.take": "Retirez d'abord la lanterne qui vacille.",
		"cozy.rewardA": "Nouvelle lanterne dans votre chaumière\xA0: {name}"
	},
	es: {
		"cap.dot": "Marcar",
		"cap.dotOn": "Marcar activo",
		dotOn: "Marcar activo",
		dotOff: "Marcar desactivado",
		"dot.first": "Truco: con Marcar, un toque pone un punto.",
		"how.mark": "Mantén pulsado (o usa Marcar): un punto. Otra vez: borrar.",
		"arch.lateCovered": "{date}, ayer: lo cuidó un escudo. Enciéndelo y vuelve",
		"stuck.take": "Quita primero el farol que parpadea.",
		"cozy.rewardA": "Farol nuevo en tu cabaña: {name}"
	},
	"pt-BR": {
		"cap.dot": "Marcar",
		"cap.dotOn": "Marcar ativo",
		dotOn: "Marcar ativo",
		dotOff: "Marcar desligado",
		"dot.first": "Dica: com Marcar, um toque põe um ponto.",
		"how.mark": "Segure (ou use Marcar) para pôr um ponto. De novo: apagar.",
		"arch.lateCovered": "{date}, ontem: guardado por um escudo. Acenda e ele volta",
		"stuck.take": "Tire primeiro a lanterna que tremula.",
		"cozy.rewardA": "Lanterna nova na sua cabana: {name}"
	},
	it: {
		"cap.dot": "Segna",
		"cap.dotOn": "Segna attivo",
		dotOn: "Segna attivo",
		dotOff: "Segna disattivato",
		"dot.first": "Trucco: con Segna, un tocco mette un punto.",
		"how.mark": "Premi a lungo (o usa Segna): un punto. Ancora: cancella.",
		"arch.lateCovered": "{date}, ieri: protetto da uno scudo. Accendilo e torna",
		"stuck.take": "Togli prima la lanterna che tremola.",
		"cozy.rewardA": "Nuova lanterna nella tua casetta: {name}"
	},
	"zh-Hans": {
		"cap.dotOn": "记号中",
		dotOn: "记号中，已开启",
		dotOff: "记号，已关闭",
		"arch.lateCovered": "{date}，昨天的谜题：护盾守住了这一天。点亮它，护盾就会回来",
		"stuck.take": "先把闪烁的灯笼拿掉试试。",
		"cozy.rewardA": "小屋的温馨里有新灯笼：{name}"
	},
	"zh-Hant": {
		"cap.dotOn": "記號中",
		dotOn: "記號中，已開啟",
		dotOff: "記號，已關閉",
		"arch.lateCovered": "{date}，昨天的謎題：護盾守住了這一天。點亮它，護盾就會回來",
		"stuck.take": "先把閃爍的燈籠拿掉試試。",
		"cozy.rewardA": "小屋的溫馨裡有新燈籠：{name}"
	}
}, rr = {
	en: {
		"plus.title": "Lamplighter",
		"plus.get1": "Play without ads",
		"plus.get2": "Three lantern glows (the usual one stays)",
		"plus.get3": "Two app icons",
		"plus.get4": "A gold postcard frame (off until you pick it)",
		"plus.get5": "One thank-you letter from Wick",
		"plus.free": "Daily, archive, story and accessibility stay free",
		"plus.buy": "Buy · {price}",
		"plus.restore": "Restore purchase",
		"plus.once": "One-time purchase, not a subscription.",
		"plus.loading": "Loading…",
		"plus.unavailable": "The App Store can't be reached right now.",
		"plus.buying": "Opening the App Store…",
		"plus.pending": "Waiting for a parent's approval",
		"plus.failed": "The purchase didn't go through. Nothing changed.",
		"plus.none": "There's no purchase to restore.",
		"plus.thanks": "Thank you",
		"plus.owned": "You're a Lamplighter. Thank you for being here.",
		"plus.family": "Shared with you through Family Sharing.",
		"plus.glow": "Lantern glow",
		"glow.warm": "Usual",
		"glow.amber": "Amber",
		"glow.moon": "Moonlight",
		"glow.firefly": "Firefly",
		"plus.icon": "App icon",
		"icon.default": "Usual",
		"icon.night": "Night Wick",
		"icon.paper": "Paper Wick",
		"plus.frame": "Postcard frame",
		"frame.on": "Gold",
		"frame.off": "None",
		"plus.breakLine": "Without ads · Lamplighter",
		"plus.glowA": "Lantern glow: {name}",
		"plus.iconA": "App icon: {name}",
		"plus.frameA": "Postcard frame: {name}"
	},
	ko: {
		"plus.title": "등불지기",
		"plus.get1": "광고 없이 플레이",
		"plus.get2": "등불 빛깔 3가지 (기본 빛깔은 그대로)",
		"plus.get3": "앱 아이콘 2가지",
		"plus.get4": "엽서 금박 테두리 (기본은 꺼짐)",
		"plus.get5": "윅의 감사 편지 한 통",
		"plus.free": "데일리·아카이브·이야기·접근성은 모두 무료예요",
		"plus.buy": "구매 · {price}",
		"plus.restore": "구매 복원",
		"plus.once": "한 번 결제예요. 구독이 아니에요.",
		"plus.loading": "불러오는 중…",
		"plus.unavailable": "지금은 App Store에 연결할 수 없어요.",
		"plus.buying": "App Store를 여는 중…",
		"plus.pending": "보호자의 승인을 기다리고 있어요",
		"plus.failed": "결제가 끝나지 않았어요. 달라진 건 없어요.",
		"plus.none": "복원할 구매가 없어요.",
		"plus.thanks": "고마워요",
		"plus.owned": "등불지기예요. 함께해 줘서 고마워요.",
		"plus.family": "가족 공유로 함께하고 있어요.",
		"plus.glow": "등불 빛깔",
		"glow.warm": "기본",
		"glow.amber": "호박",
		"glow.moon": "달빛",
		"glow.firefly": "반딧불",
		"plus.icon": "앱 아이콘",
		"icon.default": "기본",
		"icon.night": "밤의 윅",
		"icon.paper": "종이 윅",
		"plus.frame": "엽서 테두리",
		"frame.on": "금박",
		"frame.off": "없음",
		"plus.breakLine": "광고 없이 · 등불지기",
		"plus.glowA": "등불 빛깔: {name}",
		"plus.iconA": "앱 아이콘: {name}",
		"plus.frameA": "엽서 테두리: {name}"
	},
	ja: {
		"plus.title": "灯り守",
		"plus.get1": "広告なしで遊べます",
		"plus.get2": "ランタンの灯り色3種（いつもの色もそのまま）",
		"plus.get3": "アプリアイコン2種",
		"plus.get4": "はがきの金の縁取り（最初はオフ）",
		"plus.get5": "ウィックからのお礼の手紙",
		"plus.free": "デイリー・アーカイブ・物語・アクセシビリティはずっと無料",
		"plus.buy": "購入 · {price}",
		"plus.restore": "購入を復元",
		"plus.once": "1回だけの購入です。サブスクではありません。",
		"plus.loading": "読み込み中…",
		"plus.unavailable": "いまはApp Storeにつながりません。",
		"plus.buying": "App Storeを開いています…",
		"plus.pending": "保護者の承認を待っています",
		"plus.failed": "購入は完了しませんでした。何も変わっていません。",
		"plus.none": "復元できる購入はありません。",
		"plus.thanks": "ありがとう",
		"plus.owned": "灯り守になりました。いてくれてありがとう。",
		"plus.family": "ファミリー共有で使えています。",
		"plus.glow": "灯りの色",
		"glow.warm": "いつもの",
		"glow.amber": "琥珀",
		"glow.moon": "月あかり",
		"glow.firefly": "ほたる",
		"plus.icon": "アプリアイコン",
		"icon.default": "いつもの",
		"icon.night": "夜のウィック",
		"icon.paper": "紙のウィック",
		"plus.frame": "はがきの縁",
		"frame.on": "金",
		"frame.off": "なし",
		"plus.breakLine": "広告なしで · 灯り守",
		"plus.glowA": "灯りの色：{name}",
		"plus.iconA": "アプリアイコン：{name}",
		"plus.frameA": "はがきの縁：{name}"
	},
	de: {
		"plus.title": "Laternenanzünder",
		"plus.get1": "Spielen ohne Werbung",
		"plus.get2": "Drei Laternenfarben (die gewohnte bleibt)",
		"plus.get3": "Zwei App-Symbole",
		"plus.get4": "Goldrahmen für Postkarten (aus, bis du ihn wählst)",
		"plus.get5": "Ein Dankesbrief von Wick",
		"plus.free": "Tagesrätsel, Archiv, Geschichte, Bedienhilfen: gratis",
		"plus.buy": "Kaufen · {price}",
		"plus.restore": "Kauf wiederherstellen",
		"plus.once": "Einmalkauf, kein Abo.",
		"plus.loading": "Wird geladen …",
		"plus.unavailable": "Der App Store ist gerade nicht erreichbar.",
		"plus.buying": "App Store wird geöffnet …",
		"plus.pending": "Wartet auf die Zustimmung der Eltern",
		"plus.failed": "Der Kauf kam nicht zustande. Nichts hat sich geändert.",
		"plus.none": "Kein Kauf zum Wiederherstellen.",
		"plus.thanks": "Danke",
		"plus.owned": "Du bist Laternenanzünder. Danke, dass du da bist.",
		"plus.family": "Über die Familienfreigabe mit dir geteilt.",
		"plus.glow": "Laternenfarbe",
		"glow.warm": "Gewohnt",
		"glow.amber": "Bernstein",
		"glow.moon": "Mondlicht",
		"glow.firefly": "Glühwürmchen",
		"plus.icon": "App-Symbol",
		"icon.default": "Gewohnt",
		"icon.night": "Nacht-Wick",
		"icon.paper": "Papier-Wick",
		"plus.frame": "Postkartenrahmen",
		"frame.on": "Gold",
		"frame.off": "Keiner",
		"plus.breakLine": "Ohne Werbung · Laternenanzünder",
		"plus.glowA": "Laternenfarbe: {name}",
		"plus.iconA": "App-Symbol: {name}",
		"plus.frameA": "Postkartenrahmen: {name}"
	},
	fr: {
		"plus.title": "Allumeur de lanternes",
		"plus.get1": "Jouer sans publicité",
		"plus.get2": "Trois lueurs de lanterne (l’habituelle reste)",
		"plus.get3": "Deux icônes d’app",
		"plus.get4": "Un cadre doré pour la carte (désactivé au départ)",
		"plus.get5": "Une lettre de remerciement de Wick",
		"plus.free": "Défi du jour, archives, histoire, accessibilité : gratuit",
		"plus.buy": "Acheter · {price}",
		"plus.restore": "Restaurer l’achat",
		"plus.once": "Achat unique, pas un abonnement.",
		"plus.loading": "Chargement…",
		"plus.unavailable": "L’App Store est injoignable pour le moment.",
		"plus.buying": "Ouverture de l’App Store…",
		"plus.pending": "En attente de l’accord d’un parent",
		"plus.failed": "L’achat n’a pas abouti. Rien n’a changé.",
		"plus.none": "Aucun achat à restaurer.",
		"plus.thanks": "Merci",
		"plus.owned": "Vous êtes Allumeur de lanternes. Merci d’être là.",
		"plus.family": "Partagé avec vous via le partage familial.",
		"plus.glow": "Lueur des lanternes",
		"glow.warm": "Habituelle",
		"glow.amber": "Ambre",
		"glow.moon": "Clair de lune",
		"glow.firefly": "Luciole",
		"plus.icon": "Icône de l’app",
		"icon.default": "Habituelle",
		"icon.night": "Wick de nuit",
		"icon.paper": "Wick en papier",
		"plus.frame": "Cadre de carte",
		"frame.on": "Doré",
		"frame.off": "Aucun",
		"plus.breakLine": "Sans publicité · Allumeur de lanternes",
		"plus.glowA": "Lueur : {name}",
		"plus.iconA": "Icône : {name}",
		"plus.frameA": "Cadre : {name}"
	},
	es: {
		"plus.title": "Farolero",
		"plus.get1": "Juega sin anuncios",
		"plus.get2": "Tres brillos de farol (el de siempre se queda)",
		"plus.get3": "Dos iconos de app",
		"plus.get4": "Un marco dorado para la postal (apagado al inicio)",
		"plus.get5": "Una carta de agradecimiento de Wick",
		"plus.free": "Diario, archivo, historia y accesibilidad siguen gratis",
		"plus.buy": "Comprar · {price}",
		"plus.restore": "Restaurar compra",
		"plus.once": "Pago único, no es una suscripción.",
		"plus.loading": "Cargando…",
		"plus.unavailable": "Ahora no se puede conectar con el App Store.",
		"plus.buying": "Abriendo el App Store…",
		"plus.pending": "Esperando la aprobación de un adulto",
		"plus.failed": "La compra no se completó. Nada ha cambiado.",
		"plus.none": "No hay compras que restaurar.",
		"plus.thanks": "Gracias",
		"plus.owned": "Eres Farolero. Gracias por estar aquí.",
		"plus.family": "Compartido contigo con En familia.",
		"plus.glow": "Brillo del farol",
		"glow.warm": "De siempre",
		"glow.amber": "Ámbar",
		"glow.moon": "Luz de luna",
		"glow.firefly": "Luciérnaga",
		"plus.icon": "Icono de la app",
		"icon.default": "De siempre",
		"icon.night": "Wick nocturno",
		"icon.paper": "Wick de papel",
		"plus.frame": "Marco de postal",
		"frame.on": "Dorado",
		"frame.off": "Ninguno",
		"plus.breakLine": "Sin anuncios · Farolero",
		"plus.glowA": "Brillo: {name}",
		"plus.iconA": "Icono: {name}",
		"plus.frameA": "Marco: {name}"
	},
	"pt-BR": {
		"plus.title": "Acendedor de lanternas",
		"plus.get1": "Jogue sem anúncios",
		"plus.get2": "Três brilhos de lanterna (o de sempre fica)",
		"plus.get3": "Dois ícones de app",
		"plus.get4": "Moldura dourada no cartão (desligada no início)",
		"plus.get5": "Uma carta de agradecimento do Wick",
		"plus.free": "Diário, arquivo, história e acessibilidade seguem grátis",
		"plus.buy": "Comprar · {price}",
		"plus.restore": "Restaurar compra",
		"plus.once": "Compra única, não é assinatura.",
		"plus.loading": "Carregando…",
		"plus.unavailable": "Não dá para acessar a App Store agora.",
		"plus.buying": "Abrindo a App Store…",
		"plus.pending": "Aguardando a aprovação de um responsável",
		"plus.failed": "A compra não foi concluída. Nada mudou.",
		"plus.none": "Não há compra para restaurar.",
		"plus.thanks": "Obrigado",
		"plus.owned": "Você é Acendedor de lanternas. Obrigado por estar aqui.",
		"plus.family": "Compartilhado com você pelo Compartilhamento Familiar.",
		"plus.glow": "Brilho da lanterna",
		"glow.warm": "De sempre",
		"glow.amber": "Âmbar",
		"glow.moon": "Luar",
		"glow.firefly": "Vaga-lume",
		"plus.icon": "Ícone do app",
		"icon.default": "De sempre",
		"icon.night": "Wick noturno",
		"icon.paper": "Wick de papel",
		"plus.frame": "Moldura do cartão",
		"frame.on": "Dourada",
		"frame.off": "Nenhuma",
		"plus.breakLine": "Sem anúncios · Acendedor de lanternas",
		"plus.glowA": "Brilho: {name}",
		"plus.iconA": "Ícone: {name}",
		"plus.frameA": "Moldura: {name}"
	},
	it: {
		"plus.title": "Lampionaio",
		"plus.get1": "Gioca senza pubblicità",
		"plus.get2": "Tre luci per le lanterne (quella solita resta)",
		"plus.get3": "Due icone dell’app",
		"plus.get4": "Cornice dorata per la cartolina (spenta all’inizio)",
		"plus.get5": "Una lettera di ringraziamento di Wick",
		"plus.free": "Sfida del giorno, archivio, storia e accessibilità: gratis",
		"plus.buy": "Acquista · {price}",
		"plus.restore": "Ripristina acquisto",
		"plus.once": "Acquisto unico, non un abbonamento.",
		"plus.loading": "Caricamento…",
		"plus.unavailable": "Al momento l’App Store non è raggiungibile.",
		"plus.buying": "Apertura dell’App Store…",
		"plus.pending": "In attesa dell’approvazione di un genitore",
		"plus.failed": "L’acquisto non è riuscito. Non è cambiato nulla.",
		"plus.none": "Nessun acquisto da ripristinare.",
		"plus.thanks": "Grazie",
		"plus.owned": "Sei un Lampionaio. Grazie di essere qui.",
		"plus.family": "Condiviso con te tramite In famiglia.",
		"plus.glow": "Luce delle lanterne",
		"glow.warm": "Solita",
		"glow.amber": "Ambra",
		"glow.moon": "Chiaro di luna",
		"glow.firefly": "Lucciola",
		"plus.icon": "Icona dell’app",
		"icon.default": "Solita",
		"icon.night": "Wick notturno",
		"icon.paper": "Wick di carta",
		"plus.frame": "Cornice cartolina",
		"frame.on": "Oro",
		"frame.off": "Nessuna",
		"plus.breakLine": "Senza pubblicità · Lampionaio",
		"plus.glowA": "Luce: {name}",
		"plus.iconA": "Icona: {name}",
		"plus.frameA": "Cornice: {name}"
	},
	"zh-Hans": {
		"plus.title": "守灯人",
		"plus.get1": "无广告游玩",
		"plus.get2": "三种灯笼光色（原来的光色保留）",
		"plus.get3": "两款应用图标",
		"plus.get4": "明信片金边（默认关闭）",
		"plus.get5": "小烛的一封感谢信",
		"plus.free": "每日谜题、存档、故事和辅助功能都免费",
		"plus.buy": "购买 · {price}",
		"plus.restore": "恢复购买",
		"plus.once": "一次性购买，不是订阅。",
		"plus.loading": "正在载入…",
		"plus.unavailable": "现在连不上 App Store。",
		"plus.buying": "正在打开 App Store…",
		"plus.pending": "正在等待家长批准",
		"plus.failed": "购买没有完成，一切照旧。",
		"plus.none": "没有可恢复的购买。",
		"plus.thanks": "谢谢你",
		"plus.owned": "你是守灯人了。谢谢你在这里。",
		"plus.family": "通过家人共享与你共享。",
		"plus.glow": "灯笼光色",
		"glow.warm": "原色",
		"glow.amber": "琥珀",
		"glow.moon": "月光",
		"glow.firefly": "萤火",
		"plus.icon": "应用图标",
		"icon.default": "原样",
		"icon.night": "夜晚的小烛",
		"icon.paper": "纸做的小烛",
		"plus.frame": "明信片边框",
		"frame.on": "金边",
		"frame.off": "无",
		"plus.breakLine": "无广告 · 守灯人",
		"plus.glowA": "灯笼光色：{name}",
		"plus.iconA": "应用图标：{name}",
		"plus.frameA": "明信片边框：{name}"
	},
	"zh-Hant": {
		"plus.title": "守燈人",
		"plus.get1": "無廣告遊玩",
		"plus.get2": "三種燈籠光色（原本的光色保留）",
		"plus.get3": "兩款 App 圖示",
		"plus.get4": "明信片金邊（預設關閉）",
		"plus.get5": "小燭的一封感謝信",
		"plus.free": "每日謎題、存檔、故事和輔助使用都免費",
		"plus.buy": "購買 · {price}",
		"plus.restore": "回復購買",
		"plus.once": "一次性購買，不是訂閱。",
		"plus.loading": "正在載入…",
		"plus.unavailable": "現在連不上 App Store。",
		"plus.buying": "正在打開 App Store…",
		"plus.pending": "正在等待家長核准",
		"plus.failed": "購買沒有完成，一切照舊。",
		"plus.none": "沒有可回復的購買。",
		"plus.thanks": "謝謝你",
		"plus.owned": "你是守燈人了。謝謝你在這裡。",
		"plus.family": "透過家人共享與你共享。",
		"plus.glow": "燈籠光色",
		"glow.warm": "原本",
		"glow.amber": "琥珀色",
		"glow.moon": "月色",
		"glow.firefly": "螢火",
		"plus.icon": "App 圖示",
		"icon.default": "原樣",
		"icon.night": "夜晚的小燭",
		"icon.paper": "紙做的小燭",
		"plus.frame": "明信片邊框",
		"frame.on": "金邊",
		"frame.off": "無",
		"plus.breakLine": "無廣告 · 守燈人",
		"plus.glowA": "燈籠光色：{name}",
		"plus.iconA": "App 圖示：{name}",
		"plus.frameA": "明信片邊框：{name}"
	}
}, ir = {
	see: [
		"err.conflict",
		"tut.t3a",
		"how.c3"
	],
	num: ["tut.t4a", "how.c4"],
	zero: ["err.zero", "tut.t5a"]
};
for (let e of H) {
	let t = U[e];
	Object.assign(t, tr[e], nr[e], rr[e]);
	for (let e of Object.values(ir)) for (let n of e.slice(1)) t[n] = t[e[0]];
	t["res.rankCap"] = t["cap.rank"], t["next.bellA"] = t["next.bell"];
}
var ar = U;
function or(e) {
	if (!e) return null;
	let t = e.trim().replace(/_/g, "-").toLowerCase().split("-").filter(Boolean), n = t[0];
	if (!n) return null;
	if (n === "zh" || n === "cmn" || n === "yue") {
		let e = t.slice(1);
		return e.includes("hant") ? "zh-Hant" : e.includes("hans") ? "zh-Hans" : e.some((e) => e === "tw" || e === "hk" || e === "mo") || n === "yue" ? "zh-Hant" : "zh-Hans";
	}
	return n === "pt" ? "pt-BR" : H.find((e) => e === n) ?? null;
}
function sr(e) {
	for (let t of e) {
		let e = or(t);
		if (e) return e;
	}
	return "en";
}
function cr(e) {
	return e === "ja" ? "、" : e === "zh-Hans" || e === "zh-Hant" ? "，" : ", ";
}
var lr = (e) => {
	let t = (e.codePointAt(0) ?? 0) - 44032;
	return t < 0 || t > 11171 ? "이(가)" : t % 28 ? "이" : "가";
};
function ur(e, t, n) {
	let r = ar[e][t] ?? An[t] ?? t;
	return n ? r.replace(/\{(\w+)\}/g, (e, t) => t in n ? String(n[t]) : e).replace(/(.)\{이가\}/gu, (e, t) => t + lr(t)) : r;
}
//#endregion
//#region src/render/palette.ts
var W = {
	skyNight: "#141A33",
	skyDusk: "#2B2350",
	skyHorizon: "#C97B84",
	skyGlow: "#E8A08A",
	moon: "#F4EBD0",
	hillFar: "#5B4470",
	hillMid: "#3A2D58",
	hillNear: "#231F40",
	ground: "#171A31",
	groundDeep: "#0F1124",
	wall: "#2A2240",
	wallRim: "#D88BA6",
	roof: "#1B1630",
	windowDark: "#3B3560",
	windowFrame: "#140F24",
	windowLit: "#FFC864",
	windowLitCore: "#FFF4D6",
	grout: "#11142A",
	rim: "#2E3354",
	rimHi: "#424A72",
	floor: "#232946",
	floorHi: "#2B3254",
	floorLo: "#1E2340",
	stoneHi: "#8C92B0",
	stone: "#646A88",
	stoneLo: "#3A3F55",
	paleHi: "#E2E5F0",
	pale: "#B4BAD2",
	paleLo: "#737A9A",
	pipInk: "#151829",
	moss: "#5E7A5A",
	mossHi: "#86A57A",
	litCore: "#F2C46D",
	litEdge: "#B9814A",
	flame: "#FFC864",
	wick: "#FFF4D6",
	conflict: "#8FB7D9",
	coral: "#F2907A",
	coralHi: "#FFC2B0",
	coralDeep: "#B4503C",
	coralInk: "#3A120A",
	plum: "#D88BA6",
	sage: "#9DBF9E",
	koi: "#F08A5D",
	wood: "#4A3328",
	woodHi: "#6E4C38",
	basket: "#7A5538",
	basketHi: "#A57850",
	basketLo: "#4E3423"
}, dr = {
	ink: "#3B2C45",
	inkSoft: "#6A5A76",
	paper: "#FFF3DE",
	paperEdge: "#E8D4B8",
	primary: "#FFC864",
	primaryLip: "#D9983F",
	caption: "#F4EBD0",
	okRing: "#FFC864",
	okRingEdge: "#8A5A1C"
};
function fr(e) {
	return parseInt(e.slice(1), 16);
}
function G(e, t) {
	let n = fr(e);
	return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${t})`;
}
//#endregion
//#region src/render/rng.ts
function pr(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t = Math.imul(t ^ e.charCodeAt(n), 16777619);
	return t >>> 0;
}
function K(e) {
	let t = e >>> 0;
	return () => {
		t = t + 1831565813 >>> 0;
		let e = t;
		return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
//#endregion
//#region src/render/vis.ts
var mr = (e) => {
	try {
		return window.matchMedia(e);
	} catch {
		return null;
	}
};
function hr() {
	try {
		let e = document.createElement("div");
		e.style.cssText = "position:fixed;left:-99px;top:0;visibility:hidden;font:-apple-system-body", document.body.appendChild(e);
		let t = parseFloat(getComputedStyle(e).fontSize) || 17;
		return e.remove(), Math.max(1, Math.min(3.2, t / 17));
	} catch {
		return 1;
	}
}
var gr = mr("(prefers-reduced-motion: reduce)"), _r = mr("(prefers-contrast: more)"), vr = !1, q = {
	fontScale: typeof document < "u" && document.body ? hr() : 1,
	boldText: !1,
	increaseContrast: _r?.matches ?? !1,
	reduceMotion: gr?.matches ?? !1,
	voiceOver: !1
}, yr = /* @__PURE__ */ new Set();
function br(e) {
	let t = {
		...q,
		...e
	};
	if (t.fontScale === q.fontScale && t.boldText === q.boldText && t.increaseContrast === q.increaseContrast && t.reduceMotion === q.reduceMotion && t.voiceOver === q.voiceOver) return;
	let n = q;
	q = t;
	for (let e of yr) try {
		e(q, n);
	} catch (e) {
		console.warn("[vis] listener", e);
	}
}
gr?.addEventListener("change", (e) => {
	vr || br({ reduceMotion: e.matches });
}), _r?.addEventListener("change", (e) => {
	vr || br({ increaseContrast: e.matches });
});
var xr = {
	get p() {
		return q;
	},
	get sig() {
		return `${q.boldText ? "B" : ""}${q.increaseContrast ? "C" : ""}`;
	},
	get weight() {
		return q.boldText ? "800" : "700";
	},
	onChange(e) {
		return yr.add(e), () => yr.delete(e);
	},
	attach(e) {
		vr = !0;
		try {
			let { fontScale: t, boldText: n, ...r } = Sr(e.prefs());
			br(r), e.onChange((e) => br(Sr(e)));
		} catch (e) {
			console.warn("[vis] a11y attach failed", e);
		}
	},
	devSet(e) {
		br(e);
	}
};
function Sr(e) {
	let t = {};
	return typeof e.fontScale == "number" && Number.isFinite(e.fontScale) && (t.fontScale = Math.max(1, Math.min(3.2, e.fontScale))), typeof e.boldText == "boolean" && (t.boldText = e.boldText), typeof e.increaseContrast == "boolean" && (t.increaseContrast = e.increaseContrast), typeof e.reduceMotion == "boolean" && (t.reduceMotion = e.reduceMotion), typeof e.voiceOver == "boolean" && (t.voiceOver = e.voiceOver), t;
}
//#endregion
//#region src/render/glyphs.ts
var Cr = {
	0: {
		d: "M30 4 C45 4 53 21 53 50 C53 79 45 96 30 96 C15 96 7 79 7 50 C7 21 15 4 30 4 Z",
		adv: 60
	},
	1: {
		d: "M13 22 C21 18 27 12 32 4 L32 96 M16 96 L48 96",
		adv: 60
	},
	2: {
		d: "M9 25 C11 12 20 4 31 4 C43 4 51 12 51 25 C51 41 37 54 9 96 L54 96",
		adv: 60
	},
	3: {
		d: "M9 15 C15 8 22 4 31 4 C43 4 50 12 50 24 C50 37 41 46 26 46 C43 46 53 55 53 70 C53 87 42 96 29 96 C20 96 12 92 7 85",
		adv: 60
	},
	4: {
		d: "M41 96 L41 4 L6 67 L56 67",
		adv: 60
	},
	5: {
		d: "M50 4 L17 4 L13 44 C19 39 25 37 32 37 C46 37 54 48 54 65 C54 84 43 96 29 96 C20 96 12 92 7 85",
		adv: 60
	},
	6: {
		d: "M47 9 C42 6 37 4 31 4 C16 4 8 22 8 52 C8 80 17 96 31 96 C45 96 53 85 53 69 C53 53 44 43 31 43 C21 43 12 50 8 60",
		adv: 60
	},
	7: {
		d: "M8 4 L52 4 C39 30 29 60 25 96",
		adv: 60
	},
	8: {
		d: "M30 46 C18 46 11 39 11 26 C11 13 19 4 30 4 C41 4 49 13 49 26 C49 39 42 46 30 46 C16 46 7 56 7 71 C7 87 17 96 30 96 C43 96 53 87 53 71 C53 56 44 46 30 46 Z",
		adv: 60
	},
	9: {
		d: "M13 91 C18 94 23 96 29 96 C44 96 52 78 52 48 C52 20 43 4 29 4 C15 4 7 15 7 31 C7 47 16 57 29 57 C39 57 48 50 52 40",
		adv: 60
	},
	":": {
		d: "M12 32 L12 33 M12 78 L12 79",
		adv: 24
	},
	"#": {
		d: "M24 14 L17 88 M45 14 L38 88 M7 36 L56 36 M5 66 L54 66",
		adv: 62
	}
}, wr = /* @__PURE__ */ new Map();
function Tr(e) {
	let t = Cr[e];
	if (!t) return null;
	let n = wr.get(e);
	return n || (n = new Path2D(t.d), wr.set(e, n)), n;
}
function Er(e, t, n = 1) {
	let r = 0;
	for (let n of e) r += ((Cr[n]?.adv ?? 40) + 4) * (t / 100);
	return r - t / 100 * 4 + 15 * n * (t / 100);
}
function Dr(e, t, n, r, i, a, o = 1) {
	let s = i / 100, c = n - (Er(t, i, o) - 15 * o * s) / 2, l = r - i / 2;
	e.save(), e.lineCap = "round", e.lineJoin = "round";
	for (let n of a) {
		e.save(), e.globalAlpha *= n.alpha ?? 1, e.strokeStyle = n.style, n.glow && (e.shadowColor = n.glow.color, e.shadowBlur = n.glow.blur);
		let r = c;
		for (let i of t) {
			let t = Cr[i], a = Tr(i);
			t && a && (e.save(), e.translate(r + (n.dx ?? 0), l + (n.dy ?? 0)), e.scale(s, s), e.lineWidth = 15 * o * (n.widthK ?? 1), e.stroke(a), e.restore()), r += ((t?.adv ?? 40) + 4) * s;
		}
		e.restore();
	}
	e.restore();
}
//#endregion
//#region src/render/lantern.ts
var Or = 272, J = {
	x: 430.4,
	y: 332.6,
	w: 163.2,
	h: 168.6,
	rx: 73.4,
	ry: 54.4
};
function kr(e, t = 0) {
	let { x: n, y: r, w: i, h: a } = J, o = J.rx + t, s = J.ry + t, c = n - t, l = r - t, u = n + i + t, d = r + a + t;
	e.beginPath(), e.moveTo(c + o, l), e.lineTo(u - o, l), e.ellipse(u - o, l + s, o, s, 0, -Math.PI / 2, 0), e.lineTo(u, d - s), e.ellipse(u - o, d - s, o, s, 0, 0, Math.PI / 2), e.lineTo(c + o, d), e.ellipse(c + o, d - s, o, s, 0, Math.PI / 2, Math.PI), e.lineTo(c, l + s), e.ellipse(c + o, l + s, o, s, 0, Math.PI, Math.PI * 1.5), e.closePath();
}
function Ar(e, t, n, r, i, a) {
	e.beginPath(), e.moveTo(t + a, n), e.arcTo(t + r, n, t + r, n + i, a), e.arcTo(t + r, n + i, t, n + i, a), e.arcTo(t, n + i, t, n, a), e.arcTo(t, n, t + r, n, a), e.closePath();
}
var jr = {
	wick: [
		"#FFF3DA",
		"#FFEECB",
		"#FFDD94",
		"#FFC864",
		"#E8B05A"
	],
	momo: [
		"#FFF3F2",
		"#FFE6E6",
		"#FFCAD3",
		"#F6A6B8",
		"#E08AA0"
	],
	sage: [
		"#F7FCEC",
		"#ECF6D6",
		"#D3EBAE",
		"#AFD585",
		"#8CBA66"
	],
	luna: [
		"#F8F3FF",
		"#ECE2FF",
		"#D6C4F8",
		"#BBA0EA",
		"#9C82D2"
	],
	pip: [
		"#FFF9E0",
		"#FFF2B8",
		"#FFE184",
		"#FFC950",
		"#EFAE3A"
	],
	kuri: [
		"#FFF3EA",
		"#FFE3CF",
		"#FFC9A6",
		"#F2A479",
		"#D9875A"
	],
	yuki: [
		"#F6FBFF",
		"#E5F2FF",
		"#CAE3F8",
		"#A6CDEE",
		"#88B4DC"
	],
	tassel: [
		"#FFF3DA",
		"#FFEECB",
		"#FFDD94",
		"#FFC864",
		"#E8B05A"
	],
	crescent: [
		"#FFF4D6",
		"#FFF3DE",
		"#F4EBD0",
		"#E8D4B8",
		"#E8B05A"
	],
	seasons: [
		"#FFF3DA",
		"#FFEECB",
		"#FFDD94",
		"#FFC864",
		"#E8B05A"
	]
};
function Mr(e, t, n, r = "wick") {
	let i = jr[r], a = t / Or;
	e.save(), e.scale(a, a), e.translate(-403.2, -264.67999999999995);
	let o = "#3E2A22", s = "#6E4C38";
	e.strokeStyle = o, e.lineWidth = 13.6, e.lineCap = "round", e.beginPath(), e.arc(512, 314.9, 46.2, Math.PI, 0), e.stroke();
	let c = e.createRadialGradient(512, 408.8, 0, 512, 408.8, 108.8);
	c.addColorStop(0, Y("#D9CDB0", i[0], n)), c.addColorStop(.3, Y("#CDBE9C", i[1], n)), c.addColorStop(.6, Y("#B9A47E", i[2], n)), c.addColorStop(.9, Y("#9C8462", i[3], n)), c.addColorStop(1, Y("#7E6A50", i[4], n)), kr(e), e.fillStyle = c, e.fill(), e.save(), kr(e), e.clip();
	let l = e.createLinearGradient(J.x, 0, J.x + J.w, 0);
	l.addColorStop(0, "rgba(122,74,28,0.22)"), l.addColorStop(.3, "rgba(122,74,28,0)"), l.addColorStop(.7, "rgba(122,74,28,0)"), l.addColorStop(1, "rgba(122,74,28,0.32)"), e.fillStyle = l, e.fillRect(J.x, J.y, J.w, J.h), e.strokeStyle = `rgba(122,74,28,${.16 + .06 * (1 - n)})`, e.lineWidth = 3.2;
	for (let t of [388, 446]) e.beginPath(), e.moveTo(J.x, t), e.quadraticCurveTo(512, t + 7, J.x + J.w, t), e.stroke();
	e.restore(), kr(e), e.strokeStyle = "rgba(90,58,28,0.5)", e.lineWidth = 5.4, e.stroke();
	for (let t of [422.2, 588.2]) Ar(e, t, 324.4, 13.6, 179.5, 6.8), e.fillStyle = o, e.fill(), e.fillStyle = `rgba(255,200,120,${.35 * n})`, e.fillRect(t < 500 ? t + 9.5 : t + .5, 340, 3.6, 150);
	let u = e.createLinearGradient(0, 305.4, 0, 335.3);
	u.addColorStop(0, s), u.addColorStop(1, o), e.beginPath(), e.moveTo(430.6, 312.6), e.quadraticCurveTo(435.8, 305.4, 444.8, 305.4), e.lineTo(579.2, 305.4), e.quadraticCurveTo(588.2, 305.4, 593.4, 312.6), e.lineTo(604.6, 328.1), e.quadraticCurveTo(609.9, 335.3, 600.9, 335.3), e.lineTo(423.1, 335.3), e.quadraticCurveTo(414.1, 335.3, 419.4, 328.1), e.closePath(), e.fillStyle = u, e.fill(), e.fillStyle = "rgba(255,230,190,0.18)", e.fillRect(440, 306.5, 144, 3);
	let d = e.createLinearGradient(0, 493.1, 0, 520.3);
	d.addColorStop(0, s), d.addColorStop(1, o), Ar(e, 416.8, 493.1, 190.4, 27.2, 8.2), e.fillStyle = d, e.fill(), e.fillStyle = `rgba(255,214,140,${.4 * n})`, e.fillRect(432, 493.6, 160, 2.6), r !== "wick" && Nr(e, r), e.restore();
}
function Nr(e, t) {
	let n = "rgba(59,44,69,0.55)";
	if (e.lineWidth = 3, e.strokeStyle = n, t === "momo") {
		for (let t = 0; t < 5; t++) {
			let n = t / 5 * Math.PI * 2 - Math.PI / 2;
			e.beginPath(), e.ellipse(586 + Math.cos(n) * 11, 316 + Math.sin(n) * 11, 9, 7, n, 0, Math.PI * 2), e.fillStyle = "#FF9FB6", e.fill(), e.stroke();
		}
		e.beginPath(), e.arc(586, 316, 6, 0, Math.PI * 2), e.fillStyle = "#FFE08A", e.fill();
	} else if (t === "sage") for (let t of [-1, 1]) e.save(), e.translate(512 + t * 12, 262), e.rotate(t * .7), e.beginPath(), e.ellipse(0, 0, 18, 8, 0, 0, Math.PI * 2), e.fillStyle = "#7DBB6A", e.fill(), e.stroke(), e.restore();
	else if (t === "luna") {
		e.beginPath();
		for (let t = 0; t < 10; t++) {
			let n = t / 10 * Math.PI * 2 - Math.PI / 2, r = t % 2 ? 7 : 16;
			e.lineTo(438 + Math.cos(n) * r, 314 + Math.sin(n) * r);
		}
		e.closePath(), e.fillStyle = "#F4D38A", e.fill(), e.stroke();
	} else if (t === "pip") {
		e.fillStyle = "#FF9A4D";
		for (let t of [-1, 1]) e.beginPath(), e.moveTo(512, 269), e.lineTo(512 + t * 22, 257), e.lineTo(512 + t * 22, 281), e.closePath(), e.fill(), e.stroke();
		e.beginPath(), e.arc(512, 269, 6, 0, Math.PI * 2), e.fill(), e.stroke();
	} else if (t === "kuri") {
		e.save(), kr(e, 3), e.clip(), e.fillStyle = "#C8553D", e.fillRect(400, 456, 230, 22), e.fillStyle = "rgba(255,243,222,0.85)";
		for (let t = 436; t < 596; t += 16) e.beginPath(), e.moveTo(t, 461), e.lineTo(t + 5, 467), e.lineTo(t + 10, 461), e.lineTo(t + 5, 473), e.closePath(), e.fill();
		e.restore();
	} else if (t === "yuki") e.beginPath(), e.moveTo(424, 312), e.quadraticCurveTo(430, 294, 456, 297), e.quadraticCurveTo(476, 286, 500, 296), e.quadraticCurveTo(526, 284, 552, 296), e.quadraticCurveTo(580, 290, 598, 308), e.quadraticCurveTo(604, 318, 592, 316), e.quadraticCurveTo(586, 326, 578, 316), e.lineTo(450, 316), e.quadraticCurveTo(440, 326, 434, 316), e.quadraticCurveTo(418, 320, 424, 312), e.closePath(), e.fillStyle = "#F4FAFF", e.fill(), e.strokeStyle = "rgba(120,150,190,0.6)", e.stroke();
	else if (t === "tassel") e.strokeStyle = "#4A3328", e.beginPath(), e.moveTo(428, 334), e.lineTo(428, 346), e.stroke(), e.beginPath(), e.arc(428, 351, 7, 0, Math.PI * 2), e.fillStyle = "#4A3328", e.fill(), e.beginPath(), e.moveTo(419, 357), e.lineTo(437, 357), e.lineTo(442, 396), e.quadraticCurveTo(428, 402, 414, 396), e.closePath(), e.fillStyle = "#D88BA6", e.fill(), e.strokeStyle = n, e.stroke();
	else if (t === "crescent") {
		let t = Math.atan2(18, 11);
		e.beginPath(), e.arc(588, 312, 18, -Math.PI / 2, Math.PI / 2, !0), e.arc(599, 312, Math.hypot(18, 11), Math.PI - t, Math.PI + t), e.closePath(), e.fillStyle = "#F4EBD0", e.fill(), e.stroke();
	} else t === "seasons" && [
		"#D88BA6",
		"#9DBF9E",
		"#F08A5D",
		"#F4EBD0"
	].forEach((t, n) => {
		e.beginPath(), e.arc(458 + n * 36, 320, 10, 0, Math.PI * 2), e.fillStyle = t, e.fill(), e.stroke();
	});
}
function Pr(e, t, n, r) {
	let i = t / Or;
	e.save(), e.scale(i, i), e.translate(-403.2, -264.67999999999995), e.strokeStyle = r, e.lineWidth = n / i, e.lineJoin = "round", kr(e, 14), e.stroke(), e.restore();
}
function Fr(e) {
	let t = e / Or;
	return {
		bodyW: J.w * t,
		bodyH: J.h * t,
		top: 4.020000000000039 * t,
		bottom: 255.62 * t,
		cx: .4 * e,
		cy: .56 * e
	};
}
//#endregion
//#region src/render/draw.ts
var Ir = Math.PI * 2;
function Y(e, t, n) {
	let r = fr(e), i = fr(t), a = (e) => Math.round((r >> e & 255) * (1 - n) + (i >> e & 255) * n);
	return `rgb(${a(16)},${a(8)},${a(0)})`;
}
function X(e, t, n, r, i, a) {
	let o = Math.min(a, r / 2, i / 2);
	e.beginPath(), e.moveTo(t + o, n), e.arcTo(t + r, n, t + r, n + i, o), e.arcTo(t + r, n + i, t, n + i, o), e.arcTo(t, n + i, t, n, o), e.arcTo(t, n, t + r, n, o), e.closePath();
}
function Lr(e, t) {
	let n = t.length / 2;
	e.beginPath();
	let r = (e) => (t[e % n * 2] + t[(e + 1) % n * 2]) / 2, i = (e) => (t[e % n * 2 + 1] + t[(e + 1) % n * 2 + 1]) / 2;
	e.moveTo(r(n - 1), i(n - 1));
	for (let a = 0; a < n; a++) e.quadraticCurveTo(t[a * 2], t[a * 2 + 1], r(a), i(a));
	e.closePath();
}
function Rr(e, t, n, r, i = .86) {
	let a = r() * Ir, o = [];
	for (let s = 0; s < 9; s++) {
		let c = a + s / 9 * Ir, l = n * (.84 + .16 * r());
		o.push(e + Math.cos(c) * l, t + Math.sin(c) * l * i);
	}
	return o;
}
function zr(e, t, n, r, i, a = !0, o = !1) {
	let s = Rr(t, n, r, i);
	e.save(), e.translate(r * .04, r * .2), Lr(e, s), e.fillStyle = "rgba(4,5,14,0.6)", e.fill(), e.restore();
	let c = e.createLinearGradient(t - r * .5, n - r * .85, t + r * .35, n + r * .9);
	c.addColorStop(0, o ? W.paleHi : W.stoneHi), c.addColorStop(.45, o ? W.pale : W.stone), c.addColorStop(1, o ? W.paleLo : W.stoneLo), Lr(e, s), e.fillStyle = c, e.fill(), e.save(), Lr(e, s), e.clip();
	let l = e.createLinearGradient(0, n + r * .2, 0, n + r);
	if (l.addColorStop(0, "rgba(10,10,28,0)"), l.addColorStop(1, "rgba(10,10,28,0.45)"), e.fillStyle = l, e.fillRect(t - r * 1.2, n - r, r * 2.4, r * 2.2), a) {
		let a = 3 + Math.floor(i() * 2);
		for (let o = 0; o < a; o++) {
			let a = t + (i() - .5) * r * 1.3, o = n - r * (.45 + i() * .45), s = r * (.28 + i() * .22), c = e.createRadialGradient(a - s * .3, o - s * .4, s * .1, a, o, s);
			c.addColorStop(0, W.mossHi), c.addColorStop(.7, W.moss), c.addColorStop(1, G(W.moss, 0)), e.fillStyle = c, e.beginPath(), e.ellipse(a, o, s * 1.25, s * .85, 0, 0, Ir), e.fill();
		}
	}
	let u = e.createRadialGradient(t - r * .35, n - r * .45, 0, t - r * .35, n - r * .45, r * .7);
	u.addColorStop(0, "rgba(255,250,235,0.28)"), u.addColorStop(1, "rgba(255,250,235,0)"), e.fillStyle = u, e.fillRect(t - r * 1.2, n - r * 1.2, r * 2.4, r * 2.4), e.restore(), Lr(e, s), e.lineWidth = Math.max(1, r * .06), e.strokeStyle = "rgba(6,6,18,0.75)", e.stroke();
}
function Br(e, t, n, r, i) {
	Ti(e, t, n, r, i);
}
function Vr(e, t, n, r, i, a) {
	let o = r * .43, s = String(i), c = xr.p.boldText ? 1.22 : 1, l = xr.p.boldText || xr.p.increaseContrast;
	if (a === "ink") {
		Dr(e, s, t, n, o, [
			{
				style: "rgba(255,252,240,0.75)",
				dy: r * .016,
				widthK: 1.05
			},
			{ style: W.pipInk },
			{
				style: "rgba(70,76,112,0.55)",
				dy: r * .008,
				widthK: .42
			}
		], c);
		return;
	}
	if (a === "warm") {
		Hr(e, t, n, r), Dr(e, s, t, n, o, [{
			style: "rgba(255,252,240,0.8)",
			dy: r * .016,
			widthK: 1.05
		}, { style: W.pipInk }], c * (l ? 1.08 : 1));
		return;
	}
	Gr(e, t, n, r * .42, [
		[0, "rgba(242,144,122,0.4)"],
		[.6, "rgba(242,144,122,0.14)"],
		[1, "rgba(242,144,122,0)"]
	]);
	let u = e.createLinearGradient(0, n - o / 2, 0, n + o / 2);
	u.addColorStop(0, W.coralHi), u.addColorStop(.5, W.coral), u.addColorStop(1, "#E06A50"), Dr(e, s, t, n, o, [{
		style: "rgba(40,8,4,0.95)",
		widthK: l ? 1.55 : 1.42
	}, {
		style: u,
		widthK: .86
	}], c);
}
function Hr(e, t, n, r) {
	Gr(e, t, n, r * .4, [
		[0, "rgba(255,214,140,0.55)"],
		[.6, "rgba(255,190,100,0.25)"],
		[1, "rgba(255,170,80,0)"]
	]);
	let i = r * .33, a = xr.p.increaseContrast || xr.p.boldText;
	e.lineWidth = r * (a ? .085 : .07), e.strokeStyle = dr.okRingEdge, e.beginPath(), e.arc(t, n, i, 0, Ir), e.stroke(), e.lineWidth = r * (a ? .055 : .045), e.strokeStyle = dr.okRing, e.beginPath(), e.arc(t, n, i, 0, Ir), e.stroke();
}
function Ur(e, t) {
	let n = t * .4, r = t * .56, i = t * .35;
	t * .32;
	let a = Math.max(2, t * .05);
	Gr(e, n, r, Math.min(n, i * 1.15), [
		[0, G("#FFFFFF", .55)],
		[.6, G(W.moon, .25)],
		[1, G(W.moon, 0)]
	]), Pr(e, t, a * 2.2, "rgba(14,20,48,0.65)");
	let o = document.createElement("canvas");
	o.width = Math.ceil(t * .8), o.height = Math.ceil(t);
	let s = o.getContext("2d");
	Wr(s, t, .7), s.globalCompositeOperation = "source-atop", s.fillStyle = "rgba(226,238,252,0.62)", s.fillRect(0, 0, o.width, o.height), e.save(), e.globalAlpha = .92, e.drawImage(o, 0, 0), e.restore(), Pr(e, t, a, "#F7FBFF");
}
function Wr(e, t, n, r = "wick") {
	Mr(e, t, n, r);
}
function Gr(e, t, n, r, i) {
	let a = e.createRadialGradient(t, n, 0, t, n, r);
	for (let [e, t] of i) a.addColorStop(e, t);
	e.fillStyle = a, e.beginPath(), e.arc(t, n, r, 0, Ir), e.fill();
}
var Kr = {
	flame: [
		[0, "rgba(255,250,232,1)"],
		[.18, "rgba(255,244,214,0.95)"],
		[.4, "rgba(255,200,100,0.6)"],
		[.7, "rgba(255,170,70,0.18)"],
		[1, "rgba(255,150,60,0)"]
	],
	flameMoon: [
		[0, "rgba(240,248,255,1)"],
		[.2, "rgba(214,232,248,0.9)"],
		[.45, "rgba(143,183,217,0.55)"],
		[.75, "rgba(143,183,217,0.15)"],
		[1, "rgba(143,183,217,0)"]
	],
	halo: [
		[0, "rgba(255,206,120,0.42)"],
		[.35, "rgba(255,190,100,0.2)"],
		[.7, "rgba(255,170,80,0.06)"],
		[1, "rgba(255,160,70,0)"]
	],
	firefly: [
		[0, "rgba(255,252,220,1)"],
		[.22, "rgba(236,246,160,0.75)"],
		[.5, "rgba(200,230,120,0.22)"],
		[1, "rgba(180,220,100,0)"]
	],
	star: [
		[0, "rgba(255,255,255,1)"],
		[.3, "rgba(244,235,208,0.6)"],
		[1, "rgba(244,235,208,0)"]
	],
	smoke: [
		[0, "rgba(190,176,206,0.32)"],
		[.6, "rgba(170,156,190,0.14)"],
		[1, "rgba(160,146,180,0)"]
	],
	window: [
		[0, "rgba(255,214,130,0.55)"],
		[.4, "rgba(255,190,100,0.22)"],
		[1, "rgba(255,170,80,0)"]
	]
};
function qr(e, t) {
	let n = t / 2;
	xr.p.increaseContrast || Gr(e, n, n, n, [
		[0, G(W.coral, .4)],
		[.55, G(W.coral, .14)],
		[1, G(W.coral, 0)]
	]);
	let r = t * .25;
	e.lineCap = "round";
	for (let [i, a] of [
		["#3a1d14", t * .27],
		["rgba(16,4,2,0.95)", t * .22],
		[W.coral, t * .14],
		[W.coralHi, t * .04]
	]) e.strokeStyle = i, e.lineWidth = a, e.beginPath(), e.moveTo(n - r, n - r), e.lineTo(n + r, n + r), e.moveTo(n + r, n - r), e.lineTo(n - r, n + r), e.stroke();
	e.lineCap = "butt";
}
//#endregion
//#region src/render/court.ts
var Z = Math.PI * 2;
function Jr(e) {
	return .55 + .45 * Math.exp(-Math.max(0, e - 1) / 1.7);
}
function Yr(e) {
	return Math.exp(-Math.max(0, e - 1) / 1.7);
}
var Xr = [
	.89,
	.78,
	.63
];
function Zr(e, t) {
	let n = Math.exp(-Math.max(0, e - .5) / 1.7);
	for (let e = 0; e < 3; e++) t[e] = Xr[e] + (1 - Xr[e]) * n;
	return t;
}
function Qr(e, t) {
	return Math.max(t, Math.round(e * .06));
}
var $r = (e, t, n) => {
	let r = Math.max(0, Math.min(1, (n - e) / (t - e)));
	return r * r * (3 - 2 * r);
};
function ei(e, t, n) {
	let r = [
		0,
		0,
		0
	];
	for (let i = 0; i < t; i++) Zr(n - .5 + (i + .5) / t, r), e.fillStyle = `rgb(${Math.round(255 * r[0])},${Math.round(255 * r[1])},${Math.round(255 * r[2])})`, e.fillRect(i, 0, 1, t);
}
function ti(e, t) {
	let n = e.createImageData(t, t), r = t / 2, i = [
		0,
		0,
		0
	];
	for (let e = 0; e < t; e++) for (let a = 0; a < t; a++) {
		Zr(Math.hypot(a + .5 - r, e + .5 - r) / t, i);
		let o = (e * t + a) * 4;
		n.data[o] = 255 * i[0], n.data[o + 1] = 255 * i[1], n.data[o + 2] = 255 * i[2], n.data[o + 3] = 255;
	}
	e.putImageData(n, 0, 0);
}
var ni = [
	[0, "rgba(255,240,200,0.85)"],
	[.14, "rgba(255,226,166,0.62)"],
	[.3, "rgba(255,204,128,0.3)"],
	[.48, "rgba(240,176,100,0.1)"],
	[.7, "rgba(220,150,80,0.03)"],
	[1, "rgba(200,130,70,0)"]
];
function ri(e, t, n) {
	let r = e.createImageData(t, t), i = r.data, a = t / 2;
	for (let e = 0; e < t; e++) for (let r = 0; r < t; r++) {
		let o = r + .5 - a, s = (e + .5 - a) / .86, c = Math.hypot(o, s) / n, l = Math.max(0, -o / (Math.hypot(o, s) || 1)), u = $r(.42, .7, c) * (1 - $r(.72, .84, c)) * l * l * (.7 + .3 * Math.max(0, -s / n)), d = (e * t + r) * 4;
		i[d] = 255, i[d + 1] = 190, i[d + 2] = 100, i[d + 3] = 255 * u * .8;
	}
	e.putImageData(r, 0, 0);
}
function ii(e, t, n) {
	let r = wi(t), i = e.createImageData(t, t), a = i.data, o = t / 2, s = r.hw, c = (r.bottom - r.top) / 2, l = o + r.cy;
	for (let e = 0; e < t; e++) for (let i = 0; i < t; i++) {
		let u = Math.abs(i + .5 - o) - (s - r.r), d = Math.abs(e + .5 - l) - (c - r.r), f = Math.hypot(Math.max(u, 0), Math.max(d, 0)) + Math.min(Math.max(u, d), 0) - r.r, p = (i + .5 - o) / s, m = (e + .5 - l) / c, h = n === 0 ? -p : n === 1 ? p : n === 2 ? -m : m, g = $r(-t * .09, -t * .01, f) * (1 - $r(-t * .005, t * .012, f)) * $r(.25, .95, h), _ = (e * t + i) * 4;
		a[_] = 255, a[_ + 1] = 196, a[_ + 2] = 108, a[_ + 3] = 255 * g * .85;
	}
	e.putImageData(i, 0, 0);
}
var ai = 1.6, oi = [
	[
		255,
		204,
		128
	],
	[
		255,
		184,
		150
	],
	[
		240,
		222,
		150
	],
	[
		200,
		214,
		255
	]
];
function si(e, t, n = .27, r = oi[0]) {
	let i = e.createImageData(t, t), a = t / 2;
	for (let e = 0; e < t; e++) for (let o = 0; o < t; o++) {
		let s = Math.abs(o + .5 - a) / a, c = Math.abs(e + .5 - a) / a, l = (1 - $r(0, 1, (s ** 4 + c ** 4) ** .25)) ** 1.6, u = (e * t + o) * 4;
		i.data[u] = r[0], i.data[u + 1] = r[1], i.data[u + 2] = r[2], i.data[u + 3] = 255 * Math.min(1, l * n);
	}
	e.putImageData(i, 0, 0);
}
function ci(e, t, n) {
	e.save(), e.translate(t / 2, n / 2), e.scale(1, n / t);
	let r = e.createRadialGradient(0, 0, 0, 0, 0, t / 2);
	r.addColorStop(0, "rgba(40,18,6,0.7)"), r.addColorStop(.55, "rgba(40,18,6,0.4)"), r.addColorStop(1, "rgba(40,18,6,0)"), e.fillStyle = r, e.beginPath(), e.arc(0, 0, t / 2, 0, Z), e.fill(), e.restore();
}
var li = null, Q = 128;
function ui() {
	if (li) return li;
	let e = document.createElement("canvas");
	e.width = Q, e.height = Q;
	let t = e.getContext("2d"), n = t.createImageData(Q, Q), r = K(53340), i = [
		8,
		16,
		32
	].map((e) => {
		let t = new Float32Array(e * e);
		for (let e = 0; e < t.length; e++) t[e] = r();
		return {
			n: e,
			v: t
		};
	}), a = (e) => e * e * (3 - 2 * e), o = [
		.55,
		.3,
		.15
	];
	for (let e = 0; e < Q; e++) for (let t = 0; t < Q; t++) {
		let r = 0;
		for (let n = 0; n < 3; n++) {
			let { n: s, v: c } = i[n], l = t / Q * s, u = e / Q * s, d = Math.floor(l), f = Math.floor(u), p = a(l - d), m = a(u - f), h = c[f % s * s + d % s], g = c[f % s * s + (d + 1) % s], _ = c[(f + 1) % s * s + d % s], v = c[(f + 1) % s * s + (d + 1) % s];
			r += o[n] * ((h * (1 - p) + g * p) * (1 - m) + (_ * (1 - p) + v * p) * m);
		}
		let s = Math.round(128 + (r - .5) * 2 * 90), c = (e * Q + t) * 4;
		n.data[c] = s, n.data[c + 1] = s, n.data[c + 2] = s, n.data[c + 3] = 255;
	}
	return t.putImageData(n, 0, 0), li = e, e;
}
function di(e, t, n, r, i, a, o, s = 1) {
	let c = ui(), l = e.createPattern(c, "repeat");
	if (!l) return;
	let u = Math.max(r, i) * s * 2 / Q;
	l.setTransform(new DOMMatrix([
		u,
		0,
		0,
		u,
		t - a() * Q * u,
		n - a() * Q * u
	])), e.save(), e.globalCompositeOperation = "overlay", e.globalAlpha = o, e.fillStyle = l, e.fillRect(t, n, r, i), e.restore();
}
function fi(e, t, n, r, i) {
	let a = [
		0,
		0,
		0,
		0
	].map(() => r * (.05 + i() * .07)), o = () => (i() - .5) * r * .012;
	e.beginPath(), e.moveTo(t + a[0], n + o()), e.lineTo(t + r - a[1], n + o()), e.quadraticCurveTo(t + r, n, t + r + o(), n + a[1]), e.lineTo(t + r + o(), n + r - a[2]), e.quadraticCurveTo(t + r, n + r, t + r - a[2], n + r + o()), e.lineTo(t + a[3], n + r + o()), e.quadraticCurveTo(t, n + r, t + o(), n + r - a[3]), e.lineTo(t + o(), n + a[0]), e.quadraticCurveTo(t, n, t + a[0], n), e.closePath();
}
var pi = /* @__PURE__ */ new Map(), mi = "stone", hi = {
	stone: [
		W.floorHi,
		"#2A3050",
		"#2E2F52",
		W.floorHi,
		"#282E4E",
		"#2D3150",
		"#29304F",
		"#2C2F4F"
	],
	garden: [
		"#2A3A3A",
		"#263634",
		"#2C3B38",
		"#2A3A3A",
		"#243431",
		"#2B3A37",
		"#273734",
		"#2A3936"
	],
	snow: [
		"#33405E",
		"#303C5A",
		"#364362",
		"#33405E",
		"#2E3A57",
		"#35425F",
		"#313E5B",
		"#34415E"
	]
}, gi = [
	"#F0C688",
	"#ECC084",
	"#EEC282",
	"#F2CA8E",
	"#E9BD84",
	"#EFC58A",
	"#EDC083",
	"#F1C88C"
];
function _i(e, t, n, r = !1) {
	let i = `${e}:${t}:${+!!r}:${r ? "" : mi}`, a = pi.get(i);
	if (a) return a;
	let o = document.createElement("canvas");
	o.width = e, o.height = e;
	let s = o.getContext("2d"), c = pr(`slab${t}`), l = K(c), u = r ? gi[t % 8] : hi[mi][t % 8], d = s.createLinearGradient(0, 0, e * .35, e);
	r ? (d.addColorStop(0, Y(u, "#FFE2A8", .35)), d.addColorStop(.55, u), d.addColorStop(1, Y(u, "#B87A44", .45))) : (d.addColorStop(0, Y(u, "#3A4064", .18)), d.addColorStop(.55, u), d.addColorStop(1, W.floorLo)), fi(s, 0, 0, e, K(c)), s.fillStyle = d, s.fill(), s.save(), fi(s, 0, 0, e, K(c)), s.clip(), di(s, 0, 0, e, e, l, r ? .18 : .32, 1.1), di(s, 0, 0, e, e, l, r ? .18 : .21, .45);
	for (let t = 0; t < 7; t++) s.fillStyle = t < 4 ? r ? `rgba(110,60,24,${.1 + l() * .1})` : `rgba(8,10,24,${.13 + l() * .15})` : r ? `rgba(255,246,220,${.12 + l() * .1})` : `rgba(220,226,255,${.04 + l() * .05})`, s.beginPath(), s.ellipse(l() * e, l() * e, e * (.006 + l() * .012), e * (.005 + l() * .009), l() * 3, 0, Z), s.fill();
	if (t % 2 == 1 && !r) {
		s.strokeStyle = r ? "rgba(96,50,20,0.5)" : "rgba(8,10,24,0.3)", s.lineWidth = Math.max(1, .9 * n), s.lineCap = "round", s.beginPath();
		let t = e * (.15 + l() * .3), i = l() < .5 ? 0 : e * (.2 + l() * .3);
		s.moveTo(t, i);
		let a = 3 + Math.floor(l() * 3);
		for (let n = 0; n < a; n++) t += e * (.08 + l() * .12), i += e * (l() - .3) * .16, s.lineTo(t, i);
		s.stroke(), s.strokeStyle = r ? "rgba(255,240,205,0.3)" : "rgba(200,210,255,0.06)", s.translate(0, Math.max(1, n)), s.stroke();
	}
	if (t % 3 == 0) {
		let t = s.createRadialGradient(e * .6, e * .55, 0, e * .6, e * .55, e * .4);
		t.addColorStop(0, r ? "rgba(120,64,24,0.14)" : "rgba(8,10,24,0.12)"), t.addColorStop(1, "rgba(8,10,24,0)"), s.fillStyle = t, s.fillRect(0, 0, e, e);
	}
	if (!r && mi !== "stone") {
		let t = mi === "garden" ? 5 : 9;
		for (let n = 0; n < t; n++) {
			let t = l() < .5, n = t ? l() < .5 ? e * .06 : e * .94 : e * (.1 + l() * .8), r = t ? e * (.1 + l() * .8) : l() < .5 ? e * .06 : e * .94;
			s.fillStyle = mi === "garden" ? `rgba(124,176,108,${.3 + l() * .25})` : `rgba(232,242,255,${.22 + l() * .25})`, s.beginPath(), s.ellipse(n, r, e * (.03 + l() * .04), e * (.02 + l() * .025), l() * 3, 0, Z), s.fill();
		}
	}
	let f = s.createRadialGradient(e / 2, e / 2, e * .32, e / 2, e / 2, e * .75);
	return f.addColorStop(0, "rgba(0,0,0,0)"), f.addColorStop(1, r ? "rgba(90,40,10,0.24)" : "rgba(4,5,14,0.16)"), s.fillStyle = f, s.fillRect(0, 0, e, e), s.restore(), pi.set(i, o), o;
}
function vi(e, t, n, r, i, a, o = !1) {
	let s = Math.floor(i() * 8), c = Math.floor(i() * 4);
	e.save(), e.translate(t + r / 2, n + r / 2), e.rotate(c * Math.PI / 2), e.drawImage(_i(r, s, a, o), -r / 2, -r / 2, r, r), e.restore(), e.drawImage(yi(r, a, o), t, n, r, r);
}
function yi(e, t, n) {
	let r = `bevel${e}:${+!!n}`, i = pi.get(r);
	if (i) return i;
	let a = document.createElement("canvas");
	a.width = e, a.height = e;
	let o = a.getContext("2d");
	X(o, 0, 0, e, e, e * .09), o.clip();
	let s = Math.max(1, 1.1 * t);
	return o.fillStyle = n ? "rgba(255,246,220,0.3)" : "rgba(210,218,255,0.075)", o.fillRect(0, 0, e, s), o.fillRect(e - s, 0, s, e), o.fillStyle = n ? "rgba(80,36,10,0.32)" : "rgba(4,5,14,0.28)", o.fillRect(0, e - s * 1.4, e, s * 1.4), o.fillRect(0, 0, s * 1.2, e), pi.set(r, a), a;
}
var bi = {
	track: {
		top: "#383C5E",
		mid: "#2A2D4A",
		side: "#15172B",
		seam: "rgba(8,9,24,0.5)",
		rim: "rgba(214,200,240,0.22)"
	},
	daily: {
		top: "#646C9A",
		mid: "#454C7A",
		side: "#23284A",
		seam: "rgba(14,16,40,0.45)",
		rim: "rgba(244,235,208,0.5)"
	},
	deduce: {
		top: "#333C78",
		mid: "#232A5C",
		side: "#121638",
		seam: "rgba(6,8,26,0.55)",
		rim: "rgba(200,210,255,0.3)"
	}
};
function xi(e, t, n, r, i) {
	let { cs: a, u: o } = t, s = bi[n], c = K(pr(`court:${r}`)), l = t.gx - t.wall, u = t.gy - t.wall, d = t.cols * a + t.wall * 2, f = t.rows * a + t.wall * 2, p = Math.min(t.wall * .8, 9 * o), m = t.vig ?? 0;
	for (let n = 0; n < 8 && m > 0; n++) {
		let r = m * (1 - n / 8);
		e.fillStyle = "rgba(3,4,12,0.05)", X(e, l - r, u - r * .7, d + r * 2, f + t.face + r * 1.7, p + r), e.fill();
	}
	for (let n = 5; n >= 0; n--) {
		let r = n * 2.2 * o;
		e.fillStyle = `rgba(2,3,10,${(.09 + .05 * (5 - n)).toFixed(3)})`, X(e, l - r, u + 3 * o - r * .6, d + r * 2, f + t.face + 2 * o + r * 1.6, p + r), e.fill();
	}
	let h = t.bulge ?? 0;
	X(e, l, u + t.face, d, f, p), e.fillStyle = s.side, e.fill(), X(e, l, u, d, f, p), e.fillStyle = "#15172B", e.fill();
	let g = Math.max(1, 1.3 * o), _ = (n, r, i, a, l) => {
		let u = Math.min(i, a) * .22;
		l && (X(e, n + .5 * o, r + a - u, i - o, u + t.face, u), e.fillStyle = s.side, e.fill());
		let d = c(), f = e.createLinearGradient(n, r, n + i * .3, r + a);
		f.addColorStop(0, Y(s.top, W.moon, .04 + .06 * d)), f.addColorStop(1, Y(s.mid, s.top, .3 * d)), X(e, n, r, i, a, u), e.fillStyle = f, e.fill(), e.save(), X(e, n, r, i, a, u), e.clip(), di(e, n, r, i, a, c, .55, 1.2), e.fillStyle = s.rim, e.fillRect(n, r, i, Math.max(1, 1.1 * o)), e.fillStyle = "rgba(4,5,14,0.35)", e.fillRect(n, r + a - Math.max(1, 1.4 * o), i, Math.max(1, 1.4 * o)), e.restore();
	}, v = (e, t) => {
		let n = 0;
		for (; n < e - 1;) {
			let r = a * (.5 + c() * .45);
			e - n - r < a * .3 && (r = e - n), t(n, r - g, h * c()), n += r;
		}
	}, y = t.wall;
	v(f - y * 2, (e, t, n) => _(l - n, u + y + e, y + n, t, !1)), v(f - y * 2, (e, t, n) => _(l + d - y, u + y + e, y + n, t, !1)), v(d, (e, t, n) => _(l + e, u - n, t, y + n, !1)), v(d, (e, t, n) => _(l + e, u + f - y, t, y + n, !0));
	for (let n = 0; n < 12; n++) {
		let n = c(), r = Math.floor(c() * 4), i = r < 2 ? l + t.wall + n * (d - t.wall * 2) : r === 2 ? l + t.wall * (.3 + c() * .5) : l + d - t.wall * (.3 + c() * .5), a = r >= 2 ? u + t.wall + n * (f - t.wall * 2) : r === 0 ? u + t.wall * (.3 + c() * .6) : u + f - t.wall * (.3 + c() * .6), s = 3 + Math.floor(c() * 4);
		for (let t = 0; t < s; t++) e.fillStyle = t % 2 ? G(W.mossHi, .5) : G(W.moss, .55), e.beginPath(), e.arc(i + (c() - .5) * 6 * o, a + (c() - .5) * 3 * o, (.9 + c() * 1.3) * o, 0, Z), e.fill();
	}
	e.fillStyle = Y(W.hillNear, W.moss, .35);
	for (let n = 0; n < 26; n++) {
		let r = n % 3, i = .04 + .92 * c(), a = r === 2 ? l + i * d : r === 0 ? l - h * .5 : l + d + h * .5, s = r === 2 ? u + f + t.face : u + i * f, p = (2.5 + c() * 4) * o, m = r === 0 ? -1 : r === 1 ? 1 : (c() - .5) * .6;
		e.beginPath(), e.moveTo(a - 1.2 * o, s), e.quadraticCurveTo(a + m * p * .4, s - p * .6, a + m * p * .7, s - p), e.quadraticCurveTo(a + m * p * .2, s - p * .3, a + 1.2 * o, s), e.closePath(), e.fill();
	}
	if (n !== "track") {
		let i = K(pr(`frame:${r}`));
		n === "daily" && (X(e, l + t.wall * .42, u + t.wall * .42, d - t.wall * .84, f - t.wall * .84, p * .7), e.strokeStyle = "rgba(244,235,208,0.5)", e.lineWidth = Math.max(1, 1.1 * o), e.stroke());
		for (let r = 0; r < (n === "daily" ? 12 : 20); r++) {
			let a = r % 4, s = .05 + .9 * i(), c = a < 2 ? l + s * d : a === 2 ? l + t.wall * .42 : l + d - t.wall * .42, p = a === 0 ? u + t.wall * .42 : a === 1 ? u + f - t.wall * .42 : u + s * f, m = n === "deduce" && r % 3 == 0 ? "rgba(255,214,140,0.95)" : `rgba(244,235,208,${(.5 + i() * .4).toFixed(2)})`;
			Ci(e, c, p, (1 + i() * 1.6) * o, m);
		}
	}
	{
		let n = Math.min(a * 1.15, 76 * o), r = l + d / 2 - n / 2;
		e.fillStyle = "rgba(4,5,14,0.45)", X(e, r - 1.5 * o, u - h - 1 * o, n + 3 * o, t.wall + h + 1 * o, 4 * o), e.fill();
		let i = e.createLinearGradient(0, u - h, 0, u + t.wall);
		i.addColorStop(0, Y(s.top, W.moon, .2)), i.addColorStop(1, Y(s.top, W.moon, .05)), e.fillStyle = i, X(e, r, u - h, n, t.wall + h - 2 * o, 4 * o), e.fill(), e.save(), X(e, r, u - h, n, t.wall + h - 2 * o, 4 * o), e.clip(), di(e, r, u - h, n, t.wall + h, c, .5, .6), e.fillStyle = "rgba(244,235,208,0.3)", e.fillRect(r, u - h, n, Math.max(1, 1.2 * o)), e.restore();
	}
	let b = t.gx - t.gap / 2, x = t.gy - t.gap / 2, S = t.cols * a + t.gap, C = t.rows * a + t.gap;
	X(e, b - 1.5 * o, x - 1.5 * o, S + 3 * o, C + 3 * o, p * .55), e.fillStyle = "#0A0C1E", e.fill(), X(e, b, x, S, C, p * .45), e.fillStyle = W.grout, e.fill();
	let w = Qr(a, t.gap), T = a - w, E = K(pr(`slabs:${r}`));
	for (let n = 0; n < t.rows; n++) for (let r = 0; r < t.cols; r++) if (i(r, n)) vi(e, t.gx + r * a + w / 2, t.gy + n * a + w / 2, T, E, o);
	else {
		let i = t.gx + r * a + w / 2, o = t.gy + n * a + w / 2;
		e.fillStyle = "#15182E", X(e, i, o, T, T, T * .1), e.fill(), E();
	}
	e.save(), X(e, b, x, S, C, p * .45), e.clip();
	let D = e.createLinearGradient(0, x, 0, x + a * .3);
	D.addColorStop(0, "rgba(3,4,12,0.55)"), D.addColorStop(1, "rgba(3,4,12,0)"), e.fillStyle = D, e.fillRect(b, x, S, a * .3);
	let O = e.createLinearGradient(b + S, 0, b + S - a * .18, 0);
	O.addColorStop(0, "rgba(3,4,12,0.42)"), O.addColorStop(1, "rgba(3,4,12,0)"), e.fillStyle = O, e.fillRect(b + S - a * .18, x, a * .18, C), e.restore();
}
function Si(e, t, n, r) {
	let { cs: i, u: a } = t;
	e.fillStyle = "#5A3A22", e.fillRect(t.gx - t.gap / 2, t.gy - t.gap / 2, t.cols * i + t.gap, t.rows * i + t.gap);
	let o = Qr(i, t.gap), s = i - o, c = K(pr(`slabs:${n}`));
	for (let n = 0; n < t.rows; n++) for (let l = 0; l < t.cols; l++) r(l, n) ? vi(e, t.gx + l * i + o / 2, t.gy + n * i + o / 2, s, c, a, !0) : c();
}
function Ci(e, t, n, r, i) {
	e.fillStyle = i, e.beginPath();
	for (let i = 0; i < 8; i++) {
		let a = i / 8 * Z - Math.PI / 2, o = i % 2 == 0 ? r : r * .32;
		i === 0 ? e.moveTo(t + Math.cos(a) * o, n + Math.sin(a) * o) : e.lineTo(t + Math.cos(a) * o, n + Math.sin(a) * o);
	}
	e.closePath(), e.fill();
}
function wi(e) {
	let t = e * .365, n = -e * .35, r = e * .25;
	return {
		hw: t,
		top: n,
		bottom: r,
		side: e * .12,
		r: e * .14,
		cy: (n + r) / 2
	};
}
function Ti(e, t, n, r, i) {
	let a = r * .46;
	zr(e, t, n, a, i, !1, !0);
	let o = n + r * Ei, s = e.createRadialGradient(t - a * .1, o - a * .12, 0, t, o, a * .7);
	s.addColorStop(0, "rgba(250,251,255,0.26)"), s.addColorStop(.7, "rgba(240,242,250,0.12)"), s.addColorStop(1, "rgba(240,242,250,0)"), e.fillStyle = s, e.beginPath(), e.ellipse(t, o, a * .72, a * .66, (i() - .5) * .3, 0, Z), e.fill(), e.save(), e.beginPath(), e.ellipse(t, n, a * .95, a * .83, 0, 0, Z), e.clip(), di(e, t - a, n - a, a * 2, a * 2, i, .7, .5), di(e, t - a, n - a, a * 2, a * 2, i, .45, .2);
	for (let o = 0; o < 9; o++) {
		let o = i() * Z, s = a * (.35 + i() * .5);
		e.fillStyle = `rgba(70,76,110,${(.18 + i() * .22).toFixed(2)})`, e.beginPath(), e.arc(t + Math.cos(o) * s, n + Math.sin(o) * s * .86, r * (.004 + i() * .007), 0, Z), e.fill();
	}
	e.restore(), e.save(), e.beginPath(), e.ellipse(t, n, a * .92, a * .8, 0, 0, Z), e.clip();
	let c = i() < .5 ? -1 : 1, l = e.createLinearGradient(0, n + a * .45, 0, n + a * .9);
	l.addColorStop(0, G(W.moss, 0)), l.addColorStop(.35, G(W.moss, .75)), l.addColorStop(1, G(W.mossHi, .85)), e.fillStyle = l, e.beginPath(), e.moveTo(t + c * a, n + a * .3);
	for (let r = 0; r <= 8; r++) {
		let o = r / 8, s = t + c * a * (1 - o * 1.5), l = n + a * (.5 + .14 * Math.sin(o * 9 + i() * 2)) + o * a * .12;
		e.lineTo(s, l);
	}
	e.lineTo(t - c * a * .5, n + a), e.lineTo(t + c * a, n + a), e.closePath(), e.fill(), e.restore();
}
var Ei = -.03, Di = [
	0,
	Math.PI,
	Math.PI / 2,
	-Math.PI / 2
], Oi = [
	1,
	-1,
	0,
	0
], ki = [
	0,
	0,
	1,
	-1
];
function Ai(e, t, n, r, i, a, o) {
	i.fill(-1), a.fill(0), o.fill(-1);
	for (let n = 0; n < 64; n++) (n & 7) >= e || n >> 3 >= t || !r(n) || (i[n] = 0);
	for (let s = 0; s < 64; s++) if (i[s] === 0 && r(s)) for (let r = 0; r < 4; r++) {
		let c = (s & 7) + Oi[r], l = (s >> 3) + ki[r], u = 1;
		for (; c >= 0 && l >= 0 && c < e && l < t;) {
			let e = l * 8 + c;
			if (n(e)) {
				let t = e * 4 + r;
				(o[t] < 0 || o[t] > u) && (o[t] = u);
				break;
			}
			(i[e] < 0 || i[e] > u) && (i[e] = u, a[e] = r), c += Oi[r], l += ki[r], u++;
		}
	}
}
var ji = .5, Mi = 1.5, Ni = 2.3;
function Pi(e, t, n) {
	let r = document.createElement("canvas");
	return r.width = Math.max(1, Math.ceil(e)), r.height = Math.max(1, Math.ceil(t)), n(r.getContext("2d"), r.width, r.height), r;
}
function Fi(e, t, n = ni) {
	let r = e.createRadialGradient(t / 2, t / 2, 0, t / 2, t / 2, t / 2);
	for (let [e, t] of n) r.addColorStop(e, t);
	e.fillStyle = r, e.fillRect(0, 0, t, t);
}
function Ii(e) {
	let t = ji, n = Math.max(4, Math.round(e * t)), r = [];
	for (let e = 0; e <= 8; e++) r.push(Pi(n, n, (t, n) => ei(t, n, Math.max(1, e))));
	let i = Math.round(e * Mi * 2 * t), a = e * .43;
	return {
		src: Pi(n, n, (e, t) => ti(e, t)),
		ray: r,
		pool: Pi(i, i, (e, t) => Fi(e, t)),
		rim: Pi(a * Ni * t, a * Ni * t, (e, n) => ri(e, n, a * t)),
		marker: [
			0,
			1,
			2,
			3
		].map((e) => Pi(n, n, (t, n) => ii(t, n, e))),
		bloom: Pi(Math.round(e * ai * t * .5), Math.round(e * ai * t * .5), (e, t) => si(e, t))
	};
}
function Li(e, t, n, r, i, a, o, s, c, l, u, d, f = !0) {
	for (let d = 0; d < 64; d++) {
		let f = l.d[d];
		if (f < 0 || (d & 7) >= s || d >> 3 >= c) continue;
		let p = i + (d & 7) * o, m = a + (d >> 3) * o;
		e.drawImage(t, n + (d & 7) * o, r + (d >> 3) * o, o, o, p, m, o, o), e.save(), e.globalCompositeOperation = "multiply", e.translate(p + o / 2, m + o / 2), f === 0 ? e.drawImage(u.src, -o / 2, -o / 2, o, o) : (e.rotate(Di[l.dir[d]]), e.drawImage(u.ray[Math.min(8, f)], -o / 2, -o / 2, o, o)), e.restore();
	}
	e.save(), e.globalCompositeOperation = "lighter";
	let p = o * ai;
	for (let t = 0; t < 64; t++) {
		let n = l.d[t];
		n < 0 || (t & 7) >= s || t >> 3 >= c || (e.globalAlpha = Jr(n), e.drawImage(u.bloom, i + ((t & 7) + .5) * o - p / 2, a + ((t >> 3) + .5) * o - p / 2, p, p));
	}
	for (let t = 0; t < 64; t++) for (let n = 0; n < 4; n++) {
		let r = l.rim[t * 4 + n];
		if (r < 0) continue;
		let s = i + ((t & 7) + .5) * o, c = a + ((t >> 3) + .5) * o;
		e.globalAlpha = Yr(r);
		{
			let r = o * .43 * Ni * (d(t) ? 1.07 : 1);
			e.save(), e.translate(s, c - (d(t) ? 0 : o * .02)), e.rotate(Di[n]), e.drawImage(u.rim, -r / 2, -r / 2, r, r), e.restore();
		}
	}
	if (e.globalAlpha = 1, f) for (let t = 0; t < 64; t++) {
		if (l.d[t] !== 0) continue;
		let n = i + ((t & 7) + .5) * o, r = a + ((t >> 3) + .5) * o, s = o * Mi * 2;
		e.drawImage(u.pool, n - s / 2, r - s / 2, s, s);
	}
	e.restore();
}
//#endregion
//#region src/render/wick.ts
var Ri = "#3B2C45";
function zi(e, t, n, r = 0) {
	let i = t / 2, a = t / 2, o = t / 26, s = e.createRadialGradient(i, a + 1.5 * o, 0, i, a + 1.5 * o, t * .5);
	s.addColorStop(0, "rgba(255,236,196,0.62)"), s.addColorStop(.6, "rgba(255,232,186,0.4)"), s.addColorStop(1, "rgba(255,232,186,0)"), e.fillStyle = s, e.fillRect(0, 0, t, t);
	let c = 4.6 * o, l = a + 2 * o, u = r * 1.3 * o, d = (t, n, r, i, a) => {
		e.fillStyle = a, e.beginPath(), e.ellipse(t, n, r, i, 0, 0, Math.PI * 2), e.fill();
	}, f = (t) => {
		e.lineWidth = t, e.strokeStyle = Ri, e.lineCap = "round", e.stroke();
	}, p = (t) => {
		e.globalAlpha = t;
		for (let e of [-1, 1]) d(i + e * 7.6 * o, l + 3.9 * o, 2.4 * o, 1.35 * o, "#F28C8C");
		e.globalAlpha = 1;
	};
	if (n === "happy") {
		p(.9);
		for (let t of [-1, 1]) e.beginPath(), e.moveTo(i + t * c - 2 * o, l + .7 * o), e.quadraticCurveTo(i + t * c, l - 2.2 * o, i + t * c + 2 * o, l + .7 * o), f(1.5 * o);
		e.beginPath(), e.moveTo(i - 1.4 * o, l + 3.2 * o), e.quadraticCurveTo(i, l + 5 * o, i + 1.4 * o, l + 3.2 * o), f(1.2 * o);
	} else if (n === "worried") {
		p(.5);
		for (let e of [-1, 1]) d(i + e * c + u, l + .4 * o, 1.45 * o, 1.45 * o, Ri);
		e.beginPath(), e.moveTo(i - c - 2.2 * o, l - 2.6 * o), e.lineTo(i - c + 1.8 * o, l - 3.8 * o), e.moveTo(i + c - 1.8 * o, l - 3.8 * o), e.lineTo(i + c + 2.2 * o, l - 2.6 * o), e.moveTo(i - 2 * o, l + 4 * o), e.quadraticCurveTo(i - 1 * o, l + 3 * o, i, l + 4 * o), e.quadraticCurveTo(i + 1 * o, l + 5 * o, i + 2 * o, l + 4 * o), f(1.1 * o);
	} else if (n === "sleepy") {
		p(.5);
		for (let t of [-1, 1]) e.beginPath(), e.moveTo(i + t * c - 1.9 * o, l), e.quadraticCurveTo(i + t * c, l + 1.8 * o, i + t * c + 1.9 * o, l), f(1.3 * o);
	} else {
		p(.75);
		for (let e of [-1, 1]) d(i + e * c + u, l, 1.55 * o, 1.95 * o, Ri), d(i + e * c + u + .55 * o, l - .75 * o, .55 * o, .55 * o, "#FFFFFF");
		e.beginPath(), e.moveTo(i - 1 * o, l + 3.3 * o), e.quadraticCurveTo(i, l + 4.2 * o, i + 1 * o, l + 3.3 * o), f(1.05 * o);
	}
}
//#endregion
//#region src/web/board.ts
var Bi = (e, t) => {
	let n = document.createElement("canvas");
	return n.width = Math.max(1, Math.ceil(e)), n.height = Math.max(1, Math.ceil(t)), n;
}, Vi = class {
	constructor(e, t) {
		A(this, "level", void 0), A(this, "seed", void 0), A(this, "canvas", void 0), A(this, "ctx", void 0), A(this, "g", void 0), A(this, "base", void 0), A(this, "lit", void 0), A(this, "stamps", void 0), A(this, "shadow", void 0), A(this, "d", /* @__PURE__ */ new Int8Array(64)), A(this, "dir", /* @__PURE__ */ new Int8Array(64)), A(this, "rim", /* @__PURE__ */ new Int8Array(256)), A(this, "u", 1), this.level = e, this.seed = t, this.canvas = document.createElement("canvas"), this.ctx = this.canvas.getContext("2d");
	}
	layout(e, t) {
		let n = this.u = Math.min(3, Math.max(1, t)), { w: r, h: i } = this.level, a = Math.round(e * n), s = Math.round(8 * n), c = Math.round(14 * n), l = s, u = Math.floor((a - (l + c) * 2) / r), d = Math.max(3 * n, Math.round(u * .07)), f = Math.round((a - r * u) / 2), p = l + c, m = p * 2 + i * u + d;
		this.canvas.width = a, this.canvas.height = m, this.canvas.style.width = `${e}px`, this.canvas.style.height = `${m / n}px`;
		let h = Math.max(2, Math.round(3 * n));
		this.g = {
			cw: a,
			ch: m,
			gx: f,
			gy: p,
			cols: r,
			rows: i,
			cs: u,
			gap: h,
			wall: l,
			face: d,
			u: n,
			bulge: 2.5 * n,
			vig: 12 * n
		};
		let g = (e, t) => !o(this.level.stones, t * 8 + e);
		this.base = Bi(a, m);
		let _ = this.base.getContext("2d");
		xi(_, this.g, "daily", this.seed, g);
		for (let e = 0; e < 64; e++) {
			if ((e & 7) >= r || e >> 3 >= i || !o(this.level.stones, e)) continue;
			let t = f + ((e & 7) + .5) * u, n = p + ((e >> 3) + .5) * u, a = K(pr(`${this.seed}:${e}`));
			this.level.clues[e] === 255 ? zr(_, t, n - u * .02, u * .43, a) : Br(_, t, n, u, a);
		}
		this.lit = Bi(a, m), Si(this.lit.getContext("2d"), this.g, this.seed, g), this.stamps = Ii(u);
		let v = u * .72, y = u * .22;
		return this.shadow = Bi(v, y), ci(this.shadow.getContext("2d"), this.shadow.width, this.shadow.height), m / n;
	}
	cells() {
		let { gx: e, gy: t, cs: n, cols: r, rows: i } = this.g, a = [];
		for (let o = 0; o < i; o++) for (let i = 0; i < r; i++) a.push({
			i: o * 8 + i,
			x: (e + i * n) / this.u,
			y: (t + o * n) / this.u,
			s: n / this.u
		});
		return a;
	}
	draw(e, t, n, r = -1) {
		let { ctx: i, g: a } = this, { gx: s, gy: c, cs: l, cols: u, rows: d } = a;
		i.clearRect(0, 0, a.cw, a.ch), i.drawImage(this.base, 0, 0);
		let f = (t) => o(e.lanterns, t);
		Ai(u, d, (t) => o(e.stones, t), f, this.d, this.dir, this.rim), Li(i, this.lit, 0, 0, s, c, l, u, d, {
			d: this.d,
			dir: this.dir,
			rim: this.rim
		}, this.stamps, (t) => e.clues[t] !== 255);
		let p = wi(l).cy;
		for (let e of t.stones) Vr(i, s + ((e.cell & 7) + .5) * l, c + ((e.cell >> 3) + .5) * l + p, l, e.need, e.have > e.need ? "over" : e.need > 0 && e.have === e.need ? "warm" : "ink");
		let m = new Set(t.conflicts.flat()), h = Math.round(l * .92), g = Math.max(8, Math.round(Fr(h).bodyW * .92)), _ = n ? "happy" : "idle";
		for (let e = 0; e < 64; e++) {
			if (!f(e)) continue;
			let t = s + ((e & 7) + .5) * l, n = c + ((e >> 3) + .5) * l - l * .03;
			i.drawImage(this.shadow, t - this.shadow.width / 2, n + h * .37 - this.shadow.height / 2), i.save(), i.translate(t - h * .4, n - h * .56), Wr(i, h, 1), i.translate(h * .4 - g / 2, h * .56 - g / 2), zi(i, g, m.has(e) ? "worried" : _), i.restore(), i.save(), i.globalCompositeOperation = "lighter", i.translate(t, n - l * .02), i.scale(1, 1.15), i.globalAlpha = .6, Gr(i, 0, 0, l * .22, Kr.flame), i.restore();
		}
		let v = Math.round(l * .8);
		for (let [e, n] of t.conflicts) {
			let t = s + (((e & 7) + (n & 7)) / 2 + .5) * l, r = c + (((e >> 3) + (n >> 3)) / 2 + .5) * l;
			i.save(), i.translate(t - v / 2, r - v / 2), qr(i, v), i.restore();
		}
		r >= 0 && (i.save(), i.globalAlpha = .9, i.translate(s + ((r & 7) + .5) * l - h * .4, c + ((r >> 3) + .5) * l - l * .03 - h * .56), Ur(i, h), i.restore());
	}
};
//#endregion
//#region src/web/logic.ts
function Hi(e, t) {
	let n = on(t);
	return {
		date: t,
		n,
		asked: e !== null && Number.isInteger(e) && e >= 1 && e !== n ? e : null
	};
}
var Ui = "duskwick-web-v1", Wi = "duskwick-web-deep-v1", Gi = "duskwick-web-deep-intro", Ki = "duskwick-web-store";
function qi(e, t = []) {
	return {
		v: 1,
		date: e,
		moves: [],
		hints: 0,
		undos: 0,
		ms: 0,
		solved: !1,
		days: t
	};
}
function Ji(e, t) {
	let n = null;
	try {
		n = e ? JSON.parse(e) : null;
	} catch {
		n = null;
	}
	let r = Array.isArray(n?.days) ? n.days.filter((e) => typeof e == "string" && /^\d{4}-\d\d-\d\d$/.test(e)).slice(-400) : [];
	if (!n || n.v !== 1 || n.date !== t || !Array.isArray(n.moves)) return qi(t, r);
	let i = (e) => typeof e == "number" && Number.isFinite(e) && e >= 0 ? Math.floor(e) : 0;
	return {
		v: 1,
		date: t,
		moves: n.moves.filter((e) => Number.isInteger(e) && e >= 0 && e < 64),
		hints: i(n.hints),
		undos: i(n.undos),
		ms: i(n.ms),
		solved: n.solved === !0,
		days: r
	};
}
function Yi(e, t) {
	let n = yn.init("web", e);
	for (let e of t) n = yn.apply(n, {
		x: e & 7,
		y: e >> 3
	}) ?? n;
	return n;
}
function Xi(e, t) {
	let n = new Set(e), r = bn(t);
	n.has(t) || r--;
	let i = 0;
	for (; n.has(xn(r));) i++, r--;
	return i;
}
function Zi(e) {
	return {
		...e,
		solved: !0,
		days: e.days.includes(e.date) ? e.days : [...e.days, e.date].slice(-400)
	};
}
function Qi(e, t, n = {}) {
	let r = Xi(n.days ?? t.days, t.date);
	return Sn(e, {
		dateISO: t.date,
		seconds: Math.max(1, Math.round(t.ms / 1e3)),
		hints: t.hints,
		undos: t.undos,
		streak: n.deep ? r : Math.max(1, r)
	}, {
		showTime: !0,
		strip: n.strip ?? "",
		deep: n.deep === !0
	}).replace(/([?&])ct=share$/, "$1ct=web");
}
function $i(e) {
	return typeof e != "string" || !/^https:\/\/apps\.apple\.com\//.test(e) ? null : /[?&]ct=/.test(e) ? e : `${e}${e.includes("?") ? "&" : "?"}ct=web_daily`;
}
//#endregion
//#region src/web/words.ts
var ea = {
	"//": "Store screenshot captions. Every line only claims what the 1.0 build shows (App Review 2.3.3 / 2.3.7): lantern faces are on by default; the rules are the in-app rules; the postcard, streak, shields, village (5 residents), letters, gifts, cottage decorating, Today's puzzle and the settings (dot numbers, sound, vibration) are in the build. No timer claim (the postcard shows the time); 'no rush' instead. Terms follow docs/i18n-glossary.md. Non-en/ko lines are AI drafts: native review before upload.",
	"//changes": "Full-village build (2026-10-18): en-US 04 (7 residents, autumn night, market stall), 05 (furnished cottage, drawer without the dialogue card) and 06 (Pip's letter) re-captured. Other locales: re-capture all 8 with make-store.sh (their 04 sub still says nothing about the count; update it to 7 when translating).",
	shots: [
		"board-mid",
		"rules",
		"daily-done",
		"village",
		"room",
		"letter",
		"daily-mid",
		"settings"
	],
	en: {
		dir: "en-US",
		font: "latin",
		c: [
			["A tiny friend in every lantern", "Calm lantern logic puzzles"],
			[
				"Place lanterns. Light every tile.",
				"",
				[
					"Light runs along rows and columns",
					"Lanterns must not see each other",
					"Numbers count the lanterns beside them"
				]
			],
			["Collect a postcard every day", "Keep your streak glowing"],
			["Friends move into your village", "Seven lantern friends move in as you play"],
			["Decorate your cottage", "Every gift finds a spot"],
			["Letters and little gifts", "from your lantern friends"],
			["A new puzzle every day", "Today's puzzle is the same for everyone"],
			["Calm, offline, your way", "No rush · No lives · Dot numbers"]
		]
	},
	ko: {
		dir: "ko",
		font: "ko",
		c: [
			["등불마다 작은 친구가 살아요", "차분한 등불 로직 퍼즐"],
			[
				"등불을 놓아 모든 칸을 밝혀요",
				"",
				[
					"빛은 가로세로로 뻗어요",
					"등불끼리 마주 보면 안 돼요",
					"숫자는 바로 옆 등불의 수예요"
				]
			],
			["매일 엽서 한 장을 모아요", "연속 기록을 환하게 이어 가요"],
			["마을에 친구들이 이사 와요", "플레이할수록 이웃이 늘어요"],
			["나만의 오두막을 꾸며요", "선물마다 꼭 맞는 자리가 있어요"],
			["친구들의 편지와 작은 선물", "등불 친구들이 보내요"],
			["매일 새로운 오늘의 퍼즐", "모두가 같은 퍼즐을 풀어요"],
			["차분하게, 오프라인으로, 내 방식대로", "서두를 필요 없음 · 목숨 없음 · 숫자를 점으로도"]
		]
	},
	ja: {
		dir: "ja",
		font: "ja",
		c: [
			["ランタンごとに小さな友だち", "おだやかなランタン・ロジックパズル"],
			[
				"ランタンを置いて全マスを照らそう",
				"",
				[
					"光はたて・よこにのびます",
					"ランタン同士が見えてはだめ",
					"数字はとなりのランタンの数"
				]
			],
			["毎日1枚、はがきを集めよう", "連続記録をあかるくつなごう"],
			["村に友だちが引っ越してくる", "遊ぶほどご近所さんが増えます"],
			["自分の小屋をかざろう", "贈り物はぜんぶお部屋に"],
			["お手紙と小さな贈り物", "ランタンの友だちから届きます"],
			["毎日あたらしい今日のパズル", "みんなが同じ1問を解きます"],
			["のんびり、オフラインで、自分のペースで", "急がなくていい・ライフなし・ドット数字"]
		]
	},
	de: {
		dir: "de",
		font: "latin",
		c: [
			["In jeder Laterne ein kleiner Freund", "Ruhige Laternen-Logikrätsel"],
			[
				"Laternen setzen. Jedes Feld erhellen.",
				"",
				[
					"Licht fällt entlang Reihen und Spalten",
					"Laternen dürfen sich nicht sehen",
					"Zahlen zählen die Laternen daneben"
				]
			],
			["Jeden Tag eine Postkarte", "Halte deine Serie am Leuchten"],
			["Freunde ziehen in dein Dorf", "Neue Nachbarn, während du spielst"],
			["Richte deine Hütte ein", "Jedes Geschenk findet seinen Platz"],
			["Briefe und kleine Geschenke", "von deinen Laternenfreunden"],
			["Jeden Tag ein neues Rätsel", "Das Rätsel des Tages ist für alle gleich"],
			["Ruhig, offline, wie du magst", "Keine Eile · Keine Leben · Zahlen als Punkte"]
		]
	},
	fr: {
		dir: "fr",
		font: "latin",
		c: [
			["Un petit compagnon dans chaque lanterne", "Des énigmes de logique tout en douceur"],
			[
				"Posez des lanternes. Éclairez chaque case.",
				"",
				[
					"La lumière suit lignes et colonnes",
					"Deux lanternes ne doivent pas se voir",
					"Les chiffres comptent les lanternes voisines"
				]
			],
			["Une carte postale chaque jour", "Gardez votre série allumée"],
			["Des amis s’installent au village", "De nouveaux voisins au fil du jeu"],
			["Décorez votre cabane", "Chaque cadeau trouve sa place"],
			["Lettres et petits cadeaux", "de vos amis lanternes"],
			["Une nouvelle énigme chaque jour", "L’énigme du jour est la même pour tous"],
			["Calme, hors ligne, à votre façon", "Sans hâte · Sans vies · Points au lieu de chiffres"]
		]
	},
	es: {
		dir: "es",
		font: "latin",
		c: [
			["Un amiguito en cada farol", "Acertijos de lógica tranquilos"],
			[
				"Coloca faroles. Ilumina cada casilla.",
				"",
				[
					"La luz recorre filas y columnas",
					"Los faroles no deben verse entre sí",
					"Los números cuentan los faroles de al lado"
				]
			],
			["Una postal cada día", "Mantén encendida tu racha"],
			["Tus amigos se mudan al pueblo", "Nuevos vecinos mientras juegas"],
			["Decora tu cabaña", "Cada regalo encuentra su lugar"],
			["Cartas y pequeños regalos", "de tus amigos farol"],
			["Un acertijo nuevo cada día", "El Acertijo del día es igual para todos"],
			["Tranquilo, sin conexión, a tu manera", "Sin prisas · Sin vidas · Puntos en vez de números"]
		]
	},
	"pt-BR": {
		dir: "pt-BR",
		font: "latin",
		c: [
			["Um amiguinho em cada lanterna", "Quebra-cabeças de lógica tranquilos"],
			[
				"Coloque lanternas. Ilumine cada quadrado.",
				"",
				[
					"A luz segue linhas e colunas",
					"Lanternas não podem se ver",
					"Os números contam as lanternas ao lado"
				]
			],
			["Um cartão-postal por dia", "Mantenha sua sequência acesa"],
			["Amigos se mudam para a sua vila", "Novos vizinhos enquanto você joga"],
			["Decore a sua cabana", "Cada presente encontra seu lugar"],
			["Cartas e presentinhos", "dos seus amigos lanterna"],
			["Um quebra-cabeça novo por dia", "O quebra-cabeça do dia é igual para todos"],
			["Calmo, offline, do seu jeito", "Sem pressa · Sem vidas · Pontos no lugar de números"]
		]
	},
	it: {
		dir: "it",
		font: "latin",
		c: [
			["Un piccolo amico in ogni lanterna", "Enigmi di logica rilassanti"],
			[
				"Posa le lanterne. Illumina ogni casella.",
				"",
				[
					"La luce segue righe e colonne",
					"Le lanterne non devono vedersi",
					"I numeri contano le lanterne accanto"
				]
			],
			["Una cartolina ogni giorno", "Tieni accesa la tua serie"],
			["Gli amici si trasferiscono nel borgo", "Nuovi vicini mentre giochi"],
			["Arreda la tua casetta", "Ogni regalo trova il suo posto"],
			["Lettere e piccoli regali", "dai tuoi amici lanterna"],
			["Un nuovo enigma ogni giorno", "L’enigma del giorno è uguale per tutti"],
			["Calmo, offline, a modo tuo", "Senza fretta · Senza vite · Puntini al posto dei numeri"]
		]
	},
	"zh-Hans": {
		dir: "zh-Hans",
		font: "zh-Hans",
		c: [
			["每盏灯笼里都住着小伙伴", "治愈的灯笼逻辑谜题"],
			[
				"放下灯笼，照亮每一格",
				"",
				[
					"光沿着横竖方向照亮",
					"灯笼之间不能互相看见",
					"数字是旁边灯笼的数量"
				]
			],
			["每天收集一张明信片", "让连续记录一直亮着"],
			["朋友们搬进你的小镇", "越玩邻居越多"],
			["布置你的小屋", "每份礼物都有它的位置"],
			["朋友寄来的信和小礼物", "来自灯笼小伙伴"],
			["每天一道新谜题", "今日谜题，所有人都是同一题"],
			["安静、离线、随你喜欢", "不赶时间 · 无体力限制 · 可用圆点数字"]
		]
	},
	"zh-Hant": {
		dir: "zh-Hant",
		font: "zh-Hant",
		c: [
			["每盞燈籠裡都住著一位好朋友", "療癒的燈籠邏輯謎題"],
			[
				"放下燈籠，照亮每一格",
				"",
				[
					"光沿著橫豎方向照亮",
					"燈籠之間不能互相看見",
					"數字是旁邊燈籠的數量"
				]
			],
			["每天收集一張明信片", "讓連續紀錄一直亮著"],
			["朋友們搬進你的小鎮", "越玩鄰居越多"],
			["布置你的小屋", "每份禮物都有它的位置"],
			["朋友寄來的信和小禮物", "來自你的燈籠朋友"],
			["每天一題新謎題", "今日謎題，所有人都是同一題"],
			["安靜、離線、隨你喜歡", "不趕時間 · 沒有體力限制 · 可用圓點數字"]
		]
	}
}, ta = {
	en: {
		asked: "This link was for #{a}. Today's puzzle is #{n}, the same for everyone.",
		tomorrow: "A new puzzle arrives tomorrow.",
		copied: "Copied. Paste it anywhere.",
		soon: "Coming soon to the App Store",
		store: "Download on the App Store",
		start: "Tap a tile to place a lantern.",
		deep: "Deep night",
		deepSub: "One more puzzle tonight, a little deeper.",
		deepRule: "Picture a lantern on a tile. If a number or a dark tile is then stuck, the lantern can’t go there.",
		inApp: "Have the app? Continue there"
	},
	ko: {
		asked: "이 링크는 #{a} 퍼즐이에요. 오늘의 퍼즐은 #{n}, 모두가 같은 퍼즐을 풀어요.",
		tomorrow: "내일 새 퍼즐이 와요.",
		copied: "복사했어요. 어디든 붙여 넣으세요.",
		soon: "곧 App Store에서 만나요",
		store: "App Store에서 받기",
		start: "칸을 누르면 등불을 놓아요.",
		deep: "깊은 밤",
		deepSub: "오늘 밤 한 판 더, 조금 더 깊게.",
		deepRule: "칸에 등불을 놓았다고 그려 보세요. 그러면 숫자나 어두운 칸이 막힌다면, 그 등불은 거기 갈 수 없어요.",
		inApp: "앱이 있다면 앱에서 이어 하기"
	},
	ja: {
		asked: "このリンクは#{a}のパズルです。今日のパズルは#{n}、みんな同じ1問です。",
		tomorrow: "明日、新しいパズルが届きます。",
		copied: "コピーしました。どこにでも貼り付けられます。",
		soon: "App Storeで近日公開",
		store: "App Storeでダウンロード",
		start: "マスをタップするとランタンを置けます。",
		deep: "深い夜",
		deepSub: "今夜もう1問、少しだけ深く。",
		deepRule: "マスにランタンを置いたと思いうかべてください。数字か暗いマスが行き詰まるなら、そこには置けません。",
		inApp: "アプリがあれば、アプリで続ける"
	},
	de: {
		asked: "Dieser Link war für #{a}. Das Rätsel des Tages ist #{n}, für alle gleich.",
		tomorrow: "Morgen kommt ein neues Rätsel.",
		copied: "Kopiert. Füge es überall ein.",
		soon: "Bald im App Store",
		store: "Laden im App Store",
		start: "Tippe auf ein Feld, um eine Laterne zu setzen.",
		deep: "Tiefe Nacht",
		deepSub: "Noch ein Rätsel heute Nacht, etwas tiefer.",
		deepRule: "Stell dir eine Laterne auf einem Feld vor. Steckt dann eine Zahl oder ein dunkles Feld fest, gehört sie nicht dorthin.",
		inApp: "Du hast die App? Dort weitermachen"
	},
	fr: {
		asked: "Ce lien était pour le #{a}. L’énigme du jour est le #{n}, la même pour tous.",
		tomorrow: "Une nouvelle énigme arrive demain.",
		copied: "Copié. Collez-le où vous voulez.",
		soon: "Bientôt sur l’App Store",
		store: "Télécharger dans l’App Store",
		start: "Touchez une case pour poser une lanterne.",
		deep: "Nuit profonde",
		deepSub: "Une énigme de plus ce soir, un peu plus profonde.",
		deepRule: "Imaginez une lanterne sur une case. Si un chiffre ou une case sombre n’a alors plus d’issue, la lanterne ne va pas là.",
		inApp: "Vous avez l’app\xA0? Continuez-y"
	},
	es: {
		asked: "Este enlace era para el #{a}. El acertijo del día es el #{n}, igual para todos.",
		tomorrow: "Mañana llega un acertijo nuevo.",
		copied: "Copiado. Pégalo donde quieras.",
		soon: "Muy pronto en el App Store",
		store: "Descargar en el App Store",
		start: "Toca una casilla para colocar un farol.",
		deep: "Noche profunda",
		deepSub: "Un acertijo más esta noche, un poco más hondo.",
		deepRule: "Imagina un farol en una casilla. Si un número o una casilla oscura se queda sin salida, ese farol no va ahí.",
		inApp: "¿Tienes la app? Sigue allí"
	},
	"pt-BR": {
		asked: "Este link era do #{a}. O quebra-cabeça do dia é o #{n}, igual para todos.",
		tomorrow: "Amanhã chega um quebra-cabeça novo.",
		copied: "Copiado. Cole onde quiser.",
		soon: "Em breve na App Store",
		store: "Baixar na App Store",
		start: "Toque em um quadrado para colocar uma lanterna.",
		deep: "Noite profunda",
		deepSub: "Mais um quebra-cabeça hoje à noite, um pouco mais fundo.",
		deepRule: "Imagine uma lanterna em um quadrado. Se um número ou um quadrado escuro ficar sem saída, ela não vai ali.",
		inApp: "Tem o app? Continue nele"
	},
	it: {
		asked: "Questo link era per il #{a}. L’enigma del giorno è il #{n}, uguale per tutti.",
		tomorrow: "Domani arriva un nuovo enigma.",
		copied: "Copiato. Incollalo dove vuoi.",
		soon: "Presto su App Store",
		store: "Scarica su App Store",
		start: "Tocca una casella per posare una lanterna.",
		deep: "Notte fonda",
		deepSub: "Un altro enigma stanotte, un po’ più profondo.",
		deepRule: "Immagina una lanterna su una casella. Se un numero o una casella buia resta senza via d’uscita, la lanterna lì non va.",
		inApp: "Hai l’app? Continua lì"
	},
	"zh-Hans": {
		asked: "这个链接是第 {a} 期。今日谜题是第 {n} 期，所有人都是同一题。",
		tomorrow: "明天会有新的谜题。",
		copied: "已复制，可以粘贴到任何地方。",
		soon: "即将登陆 App Store",
		store: "在 App Store 下载",
		start: "点一下格子，就能放下灯笼。",
		deep: "深夜",
		deepSub: "今晚再来一题，更深一点。",
		deepRule: "想象在一格放下灯笼：如果某个数字或暗格因此再也无解，那里就不能放灯笼。",
		inApp: "已有 App？在 App 里继续"
	},
	"zh-Hant": {
		asked: "這個連結是第 {a} 期。今日謎題是第 {n} 期，所有人都是同一題。",
		tomorrow: "明天會有新的謎題。",
		copied: "已複製，可以貼到任何地方。",
		soon: "即將登上 App Store",
		store: "在 App Store 下載",
		start: "點一下格子，就能放下燈籠。",
		deep: "深夜",
		deepSub: "今晚再來一題，更深一點。",
		deepRule: "想像在一格放下燈籠：如果某個數字或暗格因此再也無解，那裡就不能放燈籠。",
		inApp: "已有 App？在 App 裡繼續"
	}
};
function na(e) {
	let t = sr(e), n = ea[t]?.c ?? ea.en.c, r = (e, t) => t ? e.replace(/\{(\w+)\}/g, (e, n) => n in t ? String(t[n]) : e) : e;
	return {
		lang: t,
		t: (e, n) => ur(t, e, n),
		web: (e, n) => r(ta[t][e], n),
		rules: {
			head: n[1][0],
			lines: n[1][2] ?? []
		},
		pitch: [[n[0][0], n[0][1]], [n[3][0], n[3][1]]]
	};
}
H.filter((e) => e in ta && e in ar);
//#endregion
//#region src/web/main.ts
var ra = "\n.dw{max-width:440px;margin:0 auto 24px;color:inherit;font:inherit}\n.dw-note{font-size:.95em;opacity:.85;margin:0 0 8px}\n.dw-title{margin:0;font-size:1.5em;line-height:1.3}\n.dw-sub{margin:2px 0 10px;opacity:.8}\n.dw-rules{margin:0 0 12px;padding-left:1.2em;font-size:.95em;line-height:1.45}\n.dw-stage{position:relative;background:#141228;border-radius:18px;overflow:hidden;touch-action:manipulation}\n.dw-stage canvas{display:block}\n.dw-cell{position:absolute;margin:0;padding:0;border:0;background:transparent;cursor:pointer;border-radius:8px;-webkit-tap-highlight-color:transparent}\n.dw-cell:focus-visible{outline:3px solid #FFC864;outline-offset:-3px}\n.dw-cell[aria-disabled=true]{cursor:default}\n.dw-bar{display:flex;gap:10px;justify-content:center;margin:12px 0 4px}\n.dw-btn{font:inherit;font-size:1em;min-height:44px;padding:0 20px;border-radius:999px;border:2px solid currentColor;background:transparent;color:inherit;cursor:pointer}\n.dw-btn.dw-main{background:var(--accent,#FFC864);border-color:var(--accent,#FFC864);color:var(--on,#1E1A33);font-weight:700}\n.dw-btn[disabled]{opacity:.4;cursor:default}\n.dw-done{margin-top:14px;padding:16px;border-radius:16px;background:rgba(255,200,100,.12);text-align:center}\n.dw-done h2{margin:0 0 4px;padding:0;border:0;font-size:1.3em}\n.dw-stats{margin:0 0 12px;font-size:1.1em}\n.dw-small{font-size:.9em;opacity:.8;margin:8px 0 0}\n.dw-pitch{margin:14px 0 8px;line-height:1.4}\n.dw-streak{margin:0 0 12px}\n.dw-deep{display:block;margin:14px auto 4px;padding:12px 16px;max-width:320px;border-radius:14px;background:#1E1A33;color:#F4EBD0;text-decoration:none}\n.dw-deep strong{display:block;font-size:1.1em}\n.dw-card{padding:20px 18px;border-radius:18px;background:#1E1A33;color:#F4EBD0;text-align:center}\n.dw-card h2{margin:0 0 8px;padding:0;border:0;font-size:1.3em}\n.dw-card p{margin:0 0 16px;line-height:1.45}\n.dw-links{display:flex;flex-direction:column;align-items:center;gap:8px;margin-top:8px}\n.dw-links a{display:inline-flex;align-items:center;text-decoration:none}\n.dw [hidden]{display:none!important}\n.dw-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}\n";
function ia(e = /* @__PURE__ */ new Date()) {
	return `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`;
}
var aa = {
	get(e) {
		try {
			return localStorage.getItem(e);
		} catch {
			return null;
		}
	},
	set(e, t) {
		try {
			localStorage.setItem(e, t);
		} catch {}
	}
};
function $(e, t = "", n = "") {
	let r = document.createElement(e);
	return t && (r.className = t), n && (r.textContent = n), r;
}
function oa(e, t = new URLSearchParams(location.search).has("deep")) {
	let n = na([...navigator.languages ?? [], navigator.language]), r = Hi(e.dataset.n ? Number(e.dataset.n) : null, ia()), i = t ? St(r.date) : bt(r.date), a = t ? Wi : Ui, s = Ji(aa.get(a), r.date), c = t ? Ji(aa.get(Ui), r.date).days : null, l = () => c ?? s.days, u = (e = "") => Qi(i, s, {
		strip: e,
		deep: t,
		days: l()
	}), d = Yi(i, s.moves), f = -1, p = new Vi(i, `${t ? "web-deep" : "web"}:${r.date}`), m = $("style");
	m.textContent = ra, document.head.appendChild(m);
	let h = $("section", "dw");
	h.lang = n.lang, r.asked !== null && h.appendChild($("p", "dw-note", n.web("asked", {
		a: r.asked,
		n: r.n
	})));
	let g = $("h1", "dw-title", u().split("\n")[0]);
	h.append(g, $("p", "dw-sub", t ? n.web("deep") : n.t("daily")));
	let _ = $("ul", "dw-rules");
	for (let e of [...n.rules.lines, n.web("start")]) _.appendChild($("li", "", e));
	h.appendChild(_);
	let v = $("div", "dw-stage");
	v.setAttribute("role", "group"), v.setAttribute("aria-label", n.t("board", {
		rows: i.h,
		cols: i.w
	})), v.appendChild(p.canvas), p.canvas.setAttribute("aria-hidden", "true"), h.appendChild(v);
	let y = $("div", "dw-bar"), b = $("button", "dw-btn", n.t("undo")), x = $("button", "dw-btn", n.t("hint"));
	if (y.append(b, x), h.appendChild(y), t && !s.solved && aa.get("duskwick-web-deep-intro") !== "1") {
		let e = $("div", "dw-card"), t = $("button", "dw-btn dw-main", n.t("daily.offerYes"));
		e.append($("h2", "", `🌙 ${n.web("deep")}`), $("p", "", n.web("deepRule")), t), v.before(e), v.hidden = y.hidden = !0, t.addEventListener("click", () => {
			aa.set(Gi, "1"), e.remove(), v.hidden = y.hidden = !1, te(), D[0]?.b.focus();
		});
	}
	let S = $("div", "dw-done");
	S.hidden = !0, h.appendChild(S);
	let C = $("p", "dw-sr");
	C.setAttribute("aria-live", "polite"), h.appendChild(C), e.replaceChildren(h);
	let w = 0, T = () => {
		w && (s.ms += Date.now() - w), w = !s.solved && s.moves.length && document.visibilityState === "visible" ? Date.now() : 0;
	}, E = () => {
		T(), aa.set(a, JSON.stringify(s));
	};
	document.addEventListener("visibilitychange", E), addEventListener("pagehide", E);
	let D = [], O = cr(n.lang), ee = (e, t) => {
		let r = n.t("cell.pos", {
			row: (e >> 3) + 1,
			col: (e & 7) + 1
		}), i = t.stones.find((t) => t.cell === e);
		if (i) {
			let e = i.need - i.have;
			return [
				r,
				n.t("cell.rockN", { n: i.need }),
				e === 0 ? n.t("cell.ok") : e > 0 ? n.t("cell.needs", { k: e }) : n.t("cell.over", { k: -e })
			].join(O);
		}
		return k(e) ? [r, n.t("cell.rock")].join(O) : o(d.lanterns, e) ? [r, t.conflicts.some(([t, n]) => t === e || n === e) ? n.t("cell.conflict") : n.t("cell.lantern")].join(O) : [r, t.lit[e] ? n.t("cell.lit") : n.t("cell.dark")].join(O);
	}, k = (e) => o(i.stones, e), A = () => {
		let e = Vt(i, d, s.moves);
		p.draw(d, e, s.solved, f);
		for (let { i: t, b: n } of D) n.setAttribute("aria-label", ee(t, e)), n.setAttribute("aria-disabled", String(s.solved || k(t)));
		b.disabled = s.solved || s.moves.length === 0, x.disabled = s.solved, s.solved && P();
	}, te = () => {
		let t = Math.min(440, v.parentElement?.clientWidth || e.clientWidth || 360);
		p.layout(t, devicePixelRatio || 1);
		for (let { b: e } of D) e.remove();
		D = p.cells().map((e) => {
			let t = $("button", "dw-cell");
			return t.type = "button", Object.assign(t.style, {
				left: `${e.x}px`,
				top: `${e.y}px`,
				width: `${e.s}px`,
				height: `${e.s}px`
			}), t.addEventListener("click", () => M(e.i)), v.appendChild(t), {
				i: e.i,
				b: t
			};
		}), A();
	}, j = (e) => {
		C.textContent = n.t(e);
	}, ne = (e, t) => {
		s = {
			...s,
			moves: [...s.moves, ...e]
		}, d = Yi(i, s.moves);
		let n = Vt(i, d, s.moves);
		n.complete ? (T(), s = Zi(s), f = -1, j("ann.solved")) : j(n.conflicts.length ? "ann.conflict" : t), E(), A();
	}, M = (e) => {
		s.solved || k(e) || (f = -1, ne([e], o(d.lanterns, e) ? "ann.removed" : "ann.placed"));
	};
	b.addEventListener("click", () => {
		!s.solved && s.moves.length && (s = {
			...s,
			moves: s.moves.slice(0, -1),
			undos: s.undos + 1
		}, d = Yi(i, s.moves), f = -1, E(), j("ann.undone"), A());
	}), x.addEventListener("click", () => {
		if (s.solved) return;
		let e = tn(i, d, s.moves[s.moves.length - 1], s.moves);
		e.kind !== "none" && (s = {
			...s,
			hints: s.hints + 1
		}, e.kind === "removeWrong" ? (f = -1, ne(e.cells, "ann.hint")) : (f = e.cell, j("ann.hint"), E(), A()));
	});
	let N = !1;
	function P() {
		if (N) return;
		N = !0;
		let e = u(On(i, s.moves)), a = e.split("\n");
		g.textContent = a[0], S.replaceChildren($("h2", "", n.t("ann.solved")));
		for (let e of a.slice(1, -1)) S.appendChild($("p", "dw-stats", e.replace(/ 🔥\d+$/, "")));
		t || S.appendChild($("p", "dw-streak", `${n.t("res.streakLbl")} 🔥${Xi(s.days, s.date)}`));
		let o = $("button", "dw-btn dw-main", n.t("share")), c = $("p", "dw-small");
		if (c.setAttribute("aria-live", "polite"), o.addEventListener("click", async () => {
			try {
				if (navigator.share) {
					await navigator.share({ text: e });
					return;
				}
			} catch (e) {
				if (e?.name === "AbortError") return;
			}
			try {
				await navigator.clipboard.writeText(e), c.textContent = n.web("copied");
			} catch {
				c.textContent = e;
			}
		}), S.append(o, c), !t) {
			let e = new URL(location.href);
			e.searchParams.delete("reset"), e.searchParams.set("deep", "");
			let t = $("a", "dw-deep");
			t.href = e.search.replace("deep=", "deep"), t.append($("strong", "", `🌙 ${n.web("deep")}`), $("span", "", n.web("deepSub"))), S.appendChild(t);
		}
		S.appendChild($("p", "dw-small", n.web("tomorrow")));
		let d = $("p", "dw-pitch");
		for (let [e, t] of n.pitch) d.append($("strong", "", e), document.createElement("br"), $("span", "", t), document.createElement("br"));
		S.appendChild(d);
		let f = $i(globalThis.APP_STORE_URL);
		if (f) {
			let e = $("div", "dw-links"), t = $("a", "dw-btn dw-main", n.web("store"));
			t.href = f;
			let i = $("a", "dw-btn", n.web("inApp"));
			i.href = `duskwick://today?w=${kn(l(), r.date)}`, i.hidden = aa.get(Ki) !== "1", t.addEventListener("click", () => {
				aa.set(Ki, "1"), i.hidden = !1;
			}), e.append(t, i), S.appendChild(e);
		} else S.appendChild($("p", "dw-small", n.web("soon")));
		S.hidden = !1;
	}
	let re = 0;
	addEventListener("resize", () => {
		let e = v.parentElement?.clientWidth ?? 0;
		Math.abs(e - re) > 8 && (re = e, te());
	}), te(), re = v.parentElement?.clientWidth ?? 0, T(), globalThis.__dw = {
		date: r.date,
		n: r.n,
		deep: t,
		level: i,
		save: () => s
	};
}
var sa = document.getElementById("dw-play");
sa && oa(sa);
//#endregion
export { oa as mount };
