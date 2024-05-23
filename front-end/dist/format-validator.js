// All known protocls.
// This can be omitted or extended depending on what protocol to (not) support
// TODO: support for onion url as well?
var KNOWN_PROTOCOLS = ["http", "https", "ftp", "file"];
// All format error returned
var FormatError;
(function (FormatError) {
    FormatError["UnknownProtocol"] = "UnknownProtocol";
    FormatError["InvalidPort"] = "InvaludPort";
    FormatError["NoDomainName"] = "NoDomainName";
    FormatError["EmptyDomainName"] = "EmptyDomainName";
    FormatError["InvalidDomainName"] = "InvalidDomainName";
    FormatError["InvalidCharInPath"] = "InvalidCharInPath";
    FormatError["InvalidFragment"] = "InvalidFragment";
    FormatError["InvalidQuery"] = "InvalidQuery";
    FormatError["InvalidPathChar"] = "InvalidPathChar";
})(FormatError || (FormatError = {}));
// Ok type for FormatResult
// This is a rough breakdown of url we have parsed
var FormatOk = /** @class */ (function () {
    function FormatOk() {
        this.schema = "";
        this.subdomains = [];
        this.rootDomain = "";
        this.tld = "";
        // todo:
        // better to make it Vec<String>
        this.paths = [];
    }
    return FormatOk;
}());
// Result returned once format of url had been checked against
var FormatResult = /** @class */ (function () {
    function FormatResult() {
    }
    // set error object
    FormatResult.prototype.setError = function (error, context) {
        this.error = [error, context];
        return this;
    };
    // set warning string
    FormatResult.prototype.setWarning = function (warning_str) {
        this.warning = warning_str;
        return this;
    };
    // check if this result is ok ( without error )
    FormatResult.prototype.isOk = function () {
        return !this.error;
    };
    // Check if this result if ok ( without error and without warning )
    FormatResult.prototype.isStrictlyOk = function () {
        return this.isOk() && !this.warning;
    };
    return FormatResult;
}());
// for simple case, we can use new Url() constructor
// but since we also need to have where the url is invalid, let's do everything by hand
function checkUrl(input) {
    var rest = input;
    var okResult = new FormatOk();
    // Seperate fragment from last
    // example: #end, #bottom, #some-name
    // We expect all the url even the query value to be url encoded
    // queries can be complex with quotation and everything,
    // we can do checks but it required more complex parsing
    // for now assume everything is valid'
    // TODO:
    // http://localhost/some-path?query="Something-with-#some" <-- eror
    // in above case, this might split the #some part though that is not expected
    // this case is not handled here for simplicity purpose
    // This do works however is there is an actual fragment <-- ok
    // https://localhost/some-path?query="Something-with-#some"#frag
    // or query is propery sanitised and there is no # character
    // https://localhost/some-path?query="Something-with-%23some" <-- ok
    {
        var split_res = split_back_once(rest, "#");
        rest = split_res[0];
        var fragment = split_res[1];
        okResult.fragment = fragment;
    }
    // protocol
    {
        var split_res = split_once(rest, "://");
        var protocol_str = split_res[0];
        rest = split_res[1];
        var is_known_protocol = KNOWN_PROTOCOLS.includes(protocol_str);
        if (is_known_protocol) {
            okResult.schema = protocol_str;
        }
        else {
            return new FormatResult().setError(FormatError.UnknownProtocol, "Protocol ".concat(protocol_str, " is not known"));
        }
    }
    // domains: sub-domain, root domain, tld and port
    {
        var split_res = split_once(rest, "/");
        var domain_with_port = split_res[0];
        rest = split_res[1];
        var port_split_res = split_once(domain_with_port, ":");
        var domains_str = port_split_res[0];
        var port = port_split_res[1];
        // Port does not exists, hence everything is part of domain
        if (!port) {
            domains_str = domain_with_port;
        }
        else if (port.trim().length > 0) {
            // Check if this port_str is valid number
            var port_num = parseInt(port);
            if (isNaN(port_num)) {
                return new FormatResult().setError(FormatError.InvalidPort, "Port {port} is not a vald number value");
            }
            else {
                okResult.port = port_num;
            }
        }
        // for each domain and subdomains,
        // check they are valid
        var domains = domains_str.split(".");
        for (var i = 0; i < domains.length; i++) {
            var domain = domains[i];
            // domain should be a valid identifier
            if (!isValidDomainIdent(domain)) {
                return new FormatResult().setError(FormatError.InvalidDomainName, "Domain \"".concat(domain, "\" is not valid"));
            }
        }
        // move last sub domain to tld and another to root
        okResult.tld = domains.pop();
        okResult.rootDomain = domains.pop();
        okResult.subdomains = domains;
    }
    // check url slugs
    {
        // slug can be interepreted differently according to webserver.
        // so let's assume everything is valid
        var split_res = split_back_once(rest, "?");
        var path = split_res[0];
        rest = split_res[1];
        // we assume all paths are url encoded correctly
        // i.e contains no spaces or special character,
        // eg: ü is represented as %C3%BC
        var allowed_chars_1 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%+-/.";
        var paths = path.split("/");
        paths.forEach(function (p) {
            for (var i = 0; i < p.length; i++) {
                var c = p[i];
                if (!allowed_chars_1.includes(c)) {
                    return new FormatResult().setError(FormatError.InvalidPathChar, "Character \"".concat(c, "\" is not allowed in url path"));
                }
            }
            okResult.paths.push(p);
        });
    }
    // check for queries. eg: ?q=something&text=%20some%20
    {
        // since we seperated path and seperated
        okResult.queries = rest;
    }
    var result = new FormatResult;
    result.ok = okResult;
    return result;
}
// split string only once on first encounter of seperator
function split_once(input, separator) {
    var splitAt = input.indexOf(separator);
    if (splitAt == -1 || splitAt == input.length) {
        return [input, ""];
    }
    var first = input.substring(0, splitAt);
    var second = input.substring(splitAt + separator.length);
    return [first, second];
}
// split string only once on last encounter of seperator
function split_back_once(input, separator) {
    var splitAt = input.lastIndexOf(separator);
    if (splitAt == -1 || splitAt == input.length) {
        return [input, ""];
    }
    var first = input.substring(0, splitAt);
    var second = input.substring(splitAt + 1);
    return [first, second];
}
// check if this string can be used as valid domain name:
// currently allowed: alphabets, numbers, -, .
function isValidDomainIdent(input) {
    if (input.length == 0) {
        return false;
    }
    var allowed = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-";
    for (var i = 0; i < input.length; i++) {
        var c = input[i];
        if (!allowed.includes(c)) {
            return false;
        }
    }
    return true;
}
