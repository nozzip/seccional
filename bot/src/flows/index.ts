import { createFlow } from '@builderbot/bot';
import { welcomeFlow } from './welcomeFlow.js';
import { benefitsFlow } from './benefitsFlow.js';
import { newsFlow } from './newsFlow.js';
import { affiliateFlow } from './affiliateFlow.js';
import { tourismFlow } from './tourismFlow.js';
import { humanAgentFlow } from './humanAgentFlow.js';

export const flows = createFlow([
  welcomeFlow,
  benefitsFlow,
  newsFlow,
  affiliateFlow,
  tourismFlow,
  humanAgentFlow,
]);
