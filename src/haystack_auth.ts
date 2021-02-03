//
// Copyright (c) 2017, SkyFoundry LLC
// Licensed under the Academic Free License version 3.0
//
// History:
//   5 July 2017 Hank Weber Creation
//

import axios from 'axios';
import { HaystackCrypto } from './haystack_cryto';
import { AuthParser } from './haystack_auth_parser';

declare const Buffer: any;

interface Headers {
  [key: string]: string;
}

/**
 * Creates AuthClientContext object which contains user information to be authenticated.
 * @constructor
 * @param {String} uri - The uri to the haystack
 * @param {String} user - The username to login with
 * @param {String} pass - The password for the desired user
 * @param {Boolean} reject - Sets the value of "rejectUnauthorized" header when connecting through https
 */
export class HaystackLogin {
  public headers: Headers;

  private scheme: any = null;
  private uri: string;
  private user: string;
  private pass: any;
  private reject: any;
  private crypto = new HaystackCrypto();

  constructor(uri: string, user: string, pass: string, reject: any) {
    this.uri = uri;
    this.user = user;
    this.pass = pass;
    this.headers = {};
    this.reject = reject;

    axios.interceptors.response.use((response) => {
      return response;
    }, (error) => {

      return error;
      //  if (error.response.status === 401) {
      //   //place your reentry code
      //  }
      //  return error;
    });

  }

  //   /**
  //  * Attempts to login with the information of the AuthClientContext object
  //  *
  //  * @param {Function} onSuccess - defines the behavior upon a successfull login, it is passed an object containing the Authorization header.
  //  * @param {Function} onFail = defines the behavior upon a failed login, it is passed a string with a failure message
  //  */
  public async login(onSuccess: any, onFail: any) {
    //   this.onSuccess = onSuccess;
    //   this.onFail = onFail;
    const self = this;

    if (!(typeof (onSuccess) === 'function') || !(typeof (onFail) === 'function')) {
      throw Error('onSuccess or onFail is not a proper function.');
      return;
    }

    const username = this.user;
    const password = this.pass;
    const u64 = this.str2b64uriUtf8(username);
    const authInfo = self.prepare({ Authorization: 'hello username=' + u64 });

    const response: any = await axios({ method: 'get', url: this.uri, headers: authInfo });

    if (response.response.status === 303) {
      console.log(response);
      // get new location
      // self.curUri = url.parse(callback.headers['location']);
      // const response = await axios({method: 'get', url: this.uri, headers: authInfo});
    }

    if (response.response.status === 401) {

      self.scheme = self.parseWwwAuth(response.response.headers);
      try {
        if ('scram' === self.scheme.name) {
          self.scram(username, password, self.scheme, onSuccess, onFail);
        } else {
          throw new Error('Unsupported auth scheme: ' + self.scheme.toLowerCase());
        }
      } catch (e) {
        return onFail(e.toString());
      }
    } else {
      return onFail('Hello failed with error code: ' + response.response.status);
    }

    // const after = function(func) {
    //     if (func.statusCode !== 401) {
    //         return self.onFail('Hello failed with error code: ' + func.statusCode);
    //     }
    //
    // };



  }

  //
  //  Prepares the authorization header for a request, checks to see if the current AuthClientContext has a token already, otherwise uses the parameter.
  //
  //  @param {Object} htp - the headers to prepare for the request.
  //  @returns {Object} hts - the prepared headers to send with the request.
  //
  private prepare(htp: any) {
    if (htp == null) { htp = new Object(); }
    const hts = htp;
    if (Object.keys(this.headers).length > 0) {
      for (const key in this.headers) {
        if (this.headers.hasOwnProperty(key)) {
          hts[key] = this.headers[key];
        }
      }
    }
    return hts;
  }

  // /**
  //  * Builds the request from the given arguments and sends it.
  //  *
  //  * @param {Object} reqHeaders - Object containing name-value pairs of request headers
  //  * @param {string} c_method - The connection method
  //  * @param {String} extension - The password for the desired user
  //  * @param {Function} func - The function returned by the request
  //  */
  // private async sendReq(haystack_url: string, headers: any, func: any) {

