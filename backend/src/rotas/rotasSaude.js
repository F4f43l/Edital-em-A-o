import { Router } from 'express';
import { controladorSaude } from '../controladores/controladorSaude.js';

const rotasSaude = Router();

rotasSaude.get('/health', controladorSaude.verificarSaude);

export { rotasSaude };
