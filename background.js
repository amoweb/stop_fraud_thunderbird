import { z } from 'zod/v4';
import { mistral } from '@ai-sdk/mistral';
import { generateText } from 'ai';

// Disable Zod's JIT evaluation (`new Function`), which is blocked by the
// extension CSP (`script-src 'self'`) and logs CSP violations to the console.
z.config({ jitless: true });

let model = null;
let lastAnalysisResult = { messageId: "", result: "" };

// Menu items for the menu-typed action and message_display_action buttons.
messenger.menus.create({
    id: "analyse",
    title: "Analyse",
    contexts: ["action_menu", "message_display_action_menu"]
});

messenger.menus.create({
    id: "config",
    title: "Config",
    contexts: ["action_menu", "message_display_action_menu"]
});

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

// Function to open a popup and await user feedback
async function awaitPopupClose(popupId) {
    async function popupPrompt(popupId, defaultResponse) {
        try {
            await messenger.windows.get(popupId);
        } catch (e) {
            // Window does not exist, assume closed.
            return defaultResponse;
        }
        return new Promise((resolve) => {
            let response = defaultResponse;
            function windowRemoveListener(closedId) {
                if (popupId == closedId) {
                    messenger.windows.onRemoved.removeListener(windowRemoveListener);
                    messenger.runtime.onMessage.removeListener(messageListener);
                    resolve(response);
                }
            }
            function messageListener(request, sender, sendResponse) {
                if (sender.tab && sender.tab.windowId != popupId || !request) {
                    return;
                }

                if (request.popupResponse) {
                    response = request.popupResponse;
                }
                if (request.ping) {
                    console.log("Background ping");
                }
            }
            messenger.runtime.onMessage.addListener(messageListener);
            messenger.windows.onRemoved.addListener(windowRemoveListener);
        });
    }
    let rv = await popupPrompt(popupId, "cancel");
    console.log(rv);
}

async function analyseAndShowResult(tabId = null) {
    lastAnalysisResult = { messageId: "", result: "Analyse en cours..." };
    // Open popup BEFORE analysis so its keepBackgroundAlive prevents the
    // MV3 event page from being suspended during the long LLM fetch.
    const popupId = await createPopup();
    try {
        await initializeModel();
        await emailAnalysis(tabId);
    } catch (error) {
        console.error("Erreur lors de l'analyse :", error);
        lastAnalysisResult = { messageId: "", result: String(error) };
    }
    await awaitPopupClose(popupId);
}

async function createPopup() {
    const win = await messenger.windows.create({
        url: "popup.html",
        type: "popup",
        height: 280,
        width: 390,
        allowScriptsToClose: true
    });
    return win.id;
}

async function emailAnalysis(tabId) {
    console.log("emailAnalysis");
    try {
        let messageList;
        if (tabId) {
            messageList = await messenger.messageDisplay.getDisplayedMessages(parseInt(tabId));
        } else {
            messageList = await messenger.messageDisplay.getDisplayedMessages();
        }

        if (messageList && messageList.messages.length > 0) {
            const msg = messageList.messages[0];
            const messageId = msg.id;
            console.log(msg);

            let rawText;
            try {
                // Récupère la chaîne de caractères brute (le format EML complet)
                let rawFile = await messenger.messages.getRaw(messageId);
                rawText = await rawFile.text();
            } catch (error) {
                console.error("Erreur lors de la récupération de la source :", error);
                lastAnalysisResult = { messageId: "", result: "Erreur lors de la récupération de la source" };
                return;
            }

            try {
                const { answer } = await generateText({
                    model,
                    prompt: "Dis-moi si ce mail est légitime: " + rawText,
                });

                lastAnalysisResult = { messageId: String(messageId), result: answer };
            } catch (error) {
                console.error("Erreur lors de l'analyse :", error);
                lastAnalysisResult = { messageId: String(messageId), result: "Erreur lors de l'analyse " + String(error) };
            }
        } else {
            lastAnalysisResult = { messageId: "Aucun message sélectionné", result: "" };
        }
    } catch (error) {
        console.error("Erreur dans l'analyse :", error);
        lastAnalysisResult = { messageId: "Erreur lors de la récupération", result: "" };
    }
}

async function initializeModel() {
    const stored = await messenger.storage.local.get(["apiKey", "llmProvider", "modelName"]);
    const llmProvider = stored.llmProvider || "anthropic";
    const apiKey = stored.apiKey || "";
    const modelName = stored.modelName || "";


    switch (llmProvider)
    {
        case "mistral":
            const mistral = createMistral({ apiKey: apiKey });
            model = mistral('mistral-large-latest');
            break;
    }
}

async function openConfig(tab) {
    await messenger.windows.create({
        url: "config.html",
        type: "popup",
        height: 510,
        width: 450,
        allowScriptsToClose: true
    });
}
