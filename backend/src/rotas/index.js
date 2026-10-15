import { Router } from 'express';
import { rotasSaude } from './rotasSaude.js';
import { rotasEditais } from './rotasEditais.js';
import { rotasPerfis } from './rotasPerfis.js';
import { rotasAnalises } from './rotasAnalises.js';
import { rotasRequisitos } from './rotasRequisitos.js';
import { rotasTarefas } from './rotasTarefas.js';

const rotasPrincipais = Router();

rotasPrincipais.use('/', rotasSaude);
rotasPrincipais.use('/editais', rotasEditais);
rotasPrincipais.use('/perfis', rotasPerfis);
rotasPrincipais.use('/analises', rotasAnalises);
rotasPrincipais.use('/requisitos', rotasRequisitos);
rotasPrincipais.use('/tarefas', rotasTarefas);

export { rotasPrincipais };
