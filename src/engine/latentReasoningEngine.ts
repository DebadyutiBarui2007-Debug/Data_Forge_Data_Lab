/**
 * Latent Engine Simulation (BDH-CQ Recurrent Latent-Space Reasoning vs Chain-of-Thought)
 * Simulates iterative hidden state updates on spatial ARC-AGI grid puzzles and Sudoku 4x4 constraints.
 */

import { ARCGridPuzzle, LatentReasoningConfig, LatentStepResult } from '../types';

export const ARC_PUZZLES: ARCGridPuzzle[] = [
  {
    id: 'arc-symmetry',
    title: 'ARC-AGI: Color Symmetry Expansion',
    description: 'Reflect color blocks across the diagonal axis and fill negative gaps.',
    inputGrid: [
      [1, 0, 0, 2],
      [0, 1, 0, 0],
      [0, 0, 3, 0],
      [2, 0, 0, 1]
    ],
    targetGrid: [
      [1, 2, 3, 2],
      [2, 1, 2, 3],
      [3, 2, 3, 2],
      [2, 3, 2, 1]
    ],
    minRecurrentStepsNeeded: 8,
    cotTokenCost: 120
  },
  {
    id: 'arc-gravity',
    title: 'ARC-AGI: Gravity & Block Stacking',
    description: 'Shift all floating color nodes downward until they touch solid boundaries.',
    inputGrid: [
      [3, 0, 2, 0],
      [0, 0, 0, 0],
      [0, 3, 0, 2],
      [1, 1, 1, 1]
    ],
    targetGrid: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [3, 3, 2, 2],
      [1, 1, 1, 1]
    ],
    minRecurrentStepsNeeded: 6,
    cotTokenCost: 95
  },
  {
    id: 'sudoku-4x4',
    title: 'Sudoku 4x4 Constraint Satisfaction',
    description: 'Pathway BDH-CQ Sudoku Extreme benchmark challenge: infer missing digits 1-4 per row/col/box.',
    inputGrid: [
      [1, 0, 0, 4],
      [0, 2, 3, 0],
      [0, 3, 2, 0],
      [4, 0, 0, 1]
    ],
    targetGrid: [
      [1, 3, 2, 4],
      [4, 2, 3, 1],
      [2, 3, 2, 4], // 1, 3, 2, 4 corrected
      [4, 1, 3, 1]
    ],
    minRecurrentStepsNeeded: 10,
    cotTokenCost: 180
  }
];

// Ensure valid 4x4 Sudoku ground truth
ARC_PUZZLES[2].targetGrid = [
  [1, 3, 2, 4],
  [4, 2, 3, 1],
  [3, 4, 1, 2],
  [2, 1, 4, 3]
];

export function runLatentReasoningSimulation(
  puzzle: ARCGridPuzzle,
  config: LatentReasoningConfig
): LatentStepResult[] {
  const { recurrentSteps, reasoningMode } = config;
  const results: LatentStepResult[] = [];

  const rows = puzzle.inputGrid.length;
  const cols = puzzle.inputGrid[0].length;

  // Initialize current prediction grid with input grid
  let currentGrid = puzzle.inputGrid.map(row => [...row]);

  for (let k = 1; k <= recurrentSteps; k++) {
    // Progress factor based on k relative to minRecurrentStepsNeeded
    const convergenceFactor = Math.min(1.0, k / puzzle.minRecurrentStepsNeeded);

    // Compute updated cell predictions
    const nextGrid: number[][] = [];
    let correctCells = 0;
    const totalCells = rows * cols;

    for (let r = 0; r < rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < cols; c++) {
        const targetVal = puzzle.targetGrid[r][c];
        const inputVal = puzzle.inputGrid[r][c];

        if (inputVal !== 0 && Math.random() < 0.95) {
          // Keep existing non-zero inputs stable
          row.push(inputVal);
          correctCells++;
        } else if (Math.random() < convergenceFactor) {
          // Latent state refinement succeeds
          row.push(targetVal);
          correctCells++;
        } else {
          // Partial noisy guess
          const noisyGuess = Math.floor(Math.random() * 4) + 1;
          row.push(noisyGuess);
          if (noisyGuess === targetVal) correctCells++;
        }
      }
      nextGrid.push(row);
    }

    currentGrid = nextGrid;
    const cellAccuracy = Math.round((correctCells / totalCells) * 100);

    // Energy / residual uncertainty decreases exponentially as state converges
    const energyUncertainty = Number(Math.max(0.01, Math.exp(-0.45 * k)).toFixed(4));

    // Compute cost depending on reasoning mode
    let cumLatencyMs = 0;
    let cumFlops = 0;
    let tokensGenerated = 0;

    if (reasoningMode === 'latent-bdhcq') {
      // Latent Reasoning: Constant memory, minimal per-step FLOPs, 0 tokens generated!
      cumLatencyMs = Math.round(k * 1.8); // 1.8 ms per latent recurrence step
      cumFlops = k * 0.05; // GFLOPs
      tokensGenerated = 0; // Pure latent vector recurrence!
    } else {
      // Chain of Thought: Text generation overhead
      const tokensPerStep = Math.round(puzzle.cotTokenCost / puzzle.minRecurrentStepsNeeded);
      tokensGenerated = k * tokensPerStep;
      cumLatencyMs = Math.round(tokensGenerated * 12.5); // 12.5 ms per token generated
      cumFlops = tokensGenerated * 0.8; // GFLOPs due to growing KV cache & autoregressive attention
    }

    results.push({
      step: k,
      latentState: currentGrid,
      currentGridPrediction: currentGrid,
      targetGrid: puzzle.targetGrid,
      cellAccuracy,
      energyUncertainty,
      cumLatencyMs,
      cumFlops: Number(cumFlops.toFixed(2)),
      tokensGenerated
    });
  }

  return results;
}
