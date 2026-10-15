import { obterPoolConexoes } from '../configuracao/banco.js';

export const repositorioEditais = {
  async buscarTodos({ status, categoria, busca } = {}) {
    const pool = obterPoolConexoes();
    let sql = 'SELECT * FROM editais WHERE 1=1';
    const parametros = [];

    if (status) {
      sql += ' AND status = ?';
      parametros.push(status);
    }
    if (categoria) {
      sql += ' AND categoria = ?';
      parametros.push(categoria);
    }
    if (busca) {
      sql += ' AND (titulo LIKE ? OR instituicao LIKE ? OR resumo LIKE ?)';
      const termo = `%${busca}%`;
      parametros.push(termo, termo, termo);
    }

    sql += ' ORDER BY created_at DESC';
    const [linhas] = await pool.query(sql, parametros);
    return linhas.map((edital) => {
      if (edital && typeof edital.custos_logistica === 'string') {
        try {
          edital.custos_logistica = JSON.parse(edital.custos_logistica);
        } catch (_) {}
      }
      return edital;
    });
  },

  async buscarPorId(id) {
    const pool = obterPoolConexoes();
    const [linhas] = await pool.query('SELECT * FROM editais WHERE id = ?', [id]);
    const edital = linhas[0] || null;
    if (edital && typeof edital.custos_logistica === 'string') {
      try {
        edital.custos_logistica = JSON.parse(edital.custos_logistica);
      } catch (_) {}
    }
    return edital;
  },

  async criar(dados) {
    const pool = obterPoolConexoes();
    const {
      titulo,
      instituicao = null,
      categoria = 'Outro',
      resumo = null,
      url_origem = null,
      nome_arquivo = null,
      caminho_arquivo = null,
      texto_extraido = null,
      prazo_inscricao = null,
      prazo_recurso = null,
      data_resultado = null,
      status = 'ativo',
      custos_logistica = null,
    } = dados;

    const valorCustos = custos_logistica
      ? (typeof custos_logistica === 'string' ? custos_logistica : JSON.stringify(custos_logistica))
      : null;

    const [resultado] = await pool.query(
      `INSERT INTO editais 
       (titulo, instituicao, categoria, resumo, url_origem, nome_arquivo, caminho_arquivo, texto_extraido, prazo_inscricao, prazo_recurso, data_resultado, status, custos_logistica) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        instituicao,
        categoria,
        resumo,
        url_origem,
        nome_arquivo,
        caminho_arquivo,
        texto_extraido,
        prazo_inscricao,
        prazo_recurso,
        data_resultado,
        status,
        valorCustos,
      ]
    );

    return this.buscarPorId(resultado.insertId);
  },

  async atualizar(id, dados) {
    const pool = obterPoolConexoes();
    const campos = [];
    const parametros = [];

    const camposPermitidos = [
      'titulo',
      'instituicao',
      'categoria',
      'resumo',
      'url_origem',
      'nome_arquivo',
      'caminho_arquivo',
      'texto_extraido',
      'prazo_inscricao',
      'prazo_recurso',
      'data_resultado',
      'status',
      'custos_logistica',
    ];

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
    await pool.query(`UPDATE editais SET ${campos.join(', ')} WHERE id = ?`, parametros);
    return this.buscarPorId(id);
  },

  async excluir(id) {
    const pool = obterPoolConexoes();
    const [resultado] = await pool.query('DELETE FROM editais WHERE id = ?', [id]);
    return resultado.affectedRows > 0;
  },

  async obterContadoresPainel() {
    const pool = obterPoolConexoes();
    const [linhasEditais] = await pool.query('SELECT COUNT(*) as total FROM editais');
    const [linhasAnalises] = await pool.query('SELECT COUNT(*) as total FROM analises');
    const [linhasTarefasPendentes] = await pool.query(
      "SELECT COUNT(*) as total FROM tarefas WHERE status IN ('pendente', 'em_andamento')"
    );
    const [linhasPrazosProximos] = await pool.query(
      `SELECT COUNT(*) as total FROM editais 
       WHERE prazo_inscricao IS NOT NULL 
       AND prazo_inscricao >= CURDATE() 
       AND prazo_inscricao <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)`
    );

    return {
      totalEditais: linhasEditais[0]?.total || 0,
      totalAnalises: linhasAnalises[0]?.total || 0,
      tarefasPendentes: linhasTarefasPendentes[0]?.total || 0,
      prazosProximos: linhasPrazosProximos[0]?.total || 0,
    };
  },
};
