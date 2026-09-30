import { initializeModel, emailAnalysis, lastAnalysisResult, setLastAnalysisResult } from './email_analysis.js';
import { createPopup, awaitPopupClose, openConfig } from './view.js';

messenger.menus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "analyse") {
        analyseAndShowResult(tab ? tab.id : null);
    } else if (info.menuItemId === "config") {
        openConfig(tab);
    }
});

messenger.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.getRequest) {
        sendResponse(lastAnalysisResult);
    }
});

async function analyseAndShowResult(tabId = null) {
    setLastAnalysisResult("", "Analyse en cours...");
    // Open popup BEFORE analysis so its keepBackgroundAlive prevents the
    // MV3 event page from being suspended during the long LLM fetch.
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
