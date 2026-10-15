import { ZodError } from 'zod';

export class ErroAplicacao extends Error {
  constructor(mensagem, statusHttp = 400, codigo = 'ERRO_APLICACAO', detalhes = []) {
    super(mensagem);
    this.statusHttp = statusHttp;
    this.codigo = codigo;
    this.detalhes = detalhes;
  }
}

export function manipuladorRotaNaoEncontrada(req, res, next) {
  res.status(404).json({
    error: {
      code: 'NAO_ENCONTRADO',
      message: `Rota ${req.method} ${req.originalUrl} não encontrada no servidor.`,
      details: [],
    },
  });
}

export function manipuladorErros(erro, req, res, next) {
  // Erros de validação do Zod
  if (erro instanceof ZodError) {
    const detalhes = erro.errors.map((e) => ({
      campo: e.path.join('.'),
      mensagem: e.message,
    }));
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Revise os campos informados.',
        details: detalhes,
      },
    });
  }

  // Erros de upload do Multer
  if (erro.name === 'MulterError') {
    if (erro.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: {
          code: 'ARQUIVO_MUITO_GRANDE',
          message: 'O arquivo enviado excede o limite máximo permitido de 10 MB.',
          details: [],
        },
      });
    }
    return res.status(400).json({
      error: {
        code: 'ERRO_UPLOAD',
        message: `Falha no processamento do arquivo: ${erro.message}`,
        details: [],
      },
    });
  }

  // Erros previstos da aplicação
  if (erro instanceof ErroAplicacao) {
    return res.status(erro.statusHttp).json({
      error: {
        code: erro.codigo,
        message: erro.mensagem || erro.message,
        details: erro.detalhes,
      },
    });
  }

  // Erro de formato JSON malformado
  if (erro instanceof SyntaxError && erro.status === 400 && 'body' in erro) {
    return res.status(400).json({
      error: {
        code: 'JSON_INVALIDO',
        message: 'O corpo da requisição não contém um formato JSON válido.',
        details: [],
      },
    });
  }

  // Erros do driver MySQL
  if (erro.code && typeof erro.code === 'string' && erro.code.startsWith('ER_')) {
    console.error('[ERRO MYSQL]', erro.code, erro.message);
    if (erro.code === 'ER_ROW_IS_REFERENCED_2' || erro.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(400).json({
        error: {
          code: 'ERRO_INTEGRIDADE_REFERENCIAL',
          message: 'Este registro possui outros itens vinculados a ele e não pode ser excluído diretamente.',
          details: [],
        },
      });
    }
    return res.status(500).json({
      error: {
        code: 'ERRO_BANCO_DADOS',
        message: 'Ocorreu uma falha na operação do banco de dados relacional.',
        details: [],
      },
    });
  }

  // Erros gerais não mapeados
  console.error('[ERRO INESPERADO]', erro);
  return res.status(500).json({
    error: {
      code: 'ERRO_INTERNO_SERVIDOR',
      message: 'Ocorreu um erro interno inesperado no servidor.',
      details: [],
    },
  });
}
