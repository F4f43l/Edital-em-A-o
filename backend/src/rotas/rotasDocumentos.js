import { Router } from 'express';
import { controladorDocumentos } from '../controladores/controladorDocumentos.js';

const rotasDocumentos = Router();

rotasDocumentos.get('/', controladorDocumentos.listarDocumentos);
rotasDocumentos.get('/:id', controladorDocumentos.buscarDocumentoPorId);
rotasDocumentos.post('/', controladorDocumentos.criarDocumento);
rotasDocumentos.put('/:id', controladorDocumentos.atualizarDocumento);
rotasDocumentos.patch('/:id/etapa', controladorDocumentos.atualizarStatusEtapa);
rotasDocumentos.patch('/:id/checklist', controladorDocumentos.atualizarChecklist);
rotasDocumentos.patch('/:id/protocolo', controladorDocumentos.atualizarProtocolo);
rotasDocumentos.delete('/:id', controladorDocumentos.excluirDocumento);

export { rotasDocumentos };
