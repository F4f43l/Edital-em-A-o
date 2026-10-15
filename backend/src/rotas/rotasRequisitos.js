import { Router } from 'express';
import { controladorRequisitos } from '../controladores/controladorRequisitos.js';

const rotasRequisitos = Router();

rotasRequisitos.get('/:id', controladorRequisitos.buscarPorId);
rotasRequisitos.put('/:id', controladorRequisitos.atualizar);
rotasRequisitos.patch('/:id', controladorRequisitos.atualizar);
rotasRequisitos.delete('/:id', controladorRequisitos.excluir);

export { rotasRequisitos };
