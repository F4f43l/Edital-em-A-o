import { obterPoolConexoes } from '../configuracao/banco.js';

export const repositorioPerfis = {
  async buscarTodos() {
    const pool = obterPoolConexoes();
    const [linhas] = await pool.query('SELECT * FROM perfis ORDER BY created_at DESC');
    return linhas;
  },

  async buscarPorId(id) {
    const pool = obterPoolConexoes();
    const [linhas] = await pool.query('SELECT * FROM perfis WHERE id = ?', [id]);
    return linhas[0] || null;
  },

  async criar(dados) {
    const pool = obterPoolConexoes();
    const {
      nome_exibicao,
      nivel_ensino = null,
      instituicao = null,
      curso = null,
      municipio = null,
      situacao_trabalho = null,
      faixa_renda = null,
      tamanho_familia = null,
    } = dados;

    const [resultado] = await pool.query(
      `INSERT INTO perfis 
       (nome_exibicao, nivel_ensino, instituicao, curso, municipio, situacao_trabalho, faixa_renda, tamanho_familia) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome_exibicao,
        nivel_ensino,
        instituicao,
        curso,
        municipio,
        situacao_trabalho,
        faixa_renda,
        tamanho_familia,
      ]
    );

    return this.buscarPorId(resultado.insertId);
  },

  async atualizar(id, dados) {
    const pool = obterPoolConexoes();
    const campos = [];
    const parametros = [];

    const camposPermitidos = [
      'nome_exibicao',
      'nivel_ensino',
      'instituicao',
      'curso',
      'municipio',
      'situacao_trabalho',
      'faixa_renda',
      'tamanho_familia',
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
    await pool.query(`UPDATE perfis SET ${campos.join(', ')} WHERE id = ?`, parametros);
    return this.buscarPorId(id);
  },

  async contarAnalisesDependentes(id) {
    const pool = obterPoolConexoes();
    const [linhas] = await pool.query('SELECT COUNT(*) as total FROM analises WHERE perfil_id = ?', [id]);
    return linhas[0]?.total || 0;
  },

  async excluir(id) {
    const pool = obterPoolConexoes();
    const [resultado] = await pool.query('DELETE FROM perfis WHERE id = ?', [id]);
    return resultado.affectedRows > 0;
  },
};
