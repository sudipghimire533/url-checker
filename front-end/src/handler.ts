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

let itemSchema: HTMLElement;
let itemDomain: HTMLElement;
let itemAuth: HTMLElement;
let itemPort: HTMLElement;
let itemPath: HTMLElement;
let itemQueries: HTMLElement;
let itemFragment: HTMLElement;
let showError: HTMLElement;
let showWarning: HTMLElement;
let showOk: HTMLElement;
let urlInputBox: HTMLInputElement;

// A timeout to enable throttle
type TimeOutIdT = ReturnType<typeof setTimeout>;

let serverCallTimeout: TimeOutIdT;

function fillItems() {
    itemSchema = document.querySelector(".program-area li.item.schema")!;
    itemDomain = document.querySelector(".program-area li.item.domain")!;
    itemAuth = document.querySelector(".program-area li.item.auth")!;
    itemPort = document.querySelector(".program-area li.item.port")!;
    itemPath = document.querySelector(".program-area li.item.path")!;
    itemQueries = document.querySelector(".program-area li.item.queries")!;
    itemFragment = document.querySelector(".program-area li.item.fragment")!;
    showError = document.querySelector(".program-area li.show-error")!;
    showWarning = document.querySelector(".program-area li.show-warning")!;
    showOk = document.querySelector(".program-area li.show-ok")!;
}

function onready() {
    fillItems();

    urlInputBox = document.querySelector("#user-input-url")!;
    urlInputChanged("");

    // register for validator in every input value change
    urlInputBox.addEventListener('input', async (e) => {
        if (e) {
            // clear any server call
            // that input is outdated already
            serverCallTimeout ? clearTimeout(serverCallTimeout) : null;

            // validate the sementics of url
            let inputStr = urlInputBox.value;

            let urlIsValid = urlInputChanged(inputStr);

            // if sementics is valid,
            // check for it's existance and type
            if (urlIsValid) {
                // set a timeout to throttle the server call
                serverCallTimeout = setTimeout(async () => {
                    await checkIfUrlExists(inputStr);
                }, 1000);
            }
        }
    });
}

// takes input url and return if the url is valid or not
function urlInputChanged(inputStr: String): boolean {
    inputStr = inputStr.trim();

    // hide all information box
    [showOk, showError, showWarning].forEach(e => {
        e.classList.add('hidden');
    });

    let itemSchemaLabel = itemSchema.querySelector('span.label')!;
    let itemDomainLabel = itemDomain.querySelector('span.label')!;
    let itemPortLabel = itemPort.querySelector('span.label')!;
    let itemPathLabel = itemPath.querySelector('span.label')!;
    let itemQueriesLabel = itemQueries.querySelector('span.label')!;
    let itemFragmentLabel = itemFragment.querySelector('span.label')!;
    let itemAuthLabel = itemAuth.querySelector('span.label')!;

    if (inputStr.length == 0) {
        itemSchemaLabel.textContent = "Schema is empty";
        itemDomainLabel.textContent = "Domain is empty";
        itemAuthLabel.textContent = "Auth is empty";
        itemPortLabel.textContent = "Port is empty";
        itemPathLabel.textContent = "Path is valid";
        itemQueriesLabel.textContent = "Queries is valid";
        itemFragmentLabel.textContent = "Fragment is valid";

        // disable
        [itemSchema, itemDomain, itemPort, itemPath, itemQueries, itemFragment, itemAuth].forEach(e => {
            e.classList.remove('hidden');
            e.querySelectorAll('i.icon').forEach(e => e.classList.add('hidden'));
            e.querySelector('i.icon.warning')?.classList.remove('hidden');
        });

        // mark this as not valid
        return false;
    }

    // check the result from url validator
    let result = checkUrl(inputStr);

    // reset all item
    document.querySelectorAll(".program-area .item .icon").forEach(item => {
        if (item.classList.contains('ideal')) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });

    // everything is ok
    let url = result.Ok();
    if (url) {
        // enable 
        [itemSchema, itemDomain, itemPort, itemPath, itemQueries, itemFragment, itemAuth].forEach(e => {
            e.classList.remove('hidden');
            e.querySelectorAll('i.icon').forEach(e => e.classList.add('hidden'));
        });
        let setItem = function (item: HTMLElement, content: string, type: string) {
            item.querySelector('i.icon.' + type)?.classList.remove('hidden');
            item.querySelector('span.label')!.textContent = content;
        };

        setItem(
            itemSchema,
            `Schema is valid: ${url.schema}`,
            'ok'
        );
        setItem(
            itemDomain,
            `Domain is valid: subdomain: ${JSON.stringify(url.subdomains)}, root domain: ${url.rootDomain}, tld: ${url.tld}`,
            'ok'
        );
        url.auth ?
            setItem(itemAuth, `Auth is valid: ${url.auth}`, 'ok')
            : setItem(itemAuth, `Auth is empty`, 'warning');
        url.port ?
            setItem(itemPort, `Port is valid: ${url.port}`, 'ok')
            : setItem(itemPort, `Port is empty`, 'warning');
        url.paths.length > 0 ?
            setItem(itemPath, `Path is valid: ${JSON.stringify(url.paths)}`, 'ok')
            : setItem(itemPath, `Path is empty`, 'warning');
        url.queries ?
            setItem(itemQueries, `Queries is valid: ${url.queries}`, 'ok')
            : setItem(itemQueries, `Queries is empty`, 'warning');
        url.fragment ?
            setItem(itemFragment, `Fragment is valid: ${url.fragment}`, 'ok') :
            setItem(itemFragment, `Fragment is empty`, 'warning');

        // show the ok message
        showOk.classList.remove('hidden');
        showOk.textContent = `Url ${inputStr.trim()} is valid`.toString();

        // if it's a warning, display
        if (result.warning) {
            showWarning.classList.remove('hidden');
            showWarning.textContent = `Also check warning: ${result.warning}`;
        }

        return true;
    }

    // is not ok and have error
    else {
        let error = result.Err()!;

        showError.classList.remove('hidden');
        showError.textContent = `Url ${inputStr} is not valid. validation error: ${error[1]}`;


        [itemSchema, itemDomain, itemPort, itemPath, itemQueries, itemFragment, itemAuth].forEach(e => {
            e.classList.add('hidden');
        });

        // show error message
        let setError = function (item: HTMLElement) {
            item.classList.remove('hidden');
            item.querySelector('i.icon')?.classList.add('hidden');
            item.querySelector('i.icon.error')?.classList.remove('hidden');
        };
        switch (error[0]) {
            case FormatError.UnknownProtocol:
                itemSchemaLabel.textContent = `Schema is invalid`;
                setError(itemSchema);
                break;
            case FormatError.EmptyDomainName:
                itemDomainLabel.textContent = `Domain is empty`;
                setError(itemDomain);
                break;
            case FormatError.InvalidPort:
                itemPortLabel.textContent = `Port is invalid`;
                setError(itemPort);
            case FormatError.InvalidPathChar:
                itemPathLabel.textContent = `Path contains invalid character`;
                setError(itemPath);
                break;
            case FormatError.InvalidFragment:
                itemQueriesLabel.textContent = `Illegal fragment`;
                setError(itemQueries);
                break;
            case FormatError.NoDomainName:
                itemDomainLabel.textContent = `No domain name`;
                setError(itemDomain);
                break;
            case FormatError.InvalidDomainName:
                itemDomainLabel.textContent = `Invalid domain name`;
                setError(itemDomain);
                break;
            case FormatError.InvalidCharInPath:
                itemPathLabel.textContent = `Path contains invalid character`;
                setError(itemPath);
                break;
            case FormatError.InvalidQuery:
                itemQueriesLabel.textContent = `Invalid query`;
                setError(itemQueries);
                break;
        }


        document.querySelectorAll(".program-area .item .icon").forEach(item => {
            if (item.classList.contains('error')) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });

        return false;
    }
}

