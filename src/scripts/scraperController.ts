import { getOpenaiResponse } from "./implementationOpenaiAPI";
import fs from "fs";
import path from "path";

const sources = {
  cityTV: [
    "https://citytv.eltiempo.com/noticias/judicial/",
    // "https://citytv.eltiempo.com/noticias/seguridad/",
    // "https://citytv.eltiempo.com/noticias/orden-publico/",
   ],
  // elColombiano: [
  //   "https://www.elcolombiano.com/medellin/",
  //   //"https://www.elcolombiano.com/antioquia/",
  //   // "https://www.elcolombiano.com/colombia/",
  // ],
  // vanguardia: [
  //   "https://www.vanguardia.com/judicial/",
  //      "https://www.vanguardia.com/economia/",
  //      "https://www.vanguardia.com/colombia/",
  // ],
  // el_pilon: [
  //   "https://elpilon.com.co/",
  // ],
  // el_universal: [
  //   "https://www.eluniversal.com.co/sucesos/",
  // ],
  // enlace_television: [
  //   "https://enlacetelevision.com/noticias/"
  // ],
  // boyaca7_dias: [
  //   "https://boyaca7dias.com.co/"
  // ],
};

// Obtener fechas válidas (hoy y ayer)
function getValidDates() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  return [formatDate(today), formatDate(yesterday)];
}

// Filtrar artículos recientes y aquellos con fechas vacías
function filterRecentArticles(articles: any[]) {
  const [today, yesterday] = getValidDates();

  return articles.filter(article => {
    if (!article.date || article.date.trim() === "") {
      return true; //
    }
    return article.date === today || article.date === yesterday;
  });
}


// Procesar los enlaces de noticias en detalle
async function processNewsLinks(articles: any[]) {
  const detailedResults: object[] = [];

  for (const article of articles) {
    const { url } = article;

    console.log(`Procesando el link de la noticia: ${url}`);
    try {
      const detailedInfo = await getOpenaiResponse(url, "detailed");
      if (detailedInfo) {
        detailedResults.push(detailedInfo);
      } else {
        console.warn(`No se obtuvo información detallada para la URL: ${url}`);
      }
    } catch (error) {
      console.error(`Error al procesar la URL ${url}:`, error);
    }
  }

  return detailedResults;
}

// Obtener la marca de tiempo actual para nombres de archivo
function getCurrentTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}-${minutes}-${seconds}`;
}

async function main() {
  const unifiedResults: object[] = [];
  const detailedResults: object[] = [];

  for (const [source, urls] of Object.entries(sources)) {
    for (const url of urls) {
      console.log(`Procesando ${url} para ${source}`);
      try {
        const result = await getOpenaiResponse(url);
        if (result) {
          unifiedResults.push(...result);

          // Scraping recursivo para enlaces recientes
          const recentArticles = filterRecentArticles(result);
          const detailedInfo = await processNewsLinks(recentArticles);
          detailedResults.push(...detailedInfo);
        } else {
          console.warn(`No se obtuvo resultados de scraping para ${url}`);
        }
      } catch (error) {
        console.error(`Error crítico procesando la fuente ${url}:`, error);
      }
    }
  }

  // Guardar los resultados en archivos JSON
  const outputDir = path.join(__dirname, "../scrappingOutput");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = getCurrentTimestamp();
  fs.writeFileSync(path.join(outputDir, `Results_${timestamp}.json`), JSON.stringify(unifiedResults, null, 2), "utf-8");
  fs.writeFileSync(path.join(outputDir, `DetailedResults_${timestamp}.json`), JSON.stringify(detailedResults, null, 2), "utf-8");

  console.log("Resultados unificados guardados.");
  console.log("Resultados detallados guardados.");

  // Forzar la finalización del proceso
  process.exit(0);
}

// Manejo de errores en la ejecución principal
main().catch(error => {
  console.error("Error crítico en el proceso principal:", error);
  process.exit(1); // Finaliza con un código de error
});
