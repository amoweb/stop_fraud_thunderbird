window.addEventListener("load", onLoad);

async function onLoad() {
    localize();
    const stored = await messenger.storage.local.get(["apiKey", "llmProvider", "modelName"]);
    document.getElementById("apiKey").value = stored.apiKey || "";
    document.getElementById("providerList").value = stored.llmProvider || "anthropic";
    document.getElementById("modelName").value = stored.modelName || "";
    document.getElementById("save").addEventListener("click", save);
}

function localize() {
    document.title = messenger.i18n.getMessage("configPageTitle");
    document.getElementById("providerLabel").textContent = messenger.i18n.getMessage("providerLabel");
    document.getElementById("apiKeyLabel").textContent = messenger.i18n.getMessage("apiKeyLabel");
    document.getElementById("modelNameLabel").textContent = messenger.i18n.getMessage("modelNameLabel");
    document.getElementById("save").textContent = messenger.i18n.getMessage("saveButton");
    document.getElementById("providerOpenaiCompatible").textContent =
        messenger.i18n.getMessage("providerOpenaiCompatible");
}

async function save() {
    const apiKey = document.getElementById("apiKey").value;
    const llmProvider = document.getElementById("providerList").value;
    const modelName = document.getElementById("modelName").value;
    await messenger.storage.local.set({ apiKey: apiKey, llmProvider: llmProvider, modelName: modelName });
    window.close();
}
