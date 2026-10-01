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
            const messageIdEl = document.getElementById("messageId");
            if (messageIdEl) {
                messageIdEl.textContent = response.messageId || "";
            }
            displayAnalysis(response.result || "");
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du résultat :", error);
    }
    // Poll again in 1s until the result is ready.
    window.setTimeout(requestResult, 1000);
}

function displayAnalysis(text) {
    const container = document.getElementById("analysisResult");
    container.textContent = "";
    if (!text) {
        return;
    }

    const match = text.match(/<analysis_summary>([\s\S]*?)<\/analysis_summary>/i);
    let resume = "";
    let rest = text;
    if (match) {
        resume = match[1].trim();
        rest = text.replace(match[0], "").trim();
    }

    if (resume) {
        const resumeDiv = document.createElement("div");
        resumeDiv.style.fontWeight = "bold";
        resumeDiv.style.marginBottom = "10px";
        resumeDiv.textContent = resume;
        container.appendChild(resumeDiv);
    }

    if (rest) {
        const restDiv = document.createElement("div");
        restDiv.style.fontSize = "smaller";
        restDiv.style.whiteSpace = "pre-wrap";
        restDiv.textContent = rest;
        container.appendChild(restDiv);
    }
}

async function onLoad() {
    localize();
    document.getElementById("menu_analyse").addEventListener("click", notifyMode);
    document.getElementById("menu_config").addEventListener("click", notifyMode);

    await requestResult();

    keepBackgroundAlive();
}

function localize() {
    document.title = messenger.i18n.getMessage("popupPageTitle");
    document.getElementById("menu_analyse").textContent = messenger.i18n.getMessage("menuAnalyse");
    document.getElementById("menu_config").textContent = messenger.i18n.getMessage("menuConfig");
}
