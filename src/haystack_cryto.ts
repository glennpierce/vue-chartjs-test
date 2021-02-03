/* tslint:disable */

//
// Copyright (c) 2017, SkyFoundry LLC
// Licensed under the Academic Free License version 3.0
//
// History:
//   5 July 2017 Hank Weber Creation
//

/*
   * Main sha256 function, with its support functions
   */
function sha256_S(X: any, n: any) { return (X >>> n) | (X << (32 - n)); }
function sha256_R(X: any, n: any) { return (X >>> n); }
function sha256_Ch(x: any, y: any, z: any) { return ((x & y) ^ ((~x) & z)); }
function sha256_Maj(x: any, y: any, z: any) { return ((x & y) ^ (x & z) ^ (y & z)); }
function sha256_Sigma0256(x: any) { return (sha256_S(x, 2) ^ sha256_S(x, 13) ^ sha256_S(x, 22)); }
function sha256_Sigma1256(x: any) { return (sha256_S(x, 6) ^ sha256_S(x, 11) ^ sha256_S(x, 25)); }
function sha256_Gamma0256(x: any) { return (sha256_S(x, 7) ^ sha256_S(x, 18) ^ sha256_R(x, 3)); }
function sha256_Gamma1256(x: any) { return (sha256_S(x, 17) ^ sha256_S(x, 19) ^ sha256_R(x, 10)); }
function sha256_Sigma0512(x: any) { return (sha256_S(x, 28) ^ sha256_S(x, 34) ^ sha256_S(x, 39)); }
function sha256_Sigma1512(x: any) { return (sha256_S(x, 14) ^ sha256_S(x, 18) ^ sha256_S(x, 41)); }
function sha256_Gamma0512(x: any) { return (sha256_S(x, 1) ^ sha256_S(x, 8) ^ sha256_R(x, 7)); }
function sha256_Gamma1512(x: any) { return (sha256_S(x, 19) ^ sha256_S(x, 61) ^ sha256_R(x, 6)); }

const sha256_K = new Array
  (
    1116352408, 1899447441, -1245643825, -373957723, 961987163, 1508970993,
    -1841331548, -1424204075, -670586216, 310598401, 607225278, 1426881987,
    1925078388, -2132889090, -1680079193, -1046744716, -459576895, -272742522,
    264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
    -1740746414, -1473132947, -1341970488, -1084653625, -958395405, -710438585,
    113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
    1695183700, 1986661051, -2117940946, -1838011259, -1564481375, -1474664885,
    -1035236496, -949202525, -778901479, -694614492, -200395387, 275423344,
    430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
    1537002063, 1747873779, 1955562222, 2024104815, -2067236844, -1933114872,
    -1866530822, -1538233109, -1090935817, -965641998,
  );


// /**
// * Obtain a derived key using PBKDF2 with HMAC-SHA256 as the PRF.
// *
// * @param {string} key - The password to obtain a derived key for
// * @param {string} salt - The salt
// * @param {number} iterations - The number of iterations to apply
// * @param {number} dkLen - The desired length of the derived key in bytes
// * @returns {string} - The derived key. It is a raw string of dkLen bytes.
// */
export class HaystackCrypto {

  // Base64 table
  private tab = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  public nonce(len: number) {
    if (len == null) { len = 24; }
    let text = '';
    const possible = this.tab;
    for (let i = 0; i < len; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  // calculate xor of two raw strings. The result is a raw string.
  public xor(a: string, b: string) {
    const aw = this.rstr2binb(a);
    const bw = this.rstr2binb(b);
    if (aw.length !== bw.length) { throw new Error('Lengths don\'t match'); }
    for (let i = 0; i < aw.length; ++i) {
      aw[i] ^= bw[i];
    }
    return this.binb2rstr(aw);
  }

  /*
    * Convert a raw string to a hex string
    */
  public rstr2hex(input: string) {
    const hexcase = 0;
    const hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef';
    let output = '';
    let x;
    for (let i = 0; i < input.length; i++) {
      x = input.charCodeAt(i);
      output += hex_tab.charAt((x >>> 4) & 0x0F)
        + hex_tab.charAt(x & 0x0F);
    }
    return output;
  }

  /*
   * Convert a raw string to a base-64 string
   */
  public rstr2b64(input: string) {
    const b64pad = '=';
    const tab = this.tab; // "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let output = '';
    const len = input.length;
    for (let i = 0; i < len; i += 3) {
      const triplet = (input.charCodeAt(i) << 16)
        | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0)
        | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
      for (let j = 0; j < 4; j++) {
        if (i * 8 + j * 6 > input.length * 8) { output += b64pad; } else { output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F); }
      }
    }
    return output;
  }

