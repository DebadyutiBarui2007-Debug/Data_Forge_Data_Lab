/**
 * Professional Backend Client Service
 * Connects the frontend UI to the Express server for heavy compute and AI interpretability.
 */

export interface LatentInterpretationRequest {
  latentVector: number[];
  sparsityThreshold?: string;
  contextPhase?: string;
}

export interface BenchmarkRequest {
  sequenceLength: number;
  dimension: number;
}

export interface BenchmarkResponse {
  sequenceLength: number;
  dimension: number;
  kvCacheMemoryMB: string;
  bdhMemoryMB: string;
  computeLatencyMs: string;
  memorySavedPercent: string;
  serverTimestamp: number;
}

export class BackendClient {
  /**
   * Sends a sparse latent activation vector to the server for Gemini-powered Mechanistic Interpretability.
   */
  static async interpretLatentState(data: LatentInterpretationRequest): Promise<string> {
    try {
      const response = await fetch('/api/interpret-latent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('Gemini API key missing on server.');
        }
        throw new Error(`Server error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.interpretation;
    } catch (error: any) {
      console.error('Failed to interpret latent state:', error);
      throw error;
    }
  }

  /**
   * Offloads scaling benchmark computations to the Node.js server.
   */
  static async runComputeBenchmark(data: BenchmarkRequest): Promise<BenchmarkResponse> {
    try {
      const response = await fetch('/api/compute/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Failed to run compute benchmark:', error);
      throw error;
    }
  }
}
