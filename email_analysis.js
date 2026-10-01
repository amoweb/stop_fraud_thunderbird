import { z } from 'zod/v4';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createXai } from '@ai-sdk/xai';
import { generateText } from 'ai';

// Disable Zod's JIT evaluation (`new Function`), which is blocked by the
// extension CSP (`script-src 'self'`) and logs CSP violations to the console.
z.config({ jitless: true });

let model = null;

export const lastAnalysisResult = { messageId: "", result: "" };

export function setLastAnalysisResult(messageId, result) {
    lastAnalysisResult.messageId = messageId;
    lastAnalysisResult.result = result;
}

export async function initializeModel() {
    const stored = await messenger.storage.local.get(["apiKey", "llmProvider", "modelName", "baseURL"]);
    const llmProvider = stored.llmProvider || "anthropic";
    const apiKey = stored.apiKey || "";
    const modelName = stored.modelName || "";
    const baseURL = stored.baseURL || "";


    switch (llmProvider)
    {
        case "anthropic": {
            const provider = createAnthropic({ apiKey: apiKey });
            model = provider(modelName || 'claude-sonnet-4-5');
            break;
        }
        case "deepseek": {
            const provider = createDeepSeek({ apiKey: apiKey });
            model = provider(modelName || 'deepseek-chat');
            break;
        }
        case "google": {
            const provider = createGoogleGenerativeAI({ apiKey: apiKey });
            model = provider(modelName || 'gemini-2.5-flash');
            break;
        }
        case "groq": {
            const provider = createGroq({ apiKey: apiKey });
            model = provider(modelName || 'llama-3.3-70b-versatile');
            break;
        }
        case "openai-compatible": {
            const provider = createOpenAICompatible({
                name: "lmstudio",
                baseURL: baseURL || "http://localhost:1234/v1",
                apiKey: apiKey || "lm-studio",
            });
            model = provider(modelName || 'default');
            break;
        }
        case "mistral": {
            const provider = createMistral({ apiKey: apiKey });
            model = provider(modelName || 'mistral-large-latest');
            break;
        }
        case "ollama": {
            const provider = createOpenAICompatible({
                name: "ollama",
                baseURL: "http://localhost:11434/v1",
                apiKey: apiKey || "ollama",
            });
            model = provider(modelName || 'llama3.2');
            break;
        }
        case "openai": {
            const provider = createOpenAI({ apiKey: apiKey });
            model = provider(modelName || 'gpt-5-mini');
            break;
        }
        case "xai": {
            const provider = createXai({ apiKey: apiKey });
            model = provider(modelName || 'grok-4-fast');
            break;
        }
        default:
            throw new Error(messenger.i18n.getMessage("unsupportedProvider") + llmProvider);
    }

    if (!model) {
        throw new Error(messenger.i18n.getMessage("modelNotInitialized"));
    }
}

export async function emailAnalysis(tabId) {
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
                setLastAnalysisResult("", messenger.i18n.getMessage("errorFetchingSource"));
                return;
            }

            // Supprime les pièces jointes avant l'analyse
            rawText = removeMimeJoinedFile(rawText);

            const prompt = browser.i18n.getMessage("promptEmailAnalysis", [
                new Date().toLocaleDateString('fr-FR'), 
                rawText 
            ]);
            console.log(prompt);

            try {
                const { text } = await generateText({
                    model,
                    maxRetries: 0, // fail fast: show rate-limit/API errors immediately instead of 3 hidden attempts
                    prompt: prompt,
                });

                setLastAnalysisResult(String(messageId), text);
                console.log(text);
            } catch (error) {
                console.error("Erreur lors de l'analyse :", error);
                setLastAnalysisResult(String(messageId), messenger.i18n.getMessage("errorDuringAnalysis") + " " + String(error));
            }
        } else {
            setLastAnalysisResult("", messenger.i18n.getMessage("noMessageSelected"));
        }
    } catch (error) {
        console.error("Erreur dans l'analyse :", error);
        setLastAnalysisResult("", messenger.i18n.getMessage("errorInAnalysis") + " " + String(error));
    }
}

// Enlève les pièces jointes avant l'analyse
export function removeMimeJoinedFile(raw) {
    console.log(raw);
    const regex = /^--[^\r\n]*\r?\n(?:[A-Za-z-]+:[^\r\n]*\r?\n|[ \t][^\r\n]*\r?\n)*Content-Type:[^\r\n]*(?:pdf|image|zip)[^\r\n]*\r?\n(?:[A-Za-z-]+:[^\r\n]*\r?\n|[ \t][^\r\n]*\r?\n)*\r?\n(?:[A-Za-z0-9+/=]{1,76}\r?\n)+/gmi;
    const cleaned = raw.replace(regex, '');
    console.log(cleaned);
    return cleaned;
}
