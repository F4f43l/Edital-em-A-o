import { obterPoolConexoes } from '../configuracao/banco.js';

export const repositorioTarefas = {
  async buscarTodas({ status, prioridade, analise_id } = {}) {
    const pool = obterPoolConexoes();
    let sql = `
      SELECT 
        t.*,
        a.edital_id,
        e.titulo as edital_titulo,
        r.titulo as requisito_titulo,
        r.tipo as requisito_tipo
      FROM tarefas t
      JOIN analises a ON t.analise_id = a.id
      JOIN editais e ON a.edital_id = e.id
      LEFT JOIN requisitos r ON t.requisito_id = r.id
      WHERE 1=1
    `;
    const parametros = [];

    if (status) {
      sql += ' AND t.status = ?';
      parametros.push(status);
    }
    if (prioridade) {
      sql += ' AND t.prioridade = ?';
      parametros.push(prioridade);
    }
    if (analise_id) {
      sql += ' AND t.analise_id = ?';
      parametros.push(analise_id);
    }

    sql += ' ORDER BY CASE t.status WHEN "pendente" THEN 1 WHEN "em_andamento" THEN 2 WHEN "bloqueada" THEN 3 WHEN "concluida" THEN 4 WHEN "nao_se_aplica" THEN 5 ELSE 6 END, t.data_limite ASC, t.created_at DESC';
    const [linhas] = await pool.query(sql, parametros);
    return linhas;
  },

  async buscarPorId(id) {
    const pool = obterPoolConexoes();
    const sql = `
      SELECT 
        t.*,
        a.edital_id,
        e.titulo as edital_titulo,
        r.titulo as requisito_titulo,
        r.tipo as requisito_tipo
      FROM tarefas t
      JOIN analises a ON t.analise_id = a.id
      JOIN editais e ON a.edital_id = e.id
      LEFT JOIN requisitos r ON t.requisito_id = r.id
      WHERE t.id = ?
    `;
    const [linhas] = await pool.query(sql, [id]);
    return linhas[0] || null;
  },

  async criar(dados) {
    const pool = obterPoolConexoes();
    const {
      analise_id,
      requisito_id = null,
      titulo,
      descricao = null,
      data_limite = null,
      prioridade = 'media',
      status = 'pendente',
    } = dados;

    const [resultado] = await pool.query(
      `INSERT INTO tarefas 
       (analise_id, requisito_id, titulo, descricao, data_limite, prioridade, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        analise_id,
        requisito_id,
        titulo,
        descricao,
        data_limite,
        prioridade,
        status,
      ]
    );

    return this.buscarPorId(resultado.insertId);
  },

  async criarVarias(itens) {
    if (!itens || itens.length === 0) return [];
    const pool = obterPoolConexoes();
    const conexao = await pool.getConnection();

    try {
      await conexao.beginTransaction();
      const idsCriados = [];

      for (const item of itens) {
        const [resultado] = await conexao.query(
          `INSERT INTO tarefas 
           (analise_id, requisito_id, titulo, descricao, data_limite, prioridade, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            item.analise_id,
            item.requisito_id || null,
            item.titulo,
            item.descricao || null,
            item.data_limite || null,
            item.prioridade || 'media',
            item.status || 'pendente',
          ]
        );
        idsCriados.push(resultado.insertId);
      }

      await conexao.commit();

      const [linhas] = await pool.query('SELECT * FROM tarefas WHERE id IN (?)', [idsCriados]);
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
      'titulo',
      'descricao',
      'data_limite',
      'prioridade',
      'status',
    ];

    for (const campo of camposPermitidos) {
      if (dados[campo] !== undefined) {
        campos.push(`${campo} = ?`);
        parametros.push(dados[campo]);
      }
    }

    if (campos.length === 0) {
      return this.buscarPorId(id);
    }

    parametros.push(id);
    await pool.query(`UPDATE tarefas SET ${campos.join(', ')} WHERE id = ?`, parametros);
    return this.buscarPorId(id);
  },

  async excluir(id) {
    const pool = obterPoolConexoes();
    const [resultado] = await pool.query('DELETE FROM tarefas WHERE id = ?', [id]);
    return resultado.affectedRows > 0;
  },
};
