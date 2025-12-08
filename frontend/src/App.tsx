import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProductList from './pages/Products/ProductList';
import CustomerList from './pages/Customers/CustomerList';
import OrderList from './pages/Orders/OrderList';
import OrderCreate from './pages/Orders/OrderCreate';
import OrderDetails from './pages/Orders/OrderDetails'; 

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Rota raiz */}
          <Route path="/" element={<Navigate to="/products" replace />} />

          {/* Produtos */}
          <Route path="/products" element={<ProductList />} />

          {/* Clientes */}
          <Route path="/customers" element={<CustomerList />} />

          {/* Pedidos */}
          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/create" element={<OrderCreate />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} /> 

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">
                    Página não encontrada
                  </p>
                  <a
                    href="/products"
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Voltar para Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;