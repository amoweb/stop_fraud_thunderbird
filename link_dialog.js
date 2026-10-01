window.addEventListener("load", onLoad);

function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
}

async function choose(event) {
    const action = event.currentTarget.getAttribute("data");
    try {
        await messenger.runtime.sendMessage({
            linkDialogResponse: action
        });
    } catch (err) {
        console.error("stop_fraud: failed to send dialog response:", err);
    }
    window.close();
}

async function onLoad() {
    localize();
    const url = getUrlParam("url");
    document.getElementById("destination").textContent = url;
    document.getElementById("action_open").addEventListener("click", choose);
    document.getElementById("action_analyse").addEventListener("click", choose);
    document.getElementById("action_cancel").addEventListener("click", choose);
    document.getElementById("action_cancel").focus();
}

function localize() {
    document.title = messenger.i18n.getMessage("linkDialogTitle");
    document.getElementById("prompt").textContent = messenger.i18n.getMessage("linkDialogPrompt");
    document.getElementById("action_open").textContent = messenger.i18n.getMessage("linkDialogOpen");
    document.getElementById("action_analyse").textContent = messenger.i18n.getMessage("linkDialogAnalyse");
    document.getElementById("action_cancel").textContent = messenger.i18n.getMessage("linkDialogCancel");
}
