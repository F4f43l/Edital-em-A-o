import { obterPoolConexoes } from '../configuracao/banco.js';

export const repositorioRequisitos = {
  async buscarPorAnaliseId(analiseId) {
    const pool = obterPoolConexoes();
    const [linhas] = await pool.query(
      'SELECT * FROM requisitos WHERE analise_id = ? ORDER BY id ASC',
      [analiseId]
    );
    return linhas;
  },

  async buscarPorId(id) {
    const pool = obterPoolConexoes();
    const [linhas] = await pool.query('SELECT * FROM requisitos WHERE id = ?', [id]);
    return linhas[0] || null;
  },

  async criar(dados) {
    const pool = obterPoolConexoes();
    const {
      analise_id,
      titulo,
      descricao = null,
      tipo = 'outro',
      obrigatorio = true,
      status_perfil = 'confirmar',
      evidencia_texto = null,
      pagina_origem = null,
      origem_dado = 'manual',
      observacao = null,
      procedimento_detalhado = null,
      classificacao_fonte = 'confirmado_edital',
      secao_edital = null,
      link_fonte_oficial = null,
      data_verificacao_externa = null,
      observacao_pendencia = null,
    } = dados;

    const procedimentoJson = procedimento_detalhado
      ? (typeof procedimento_detalhado === 'string' ? procedimento_detalhado : JSON.stringify(procedimento_detalhado))
      : null;

    const [resultado] = await pool.query(
      `INSERT INTO requisitos 
       (analise_id, titulo, descricao, tipo, obrigatorio, status_perfil, evidencia_texto, pagina_origem,
        origem_dado, observacao, procedimento_detalhado, classificacao_fonte, secao_edital,
        link_fonte_oficial, data_verificacao_externa, observacao_pendencia) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        analise_id,
        titulo,
        descricao,
        tipo,
        obrigatorio ? 1 : 0,
        status_perfil,
        evidencia_texto,
        pagina_origem,
        origem_dado,
        observacao,
        procedimentoJson,
        classificacao_fonte,
        secao_edital,
        link_fonte_oficial,
        data_verificacao_externa,
        observacao_pendencia,
      ]
    );

    return this.buscarPorId(resultado.insertId);
  },

  async criarVarios(itens) {
    if (!itens || itens.length === 0) return [];
    const pool = obterPoolConexoes();
    const conexao = await pool.getConnection();

    try {
      await conexao.beginTransaction();
      const idsCriados = [];

      for (const item of itens) {
        const procedimentoJson = item.procedimento_detalhado
          ? (typeof item.procedimento_detalhado === 'string' ? item.procedimento_detalhado : JSON.stringify(item.procedimento_detalhado))
          : null;

        const [resultado] = await conexao.query(
          `INSERT INTO requisitos 
           (analise_id, titulo, descricao, tipo, obrigatorio, status_perfil, evidencia_texto, pagina_origem,
            origem_dado, observacao, procedimento_detalhado, classificacao_fonte, secao_edital,
            link_fonte_oficial, data_verificacao_externa, observacao_pendencia) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.analise_id,
            item.titulo,
            item.descricao || null,
            item.tipo || 'outro',
            item.obrigatorio === false ? 0 : 1,
            item.status_perfil || 'confirmar',
            item.evidencia_texto || null,
            item.pagina_origem || null,
            item.origem_dado || 'ia',
            item.observacao || null,
            procedimentoJson,
            item.classificacao_fonte || 'confirmado_edital',
            item.secao_edital || null,
            item.link_fonte_oficial || null,
            item.data_verificacao_externa || null,
            item.observacao_pendencia || null,
          ]
        );
        idsCriados.push(resultado.insertId);
      }

      await conexao.commit();

      const [linhas] = await pool.query('SELECT * FROM requisitos WHERE id IN (?)', [idsCriados]);
      return linhas;
    } catch (erro) {
      await conexao.rollback();
      throw erro;
    } finally {
      conexao.release();
    }
  },

  async atualizar(id, dados) {
    const pool = obterPoolConexoes();
    const campos = [];
    const parametros = [];

    const camposPermitidos = [
      'titulo',
      'descricao',
      'tipo',
      'obrigatorio',
      'status_perfil',
      'evidencia_texto',
      'pagina_origem',
      'origem_dado',
      'observacao',
      'procedimento_detalhado',
      'classificacao_fonte',
      'secao_edital',
      'link_fonte_oficial',
      'data_verificacao_externa',
      'observacao_pendencia',
    ];

    for (const campo of camposPermitidos) {
      if (dados[campo] !== undefined) {
        campos.push(`${campo} = ?`);
        if (campo === 'obrigatorio') {
          parametros.push(dados[campo] ? 1 : 0);
        } else if (campo === 'procedimento_detalhado' && dados[campo] !== null && typeof dados[campo] === 'object') {
          parametros.push(JSON.stringify(dados[campo]));
        } else {
          parametros.push(dados[campo]);
        }
      }
    }

    if (campos.length === 0) {
      return this.buscarPorId(id);
    }

    parametros.push(id);
    await pool.query(`UPDATE requisitos SET ${campos.join(', ')} WHERE id = ?`, parametros);
    return this.buscarPorId(id);
  },

  async excluir(id) {
    const pool = obterPoolConexoes();
    const [resultado] = await pool.query('DELETE FROM requisitos WHERE id = ?', [id]);
    return resultado.affectedRows > 0;
  },
};
