import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "FinControl Backend API", timestamp: new Date().toISOString() });
});

// Gemini AI Financial Advisor API Endpoint
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

app.post("/api/financial-advisor", async (req, res) => {
  try {
    const { userPrompt, financialData } = req.body;

    const ai = getAiClient();
    if (!ai) {
      // Rule: Handle missing key gracefully with helpful financial insight response fallback
      return res.json({
        success: true,
        isFallback: true,
        advice: `💡 **Análise Financeira do FinControl (Modo Local)**

Para ativar insights avançados com Inteligência Artificial Gemini em tempo real, configure sua chave **GEMINI_API_KEY** nas configurações do sistema.

**Dicas com base no seu panorama atual:**
1. **Reserva de Emergência**: Mantenha pelo menos 6 meses dos seus custos fixos acumulados na sua conta de rendimento automático ou caixinha.
2. **Regra 50/30/20**: Tente direcionar 50% da sua renda para necessidades básicas, 30% para desejos pessoais e 20% para investimentos e metas.
3. **Atenção aos Cartões**: Mantenha o valor das faturas abaixo de 30% do seu limite total para otimizar seu score de crédito.`,
      });
    }

    const systemInstruction = `Você é o FinControl AI, um consultor financeiro pessoal especialista, empático, pragmático e altamente analítico.
Seu objetivo é analisar os dados financeiros do usuário (receitas, despesas, saldo, orçamentos e metas) e fornecer insights estratégicos, alertas e recomendações acionáveis em Português do Brasil (PT-BR).

Regras de resposta:
1. Responda em Markdown bem formatado com emojis adequados e tópicos organizados.
2. Seja direto, prático e motivador, focado em economia real e hábitos saudáveis.
3. Calcule métricas importantes quando relevante (ex: taxa de poupança %, comprometimento da renda com despesas fixas, etc.).
4. Destaque pontos de atenção (ex: categorias estourando o orçamento, gastos altos com cartão).`;

    const promptText = `
Dados Financeiros Atuais do Usuário:
${JSON.stringify(financialData, null, 2)}

Pergunta / Pedido de Análise do Usuário:
${userPrompt || "Faça uma análise geral da minha saúde financeira, destacando pontos fortes, oportunidades de economia e alertas."}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: promptText }],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      success: true,
      isFallback: false,
      advice: response.text || "Não foi possível gerar a análise financeira no momento.",
    });
  } catch (error: any) {
    console.error("Erro ao chamar o Gemini API:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erro interno ao processar análise inteligente.",
      advice: "Ocorreu um erro ao conectar ao assistente de IA. Verifique sua conexão e tente novamente.",
    });
  }
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FinControl] Servidor rodando em http://localhost:${PORT}`);
  });
}

start();
