import { createFlow } from '@builderbot/bot';
import { welcomeFlow } from './welcomeFlow.js';
import { mainMenuFlow } from './mainMenuFlow.js';
import { benefitsFlow } from './benefitsFlow.js';
import { newsFlow } from './newsFlow.js';
import { affiliateFlow } from './affiliateFlow.js';
import { gremialBenefitsFlow } from './gremialBenefitsFlow.js';
import { humanAgentFlow } from './humanAgentFlow.js';

export const flows = createFlow([
  welcomeFlow,
  mainMenuFlow,
  benefitsFlow,
  newsFlow,
  affiliateFlow,
  gremialBenefitsFlow,
  humanAgentFlow,
]);
