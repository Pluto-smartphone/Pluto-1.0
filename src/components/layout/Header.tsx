import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, Globe, LogIn, LogOut, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/auth/AuthModal';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { language, setLanguage, t } = useLanguage();
  const { getCartItemsCount } = useCart();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'th' : 'en');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  const handleSearchClick = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const navigation = [
    { name: t('home'), href: '/' },
    { name: t('shop'), href: '/shop' },
    { name: t('sell'), href: '/sell' },
    { name: t('about'), href: '/about' },
  ];

  return (
    <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="hover-lift">
            <span className="text-2xl font-bold text-primary">Pluto</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden sm:flex"
              onClick={handleSearchClick}
            >
              <Search className="h-4 w-4" />
              <span className="ml-2 hidden lg:inline">{t('search')}</span>
            </Button>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="hover:bg-primary-light"
              aria-label="Toggle language"
            >
              <Globe className="h-4 w-4" />
              <span className="ml-1 text-xs font-medium">
                {language.toUpperCase()}
              </span>
            </Button>

            {/* Authentication */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-primary-light">
                    <Rocket className="h-4 w-4" />
                    <span className="ml-2 hidden lg:inline">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <AuthModal>
                <Button variant="ghost" size="sm" className="hover:bg-primary-light">
                  <LogIn className="h-4 w-4" />
                  <span className="ml-2 hidden lg:inline">Login</span>
                </Button>
              </AuthModal>
            )}

            {/* Shopping Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative hover:bg-primary-light">
                <ShoppingCart className="h-4 w-4" />
                {getCartItemsCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse-red">
                    {getCartItemsCount()}
                  </span>
                )}
                <span className="ml-2 hidden lg:inline">{t('cart')}</span>
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden border-t border-border",
            isSearchOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <form onSubmit={handleSearch} className="py-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={`${t('search')}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button type="submit" size="sm" disabled={!searchQuery.trim()}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden transition-all duration-300 ease-in-out overflow-hidden",
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <nav className="py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block px-4 py-2 text-foreground hover:text-primary hover:bg-primary-light rounded-lg transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {/* Mobile Auth & Search */}
            <div className="px-4 py-2 space-y-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Rocket className="h-4 w-4" />
                      <span className="ml-2">Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <AuthModal>
                  <Button variant="outline" className="w-full">
                    <LogIn className="h-4 w-4" />
                    <span className="ml-2">Login</span>
                  </Button>
                </AuthModal>
              )}
              
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="text"
                  placeholder={`${t('search')}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm" disabled={!searchQuery.trim()}>
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;