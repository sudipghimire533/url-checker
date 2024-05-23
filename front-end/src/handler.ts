enum DestType {
    Unknown = "Unknown",
    File = "File",
    Folder = "Folder",
    Dynamic = "Dynamic",
}

class ServerResponse {
    exists: boolean = false;
    status: number = 999;
    type: DestType = DestType.Unknown;
}

let item_schema: HTMLElement;
let item_domain: HTMLElement;
let item_port: HTMLElement;
let item_path: HTMLElement;
let item_queries: HTMLElement;
let item_fragment: HTMLElement;
let show_error: HTMLElement;
let show_warning: HTMLElement;
let show_ok: HTMLElement;
let url_input_box: HTMLInputElement;
let check_url_btn: HTMLElement;

function fill_items() {
    item_schema = document.querySelector(".program-area li.item.schema")!;
    item_domain = document.querySelector(".program-area li.item.domain")!;
    item_port = document.querySelector(".program-area li.item.port")!;
    item_path = document.querySelector(".program-area li.item.path")!;
    item_queries = document.querySelector(".program-area li.item.queries")!;
    item_fragment = document.querySelector(".program-area li.item.fragment")!;
    show_error = document.querySelector(".program-area li.show-error")!;
    show_warning = document.querySelector(".program-area li.show-warning")!;
    show_ok = document.querySelector(".program-area li.show-ok")!;
}

function onready() {
    fill_items();

    url_input_box = document.querySelector("#user-input-url")!;
    check_url_btn = document.querySelector("#check-existance-btn")!;

    // register for validator in every input value change
    url_input_box.addEventListener('input', (e) => {
        if (e) {
            let inputStr = url_input_box.value;
            urlInputChanged(inputStr);
        }
    });

    // register for check existence button click
    check_url_btn.addEventListener('click', async (e) => {
        if (e) {
            let inputStr = url_input_box.value;
            urlInputChanged(inputStr);

            if (!check_url_btn.classList.contains('inactive')) {
                await checkIfUrlExists(inputStr);
            }
        }
    })
}

function urlInputChanged(inputStr: String) {
    inputStr = inputStr.trim();

    // hide all information box
    [show_ok, show_error, show_warning].forEach(e => {
        e.classList.add('hidden');
    });

    // also disable the button
    // only enable if active
    check_url_btn.classList.add('inactive');

    // check the result from url validator
    let result = checkUrl(inputStr);

    let item_schema_label = item_schema.querySelector('span.label')!;
    let item_domain_label = item_domain.querySelector('span.label')!;
    let item_port_label = item_port.querySelector('span.label')!;
    let item_path_label = item_path.querySelector('span.label')!;
    let item_queries_label = item_queries.querySelector('span.label')!;
    let item_fragment_label = item_fragment.querySelector('span.label')!;

    // reset all item
    document.querySelectorAll(".program-area .item .icon").forEach(item => {
        if (item.classList.contains('ideal')) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });

    // everything is ok
    if (result.isOk()) {
        let url = result.ok!;
        item_schema_label.textContent = `Schema is valid: ${url.schema}`;
        item_domain_label.textContent = `Domain is valid: subdomain: ${JSON.stringify(url.subdomains)}, root domain: ${url.rootDomain}, tld: ${url.tld}`;
        item_port_label.textContent = `Port is valid: ${url.port}`;
        item_path_label.textContent = `Path is valid: ${JSON.stringify(url.paths)}`;
        item_queries_label.textContent = `Queries is valid: ${url.queries}`;
        item_fragment_label.textContent = `Fragment is valid: ${url.fragment}`;

        // enable submit button
        check_url_btn.classList.remove('inactive');

        // enable 
        [item_schema, item_domain, item_port, item_path, item_queries, item_fragment].forEach(e => {
            e.classList.remove('hidden');
            e.querySelector('i.icon')?.classList.add('hidden');
            e.querySelector('i.icon.ok')?.classList.remove('hidden');
        });

        // show the ok message
        show_ok.classList.remove('hidden');
        show_ok.textContent = `Url ${inputStr.trim()} is valid`.toString();

        // if it's a warning, display
        if (result.warning) {
            show_warning.classList.remove('hidden');
            show_warning.textContent = `Also check warning: ${result.warning}`;
        }
    }

    // is not ok and have error
    else if (result.error) {
        show_error.classList.remove('hidden');
        show_error.textContent = `Url ${inputStr} is not valid. validation error: ${result.error[1]}`;

        [item_schema, item_domain, item_port, item_path, item_queries, item_fragment].forEach(e => {
            e.classList.add('hidden');
        });

        document.querySelectorAll(".program-area .item .icon").forEach(item => {
            if (item.classList.contains('error')) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    }
}

async function checkIfUrlExists(url: String) {
    // while we make server call,
    // let's lock the input
    url_input_box.disabled = true;
    show_ok.textContent = "Calling server for url check...";

    WebCallStatus(url.trim()).then(response => {
        // release the input once this resolved
        url_input_box.disabled = false;

        // hide all items
        [item_domain, item_schema, item_fragment, item_path, item_port, item_queries, item_port, show_ok, show_error, show_warning].forEach(item => {
            item.classList.add('hidden');
        });


        if (response.exists) {
            show_ok.classList.remove('hidden');
            show_ok.textContent = `Url "${url}" exists as ${response.type} type. Server returned code ${status}`;
        } else {
            show_error.classList.remove('hidden');
            show_error.textContent = `Url "${url}" does not exists. Server returned code ${status}`;
        }
    });


}


// Actual web call to url if this exists
async function WebCallStatus(url: string): Promise<ServerResponse> {
    let response = new ServerResponse;
    response.exists = true;
    response.status = 200;
    response.type = DestType.File;
    return response;
}
