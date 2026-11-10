const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class GenerationAPIError extends Error {
  constructor(code, status = 0) {
    super(code || "generation_failed");
    this.name = "GenerationAPIError";
    this.code = code || "generation_failed";
    this.status = status;
  }
}

async function readJSON(response) {
  try {
    return await response.json();
  } catch {
    throw new GenerationAPIError("service_unavailable", response.status);
  }
}

export async function fileToDataURL(file) {
  if (!file) return null;
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new GenerationAPIError("upload_failed"));
    reader.readAsDataURL(file);
  });
}

export class ServerAIProvider {
  constructor({ endpoint = "/api/generations", pollInterval = 3000, maxWait = 240000 } = {}) {
    this.endpoint = endpoint;
    this.pollInterval = pollInterval;
    this.maxWait = maxWait;
  }

  async previewRequest(request) {
    const withoutImageData = {
      ...request,
      sourceImage: request.sourceImage ? { ...request.sourceImage, dataUrl: undefined } : null,
      reference: request.reference ? { ...request.reference, dataUrl: undefined } : null
    };
    const response = await fetch(`${this.endpoint}/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(withoutImageData)
    }).catch(() => { throw new GenerationAPIError("service_unavailable"); });
    const preview = await readJSON(response);
    if (!response.ok) throw new GenerationAPIError(preview.error?.code, response.status);
    return preview.debug;
  }

  async generateImage(request, onStage = () => {}) {
    onStage("submitting");
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    }).catch(() => { throw new GenerationAPIError("service_unavailable"); });
    const submitted = await readJSON(response);
    if (!response.ok) throw new GenerationAPIError(submitted.error?.code, response.status);

    onStage("running", { taskId: submitted.taskId });
    const started = Date.now();
    while (Date.now() - started < this.maxWait) {
      await wait(this.pollInterval);
      const queryResponse = await fetch(`${this.endpoint}/${encodeURIComponent(submitted.taskId)}`)
        .catch(() => { throw new GenerationAPIError("service_unavailable"); });
      const task = await readJSON(queryResponse);
      if (!queryResponse.ok) throw new GenerationAPIError(task.error?.code, queryResponse.status);
      if (task.status === "SUCCESS") {
        const outputs = (task.results || []).filter((item) => item.url);
        if (!outputs.length) throw new GenerationAPIError("generation_failed");
        return {
          id: submitted.taskId,
          taskId: submitted.taskId,
          provider: submitted.provider,
          channel: submitted.channel,
          imageUrl: outputs[0].url,
          imageUrls: outputs.map((item) => item.url),
          outputType: outputs[0].outputType || null,
          pricing: task.pricing || submitted.pricing || null,
          debug: submitted.debug || task.debug || null,
          createdAt: new Date().toISOString()
        };
      }
      if (task.status === "FAILED") throw new GenerationAPIError(task.error?.code || "generation_failed");
      if (task.status === "TIMEOUT") throw new GenerationAPIError("generation_timeout");
      onStage("running", { taskId: submitted.taskId, providerStatus: task.status });
    }
    throw new GenerationAPIError("generation_timeout");
  }
}
