/**
 * Order Model
 * Represents a customer order
 */
export class Order {
  constructor(data) {
    this.id = data.id || null;
    this.userId = data.userId || '';
    this.items = data.items || [];
    this.deliveryAddress = data.deliveryAddress || {};
    this.deliveryFee = data.deliveryFee || 0;
    this.assemblyService = data.assemblyService || false;
    this.totalAmount = data.totalAmount || 0;
    this.status = data.status || 'Processing';
    this.paymentId = data.paymentId || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toFirestore() {
    return {
      userId: this.userId,
      items: this.items,
      deliveryAddress: this.deliveryAddress,
      deliveryFee: this.deliveryFee,
      assemblyService: this.assemblyService,
      totalAmount: this.totalAmount,
      status: this.status,
      paymentId: this.paymentId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromFirestore(id, data) {
    return new Order({ id, ...data });
  }

  generateOrderId() {
    return `RC-${Date.now()}`;
  }
}

