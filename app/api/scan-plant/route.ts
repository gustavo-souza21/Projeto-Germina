import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

// Portado de server.ts (Express) do protótipo AI Studio.
// Lógica idêntica, apenas adaptada para o formato de Route Handler do App Router.
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const { imageBase64, mimeType, description } = await req.json();

    if (!apiKey) {
      return NextResponse.json({
        status: "simulated",
        data: {
          nome_popular: "Espécie Detectada (Modo Simulado)",
          nome_cientifico: "Planta amazônica em análise",
          confianca: 92,
          descricao: "Análise realizada com base nas características botânicas fornecidas.",
          usos_tradicionais: [
            "Infusão para alívio de desconfortos digestivos",
            "Ação anti-inflamatória e calmante suave",
          ],
          preparo: "Ferver 3 folhas secas em 250ml de água por 5 minutos.",
          seguranca: "Seguro para consumo sob doses moderadas tradicionais.",
          ods_relacionados: [3, 4, 15],
          is_renisus: true,
          xp_recompensa: 100,
        },
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const contentsParts: any[] = [];
    if (imageBase64) {
      contentsParts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
        },
      });
    }

    const promptText = `Você é um botânico especialista e etnofarmacologista da Amazônia trabalhando no projeto GERMINA da UFAM.
Análise a planta/folha na imagem e/ou a descrição a seguir: "${description || "Análise visual de folha medicinal amazônica"}".

Retorne obrigatoriamente uma resposta no formato JSON com as seguintes propriedades:
- nome_popular: (string) Nome popular em português
- nome_cientifico: (string) Nome científico em latim
- confianca: (number) Porcentagem de certeza entre 80 e 98
- descricao: (string) Descrição botânica resumida
- usos_tradicionais: (array de strings) Usos medicinais tradicionais amazônicos
- preparo: (string) Modo tradicional de preparo (infusão, xarope, banho, etc)
- seguranca: (string) Recomendações de segurança e contraindicações
- ods_relacionados: (array de números) Os números dos ODS relacionados entre [3, 4, 9, 11, 12, 15]
- is_renisus: (boolean) Se pertence à lista da RENISUS (Plantas medicinais de interesse do SUS)
- xp_recompensa: (number) 100 se for RENISUS ou 50 se for normal`;

    contentsParts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts: contentsParts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nome_popular: { type: Type.STRING },
            nome_cientifico: { type: Type.STRING },
            confianca: { type: Type.NUMBER },
            descricao: { type: Type.STRING },
            usos_tradicionais: { type: Type.ARRAY, items: { type: Type.STRING } },
            preparo: { type: Type.STRING },
            seguranca: { type: Type.STRING },
            ods_relacionados: { type: Type.ARRAY, items: { type: Type.NUMBER } },
            is_renisus: { type: Type.BOOLEAN },
            xp_recompensa: { type: Type.NUMBER },
          },
          required: [
            "nome_popular", "nome_cientifico", "confianca", "descricao",
            "usos_tradicionais", "preparo", "seguranca", "ods_relacionados",
            "is_renisus", "xp_recompensa",
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return NextResponse.json({ status: "success", data: parsedData });
  } catch (error: any) {
    console.error("Erro na API /api/scan-plant:", error);
    return NextResponse.json(
      { error: "Falha ao escanear a planta com IA.", details: error.message || String(error) },
      { status: 500 }
    );
  }
}
