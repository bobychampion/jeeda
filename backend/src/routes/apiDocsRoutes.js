import express from 'express';

const router = express.Router();

// API Documentation Page
router.get('/', (req, res) => {
  const apiDocs = {
    baseUrl: `${req.protocol}://${req.get('host')}`,
    endpoints: [
      {
        category: 'Health Check',
        routes: [
          { method: 'GET', path: '/health', description: 'Check if the API is running', auth: false },
        ],
      },
      {
        category: 'Templates',
        routes: [
          { method: 'GET', path: '/api/templates', description: 'Get all templates', auth: false },
          { method: 'GET', path: '/api/templates/:id', description: 'Get a specific template', auth: false },
          { method: 'GET', path: '/api/templates/category/:category', description: 'Get templates by category', auth: false },
          { method: 'POST', path: '/api/templates', description: 'Create a new template', auth: true, admin: true },
          { method: 'PUT', path: '/api/templates/:id', description: 'Update a template', auth: true, admin: true },
          { method: 'DELETE', path: '/api/templates/:id', description: 'Delete a template', auth: true, admin: true },
        ],
      },
      {
        category: 'AI Services',
        routes: [
          { method: 'POST', path: '/api/ai/recommend', description: 'Get AI recommendations based on user query', auth: false, body: { query: 'string' } },
          { method: 'POST', path: '/api/ai/recolor', description: 'Recolor a template image', auth: false, body: { templateId: 'string', color: 'string', material: 'string' } },
          { method: 'POST', path: '/api/ai/generate-furniture', description: 'Generate furniture image from text prompt', auth: false, body: { prompt: 'string', style: 'string', width: 'number', height: 'number' } },
          { method: 'GET', path: '/api/ai/prompt-settings', description: 'Get AI prompt settings (Admin)', auth: true, admin: true },
          { method: 'POST', path: '/api/ai/prompt-settings', description: 'Update AI prompt settings (Admin)', auth: true, admin: true },
        ],
      },
      {
        category: 'Orders',
        routes: [
          { method: 'POST', path: '/api/orders', description: 'Create a new order', auth: true, body: { items: 'array', shippingAddress: 'object', paymentMethod: 'string' } },
          { method: 'GET', path: '/api/orders', description: 'Get user orders', auth: true },
          { method: 'GET', path: '/api/orders/:id', description: 'Get a specific order', auth: true },
          { method: 'GET', path: '/api/orders/:id/instructions', description: 'Download order instructions PDF', auth: true },
          { method: 'PUT', path: '/api/orders/:id/status', description: 'Update order status (Admin)', auth: true, admin: true, body: { status: 'string' } },
        ],
      },
      {
        category: 'Cart',
        routes: [
          { method: 'GET', path: '/api/cart', description: 'Get user cart', auth: true },
          { method: 'POST', path: '/api/cart', description: 'Add item to cart', auth: true, body: { templateId: 'string', quantity: 'number', customizations: 'object' } },
          { method: 'PUT', path: '/api/cart/:itemId', description: 'Update cart item', auth: true, body: { quantity: 'number' } },
          { method: 'DELETE', path: '/api/cart/:itemId', description: 'Remove item from cart', auth: true },
        ],
      },
      {
        category: 'Payments',
        routes: [
          { method: 'POST', path: '/api/payments/initialize', description: 'Initialize Paystack payment', auth: true, body: { orderId: 'string', amount: 'number', email: 'string' } },
          { method: 'POST', path: '/api/payments/verify', description: 'Verify Paystack payment', auth: true, body: { reference: 'string' } },
        ],
      },
      {
        category: 'Admin',
        routes: [
          { method: 'GET', path: '/api/admin/orders', description: 'Get all orders (Admin)', auth: true, admin: true },
          { method: 'GET', path: '/api/admin/stats', description: 'Get dashboard statistics (Admin)', auth: true, admin: true },
          { method: 'POST', path: '/api/admin/upload-image', description: 'Upload image to Cloudinary (Admin)', auth: true, admin: true, body: 'multipart/form-data (file)' },
          { method: 'GET', path: '/api/admin/inventory', description: 'Get all inventory items (Admin)', auth: true, admin: true },
          { method: 'POST', path: '/api/admin/inventory', description: 'Create or update inventory item (Admin)', auth: true, admin: true },
          { method: 'DELETE', path: '/api/admin/inventory/:id', description: 'Delete inventory item (Admin)', auth: true, admin: true },
          { method: 'GET', path: '/api/admin/templates/:templateId/inventory', description: 'Get inventory for a template (Admin)', auth: true, admin: true },
        ],
      },
    ],
  };

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jeeda API Documentation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .header p {
            opacity: 0.9;
            font-size: 1.1em;
        }
        .base-url {
            background: rgba(255,255,255,0.1);
            padding: 10px 20px;
            border-radius: 6px;
            margin-top: 15px;
            display: inline-block;
            font-family: 'Courier New', monospace;
        }
        .content {
            padding: 30px;
        }
        .category {
            margin-bottom: 40px;
        }
        .category-title {
            font-size: 1.8em;
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }
        .endpoint {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin-bottom: 15px;
            border-radius: 6px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .endpoint:hover {
            transform: translateX(5px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .method {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.9em;
            margin-right: 10px;
            font-family: 'Courier New', monospace;
        }
        .method.get { background: #61affe; color: white; }
        .method.post { background: #49cc90; color: white; }
        .method.put { background: #fca130; color: white; }
        .method.delete { background: #f93e3e; color: white; }
        .path {
            font-family: 'Courier New', monospace;
            font-size: 1.1em;
            color: #333;
            font-weight: 600;
        }
        .description {
            margin-top: 10px;
            color: #666;
            line-height: 1.6;
        }
        .badges {
            margin-top: 10px;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        .badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.85em;
            font-weight: 600;
        }
        .badge.auth { background: #ffc107; color: #000; }
        .badge.admin { background: #dc3545; color: white; }
        .badge.body { background: #17a2b8; color: white; }
        .body-info {
            margin-top: 10px;
            padding: 10px;
            background: #e7f3ff;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #004085;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            color: #666;
            border-top: 1px solid #dee2e6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Jeeda API</h1>
            <p>Complete API Documentation</p>
            <div class="base-url">Base URL: ${apiDocs.baseUrl}</div>
        </div>
        <div class="content">
            ${apiDocs.endpoints.map(category => `
                <div class="category">
                    <h2 class="category-title">${category.category}</h2>
                    ${category.routes.map(route => `
                        <div class="endpoint">
                            <div>
                                <span class="method ${route.method.toLowerCase()}">${route.method}</span>
                                <span class="path">${route.path}</span>
                            </div>
                            <div class="description">${route.description}</div>
                            <div class="badges">
                                ${route.auth ? '<span class="badge auth">🔒 Auth Required</span>' : ''}
                                ${route.admin ? '<span class="badge admin">👑 Admin Only</span>' : ''}
                                ${route.body ? '<span class="badge body">📦 Body Required</span>' : ''}
                            </div>
                            ${route.body ? `
                                <div class="body-info">
                                    <strong>Request Body:</strong><br>
                                    ${typeof route.body === 'string' ? route.body : JSON.stringify(route.body, null, 2)}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
        <div class="footer">
            <p>Jeeda Backend API | Version 1.0.0</p>
            <p style="margin-top: 10px; font-size: 0.9em;">
                Server running on port ${process.env.PORT || 5000} | 
                <a href="/health" style="color: #667eea;">Health Check</a>
            </p>
        </div>
    </div>
</body>
</html>
  `;

  res.send(html);
});

export default router;

