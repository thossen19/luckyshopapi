import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/response';

export class PaymentMethodService {
  async findAll(storeId: string) {
    return prisma.paymentMethod.findMany({
      where: { storeId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findById(storeId: string, id: string) {
    const method = await prisma.paymentMethod.findFirst({
      where: { id, storeId },
    });
    if (!method) throw new NotFoundError('Payment method');
    return method;
  }

  async create(storeId: string, data: any) {
    const count = await prisma.paymentMethod.count({ where: { storeId } });
    return prisma.paymentMethod.create({
      data: {
        storeId,
        name: data.name,
        description: data.description,
        icon: data.icon || '💳',
        country: data.country || 'global',
        gateway: data.gateway,
        apiKey: data.apiKey,
        secretKey: data.secretKey,
        webhookSecret: data.webhookSecret,
        testMode: data.testMode ?? true,
        enabled: data.enabled ?? true,
        sortOrder: count,
      },
    });
  }

  async update(storeId: string, id: string, data: any) {
    await this.findById(storeId, id);
    return prisma.paymentMethod.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        country: data.country,
        gateway: data.gateway,
        apiKey: data.apiKey,
        secretKey: data.secretKey,
        webhookSecret: data.webhookSecret,
        testMode: data.testMode,
        enabled: data.enabled,
      },
    });
  }

  async delete(storeId: string, id: string) {
    await this.findById(storeId, id);
    await prisma.paymentMethod.delete({ where: { id } });
  }

  async toggle(storeId: string, id: string) {
    const method = await this.findById(storeId, id);
    return prisma.paymentMethod.update({
      where: { id },
      data: { enabled: !method.enabled },
    });
  }
}

export const paymentMethodService = new PaymentMethodService();
