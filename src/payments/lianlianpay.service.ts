import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import qs from 'qs'; // Asegúrate de usar 'qs' y no destructurar stringify
import {
  LLP_PRIVATE_KEY,
  LLP_SECONDARY_MERCHANT_NUMBER,
  LLP_MERCHANT_NUMBER,
  LLP_API_URL,
} from '../config/enviroments';

@Injectable()
export class LianlianPayService {
  private readonly merchantId = LLP_MERCHANT_NUMBER;
  
  private readonly subMerchantId = LLP_SECONDARY_MERCHANT_NUMBER;

  private readonly apiUrl = LLP_API_URL;

  // Leer la clave privada desde un archivo externo (formato PKCS#8 sin passphrase)
  private readonly privateKey = fs.readFileSync(
    path.resolve(__dirname, '../../private_key.pem'),
    'utf8',
  );

  async createPayment(payload: any): Promise<any> {
    try {
      // 1. Timestamp en formato GMT+8
      const offset = 8 * 60;
      const now = new Date(Date.now() + offset * 60 * 1000);
      const timestamp = now
        .toISOString()
        .replace(/[-T:.Z]/g, '')
        .slice(0, 14); // YYYYMMDDHHMMSS

      // 2. Ruta del endpoint
      const apiPath = `/v3/merchants/${this.merchantId}/payments`;
      const contentType = 'application/json';
      const method = 'POST';

      // 3. Ordenar los parámetros del payload
      const sortedPayload = JSON.parse(
        JSON.stringify(payload, Object.keys(payload).sort()),
      );

      // 4. Convertir a string con reglas correctas
      const payloadString = qs.stringify(sortedPayload, {
        encode: false,
        arrayFormat: 'indices', // "products[0].name"
        allowDots: true, // "shipping.address.line1"
      });

      // 🔍 Logs para depuración
      console.log(
        '▶ Payload JSON (request):',
        JSON.stringify(payload, null, 2),
      );
      console.log('▶ Payload ordenado:', sortedPayload);
      console.log('▶ String firmado:', payloadString);

      // 5. Firma RSA-SHA256
      const signer = crypto.createSign('RSA-SHA256');
      signer.update(payloadString, 'utf8');
      signer.end();
      const signature = signer.sign(this.privateKey, 'base64');

      // 🔍 Log de la firma generada
      console.log('▶ Firma generada:', signature);

      // 6. Headers requeridos
      const headers = {
        'Content-Type': contentType,
        'X-Merchant-Number': this.merchantId,
        'X-Sub-Merchant-Number': this.subMerchantId,
        Timestamp: timestamp,
        Timezone: '+08',
        Signature: signature,
      };

      // 7. Enviar solicitud
      const response = await axios.post(`${this.apiUrl}${apiPath}`, payload, {
        headers,
      });

      // 8. Manejo de respuesta
      if (response.data.code !== 200000) {
        throw new Error(
          `Error en API LianLian: ${response.data.message || 'Desconocido'}`,
        );
      }

      return {
        message: 'Pago creado exitosamente',
        data: response.data,
      };
    } catch (error) {
      const status = error.response?.status || 'N/A';
      const responseData = error.response?.data || error.message;

      console.error('❌ Error en la solicitud de pago:', {
        status,
        responseData,
      });

      throw new Error(
        `Error al procesar el pago: ${
          responseData.message || responseData.return_message || error.message
        }`,
      );
    }
  }
}
