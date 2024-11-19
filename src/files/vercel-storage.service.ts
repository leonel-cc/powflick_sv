// vercel-blob.service.ts
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { put, del, list } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN } from '../config/enviroments';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class VercelBlobService {
  private readonly token: string;

  constructor(
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
  ) {
    this.token = BLOB_READ_WRITE_TOKEN;
  }

  async uploadImage(file: Express.Multer.File, title: string): Promise<any> {
    try {
      const filePath = `${title}/${file.originalname}`;
      const { url } = await put(filePath, file.buffer, {
        access: 'public',
        token: this.token,
      });

      return url;
    } catch (error) {
      throw new Error(`Error uploading image: ${error.message}`);
    }
  }

  async deleteImage(imageUrl: string): Promise<any> {
    try {
      console.log(imageUrl);

      const response = await del(imageUrl, {
        token: this.token,
      });

      return response;
    } catch (error) {
      throw new Error(`Error deleting image: ${error.message}`);
    }
  }

  // async deleteAll(): Promise<any> {
  //   try {
  //     const { blobs } = await list({
  //       token: this.token,
  //     });

  //     await Promise.all(
  //       blobs.map(async (blob) => {
  //         try {
  //           await del(blob.url, {
  //             token: this.token,
  //           });
  //         } catch (error) {
  //           console.error(`Error deleting blob ${blob.url}: ${error.message}`);
  //           throw error;
  //         }
  //       }),
  //     );

  //     return 'Done';
  //   } catch (error) {
  //     throw new Error(`Error deleting image: ${error.message}`);
  //   }
  // }

  async renameFolder(oldTitle: string, newTitle: string): Promise<void> {
    try {
      const { blobs } = await list({
        prefix: `Products/${oldTitle}/`,
        token: this.token,
      });

      for (const blob of blobs) {
        const oldBlobUrl = blob.url;
        const newBlobUrl = oldBlobUrl.replace(
          `Products/${oldTitle.split(' ').join('%20')}/`,
          `Products/${newTitle.split(' ').join('%20')}/`,
        );

        const oldblob = await this.getBlobBuffer(oldBlobUrl);
        // Copy the blob to the new location
        await put(
          newBlobUrl.split('/').splice(3).join('/'),
          oldblob,
          {
            access: 'public',
            token: this.token,
          },
        );

        // Delete the old blob
        await this.clearFolder(oldTitle);
      }
    } catch (error) {
      console.error(
        `Error renaming folder from ${oldTitle} to ${newTitle}: ${error.message}`,
      );
      throw new Error(`Error renaming folder: ${error.message}`);
    }
  }

  private async getBlobBuffer(blobUrl: string): Promise<Buffer> {
    // Fetch the blob content as a buffer
    const response = await fetch(blobUrl);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async uploadFolder(
    files: Express.Multer.File[],
    folderName: string,
  ): Promise<string[]> {
    try {
      if (!files || files.length === 0) {
        throw new Error('No files provided for upload.');
      }

      if (!this.token) {
        throw new Error('Token is not initialized.');
      }

      // Eliminar los archivos de esta carpeta si existe para reemplazarla
      await this.clearFolder(folderName);

      console.log('Subiendo carpeta:', folderName);
      

      // Subir nueva carpeta
      const urls = await Promise.all(
        files.map(async (file) => {
          // Detectar si la carpeta es una carpeta anidada, llamese "Sin Logo" o "Customization"
          const isCustomization = folderName.split('/').length === 2;
          // Agregar sufijo "_customization" si es una carpeta anidada
          const fileName = isCustomization
            ? `${file.originalname
              .split('.')
              .slice(0, -1)
              .join('.')}_customization.${file.originalname.split('.').pop()}`
            : file.originalname;

          const filePath = `Products/${folderName}/${fileName}`;

          try {
            const { url } = await put(filePath, file.buffer, {
              access: 'public',
              token: this.token,
            });
            return url;
          } catch (error) {
            console.error(
              `Error uploading file ${file.originalname}: ${error.message}`,
            );
            throw error;
          }
        }),
      );

      //DB
      // Ajustar el folderName si incluye una carpeta anidada, llamese "Sin Logo" o "Customization"
      const adjustedFolderName =
        folderName.split('/').length === 2
          ? folderName.split('/')[0]
          : folderName;

      // Buscar el producto por el título ajustado
      const product = await this.productsService.findByTitle(
        adjustedFolderName,
      );
      if (!product) {
        throw new Error(
          `No se encontró el producto con el título: ${adjustedFolderName}`,
        );
      }

      const productId = product.id; // Extrae el ID del producto
      // Antes de actualizar el producto, combina las imágenes actuales con las nuevas de manera especial
      const existingImages = product.images || [];
      let combinedImages = [...existingImages]; // Inicialmente igual a las imágenes existentes

      const isNestedFolder = folderName.split('/').length === 2;

      if (isNestedFolder) {
        // Conserva y combina las imágenes existentes con las nuevas
        urls.forEach((url) => {
          combinedImages.push(url); // Si no hubo reemplazo, agrega la nueva URL
        });
      } else {
        // Reemplaza todas las imágenes existentes con las nuevas
        combinedImages = urls;
      }
      //
      combinedImages = [...new Set(combinedImages)]; // Elimina duplicados
      // Ordena combinedImages para que las URLs que contienen el número 1 vengan primero
      combinedImages.sort((a, b) => {
        // Define las reglas para determinar la puntuación de ordenación
        const score = (url) => {
          const containsCustomization = url.includes('_customization');
          const contains1 = url.includes('_1');
          const containsPerson = url.includes('person');
          const contains3 = url.includes('_3');
          if (!containsCustomization && contains1) return 1; // Mayor prioridad // Imagen frontal
          if (!containsCustomization && !containsPerson) return 2; // Siguiente prioridad // imagen trasera
          if (containsCustomization && contains1) return 3; // Luego estas // imagen sin logo frontal
          if (containsCustomization && !contains1) return 4; // Luego estas // imagen sin logo trasera
          if (containsPerson && contains3) return 5; // Luego estas // imagen persona frontal
          return 6;
        };

        // Calcula la puntuación para ambas URLs
        const scoreA = score(a);
        const scoreB = score(b);

        // Ordena basado en la puntuación; si las puntuaciones son iguales, ordena por orden alfabético
        if (scoreA === scoreB) return a.localeCompare(b);
        return scoreA - scoreB;
      });

      // Crea un DTO con las imágenes combinadas y ordenadas
      const updateProductDto = { images: combinedImages };

      // Ahora llama a 'update' con ambos argumentos: el ID y el DTO
      await this.productsService.update(productId, updateProductDto);
      console.log('Producto actualizado con éxito:', folderName);

      console.log('Imagen:', updateProductDto);

      return urls;
    } catch (error) {
      console.error(`Error uploading folder: ${error.message}`);
      throw new Error(`Error uploading folder: ${error.message}`);
    }
  }

  async clearFolder(folderName: string): Promise<void> {
    try {
      if (!this.token) {
        throw new Error('Token is not initialized.');
      }

      const { blobs } = await list({
        prefix: `Products/${folderName}/`,
        token: this.token,
      });
      
      await Promise.all(
        blobs.map(async (blob) => {
          try {
            await del(blob.url, {
              token: this.token,
            });
          } catch (error) {
            console.error(`Error deleting blob ${blob.url}: ${error.message}`);
            throw error;
          }
        }),
      );
    } catch (error) {
      console.error(`Error clearing folder: ${error.message}`);
      throw new Error(`Error clearing folder: ${error.message}`);
    }
  }
}
