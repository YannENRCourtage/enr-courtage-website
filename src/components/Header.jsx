import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Mail, Building2, Zap, Battery, Car, ChevronDown, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = ({ activeTab, setActiveTab, scrollToContact }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const solutions = [
    { 
      id: 'toiture', 
      label: 'Toiture photovoltaïque', 
      icon: <Sun className="h-5 w-5" />,
      color: 'hover:bg-lime-50 hover:text-lime-700'
    },
    { 
      id: 'batterie', 
      label: 'Batterie de soutien réseau', 
      icon: <Battery className="h-5 w-5" />,
      color: 'hover:bg-teal-50 hover:text-teal-700'
    },
    { 
      id: 'irve', 
      label: 'Borne de recharge IRVE', 
      icon: <Car className="h-5 w-5" />,
      color: 'hover:bg-amber-50 hover:text-amber-700'
    },
    { 
      id: 'construction', 
      label: 'Bâtiments & Ombrières tiers financés', 
      icon: <Building2 className="h-5 w-5" />,
      color: 'hover:bg-indigo-50 hover:text-indigo-700'
    },
    { 
      id: 'autoconsommation', 
      label: 'Autoconsommation', 
      icon: <Zap className="h-5 w-5" />,
      color: 'hover:bg-blue-50 hover:text-blue-700'
    }
  ];

  const handleTabClick = (tabId) => {
    if (tabId === 'batterie') {
      navigate('/batterie-soutien-reseau');
    } else {
      navigate('/');
      setTimeout(() => {
        setActiveTab(tabId);
      }, 0);
    }
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const handleDropdownItemClick = (solutionId) => {
    if (solutionId === 'batterie') {
      navigate('/batterie-soutien-reseau');
    } else {
      navigate('/');
      setTimeout(() => {
        setActiveTab(solutionId);
      }, 0);
    }
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="relative z-20 bg-white/95 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-b border-gray-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" role="navigation" aria-label="Navigation principale">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <button onClick={() => handleTabClick('home')} aria-label="Aller à l'accueil">
                <img
                  src="https://horizons-cdn.hostinger.com/7934566c-db1f-49b8-9261-1dc6e7b3a05b/7bd0f511a5866b092d723a1035903e1a.png"
                  alt="ENR COURTAGE"
                  width="180" 
                  height="48"
                  className="h-12 w-auto"
                />
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1" aria-label="Navigation principale">
              {/* Accueil */}
              <button
                onClick={() => handleTabClick('home')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'home'
                    ? 'text-[#0f2847] bg-gray-100'
                    : 'text-gray-600 hover:text-[#0f2847] hover:bg-gray-50'
                }`}
                aria-current={activeTab === 'home' ? 'page' : undefined}
              >
                Accueil
              </button>

              {/* Nos solutions - Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    ['construction', 'autoconsommation', 'batterie', 'irve', 'toiture'].includes(activeTab)
                      ? 'text-[#0f2847] bg-gray-100'
                      : 'text-gray-600 hover:text-[#0f2847] hover:bg-gray-50'
                  }`}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  Nos solutions
                  <ChevronDown className={`ml-1 h-3.5 w-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-80 bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50"
                    >
                      {solutions.map((solution) => (
                        <button
                          key={solution.id}
                          onClick={() => handleDropdownItemClick(solution.id)}
                          className={`w-full flex items-center px-4 py-3 text-left transition-colors duration-150 ${solution.color} ${
                            activeTab === solution.id ? 'bg-gray-50 font-semibold' : 'text-gray-600'
                          }`}
                        >
                          <span className={activeTab === solution.id ? 'text-[#0f2847]' : 'text-gray-400'}>
                            {solution.icon}
                          </span>
                          <span className="ml-3 text-sm">{solution.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* À propos */}
              <button
                onClick={() => handleTabClick('about')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'about'
                    ? 'text-[#0f2847] bg-gray-100'
                    : 'text-gray-600 hover:text-[#0f2847] hover:bg-gray-50'
                }`}
                aria-current={activeTab === 'about' ? 'page' : undefined}
              >
                À propos
              </button>
            </nav>

            {/* Contact Button - Desktop */}
            <div className="hidden md:flex items-center">
              <Button 
                onClick={scrollToContact} 
                className="bg-[#0f2847] hover:bg-[#1a3a5c] text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 text-sm"
              >
                <Mail className="mr-2 h-4 w-4" />
                Contact
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="text-gray-600 hover:text-[#0f2847] p-2 rounded-lg hover:bg-gray-50 transition-colors" 
                aria-expanded={isMenuOpen} 
                aria-controls="menu-mobile" 
                aria-label="Ouvrir le menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                id="menu-mobile"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
              >
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {/* Accueil */}
                  <button
                    onClick={() => handleTabClick('home')}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium w-full text-left transition-colors duration-200 ${
                      activeTab === 'home' ? 'text-[#0f2847] bg-gray-100' : 'text-gray-600 hover:text-[#0f2847] hover:bg-gray-50'
                    }`}
                    aria-current={activeTab === 'home' ? 'page' : undefined}
                  >
                    Accueil
                  </button>

                  {/* Nos solutions - Expandable in mobile */}
                  <div>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-[#0f2847] hover:bg-gray-50 transition-colors duration-200"
                    >
                      <span>Nos solutions</span>
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="pl-4 space-y-1 overflow-hidden"
                        >
                          {solutions.map((solution) => (
                            <button
                              key={solution.id}
                              onClick={() => handleDropdownItemClick(solution.id)}
                              className={`flex items-center w-full px-4 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                                activeTab === solution.id 
                                  ? 'bg-gray-100 font-semibold text-[#0f2847]' 
                                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                              }`}
                            >
                              <span className={activeTab === solution.id ? 'text-[#0f2847]' : 'text-gray-400'}>
                                {solution.icon}
                              </span>
                              <span className="ml-3">{solution.label}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* À propos */}
                  <button
                    onClick={() => handleTabClick('about')}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium w-full text-left transition-colors duration-200 ${
                      activeTab === 'about' ? 'text-[#0f2847] bg-gray-100' : 'text-gray-600 hover:text-[#0f2847] hover:bg-gray-50'
                    }`}
                    aria-current={activeTab === 'about' ? 'page' : undefined}
                  >
                    À propos
                  </button>

                  {/* Contact Button - Mobile */}
                  <Button 
                    onClick={() => { 
                      scrollToContact(); 
                      setIsMenuOpen(false); 
                    }} 
                    className="w-full mt-2 bg-[#0f2847] hover:bg-[#1a3a5c] text-white font-medium shadow-md text-sm"
                  >
                    <Mail className="mr-2 h-4 w-4" /> 
                    Contact
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tagline Bar - Refined */}
      <div className="relative z-10 bg-[#0f2847] text-white text-center py-2 hidden md:block">
        <p className="text-xs tracking-wide font-light opacity-80">"Parce qu'on est jamais mieux accompagné que par un expert... surtout s'il est gratuit !"</p>
      </div>
    </header>
  );
};

export default Header;