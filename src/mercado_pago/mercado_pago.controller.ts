import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  ParseFloatPipe,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { MercadoPagoService } from './mercado_pago.service';
import { CardTokenBody } from '../mercado_pago/models/card_token_body';
import { PaymentBody } from './models/payment_body';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus } from 'src/orders/shared/enums/order-status.enum';

@Controller('mercadopago')
export class MercadoPagoController {
  constructor(
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly prisma: PrismaService, // Inyecta el servicio de órdenes
  ) {}

  @Get('identification_types')
  getIdentificationTypes() {
    return this.mercadoPagoService.getIdentificationTypes();
  }

  @Get('installments/:first_six_digits/:amount')
  getInstallments(
    @Param('first_six_digits', ParseIntPipe) firstSixDigits: number,
    @Param('amount', ParseFloatPipe) amount: number,
  ) {
    return this.mercadoPagoService.getInstallments(
      firstSixDigits.toString(), // Convert to string
      amount, // Convert to string
    );
  }

  @Post('card_token')
  createCardToken(@Body() cardTokenBody: CardTokenBody) {
    return this.mercadoPagoService.createCardToken(cardTokenBody);
  }

  @Post('payments')
  async createPayment(@Body() paymentBody: PaymentBody) {
    try {
      return await this.mercadoPagoService.createPayment(paymentBody);
    } catch (error) {
      // Registrar error para diagnóstico
      console.error('Error en controlador de pagos:', error);

      throw new HttpException(
        {
          status: error.status || 500,
          error: 'Error al procesar pago',
          details: error.response?.data || error.message,
        },
        error.status || 500,
      );
    }
  }

  @Post('webhook')
  async handleWebhook(@Body() notification: any) {
    if (notification.type === 'payment') {
      const paymentId = notification.data.id;
      const payment = await this.mercadoPagoService.getPayment(paymentId);

      // Actualiza usando paymentId como filtro
      await this.prisma.order.updateMany({
        where: {
          paymentId: paymentId.toString(),
        },
        data: {
          status:
            payment.status === 'approved'
              ? OrderStatus.COMPLETED
              : OrderStatus.FAILED,
        },
      });
    }
    return { ok: true };
  }
}
