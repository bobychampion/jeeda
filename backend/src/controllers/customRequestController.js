import { db } from '../config/firebaseAdmin.js';
import { CustomRequest } from '../models/CustomRequest.js';
import { Timestamp } from 'firebase-admin/firestore';
import { sendRequestConfirmationEmail, sendSamplesEmail } from '../services/emailService.js';

/**
 * Create a new custom request
 */
export async function createCustomRequest(req, res) {
  try {
    const {
      templateId,
      templateName,
      modifications,
      userEmail,
      userPhone,
      additionalNotes,
      referenceImages,
    } = req.body;

    const userId = req.user?.uid || null; // From auth middleware

    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }

    if (!modifications || Object.keys(modifications).length === 0) {
      return res.status(400).json({ error: 'At least one modification is required' });
    }

    if (!userEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Create custom request
    const customRequest = new CustomRequest({
      userId,
      templateId,
      templateName: templateName || 'Unknown Template',
      modifications,
      userEmail,
      userPhone: userPhone || '',
      additionalNotes: additionalNotes || '',
      referenceImages: referenceImages || [],
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Save to Firestore
    const docRef = await db.collection('customRequests').add(customRequest.toFirestore());
    const savedRequest = { id: docRef.id, ...customRequest.toFirestore() };

    // Send confirmation email (non-blocking)
    sendRequestConfirmationEmail(userEmail, savedRequest).catch(err => {
      console.error('Failed to send confirmation email:', err);
    });

    res.status(201).json({
      success: true,
      id: docRef.id,
      message: 'Custom request submitted successfully. We will send you samples via email.',
    });
  } catch (error) {
    console.error('Error creating custom request:', error);
    res.status(500).json({
      error: 'Failed to create custom request',
      details: error.message,
    });
  }
}

/**
 * Get user's custom requests
 */
export async function getUserCustomRequests(req, res) {
  try {
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const snapshot = await db
      .collection('customRequests')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(requests);
  } catch (error) {
    console.error('Error fetching user custom requests:', error);
    res.status(500).json({ error: 'Failed to fetch custom requests' });
  }
}

/**
 * Get a single custom request by ID
 */
export async function getCustomRequest(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    const doc = await db.collection('customRequests').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Custom request not found' });
    }

    const requestData = doc.data();

    // Check if user has access (owner or admin)
    if (requestData.userId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: doc.id,
      ...requestData,
    });
  } catch (error) {
    console.error('Error fetching custom request:', error);
    res.status(500).json({ error: 'Failed to fetch custom request' });
  }
}

/**
 * Update custom request (admin only for most fields, user can select sample)
 */
export async function updateCustomRequest(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.uid;
    const isAdmin = req.user?.role === 'admin';

    const doc = await db.collection('customRequests').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Custom request not found' });
    }

    const requestData = doc.data();

    // Users can only update their own requests for sample selection
    if (!isAdmin && requestData.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Users can only select samples, admins can update everything
    const allowedUserUpdates = ['selectedSample', 'status']; // User can select sample or cancel
    const updateData = { ...updates, updatedAt: Timestamp.now() };

    if (!isAdmin) {
      // Filter to only allowed fields for non-admin users
      const filteredUpdates = {};
      allowedUserUpdates.forEach((key) => {
        if (updateData[key] !== undefined) {
          filteredUpdates[key] = updateData[key];
        }
      });
      Object.assign(updateData, filteredUpdates);
    }

    await db.collection('customRequests').doc(id).update(updateData);

    // If admin is sending samples, send email notification
    if (isAdmin && updates.samples && updates.samples.length > 0) {
      const updatedDoc = await db.collection('customRequests').doc(id).get();
      const requestData = { id, ...updatedDoc.data() };
      
      sendSamplesEmail(requestData.userEmail, requestData, updates.samples).catch(err => {
        console.error('Failed to send samples email:', err);
      });
    }

    res.json({
      success: true,
      message: 'Custom request updated successfully',
    });
  } catch (error) {
    console.error('Error updating custom request:', error);
    res.status(500).json({
      error: 'Failed to update custom request',
      details: error.message,
    });
  }
}

/**
 * Get all custom requests (admin only)
 */
export async function getAllCustomRequests(req, res) {
  try {
    const { status } = req.query;

    let query = db.collection('customRequests').orderBy('createdAt', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();

    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(requests);
  } catch (error) {
    console.error('Error fetching all custom requests:', error);
    res.status(500).json({ error: 'Failed to fetch custom requests' });
  }
}

