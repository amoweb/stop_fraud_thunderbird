# Privacy Policy — Stop Fraud Thunderbird

Last updated: 2026-10-22

## What data the add-on processes

When you trigger an analysis (manually, or after clicking a link in an email
and choosing "Analyse"), the add-on reads the **complete source code of the
currently displayed email** (headers and body). Attachments (PDF, images,
archives, office documents, etc.) are stripped locally before anything is
sent.

## Where that data is sent

The email content is sent **only to the AI (LLM) provider that you choose and
configure yourself** in the add-on's options page. Depending on your
configuration, this may be one of:

- Anthropic (`api.anthropic.com`)
- OpenAI (`api.openai.com`)
- Google Generative AI (`generativelanguage.googleapis.com`)
- xAI (`api.x.ai`)
- Groq (`api.groq.com`)
- Mistral (`api.mistral.ai`)
- DeepSeek (`api.deepseek.com`)
- Lyceum (`api.lyceum.technology`)
- Scaleway (`api.scaleway.ai`)
- OVH (`eu.api.ovh.com`)
- **Local providers** (Ollama, LM Studio, or any OpenAI-compatible server),
  in which case the data stays on your own machine or on a server of your
  choice.

The request is made with the API key you provide. Each provider processes the
data according to its own privacy policy, which you should review. When using
a local provider, no email content leaves your computer.

## What the add-on does NOT do

- It does not collect, transmit, or store any data on the add-on author's
  servers. The author receives nothing.
- It does not send any analytics, telemetry, or usage statistics.
- It does not read any email without an explicit user action.
- It does not share data with any third party other than the LLM provider
  configured by the user.

## How data is stored

- Your configuration (API key, provider name, model name, custom base URL) is
  stored locally using Thunderbird's `storage.local` API and never leaves
  your machine, except that the API key is transmitted to the configured
  provider to authenticate your own requests.
- Analysis results are kept only in memory and are discarded; they are not
  saved to disk.

## Contact

Project page: https://github.com/amoweb/stop_fraud_thunderbird

Please open an issue there for any privacy-related question.
