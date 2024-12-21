import OpenAI from "openai";
import { scrapingWeb } from "./scrappingWeb";

const openai = new OpenAI({
    organization: "",
    project: "",
    apiKey: "",
});

// Función para obtener la fecha actual en formato "YYYY-MM-DD"
function getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Estimador de tokens basado en palabras
function estimateTokens(text: string): number {
    const wordCount = text.split(/\s+/).length; // Divide por espacios
    return Math.ceil(wordCount * 1.5); // Aproximación de 1.5 tokens por palabra
}

// Truncar el texto para limitarlo a 100k tokens
function truncateToTokenLimit(text: string, tokenLimit: number): string {
    const words = text.split(/\s+/);
    const maxWords = Math.floor(tokenLimit / 1.5); // Convertir el límite de tokens a palabras
    return words.slice(0, maxWords).join(" ");
}

export async function getOpenaiResponse(url: string, type: "summary" | "detailed" = "summary"): Promise<object[] | null> {
    console.log(`Iniciando proceso de scraping para la URL: ${url}`);
    let scrapedContent = await scrapingWeb(url);

    if (!scrapedContent) {
        console.log(`No se pudo obtener contenido válido para la URL: ${url}.`);
        return null;
    }

     // Calcular tokens estimados y truncar si excede el límite
     const estimatedTokens = estimateTokens(scrapedContent);
     if (estimatedTokens > 100000) {
         scrapedContent = truncateToTokenLimit(scrapedContent, 100000);
     }

    // Obtener la fecha actual
    const currentDate = getCurrentDate();

    const systemPrompt = type === "summary"
        ? `Con base al fragmento de HTML sobre una página de noticias, tu objetivo es analizar el HTML y debes retornar la respuesta 
                     en formato JSON sin complementos ni información innecesaria, no debes agregar nada antes ni después del JSON; el JSON debe 
                     tener agrupado cada artículo con su título (title:), 
                     fecha de publicación (date:) y link de la noticia (url:). Ten presente que algunas urls pueden no ser válidas, por lo que
                     debes completarlas con la url base de la página, una url válida debe comenzar con "https://". Si la fecha no está en el formato
                        "YYYY-MM-DD", y dice algo como "hace 19 minutos", debes asignar la fecha actual la cuál es ${currentDate}. Si la fecha está
                        vacía, déjala así vacía, no la actualices.
                     Ejemplo de la respuesta que se espera: 
                     [
                        { 
                            "title": "Noticia 1", 
                            "date": "2024-11-13", 
                            "url": "https://www.eltiempo.com/noticia1" 
                        }, 
                        { 
                            "title": "Noticia 2", 
                            "date": "2024-11-13", 
                            "url": "https://www.eltiempo.com/noticia2" 
                        }
                     ]`
        : `Con base al fragmento de HTML de una noticia específica, tu objetivo es analizar el HTML y debes retornar la respuesta 
                     en formato JSON sin complementos ni información innecesaria, no debes agregar nada antes ni después del JSON; el JSON debe 
                     tener la siguiente estructura:
                    [
                    { 
                        "date": "2024-11-13",
                        "hour": "12:30",    
                        "city": "Medellín",
                        "department": "Antioquia",
                        "title": "Noticia 1", 
                        "description": "Descripción de la noticia 1",
                        "category": "Factores Socioeconómicos",
                        "subcategory": "Programas de Paz",
                        "infrastructure": "Educación"
                    }
                    ]
            Ten en cuenta que para category, subcategory, infraestructure, segun la noticia debes limitarte a seleccionar uno de
            las opciones presentes, segun sea el caso:

            "category": "Condiciones Meteorológicas y Desastres Naturales", "Crimen Organizado", "Factores Socioeconómicos",
                        "Infraestructura", "Novedad vial", "Orden Público y Seguridad", "Problemas Políticos", "Salud Pública"

            "infrastructure": "Hidráulica", "Telecomunicaciones", "Industrial y Comercial", "Energética", "Residencial",
                                "Transporte terrestre", "Transporte aéreo", "Salud", "Recursos naturales", "Educación"
    
            "subcategory": "Alertas Climáticas Extremas", "Deslizamientos de Tierra", "Incendios", "Terremotos o Tsunamis",
                            "Tormentas, Huracanes o Inundaciones", "Actividades del Narcotráfico", "Extorsiones y Amenazas",
                            "Tráfico de Armas", "Crisis Económicas", "Cortes de Energía", "Daños a Redes de Gas o Agua",
                            "Fallos en Telecomunicaciones", "Cierre vial", "Disturbios Civiles o Paros", "Homicidios",
                            "Protestas y Manifestaciones", "Robos y hurtos", "Secuestros y Extorsión", "Terrorismo",
                            "Brotes de Enfermedades", "Pandemias o Epidemias", "Problemas Sanitarios Graves",
                            "Cambios de Gobierno o Tensiones Políticas", "Reformas Legislativas", "Regulaciones Locales Adversas"
                         }`;

    const messages = [
        { role: "system" as const, content: systemPrompt },
        { role: "user" as const, content: scrapedContent },
    ];

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
            temperature: 0.5,
            max_tokens: 3000,
            top_p: 1,
        });

        const jsonResponse = response.choices[0].message?.content;
        return jsonResponse ? JSON.parse(jsonResponse) : null;
    } catch (error) {
        console.error("Error al obtener la respuesta de OpenAI:", error);
        return null;
    }
}


