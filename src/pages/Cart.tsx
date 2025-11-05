import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, getCartTotal, clearCart, addToCart } = useCart();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('cart');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(price);
  };

  const handleMoveToCart = (product: any) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  // Empty state for both cart and wishlist
  if (items.length === 0 && wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center animate-fade-in">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {t('cartEmpty')}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t('startShopping')}
            </p>
            <Link to="/shop">
              <Button size="lg" className="gradient-primary">
                {t('shopNow')}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-8">
            {activeTab === 'cart' ? t('cart') : t('wishlist')}
          </h1>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="cart" className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>{t('cart')} ({items.length})</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>{t('wishlist')} ({wishlistItems.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cart">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    {t('cartEmpty')}
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    {t('startShopping')}
                  </p>
                  <Link to="/shop">
                    <Button size="lg" className="gradient-primary">
                      {t('shopNow')}
                    </Button>
                  </Link>
                </div>
              ) : (

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Cart Items */}
                  <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                      <Card key={item.id} className="hover-lift">
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row gap-4">
                            {/* Product Image */}
                            <div className="w-full sm:w-24 h-48 sm:h-24 rounded-lg overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 space-y-2">
                              <h3 className="font-semibold text-lg text-foreground">
                                {item.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {item.brand} • {item.storage} • {item.color}
                              </p>
                              <p className="text-lg font-bold text-primary">
                                {formatPrice(item.price)}
                              </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex flex-row sm:flex-col items-center gap-4">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Clear Cart */}
                    <div className="flex justify-end mt-6">
                      <Button
                        variant="outline"
                        onClick={clearCart}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('clearCart')}
                      </Button>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-6">
                    <Card className="sticky top-8">
                      <CardHeader>
                        <CardTitle>
                          {t('orderSummary')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {item.name} × {item.quantity}
                              </span>
                              <span>{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>{t('subtotal')}</span>
                            <span>{formatPrice(getCartTotal())}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('shipping')}</span>
                            <span className="text-success">
                              {t('free')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('tax')}</span>
                            <span>{formatPrice(getCartTotal() * 0.07)}</span>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex justify-between text-lg font-bold">
                          <span>{t('total')}</span>
                          <span className="text-primary">
                            {formatPrice(getCartTotal() * 1.07)}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <Link to="/payment" className="w-full block">
                            <Button size="lg" className="w-full gradient-primary shadow-red">
                              {t('checkout')}
                            </Button>
                          </Link>
                          <Link to="/shop" className="w-full block">
                            <Button variant="outline" size="lg" className="w-full">
                              {t('continueShopping')}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="wishlist">
              {wishlistItems.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    {t('wishlistEmpty')}
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    {t('addToWishlist')}
                  </p>
                  <Link to="/shop">
                    <Button size="lg" className="gradient-primary">
                      {t('shopNow')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistItems.map((item) => (
                    <Card key={item.id} className="hover-lift">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {/* Product Image */}
                          <div className="relative">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <Badge
                              variant={item.condition === 'new' ? 'default' : 'secondary'}
                              className="absolute top-2 left-2"
                            >
                              {item.condition === 'new' ? t('firstHand') : t('secondHand')}
                            </Badge>
                          </div>

                          {/* Product Details */}
                          <div className="space-y-2">
                            <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                              {item.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {item.brand} • {item.storage} • {item.color}
                            </p>
                            <p className="text-xl font-bold text-primary">
                              {formatPrice(item.price)}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleMoveToCart(item)}
                              className="flex-1"
                              size="sm"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              {t('addToCart')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromWishlist(item.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;