var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var DestType;
(function (DestType) {
    DestType["Unknown"] = "Unknown";
    DestType["File"] = "File";
    DestType["Folder"] = "Folder";
    DestType["Dynamic"] = "Dynamic";
})(DestType || (DestType = {}));
var ServerResponse = /** @class */ (function () {
    function ServerResponse() {
        this.exists = false;
        this.status = 999;
        this.type = DestType.Unknown;
    }
    return ServerResponse;
}());
var item_schema;
var item_domain;
var item_port;
var item_path;
var item_queries;
var item_fragment;
var show_error;
var show_warning;
var show_ok;
var url_input_box;
var check_url_btn;
function fill_items() {
    item_schema = document.querySelector(".program-area li.item.schema");
    item_domain = document.querySelector(".program-area li.item.domain");
    item_port = document.querySelector(".program-area li.item.port");
    item_path = document.querySelector(".program-area li.item.path");
    item_queries = document.querySelector(".program-area li.item.queries");
    item_fragment = document.querySelector(".program-area li.item.fragment");
    show_error = document.querySelector(".program-area li.show-error");
    show_warning = document.querySelector(".program-area li.show-warning");
    show_ok = document.querySelector(".program-area li.show-ok");
}
function onready() {
    var _this = this;
    fill_items();
    url_input_box = document.querySelector("#user-input-url");
    check_url_btn = document.querySelector("#check-existance-btn");
    // register for validator in every input value change
    url_input_box.addEventListener('input', function (e) {
        if (e) {
            var inputStr = url_input_box.value;
            urlInputChanged(inputStr);
        }
    });
    // register for check existence button click
    check_url_btn.addEventListener('click', function (e) { return __awaiter(_this, void 0, void 0, function () {
        var inputStr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!e) return [3 /*break*/, 2];
                    inputStr = url_input_box.value;
                    urlInputChanged(inputStr);
                    if (!!check_url_btn.classList.contains('inactive')) return [3 /*break*/, 2];
                    return [4 /*yield*/, checkIfUrlExists(inputStr)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); });
}
function urlInputChanged(inputStr) {
    inputStr = inputStr.trim();
    // hide all information box
    [show_ok, show_error, show_warning].forEach(function (e) {
        e.classList.add('hidden');
    });
    // also disable the button
    // only enable if active
    check_url_btn.classList.add('inactive');
    // check the result from url validator
    var result = checkUrl(inputStr);
    var item_schema_label = item_schema.querySelector('span.label');
    var item_domain_label = item_domain.querySelector('span.label');
    var item_port_label = item_port.querySelector('span.label');
    var item_path_label = item_path.querySelector('span.label');
    var item_queries_label = item_queries.querySelector('span.label');
    var item_fragment_label = item_fragment.querySelector('span.label');
    // reset all item
    document.querySelectorAll(".program-area .item .icon").forEach(function (item) {
        if (item.classList.contains('ideal')) {
            item.classList.remove('hidden');
        }
        else {
            item.classList.add('hidden');
        }
    });
    // everything is ok
    if (result.isOk()) {
        var url = result.ok;
        item_schema_label.textContent = "Schema is valid: ".concat(url.schema);
        item_domain_label.textContent = "Domain is valid: subdomain: ".concat(JSON.stringify(url.subdomains), ", root domain: ").concat(url.rootDomain, ", tld: ").concat(url.tld);
        item_port_label.textContent = "Port is valid: ".concat(url.port);
        item_path_label.textContent = "Path is valid: ".concat(JSON.stringify(url.paths));
        item_queries_label.textContent = "Queries is valid: ".concat(url.queries);
        item_fragment_label.textContent = "Fragment is valid: ".concat(url.fragment);
        // enable submit button
        check_url_btn.classList.remove('inactive');
        // enable 
        [item_schema, item_domain, item_port, item_path, item_queries, item_fragment].forEach(function (e) {
            var _a, _b;
            e.classList.remove('hidden');
            (_a = e.querySelector('i.icon')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
            (_b = e.querySelector('i.icon.ok')) === null || _b === void 0 ? void 0 : _b.classList.remove('hidden');
        });
        // show the ok message
        show_ok.classList.remove('hidden');
        show_ok.textContent = "Url ".concat(inputStr.trim(), " is valid").toString();
        // if it's a warning, display
        if (result.warning) {
            show_warning.classList.remove('hidden');
            show_warning.textContent = "Also check warning: ".concat(result.warning);
        }
    }
    // is not ok and have error
    else if (result.error) {
        show_error.classList.remove('hidden');
        show_error.textContent = "Url ".concat(inputStr, " is not valid. validation error: ").concat(result.error[1]);
        [item_schema, item_domain, item_port, item_path, item_queries, item_fragment].forEach(function (e) {
            e.classList.add('hidden');
        });
        document.querySelectorAll(".program-area .item .icon").forEach(function (item) {
            if (item.classList.contains('error')) {
                item.classList.remove('hidden');
            }
            else {
                item.classList.add('hidden');
            }
        });
    }
}
function checkIfUrlExists(url) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // while we make server call,
            // let's lock the input
            url_input_box.disabled = true;
            show_ok.textContent = "Calling server for url check...";
            WebCallStatus(url.trim()).then(function (response) {
                // release the input once this resolved
                url_input_box.disabled = false;
                // hide all items
                [item_domain, item_schema, item_fragment, item_path, item_port, item_queries, item_port, show_ok, show_error, show_warning].forEach(function (item) {
                    item.classList.add('hidden');
                });
                if (response.exists) {
                    show_ok.classList.remove('hidden');
                    show_ok.textContent = "Url \"".concat(url, "\" exists as ").concat(response.type, " type. Server returned code ").concat(status);
                }
                else {
                    show_error.classList.remove('hidden');
                    show_error.textContent = "Url \"".concat(url, "\" does not exists. Server returned code ").concat(status);
                }
            });
            return [2 /*return*/];
        });
    });
}
// Actual web call to url if this exists
function WebCallStatus(url) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            response = new ServerResponse;
            response.exists = true;
            response.status = 200;
            response.type = DestType.File;
            return [2 /*return*/, response];
        });
    });
}
