import { GoogleGenAI } from "@google/genai";
import { InstitutionId } from "../types";

// Note: In a real app, never expose API keys on the client side. 
// This is for demonstration purposes as per instructions to use process.env.API_KEY
const apiKey = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateSustainabilityInsights = async (
  institutionId: InstitutionId, 
  currentScore: string, 
  gapCount: number,
  dimensionData: any
): Promise<string> => {
  if (!ai) {
    return "API Key não configurada. Configure process.env.API_KEY para receber insights de IA.";
  }

  const prompt = `
    Você é um especialista em relatórios de sustentabilidade GRI e ASG.
    
    Analise os seguintes dados da instituição ${institutionId} do Sistema Fecomércio RJ:
    - Índice GRI Atual: ${currentScore}
    - GAPs de dados identificados: ${gapCount}
    - Performance por dimensão: ${JSON.stringify(dimensionData)}

    Forneça:
    1. Uma análise breve de 1 parágrafo sobre a situação atual.
    2. Três sugestões de "Quick Wins" (ganhos rápidos) para melhorar o índice.
    3. Um alerta de risco baseado nos gaps.
    
    Responda em formato HTML simples (sem tags html/body, apenas p, ul, li, strong).
    Use português formal.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Não foi possível gerar insights no momento.";
  } catch (error) {
    console.error("Erro ao gerar insights:", error);
    return "Erro de conexão com o serviço de IA.";
  }
};