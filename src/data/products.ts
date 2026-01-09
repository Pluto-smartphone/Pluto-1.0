import { Product } from '@/contexts/CartContext';
import iphone15ProMax from '@/assets/iphone-15-pro-max.jpg';
import samsungS24Ultra from '@/assets/samsung-s24-ultra.jpg';
import pixel8Pro from '@/assets/pixel-8-pro.jpg';
import xiaomi14Ultra from '@/assets/xiaomi-14-ultra.jpg';
import oneplus12 from '@/assets/oneplus-12.jpg';
import iphone14Pro from '@/assets/iphone-14-pro.jpg';

export const sampleProducts: Product[] = [
  // New Phones
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    price: 45900,
    image: iphone15ProMax,
    brand: 'Apple',
    condition: 'new',
    storage: '256GB',
    color: 'Natural Titanium',
    description: 'The ultimate iPhone with titanium design, A17 Pro chip, and professional camera system.'
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    price: 42900,
    image: samsungS24Ultra,
    brand: 'Samsung',
    condition: 'new',
    storage: '512GB',
    color: 'Titanium Black',
    description: 'Premium Android flagship with S Pen, incredible cameras, and AI-powered features.'
  },
  {
    id: '3',
    name: 'Google Pixel 8 Pro',
    price: 32900,
    image: pixel8Pro,
    brand: 'Google',
    condition: 'new',
    storage: '128GB',
    color: 'Obsidian',
    description: 'Pure Android experience with advanced AI photography and 7 years of updates.'
  },
  {
    id: '4',
    name: 'Xiaomi 14 Ultra',
    price: 28900,
    image: xiaomi14Ultra,
    brand: 'Xiaomi',
    condition: 'new',
    storage: '256GB',
    color: 'Black',
    description: 'Flagship performance with Leica cameras and premium materials at great value.'
  },
  {
    id: '5',
    name: 'OnePlus 12',
    price: 24900,
    image: oneplus12,
    brand: 'OnePlus',
    condition: 'new',
    storage: '256GB',
    color: 'Silky Black',
    description: 'Fast performance, smooth display, and rapid charging technology.'
  },

  // Used Phones
  {
    id: '6',
    name: 'iPhone 14 Pro',
    price: 29900,
    image: iphone14Pro,
    brand: 'Apple',
    condition: 'used',
    storage: '128GB',
    color: 'Deep Purple',
    description: 'Excellent condition iPhone 14 Pro with Dynamic Island and pro camera system.'
  },
  {
    id: '7',
    name: 'Samsung Galaxy S23',
    price: 19900,
    image: 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b5?w=400&h=300&fit=crop',
    brand: 'Samsung',
    condition: 'used',
    storage: '256GB',
    color: 'Phantom Black',
    description: 'Like-new Galaxy S23 with exceptional camera and display quality.'
  },
  {
    id: '8',
    name: 'iPhone 13',
    price: 22900,
    image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c9?w=400&h=300&fit=crop',
    brand: 'Apple',
    condition: 'used',
    storage: '128GB',
    color: 'Pink',
    description: 'Certified pre-owned iPhone 13 in excellent condition with full warranty.'
  },
  {
    id: '9',
    name: 'Google Pixel 7 Pro',
    price: 18900,
    image: 'https://images.unsplash.com/photo-1607936854279-55e8f4bc0991?w=400&h=300&fit=crop',
    brand: 'Google',
    condition: 'used',
    storage: '256GB',
    color: 'Snow',
    description: 'Premium Pixel experience with computational photography and clean Android.'
  },
  {
    id: '10',
    name: 'Samsung Galaxy Note 20 Ultra',
    price: 16900,
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop',
    brand: 'Samsung',
    condition: 'used',
    storage: '256GB',
    color: 'Mystic Bronze',
    description: 'Productivity powerhouse with S Pen and large display, great for work and creativity.'
  },
  {
    id: '11',
    name: 'iPhone 12 Pro Max',
    price: 24900,
    image: 'https://images.unsplash.com/photo-1605236453806-b25e5d736cd4?w=400&h=300&fit=crop',
    brand: 'Apple',
    condition: 'used',
    storage: '256GB',
    color: 'Pacific Blue',
    description: 'Large screen iPhone with pro cameras and 5G connectivity, excellent condition.'
  },
  {
    id: '12',
    name: 'Xiaomi 13 Pro',
    price: 17900,
    image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop',
    brand: 'Xiaomi',
    condition: 'used',
    storage: '256GB',
    color: 'Ceramic White',
    description: 'High-end Xiaomi with Leica cameras and premium ceramic build quality.'
  },
  
  // Additional New Phones
  {
    id: '13',
    name: 'iPhone 15',
    price: 32900,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=300&fit=crop',
    brand: 'Apple',
    condition: 'new',
    storage: '128GB',
    color: 'Blue',
    description: 'Latest iPhone with USB-C, improved cameras, and A16 Bionic chip.'
  },
  {
    id: '14',
    name: 'Samsung Galaxy A54',
    price: 13900,
    image: 'https://images.unsplash.com/photo-1610792516307-ea5aad48cdf1?w=400&h=300&fit=crop',
    brand: 'Samsung',
    condition: 'new',
    storage: '128GB',
    color: 'Lime',
    description: 'Mid-range powerhouse with excellent camera and display quality.'
  },
  {
    id: '15',
    name: 'Nothing Phone 2',
    price: 21900,
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=300&fit=crop',
    brand: 'Nothing',
    condition: 'new',
    storage: '256GB',
    color: 'White',
    description: 'Unique transparent design with innovative Glyph interface.'
  },
  {
    id: '16',
    name: 'Oppo Find X6 Pro',
    price: 26900,
    image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=300&fit=crop',
    brand: 'Oppo',
    condition: 'new',
    storage: '256GB',
    color: 'Gold',
    description: 'Premium flagship with exceptional portrait photography capabilities.'
  },
  {
    id: '17',
    name: 'Vivo X90 Pro',
    price: 25900,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
    brand: 'Vivo',
    condition: 'new',
    storage: '256GB',
    color: 'Red',
    description: 'Photography-focused flagship with Zeiss optics and V2 chip.'
  },
  {
    id: '18',
    name: 'Realme GT 3',
    price: 18900,
    image: 'https://images.unsplash.com/photo-1607936854279-55e8f4bc0991?w=400&h=300&fit=crop',
    brand: 'Realme',
    condition: 'new',
    storage: '256GB',
    color: 'White',
    description: 'Gaming-focused phone with 240W fast charging technology.'
  },
  
  // Additional Used Phones
  {
    id: '19',
    name: 'iPhone 11 Pro',
    price: 18900,
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=300&fit=crop',
    brand: 'Apple',
    condition: 'used',
    storage: '256GB',
    color: 'Midnight Green',
    description: 'Triple camera system with excellent battery life, great condition.'
  },
  {
    id: '20',
    name: 'Samsung Galaxy S22',
    price: 16900,
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop',
    brand: 'Samsung',
    condition: 'used',
    storage: '128GB',
    color: 'Phantom White',
    description: 'Compact flagship with powerful performance and great cameras.'
  },
  {
    id: '21',
    name: 'OnePlus 11',
    price: 19900,
    image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop',
    brand: 'OnePlus',
    condition: 'used',
    storage: '256GB',
    color: 'Titan Black',
    description: 'Fast performance with OxygenOS and excellent build quality.'
  },
  {
    id: '22',
    name: 'Xiaomi 12 Pro',
    price: 15900,
    image: 'https://images.unsplash.com/photo-1605236453806-b25e5d736cd4?w=400&h=300&fit=crop',
    brand: 'Xiaomi',
    condition: 'used',
    storage: '256GB',
    color: 'Blue',
    description: 'High-end features at competitive price with MIUI 13.'
  },
  {
    id: '23',
    name: 'Google Pixel 6 Pro',
    price: 14900,
    image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c9?w=400&h=300&fit=crop',
    brand: 'Google',
    condition: 'used',
    storage: '128GB',
    color: 'Stormy Black',
    description: 'Tensor chip with amazing computational photography features.'
  },
  {
    id: '24',
    name: 'Oppo Reno 8 Pro',
    price: 12900,
    image: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=400&h=300&fit=crop',
    brand: 'Oppo',
    condition: 'used',
    storage: '256GB',
    color: 'Green',
    description: 'Stylish design with excellent selfie camera and fast charging.'
  },
  {
    id: '25',
    name: 'Vivo V27 Pro',
    price: 11900,
    image: 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b5?w=400&h=300&fit=crop',
    brand: 'Vivo',
    condition: 'used',
    storage: '256GB',
    color: 'Purple',
    description: 'Portrait photography specialist with color-changing design.'
  },
  {
    id: '26',
    name: 'iPhone SE 3rd Gen',
    price: 13900,
    image: 'https://images.unsplash.com/photo-1696446702171-359c44e78834?w=400&h=300&fit=crop',
    brand: 'Apple',
    condition: 'used',
    storage: '128GB',
    color: 'Starlight',
    description: 'Compact iPhone with A15 Bionic chip and Touch ID.'
  },
  {
    id: '27',
    name: 'Samsung Galaxy A73',
    price: 10900,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=300&fit=crop',
    brand: 'Samsung',
    condition: 'used',
    storage: '256GB',
    color: 'Mint',
    description: 'Large display with versatile camera system and long battery life.'
  },
  {
    id: '28',
    name: 'Realme 10 Pro+',
    price: 9900,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
    brand: 'Realme',
    condition: 'used',
    storage: '128GB',
    color: 'Dark Matter',
    description: 'Curved display with good performance and attractive design.'
  },
  // Test Product
  {
    id: 'test-1',
    name: 'สินค้าทดสอบระบบชำระเงิน',
    price: 1,
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=300&fit=crop',
    brand: 'Test',
    condition: 'new',
    storage: 'N/A',
    color: 'Test',
    description: 'สินค้าจำลองสำหรับทดสอบระบบชำระเงิน ราคา 1 บาท'
  }
];

// Helper functions
export const getProductsByCondition = (condition: 'new' | 'used'): Product[] => {
  return sampleProducts.filter(product => product.condition === condition);
};

export const getProductsByBrand = (brand: string): Product[] => {
  return sampleProducts.filter(product => 
    product.brand.toLowerCase() === brand.toLowerCase()
  );
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return sampleProducts.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.brand.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery)
  );
};

export const getProductById = (id: string): Product | undefined => {
  return sampleProducts.find(product => product.id === id);
};