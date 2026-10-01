// Injected into the message display pane via
// `messenger.scripting.messageDisplay.registerScripts` (background.js).
// Intercepts link clicks in the email body and asks the background what to
// do (open / analyse / cancel).
(function () {
    // The script is re-injected for every displayed message/tab, so guard
    // against registering the listeners twice.
    if (window.__stopFraudLinkInterceptorInstalled) {
        return;
    }
    window.__stopFraudLinkInterceptorInstalled = true;

    let dialogInProgress = false;

    function isRelevantClick(event) {
        if (event.type === "click") return event.button === 0;
        if (event.type === "auxclick") return event.button === 1; // middle click
        return false;
    }

    async function handleClick(event) {
        if (dialogInProgress) return;
        if (!isRelevantClick(event)) return;

        // closest() handles clicks on children of the link (img, span, ...).
        const link = event.target && event.target.closest && event.target.closest("a[href]");
        if (!link) return;

        const url = link.href;
        if (!url) return;
        // Only intercept web links; leave mailto:/news:/etc. untouched.
        if (!/^https?:\/\//i.test(url)) return;

        // Block Thunderbird's default external-browser opening; use the
        // capture phase (addEventListener below) to run before handlers
        // internal to the message display.
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

    document.addEventListener("click", handleClick, true);
    document.addEventListener("auxclick", handleClick, true);
})();
