import { Router } from 'express';
import { controladorPerfis } from '../controladores/controladorPerfis.js';

const rotasPerfis = Router();

rotasPerfis.get('/', controladorPerfis.listar);
rotasPerfis.post('/', controladorPerfis.criar);
rotasPerfis.get('/:id', controladorPerfis.buscarPorId);
rotasPerfis.put('/:id', controladorPerfis.atualizar);
rotasPerfis.patch('/:id', controladorPerfis.atualizar);
rotasPerfis.delete('/:id', controladorPerfis.excluir);

export { rotasPerfis };
