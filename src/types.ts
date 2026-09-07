/**
 * Types & Interfaces for DataForge BDH Lab
 */

export type AppMode = 'guided' | 'sandbox-fastweights' | 'sandbox-latent' | 'deepdive' | 'benchmark';

export type AudienceRole = 'learner' | 'judge' | 'educator';

export type TaskType = 
  | 'associative-recall'
  | 'rule-shift'
  | 'arc-grid'
  | 'sudoku-4x4';

export interface FastWeightsConfig {
  plasticityRate: number; // eta (0 to 1)
  decayConstant: number; // lambda (0.5 to 1.0)
  sparsityThreshold: number; // top-k % activation (1% to 100%, BDH default = 5%)
  sequenceLength: number; // N tokens (10 to 1000)
  dimension: number; // d (8, 16, 32)
  task: 'associative-recall' | 'rule-shift';
  useSparseActivations: boolean; // BDH 5% ReLU-low-rank
}

export interface LatentReasoningConfig {
  recurrentSteps: number; // k (1 to 20)
  reasoningMode: 'latent-bdhcq' | 'cot-transformer';
  puzzleType: 'arc-grid' | 'sudoku-4x4';
  noiseLevel: number;
}

export interface FastWeightsStepResult {
  step: number;
  inputToken: string;
  queryVector: number[];
  keyVector: number[];
  valueVector: number[];
  targetToken: string;
  predictedToken: string;
  isCorrect: boolean;
  fastWeightNorm: number;
  activeNeuronCount: number;
  activeNeuronPercent: number;
  kvCacheMemoryMB: number;
  bdhMemoryMB: number;
  baselineTaskAccuracy: number; // Task 1 accuracy (e.g. prefix reversal)
  shiftedTaskAccuracy: number; // Task 2 accuracy (e.g. suffix reversal)
  interferenceLevel: number;
}

export interface LatentStepResult {
  step: number;
  latentState: number[][]; // Latent grid or vector
  currentGridPrediction: number[][];
  targetGrid: number[][];
  cellAccuracy: number; // percentage
  energyUncertainty: number; // residual norm
  cumLatencyMs: number;
  cumFlops: number;
  tokensGenerated: number;
}

export interface BenchmarkComparisonPoint {
  sequenceLength: number; // N
  transformerMemoryMB: number;
  mambaMemoryMB: number;
  bdhMemoryMB: number;
  bdhcqMemoryMB: number;
  transformerFlopsGiga: number;
  mambaFlopsGiga: number;
  bdhFlopsGiga: number;
  bdhcqFlopsGiga: number;
  transformerLatencyMs: number;
  bdhLatencyMs: number;
  bdhcqLatencyMs: number;
  bdhcqAccuracyPercent: number;
}

export interface ARCGridPuzzle {
  id: string;
  title: string;
  description: string;
  inputGrid: number[][];
  targetGrid: number[][];
  minRecurrentStepsNeeded: number;
  cotTokenCost: number;
}
