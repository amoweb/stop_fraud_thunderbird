// Menu items for the menu-typed action and message_display_action buttons.
messenger.menus.create({
    id: "analyse",
    title: messenger.i18n.getMessage("menuAnalyse"),
    contexts: ["action_menu", "message_display_action_menu"]
});

messenger.menus.create({
    id: "config",
    title: messenger.i18n.getMessage("menuConfig"),
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

// Awaits the closure of a popup window, resolving with the response the popup
// sent in `request[responseField]` (defaultResponse if it closes without one).
function awaitPopupResponse(popupId, responseField, defaultResponse) {
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
            if ((sender.tab && sender.tab.windowId != popupId) || !request) {
                return;
            }

            if (request[responseField] !== void 0) {
                response = request[responseField];
            }
        }
        messenger.runtime.onMessage.addListener(messageListener);
        messenger.windows.onRemoved.addListener(windowRemoveListener);
    });
}

// Function to open a popup and await user feedback
export async function awaitPopupClose(popupId) {
    let rv = await awaitPopupResponse(popupId, "popupResponse", "cancel");
    console.log(rv);
}

// Creates the link-intercept dialog showing the destination URL.
export async function createLinkDialog(url) {
    const encoded = encodeURIComponent(url);
    const win = await messenger.windows.create({
        url: `link_dialog.html?url=${encoded}`,
        type: "popup",
        height: 400,
        width: 600,
        allowScriptsToClose: true
    });
    return win.id;
}

// Awaits the user's choice in the link-intercept dialog:
// "open", "analyse" or "cancel".
export async function awaitLinkDialog(popupId) {
    return awaitPopupResponse(popupId, "linkDialogResponse", "cancel");
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
