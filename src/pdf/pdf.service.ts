// pdf.service.ts
import * as PDFDocument from 'pdfkit';
import axios from 'axios';
import { HttpException, Injectable } from '@nestjs/common';
import { extractPaletteFromImageUrl, isWebP, killParenthesisIn } from '../utils/tools';
import { Neck, Pants, Shorts, Socks, withOrWithoutShort } from '../utils/detail.enum';
import { CreateCustomizationDto } from '../products/dto/create-customization.dto';
import { PantsType, ShortsType, SocksType } from '../products/enum/customization.enum';
import { SERVER_URL } from '../config/enviroments';
import * as path from 'path';
import imageSize from 'image-size';
@Injectable()
export class PdfService {
  async generatePdf(customization: CreateCustomizationDto, product, order?): Promise<Buffer> {
    const { neck, pants, size, materials, shorts, socks, frontSide, backSide } = customization;
    const { images, sports } = product;

    try {
      return await new Promise(async (resolve, reject) => {
        const doc = new PDFDocument({ size: [1651, 1276] });
        const buffers: Buffer[] = [];

        // Definir rutas de las fuentes usando path.join
        const antonPath = path.join(__dirname, 'fonts/Anton/Anton-Regular.ttf');
        const rasiolinePath = path.join(__dirname, 'fonts/Rasioline/DD rasioline.otf');
        const spotlightPath = path.join(__dirname, 'fonts/Spot Light/Spot Light.otf');
        const uninorthPath = path.join(__dirname, 'fonts/Uni North/UNINorth-College.otf');
        const timesromanPath = path.join(__dirname, 'fonts/Times New Roman/TNR.ttf');
        const arialPath = path.join(__dirname, 'fonts/Arial/ARIAL.ttf');
        const courierPath = path.join(__dirname, 'fonts/Courier New/cour.ttf');
        const verdanaPath = path.join(__dirname, 'fonts/Verdana/Verdana.ttf');
        const georgiaPath = path.join(__dirname, 'fonts/Georgia/georgia.ttf');
        const tahomaPath = path.join(__dirname, 'fonts/Tahoma/tahoma.ttf');

        // Registrar las fuentes
        doc.registerFont('Anton', antonPath);
        doc.registerFont('Rasioline', rasiolinePath);
        doc.registerFont('Spot Light', spotlightPath);
        doc.registerFont('Uni North', uninorthPath);
        doc.registerFont('Times New Roman', timesromanPath);
        doc.registerFont('Arial', arialPath);
        doc.registerFont('Courier New', courierPath);
        doc.registerFont('Verdana', verdanaPath);
        doc.registerFont('Georgia', georgiaPath);
        doc.registerFont('Tahoma', tahomaPath);

        // Manejadores de eventos para completar y manejar errores
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
        doc.on('error', reject);

        // Cargar la imagen
        const imagePath = SERVER_URL + '/PdfBackground.png';
        try {
          const { data } = await axios.get(imagePath, { responseType: 'arraybuffer' });

          // Convertir los datos de la respuesta en un buffer
          const imageBuffer = Buffer.from(data);

          const bgImageX = 1551;
          const bgImageY = 1276;
          // Agregar imagen al PDF
          doc.image(imageBuffer, {
            fit: [bgImageX, bgImageY], // Ajustar la imagen al tamaño del PDF
          });
        } catch (error) {
          console.log('Error al cargar la imagen:' + error.message);
        }

        // Descargar las imágenes de las URLs
        const imageUrls = [
          images[2] || images[0], // frontal remera
          images[3] || images[1],  // posterior remera
          neck ? Neck.find(n => n.name === neck).image : null, // cuello
          frontSide.logos?.reduce((acc, logo) => acc += logo.logoUrl + '|', '') ?? null, // logo,
          backSide.logos?.reduce((acc, logo) => acc += logo.logoUrl + '|', '') ?? null, // logo Back,
          socks ? Socks.find(s => s.name === socks).image : null, // color de medias
        ];

        // agregar shorts o pantalones
        if (shorts && shorts == withOrWithoutShort[1]) {
          imageUrls.splice(3, 0, Shorts[0].image);
        } else if (shorts && shorts !== withOrWithoutShort[0] && (!pants || pants === PantsType.None)) {
          imageUrls.splice(3, 0, Shorts.find(s => s.name == shorts).image);
        } else if (!shorts || shorts == ShortsType.None || shorts === withOrWithoutShort[0] && pants) {
          imageUrls.splice(3, 0, Pants.find(p => p.name == pants).image);
        } else {
          imageUrls.splice(3, 0, null);
        }

        const fetchImageBuffer = async (url) => {
          try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data);
            return isWebP(buffer) ? null : buffer;
          } catch (error) {
            console.log(error.message, 404);
            return null;
          }
        };

        const imageBuffers: (Buffer | Buffer[] | void[])[] = await Promise.all(imageUrls.map(async (imageUrl) => {
          if (imageUrl !== null && imageUrl.includes('|')) {
            // Si imageUrl es un array, obtener buffers para cada URL en el array
            const bffrs: Buffer[] = [];
            for (const url of imageUrl.split('|').filter((l) => l !== '')) {
              bffrs.push(await fetchImageBuffer(url));
            }
            return bffrs.filter(buffer => buffer !== null); // Filtrar buffers nulos
          } else if (imageUrl != null) {
            // Si imageUrl es una única URL
            const bffr = await fetchImageBuffer(imageUrl);
            return bffr;
          }
          return null;
        }));

        // Calcular el ancho del PDF
        const pdfWidth = doc.page.width;

        // Calcular el espacio disponible para cada imagen
        const availableWidth = pdfWidth / 2;

        // Calcular el tamaño de las imágenes (se asume el mismo tamaño para ambas imágenes)
        const imageWidth = availableWidth;
        const imageHeight = (imageWidth * 3) / 4; // Se mantiene la proporción de la imagen

        // Calcular las coordenadas de las imágenes
        const x1 = (pdfWidth - 2 * imageWidth) / 2;
        const x2 = x1 + imageWidth - 50;
        const y = ((doc.page.height - imageHeight) / 2) + 50;

        // Agregar las imágenes al PDF
        let ShirtPalette = null;
        if (imageBuffers[0]) {
          ShirtPalette = await extractPaletteFromImageUrl(imageUrls[0]);
          doc.image(imageBuffers[0] as Buffer, 350, y, { width: 500, height: 500 });
        }
        if (imageBuffers[1]) doc.image(imageBuffers[1] as Buffer, x2, y, { width: 500, height: 500 });

        // Agregar texto

        if (neck && imageBuffers[2]) {
          doc.font('Helvetica-Bold').fontSize(25).text('NECK:', 140, 510);
          doc.font('Helvetica').fontSize(25).text(killParenthesisIn(neck), 220, 510);
          doc.image(imageBuffers[2] as Buffer, 150, 300, { width: 200, height: 200 });
        }

        if (shorts && imageBuffers[3] || pants && imageBuffers[3]) {
          if (shorts && shorts !== ShortsType.None && shorts !== withOrWithoutShort[0]) {
            doc.font('Helvetica-Bold').fontSize(25).text('SHORTS', 1300, 1010);
            doc.image(imageBuffers[3] as Buffer, 1260, 1040, { width: 200, height: 200 });
          }
          if (pants && pants !== PantsType.None) {
            doc.font('Helvetica-Bold').fontSize(25).text('PANTS', 1300, 1010);
            doc.image(imageBuffers[3] as Buffer, 1260, 1040, { width: 200, height: 200 });
          }
        }

        if (socks && socks !== SocksType['No Socks (+$0.00)']) {
          doc.font('Helvetica-Bold').fontSize(25).text('SOCKS', 1475, 1010);
          // doc.font('Helvetica').fontSize(25).text(killParenthesisIn(socks), 1370, 1110);
          doc.image(imageBuffers[6] as Buffer, 1475, 1040, { width: 100, height: 100 });
          doc.rect(1475, 1040, 100, 100).stroke();
        }

        if (order) {
          doc.font('Helvetica-Bold').fontSize(25).text('ORDER:', 500, 200);
          doc.font('Helvetica').fontSize(25).text('#' + order, 600, 200);
        }

        doc.font('Helvetica-Bold').fontSize(25).text('SPORT:', 500, 230);
        doc.font('Helvetica').fontSize(25).text(sports, 600, 230);

        doc.font('Helvetica-Bold').fontSize(20).text('QUANTITY:', 760, 190);
        doc.font('Helvetica').fontSize(20).text('1', 870, 190);

        doc.font('Helvetica-Bold').fontSize(20).text('GENDER:', 760, 220);
        doc.font('Helvetica').fontSize(20).text(size.split('-').pop(), 858, 220);

        doc.font('Helvetica-Bold').fontSize(20).text('SIZE:', 760, 250);
        doc.font('Helvetica').fontSize(20).text(size, 818, 250);

        doc.font('Helvetica-Bold').fontSize(18).text('MATERIALS:', 960, 190);
        doc.font('Helvetica').fontSize(18).text(killParenthesisIn(materials), 1070, 190);

        doc.font('Helvetica-Bold').fontSize(18).text('SPECIAL NECK:', 960, 220);
        doc.font('Helvetica').fontSize(18).text(neck ? killParenthesisIn(neck) : 'No', 1105, 220);

        doc.font('Helvetica-Bold').fontSize(20).text('SHORTS:', 960, 250);
        doc.font('Helvetica').fontSize(20).text(shorts && shorts !== withOrWithoutShort[1] && shorts !== Shorts[0].name ? 'Yes' : 'No', 1055, 250);

        if (customization.designName) {
          doc.font('Helvetica-Bold').fontSize(25).text('DESIGN', 1240, 200);
          doc.font('Helvetica').fontSize(20).text(customization.designName, 1240, 230);
        }

        doc.font('Helvetica-Bold').fontSize(24).text('Front Side', 1330, 320);
        doc.font('Helvetica-Bold').fontSize(20).text('Logos', 1250, 350);
        doc.font('Helvetica-Bold').fontSize(20).text('Numbers', 1350, 350);
        doc.font('Helvetica-Bold').fontSize(20).text('Texts', 1450, 350);
        doc.font('Helvetica-Bold').fontSize(24).text('Back Side', 1330, 650);
        doc.font('Helvetica-Bold').fontSize(20).text('Logos', 1250, 680);
        doc.font('Helvetica-Bold').fontSize(20).text('Numbers', 1350, 680);
        doc.font('Helvetica-Bold').fontSize(20).text('Texts', 1450, 680);

        if (backSide.texts[0]) {
          const maxVisibleTexts = 9; // Número máximo de textos visibles antes de truncar
          const fontsSet = new Set();
          let processedCount = 0;

          // Itera sobre los textos
          for (const [index, each] of backSide.texts.entries()) {
            if (index < maxVisibleTexts) {
              // Configurar la fuente, tamaño y color del texto
              doc.font(each.font || 'Helvetica').fontSize(each.textSize).fillColor(each.textColor);

              // Calcular el tamaño del texto
              const textWidth = doc.widthOfString(each.text);
              const textHeight = doc.heightOfString(each.text);

              // Posición principal (sin rotación)
              const mainX = x2 + each.textPosition.x;
              const mainY = y + each.textPosition.y;

              // Guardar el estado antes de aplicar cualquier transformación
              doc.save();

              // Trasladar el contexto gráfico al centro del texto
              const centerX = mainX + textWidth / 2;
              const centerY = mainY + textHeight / 2;
              doc.translate(centerX, centerY);

              // Rotar el contexto alrededor del centro del texto
              doc.rotate(each.rotate || 0);

              // Dibujar el texto centrado en el nuevo origen
              doc.text(each.text, -textWidth / 2, -textHeight / 2);

              // Restaurar el estado original
              doc.restore();

              // Añadir la fuente a `fontsSet` si está definida
              if (each.font) {
                fontsSet.add(each.font);
              }

              processedCount++;
            } else {
              // Si se ha llegado al máximo de textos visibles, sale del bucle
              break;
            }
          }

          // Calcula el número de textos restantes
          const remainingCount = backSide.texts.length - processedCount;

          // Agrega el texto adicional si hay textos restantes
          if (remainingCount > 0) {
            if (remainingCount === 1) {
              // Muestra el texto adicional directamente si falta solo 1
              doc.font('Helvetica').fontSize(20).text(backSide.texts[processedCount].text, 1450, 700 + 20 * processedCount);
            } else {
              // Muestra el texto adicional indicando cuántos textos más hay si faltan 2 o más
              doc.font('Helvetica').fontSize(20).text(`${remainingCount} more...`, 1450, 700 + 20 * processedCount);
            }
          }

          // Genera la lista de fuentes
          const fonts = Array.from(fontsSet).join(', ');
          doc.font('Helvetica-Bold').fontSize(20).text('FONTS:', 1250, 910);
          doc.font('Helvetica').fontSize(20).text(fonts, 1330, 910);
        }


        if (backSide.numbers[0]) {
          const maxVisibleNumbers = 9; // Número máximo de números visibles antes de truncar
          let processedCount = 0;

          // Itera sobre los números
          for (const [index, each] of backSide.numbers.entries()) {
            if (index < maxVisibleNumbers) {
              // Configurar la fuente, tamaño y color del número
              doc.font(each.font || 'Helvetica').fontSize(each.numberSize).fillColor(each.numberColor);

              // Calcular el tamaño del número
              const numberWidth = doc.widthOfString(each.number);
              const numberHeight = doc.heightOfString(each.number);

              // Posición principal (sin rotación)
              const mainX = x2 + each.numberPosition.x;
              const mainY = y + each.numberPosition.y;

              // Guardar el estado antes de aplicar cualquier transformación
              doc.save();

              // Trasladar el contexto gráfico al centro del número
              const centerX = mainX + numberWidth / 2;
              const centerY = mainY + numberHeight / 2;
              doc.translate(centerX, centerY);

              // Rotar el contexto alrededor del centro del número
              doc.rotate(each.rotate || 0);

              // Dibujar el número centrado en el nuevo origen
              doc.text(each.number, -numberWidth / 2, -numberHeight / 2);

              // Restaurar el estado original
              doc.restore();

              processedCount++;
            } else {
              // Si se ha llegado al máximo de números visibles, sale del bucle
              break;
            }
          }

          // Calcula el número de números restantes
          const remainingCount = backSide.numbers.length - processedCount;

          // Agrega el texto adicional si hay números restantes
          if (remainingCount > 0) {
            if (remainingCount === 1) {
              // Muestra el número adicional directamente si falta solo 1
              doc.font('Helvetica').fontSize(20).text(backSide.numbers[processedCount].number, 1350, 700 + 20 * processedCount);
            } else {
              // Muestra el texto adicional indicando cuántos números más hay si faltan 2 o más
              doc.font('Helvetica').fontSize(20).text(`${remainingCount} more...`, 1350, 700 + 20 * processedCount);
            }
          }
        }

        if (frontSide.texts[0]) {
          const fontsSet = new Set();
          const maxVisibleTexts = 9; // Número máximo de textos visibles antes de truncar
          let processedCount = 0;

          // Itera sobre los textos
          for (const [index, each] of frontSide.texts.entries()) {
            if (index < maxVisibleTexts) {
              doc.font('Helvetica').fontSize(20).text(each.text, 1450, 370 + 20 * index);
              doc.fillColor(each.textColor);
              // Guardar el estado antes de aplicar cualquier transformación
              doc.save();

              // Configurar la fuente, tamaño y color del texto
              doc.font(each.font || 'Helvetica').fontSize(each.textSize).fillColor(each.textColor);

              // Calcular el tamaño del texto
              const textWidth = doc.widthOfString(each.text);
              const textHeight = doc.heightOfString(each.text);

              // Posición principal (sin rotación)
              const mainX = 350 + each.textPosition.x;
              const mainY = y + each.textPosition.y;

              // Trasladar el contexto gráfico al centro del texto
              const centerX = mainX + textWidth / 2;
              const centerY = mainY + textHeight / 2;
              doc.translate(centerX, centerY);

              // Rotar el contexto alrededor del centro del texto
              doc.rotate(each.rotate || 0);

              doc.text(each.text, -textWidth / 2, -textHeight / 2);

              // Restaurar el estado original
              doc.restore();

              if (each.font) {
                fontsSet.add(each.font);
              }
              processedCount++;
            } else {
              // Si se ha llegado al máximo de textos visibles, sale del bucle
              break;
            }
          }

          // Calcula el número de textos restantes
          const remainingCount = frontSide.texts.length - processedCount;

          // Agrega el texto adicional si hay textos restantes
          if (remainingCount > 0) {
            if (remainingCount === 1) {
              // Muestra el texto adicional directamente si falta solo 1
              doc.font('Helvetica').fontSize(20).text(frontSide.texts[processedCount].text, 1450, 370 + 20 * processedCount);
            } else {
              // Muestra el texto adicional indicando cuántos textos más hay si faltan 2 o más
              doc.font('Helvetica').fontSize(20).text(`${remainingCount} more...`, 1450, 370 + 20 * processedCount);
            }
          }

          // Genera la lista de fuentes
          const fonts = Array.from(fontsSet).join(', ');
          doc.font('Helvetica-Bold').fontSize(20).text('FONTS:', 1250, 580);
          doc.font('Helvetica').fontSize(20).text(fonts, 1330, 580);
        }

        if (frontSide.numbers[0]) {
          const maxVisibleNumbers = 9; // Número máximo de números visibles antes de truncar
          let processedCount = 0;

          // Itera sobre los números
          for (const [index, each] of frontSide.numbers.entries()) {
            if (index < maxVisibleNumbers) {
              // Configurar la fuente, tamaño y color del número
              doc.font(each.font || 'Helvetica').fontSize(each.numberSize).fillColor(each.numberColor);

              // Calcular el tamaño del número
              const numberWidth = doc.widthOfString(each.number);
              const numberHeight = doc.heightOfString(each.number);

              // Posición principal (sin rotación)
              const mainX = 350 + each.numberPosition.x;
              const mainY = y + each.numberPosition.y;

              // Guardar el estado antes de aplicar cualquier transformación
              doc.save();

              // Trasladar el contexto gráfico al centro del número
              const centerX = mainX + numberWidth / 2;
              const centerY = mainY + numberHeight / 2;
              doc.translate(centerX, centerY);

              // Rotar el contexto alrededor del centro del número
              doc.rotate(each.rotate || 0);

              // Dibujar el número centrado en el nuevo origen
              doc.text(each.number, -numberWidth / 2, -numberHeight / 2);

              // Restaurar el estado original
              doc.restore();

              processedCount++;
            } else {
              // Si se ha llegado al máximo de números visibles, sale del bucle
              break;
            }
          }

          // Calcula el número de números restantes
          const remainingCount = frontSide.numbers.length - processedCount;

          // Agrega el texto adicional si hay números restantes
          if (remainingCount > 0) {
            if (remainingCount === 1) {
              // Muestra el número adicional directamente si falta solo 1
              doc.font('Helvetica').fontSize(20).text(frontSide.numbers[processedCount].number, 1350, 370 + 20 * processedCount);
            } else {
              // Muestra el texto adicional indicando cuántos números más hay si faltan 2 o más
              doc.font('Helvetica').fontSize(20).text(`${remainingCount} more...`, 1350, 370 + 20 * processedCount);
            }
          }
        }

        if (frontSide.logos && imageBuffers[4] && imageBuffers[4][0]) {
          doc.font('Helvetica-Bold').fontSize(20).text('Main Logo', 140, 570);
          doc.image(imageBuffers[4][0] as Buffer, 115, 600, { width: 250 });
          // PALETA DE COLORES DE EL LOGOTICO
          const LogoPalette = await extractPaletteFromImageUrl(imageUrls[4].split('|')[0]);
          doc.rect(140, 860, 200, 360).stroke();
          doc.circle(200, 900, 19).fill(LogoPalette[0]).stroke();
          doc.circle(200, 940, 19).fill(LogoPalette[1]).stroke();
          doc.circle(200, 980, 19).fill(LogoPalette[2]).stroke();
          doc.circle(200, 1020, 19).fill(LogoPalette[3]).stroke();
          doc.circle(200, 1060, 19).fill(LogoPalette[4]).stroke();
          doc.circle(200, 1100, 19).fill(LogoPalette[5]).stroke();
          doc.circle(200, 1140, 19).fill(LogoPalette[6]).stroke();
          doc.circle(200, 1180, 19).fill(LogoPalette[7]).stroke();
          doc.circle(275, 900, 19).fill(LogoPalette[8]).stroke();
          doc.circle(275, 940, 19).fill(LogoPalette[9]).stroke();
          doc.circle(275, 980, 19).fill(LogoPalette[10]).stroke();
          doc.circle(275, 1020, 19).fill(LogoPalette[11]).stroke();
          doc.circle(275, 1060, 19).fill(LogoPalette[12]).stroke();
          doc.circle(275, 1100, 19).fill(LogoPalette[13]).stroke();
          doc.circle(275, 1140, 19).fill(LogoPalette[14]).stroke();
          doc.circle(275, 1180, 19).fill(LogoPalette[15]).stroke();
        }

        if (frontSide.logos && imageBuffers[4] && imageBuffers[4][0]) {
          const maxVisibleLogos = 4; // Número máximo de logotipos visibles antes de truncar
          let processedCount = 0;
          const logos = frontSide.logos.filter(l => l.logoUrl);

          // Itera sobre los logotipos
          for (const [index, each] of logos.entries()) {
            // Obtén el tamaño de la imagen
            const dimensions = imageSize(imageBuffers[4][index] as Buffer);
            const imageW = dimensions.width;
            const imageH = dimensions.height;

            // Configura la posición y el tamaño del logotipo
            const logoX = 350 + each.logoPosition.x;
            const logoY = y + each.logoPosition.y;
            const logoSize = each.logoSize;

            // Calcula el tamaño escalado de la imagen
            const scaledWidth = logoSize;
            const scaledHeight = (logoSize / imageW) * imageH;

            // Calcula el centro de la imagen rotada
            const centerX = logoX + scaledWidth / 2;
            const centerY = logoY + scaledHeight / 2;

            // Guardar el estado antes de aplicar cualquier transformación
            doc.save();

            // Trasladar el contexto gráfico al centro del logotipo
            doc.translate(centerX, centerY);

            // Rotar el contexto alrededor del centro del logotipo
            doc.rotate(each.rotate || 0);

            // Dibujar el logotipo centrado en el nuevo origen
            doc.image(imageBuffers[4][index] as Buffer, -scaledWidth / 2, -scaledHeight / 2, { width: scaledWidth });

            // Restaurar el estado original
            doc.restore();

            if (index < maxVisibleLogos) {
              // Dibuja una copia pequeña del logotipo para referencia
              doc.image(imageBuffers[4][index] as Buffer, 1260, 370 + 40 * index, { width: 35 });

              processedCount++;
            }
          }

          // Calcula el número de logotipos restantes
          const remainingCount = logos.length - processedCount;

          // Agrega el texto adicional si hay logotipos restantes
          if (remainingCount > 0) {
            if (remainingCount === 1) {
              doc.image(imageBuffers[4][processedCount] as Buffer, 1260, 370 + 40 * processedCount, { width: 35 });
            } else {
              doc.fillColor('black');
              doc.font('Helvetica').fontSize(20).text(`${remainingCount} more...`, 1260, 370 + 40 * processedCount);
            }
          }
        }

        if (backSide.logos && imageBuffers[5] && imageBuffers[5][0]) {
          const maxVisibleLogos = 5; // Número máximo de logotipos visibles antes de truncar
          let processedCount = 0;
          const logos = backSide.logos.filter(l => l.logoUrl);

          // Itera sobre los logotipos
          for (const [index, each] of logos.entries()) {
            if (index < maxVisibleLogos) {
              // Obtén el tamaño de la imagen
              const dimensions = imageSize(imageBuffers[5][index] as Buffer);
              const imageW = dimensions.width;
              const imageH = dimensions.height;

              // Configura la posición y el tamaño del logotipo
              const logoX = x2 + each.logoPosition.x;
              const logoY = y + each.logoPosition.y;
              const logoSize = each.logoSize;

              // Calcula el tamaño escalado de la imagen
              const scaledWidth = logoSize;
              const scaledHeight = (logoSize / imageW) * imageH;

              // Calcula el centro de la imagen rotada
              const centerX = logoX + scaledWidth / 2;
              const centerY = logoY + scaledHeight / 2;

              // Guardar el estado antes de aplicar cualquier transformación
              doc.save();

              // Trasladar el contexto gráfico al centro del logotipo
              doc.translate(centerX, centerY);

              // Rotar el contexto alrededor del centro del logotipo
              doc.rotate(each.rotate || 0);

              // Dibujar el logotipo centrado en el nuevo origen
              doc.image(imageBuffers[5][index] as Buffer, -scaledWidth / 2, -scaledHeight / 2, { width: scaledWidth });

              // Restaurar el estado original
              doc.restore();
              // Dibuja una copia pequeña del logotipo para referencia
              doc.image(imageBuffers[5][index] as Buffer, 1260, 700 + 40 * index, { width: 40 });

              processedCount++;
            }
          }

          // Calcula el número de logotipos restantes
          const remainingCount = logos.length - processedCount;

          // Agrega el texto adicional si hay logotipos restantes
          if (remainingCount > 0) {
            if (remainingCount === 1) {
              doc.image(imageBuffers[5][processedCount] as Buffer, 1260, 700 + 40 * processedCount, { width: 35 });
            } else {
              doc.fillColor('black');
              doc.font('Helvetica').fontSize(20).text(`and ${remainingCount} more`, 1260, 700 + 40 * processedCount);
            }
          }
        }


        // PALETA DE COLORES DE LA CAMISETA
        if (ShirtPalette) {
          doc.fillColor('black');
          doc.font('Helvetica-Bold').fontSize(25).text('JERSEY COLORS', 700, 1030);
          doc.circle(450, 1100, 25).fill(ShirtPalette[0]).stroke();
          doc.circle(450, 1175, 25).fill(ShirtPalette[1]).stroke();
          doc.circle(550, 1100, 25).fill(ShirtPalette[2]).stroke();
          doc.circle(550, 1175, 25).fill(ShirtPalette[3]).stroke();
          doc.circle(650, 1100, 25).fill(ShirtPalette[4]).stroke();
          doc.circle(650, 1175, 25).fill(ShirtPalette[5]).stroke();
          doc.circle(750, 1100, 25).fill(ShirtPalette[6]).stroke();
          doc.circle(750, 1175, 25).fill(ShirtPalette[7]).stroke();
          doc.circle(850, 1100, 25).fill(ShirtPalette[8]).stroke();
          doc.circle(850, 1175, 25).fill(ShirtPalette[9]).stroke();
          doc.circle(950, 1100, 25).fill(ShirtPalette[10]).stroke();
          doc.circle(950, 1175, 25).fill(ShirtPalette[11]).stroke();
          doc.circle(1050, 1100, 25).fill(ShirtPalette[12]).stroke();
          doc.circle(1050, 1175, 25).fill(ShirtPalette[13]).stroke();
          doc.circle(1150, 1100, 25).fill(ShirtPalette[14]).stroke();
          doc.circle(1150, 1175, 25).fill(ShirtPalette[15]).stroke();
        }

        // Liberar la memoria utilizada por los buffers de imagen
        // imageBuffers.forEach(buffer => !Array.isArray(buffer) ? Buffer.alloc(buffer.length) : buffer.forEach((b) => Buffer.alloc(b.length)));

        // Finalizar el documento
        doc.end();
      });
    } catch (error) {
      throw new HttpException(error.message, 404);
    }
  }
}
