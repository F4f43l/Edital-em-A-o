import { obterPoolConexoes } from '../configuracao/banco.js';

export const repositorioAnalises = {
  async buscarTodas({ edital_id, perfil_id } = {}) {
    const pool = obterPoolConexoes();
    let sql = `
      SELECT 
        a.*,
        e.titulo as edital_titulo,
        e.instituicao as edital_instituicao,
        e.prazo_inscricao as edital_prazo,
        p.nome_exibicao as perfil_nome
      FROM analises a
      JOIN editais e ON a.edital_id = e.id
      LEFT JOIN perfis p ON a.perfil_id = p.id
      WHERE 1=1
    `;
    const parametros = [];

    if (edital_id) {
      sql += ' AND a.edital_id = ?';
      parametros.push(edital_id);
    }
    if (perfil_id) {
      sql += ' AND a.perfil_id = ?';
      parametros.push(perfil_id);
    }

    sql += ' ORDER BY a.created_at DESC';
    const [linhas] = await pool.query(sql, parametros);
    return linhas.map((analise) => {
      if (analise && typeof analise.custos_logistica === 'string') {
        try {
          analise.custos_logistica = JSON.parse(analise.custos_logistica);
        } catch (_) {}
      }
      return analise;
    });
  },

  async buscarPorId(id) {
    const pool = obterPoolConexoes();
    const sql = `
      SELECT 
        a.*,
        e.titulo as edital_titulo,
        e.instituicao as edital_instituicao,
        e.prazo_inscricao as edital_prazo,
        e.categoria as edital_categoria,
        e.nome_arquivo as edital_nome_arquivo,
        p.nome_exibicao as perfil_nome,
        p.nivel_ensino as perfil_nivel_ensino,
        p.curso as perfil_curso,
        p.faixa_renda as perfil_faixa_renda,
        p.situacao_trabalho as perfil_situacao_trabalho
      FROM analises a
      JOIN editais e ON a.edital_id = e.id
      LEFT JOIN perfis p ON a.perfil_id = p.id
      WHERE a.id = ?
    `;
    const [linhas] = await pool.query(sql, [id]);
    const analise = linhas[0] || null;
    if (analise && typeof analise.custos_logistica === 'string') {
      try {
        analise.custos_logistica = JSON.parse(analise.custos_logistica);
      } catch (_) {}
    }
    return analise;
  },

  async criar(dados) {
    const pool = obterPoolConexoes();
    const {
      edital_id,
      perfil_id = null,
      resumo = null,
      resultado_orientativo = 'pendente',
      status = 'pendente',
      provedor_ia = 'manual',
      modelo_ia = null,
      custos_logistica = null,
    } = dados;

    const valorCustos = custos_logistica
      ? (typeof custos_logistica === 'string' ? custos_logistica : JSON.stringify(custos_logistica))
      : null;

    const [resultado] = await pool.query(
      `INSERT INTO analises 
       (edital_id, perfil_id, resumo, resultado_orientativo, status, provedor_ia, modelo_ia, custos_logistica) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        edital_id,
        perfil_id,
        resumo,
        resultado_orientativo,
        status,
        provedor_ia,
        modelo_ia,
        valorCustos,
      ]
    );

    return this.buscarPorId(resultado.insertId);
  },

  async atualizar(id, dados) {
    const pool = obterPoolConexoes();
    const campos = [];
    const parametros = [];

    const camposPermitidos = ['resumo', 'resultado_orientativo', 'status', 'provedor_ia', 'modelo_ia', 'custos_logistica'];

    for (const campo of camposPermitidos) {
      if (dados[campo] !== undefined) {
        campos.push(`${campo} = ?`);
        let valor = dados[campo];
        if (campo === 'custos_logistica' && valor && typeof valor === 'object') {
          valor = JSON.stringify(valor);
        }
        parametros.push(valor);
      }
    }

    if (campos.length === 0) {
      return this.buscarPorId(id);
    }

    parametros.push(id);
    await pool.query(`UPDATE analises SET ${campos.join(', ')} WHERE id = ?`, parametros);
    return this.buscarPorId(id);
  },

  async contarDependentes(id) {
    const pool = obterPoolConexoes();
    const [linhasReqs] = await pool.query('SELECT COUNT(*) as total FROM requisitos WHERE analise_id = ?', [id]);
    const [linhasTarefas] = await pool.query('SELECT COUNT(*) as total FROM tarefas WHERE analise_id = ?', [id]);
    return {
      quantidadeRequisitos: linhasReqs[0]?.total || 0,
      quantidadeTarefas: linhasTarefas[0]?.total || 0,
    };
  },

  async excluir(id) {
    const pool = obterPoolConexoes();
    const [resultado] = await pool.query('DELETE FROM analises WHERE id = ?', [id]);
    return resultado.affectedRows > 0;
  },
};
