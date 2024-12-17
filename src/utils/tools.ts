import axios from 'axios';
import Jimp from 'jimp';
import { Buffer } from 'buffer';
import { CreateCustomizationDto } from '../products/dto/create-customization.dto';
import { HttpException } from '@nestjs/common';

export function killSpan(text: string): string {
  const regex = /<span[^>]*>(.*?)<\/span>/g;

  const textWithoutSpan = text.replace(regex, '$1');

  return textWithoutSpan;
}

export function killParenthesisIn(texto) {
  return texto.replace(/\s*\([^)]*\)/g, '');
}

export function stringArraying(text: string): string[] {
  try {
    return text.includes('|') ? text.split('|') : [text];
  } catch (error) {
    return null;
  }
}

export function arraysAreEqualUnordered(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;

  return arr1.sort().toString() === arr2.sort().toString();
}

export function calculateDiscount(number: number, discount: number) {
  const discountedAmount = (number * discount) / 100;
  return parseFloat((number - discountedAmount).toFixed(2));
}

// Función para extraer la paleta de colores de una imagen a través de una URL
export async function extractPaletteFromImageUrl(imageUrl: string): Promise<string[]> {
  try {
    // Descarga la imagen desde la URL utilizando axios
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    const imageData = Buffer.from(response.data, 'binary');

    // Utiliza Jimp para cargar la imagen sin descargarla localmente
    const image = await Jimp.read(imageData);

    // Redimensiona la imagen para acelerar el proceso
    image.resize(100, Jimp.AUTO);

    // Calcula los colores dominantes
    const colors = {};
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const hexColor = Jimp.rgbaToInt(
        this.bitmap.data[idx],
        this.bitmap.data[idx + 1],
        this.bitmap.data[idx + 2],
        this.bitmap.data[idx + 3],
      ).toString(16);
      colors[hexColor] = (colors[hexColor] || 0) + 1;
    });

    const allColors = Object.keys(colors);
    const randomColors = [];
    for (let i = 0; i < 16; i++) {
      const randomIndex = Math.floor(Math.random() * allColors.length);
      const randomColor = '#' + allColors[randomIndex].substring(0, 6);
      randomColors.push(randomColor);
    }

    return randomColors;
  } catch (error) {
    console.log(error.stack);

  }
}

export function extractPriceFromString(text: string): number {
  // Utilizamos una expresión regular para encontrar el precio en el string
  const priceMatch = text.match(/-?\$\d+(\.\d+)?/);

  if (priceMatch) {
    // Si encontramos un precio, lo extraemos y lo convertimos a número
    const price = parseFloat(priceMatch[0].replace(/\$/g, ''));
    return price;
  } else {
    // Si no se encuentra un precio, retornamos 0 o algún valor predeterminado
    return 0;
  }
}

export function calculateCustomizationPrice(customization: CreateCustomizationDto): number {
  try {
    let totalPrice = 0;

    // Extraer precios de cada propiedad de personalización y sumarlos si el valor es nulo el precio es 0
    totalPrice += extractPriceFromString(customization.sleeve ?? '');
    totalPrice += extractPriceFromString(customization.neck ?? '');
    totalPrice += extractPriceFromString(customization.socks ?? '');
    totalPrice += extractPriceFromString(customization.pants ?? '');
    totalPrice += extractPriceFromString(customization.shorts ?? '');
    totalPrice += extractPriceFromString(customization.materials ?? '');

    // // Precio de la personalización del frente
    if (customization.frontSide.logos[0]) totalPrice += 4.99 * customization.frontSide.logos.filter((each) => each.logoUrl).length; // Esto podría ser opcional según tus necesidades
    if (customization.frontSide.texts[0]) totalPrice += 3.99 * customization.frontSide.texts.filter((each) => each.text).length; // Esto podría ser opcional según tus necesidades
    if (customization.frontSide.numbers[0]) totalPrice += 3.99 * customization.frontSide.numbers.filter((each) => each.number).length; // Esto podría ser opcional según tus necesidades
    // // Precio de la personalización de la parte trasera
    if (customization.backSide.logos[0]) totalPrice += 4.99 * customization.backSide.logos.filter((each) => each.logoUrl).length; // Esto también podría ser opcional
    if (customization.backSide.texts[0]) totalPrice += 3.99 * customization.backSide.texts.filter((each) => each.text).length; // Esto también podría ser opcional
    if (customization.backSide.numbers[0]) totalPrice += 3.99 * customization.backSide.numbers.filter((each) => each.number).length; // Esto también podría ser opcional

    return parseFloat(totalPrice.toFixed(2));
  } catch (error) {
    throw new HttpException(error.message, 500);
  }
}

export function isWebP(buffer: Buffer): boolean {
  // La firma única de un archivo WebP comienza con 'RIFF' seguido de 'WEBP'
  const webpSignature = ['52', '49', '46', '46'];

  // Comparar los primeros bytes del buffer con la firma de WebP
  for (let i = 0; i < webpSignature.length; i++) {
    // Convertir la firma hexadecimal a decimal
    const signatureByte = parseInt(webpSignature[i], 16);

    // Verificar si los bytes coinciden
    if (buffer[i] !== signatureByte) {
      return false; // No es WebP
    }
  }

  return true; // Es WebP
}

export function removeFirstRepeatedWord(title: string): string {
  // Dividir el título en palabras individuales
  const words = title.trim().split(' ');

  // Obtener la primera palabra
  const firstWord = words[0];

  // Filtrar las palabras restantes para eliminar todas las instancias de la primera palabra
  const filteredWords = words.filter((word, index) => index === 0 || word.toLowerCase() !== firstWord.toLowerCase());

  // Unir las palabras de nuevo en un solo título y devolverlo
  return filteredWords.join(' ');
}

export const currencySymbol = (currency: string) => {
  switch (currency) {
    case 'EUR': return '€ ';
    case 'CAD': return 'CAD ';
    default: return '$ ';
  }
};

export function eliminarCaracteresNoNumericos(inputString: string) {
  // Utilizamos una expresión regular para reemplazar todos los caracteres que no son números ni puntos con una cadena vacía
  const cleanedString = inputString.replace(/[^\d.+/-]/g, '');

  return cleanedString;
}