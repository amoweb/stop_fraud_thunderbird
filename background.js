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
        awaitPopup(tab ? tab.id : null);
    } else if (info.menuItemId === "config") {
        openConfig(tab);
    }
});

// Function to open a popup and await user feedback
async function awaitPopup(tabId = null) {
    async function popupPrompt(popupId, defaultResponse) {
        try {
            await messenger.windows.get(popupId);
        } catch (e) {
            // Window does not exist, assume closed.
            return defaultResponse;
        }
        return new Promise(resolve => {
            let response = defaultResponse;
            function windowRemoveListener(closedId) {
                if (popupId == closedId) {
                    messenger.windows.onRemoved.removeListener(windowRemoveListener);
                    messenger.runtime.onMessage.removeListener(messageListener);
                    resolve(response);
                }
            }
            function messageListener(request, sender, sendResponse) {
                if (sender.tab.windowId != popupId || !request) {
                    return;
                }

                if (request.popupResponse) {
                    response = request.popupResponse;
                }
                if (request.ping) {
                    console.log("Background ping")
                }
            }
            messenger.runtime.onMessage.addListener(messageListener);
            messenger.windows.onRemoved.addListener(windowRemoveListener);
        });
    }

    let window = await messenger.windows.create({
        url: "popup.html?tabId=" + (tabId || ""),
        type: "popup",
        height: 280,
        width: 390,
        allowScriptsToClose: true,
    });
    // Wait for the popup to be closed and define a default return value if the
    // window is closed without clicking a button.
    let rv = await popupPrompt(window.id, "cancel");
    console.log(rv);
}

async function openConfig(tab) {
    await messenger.windows.create({
        url: "config.html",
        type: "popup",
        height: 510,
        width: 450,
        allowScriptsToClose: true,
    });
}
