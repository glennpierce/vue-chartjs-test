//
// Copyright (c) 2017, SkyFoundry LLC
// Licensed under the Academic Free License version 3.0
//
// History:
//   5 July 2017 Hank Weber Creation
//

export class AuthParser {

  private buf: any;
  private pos: number;
  private cur: any;
  private peek: any;

  private SP: any;
  private HTAB: any;
  private COMMA: any;
  private EQ: any;
  private DQUOT: any;
  private EOF: any;

  constructor(header: string) {
    this.buf  = header;
    this.pos  = -2;
    this.cur  = -1;
    this.peek = -1;
    this.reset(0);

    this.SP    = ' '.charCodeAt(0);
    this.HTAB  = '\t'.charCodeAt(0);
    this.COMMA = ','.charCodeAt(0);
    this.EQ    = '='.charCodeAt(0);
    this.DQUOT = '"'.charCodeAt(0);
    this.EOF   = -1;
  }

  public nextScheme() {
  if (this.eof()) { return null; }
  if (this.pos > 0) { this.commaOws(); }

  const AuthScheme = {
    name: null,
    params: {},
    param: function(name: string) {
      let val = null;
      const params: any = this.params;
      Object.keys(params).forEach((key) => {
        if (key.toLowerCase() === name.toLowerCase()) { val = params[key]; }
      });
      return val;
    },
  };
  const scheme = Object.create(AuthScheme);
  scheme.name = this.parseToken([this.SP, this.COMMA, this.EOF]).toLowerCase();
  if (this.cur !== this.SP) { return scheme; }

  while (this.cur === this.SP) { this.consume(); }

  scheme.params = this.parseAuthParams();
  return scheme;
}



private parseToken(terms: any) {
  const start = this.pos;
  while (true) {
    if (this.eof()) {
      if (terms.indexOf(this.EOF) >= 0) { break; }
      throw new Error('Unexpected <eof>: ' + this.buf);
    }
    if (terms.indexOf(this.cur) >= 0) { break; }
    this.consume();
  }
  return this.buf.substring(start, this.pos);
}

private parseAuthParams() {
  const params = {};
  let start = this.pos;
  while (true) {
    start = this.pos;
    if (this.eof()) { break; }
    if (Object.keys(params).length > 0) { this.commaOws(); }
    if (!this.parseAuthParam(params)) { this.reset(start); break; }
    this.ows();
  }
  return params;
}


private parseAuthParam(params: any) {
  if (this.eof()) { return false; }

  const start = this.pos;
  const key = this.parseToken([this.SP, this.HTAB, this.EQ, this.COMMA, this.EOF]).toLowerCase();
  this.ows();
  if (this.cur !== this.EQ) {
    // backtrack
    this.reset(start);
    return false;
  }
  this.consume();
  this.ows();
  const val = this.cur === this.DQUOT ? this.parseQuotedString() : this.parseToken([this.SP, this.HTAB, this.COMMA, this.EOF]);
  this.ows();
  params[key] = val;
  return true;
}

private parseQuotedString() {
  const start = this.pos;
  if (this.cur !== this.DQUOT) { throw new Error('Expected \'"\' at pos ' + this.pos); }
  this.consume();
  while (true) {
    if (this.eof()) { throw new Error('Unterminated quoted-string starting at ' + this.pos); }
    if (this.cur === this.DQUOT) { this.consume(); break; }
    if (this.cur === this.EOF && this.peek === this.DQUOT) { this.consume(); this.consume(); } else { this.consume(); }
  }
  const quoted = this.buf.substring(start, this.pos);
  if (quoted.length < 2 || quoted[0] !== '"' || quoted[quoted.length - 1] !== '"') {
    throw new Error('Not a quoted string: ' + quoted);
  }
  return quoted.substring(1, quoted.length - 1).replace('\\"', '"');
}

private  commaOws() {
  if (this.cur !== this.COMMA) { throw new Error('Expected \',\': ' + this.buf.substring(0, this.pos)); }
  this.consume();
  this.ows();
}

private ows() {
  while (this.isOws()) { this.consume(); }
}

private isOws() {
  return this.cur === this.SP || this.cur === this.HTAB;
}

private reset(pos: number) {
  this.pos = pos - 2;
  this.consume();
  this.consume();
}


private  consume() {
  this.cur = this.peek;
  this.pos++;
  if (this.pos + 1 < this.buf.length) {
    this.peek = this.buf.charCodeAt(this.pos + 1);
  } else {
    this.peek = -1;
  }
  if (this.pos > this.buf.length) { this.pos = this.buf.length; }
}

private  eof() {
  return this.cur === this.EOF;
}


}