  //
  // Convert a raw string to base64uri with no padding
  public rstr2b64uri(input: string) {
    return this.rstr2b64(input)
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  /*
    * Decode a base64uri to a raw string.
    */
  public b64uri2rstr(input: string) {
    return window.atob(input.replace(/\-/g, '+').replace(/_/g, '/'));
  }

  /*
   * Encode a string as utf-8.
   * For efficiency, this assumes the input is valid utf-16.
   */
  public str2rstr_utf8(input: string) {
    return unescape(encodeURIComponent(input));
  }

  /*
    * Convert a raw string to an array of big-endian words
    * Characters >255 have their high-byte silently ignored.
    */
  public rstr2binb(input: string) {
    const output = Array(input.length >> 2);
    for (let i = 0; i < output.length; i++) {
      output[i] = 0;
    }
    for (let i = 0; i < input.length * 8; i += 8) {
      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
    }
    return output;
  }

  /*
    * Convert an array of big-endian words to a string
    */
  public binb2rstr(input: any) {
    let output = '';
    for (let i = 0; i < input.length * 32; i += 8) {
      output += String.fromCharCode((input[i >> 5] >>> (24 - i % 32)) & 0xFF);
    }
    return output;
  }


  /**
   * Calculate the SHA1 hash of data if key is undefined. Otherwise,
   * calculate the HMAC-SHA1 of the data using key. A raw string of
   * the hash is returned.
   */
  public sha1(data: string, key: string) {
    let hash;
    data = this.str2rstr_utf8(data);
    if (key === undefined) { hash = this.rstr_sha1(data); } else {
      key = this.str2rstr_utf8(key);
      hash = this.rstr_hmac_sha1(key, data);
    }
    return hash;
  }


  /*
  * Calculate the SHA256 of a raw string
  */
  public rstr_sha256(s: string) {
    return this.binb2rstr(this.binb_sha256(this.rstr2binb(s), s.length * 8));
  }

  /*
   * Calculate the HMAC-SHA256 of a key and some data (raw strings)
   */
  public rstr_hmac_sha256(key: string, data: string) {
    let bkey = this.rstr2binb(key);
    if (bkey.length > 16) { bkey = this.binb_sha256(bkey, key.length * 8); }

    const ipad = Array(16);
    const opad = Array(16);
    for (let i = 0; i < 16; i++) {
      ipad[i] = bkey[i] ^ 0x36363636;
      opad[i] = bkey[i] ^ 0x5C5C5C5C;
    }

    const hash = this.binb_sha256(ipad.concat(this.rstr2binb(data)), 512 + data.length * 8);
    return this.binb2rstr(this.binb_sha256(opad.concat(hash), 512 + 256));
  }

  // /**
  //  * Calculate the SHA256 hash of data if key is undefined. Otherwise,
  //  * calculate the HMAC-SHA-256 of the data using key.
  //  * @param {string} data - The data to hash. Must be a raw string.
  //  * @param {string} key - (optional) the key to use for HMAC.
  //  *  Must be a raw string.
  //  * @returns {string} - the hash as a raw string.
  //  */
  public sha256(data: string, key?: string) {
    const self = this;
    let hash;
    if (key === undefined) {
      hash = self.rstr_sha256(data);
    } else {
      hash = self.rstr_hmac_sha256(key, data);
    }
    return hash;
  }

  public pbkdf2_hmac_sha256(key: string, salt: string, iterations: number, dkLen: number) {

    const self = this;

    const F = function F(P: any, S: any, c: any, i: any) {
      let U_r;
      let U_c;

      S = S + self.binb2rstr([i]);
      U_r = U_c = self.rstr_hmac_sha256(P, S);
      for (let iter = 1; iter < c; ++iter) {
        U_c = self.rstr_hmac_sha256(P, U_c);
        U_r = self.xor(U_r, U_c);
      }
      return U_r;
    };

    const hLen = 32; // sha256 output hash size in bytes
    const l = Math.ceil(dkLen / hLen);
    const r = dkLen - (l - 1) * hLen;
    let T = '';
    let block;

    for (let i = 1; i <= l; ++i) {
      block = F(key, salt, iterations, i);
      T += block;
    }

    return T.substr(0, dkLen);
  }

  public binb_sha256(m: any, l: number) {
    const HASH = new Array(1779033703, -1150833019, 1013904242, -1521486534,
      1359893119, -1694144372, 528734635, 1541459225);
    const W = new Array(64);
    let a, b, c, d, e, f, g, h;
    let i, j, T1, T2;

    /* append padding */
    m[l >> 5] |= 0x80 << (24 - l % 32);
    m[((l + 64 >> 9) << 4) + 15] = l;

    for (i = 0; i < m.length; i += 16) {
      a = HASH[0];
      b = HASH[1];
      c = HASH[2];
      d = HASH[3];
      e = HASH[4];
      f = HASH[5];
      g = HASH[6];
      h = HASH[7];

      for (j = 0; j < 64; j++) {
        if (j < 16) { W[j] = m[j + i]; } else {
          W[j] = this.safe_add(this.safe_add(this.safe_add(sha256_Gamma1256(W[j - 2]), W[j - 7]),
            sha256_Gamma0256(W[j - 15])), W[j - 16]);
        }

        T1 = this.safe_add(this.safe_add(this.safe_add(this.safe_add(h, sha256_Sigma1256(e)), sha256_Ch(e, f, g)),
          sha256_K[j]), W[j]);
        T2 = this.safe_add(sha256_Sigma0256(a), sha256_Maj(a, b, c));
        h = g;
        g = f;
        f = e;
        e = this.safe_add(d, T1);
        d = c;
        c = b;
        b = a;
        a = this.safe_add(T1, T2);
      }

      HASH[0] = this.safe_add(a, HASH[0]);
      HASH[1] = this.safe_add(b, HASH[1]);
      HASH[2] = this.safe_add(c, HASH[2]);
      HASH[3] = this.safe_add(d, HASH[3]);
      HASH[4] = this.safe_add(e, HASH[4]);
      HASH[5] = this.safe_add(f, HASH[5]);
      HASH[6] = this.safe_add(g, HASH[6]);
      HASH[7] = this.safe_add(h, HASH[7]);
    }
    return HASH;
  }


  /*
   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
   * to work around bugs in some JS interpreters.
   */
  public safe_add(x: number, y: number) {
    const lsw = (x & 0xFFFF) + (y & 0xFFFF);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
  }



  /*
   * Calculate the SHA-1 of an array of big-endian words, and a bit length
   */
  public binb_sha1(x: any, len: number) {
    /* append padding */
    x[len >> 5] |= 0x80 << (24 - len % 32);
    x[((len + 64 >> 9) << 4) + 15] = len;

    const w = Array(80);
    let a = 1732584193;
    let b = -271733879;
    let c = -1732584194;
    let d = 271733878;
    let e = -1009589776;

    for (let i = 0; i < x.length; i += 16) {
      const olda = a;
      const oldb = b;
      const oldc = c;
      const oldd = d;
      const olde = e;

      for (let j = 0; j < 80; j++) {
        if (j < 16) { w[j] = x[i + j]; } else { w[j] = this.bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1); }
        const t = this.safe_add(this.safe_add(this.bit_rol(a, 5), this.sha1_ft(j, b, c, d)),
          this.safe_add(this.safe_add(e, w[j]), this.sha1_kt(j)));
        e = d;
        d = c;
        c = this.bit_rol(b, 30);
        b = a;
        a = t;
      }

      a = this.safe_add(a, olda);
      b = this.safe_add(b, oldb);
      c = this.safe_add(c, oldc);
      d = this.safe_add(d, oldd);
      e = this.safe_add(e, olde);
    }
    return Array(a, b, c, d, e);

  }

