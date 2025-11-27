/**
 * Template Model
 * Represents a furniture template in the system
 */
export class Template {
  constructor(data) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.category = data.category || '';
    this.description = data.description || '';
    this.basePrice = data.basePrice || 0;
    this.sku = data.sku || '';
    this.availableColors = data.availableColors || [];
    this.availableMaterials = data.availableMaterials || [];
    this.dimensions = data.dimensions || { min: {}, max: {}, default: {} };
    this.images = data.images || [];
    this.difficulty = data.difficulty || 'Beginner';
    this.estimatedBuildTime = data.estimatedBuildTime || '4 Hours';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toFirestore() {
    return {
      name: this.name,
      category: this.category,
      description: this.description,
      basePrice: this.basePrice,
      sku: this.sku,
      availableColors: this.availableColors,
      availableMaterials: this.availableMaterials,
      dimensions: this.dimensions,
      images: this.images,
      difficulty: this.difficulty,
      estimatedBuildTime: this.estimatedBuildTime,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromFirestore(id, data) {
    return new Template({ id, ...data });
  }
}

