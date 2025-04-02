import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto'; // Para la firma digital
import {
  LLP_PRIVATE_KEY,
  LLP_SECONDARY_MERCHANT_NUMBER,
  LLP_MERCHANT_NUMBER,
  LLP_API_URL,
} from '../config/enviroments';

@Injectable()
export class LianlianPayService {
  private readonly apiUrl = LLP_API_URL;
    
  private readonly merchantId = LLP_MERCHANT_NUMBER;
    
  private readonly subMerchantId = LLP_SECONDARY_MERCHANT_NUMBER;
    
  private readonly privateKey = LLP_PRIVATE_KEY; // Clave privada RSA

  async createPayment(orderId: string, amount: number) {
    const url = `${this.apiUrl}/v3/merchants/${this.merchantId}/payments`;

    const payload = {
      merchant_transaction_id: orderId,
      merchant_id: this.merchantId,
      sub_merchant_id: this.subMerchantId,
      merchant_order: {
        merchant_order_id: orderId,
        merchant_order_time: new Date().toISOString().replace(/[-T:.Z]/g, ''), // Formato YYYYMMDDHHMMSS
        order_amount: amount.toString(),
        order_currency_code: 'USD',
        products: [
          {
            product_id: 'productid_1',
            name: 'Producto de prueba',
            price: amount.toString(),
            quantity: '1',
            sku: 'sku_1',
            url: 'https://www.example.com',
            shipping_provider: 'other',
          },
        ],
        shipping: {
          name: 'John Doe',
          phone: '1234567890',
          cycle: '48h',
          address: {
            line1: '123 Main St',
            city: 'New York',
            state: 'NY',
            country: 'US',
            postal_code: '10001',
          },
        },
        merchant_user_no: '123456789',
      },
      notification_url: 'https://tudominio.com/webhook-lianlianpay',
      redirect_url: 'https://tudominio.com/success',
      cancel_url: 'https://tudominio.com/cancel',
      country: 'US',
    };

    // 🔒 **Generar Firma Digital**
    const signature = this.signPayload(payload);

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Merchant-Number': this.merchantId,
          'X-Sub-Merchant-Number': this.subMerchantId,
          'X-Signature': signature, // Enviar la firma en el header
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        'Error en la solicitud de pago:',
        error.response?.data || error.message,
      );
      throw new Error('Error al procesar el pago');
    }
  }

  // 🔐 **Método para Firmar la Solicitud**
  private signPayload(payload: object): string {
    const signData = JSON.stringify(payload);
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signData);
    sign.end();
    const privateKey = this.privateKey.replace(/\\n/g, '\n'); // Asegurar formato correcto
    return sign.sign(privateKey, 'base64');
  }
}
