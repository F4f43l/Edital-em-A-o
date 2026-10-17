import { app } from '../src/app.js';
import { configuracaoAmbiente } from '../src/configuracao/ambiente.js';

async function validarConexaoNetwork() {
  console.log('====================================================');
  console.log('🧪 TESTE REAL DE CONECTIVIDADE E CORS (NETWORK & LOCAL)');
  console.log('====================================================');

  const porta = 3001;
  const servidor = app.listen(porta, '0.0.0.0');

  const origensParaTestar = [
    { nome: 'Network IP Antigravity', origin: 'http://192.168.18.38:5173', devePermitir: true },
    { nome: 'Localhost Frontend', origin: 'http://localhost:5173', devePermitir: true },
    { nome: 'Loopback IP Frontend', origin: 'http://127.0.0.1:5173', devePermitir: true },
    { nome: 'Origem Não Autorizada', origin: 'http://site-malicioso.com', devePermitir: false },
  ];

  const rotasParaTestar = [
    '/api/health',
    '/api/editais',
    '/api/editais/contadores',
  ];

  let falhas = 0;

  for (const item of origensParaTestar) {
    console.log(`\n🔍 Testando ${item.nome} (Origin: ${item.origin})...`);

    for (const rota of rotasParaTestar) {
      try {
        const res = await fetch(`http://127.0.0.1:${porta}${rota}`, {
          method: 'GET',
          headers: {
            Origin: item.origin,
            Accept: 'application/json',
          },
        });

        const allowOrigin = res.headers.get('access-control-allow-origin');

        if (item.devePermitir) {
          if (res.status === 200 && allowOrigin === item.origin) {
            console.log(`  ✅ ${rota} -> 200 OK | CORS Allow-Origin: ${allowOrigin}`);
          } else {
            console.error(`  ❌ ${rota} -> Status: ${res.status} | Allow-Origin: ${allowOrigin}`);
            falhas++;
          }
        } else {
          if (allowOrigin !== item.origin) {
            console.log(`  ✅ ${rota} -> Bloqueado com segurança pelo CORS (Origem não autorizada)`);
          } else {
            console.error(`  ❌ ${rota} -> Não deveria ter permitido a origem não autorizada!`);
            falhas++;
          }
        }
      } catch (err) {
        if (!item.devePermitir) {
          console.log(`  ✅ ${rota} -> Requisição rejeitada pela política de CORS: ${err.message}`);
        } else {
          console.error(`  ❌ ${rota} -> Falha inesperada:`, err.message);
          falhas++;
        }
      }
    }

    // Teste preflight OPTIONS
    try {
      const resOptions = await fetch(`http://127.0.0.1:${porta}/api/editais`, {
        method: 'OPTIONS',
        headers: {
          Origin: item.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      });

      const allowOriginOptions = resOptions.headers.get('access-control-allow-origin');
      if (item.devePermitir) {
        if ((resOptions.status === 204 || resOptions.status === 200) && allowOriginOptions === item.origin) {
          console.log(`  ✅ OPTIONS Preflight -> ${resOptions.status} | Allow-Origin: ${allowOriginOptions}`);
        } else {
          console.error(`  ❌ OPTIONS Preflight falhou -> Status: ${resOptions.status} | Allow-Origin: ${allowOriginOptions}`);
          falhas++;
        }
      } else {
        if (allowOriginOptions !== item.origin) {
          console.log(`  ✅ OPTIONS Preflight -> Bloqueado com segurança para origem não autorizada`);
        } else {
          console.error(`  ❌ OPTIONS Preflight permitiu origem não autorizada!`);
          falhas++;
        }
      }
    } catch (err) {
      if (!item.devePermitir) {
        console.log(`  ✅ OPTIONS Preflight -> Rejeitado pelo CORS conforme esperado`);
      } else {
        console.error(`  ❌ OPTIONS Preflight erro:`, err.message);
        falhas++;
      }
    }
  }

  servidor.close();

  console.log('\n====================================================');
  if (falhas === 0) {
    console.log('🎉 TODOS OS TESTES DE CONEXÃO E CORS FORAM APROVADOS COM SUCESSO!');
  } else {
    console.error(`⚠️ Ocorreram ${falhas} falhas nos testes.`);
    process.exit(1);
  }
  console.log('====================================================');
  process.exit(0);
}

validarConexaoNetwork().catch((err) => {
  console.error('Erro na execução dos testes:', err);
  process.exit(1);
});
