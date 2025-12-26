import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Truck, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ui/product-card';
import { useLanguage } from '@/contexts/LanguageContext';
import { sampleProducts, getProductsByCondition } from '@/data/products';

const Index = () => {
  const { t } = useLanguage();
  
  const featuredProducts = sampleProducts.slice(0, 4);
  const newPhones = getProductsByCondition('new').slice(0, 3);
  const usedPhones = getProductsByCondition('used').slice(0, 3);

  const features = [
    {
      icon: Shield,
      title: t('qualityGuarantee'),
      description: t('qualityDesc')
    },
    {
      icon: Truck,
      title: t('freeShipping'),
      description: t('freeShippingDesc')
    },
    {
      icon: Headphones,
      title: t('support247'),
      description: t('supportDesc')
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary-light to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <Badge variant="secondary" className="mb-4">
                {t('nowOpen')}
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                {t('heroTitle')}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {t('heroSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/shop">
                  <Button size="lg" className="gradient-primary shadow-red text-lg px-8">
                    {t('shopNow')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    {t('learnMore')}
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="animate-slide-up">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl rotate-6"></div>
                <div className="relative bg-card border border-border rounded-3xl p-8 hover-lift">
                  <div className="grid grid-cols-2 gap-4">
                    {featuredProducts.slice(0, 4).map((product, index) => (
                      <div key={product.id} className="text-center animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg mx-auto mb-2"
                        />
                        <p className="text-xs font-medium text-foreground">{product.brand}</p>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-6">
                    <div className="flex items-center justify-center mb-2">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('happyCustomers')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('featuredProducts')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('featuredDesc')}
            </p>
          </div>

          {/* New Phones */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-foreground">{t('firstHand')}</h3>
              <Link to="/shop">
                <Button variant="ghost" className="hover:text-primary">
                  {t('viewAll')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {newPhones.map((product, index) => (
                <div key={product.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* Used Phones */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-foreground">{t('secondHand')}</h3>
              <Link to="/shop">
                <Button variant="ghost" className="hover:text-primary">
                  {t('viewAll')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {usedPhones.map((product, index) => (
                <div key={product.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {t('readyToShop')}
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            {t('readyToShopDesc')}
          </p>
          <div className="flex justify-center">
            <Link to="/shop">
              <Button size="lg" className="text-lg px-8 bg-white text-red-600 hover:bg-gray-100 font-semibold shadow-lg">
                {t('startShoppingBtn')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
