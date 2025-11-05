import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Product } from '@/contexts/CartContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t } = useLanguage();

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

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <Card className={cn("group hover-lift transition-all duration-300 cursor-pointer", className)} onClick={handleCardClick}>
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Condition Badge */}
          <Badge
            variant={product.condition === 'new' ? 'default' : 'secondary'}
            className="absolute top-3 left-3"
          >
            {product.condition === 'new' ? t('firstHand') : t('secondHand')}
          </Badge>

          {/* Wishlist Button */}
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-3 right-3 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleWishlist();
            }}
          >
            <Heart className={cn("h-4 w-4 transition-colors", 
              isFavorited ? "fill-red-500 text-red-500" : ""
            )} />
          </Button>

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-red"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t('addToCart')}
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-200">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground">{product.brand}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Storage:</span>
              <Badge variant="outline" className="text-xs">
                {product.storage}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Color:</span>
              <span className="text-xs font-medium">{product.color}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        <div className="w-full flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.condition === 'used' && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.price * 1.3)}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>

        <Button
          size="sm"
          className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
            navigate('/cart');
          }}
        >
          {t('buyNow')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;