import { DesignStatus, ValidationResult, MaxDiffState, ConjointState, DesignMethod } from '../types';

// --- MaxDiff Calculations ---

export const calculateMaxDiffFrequency = (state: MaxDiffState): number => {
  const { totalItems, itemsPerScreen, nScreens } = state;
  if (totalItems === 0) return 0;
  return (nScreens * itemsPerScreen) / totalItems;
};

export const calculateMaxDiffAdvancedMetrics = (state: MaxDiffState, frequency: number) => {
  const { sampleSize, totalItems, itemsPerScreen, nScreens } = state;
  
  // 1. Estimated Standard Error (Heuristic for aggregate utilities)
  const totalItemExposures = sampleSize * frequency;
  const stdError = totalItemExposures > 0 ? 1 / Math.sqrt(totalItemExposures) : 0;

  // 2. Average Pairwise Depth (Connectivity)
  const numerator = nScreens * itemsPerScreen * (itemsPerScreen - 1);
  const denominator = totalItems * (totalItems - 1);
  const pairwiseDepth = denominator > 0 ? numerator / denominator : 0;

  return { stdError, pairwiseDepth };
};

export const validateMaxDiffDesign = (frequency: number): ValidationResult => {
  if (frequency < 2.5) {
    return { status: DesignStatus.CRITICAL, message: "Don't bother! Exposures are too low for valid results.", score: 15 };
  } else if (frequency < 3.0) {
    return { status: DesignStatus.POOR, message: "Danger. Results may be unstable.", score: 45 };
  } else if (frequency < 4.0) {
    return { status: DesignStatus.ACCEPTABLE, message: "Acceptable. Meets minimum industry standards.", score: 75 };
  } else {
    return { status: DesignStatus.EXCELLENT, message: "Excellent. High-quality design.", score: 98 };
  }
};

export const optimizeMaxDiffScreens = (totalItems: number, itemsPerScreen: number): number => {
  const targetFreq = 4.0;
  return Math.ceil((targetFreq * totalItems) / itemsPerScreen);
};

// --- Conjoint (CBC) Calculations ---

const getDesignEfficiencyFactor = (method: DesignMethod): number => {
  // Efficiency relative to optimal orthogonal design (1.0)
  // These affect the Standard Error estimation.
  switch (method) {
    case 'complete': return 1.0; 
    case 'balanced': return 0.95; // Balanced Overlap
    case 'shortcut': return 0.90;
    case 'random': return 0.80;   // Random is least efficient
    default: return 1.0;
  }
};

export const calculateOrmeMinSample = (state: ConjointState): number => {
  const { attributes, nTasks, conceptsPerTask } = state;
  if (nTasks === 0 || conceptsPerTask === 0 || attributes.length === 0) return 0;

  const maxLevels = Math.max(...attributes.map((a) => a.levels), 0);
  const result = (500 * maxLevels) / (nTasks * conceptsPerTask);
  return Math.ceil(result);
};

export const calculateInteractionSample = (state: ConjointState): { maxInteractionCells: number, minSample: number } => {
  const { attributes, nTasks, conceptsPerTask } = state;
  if (attributes.length < 2) return { maxInteractionCells: 0, minSample: 0 };

  let maxInteractionCells = 0;
  for (let i = 0; i < attributes.length; i++) {
    for (let j = i + 1; j < attributes.length; j++) {
      const interaction = attributes[i].levels * attributes[j].levels;
      if (interaction > maxInteractionCells) {
        maxInteractionCells = interaction;
      }
    }
  }

  const minSample = (500 * maxInteractionCells) / (nTasks * conceptsPerTask);
  return { maxInteractionCells, minSample: Math.ceil(minSample) };
};

export const calculateAttributeStats = (state: ConjointState) => {
  const { sampleSize, nTasks, attributes, designMethod, percentNone } = state;
  const efficiency = getDesignEfficiencyFactor(designMethod);
  
  // Lighthouse Approximation Formula:
  // SE = sqrt(Levels) / sqrt(N * Tasks) * Adjustments
  
  // Adjustment 1: Design Efficiency (Inverse sqrt relation to information)
  const designAdj = 1 / Math.sqrt(efficiency);
  
  // Adjustment 2: Percent None. 
  // Effective Sample Size = N * (1 - %None).
  // Since SE is proportional to 1/sqrt(N), the factor is sqrt(1 / (1 - %None))
  const noneAsDecimal = Math.min(Math.max(percentNone, 0), 99) / 100;
  const noneAdj = Math.sqrt(1 / (1 - noneAsDecimal));

  const denominator = Math.sqrt(sampleSize * nTasks);

  return attributes.map(attr => {
    if (denominator === 0) return { ...attr, stdError: 0 };
    
    // Base SE based on levels and total observations per respondent
    const baseSE = Math.sqrt(attr.levels) / denominator;
    
    const finalSE = baseSE * designAdj * noneAdj;

    return {
      ...attr,
      stdError: finalSE
    };
  });
};

export const calculateCBCEfficiency = (state: ConjointState): ValidationResult => {
  const minSample = calculateOrmeMinSample(state);
  if (minSample === 0) return { status: DesignStatus.CRITICAL, message: 'Invalid Configuration', score: 0 };

  const efficiency = state.sampleSize / minSample;

  if (efficiency < 0.7) {
    return { status: DesignStatus.CRITICAL, message: 'Critical. Sample too small.', score: 20 };
  } else if (efficiency < 1.0) {
    return { status: DesignStatus.POOR, message: 'Risk. Below Orme recommendation.', score: 50 };
  } else if (efficiency < 1.5) {
    return { status: DesignStatus.ACCEPTABLE, message: 'Acceptable.', score: 80 };
  } else {
    return { status: DesignStatus.EXCELLENT, message: 'Robust.', score: 100 };
  }
};

export const optimizeCBCTasks = (state: ConjointState): number => {
  const { attributes, sampleSize, percentNone, designMethod } = state;
  if (sampleSize === 0) return 0;

  // Target SE: 0.05 (Excellent standard for main effects)
  const TARGET_SE = 0.05;
  const maxLevels = Math.max(...attributes.map((a) => a.levels), 1);
  
  const efficiency = getDesignEfficiencyFactor(designMethod);
  const noneAsDecimal = Math.min(Math.max(percentNone, 0), 99) / 100;
  
  // Formula Rearrangement:
  // SE = (sqrt(L) / sqrt(N * T)) * (1/sqrt(Eff)) * sqrt(1/(1-None))
  // SE^2 = (L / (N * T)) * (1/Eff) * (1/(1-None))
  // T = (L / (N * SE^2 * Eff * (1-None)))
  
  const numerator = maxLevels;
  const denominator = sampleSize * Math.pow(TARGET_SE, 2) * efficiency * (1 - noneAsDecimal);
  
  if (denominator === 0) return 1;
  
  return Math.ceil(numerator / denominator);
};

// --- Unit Testing for Logic Check ---
export const runSystemDiagnostics = (): boolean => {
  // Test Case 1: MaxDiff Freq
  const mdTest = calculateMaxDiffFrequency({ totalItems: 10, itemsPerScreen: 4, nScreens: 10, sampleSize: 100 });
  if (Math.abs(mdTest - 4.0) > 0.01) return false;

  // Test Case 2: Orme's Rule
  const cbcTest = calculateOrmeMinSample({
    attributes: [{ id: '1', name: 'A', levels: 3 }],
    nTasks: 10,
    conceptsPerTask: 3,
    sampleSize: 100,
    percentNone: 0,
    designMethod: 'complete'
  });
  if (cbcTest !== 50) return false;

  return true;
};