  //       return await axios({method: 'get', url: haystack_url, headers: headers});


  //   }



  private str2b64uriUtf8(s: string) {
    return this.crypto.rstr2b64uri(this.crypto.str2rstr_utf8(s));
  }

  private toQuotedStr(s: string) {
    return '"' + s.replace('"', '\\"') + '"';
  }

  private parseWwwAuth(resp: any) {
    const wwwAuth = resp['WWW-Authenticate'.toLowerCase()];
    const parser = new AuthParser(wwwAuth);
    return parser.nextScheme();
  }


  private async doFinal(scheme1: any, password: any, c1_bare: any, hello: any, gs2_header: string, onSuccess: any, onFail: any) {

    const self = this;

    // const hash = hashSpec['hash'];
    // const keyBits = hashSpec['bits'];

    const s1_msg = Buffer.from(scheme1.param('data'), 'base64').toString('utf8');
    const s1Data: any = self.decode(s1_msg);
    const cbind_input = gs2_header;
    const channel_binding = 'c=' + self.crypto.rstr2b64(cbind_input);
    const nonce = 'r=' + s1Data['r'];
    const c2_no_proof = channel_binding + ',' + nonce;

    const keyBits = 256;

    console.log('nonce: ' + Buffer.from(nonce, 'utf8'));
    console.log('nonce ' + Buffer.from(nonce, 'latin1').toString('hex'));

    console.log('c2_no_proof: ' + Buffer.from(c2_no_proof, 'utf8'));
    console.log('c2_no_proof: ' + Buffer.from(c2_no_proof, 'latin1').toString('hex'));

    // construct proof

    console.log('base64_salt: ' + s1Data['s']);

    const salt = Buffer.from(s1Data['s'], 'base64').toString('binary');
    const iterations: number = parseInt(s1Data['i'], 10);

    console.log('iterations: ' + iterations);
    console.log('salt: ' + salt);
    console.log('password: ' + password);
    console.log('keyBits / 8: ' + keyBits / 8);

    password = password.toString('utf8');

    console.log('password utf-8: ' + password);

    const saltedPassword = self.crypto.pbkdf2_hmac_sha256(password, salt, iterations, keyBits / 8);

    console.log('saltedPassword base64: ' + this.str2b64uriUtf8(saltedPassword));
    console.log('saltedPassword test: ' + Buffer.from(saltedPassword, 'latin1').toString('hex'));
    console.log('saltedPassword: ' + Buffer.from(saltedPassword, 'utf8').toString('hex'));

    const clientKey = this.crypto.sha256('Client Key', saltedPassword);

    console.log('clientKey raw: ' + clientKey);
    console.log('clientKey: ' + Buffer.from(clientKey, 'latin1').toString('hex'));
    console.log('clientKey utf8: ' + Buffer.from(clientKey, 'utf8').toString('hex'));

    const storedKey = this.crypto.sha256(clientKey);

    console.log('storedKey: ' + Buffer.from(storedKey, 'latin1').toString('hex'));

    const authMsg = c1_bare + ',' + s1_msg + ',' + c2_no_proof;

    console.log('authMsg: ' + authMsg);
    // console.log("authMsg: " + Buffer.from(authMsg, 'latin1').toString('hex'));

    const clientSig = this.crypto.sha256(authMsg, storedKey);

    console.log('clientSig: ' + Buffer.from(clientSig, 'latin1').toString('hex'));

    const xor_result = self.crypto.xor(clientKey, clientSig);
    console.log('xor_result: ' + Buffer.from(xor_result, 'latin1').toString('hex'));

    const proof = self.crypto.rstr2b64(self.crypto.xor(clientKey, clientSig));

    console.log('proof: ' + proof);
    console.log('proof: ' + Buffer.from(proof, 'latin1').toString('hex'));

    const c2_msg = c2_no_proof + ',p=' + proof;
    const c2_data = self.crypto.rstr2b64uri(c2_msg);
    let header = '' + hello.name + ' data=' + c2_data;
    const tok = scheme1.params['handshaketoken'];
    if (tok != null) { header += ', handshakeToken=' + tok; }
    const authInfo = self.prepare({ Authorization: header });

    const response: any = await axios({ method: 'get', url: self.uri, headers: authInfo });

    if (response.status !== 200) {
      // onFail(self.localeBadCreds);
      console.log(response);

    } else {
      self.pass = null;
      self.headers['Authorization'] = 'bearer ' + response.headers['authentication-info'].split(',')[0];
      onSuccess(self.headers);
    }

    // self.sendReq(authInfo, 'GET', 'ui', function(callback) {
    //   if (callback.statusCode !== 200) {
    //     onFail(self.localeBadCreds);
    //   } else {
    //     self.pass = null;
    //     self.headers['Authorization'] = 'bearer ' + callback.headers['authentication-info'].split(',')[0];
    //     self.onSuccess(cur.headers);
    //   }
    // });



  }

