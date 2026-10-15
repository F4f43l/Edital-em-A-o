import { Router } from 'express';
import { controladorEditais } from '../controladores/controladorEditais.js';
import { intermediarioUploadPdf } from '../intermediarios/uploadArquivo.js';

const rotasEditais = Router();

rotasEditais.get('/contadores', controladorEditais.obterContadores);
rotasEditais.get('/', controladorEditais.listar);

// Fluxo Principal com IA: Envio de PDF para extração e confirmação
rotasEditais.post('/processar-pdf', intermediarioUploadPdf.single('arquivo'), controladorEditais.processarPdfInicial);
rotasEditais.post('/confirmar-cadastro', controladorEditais.confirmarCadastro);

// CRUD de Editais
rotasEditais.post('/', controladorEditais.criar);
rotasEditais.get('/:id', controladorEditais.buscarPorId);
rotasEditais.put('/:id', controladorEditais.atualizar);
rotasEditais.patch('/:id', controladorEditais.atualizar);
rotasEditais.delete('/:id', controladorEditais.excluir);
rotasEditais.post('/:id/arquivo', intermediarioUploadPdf.single('arquivo'), controladorEditais.uploadPdf);

export { rotasEditais };
