import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Heart,
  ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Cart: React.FC = () => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    clearCart,
    addToCart
  } = useCart();

  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('cart');

  // ✅ selected items
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  const selectedItems = items.filter((item) =>
    selectedIds.includes(item.id)
  );

  const selectedTotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  const handleMoveToCart = (product: any) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  // Empty state
  if (items.length === 0 && wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">
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
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {activeTab === 'cart' ? t('cart') : t('wishlist')}
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="cart">
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t('cart')} ({items.length})
            </TabsTrigger>
            <TabsTrigger value="wishlist">
              <Heart className="h-4 w-4 mr-2" />
              {t('wishlist')} ({wishlistItems.length})
            </TabsTrigger>
          </TabsList>

          {/* ================= CART ================= */}
          <TabsContent value="cart">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-4">
                  {t('cartEmpty')}
                </h2>
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
                    <Card key={item.id}>
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() =>
                              toggleSelectItem(item.id)
                            }
                            className="mt-2 h-4 w-4 accent-red-500"
                          />

                          <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            {/* Image */}
                            <div className="w-24 h-24 rounded-lg overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 space-y-2">
                              <h3 className="font-semibold text-lg">
                                {item.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {item.brand} • {item.storage} •{' '}
                                {item.color}
                              </p>
                              <p className="font-bold text-primary">
                                {formatPrice(item.price)}
                              </p>
                            </div>

                            {/* Quantity */}
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>

                              <span>{item.quantity}</span>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  removeFromCart(item.id)
                                }
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      className="text-destructive"
                      onClick={clearCart}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('clearCart')}
                    </Button>
                  </div>
                </div>

                {/* Summary */}
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle>{t('orderSummary')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>
                          {formatPrice(
                            item.price * item.quantity
                          )}
                        </span>
                      </div>
                    ))}

                    <Separator />

                    <div className="flex justify-between">
                      <span>{t('subtotal')}</span>
                      <span>
                        {formatPrice(selectedTotal)}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold">
                      <span>{t('total')}</span>
                      <span className="text-primary">
                        {formatPrice(selectedTotal)}
                      </span>
                    </div>

                    <Link to="/payment">
                      <Button
                        className="w-full gradient-primary"
                        disabled={selectedIds.length === 0}
                      >
                        {t('checkout')}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ================= WISHLIST ================= */}
          <TabsContent value="wishlist">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {wishlistItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4 space-y-4">
                    <img
                      src={item.image}
                      className="h-48 w-full object-cover rounded-lg"
                    />

                    <Badge>
                      {item.condition === 'new'
                        ? t('firstHand')
                        : t('secondHand')}
                    </Badge>

                    <h3 className="font-semibold">
                      {item.name}
                    </h3>

                    <p className="text-primary font-bold">
                      {formatPrice(item.price)}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          handleMoveToCart(item)
                        }
                        className="flex-1"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {t('addToCart')}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() =>
                          removeFromWishlist(item.id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
