---
title: "Using IO Intelligence with Kilo Code | Open-Weight Models from io.net"
description: "Connect Kilo Code to IO Intelligence, io.net's OpenAI-compatible API for open-weight models like DeepSeek, GLM, Kimi, Qwen and Llama."
sidebar_label: IO Intelligence
---

# Using IO Intelligence With Kilo Code

[IO Intelligence](https://io.net/intelligence) is io.net's managed API for open-weight models. One OpenAI-compatible endpoint serves DeepSeek, GLM, Kimi, Qwen, Llama, GPT-OSS and more, with per-model prompt caching.

**Website:** [https://io.net/intelligence](https://io.net/intelligence)

## Getting an API Key

Create an API key in the IO Intelligence console: [io.net/docs/guides/intelligence/api-keys-and-secrets](https://io.net/docs/guides/intelligence/api-keys-and-secrets). Store the key securely.

## Configuration in Kilo Code

{% tabs %}
{% tab label="VSCode" %}

Open **Settings** (gear icon) and go to the **Providers** tab to add **IO Intelligence** and enter your API key.

The extension stores this in your `kilo.json` config file. You can also edit the config file directly — see the **CLI** tab for the file format.

{% /tab %}
{% tab label="CLI" %}

Set the API key as an environment variable or configure it in your `kilo.json` config file:

**Environment variable:**

```bash
export IONET_API_KEY="***"
```

**Config file** (`~/.config/kilo/kilo.json` or `./kilo.json`):

```jsonc
{
  "provider": {
    "ionet": {
      "env": ["IONET_API_KEY"]
    }
  }
}
```

Then set your default model:

```jsonc
{
  "model": "ionet/deepseek-ai/DeepSeek-V4.1-Flash"
}
```

{% /tab %}
{% /tabs %}

## Supported Models

IO Intelligence serves an `org/name` model catalog. The bundled snapshot below covers the current flagship models; the endpoint always serves the full, current list at `https://api.intelligence.io.solutions/api/v1/models`, and any of those IDs can be used by entering them as a custom model.

| Model                                        | Context   | Max output | Input     | Output    | Cache reads |
| -------------------------------------------- | --------- | ---------- | --------- | --------- | ----------- |
| `deepseek-ai/DeepSeek-V4.1-Flash`            | 262,124   | 131,072    | $0.31 / M | $1.24 / M | $0.15 / M  |
| `deepseek-ai/DeepSeek-V4-Pro`                | 1,048,576 | 600,000    | $1.70 / M | $3.40 / M | $0.85 / M  |
| `deepseek-ai/DeepSeek-R1-0528`               | 128,000   | 32,768\*   | $0.57 / M | $2.28 / M | $0.28 / M  |
| `zai-org/GLM-5.3`                            | 262,144   | 131,072    | $1.66 / M | $5.28 / M | $0.83 / M  |
| `zai-org/GLM-5.3-Flash` (image input)        | 262,144   | 131,072    | $0.21 / M | $0.70 / M | $0.11 / M  |
| `moonshotai/Kimi-K3` (image input)           | 1,048,576 | 32,768\*   | $3.05 / M | $15.35 / M | $1.53 / M |
| `moonshotai/Kimi-K2.7-Code` (image input)    | 262,144   | 32,768\*   | $1.07 / M | $4.65 / M | $0.54 / M  |
| `Qwen/Qwen3.8-27B` (image input)             | 65,536    | 65,536     | $0.35 / M | $2.62 / M | $0.17 / M  |
| `Qwen/Qwen3-Next-80B-A3B-Instruct`           | 262,144   | 32,768\*   | $0.12 / M | $1.14 / M | $0.06 / M  |
| `openai/gpt-oss-120b`                        | 131,072   | 32,768\*   | $0.18 / M | $0.68 / M | $0.09 / M  |
| `meta-llama/Llama-3.3-70B-Instruct`          | 128,000   | 32,768\*   | $0.61 / M | $1.04 / M | $0.30 / M  |

\* The endpoint does not publish a max output token limit for these models; Kilo Code uses a conservative 32k output budget. Requests can raise it if the deployment accepts more.

The base URL is fixed: `https://api.intelligence.io.solutions/api/v1`.

## Tips and Notes

- **Model IDs are `org/name`:** always use the full ID (e.g. `deepseek-ai/DeepSeek-V4.1-Flash`), not just the model name.
- **Prompt caching:** cached prompt reads are billed at the reduced cache-read rate shown above.
- **Chat Completions only:** IO Intelligence serves the OpenAI Chat Completions API. Responses, embeddings and audio endpoints are not available.
- **Live catalog:** `GET https://api.intelligence.io.solutions/api/v1/models` returns the current model list with prices and context windows.

## Troubleshooting

- **Invalid API key:** Verify `IONET_API_KEY` is set in the same environment that launches Kilo, or reconnect the provider in Settings.
- **Unknown model:** Model IDs must match the live catalog exactly (`org/name`). Check the ID against the `/models` endpoint, then retry.
- **Rate limits:** IO Intelligence applies per-tier rate limits; if requests fail with 429, check your tier in the io.net console and retry after the window resets.
