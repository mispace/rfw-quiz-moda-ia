// documentos.js — busca de documentos.
//
// FASE 1 (agora): catálogo simulado em memória, só para exercitar o fluxo
// "pedir documento -> assistente acha -> devolve".
// FASE 2 (depois): trocar por busca real no Google Drive.

const CATALOGO_SIMULADO = [
  { nome: 'Contrato RFW 2026.pdf', link: 'https://drive.exemplo/contrato-rfw-2026' },
  { nome: 'Cronograma de produção.xlsx', link: 'https://drive.exemplo/cronograma' },
  { nome: 'Briefing campanha verão.docx', link: 'https://drive.exemplo/briefing-verao' },
];

/**
 * Busca documentos por palavras-chave (case-insensitive, simples).
 * @param {string} consulta
 * @returns {Promise<{resultados: Array<{nome:string, link:string}>}>}
 */
export async function buscarDocumento(consulta) {
  const termos = (consulta || '').toLowerCase().split(/\s+/).filter(Boolean);
  const resultados = CATALOGO_SIMULADO.filter((doc) => {
    const alvo = doc.nome.toLowerCase();
    return termos.some((t) => alvo.includes(t));
  });
  return { resultados };
}
