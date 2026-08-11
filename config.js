window.addEventListener("load", onLoad);

async function onLoad() {
    const stored = await messenger.storage.local.get(["apiKey", "llmProvider", "modelName"]);
    document.getElementById("apiKey").value = stored.apiKey || "";
    document.getElementById("providerList").value = stored.llmProvider || "anthropic";
    document.getElementById("modelName").value = stored.modelName || "";
    document.getElementById("save").addEventListener("click", save);
}

async function save() {
    const apiKey = document.getElementById("apiKey").value;
    const llmProvider = document.getElementById("providerList").value;
    const modelName = document.getElementById("modelName").value;
    await messenger.storage.local.set({ apiKey: apiKey, llmProvider: llmProvider, modelName: modelName });
    window.close();
}
