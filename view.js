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

export async function createPopup() {
    const win = await messenger.windows.create({
        url: "popup.html",
        type: "popup",
        height: 800,
        width: 800,
        allowScriptsToClose: true
    });
    return win.id;
}

// Function to open a popup and await user feedback
export async function awaitPopupClose(popupId) {
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

export async function openConfig(tab) {
    await messenger.windows.create({
        url: "config.html",
        type: "popup",
        height: 510,
        width: 450,
        allowScriptsToClose: true
    });
}
