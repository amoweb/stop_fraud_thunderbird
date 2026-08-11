window.addEventListener("load", onLoad);

async function onLoad() {
    const stored = await messenger.storage.local.get("apiKey");
    document.getElementById("apiKey").value = stored.apiKey || "";
    document.getElementById("save").addEventListener("click", save);
}

async function save() {
    const apiKey = document.getElementById("apiKey").value;
    await messenger.storage.local.set({ apiKey: apiKey });
    window.close();
}
