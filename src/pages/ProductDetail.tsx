import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Star, Shield, Truck, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import type { Product } from '@/contexts/CartContext';

const IMAGE_BUCKET = 'phone-images';

const toPublicImageUrl = (storagePath: string) => {
  if (!storagePath) return '/placeholder.svg';
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) return storagePath;
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl || '/placeholder.svg';
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t } = useLanguage();

  const { data, isLoading, isError } = useQuery<
    { product: Product; images: { id: string; url: string; storagePath: string }[] } | null,
    Error
  >({
    queryKey: ['phone', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;

      const { data: phone, error } = await supabase
        .from('phones')
        .select('*')
        .eq('id', id)
        .single<Tables<'phones'>>();

      if (error) throw error;
      if (!phone) return null;

      const { data: imageRows, error: imageError } = await supabase
        .from('phone_images')
        .select('id, storage_path, display_order, is_primary')
        .eq('phone_id', id)
        .order('is_primary', { ascending: false })
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (imageError) throw imageError;

      const images =
        (imageRows || []).map((img) => ({
          id: img.id,
          storagePath: img.storage_path,
          url: toPublicImageUrl(img.storage_path),
        })) ?? [];

      const condition: Product['condition'] = phone.condition === 'new' ? 'new' : 'used';
      const primaryUrl = images[0]?.url || '/placeholder.svg';

      return {
        product: {
          id: phone.id,
          name: phone.name,
          price: phone.price,
          image: primaryUrl,
          brand: phone.brand,
          condition,
          storage: phone.storage || '',
          color: phone.color || '',
          description: phone.description || '',
        },
        images,
      };
    },
  });

  const product = data?.product;
  const images = data?.images || [];
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const displayImage = useMemo(() => {
    if (selectedImage) return selectedImage;
    if (product?.image) return product.image;
    return '/placeholder.svg';
  }, [selectedImage, product?.image]);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-20 text-muted-foreground">
          {t('loading')}
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-20 text-destructive">
          {t('error')}
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
        </div>
      </main>
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
                src={displayImage}
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

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.slice(0, 10).map((img) => {
                  const active = img.url === displayImage;
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setSelectedImage(img.url)}
                      className={cn(
                        'rounded-md overflow-hidden border transition-colors',
                        active ? 'border-primary' : 'border-border hover:border-primary/50'
                      )}
                      aria-label="Select image"
                    >
                      <img
                        src={img.url}
                        alt={product.name}
                        className="h-16 w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
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
  );
};

export default ProductDetail;