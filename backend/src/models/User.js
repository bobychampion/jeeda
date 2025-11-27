/**
 * User Model
 * Represents a user in the system
 */
export class User {
  constructor(data) {
    this.id = data.id || null;
    this.email = data.email || '';
    this.name = data.name || '';
    this.phone = data.phone || '';
    this.addresses = data.addresses || [];
    this.role = data.role || 'user';
    this.createdAt = data.createdAt || new Date();
  }

  toFirestore() {
    return {
      email: this.email,
      name: this.name,
      phone: this.phone,
      addresses: this.addresses,
      role: this.role,
      createdAt: this.createdAt,
    };
  }

  static fromFirestore(id, data) {
    return new User({ id, ...data });
  }
}

