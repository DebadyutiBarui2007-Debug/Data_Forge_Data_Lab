/**
 * BDH Fast-Weights & Catastrophic Forgetting Simulation Engine
 * Runs sequence tasks (Associative Recall, Rule-Shift / Task Switch) and measures Hebbian memory, interference, and KV-cache comparison.
 */

import { FastWeightsConfig, FastWeightsStepResult } from '../types';
import {
  applySparsityReLU,
  createRandomMatrix,
  createZeroMatrix,
  dotProduct,
  matrixFrobeniusNorm,
  matrixVectorMult,
  softmax,
  updateHebbianFastWeights
} from './matrixEngine';

// Vocabulary for simulation tokens
const VOCAB = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'X', 'Y', 'Z', '0', '1', '2', '3', '4'];

// Deterministic embedding mapping from token to vector
function tokenToVector(token: string, dim: number): number[] {
  const charCode = token.charCodeAt(0);
  const vec = new Array(dim).fill(0);
  for (let i = 0; i < dim; i++) {
    // Orthogonal-ish deterministic features
    vec[i] = Math.sin((charCode * (i + 1) * 0.777)) * 1.2;
  }
  return vec;
}

function vectorToToken(vec: number[]): string {
  let bestToken = VOCAB[0];
  let maxDot = -Infinity;

  for (const t of VOCAB) {
    const tVec = tokenToVector(t, vec.length);
    const score = dotProduct(vec, tVec);
    if (score > maxDot) {
      maxDot = score;
      bestToken = t;
    }
  }
  return bestToken;
}

export function runFastWeightsSimulation(config: FastWeightsConfig): FastWeightsStepResult[] {
  const {
    plasticityRate,
    decayConstant,
    sparsityThreshold,
    sequenceLength,
    dimension,
    task,
    useSparseActivations
  } = config;

  // Initialize slow weights (pre-trained static knowledge)
  const W_slow = createRandomMatrix(dimension, dimension, 0.15);
  let A_t = createZeroMatrix(dimension, dimension); // Hebbian fast weights initialized to 0

  const results: FastWeightsStepResult[] = [];

  // Generate sequence based on task
  const sequence: { input: string; target: string; isTask1: boolean }[] = [];

  if (task === 'associative-recall') {
    // E.g. A->1, B->2, C->3 ... then query A? -> 1, B? -> 2
    const keys = ['A', 'B', 'C', 'D', 'E', 'F'];
    const vals = ['1', '2', '3', '4', '0', '2'];
    
    // Bindings
    for (let i = 0; i < Math.min(sequenceLength, keys.length * 2); i++) {
      const idx = i % keys.length;
      sequence.push({ input: keys[idx], target: vals[idx], isTask1: true });
      sequence.push({ input: vals[idx], target: vals[idx], isTask1: true });
    }
    // Repeat queries
    let stepCount = sequence.length;
    while (stepCount < sequenceLength) {
      const idx = stepCount % keys.length;
      sequence.push({ input: keys[idx], target: vals[idx], isTask1: true });
      stepCount++;
    }
  } else {
    // Task 2: Rule-Shift (Prefix Reversal for 1st half, Suffix Reversal for 2nd half)
    const midPoint = Math.floor(sequenceLength / 2);
    for (let i = 0; i < sequenceLength; i++) {
      const isFirstPhase = i < midPoint;
      const key = VOCAB[i % 8];
      const target1 = VOCAB[(i + 3) % 8]; // Task 1 rule
      const target2 = VOCAB[(i + 6) % 8]; // Task 2 rule (Shifted)

      sequence.push({
        input: key,
        target: isFirstPhase ? target1 : target2,
        isTask1: isFirstPhase
      });
    }
  }

  // Track accuracy history
  let task1Correct = 0;
  let task1Total = 0;
  let task2Correct = 0;
  let task2Total = 0;

  for (let t = 0; t < sequence.length; t++) {
    const item = sequence[t];
    const x_vec = tokenToVector(item.input, dimension);

    // Apply BDH Sparsity if enabled
    let processed_x = x_vec;
    let activeNeuronCount = dimension;
    let activeNeuronPercent = 100;

    if (useSparseActivations) {
      const sparseRes = applySparsityReLU(x_vec, sparsityThreshold);
      processed_x = sparseRes.sparseVec;
      activeNeuronCount = sparseRes.activeCount;
      activeNeuronPercent = (activeNeuronCount / dimension) * 100;
    }

    // Query & Key projection
    const q_t = matrixVectorMult(W_slow, processed_x);
    const k_t = processed_x;
    const v_t = tokenToVector(item.target, dimension);

    // Compute model output BEFORE writing fast weight (predictive memory check)
    // Output = (W_slow + A_t) * q_t
    const combinedWeights: number[][] = [];
    for (let r = 0; r < dimension; r++) {
      const row: number[] = [];
      for (let c = 0; c < dimension; c++) {
        row.push(W_slow[r][c] + A_t[r][c]);
      }
      combinedWeights.push(row);
    }

    const outVec = matrixVectorMult(combinedWeights, q_t);
    const predictedToken = vectorToToken(outVec);
    const isCorrect = predictedToken === item.target;

    // Record accuracy metrics
    if (item.isTask1) {
      task1Total++;
      if (isCorrect) task1Correct++;
    } else {
      task2Total++;
      if (isCorrect) task2Correct++;
    }

    // Update Hebbian Fast Weights with new binding (q_t, v_t)
    A_t = updateHebbianFastWeights(A_t, q_t, v_t, plasticityRate, decayConstant);

    // Calculate Norm and Interference
    const normA = matrixFrobeniusNorm(A_t);
    const interferenceLevel = Math.min(1.0, normA / (dimension * 1.5));

    // Memory Footprint Calculation
    // Transformer KV-Cache: 2 * (t+1) * dimension * 2 bytes (FP16)
    const kvCacheBytes = 2 * (t + 1) * dimension * 2;
    const kvCacheMB = kvCacheBytes / (1024 * 1024);

    // BDH Memory: Constant d * d * 2 bytes (FP16)
    const bdhBytes = dimension * dimension * 2;
    const bdhMB = bdhBytes / (1024 * 1024);

    results.push({
      step: t + 1,
      inputToken: item.input,
      queryVector: q_t,
      keyVector: k_t,
      valueVector: v_t,
      targetToken: item.target,
      predictedToken,
      isCorrect,
      fastWeightNorm: normA,
      activeNeuronCount,
      activeNeuronPercent,
      kvCacheMemoryMB: Number(kvCacheMB.toFixed(4)),
      bdhMemoryMB: Number(bdhMB.toFixed(6)),
      baselineTaskAccuracy: task1Total > 0 ? Math.round((task1Correct / task1Total) * 100) : 100,
      shiftedTaskAccuracy: task2Total > 0 ? Math.round((task2Correct / task2Total) * 100) : 0,
      interferenceLevel
    });
  }

  return results;
}
