---
title: "Using IO Intelligence with Kilo Code | Open-Weight Models from io.net"
description: "Connect Kilo Code to IO Intelligence, io.net's OpenAI-compatible API for open-weight models like DeepSeek, GLM, Kimi, Qwen and Llama."
sidebar_label: IO Intelligence
---

# Using IO Intelligence With Kilo Code

[IO Intelligence](https://io.net/intelligence) is io.net's managed API for open-weight models. One OpenAI-compatible endpoint serves DeepSeek, GLM, Kimi, Qwen, Llama, GPT-OSS and more, with per-model prompt caching.

Kilo Code includes IO Intelligence in its provider catalog as **IO.NET** (provider id `io-net`), so no plugin or extra install is needed: set your API key and pick a model.

**Website:** [https://io.net/intelligence](https://io.net/intelligence)

## Getting an API Key

Create an API key in the IO Intelligence console: [io.net/docs/guides/intelligence/api-keys-and-secrets](https://io.net/docs/guides/intelligence/api-keys-and-secrets). Store the key securely.

## Connect Kilo Code

{% tabs %}
{% tab label="VS Code" %}

Open **Settings** (gear icon) and go to the **Providers** tab to add **IO.NET** and enter your API key. The extension stores the key in Kilo's auth store (`~/.local/share/kilo/auth.json`), not `kilo.json`; the **CLI** tab shows the equivalent environment-variable setup.

{% /tab %}
{% tab label="CLI" %}

Set the API key as an environment variable:

```bash
export IOINTELLIGENCE_API_KEY="your-api-key"
```

The provider appears as `io-net` (displayed as **IO.NET**). List its models with:

```bash
kilo models io-net
```

Then set your default model in your `kilo.json` config file (`~/.config/kilo/kilo.json` or `./kilo.json`):

```jsonc
{
  "model": "io-net/deepseek-ai/DeepSeek-R1-0528"
}
```

{% /tab %}
{% /tabs %}

## Choosing Models

Model IDs are `org/name` pairs, for example `deepseek-ai/DeepSeek-R1-0528`. The provider's model list comes from Kilo's provider catalog, not from the endpoint: the two evolve independently, and io.net can retire a cataloged model server-side at any time. If a model fails with an unknown-model error, check the live list at `https://api.intelligence.io.solutions/api/v1/models` (readable without a key, with current per-token pricing) and use an ID from there. Model IDs that are served but missing from the catalog must be declared as custom models under `provider.io-net.models` in `kilo.json` before they can be used as `io-net/<org>/<name>` strings.

Some models require a higher io.net access tier. The example default `deepseek-ai/DeepSeek-R1-0528` needs access tier 2 or above (see `min_access_tier` on the `/models` endpoint); if your account is on the base tier, start with a tier-1 model such as `openai/gpt-oss-20b` or `meta-llama/Llama-3.3-70B-Instruct`, or raise your tier in the io.net console.

{% callout type="note" %}
Catalog entries, pricing, and context limits can lag the endpoint or reference models io.net has retired; the `/models` endpoint is authoritative.
{% /callout %}

## Tips and Notes

- **Model IDs are `org/name`:** always use the full ID (for example `deepseek-ai/DeepSeek-R1-0528`), not just the model name.
- **Prompt caching:** most models support it and cached prompt reads are billed at a reduced rate; check `supports_prompt_cache` on the `/models` endpoint for a given model (for example, `deepseek-ai/DeepSeek-R1-0528` does not use it).
- **Chat Completions only:** IO Intelligence serves the OpenAI Chat Completions API, and Kilo Code talks to it over the chat completions endpoint; Kilo's model list comes from its provider catalog, not the endpoint. The Responses API is not available (the endpoint returns 404 for `/v1/responses`).
- **Base URL:** `https://api.intelligence.io.solutions/api/v1` (fixed).

## Troubleshooting

- **IO.NET is not listed:** the provider only appears once your API key is available. Verify `IOINTELLIGENCE_API_KEY` is set in the same environment that launches Kilo, or that the key was saved from the VS Code settings.
- **Invalid API key:** requests fail with a 401 error. Re-create the key in the io.net console and update the environment variable or provider settings.
- **Unknown model:** model IDs must match the live catalog exactly (`org/name`). Check the ID against the `/models` endpoint, then retry.
- **Rate limits:** IO Intelligence applies per-tier rate limits; if requests fail with 429, check your tier in the io.net console and retry after the window resets.
