// Tests that the IO Intelligence catalog is injected next to the models.dev snapshot.

import { expect } from "bun:test"
import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"
import * as CoreModels from "@opencode-ai/core/models-dev"
import { ModelsDev } from "../../src/provider/models"
import { ModelCache } from "../../src/provider/model-cache"
import { Provider } from "../../src/provider/provider"
import { Auth } from "../../src/auth"
import { CatalogProvider, DEFAULT_MODEL_ID, PROVIDER_ID, overlay } from "../../src/kilocode/provider/ionet"
import { TestConfig } from "../fixture/config"
import { testEffect } from "../lib/effect"
import { provideInstance, testInstanceStoreLayer } from "../fixture/fixture"

function layer(seed: Record<string, ModelsDev.Provider> = {}) {
  const cfg = TestConfig.layer({ get: () => Effect.succeed({ disabled_providers: ["kilo"] }) })
  const auth = Layer.mock(Auth.Service)({ get: () => Effect.succeed(undefined) })
  const kiloModels = Layer.succeed(
    ModelCache.KiloModelsService,
    ModelCache.KiloModelsService.of({ fetch: () => Effect.succeed({ models: {} }) }),
  )
  const cache = Layer.fresh(ModelCache.layer).pipe(
    Layer.provide(FetchHttpClient.layer),
    Layer.provide(cfg),
    Layer.provide(auth),
    Layer.provide(kiloModels),
  )
  const core = Layer.succeed(
    CoreModels.Service,
    CoreModels.Service.of({ get: () => Effect.succeed(seed), refresh: () => Effect.void }),
  )
  return Layer.fresh(ModelsDev.layer).pipe(
    Layer.provide(core),
    Layer.provide(FetchHttpClient.layer),
    Layer.provide(cfg),
    Layer.provide(auth),
    Layer.provide(cache),
  )
}

const it = testEffect(testInstanceStoreLayer)

it.live("injects the IO Intelligence catalog with its static models", () =>
  Effect.gen(function* () {
    const providers = yield* ModelsDev.Service.use((models) => models.get()).pipe(
      Effect.provide(layer()),
      provideInstance(process.cwd()),
    )

    expect(providers[PROVIDER_ID]).toMatchObject({
      id: PROVIDER_ID,
      name: "IO Intelligence",
      env: ["IONET_API_KEY"],
      api: "https://api.intelligence.io.solutions/api/v1",
      npm: "@ai-sdk/openai-compatible",
    })
    const ids = Object.keys(providers[PROVIDER_ID].models)
    expect(ids.length).toBeGreaterThanOrEqual(10)
    expect(ids).toContain(DEFAULT_MODEL_ID)
    expect(ids).toContain("deepseek-ai/DeepSeek-R1-0528")
    expect(ids).toContain("moonshotai/Kimi-K3")
    expect(providers[PROVIDER_ID].models[DEFAULT_MODEL_ID]).toMatchObject({
      id: DEFAULT_MODEL_ID,
      attachment: false,
      reasoning: true,
      tool_call: true,
      cost: { input: 0.309, output: 1.236, cache_read: 0.1545 },
      limit: { context: 262124, output: 131072 },
    })
  }),
)

it.live("prefers a models.dev IO Intelligence entry over the bundled catalog", () =>
  Effect.gen(function* () {
    const seeded: ModelsDev.Provider = {
      id: PROVIDER_ID,
      name: "IO Intelligence (remote)",
      env: ["IONET_API_KEY"],
      models: {},
    }
    const providers = yield* ModelsDev.Service.use((models) => models.get()).pipe(
      Effect.provide(layer({ [PROVIDER_ID]: seeded })),
      provideInstance(process.cwd()),
    )

    expect(providers[PROVIDER_ID].name).toBe("IO Intelligence (remote)")
    expect(Object.keys(providers[PROVIDER_ID].models)).toEqual([])
  }),
)

it.effect("keeps snapshot entries and adds the catalog only when missing", () =>
  Effect.sync(() => {
    const existing: Record<string, ModelsDev.Provider> = {
      [PROVIDER_ID]: { id: PROVIDER_ID, name: "custom", env: [], models: {} },
    }
    expect(overlay(existing)[PROVIDER_ID].name).toBe("custom")
    expect(overlay({})[PROVIDER_ID]).toBe(CatalogProvider)
  }),
)

it.effect("maps the static model into provider catalog capabilities", () =>
  Effect.sync(() => {
    const info = Provider.fromModelsDevProvider(CatalogProvider)
    const model = info.models[DEFAULT_MODEL_ID]

    expect(info.name).toBe("IO Intelligence")
    expect(model.api).toMatchObject({
      id: DEFAULT_MODEL_ID,
      url: "https://api.intelligence.io.solutions/api/v1",
      npm: "@ai-sdk/openai-compatible",
    })
    expect(model.capabilities).toMatchObject({
      temperature: true,
      reasoning: true,
      attachment: false,
      toolcall: true,
    })
    expect(model.capabilities.input.image).toBe(false)
    expect(model.cost).toMatchObject({ input: 0.309, output: 1.236, cache: { read: 0.1545, write: 0 } })
    expect(model.limit).toMatchObject({ context: 262124, output: 131072 })
  }),
)

it.effect("marks vision models with image input and attachment", () =>
  Effect.sync(() => {
    const info = Provider.fromModelsDevProvider(CatalogProvider)
    const model = info.models["zai-org/GLM-5.3-Flash"]

    expect(model.capabilities.input.image).toBe(true)
    expect(model.capabilities.attachment).toBe(true)
  }),
)
