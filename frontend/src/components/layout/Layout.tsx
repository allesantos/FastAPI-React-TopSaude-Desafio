
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Users, ShoppingCart, Menu, X, Heart } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // ==========================================
  // ESTADOS
  // ==========================================

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // ==========================================
  //  ITENS DE NAVEGAÇÃO
  // ==========================================

  const navItems = [
    {
      path: '/products',
      label: 'Produtos',
      icon: Package,
      color: 'text-blue-600',
      hoverBg: 'hover:bg-blue-50',
      activeBg: 'bg-blue-50',
    },
    {
      path: '/customers',
      label: 'Clientes',
      icon: Users,
      color: 'text-purple-600',
      hoverBg: 'hover:bg-purple-50',
      activeBg: 'bg-purple-50',
    },
    {
      path: '/orders',
      label: 'Pedidos',
      icon: ShoppingCart,
      color: 'text-orange-600',
      hoverBg: 'hover:bg-orange-50',
      activeBg: 'bg-orange-50',
    },
  ];

  // ==========================================
  // VERIFICAR SE LINK ESTÁ ATIVO
  // ==========================================

  const isActive = (path: string) => location.pathname === path;

  // ==========================================
  //  RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ==========================================
          ⏭️ SKIP LINKS (Navegação Rápida)
          ========================================== */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Pular para o conteúdo principal
      </a>
      
      <a
        href="#main-nav"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-48 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Pular para a navegação
      </a>

      {/* ==========================================
          HEADER / NAVBAR
          ========================================== */}
      <header className="bg-white shadow-md sticky top-0 z-40" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
              aria-label="TopSaúde Hub - Página inicial"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <Heart className="w-6 h-6 text-white" fill="white" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  TopSaúde Hub
                </h1>
                <p className="text-xs text-gray-500">Sistema de Gestão</p>
              </div>
            </Link>

            {/* Navegação Desktop */}
            <nav 
              id="main-nav"
              className="hidden md:flex items-center space-x-2"
              role="navigation"
              aria-label="Navegação principal"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      active
                        ? `${item.activeBg} ${item.color}`
                        : `text-gray-600 ${item.hoverBg}`
                    }`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Botão Menu Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Menu Mobile (Dropdown) */}
        {mobileMenuOpen && (
          <div 
            id="mobile-menu"
            className="md:hidden bg-white border-t border-gray-200"
            role="navigation"
            aria-label="Navegação mobile"
          >
            <nav className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      active
                        ? `${item.activeBg} ${item.color}`
                        : `text-gray-600 ${item.hoverBg}`
                    }`}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* ==========================================
          CONTEÚDO PRINCIPAL
          ========================================== */}
      <main id="main-content" className="flex-1" role="main">
        {children}
      </main>

      {/* ==========================================
          FOOTER
          ========================================== */}
      <footer className="bg-white border-t border-gray-200 mt-12" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            
            {/* Info */}
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-green-600">TopSaúde Hub</span> - 
                Sistema de Gestão para Farmácias
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Desenvolvido com ❤️ usando React 19 + TypeScript + Tailwind CSS
              </p>
            </div>

            {/* Links */}
            <nav 
              className="flex items-center space-x-6 text-sm"
              role="navigation"
              aria-label="Navegação do rodapé"
            >
              <a
                href="#sobre"
                onClick={(e) => {
                  e.preventDefault();
                  alert('ℹ️ Sobre o projeto (em breve)');
                }}
                className="text-gray-600 hover:text-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                Sobre
              </a>
              <a
                href="#docs"
                onClick={(e) => {
                  e.preventDefault();
                  alert('📚 Documentação (em breve)');
                }}
                className="text-gray-600 hover:text-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                Documentação
              </a>
              <a
                href="#suporte"
                onClick={(e) => {
                  e.preventDefault();
                  alert('💬 Suporte (em breve)');
                }}
                className="text-gray-600 hover:text-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                Suporte
              </a>
            </nav>
          </div>

          {/* Copyright */}
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} TopSaúde Hub. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;