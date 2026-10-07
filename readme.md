# Stop fraudulent email in Tunderbird

## What is it?

This plugin use a LLM to detect spam and frodulent email. It sends the complete
email source code to the LLM which provides an advise. To speed up process,
enclosed files are ignored.

The analysis can be triggered manually or when a link is clicked in the email.

![plugin configuration](screenshots/screenshot1.png)
![link click](screenshots/screenshot2.png)
![analysis](screenshots/screenshot2.png)

## How to compile?

npm install
npm build run

## Load plugin in Thunderbird debug mode

Tools --> Developer Tools --> Debug Add-Ons

## Problem with Ollama

It can be necessary to define the Ollama CORS policy by setting the OLLAMA_ORIGINS variable.

OLLAMA_ORIGINS=chrome-extension://*,moz-extension://*,safari-web-extension://* ollama serve

(Source https://docs.ollama.com/faq)


