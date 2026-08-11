window.addEventListener("load", onLoad);

async function notifyMode(event) {
    await messenger.runtime.sendMessage({ 
        popupResponse: event.target.getAttribute("data")
    });
    window.close();
}

async function keepBackgroundAlive() {
    await messenger.runtime.sendMessage({
        ping: true
    });
    // Send a new ping in 10s.
    window.setTimeout(keepBackgroundAlive, 10000);
}

async function chargerIdMessage() {
    console.log("chargerIdMessage");
    try {
        const params = new URLSearchParams(window.location.search);
        const tabId = params.get('tabId');

        console.log(params);
        console.log(tabId);
        
        let messageList;
        if (tabId) {
            messageList = await messenger.messageDisplay.getDisplayedMessages(parseInt(tabId));
        } else {
            messageList = await messenger.messageDisplay.getDisplayedMessages();
        }

        console.log(messageList.messages)
        if (messageList && messageList.messages.length > 0) {
            const msg = messageList.messages[0];
            const messageId = msg.id;
            document.getElementById("messageId").textContent = messageId;
            console.log(msg);

            try {
                // Récupère la chaîne de caractères brute (le format EML complet)
                let rawFile = await messenger.messages.getRaw(messageId);
                let rawText = await rawFile.text();
                console.log(rawText);
            } catch (error) {
                console.error("Erreur lors de la récupération de la source :", error);
            }

        } else {
            document.getElementById("messageId").textContent = "Aucun message sélectionné";
        }
    } catch (error) {
        console.error("Erreur dans la popup :", error);
        document.getElementById("messageId").textContent = "Erreur lors de la récupération";
    }
}

// Exécution au chargement de la popup
async function onLoad() {
    document.getElementById("menu_analyse").addEventListener("click", notifyMode);
    document.getElementById("menu_config").addEventListener("click", notifyMode);
    
    // Charger l'ID de message une fois que le HTML est complètement affiché
    await chargerIdMessage();
    
    keepBackgroundAlive();
}

