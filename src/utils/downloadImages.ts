import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { put } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN } from 'src/config/enviroments';

export async function downloadImage(url: string, destinationDir: string, filename: string) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'arraybuffer',
  });

  const buffer = Buffer.from(response.data);
  const finalPath = path.join(destinationDir, filename);
  fs.writeFileSync(finalPath, buffer);

  return finalPath;
}

export function crearCarpeta(ruta) {
  // Verifica si la carpeta ya existe
  if (!fs.existsSync(ruta)) {
    // Crea la carpeta si no existe
    fs.mkdirSync(ruta, { recursive: true });
    console.log(`Carpeta "${ruta}" creada correctamente.`);
  } else {
    console.log(`La carpeta "${ruta}" ya existe.`);
  }
}


// Función para descargar y subir una imagen a Vercel Blob Storage con url
export const uploadImageToVercel = async (url: string, productTitle: string) => {
  try {
    // Descargar la imagen
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');
    // Subir la imagen a Vercel Blob Storage
    const { url: vercelUrl } = await put(`Products/${productTitle}${url.includes('customization') ? '/customization/' : '/'}${url.split('/').pop()}`, imageBuffer, { access: 'public', token: BLOB_READ_WRITE_TOKEN });

    return vercelUrl;
  } catch (error) {
    console.error(`Error uploading image from ${url}:`, error);
    throw error;
  }
};
// Función para subir una imagen a Vercel Blob Storage desde el sistema de archivos local
export async function uploadLocalImageToVercel(imagePath: string, productTitle: string): Promise<string> {
  try {
    // Leer la imagen desde el sistema de archivos
    const imageBuffer = await fs.promises.readFile(imagePath);

    // Obtener el nombre del archivo de la ruta
    const filename = path.basename(imagePath);

    // Subir la imagen a Vercel Blob Storage
    const { url: vercelUrl } = await put(`Products/${productTitle}${filename.includes('customization') ? '/customization/' : '/'}${filename}`, imageBuffer, {
      access: 'public',
      token: BLOB_READ_WRITE_TOKEN,
    });

    return vercelUrl;
  } catch (error) {
    console.error(`Error uploading image from ${imagePath}:`, error);
    throw error;
  }
}

// Función para leer archivos de una carpeta
export async function readFilesInFolder(folderPath: string): Promise<string[]> {
  try {
    const files = await fs.promises.readdir(folderPath);
    return files.map(file => path.join(folderPath, file));
  } catch (error) {
    console.error(`Error reading files in folder ${folderPath}:`, error);
    throw error;
  }
}