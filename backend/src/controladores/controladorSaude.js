import { testarConexaoBanco } from '../configuracao/banco.js';
import { configuracaoAmbiente } from '../configuracao/ambiente.js';

export const controladorSaude = {
  async verificarSaude(req, res, next) {
    try {
      const estadoBanco = await testarConexaoBanco();
      const possuiChaveIa = Boolean(configuracaoAmbiente.CHAVE_API_GEMINI && configuracaoAmbiente.CHAVE_API_GEMINI.trim().length > 5);

      const statusGeral = estadoBanco.conectado ? 'operacional' : 'degradado';

      return res.status(200).json({
        status: statusGeral,
        timestamp: new Date().toISOString(),
        versao: '1.0.0',
        bancoDados: {
          conectado: estadoBanco.conectado,
          tipo: 'MySQL',
          base: estadoBanco.banco,
        },
        inteligenciaArtificial: {
          provedor: configuracaoAmbiente.PROVEDOR_IA,
          modelo: configuracaoAmbiente.MODELO_GEMINI,
          chaveConfigurada: possuiChaveIa,
          modoAtivo: possuiChaveIa ? 'gemini_api' : 'regras_locais_demonstracao',
        },
      });
    } catch (erro) {
      next(erro);
    }
  },
};
