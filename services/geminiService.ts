
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Procesa una solicitud de tarea utilizando Gemini AI.
 * Optimizado para el Engranaje Apostólico TAFE.
 */
export const processTaskRequest = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analiza esta necesidad ministerial y conéctala con el engranaje: "${prompt}"`,
      config: {
        systemInstruction: `Eres el Orquestador del ERP TAFE. Tu función es mapear necesidades a los 7 Ejes Apostólicos:
        E1 (Evangelismo), E2 (Intercesión), E3 (Consolidación), E4 (Infancia/Danza), E5 (Alabanza/AV), E6 (Social), E7 (Jóvenes).
        
        Debes identificar:
        1. Ministerio Responsable (de los 17 oficiales).
        2. Eje Apostólico vinculado.
        3. Título profesional de la tarea.
        4. Perfil/Habilidad necesaria (ej: Multimedia, Oración, Logística).
        5. Grado de urgencia (booleano).
        
        Responde SIEMPRE en formato JSON compatible con el esquema del ERP.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ministry: { type: Type.STRING, description: "Nombre del ministerio responsable" },
            axis: { type: Type.STRING, description: "Eje del E1 al E7" },
            taskTitle: { type: Type.STRING, description: "Título breve de la tarea" },
            requiredSkill: { type: Type.STRING, description: "Habilidad técnica o espiritual necesaria" },
            isUrgent: { type: Type.BOOLEAN, description: "True si requiere atención inmediata" }
          },
          required: ["ministry", "axis", "taskTitle", "requiredSkill"]
        }
      }
    });

    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Error en el Orquestador AI:", error);
    return null;
  }
};
