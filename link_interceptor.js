// Injected into the message display pane via
// `messenger.scripting.messageDisplay.registerScripts` (background.js).
// Intercepts link clicks in the email body and asks the background what to
// do.
(function () {
    // The script is re-injected for every displayed message/tab, so guard
    // against registering the listeners twice.
    if (window.__stopFraudLinkInterceptorInstalled) {
        return;
    }
    window.__stopFraudLinkInterceptorInstalled = true;

    const DATA_ATTR = "data-stop-fraud-href";

    let dialogInProgress = false;
    let interceptLinks = true;

    function isRelevantClick(event) {
        if (event.type === "click") return event.button === 0;
        if (event.type === "auxclick") return event.button === 1; // middle click
        return false;
    }

    // Move href into a data attribute for every web link, so Thunderbird's
    // link click handler ignores them. Keep the look of clickable links via
    // a minimal stylesheet.
    function neutralizeLinks() {
        for (const link of document.querySelectorAll('a[href^="http"]')) {
            link.setAttribute(DATA_ATTR, link.getAttribute("href"));
            link.removeAttribute("href");
        }
        const style = document.createElement("style");
        style.textContent = `a[${DATA_ATTR}] { cursor: pointer; }`;
        document.head.appendChild(style);
    }

    // Give the link back its href for the context menu, so "Copy link
    // location", the built-in phishing check, etc. keep working. The click
    // on the menu item re-triggers Thunderbird's normal link handling.
    function restoreContextLinks(event) {
        const link = event.target && event.target.closest
            ? event.target.closest(`a[${DATA_ATTR}]`)
            : null;
        if (link) {
            link.setAttribute("href", link.getAttribute(DATA_ATTR));
            link.removeAttribute(DATA_ATTR);
        }
    }

    async function handleClick(event) {
        if (dialogInProgress) return;
        if (!isRelevantClick(event)) return;
        if (!interceptLinks) return;

        // closest() handles clicks on children of the link (img, span, ...).
        const target = event.target;
        const link = target && target.closest
            ? target.closest(`a[${DATA_ATTR}]`)
            : null;
        if (!link) return;

        const url = link.getAttribute(DATA_ATTR);
        if (!url || !/^https?:\/\//i.test(url)) return;

        // Block any remaining default handling; use the capture phase
        // (addEventListener below) to run before handlers internal to the
        // message display.
        event.preventDefault();
        event.stopPropagation();

        dialogInProgress = true;
        try {
            // The background shows the dialog and, on "open", opens the URL
            // in the system browser itself (windows.openDefaultBrowser).
            await browser.runtime.sendMessage({
                type: "stop-fraud:link-clicked",
                url: url
            });
        } catch (err) {
            console.error("stop_fraud: link intercept failed:", err);
        } finally {
            dialogInProgress = false;
        }
    }

    // Link interception can be disabled in the configuration page (checked by
    // default => only an explicit false disables it).
    browser.storage.local.get("interceptLinks").then((stored) => {
        interceptLinks = stored.interceptLinks !== false;
        if (interceptLinks) {
            neutralizeLinks();
            document.addEventListener("contextmenu", restoreContextLinks);
        }
    });

    document.addEventListener("click", handleClick, true);
    document.addEventListener("auxclick", handleClick, true);
})();
