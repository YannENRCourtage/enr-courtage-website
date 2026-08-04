import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Mail, Building2, Home as HomeIcon, Zap, Battery, Leaf, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = ({ activeTab, setActiveTab, scrollToContact }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const solutions = [
    { 
      id: 'construction', 
      label: 'Bâtiment & Ombrières', 
      icon: <Building2 className="h-5 w-5" />,
      color: 'hover:bg-violet-50 hover:text-violet-600'
    },
    { 
      id: 'toiture', 
      label: 'Rénovation Toiture', 
      icon: <HomeIcon className="h-5 w-5" />,
      color: 'hover:bg-orange-50 hover:text-orange-600'
    },
    { 
      id: 'autoconsommation', 
      label: 'Autoconsommation Collective', 
      icon: <Zap className="h-5 w-5" />,
      color: 'hover:bg-blue-50 hover:text-blue-600'
    },
    { 
      id: 'batterie', 
      label: 'Batterie de soutien réseau', 
      icon: <Battery className="h-5 w-5" />,
      color: 'hover:bg-teal-50 hover:text-teal-600'
    },
    { 
      id: 'certificates', 
      label: "Certificats d'Économies d'Énergies", 
      icon: <Leaf className="h-5 w-5" />,
      color: 'hover:bg-green-50 hover:text-green-600'
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
      <div className="bg-white/95 backdrop-blur-lg shadow-md">
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
            <nav className="hidden md:flex items-center space-x-6" aria-label="Navigation principale">
              {/* Accueil */}
              <button
                onClick={() => handleTabClick('home')}
                className={`px-4 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  activeTab === 'home'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
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
                  className={`flex items-center px-4 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    ['construction', 'toiture', 'autoconsommation', 'batterie', 'certificates'].includes(activeTab)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  Nos solutions
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                    >
                      {solutions.map((solution) => (
                        <button
                          key={solution.id}
                          onClick={() => handleDropdownItemClick(solution.id)}
                          className={`w-full flex items-center px-4 py-3 text-left transition-colors duration-150 ${solution.color} ${
                            activeTab === solution.id ? 'bg-gray-50 font-semibold' : 'text-gray-700'
                          }`}
                        >
                          <span className={activeTab === solution.id ? 'text-blue-600' : 'text-gray-500'}>
                            {solution.icon}
                          </span>
                          <span className="ml-3 text-base">{solution.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* À propos */}
              <button
                onClick={() => handleTabClick('about')}
                className={`px-4 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  activeTab === 'about'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
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
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Mail className="mr-2 h-4 w-4" />
                Contact
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="text-gray-700 hover:text-orange-500 p-2" 
                aria-expanded={isMenuOpen} 
                aria-controls="menu-mobile" 
                aria-label="Ouvrir le menu"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
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
                className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
              >
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {/* Accueil */}
                  <button
                    onClick={() => handleTabClick('home')}
                    className={`block px-4 py-3 rounded-md text-base font-medium w-full text-left transition-colors duration-200 ${
                      activeTab === 'home' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    aria-current={activeTab === 'home' ? 'page' : undefined}
                  >
                    Accueil
                  </button>

                  {/* Nos solutions - Expandable in mobile */}
                  <div>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center justify-between w-full px-4 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                    >
                      <span>Nos solutions</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
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
                              className={`flex items-center w-full px-4 py-2.5 rounded-md text-sm transition-colors duration-150 ${
                                activeTab === solution.id 
                                  ? 'bg-gray-100 font-semibold text-blue-600' 
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              <span className={activeTab === solution.id ? 'text-blue-600' : 'text-gray-400'}>
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
                    className={`block px-4 py-3 rounded-md text-base font-medium w-full text-left transition-colors duration-200 ${
                      activeTab === 'about' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
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
                    className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-md"
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

      {/* Tagline Bar */}
      <div className="bg-blue-900 text-white text-center py-2 hidden md:block">
        <p className="italic text-sm">"Parce qu'on est jamais mieux accompagné que par un expert... surtout s'il est gratuit !"</p>
      </div>
    </header>
  );
};

export default Header;