async function checkIfUrlExists(url: String) {
    WebCallStatus(url.trim()).then(response => {
        // do not perform anything in the case when
        // inputUrl have been changed
        if (url != urlInputBox.value) {
            return;
        }

        // hide all items
        [showOk, showError, showWarning].forEach(item => {
            item.classList.add('hidden');
        });

        if (response instanceof ServerResponse) {
            if (response.exists) {
                showOk.classList.remove('hidden');
                showOk.textContent = `Url "${url}" exists as ${response.type} type. Server returned code ${response.status}`;
            } else {
                showError.classList.remove('hidden');
                showError.textContent = `Url "${url}" does not exists. Server returned code ${response.status}`;
            }
        } else if (response instanceof String) {
            showError.classList.remove('hidden');
            showError.textContent = `Url "${url}" cannot be checked. Server error: ${response}`;
        }
    });
}


// Actual web call to url if this exists
async function WebCallStatus(url: string): Promise<ServerResponse | String> {
    // let's wait for 1s to simulate the server call
    await new Promise(r => setTimeout(r, 700));

    let response = new ServerResponse;
    // this might exists or not exists. select randomly to simulate all case
    response.exists = getRandomBool();
    // if it exists, return 200 else 400
    response.status = response.exists ? 200 : 404;
    // if it exists, select randomly to simulate file or folder
    // if not, return iunknown
    // we can probably check if it is file or folder by checking it it has file name at the end:
    // example: path/something.txt, path/something.php
    // but won't always hold true depending on server,
    // example: path/ looks like folder but might be a file referencing to path/index.php in apache server
    response.type = response.exists ? getRandomBool() ? DestType.File : DestType.Folder : DestType.Unknown;
    return response;

    // Idea about implementation
    // 
    // setup a backend server with a post endpoint:
    // {
    //  "url": String
    // }
    // as it's post bosy
    // that server should return  a json as in:
    // enum Result {
    //      Ok( ServerResponse ),
    //      Err( String ),
    // }
    // if it's ok value send as server response,
    // if error return the error message itself
}

function getRandomBool(): boolean {
    return Math.random() > 0.5;
}
