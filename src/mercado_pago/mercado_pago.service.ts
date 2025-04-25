import { HttpService } from '@nestjs/axios/dist';
import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { MERCADO_PAGO_CONFIG } from '../config/config';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '../orders/shared/enums/order-status.enum';
import { AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MercadoPagoService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async getIdentificationTypes() {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${MERCADO_PAGO_CONFIG.API_URL}/v1/identification_types`,
          {
            headers: MERCADO_PAGO_CONFIG.HEADERS,
          },
        ),
      );
      return data;
    } catch (error) {
      throw new Error('Failed to get identification types');
    }
  }

  async getInstallments(firstSixDigits: string, amount: number) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${MERCADO_PAGO_CONFIG.API_URL}/v1/payment_methods/installments?bin=${firstSixDigits}&amount=${amount}`,
          { headers: MERCADO_PAGO_CONFIG.HEADERS },
        ),
      );
      return data[0]; // Devuelve el primer método de pago
    } catch (error) {
      throw new Error('Failed to get installments');
    }
  }

  async createCardToken(cardTokenBody: any) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `${MERCADO_PAGO_CONFIG.API_URL}/v1/card_tokens?public_key=${MERCADO_PAGO_CONFIG.PUBLIC_KEY}`,
          cardTokenBody,
          { headers: MERCADO_PAGO_CONFIG.HEADERS },
        ),
      );
      return data;
    } catch (error) {
      throw new Error('Failed to create card token');
    }
  }

  async createPayment(paymentBody: any) {
    try {
      // Validar external_reference
      const orderId = parseInt(paymentBody.external_reference, 10);
      if (isNaN(orderId)) {
        throw new BadRequestException('ID de orden inválido');
      }

      // Verificar que la orden existe
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: { id: true, amount: true, status: true },
      });

      if (!order) {
        throw new NotFoundException('Orden no encontrada');
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException('La orden ya fue procesada');
      }

      // Validar que el monto coincida
      if (order.amount !== paymentBody.transaction_amount) {
        throw new BadRequestException('El monto no coincide con la orden');
      }

      const idempotencyKey = uuidv4();
      // Crear pago en MercadoPago
      const { data: paymentData } = await firstValueFrom(
        this.httpService
          .post(`${MERCADO_PAGO_CONFIG.API_URL}/v1/payments`, paymentBody, {
            headers: {
              ...MERCADO_PAGO_CONFIG.HEADERS,
              'X-Idempotency-Key': idempotencyKey,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              // Actualizar orden como fallida si hay error
              this.prisma.order
                .update({
                  where: { id: orderId },
                  data: { status: OrderStatus.FAILED },
                })
                .catch(console.error);

              throw new HttpException(
                error.response?.data || 'Error al procesar pago',
                error.response?.status || 500,
              );
            }),
          ),
      );

      // Actualizar orden con respuesta de MercadoPago
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentId: paymentData.id.toString(),
          status:
            paymentData.status === 'approved'
              ? OrderStatus.COMPLETED
              : OrderStatus.FAILED,
        },
      });

      return paymentData;
    } catch (error) {
      // Registrar error detallado
      console.error('Error en createPayment:', error);
      throw new HttpException(
        error.response?.message || 'Error al procesar pago',
        error.status || 500,
      );
    }
  }

  async getPayment(paymentId: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${MERCADO_PAGO_CONFIG.API_URL}/v1/payments/${paymentId}`,
          { headers: MERCADO_PAGO_CONFIG.HEADERS },
        ),
      );
      return data;
    } catch (error) {
      throw new Error('Failed to get payment');
    }
  }
}
