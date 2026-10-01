window.addEventListener("load", onLoad);

async function onLoad() {
    localize();
    const stored = await messenger.storage.local.get(["apiKey", "llmProvider", "modelName", "baseURL"]);
    document.getElementById("apiKey").value = stored.apiKey || "";
    document.getElementById("providerList").value = stored.llmProvider || "mistral";
    document.getElementById("modelName").value = stored.modelName || "";
    document.getElementById("baseURL").value = stored.baseURL || "";
    document.getElementById("save").addEventListener("click", save);
    document.getElementById("providerList").addEventListener("change", onProviderChange);
    // "change" is only fired once for <select> in Thunderbird popup windows;
    // "input" is fired on every selection change.
    document.getElementById("providerList").addEventListener("input", onProviderChange);
    updateBaseURLState();
}

function localize() {
    document.title = messenger.i18n.getMessage("configPageTitle");
    document.getElementById("providerLabel").textContent = messenger.i18n.getMessage("providerLabel");
    document.getElementById("apiKeyLabel").textContent = messenger.i18n.getMessage("apiKeyLabel");
    document.getElementById("modelNameLabel").textContent = messenger.i18n.getMessage("modelNameLabel");
    document.getElementById("save").textContent = messenger.i18n.getMessage("saveButton");
    document.getElementById("baseURLLabel").textContent = messenger.i18n.getMessage("baseURLLabel");
}

const defaultModelNames = {
    mistral: "codestral-latest",
};

function onProviderChange() {
    const provider = document.getElementById("providerList").value;
    console.log("onProviderChange", provider);
    const modelNameInput = document.getElementById("modelName");
    if (defaultModelNames[provider]) {
        modelNameInput.value = defaultModelNames[provider];
    }
    updateBaseURLState();
}

function updateBaseURLState() {
    const isOpenAICompatible = document.getElementById("providerList").value === "openai-compatible";
    document.getElementById("baseURL").disabled = !isOpenAICompatible;
}

async function save() {
    const apiKey = document.getElementById("apiKey").value;
    const llmProvider = document.getElementById("providerList").value;
    const modelName = document.getElementById("modelName").value;
    const baseURL = document.getElementById("baseURL").value;
    await messenger.storage.local.set({ apiKey: apiKey, llmProvider: llmProvider, modelName: modelName, baseURL: baseURL });
    window.close();
}
