import { obterPoolConexoes } from '../configuracao/banco.js';

export const repositorioDocumentos = {
  async buscarTodos({ analise_id, requisito_id, status_etapa } = {}) {
    const pool = obterPoolConexoes();
    let sql = `
      SELECT 
        d.*,
        a.edital_id,
        e.titulo as edital_titulo,
        r.titulo as requisito_titulo,
        r.tipo as requisito_tipo
      FROM documentos_exigidos d
      JOIN analises a ON d.analise_id = a.id
      JOIN editais e ON a.edital_id = e.id
      LEFT JOIN requisitos r ON d.requisito_id = r.id
      WHERE 1=1
    `;
    const parametros = [];

    if (analise_id) {
      sql += ' AND d.analise_id = ?';
      parametros.push(analise_id);
    }
    if (requisito_id) {
      sql += ' AND d.requisito_id = ?';
      parametros.push(requisito_id);
    }
    if (status_etapa) {
      sql += ' AND d.status_etapa = ?';
      parametros.push(status_etapa);
    }

    sql += ' ORDER BY d.prazo_envio ASC, d.id ASC';
    const [linhas] = await pool.query(sql, parametros);
    return linhas;
  },

  async buscarPorId(id) {
    const pool = obterPoolConexoes();
    const sql = `
      SELECT 
        d.*,
        a.edital_id,
        e.titulo as edital_titulo,
        r.titulo as requisito_titulo,
        r.tipo as requisito_tipo
      FROM documentos_exigidos d
      JOIN analises a ON d.analise_id = a.id
      JOIN editais e ON a.edital_id = e.id
      LEFT JOIN requisitos r ON d.requisito_id = r.id
      WHERE d.id = ?
    `;
    const [linhas] = await pool.query(sql, [id]);
    return linhas[0] || null;
  },

  async criar(dados) {
    const pool = obterPoolConexoes();
    const {
      analise_id,
      requisito_id = null,
      nome,
      nome_simples = null,
      finalidade = null,
      quem_fornece = null,
      orgao_emissor = null,
      como_obter = null,
      dados_solicitacao = null,
      documentos_alternativos = null,
      formato_aceito = null,
      exigencias_validade = null,
      instrucoes_preparacao = null,
      como_digitalizar = null,
      local_entrega = null,
      url_entrega = null,
      secao_entrega = null,
      etapa_processo = null,
      prazo_envio = null,
      prazo_envio_descricao = null,
      como_confirmar_envio = null,
      instrucoes_protocolo = null,
      status_etapa = 'pendente_obtencao',
      checklist_etapas = null,
      protocolo_comprovante = null,
      classificacao_fonte = 'confirmado_edital',
      secao_edital = null,
      pagina_origem = null,
      trecho_evidencia = null,
      link_fonte_oficial = null,
      data_verificacao_externa = null,
      observacao_pendencia = null,
    } = dados;

    const checklistJson = checklist_etapas
      ? (typeof checklist_etapas === 'string' ? checklist_etapas : JSON.stringify(checklist_etapas))
      : JSON.stringify({
          entender_necessidade: false,
          obter_documento: false,
          conferir_validade_formato: false,
          enviar_canal_correto: false,
          registrar_protocolo: false,
          observacoes_usuario: '',
        });

    const [resultado] = await pool.query(
      `INSERT INTO documentos_exigidos 
       (analise_id, requisito_id, nome, nome_simples, finalidade, quem_fornece, orgao_emissor, como_obter,
        dados_solicitacao, documentos_alternativos, formato_aceito, exigencias_validade, instrucoes_preparacao,
        como_digitalizar, local_entrega, url_entrega, secao_entrega, etapa_processo, prazo_envio,
        prazo_envio_descricao, como_confirmar_envio, instrucoes_protocolo, status_etapa, checklist_etapas,
        protocolo_comprovante, classificacao_fonte, secao_edital, pagina_origem, trecho_evidencia,
        link_fonte_oficial, data_verificacao_externa, observacao_pendencia) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        analise_id,
        requisito_id,
        nome,
        nome_simples,
        finalidade,
        quem_fornece,
        orgao_emissor,
        como_obter,
        dados_solicitacao,
        documentos_alternativos,
        formato_aceito,
        exigencias_validade,
        instrucoes_preparacao,
        como_digitalizar,
        local_entrega,
        url_entrega,
        secao_entrega,
        etapa_processo,
        prazo_envio,
        prazo_envio_descricao,
        como_confirmar_envio,
        instrucoes_protocolo,
        status_etapa,
        checklistJson,
        protocolo_comprovante,
        classificacao_fonte,
        secao_edital,
        pagina_origem,
        trecho_evidencia,
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
        const checklistJson = item.checklist_etapas
          ? (typeof item.checklist_etapas === 'string' ? item.checklist_etapas : JSON.stringify(item.checklist_etapas))
          : JSON.stringify({
              entender_necessidade: false,
              obter_documento: false,
              conferir_validade_formato: false,
              enviar_canal_correto: false,
              registrar_protocolo: false,
              observacoes_usuario: '',
            });

        const [resultado] = await conexao.query(
          `INSERT INTO documentos_exigidos 
           (analise_id, requisito_id, nome, nome_simples, finalidade, quem_fornece, orgao_emissor, como_obter,
            dados_solicitacao, documentos_alternativos, formato_aceito, exigencias_validade, instrucoes_preparacao,
            como_digitalizar, local_entrega, url_entrega, secao_entrega, etapa_processo, prazo_envio,
            prazo_envio_descricao, como_confirmar_envio, instrucoes_protocolo, status_etapa, checklist_etapas,
            protocolo_comprovante, classificacao_fonte, secao_edital, pagina_origem, trecho_evidencia,
            link_fonte_oficial, data_verificacao_externa, observacao_pendencia) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.analise_id,
            item.requisito_id || null,
            item.nome,
            item.nome_simples || null,
            item.finalidade || null,
            item.quem_fornece || null,
            item.orgao_emissor || null,
            item.como_obter || null,
            item.dados_solicitacao || null,
            item.documentos_alternativos || null,
            item.formato_aceito || null,
            item.exigencias_validade || null,
            item.instrucoes_preparacao || null,
            item.como_digitalizar || null,
            item.local_entrega || null,
            item.url_entrega || null,
            item.secao_entrega || null,
            item.etapa_processo || null,
            item.prazo_envio || null,
            item.prazo_envio_descricao || null,
            item.como_confirmar_envio || null,
            item.instrucoes_protocolo || null,
            item.status_etapa || 'pendente_obtencao',
            checklistJson,
            item.protocolo_comprovante || null,
            item.classificacao_fonte || 'confirmado_edital',
            item.secao_edital || null,
            item.pagina_origem || null,
            item.trecho_evidencia || null,
            item.link_fonte_oficial || null,
            item.data_verificacao_externa || null,
            item.observacao_pendencia || null,
          ]
        );
        idsCriados.push(resultado.insertId);
      }

      await conexao.commit();

      const [linhas] = await pool.query('SELECT * FROM documentos_exigidos WHERE id IN (?)', [idsCriados]);
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
      'requisito_id',
      'nome',
      'nome_simples',
      'finalidade',
      'quem_fornece',
      'orgao_emissor',
      'como_obter',
      'dados_solicitacao',
      'documentos_alternativos',
      'formato_aceito',
      'exigencias_validade',
      'instrucoes_preparacao',
      'como_digitalizar',
      'local_entrega',
      'url_entrega',
      'secao_entrega',
      'etapa_processo',
      'prazo_envio',
      'prazo_envio_descricao',
      'como_confirmar_envio',
      'instrucoes_protocolo',
      'status_etapa',
      'checklist_etapas',
      'protocolo_comprovante',
      'classificacao_fonte',
      'secao_edital',
      'pagina_origem',
      'trecho_evidencia',
      'link_fonte_oficial',
      'data_verificacao_externa',
      'observacao_pendencia',
    ];

    for (const campo of camposPermitidos) {
      if (dados[campo] !== undefined) {
        campos.push(`${campo} = ?`);
        if (campo === 'checklist_etapas' && dados[campo] !== null && typeof dados[campo] === 'object') {
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
    await pool.query(`UPDATE documentos_exigidos SET ${campos.join(', ')} WHERE id = ?`, parametros);
    return this.buscarPorId(id);
  },

  async atualizarStatusEtapa(id, statusEtapa) {
    const pool = obterPoolConexoes();
    await pool.query('UPDATE documentos_exigidos SET status_etapa = ? WHERE id = ?', [statusEtapa, id]);
    return this.buscarPorId(id);
  },

  async atualizarChecklist(id, checklistEtapas) {
    const pool = obterPoolConexoes();
    const jsonStr = typeof checklistEtapas === 'object' ? JSON.stringify(checklistEtapas) : checklistEtapas;
    await pool.query('UPDATE documentos_exigidos SET checklist_etapas = ? WHERE id = ?', [jsonStr, id]);
    return this.buscarPorId(id);
  },

  async atualizarProtocolo(id, protocoloComprovante) {
    const pool = obterPoolConexoes();
    await pool.query('UPDATE documentos_exigidos SET protocolo_comprovante = ? WHERE id = ?', [protocoloComprovante, id]);
    return this.buscarPorId(id);
  },

  async excluir(id) {
    const pool = obterPoolConexoes();
    const [resultado] = await pool.query('DELETE FROM documentos_exigidos WHERE id = ?', [id]);
    return resultado.affectedRows > 0;
  },
};
