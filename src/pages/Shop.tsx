import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ui/product-card';
import { useLanguage } from '@/contexts/LanguageContext';
import { sampleProducts, getProductsByCondition } from '@/data/products';
import { Product } from '@/contexts/CartContext';

const Shop: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [brandFilter, setBrandFilter] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Initialize search query from URL parameters
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  const newPhones = getProductsByCondition('new');
  const usedPhones = getProductsByCondition('used');

  const brands = Array.from(new Set(sampleProducts.map(p => p.brand)));

  const filterAndSortProducts = (products: Product[]) => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Brand filter
    if (brandFilter !== 'all') {
      filtered = filtered.filter(product => product.brand === brandFilter);
    }

    // Price range filter
    if (priceRange !== 'all') {
      switch (priceRange) {
        case '0-10000':
          filtered = filtered.filter(product => product.price <= 10000);
          break;
        case '10001-20000':
          filtered = filtered.filter(product => product.price > 10000 && product.price <= 20000);
          break;
        case '20001-30000':
          filtered = filtered.filter(product => product.price > 20000 && product.price <= 30000);
          break;
        case '30001-40000':
          filtered = filtered.filter(product => product.price > 30000 && product.price <= 40000);
          break;
        case '40001+':
          filtered = filtered.filter(product => product.price > 40000);
          break;
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'brand':
          return a.brand.localeCompare(b.brand);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  };

  const filteredNewPhones = useMemo(() => filterAndSortProducts(newPhones), [newPhones, searchQuery, sortBy, brandFilter, priceRange]);
  const filteredUsedPhones = useMemo(() => filterAndSortProducts(usedPhones), [usedPhones, searchQuery, sortBy, brandFilter, priceRange]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-4">{t('shop')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('shopDesc')}
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8 animate-slide-up">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('search') + '...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Price Range Filter */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('priceRange')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allPrices')}</SelectItem>
                  <SelectItem value="0-10000">฿0 - ฿10,000</SelectItem>
                  <SelectItem value="10001-20000">฿10,001 - ฿20,000</SelectItem>
                  <SelectItem value="20001-30000">฿20,001 - ฿30,000</SelectItem>
                  <SelectItem value="30001-40000">฿30,001 - ฿40,000</SelectItem>
                  <SelectItem value="40001+">฿40,001+</SelectItem>
                </SelectContent>
              </Select>

              {/* Brand Filter */}
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t('brand')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allBrands')}</SelectItem>
                  {brands.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('sort')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">{t('sortName')}</SelectItem>
                  <SelectItem value="price-low">{t('sortPriceLow')}</SelectItem>
                  <SelectItem value="price-high">{t('sortPriceHigh')}</SelectItem>
                  <SelectItem value="brand">{t('sortBrand')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Product Categories */}
        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="new" className="text-lg py-3">
              {t('firstHand')} ({filteredNewPhones.length})
            </TabsTrigger>
            <TabsTrigger value="used" className="text-lg py-3">
              {t('secondHand')} ({filteredUsedPhones.length})
            </TabsTrigger>
          </TabsList>

          {/* New Phones */}
          <TabsContent value="new" className="animate-fade-in">
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredNewPhones.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  className={viewMode === 'list' ? 'flex flex-row' : ''}
                />
              ))}
            </div>
            {filteredNewPhones.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {t('noProducts')}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Used Phones */}
          <TabsContent value="used" className="animate-fade-in">
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredUsedPhones.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  className={viewMode === 'list' ? 'flex flex-row' : ''}
                />
              ))}
            </div>
            {filteredUsedPhones.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {t('noProducts')}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;