// pdf.service.ts
import PDFDocument from 'pdfkit';
import axios from 'axios';
import { HttpException, Injectable } from '@nestjs/common';
import {
  extractPaletteFromImageUrl,
  isWebP,
  killParenthesisIn,
} from '../utils/tools';
import {
  Neck,
  Pants,
  Shorts,
  Socks,
  withOrWithoutShort,
} from '../utils/detail.enum';
import { CreateCustomizationDto } from '../products/dto/create-customization.dto';
import {
  PantsType,
  ShortsType,
  SocksType,
} from '../products/enum/customization.enum';
import { SERVER_URL } from '../config/enviroments';
import * as path from 'path';
import imageSize from 'image-size';
@Injectable()
export class PdfService {
  async generatePdf(
    customization: CreateCustomizationDto,
    product,
    order?,
  ): Promise<Buffer> {
    const { neck, pants, size, materials, shorts, socks, frontSide, backSide } =
      customization;
    const { images, sports } = product;

    try {
      return await new Promise(async (resolve, reject) => {
        const doc = new PDFDocument({ size: [1820, 1200] });
        const buffers: Buffer[] = [];

        const fonts = [
          { name: 'Anton', path: 'fonts/Anton/Anton-Regular.ttf' },
          { name: 'Rasioline', path: 'fonts/Rasioline/DD rasioline.otf' },
          { name: 'Spot Light', path: 'fonts/Spot Light/Spot Light.otf' },
          { name: 'Uni North', path: 'fonts/Uni North/UNINorth-College.otf' },
          { name: 'Times New Roman', path: 'fonts/Times New Roman/TNR.ttf' },
          { name: 'Arial', path: 'fonts/Arial/ARIAL.ttf' },
          { name: 'Courier New', path: 'fonts/Courier New/cour.ttf' },
          { name: 'Verdana', path: 'fonts/Verdana/Verdana.ttf' },
          { name: 'Georgia', path: 'fonts/Georgia/georgia.ttf' },
          { name: 'Tahoma', path: 'fonts/Tahoma/tahoma.ttf' },
          { name: 'Fest', path: 'fonts/FEST/Fest235 fs.otf' },
          { name: 'Black Bass Demo', path: 'fonts/BLACK BASS DEMO/Black Bass Demo.otf' },
          { name: 'Dirga Hayu', path: 'fonts/DIRGA HAYU/dDirgahayu.ttf' },
          { name: 'Restaurant Menu Book', path: 'fonts/RESTAURANT MENU BOOK/RestaurantMenuBook.ttf' },
          { name: 'Hatten', path: 'fonts/HATTEN/HATTEN.ttf' },
          { name: 'NCAA Oregon Ducks Autzen', path: 'fonts/NCAA OREGON DUCKS AUTZEN/NCAA Oregon Ducks Autzen.ttf' },
          { name: 'Qatar Personal Use', path: 'fonts/QATAR PERSONAL USE/QatarPersonalUse.ttf' },
          { name: 'Real Madrid', path: 'fonts/REAL MADRID/RealMadrid.ttf' },
          { name: 'Quantum Rangers Personal', path: 'fonts/QUANTUM RANGERS PERSONAL/QuantumRangersPersonal.ttf' },
          { name: 'Boston Caps', path: 'fonts/BOSTON CAPS/BOSTON CAPS.ttf' },
          { name: 'Chinese Rocks', path: 'fonts/CHINESE ROCKS/chinese rocks.ttf' },
          { name: 'Madura United FC', path: 'fonts/MADURA UNITED FC/Madura United FC.otf' },
          { name: 'Overgrid', path: 'fonts/OVERGRID/OVERGRID.ttf' },
          { name: 'Slovakia', path: 'fonts/SLOVAKIA/Slovakia.ttf' },
        ];

        fonts.forEach(font => {
          const fontPath = path.resolve(__dirname, font.path);
          doc.registerFont(font.name, fontPath);
        });

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
          const { data } = await axios.get(imagePath, {
            responseType: 'arraybuffer',
          });

          // Convertir los datos de la respuesta en un buffer
          const imageBuffer = Buffer.from(data);

          const bgImageX = 1920;
          const bgImageY = 1080;
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
          images[3] || images[1], // posterior remera
          neck ? Neck.find((n) => n.name === neck).image : null, // cuello
          frontSide.logos?.reduce(
            (acc, logo) => (acc += logo.logoUrl + '|'),
            '',
          ) ?? null, // logo,
          backSide.logos?.reduce(
            (acc, logo) => (acc += logo.logoUrl + '|'),
            '',
          ) ?? null, // logo Back,
          socks ? Socks.find((s) => s.name === socks).image : null, // color de medias
        ];

        const fetchImageBuffer = async (url) => {
          try {
            const response = await axios.get(url, {
              responseType: 'arraybuffer',
            });
            const buffer = Buffer.from(response.data);
            return isWebP(buffer) ? undefined : buffer;
          } catch (error) {
            console.log(error.message, 404);
            return null;
          }
        };

        const imageBuffers: (Buffer | Buffer[] | void[])[] = await Promise.all(
          imageUrls.map(async (imageUrl) => {
            if (imageUrl !== null && imageUrl.includes('|')) {
              // Si imageUrl es un array, obtener buffers para cada URL en el array
              const bffrs: Buffer[] = [];
              for (const url of imageUrl.split('|').filter((l) => l !== '')) {
                bffrs.push(await fetchImageBuffer(url));
              }
              return bffrs.filter((buffer) => buffer !== null); // Filtrar buffers nulos
            } else if (imageUrl != null) {
              // Si imageUrl es una única URL
              const bffr = await fetchImageBuffer(imageUrl);
              return bffr;
            }
            return null;
          }),
        );

        // Calcular las coordenadas de las imágenes
        const x1 = 200;
        const x2 = 580;
        const y = 300;

        // Agregar las imágenes al PDF
        let ShirtPalette = null;
        if (imageBuffers[0]) {
          ShirtPalette = await extractPaletteFromImageUrl(imageUrls[0]);
          doc.image(imageBuffers[0] as Buffer, x1, y, {
            width: 500,
            height: 500,
          });
        }
        if (imageBuffers[1])
          doc.image(imageBuffers[1] as Buffer, x2, y, {
            width: 500,
            height: 500,
          });

        // // Agregar texto

        if (neck && imageBuffers[2]) {
          doc.image(imageBuffers[2] as Buffer, 1460, 300, {
            width: 150,
            height: 150,
          });
        }

        if (socks && socks !== SocksType['No Socks (+$0.00)']) {
          doc.font('Helvetica-Bold').fontSize(25).text('SOCKS', 1050, 920);
          // doc.font('Helvetica').fontSize(25).text(killParenthesisIn(socks), 1370, 1110);
          doc.image(imageBuffers[5] as Buffer, 1050, 960, {
            width: 100,
            height: 100,
          });
          doc.rect(1050, 960, 100, 100).stroke();
        }

        if (order) {
          doc
            .fillColor('white')
            .font('Helvetica-Bold')
            .fontSize(25)
            .text('ORDER:', 500, 200);
          doc
            .fillColor('white')
            .font('Helvetica')
            .fontSize(25)
            .text('#' + order, 600, 200);
        }

        doc
          .fillColor('white')
          .font('Helvetica')
          .fontSize(25)
          .text(sports, 635, 200);

        doc
          .fillColor('white')
          .font('Helvetica')
          .fontSize(20)
          .text('1', 1000, 160);

        doc
          .fillColor('white')
          .font('Helvetica')
          .fontSize(20)
          .text(size.split('-').pop(), 980, 190);

        doc
          .fillColor('white')
          .font('Helvetica')
          .fontSize(20)
          .text(size, 935, 220);

        doc
          .fillColor('white')
          .font('Helvetica')
          .fontSize(18)
          .text(killParenthesisIn(materials), 1370, 160);

        doc
          .fillColor('white')
          .font('Helvetica')
          .fontSize(18)
          .text(neck ? killParenthesisIn(neck) : 'No', 1405, 190);

        doc
          .fillColor('white')
          .font('Helvetica')
          .fontSize(20)
          .text(
            shorts &&
              shorts !== withOrWithoutShort[1] &&
              shorts !== Shorts(sports)[0].name
              ? killParenthesisIn(shorts)
              : 'No',
            1340,
            220,
          );

        doc
          .fillColor('white')
          .font('Helvetica')
          .fontSize(20)
          .text(pants && pants, 1340, 250);

        if (backSide.texts[0]) {
          const maxVisibleTexts = 9; // Número máximo de textos visibles antes de truncar
          const fontsSet = new Set();

          // Itera sobre los textos
          for (const [index, each] of backSide.texts.entries()) {
            if (index < maxVisibleTexts) {
              // Configurar la fuente, tamaño y color del texto
              doc
                .font(each.font || 'Helvetica')
                .fontSize(each.textSize)
                .fillColor(each.textColor);

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
            } else {
              // Si se ha llegado al máximo de textos visibles, sale del bucle
              break;
            }
          }
          doc
            .fillColor('black')
            .font(backSide.texts[0].font)
            .text(backSide.texts[0].font, 775, 980);
          doc
            .fillColor('black')
            .font('Helvetica')
            .fontSize(20)
            .text(backSide.texts.map((t) => t.text).join(', '), 1390, 1015, {
              width: 400,
              align: 'left',
            });
        }

        if (backSide.numbers[0]) {
          const maxVisibleNumbers = 9; // Número máximo de números visibles antes de truncar
          let processedCount = 0;

          // Itera sobre los números
          for (const [index, each] of backSide.numbers.entries()) {
            if (index < maxVisibleNumbers) {
              // Configurar la fuente, tamaño y color del número
              doc
                .font(each.font || 'Helvetica')
                .fontSize(each.numberSize)
                .fillColor(each.numberColor);

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

          doc
            .fillColor('black')
            .font('Helvetica')
            .fontSize(20)
            .text(backSide.numbers.map((n) => n.number).join(', '), 1390, 915, {
              width: 350,
              align: 'left',
            });
        }

        if (frontSide.texts[0]) {
          const fontsSet = new Set();
          const maxVisibleTexts = 9; // Número máximo de textos visibles antes de truncar

          // Itera sobre los textos
          for (const [index, each] of frontSide.texts.entries()) {
            if (index < maxVisibleTexts) {
              doc.fillColor(each.textColor);
              // Guardar el estado antes de aplicar cualquier transformación
              doc.save();

              // Configurar la fuente, tamaño y color del texto
              doc
                .font(each.font || 'Helvetica')
                .fontSize(each.textSize)
                .fillColor(each.textColor);

              // Calcular el tamaño del texto
              const textWidth = doc.widthOfString(each.text);
              const textHeight = doc.heightOfString(each.text);

              // Posición principal (sin rotación)
              const mainX = x1 + each.textPosition.x;
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
            } else {
              // Si se ha llegado al máximo de textos visibles, sale del bucle
              break;
            }
          }

          doc
            .fillColor('black')
            .font('Helvetica')
            .fontSize(20)
            .text(frontSide.texts.map((t) => t.text).join(', '), 1390, 780, {
              width: 400,
              align: 'left',
            });
        }

        if (frontSide.numbers[0]) {
          const maxVisibleNumbers = 9; // Número máximo de números visibles antes de truncar

          // Itera sobre los números
          for (const [index, each] of frontSide.numbers.entries()) {
            if (index < maxVisibleNumbers) {
              // Configurar la fuente, tamaño y color del número
              doc
                .font(each.font || 'Helvetica')
                .fontSize(each.numberSize)
                .fillColor(each.numberColor);

              // Calcular el tamaño del número
              const numberWidth = doc.widthOfString(each.number);
              const numberHeight = doc.heightOfString(each.number);

              // Posición principal (sin rotación)
              const mainX = x1 + each.numberPosition.x;
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
            } else {
              // Si se ha llegado al máximo de números visibles, sale del bucle
              break;
            }
          }
          doc
            .fillColor('black')
            .font('Helvetica')
            .fontSize(20)
            .text(
              frontSide.numbers.map((n) => n.number).join(', '),
              1390,
              690,
              { width: 350, align: 'left' },
            );
        }

        if (frontSide.logos && imageBuffers[3] && imageBuffers[3][0]) {
          const logos = frontSide.logos.filter((l) => l.logoUrl);

          // Itera sobre los logotipos
          for (const [index, each] of logos.entries()) {
            // Obtén el tamaño de la imagen
            if (imageBuffers[3][index] !== undefined) {
              const dimensions = imageSize(imageBuffers[3][index] as Buffer);
              const imageW = dimensions.width;
              const imageH = dimensions.height;

              // Configura la posición y el tamaño del logotipo
              const logoX = x1 + each.logoPosition.x;
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
              doc.image(
                imageBuffers[3][index] as Buffer,
                -scaledWidth / 2,
                -scaledHeight / 2,
                { width: scaledWidth },
              );

              // Restaurar el estado original
              doc.restore();
            }
          }
        }

        if (backSide.logos && imageBuffers[4] && imageBuffers[4][0]) {
          const logos = backSide.logos.filter((l) => l.logoUrl);

          // Itera sobre los logotipos
          for (const [index, each] of logos.entries()) {
            if (imageBuffers[4][index] !== undefined) {
              // Obtén el tamaño de la imagen
              const dimensions = imageSize(imageBuffers[4][index] as Buffer);
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
              doc.image(
                imageBuffers[4][index] as Buffer,
                -scaledWidth / 2,
                -scaledHeight / 2,
                { width: scaledWidth },
              );

              // Restaurar el estado original
              doc.restore();
            }
          }
        }

        const allLogos = [...imageBuffers[3], ...imageBuffers[4]];
        allLogos
          .filter((l) => l !== undefined)
          .slice(0, 3)
          .map((logo, i) => {
            // Dibuja una copia pequeña del logotipo para referencia
            doc.image(logo as Buffer, 1385 + 110 * i + 1, 520, { width: 100 });
          });

        // PALETA DE COLORES DE LA CAMISETA
        if (ShirtPalette) {
          doc.fillColor('black');
          doc.circle(300, 960, 25).fill(ShirtPalette[0]).stroke();
          doc.circle(300, 1035, 25).fill(ShirtPalette[1]).stroke();
          doc.circle(375, 960, 25).fill(ShirtPalette[2]).stroke();
          doc.circle(375, 1035, 25).fill(ShirtPalette[3]).stroke();
          doc.circle(450, 960, 25).fill(ShirtPalette[4]).stroke();
          doc.circle(450, 1035, 25).fill(ShirtPalette[5]).stroke();
          doc.circle(525, 960, 25).fill(ShirtPalette[6]).stroke();
          doc.circle(525, 1035, 25).fill(ShirtPalette[7]).stroke();
          doc.circle(600, 960, 25).fill(ShirtPalette[8]).stroke();
          doc.circle(600, 1035, 25).fill(ShirtPalette[9]).stroke();
          doc.circle(675, 960, 25).fill(ShirtPalette[10]).stroke();
          doc.circle(675, 1035, 25).fill(ShirtPalette[11]).stroke();
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
