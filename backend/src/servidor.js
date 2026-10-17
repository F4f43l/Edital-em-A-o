import { app } from './app.js';
import { configuracaoAmbiente, validarConfiguracao } from './configuracao/ambiente.js';
import { testarConexaoBanco } from './configuracao/banco.js';

async function iniciarServidor() {
  console.log('====================================================');
  console.log('🚀 INICIALIZANDO BACKEND - EDITAL EM AÇÃO');
  console.log('====================================================');

  validarConfiguracao();

  // Teste de conexão com o banco MySQL
  const resultadoBanco = await testarConexaoBanco();
  if (resultadoBanco.conectado) {
    console.log(`✅ [BANCO] Conexão com MySQL estabelecida com sucesso no banco: ${resultadoBanco.banco}`);
  } else {
    console.warn(`⚠️  [BANCO] Aviso de conexão com MySQL: ${resultadoBanco.mensagem}`);
    console.warn('   Verifique as credenciais no arquivo backend/.env e se o serviço MySQL está ativo.');
  }

  const servidor = app.listen(configuracaoAmbiente.PORTA, configuracaoAmbiente.HOST, () => {
    console.log(`🌐 [API] Servidor Express ativo em http://${configuracaoAmbiente.HOST}:${configuracaoAmbiente.PORTA}`);
    console.log(`📍 [URL BASE] http://localhost:${configuracaoAmbiente.PORTA}/api`);
    console.log(`🩺 [SAÚDE] http://localhost:${configuracaoAmbiente.PORTA}/api/health`);
    console.log('====================================================');
  });

  // Tratamento de encerramento suave (graceful shutdown)
  const sinaisEncerramento = ['SIGINT', 'SIGTERM'];
  sinaisEncerramento.forEach((sinal) => {
    process.on(sinal, () => {
      console.log(`\n🛑 Recebido sinal ${sinal}. Encerrando servidor com segurança...`);
      servidor.close(() => {
        console.log('👋 Servidor finalizado com sucesso.');
        process.exit(0);
      });
    });
  });
}

iniciarServidor().catch((erro) => {
  console.error('❌ Falha crítica ao inicializar o servidor:', erro);
  process.exit(1);
});
