import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AIAssistantPage from './pages/AIAssistantPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminTemplatesPage from './pages/AdminTemplatesPage';
import CategoryManagementPage from './pages/admin/CategoryManagementPage';
import OrdersManagementPage from './pages/admin/OrdersManagementPage';
import DeliveryManagementPage from './pages/admin/DeliveryManagementPage';
import AIManagementPage from './pages/admin/AIManagementPage';
import AILogsPage from './pages/admin/AILogsPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import InstructionBuilderPage from './pages/admin/InstructionBuilderPage';
import PromotionsPage from './pages/admin/PromotionsPage';
import InventoryManagementPage from './pages/admin/InventoryManagementPage';
import CustomRequestsPage from './pages/admin/CustomRequestsPage';
import CustomRequestPage from './pages/CustomRequestPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HowItWorksPage from './pages/HowItWorksPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/categories/:categoryId" element={<CategoryPage />} />
          <Route path="/templates/:id" element={<ProductDetailPage />} />
          <Route
            path="/ai-assistant"
            element={
              <ProtectedRoute>
                <AIAssistantPage />
              </ProtectedRoute>
            }
          />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/custom-requests/:id"
            element={
              <ProtectedRoute>
                <CustomRequestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/templates"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminTemplatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute requireAdmin={true}>
                <CategoryManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requireAdmin={true}>
                <OrdersManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/delivery"
            element={
              <ProtectedRoute requireAdmin={true}>
                <DeliveryManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ai-settings"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AIManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ai-logs"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AILogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute requireAdmin={true}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/instructions"
            element={
              <ProtectedRoute requireAdmin={true}>
                <InstructionBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/promotions"
            element={
              <ProtectedRoute requireAdmin={true}>
                <PromotionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute requireAdmin={true}>
                <InventoryManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/custom-requests"
            element={
              <ProtectedRoute requireAdmin={true}>
                <CustomRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
