/**
 * Real Computational Substrate: Pure Matrix Math & Neural Operations Engine
 * Handles Linear Attention, Hebbian Fast-Weight updates, Top-K Sparsity (5% BDH), and Latent State Recurrences.
 */

export function createZeroMatrix(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => new Array(cols).fill(0));
}

export function createRandomMatrix(rows: number, cols: number, scale = 0.1): number[][] {
  const matrix: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      row.push((Math.random() * 2 - 1) * scale);
    }
    matrix.push(row);
  }
  return matrix;
}

export function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

export function outerProduct(a: number[], b: number[]): number[][] {
  const result: number[][] = [];
  for (let i = 0; i < a.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < b.length; j++) {
      row.push(a[i] * b[j]);
    }
    result.push(row);
  }
  return result;
}

export function matrixVectorMult(m: number[][], v: number[]): number[] {
  const rows = m.length;
  const cols = m[0].length;
  const result = new Array(rows).fill(0);
  for (let r = 0; r < rows; r++) {
    let sum = 0;
    for (let c = 0; c < cols; c++) {
      sum += m[r][c] * v[c];
    }
    result[r] = sum;
  }
  return result;
}

/**
 * Apply BDH's Sparse Non-Negative Activations (ReLU + Top-K Sparsity)
 * BDH retains roughly top 5% highest activations, zeroing out the rest.
 */
export function applySparsityReLU(v: number[], sparsityPercent: number): { sparseVec: number[]; activeCount: number } {
  // 1. Apply ReLU
  const reluVec = v.map(val => Math.max(0, val));
  if (sparsityPercent >= 100) {
    const active = reluVec.filter(val => val > 0).length;
    return { sparseVec: reluVec, activeCount: active };
  }

  // 2. Keep only top-k values based on sparsityPercent
  const k = Math.max(1, Math.round((v.length * sparsityPercent) / 100));
  
  // Sort indices by value descending
  const indexed = reluVec.map((val, idx) => ({ val, idx }));
  indexed.sort((a, b) => b.val - a.val);

  const thresholdValue = indexed[k - 1]?.val ?? 0;

  const sparseVec = reluVec.map(val => (val >= thresholdValue && val > 0 ? val : 0));
  const activeCount = sparseVec.filter(val => val > 0).length;

  return { sparseVec, activeCount };
}

/**
 * Hebbian Fast Weight Update:
 * A_t = lambda * A_{t-1} + eta * (q_t * k_t^T)
 */
export function updateHebbianFastWeights(
  currentA: number[][],
  q: number[],
  k: number[],
  eta: number, // Plasticity rate
  lambda: number // Synaptic decay
): number[][] {
  const dim = q.length;
  const outer = outerProduct(q, k);
  const nextA: number[][] = [];

  for (let r = 0; r < dim; r++) {
    const row: number[] = [];
    for (let c = 0; c < dim; c++) {
      row.push(lambda * currentA[r][c] + eta * outer[r][c]);
    }
    nextA.push(row);
  }

  return nextA;
}

/**
 * Compute Frobenius Norm of Matrix
 */
export function matrixFrobeniusNorm(m: number[][]): number {
  let sumSq = 0;
  for (let r = 0; r < m.length; r++) {
    for (let c = 0; c < m[r].length; c++) {
      sumSq += m[r][c] * m[r][c];
    }
  }
  return Math.sqrt(sumSq);
}

/**
 * Softmax helper
 */
export function softmax(arr: number[]): number[] {
  const maxVal = Math.max(...arr);
  const exps = arr.map(x => Math.exp(x - maxVal));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return exps.map(x => x / (sumExps || 1));
}
