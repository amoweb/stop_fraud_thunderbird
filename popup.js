window.addEventListener("load", onLoad);

async function notifyMode(event) {
    await messenger.runtime.sendMessage({
        popupResponse: event.target.getAttribute("data")
    });
    window.close();
}

async function keepBackgroundAlive() {
    await messenger.runtime.sendMessage({
        ping: true
    });
    // Send a new ping in 10s.
    window.setTimeout(keepBackgroundAlive, 10000);
}

async function requestResult() {
    try {
        const response = await messenger.runtime.sendMessage({ getRequest: true });
        if (response) {
            document.getElementById("messageId").textContent = response.messageId || "";
            document.getElementById("analysisResult").textContent = response.result || "";
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du résultat :", error);
    }
    // Poll again in 1s until the result is ready.
    window.setTimeout(requestResult, 1000);
}

async function onLoad() {
    document.getElementById("menu_analyse").addEventListener("click", notifyMode);
    document.getElementById("menu_config").addEventListener("click", notifyMode);

    await requestResult();

    keepBackgroundAlive();
}
