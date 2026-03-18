/**
 * Servicio de IA - Orquestador TAFE usando Claude (Anthropic)
 * Reemplaza geminiService.ts
 *
 * IMPORTANTE PARA PRODUCCIÓN:
 * - En desarrollo local: usa VITE_ANTHROPIC_API_KEY directamente (browser access habilitado)
 * - En Render (producción): crea un endpoint proxy en un backend Express/Node
 *   para NO exponer la API key al cliente. Ver CONTEXTO_PROYECTO.md §Backend Proxy.
 */

export interface AITaskResult {
  ministry: string;
  axis: string;
  taskTitle: string;
  requiredSkill: string;
  isUrgent: boolean;
}

export const processTaskRequest = async (prompt: string): Promise<AITaskResult | null> => {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string;

  if (!apiKey || apiKey === 'tu_api_key_de_anthropic') {
    console.warn('VITE_ANTHROPIC_API_KEY no configurada. El orquestador IA está deshabilitado.');
    return null;
  }

  const systemPrompt = `Eres el Orquestador del ERP TAFE de Iglesia TAFE. Tu función es mapear necesidades ministeriales a los 7 Ejes Apostólicos:
E1 (Evangelismo/Conquista), E2 (Intercesión/Vigilancia), E3 (Consolidación/Retención),
E4 (Infancia y Danza/Generacional), E5 (Alabanza y AV/Atmósfera),
E6 (Social y Saneamiento/Restauración), E7 (Jóvenes/Continuidad).

Debes identificar:
1. Ministerio Responsable (de: CSI/Medios, Alabanza, Consolidación, Anfitriones, Evangelismo, Células, Intercesión, Jóvenes)
2. Eje Apostólico vinculado (formato: E1_EVANGELISMO | E2_INTERCESION | E3_CONSOLIDACION | E4_INFANCIA_DANZA | E5_ALABANZA_AV | E6_SOCIAL_CUIDADO | E7_JOVENES)
3. Título profesional de la tarea (conciso, máx 8 palabras)
4. Perfil/Habilidad necesaria (ej: Multimedia, Oración, Logística, Diseño Gráfico, Sonido)
5. Grado de urgencia (true/false)

Responde SIEMPRE en formato JSON puro, sin markdown.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Analiza esta necesidad ministerial y conéctala con el engranaje apostólico TAFE: "${prompt}"\n\nResponde solo con JSON en este esquema:\n{"ministry":"...","axis":"...","taskTitle":"...","requiredSkill":"...","isUrgent":false}`
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error Anthropic API:', response.status, errorBody);
      return null;
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    if (!content) return null;

    return JSON.parse(content) as AITaskResult;
  } catch (error) {
    console.error('Error en el Orquestador Claude:', error);
    return null;
  }
};
