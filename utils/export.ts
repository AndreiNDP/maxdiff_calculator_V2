import { MaxDiffState, ConjointState, DesignStatus } from '../types';
import { calculateMaxDiffFrequency, calculateOrmeMinSample } from './calculations';

export const generateReport = (
  mode: 'maxdiff' | 'cbc',
  mdState: MaxDiffState,
  cbcState: ConjointState
): void => {
  let content = `STATISTICAL DESIGN SPECIFICATION REPORT\n`;
  content += `Generated: ${new Date().toLocaleString()}\n`;
  content += `Type: ${mode === 'maxdiff' ? 'MaxDiff (Best-Worst Scaling)' : 'Conjoint (CBC)'}\n`;
  content += `--------------------------------------------------\n\n`;

  if (mode === 'maxdiff') {
    const freq = calculateMaxDiffFrequency(mdState);
    content += `[PARAMETERS]\n`;
    content += `Total Items: ${mdState.totalItems}\n`;
    content += `Items Per Screen: ${mdState.itemsPerScreen}\n`;
    content += `Number of Screens: ${mdState.nScreens}\n`;
    content += `Sample Size: ${mdState.sampleSize}\n\n`;
    content += `[ANALYSIS]\n`;
    content += `Item Frequency (Exposures): ${freq.toFixed(2)}\n`;
    content += `Total Respondent Burden: ~${Math.ceil(mdState.nScreens * 0.4)} minutes\n`;
    content += `Total Observations: ${mdState.nScreens * mdState.itemsPerScreen * mdState.sampleSize}\n`;
  } else {
    const minN = calculateOrmeMinSample(cbcState);
    content += `[PARAMETERS]\n`;
    content += `Number of Tasks: ${cbcState.nTasks}\n`;
    content += `Concepts Per Task: ${cbcState.conceptsPerTask}\n`;
    content += `Sample Size: ${cbcState.sampleSize}\n`;
    content += `\n[ATTRIBUTES]\n`;
    cbcState.attributes.forEach(attr => {
        content += `- ${attr.name}: ${attr.levels} Levels\n`;
    });
    content += `\n[ANALYSIS]\n`;
    content += `Orme's Min Sample Requirement: ${minN}\n`;
    content += `Current Coverage: ${Math.round((cbcState.sampleSize / minN) * 100)}%\n`;
  }

  content += `\n--------------------------------------------------\n`;
  content += `Validated by MaxDiff & CBC Architect Tool.\n`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${mode}_design_spec_${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
