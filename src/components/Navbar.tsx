import React from 'react';
import { FileText, Scissors, LayoutDashboard } from 'lucide-react';
import Logo from './Logo';

export type ActiveTab = 'presupuestos' | 'optimizador';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Marca y Logo */}
        <div className="flex items-center gap-3">
          <Logo className="w-36 sm:w-40 h-auto" />
        </div>

        {/* Menú Principal de Navegación */}
        <nav className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 w-full sm:w-auto justify-center">
          <button
            type="button"
            onClick={() => setActiveTab('presupuestos')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'presupuestos'
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === 'presupuestos' ? 'text-indigo-600' : 'text-stone-400'}`} />
            <span>Presupuestos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('optimizador')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'optimizador'
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Scissors className={`w-4 h-4 ${activeTab === 'optimizador' ? 'text-sky-600' : 'text-stone-400'}`} />
            <span>Optimizador de Cortes</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