  private decode(s: string) {
    const data: any = {};
    s.split(',').forEach((tok) => {
      const n = tok.indexOf('=');
      if (n > 0) {
        data[tok.substring(0, n)] = tok.substring(n + 1);
      }
    });
    return data;
  }

  private async scram(username: string, password: any, hello: any, onSuccess: any, onFail: any) {

    const self = this;

    const gs2_header = 'n,,';
    const c_nonce = self.crypto.nonce(24);
    const c1_bare = 'n=' + username + ',r=' + c_nonce;
    const c1_msg = gs2_header + c1_bare;
    const c1_data = self.crypto.rstr2b64uri(c1_msg);

    let header = hello.name + ' data=' + c1_data;
    const tok = hello.params['handshaketoken'];
    if (tok != null) { header += ', handshakeToken=' + tok; }

    // var cur = this;
    const authInfo = self.prepare({ Authorization: header });

    console.log('first message c1_msg: ' + c1_msg);
    console.log('first message: ' + authInfo['Authorization']);

    const response: any = await axios({ method: 'get', url: self.uri, headers: authInfo });

    if (response.response.status !== 401) {
      // onFail(self.localeBadCreds);
      onFail(response.response.status);

    } else {
      self.doFinal(self.parseWwwAuth(response.response.headers), password, c1_bare, hello, gs2_header, onSuccess, onFail);
    }


    // self.sendReq(authInfo, 'GET', 'ui', function(callback) {
    //   if (callback.statusCode !== 401) {
    //     // self.onFail(self.localeBadCreds);
    //     onFail(callback.statusCode);
    //   } else {
    //     self.doFinal(self.parseWwwAuth(callback.headers), password, keyBits, hash, c1_bare, hello, gs2_header, onSuccess, onFail);
    //   }
    // });


  }

  private hashPwd(username: string, password: string, scheme: any) {

    const self = this;
    const algorithm = scheme.name;
    const hashFunc = scheme.param('hash');
    // const hashSpec: any = this.hashSpec(hashFunc);
    let salt = this.crypto.b64uri2rstr(scheme.param('salt'));
    if ('hmac' === algorithm) {
      salt = this.crypto.rstr2b64(salt);
      return self.crypto.sha256(username + ':' + salt, password);
    }
    if ('scram' === algorithm) {
      if (hashFunc !== 'SHA-256') { throw new Error('Unsupported hash func for pbkdf2 ' + hashFunc); }
      const iterations = parseInt(scheme.param('c'), 10);
      const dkLen = 256 / 8; // convert bits to bytes
      const saltedPassword = self.crypto.pbkdf2_hmac_sha256(password, salt, iterations, dkLen);
      return saltedPassword;
    } else { throw new Error('Unsupported algorithm: ' + algorithm); }
  }
}