  /*
   * Perform the appropriate triplet combination function for the current
   * iteration
   */
  public sha1_ft(t: number, b: number, c: number, d: number) {
    if (t < 20) { return (b & c) | ((~b) & d); }
    if (t < 40) { return b ^ c ^ d; }
    if (t < 60) { return (b & c) | (b & d) | (c & d); }
    return b ^ c ^ d;
  }

  /*
   * Determine the appropriate additive constant for the current iteration
   */
  public sha1_kt(t: number) {
    return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 :
      (t < 60) ? -1894007588 : -899497514;
  }

  /*
   * Bitwise rotate a 32-bit number to the left.
   */
  public bit_rol(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  /*
   * Calculate the SHA-1 of a raw string
   */
  public rstr_sha1(s: string) {
    return this.binb2rstr(this.binb_sha1(this.rstr2binb(s), s.length * 8));
  }

  /*
   * Calculate the HMAC-SHA1 of a key and some data (raw strings)
   */
  public rstr_hmac_sha1(key: string, data: string) {

    let bkey = this.rstr2binb(key);
    if (bkey.length > 16) { bkey = this.binb_sha1(bkey, key.length * 8); }

    const ipad = Array(16);
    const opad = Array(16);

    for (let i = 0; i < 16; i++) {
      ipad[i] = bkey[i] ^ 0x36363636;
      opad[i] = bkey[i] ^ 0x5C5C5C5C;
    }

    const hash = this.binb_sha1(ipad.concat(this.rstr2binb(data)), 512 + data.length * 8);
    return this.binb2rstr(this.binb_sha1(opad.concat(hash), 512 + 160));
  }
}
