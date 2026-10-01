import { initializeModel, emailAnalysis, lastAnalysisResult, setLastAnalysisResult } from "./email_analysis.js";
import { createPopup, awaitPopupClose, createLinkDialog, awaitLinkDialog, openConfig } from "./view.js";

messenger.menus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "analyse") {
        analyseAndShowResult(tab ? tab.id : null);
    } else if (info.menuItemId === "config") {
        openConfig(tab);
    }
});

// Register the link interceptor as a message display script (MV3). This
// replaces the MV2 `message_display_scripts` manifest key and makes
// Thunderbird inject the script into every displayed message (3-pane tab,
// message tab and message window) at document_idle.
// The registration is persistent, so re-registering the same id simply
// replaces the existing entry.
messenger.scripting.messageDisplay.registerScripts([
    {
        id: "stop-fraud-link-interceptor",
        js: ["link_interceptor.js"],
        runAt: "document_idle"
    }
]).catch((e) => console.error("stop_fraud: failed to register link interceptor:", e));

messenger.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.getRequest) {
        sendResponse(lastAnalysisResult);
    } else if (request.type === "stop-fraud:link-clicked") {
        // Content script (link_interceptor.js) intercepted a link click:
        // ask the user what to do and report the choice back.
        handleLinkClicked(request.url, sender.tab ? sender.tab.id : null)
            .then((action) => sendResponse({ action: action }))
            .catch((err) => {
                console.error("stop_fraud: link dialog failed:", err);
                sendResponse({ action: "cancel" });
            });
        return true; // response is asynchronous
    }
});

// Show the link dialog (destination + open / analyse / cancel) and return
// the user choice. Defaults to "cancel" if the window is just closed.
async function handleLinkClicked(url, tabId) {
    const dialogId = await createLinkDialog(url);
    const choice = await awaitLinkDialog(dialogId);
    console.log("stop_fraud: link dialog choice:", choice, "for", url);

    if (choice === "analyse") {
        await analyseAndShowResult(tabId);
        return "cancel"; // nothing for the content script to do
    }
    if (choice === "open") {
        // Open in the system's default browser. Doing it here (background)
        // avoids navigating the message pane, which a simulated <a> click
        // from the content script would do.
        await messenger.windows.openDefaultBrowser(url);
    }
    return "cancel";
}

async function analyseAndShowResult(tabId = null) {
    setLastAnalysisResult("", messenger.i18n.getMessage("analysisInProgress"));
    const popupId = await createPopup();
    try {
        await initializeModel();
        await emailAnalysis(tabId);
    } catch (error) {
        console.error("Erreur lors de l'analyse :", error);
        setLastAnalysisResult("", String(error));
    }
    await awaitPopupClose(popupId);
}
