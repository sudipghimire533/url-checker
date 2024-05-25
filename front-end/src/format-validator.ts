// All known protocls.
// This can be omitted or extended depending on what protocol to (not) support
// TODO: support for onion url as well?
const KNOWN_PROTOCOLS = ["http", "https", "ftp", "file"];

// All format error returned
enum FormatError {
    UnknownProtocol = "UnknownProtocol",
    InvalidPort = "InvaludPort",
    NoDomainName = "NoDomainName",
    EmptyDomainName = "EmptyDomainName",
    InvalidDomainName = "InvalidDomainName",
    InvalidCharInPath = "InvalidCharInPath",
    InvalidFragment = "InvalidFragment",
    InvalidQuery = "InvalidQuery",
    InvalidPathChar = "InvalidPathChar",
}

// Ok type for FormatResult
// This is a rough breakdown of url we have parsed
class FormatOk {
    schema: String = "";
    port?: Number;
    subdomains: String[] = [];
    rootDomain: String = "";
    tld: String = "";
    auth?: String;
    paths: String[] = [];
    // todo: better to make it HashMap<String, Option<String>>
    queries?: String;
    fragment?: String;

}

// Result returned once format of url had been checked against
class FormatResult {
    // any ok value
    ok?: FormatOk;
    // any error if contains
    error?: [FormatError, String];
    // any warning if contains
    warning?: String;

    // set error object
    setError(error: FormatError, context: String): FormatResult {
        this.error = [error, context];
        return this;
    }

    // set warning string
    setWarning(warningStr: String): FormatResult {
        this.warning = warningStr;
        return this;
    }

    // check if this result is ok ( without error )
    isOk(): boolean {
        return !this.error;
    }

    // Check if this result if ok ( without error and without warning )
    isStrictlyOk(): boolean {
        return this.isOk() && !this.warning;
    }
}


// for simple case, we can use new Url() constructor
// but since we also need to have where the url is invalid, let's do everything by hand
function checkUrl(input: String): FormatResult {
    let rest = input;
    let okResult = new FormatOk();

    // protocol
    {
        let splitRes = splitOnce(rest, "://");
        let protocolStr = splitRes[0];
        rest = splitRes[1];

        let isKnownProtocol = KNOWN_PROTOCOLS.includes(protocolStr as string);
        if (isKnownProtocol) {
            okResult.schema = protocolStr;
        } else {
            return new FormatResult().setError(FormatError.UnknownProtocol, `Protocol ${protocolStr} is not known`);
        }
    }

    // domains: sub-domain, root domain, auth, tld and port
    {
        let splitRes = splitOnce(rest, "/");
        let domainWithPortAndAuth = splitRes[0];
        rest = splitRes[1];

        splitRes = splitOnce(domainWithPortAndAuth, "@");
        let auth = splitRes[0];
        let domainWithPort = splitRes[1];
        if ( domainWithPort.length > 0 ) {
            okResult.auth = auth;
        } else {
            domainWithPort = splitRes[0];
        }

        let portSplitres = splitOnce(domainWithPort, ":");
        let domainStr = portSplitres[0];
        let port = portSplitres[1];

        // Port does not exists, hence everything is part of domain
        if (!port) {
            domainStr = domainWithPort;
        } else if (port.trim().length > 0) {
            // Check if this portStr is valid number
            let portNum = parseInt(port as string);
            if (isNaN(portNum)) {
                return new FormatResult().setError(FormatError.InvalidPort, `Port {port} is not a vald number value`);
            } else {
                okResult.port = portNum;
            }
        }

        // for each domain and subdomains,
        // check they are valid
        let domains = domainStr.split(".");
        for (let i = 0; i < domains.length; i++) {
            let domain = domains[i];

            // domain should be a valid identifier
            if (!isValidDomainIdent(domain)) {
                return new FormatResult().setError(FormatError.InvalidDomainName, `Domain "${domain}" is not valid`);
            }
        }

        if ( domains.length == 0 ) {
            return new FormatResult().setError(FormatError.NoDomainName, `No domain name found`);
        }

        // move last sub domain to tld and another to root
        okResult.tld = domains.pop() as string;
        okResult.rootDomain = domains.pop() as string;
        okResult.subdomains = domains;
    }

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
        let splitRes = splitBackOnce(rest, "#");
        rest = splitRes[0];
        let fragment = splitRes[1];
        okResult.fragment = fragment;
    }

    // check url slugs
    {
        // slug can be interepreted differently according to webserver.
        // so let's assume everything is valid
        let splitRes = splitBackOnce(rest, "?");
        let path = splitRes[0];
        rest = splitRes[1];

        // we assume all paths are url encoded correctly
        // i.e contains no spaces or special character,
        // eg: ü is represented as %C3%BC
        const allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%+-/.";
        let paths = path.split("/");
        for (let i = 0; i < paths.length; i++) {
            let p = paths[i];
            for (let i = 0; i < p.length; i++) {
                let c = p[i];
                if (!allowedChars.includes(c)) {
                    return new FormatResult().setError(FormatError.InvalidPathChar, `Character "${c}" is not allowed in url path`);
                }
            }
            okResult.paths.push(p);
        };
    }

    // check for queries. eg: ?q=something&text=%20some%20
    {
        // since we seperated path and seperated
        okResult.queries = rest;
    }


    let result = new FormatResult;
    result.ok = okResult;
    return result;
}

// split string only once on first encounter of seperator
function splitOnce(input: String, separator: String): [String, String] {
    let splitAt = input.indexOf(separator as string);
    if (splitAt == -1 || splitAt == input.length) {
        return [input, ""];
    }
    let first = input.substring(0, splitAt);
    let second = input.substring(splitAt + separator.length);
    return [first, second];
}

// split string only once on last encounter of seperator
function splitBackOnce(input: String, separator: String): [String, String] {
    let splitAt = input.lastIndexOf(separator as string);
    if (splitAt == -1 || splitAt == input.length) {
        return [input, ""];
    }
    let first = input.substring(0, splitAt);
    let second = input.substring(splitAt + 1);
    return [first, second];
}

// check if this string can be used as valid domain name:
// currently allowed: alphabets, numbers, -, .
function isValidDomainIdent(input: String): boolean {
    if (input.length == 0) {
        return false;
    }

    let allowed = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-";
    for (let i = 0; i < input.length; i++) {
        let c = input[i];
        if (!allowed.includes(c)) {
            return false;
        }
    }
    return true;
}