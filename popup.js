window.addEventListener("load", onLoad);


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

let lastDisplayedText = null;

function displayAnalysis(text) {
    if (text === lastDisplayedText) {
        return;
    }
    lastDisplayedText = text;

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
        // Without a summary (e.g. "Analysis in progress..." or an error),
        // the whole text is the summary: show it directly.
        const needsToggle = Boolean(resume);

        const restDiv = document.createElement("div");
        restDiv.style.fontSize = "smaller";
        restDiv.style.whiteSpace = "pre-wrap";
        restDiv.textContent = rest;

        if (!needsToggle) {
            container.appendChild(restDiv);
            return;
        }

        const detailsButton = document.createElement("button");
        detailsButton.type = "button";
        detailsButton.textContent = messenger.i18n.getMessage("seeDetails");
        detailsButton.style.marginBottom = "5px";
        container.appendChild(detailsButton);

        restDiv.style.display = "none";
        container.appendChild(restDiv);

        detailsButton.addEventListener("click", () => {
            const visible = restDiv.style.display !== "none";
            restDiv.style.display = visible ? "none" : "block";
            detailsButton.textContent = messenger.i18n.getMessage(visible ? "seeDetails" : "hideDetails");
        });
    }
}

async function openConfigPage(event) {
    event.preventDefault();
    await messenger.runtime.openOptionsPage();
    window.close();
}

async function onLoad() {
    localize();
    document.getElementById("config_link").addEventListener("click", openConfigPage);

    await requestResult();

    keepBackgroundAlive();
}

function localize() {
    document.title = messenger.i18n.getMessage("popupPageTitle");
    document.getElementById("config_link").textContent = messenger.i18n.getMessage("menuConfig");
}
