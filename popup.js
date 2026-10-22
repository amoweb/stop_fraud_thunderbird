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

    const summaryEl = document.getElementById("analysisSummary");
    const detailsEl = document.getElementById("analysisDetails");
    const buttonEl = document.getElementById("detailsButton");

    summaryEl.textContent = "";
    detailsEl.textContent = "";
    detailsEl.hidden = false;
    buttonEl.textContent = "";

    const match = text.match(/<analysis_summary>([\s\S]*?)<\/analysis_summary>/i);
    let rest = text;
    if (match) {
        summaryEl.textContent = match[1].trim();
        rest = text.replace(match[0], "").trim();
    }
    if (!rest) {
        return;
    }

    detailsEl.textContent = rest;
    if (!summaryEl.textContent) {
        // Without a summary (e.g. "Analysis in progress..." or an error),
        // the whole text is the summary: show it directly.
        return;
    }

    // With a summary, the rest is shown on demand via the details button.
    detailsEl.hidden = true;
    buttonEl.textContent = messenger.i18n.getMessage("seeDetails");
}

function toggleDetails() {
    const detailsEl = document.getElementById("analysisDetails");
    const buttonEl = document.getElementById("detailsButton");
    detailsEl.hidden = !detailsEl.hidden;
    buttonEl.textContent = messenger.i18n.getMessage(detailsEl.hidden ? "seeDetails" : "hideDetails");
}

async function openConfigPage(event) {
    event.preventDefault();
    await messenger.runtime.openOptionsPage();
    window.close();
}

async function onLoad() {
    localize();
    document.getElementById("config_link").addEventListener("click", openConfigPage);
    document.getElementById("detailsButton").addEventListener("click", toggleDetails);

    await requestResult();

    keepBackgroundAlive();
}

function localize() {
    document.title = messenger.i18n.getMessage("popupPageTitle");
    document.getElementById("config_link").textContent = messenger.i18n.getMessage("menuConfig");
}
