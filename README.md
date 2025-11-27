# Replique Crafts MVP

A DIY furniture platform offering curated, pre-designed furniture templates with AI-assisted selection and customization.

## Features

- Browse 20-30 furniture templates across multiple categories
- AI-powered assistant for template recommendations (Gemini AI)
- Customize color, material, and dimensions
- Real-time price calculator
- Shopping cart and checkout
- Paystack payment integration
- Order management dashboard
- Admin panel for template management

## Tech Stack

### Frontend
- React 19 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Firebase Auth for authentication
- Axios for API calls
- Lucide React for icons

### Backend
- Node.js with Express
- Firebase Firestore for database
- Firebase Admin SDK
- Google Gemini API for AI recommendations
- Cloudinary for image storage and transformations
- Paystack for payments
- PDFKit for generating instruction PDFs

## Project Structure

```
replique-crafts/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── services/     # API services
│   │   └── config/        # Configuration files
│   └── package.json
├── backend/           # Express backend API
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # Data models
│   │   ├── services/     # Business logic services
│   │   ├── middleware/   # Express middleware
│   │   └── config/       # Configuration files
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Firebase project with Firestore enabled
- Google Gemini API key
- Cloudinary account
- Paystack account

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in frontend directory:
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_API_BASE_URL=http://localhost:5000/api
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

4. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend directory:
```
PORT=5000
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PAYSTACK_SECRET_KEY=your_paystack_secret_key
FRONTEND_URL=http://localhost:5173
```

**Note:** For Firebase Admin, you can either:
- Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable pointing to your service account JSON file
- Or provide `FIREBASE_PRIVATE_KEY` and `FIREBASE_CLIENT_EMAIL` in the .env file

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

## API Endpoints

### Templates
- `GET /api/templates` - Get all templates
- `GET /api/templates/:id` - Get single template
- `GET /api/templates/category/:category` - Get templates by category
- `POST /api/templates` - Create template (Admin)
- `PUT /api/templates/:id` - Update template (Admin)
- `DELETE /api/templates/:id` - Delete template (Admin)

### AI Assistant
- `POST /api/ai/recommend` - Get AI recommendations
- `POST /api/ai/recolor` - Generate recolored image

### Cart
- `GET /api/cart` - Get user cart (Auth required)
- `POST /api/cart/add` - Add item to cart (Auth required)
- `PUT /api/cart/:itemId` - Update cart item (Auth required)
- `DELETE /api/cart/:itemId` - Remove item from cart (Auth required)

### Orders
- `POST /api/orders` - Create order (Auth required)
- `GET /api/orders` - Get user orders (Auth required)
- `GET /api/orders/:id` - Get single order (Auth required)
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `GET /api/orders/:id/instructions` - Download instructions PDF (Auth required)

### Payments
- `POST /api/payments/initialize` - Initialize Paystack payment (Auth required)
- `POST /api/payments/verify` - Verify payment

### Admin
- `GET /api/admin/orders` - Get all orders (Admin)
- `GET /api/admin/stats` - Get dashboard statistics (Admin)

## Firebase Firestore Collections

- `templates` - Furniture templates
- `users` - User profiles
- `orders` - Customer orders
- `cart` - User shopping carts
- `categories` - Product categories

## Development Notes

- The AI assistant uses Gemini to recommend templates based on user queries
- Image customization uses Cloudinary transformations
- Payments are processed through Paystack
- Order instructions are generated as PDFs using PDFKit
- Authentication is handled via Firebase Auth

## License

ISC

