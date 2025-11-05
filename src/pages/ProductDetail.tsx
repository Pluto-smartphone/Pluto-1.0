import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Star, Shield, Truck, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getProductById } from '@/data/products';
import { cn } from '@/lib/utils';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t } = useLanguage();

  const product = id ? getProductById(id) : null;

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
            <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
  };

  const isFavorited = isInWishlist(product.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(price);
  };

  const features = [
    { icon: Shield, text: 'Warranty Protection' },
    { icon: Truck, text: 'Free Shipping' },
    { icon: RotateCcw, text: '30-Day Returns' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('back')}
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 lg:h-[500px] object-cover rounded-lg"
              />
              <Badge
                variant={product.condition === 'new' ? 'default' : 'secondary'}
                className="absolute top-4 left-4"
              >
                {product.condition === 'new' ? t('firstHand') : t('secondHand')}
              </Badge>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {product.name}
          </h1>
          <p className="text-lg text-muted-foreground mb-4">{product.brand}</p>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(4.0) • 24 reviews</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.condition === 'used' && (
                  <span className="text-lg text-muted-foreground line-through ml-3">
                    {formatPrice(product.price * 1.3)}
                  </span>
                )}
              </div>
            </div>

            {/* Specifications */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">{t('specifications')}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Storage:</span>
                    <span className="ml-2 font-medium">{product.storage}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Color:</span>
                    <span className="ml-2 font-medium">{product.color}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Condition:</span>
                    <span className="ml-2 font-medium capitalize">{product.condition}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Brand:</span>
                    <span className="ml-2 font-medium">{product.brand}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-3">{t('descProduct')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold mb-3">{t('features')}</h3>
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <feature.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1"
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {t('addToCart')}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleToggleWishlist}
                  size="lg"
                  className="px-6"
                >
                  <Heart className={cn("h-4 w-4", 
                    isFavorited ? "fill-red-500 text-red-500" : ""
                  )} />
                </Button>
              </div>
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
              >
                {t('buyNow')}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;