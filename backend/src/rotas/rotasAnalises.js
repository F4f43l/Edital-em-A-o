import { Router } from 'express';
import { controladorAnalises } from '../controladores/controladorAnalises.js';
import { controladorRequisitos } from '../controladores/controladorRequisitos.js';
import { controladorDocumentos } from '../controladores/controladorDocumentos.js';

const rotasAnalises = Router();

rotasAnalises.get('/', controladorAnalises.listar);
rotasAnalises.post('/', controladorAnalises.criar);
rotasAnalises.get('/:id', controladorAnalises.buscarPorId);
rotasAnalises.put('/:id', controladorAnalises.atualizar);
rotasAnalises.patch('/:id', controladorAnalises.atualizar);
rotasAnalises.get('/:id/resumo-exclusao', controladorAnalises.resumoExclusao);
rotasAnalises.delete('/:id', controladorAnalises.excluir);

// Requisitos vinculados à análise
rotasAnalises.get('/:id/requisitos', controladorRequisitos.listarPorAnalise);
rotasAnalises.post('/:id/requisitos', controladorRequisitos.criar);

// Documentos vinculados à análise
rotasAnalises.get('/:analiseId/documentos', controladorDocumentos.listarDocumentos);
rotasAnalises.post('/:analiseId/documentos', controladorDocumentos.criarDocumento);

export { rotasAnalises };
