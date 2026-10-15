import { Router } from 'express';
import { controladorTarefas } from '../controladores/controladorTarefas.js';

const rotasTarefas = Router();

rotasTarefas.get('/', controladorTarefas.listar);
rotasTarefas.post('/', controladorTarefas.criar);
rotasTarefas.get('/:id', controladorTarefas.buscarPorId);
rotasTarefas.put('/:id', controladorTarefas.atualizar);
rotasTarefas.patch('/:id', controladorTarefas.atualizar);
rotasTarefas.patch('/:id/status', controladorTarefas.alterarStatusRapido);
rotasTarefas.patch('/:id/concluir', controladorTarefas.alternarStatus);
rotasTarefas.delete('/:id', controladorTarefas.excluir);

export { rotasTarefas };
