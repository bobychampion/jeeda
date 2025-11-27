/**
 * Custom Request Model
 * Represents a user's request for custom furniture modifications
 */
export class CustomRequest {
  constructor(data) {
    this.userId = data.userId;
    this.templateId = data.templateId;
    this.templateName = data.templateName;
    this.modifications = data.modifications || {}; // { color, material, style, size, description }
    this.status = data.status || 'pending'; // pending, in_progress, samples_sent, approved, in_cart, completed, cancelled
    this.userEmail = data.userEmail;
    this.userPhone = data.userPhone;
    this.additionalNotes = data.additionalNotes || '';
    this.referenceImages = data.referenceImages || []; // Array of image URLs
    this.samples = data.samples || []; // Array of sample image URLs sent by admin
    this.selectedSample = data.selectedSample || null; // URL of selected sample
    this.adjustmentRequests = data.adjustmentRequests || []; // Array of adjustment requests
    this.adminNotes = data.adminNotes || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  toFirestore() {
    return {
      userId: this.userId,
      templateId: this.templateId,
      templateName: this.templateName,
      modifications: this.modifications,
      status: this.status,
      userEmail: this.userEmail,
      userPhone: this.userPhone,
      additionalNotes: this.additionalNotes,
      referenceImages: this.referenceImages,
      samples: this.samples,
      selectedSample: this.selectedSample,
      adjustmentRequests: this.adjustmentRequests,
      adminNotes: this.adminNotes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new CustomRequest({
      ...data,
      id: doc.id,
    });
  }
}

