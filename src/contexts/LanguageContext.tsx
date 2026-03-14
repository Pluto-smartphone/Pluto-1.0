import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'th';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    home: 'Home',
    shop: 'Shop',
    sell: 'Sell',
    about: 'About',
    contact: 'Contact',
    
    // Products
    firstHand: 'New Phones',
    secondHand: 'Used Phones',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    new: 'New',
    used: 'Used',
    
    // Cart
    cart: 'Cart',
    checkout: 'Checkout',
    total: 'Total',
    items: 'items',
    wishlist: 'Wishlist',
    clearCart: 'Clear Cart',
    orderSummary: 'Order Summary',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'Free',
    tax: 'Tax',
    continueShopping: 'Continue Shopping',
    cartEmpty: 'Your cart is empty',
    startShopping: 'Start shopping and add some products to your cart',
    wishlistEmpty: 'Your wishlist is empty',
    addToWishlist: 'Add some products you love to your wishlist',
    
    // Hero
    heroTitle: 'Premium Smartphones at Unbeatable Prices',
    heroSubtitle: 'Discover the latest and greatest smartphones. New and certified pre-owned devices with warranty.',
    shopNow: 'Shop Now',
    nowOpen: '🔥 Now Open!',
    learnMore: 'Learn More',
    happyCustomers: '50,000+ Happy Customers',
    
    // Features
    qualityGuarantee: 'Quality Guarantee',
    qualityDesc: 'Every product is quality tested',
    freeShipping: 'Free Shipping',
    freeShippingDesc: 'Free delivery nationwide',
    support247: '24/7 Support',
    supportDesc: 'Round-the-clock assistance',
    
    // Shop
    featuredProducts: 'Featured Products',
    featuredDesc: 'Handpicked premium smartphones from top brands',
    viewAll: 'View All',
    priceRange: 'Price Range',
    allPrices: 'All Prices',
    allBrands: 'All Brands',
    noProducts: 'No products found',
    shopDesc: 'Discover premium smartphones from top brands, both new and pre-owned',
    
    // Product Details
    back: 'Back',
    specifications: 'Specifications',
    descProduct: 'Description',
    features: 'Features',
    
    // Sort Options
    sortName: 'Name',
    sortPriceLow: 'Price: Low to High',
    sortPriceHigh: 'Price: High to Low',
    sortBrand: 'Brand',
    
    // CTA
    readyToShop: 'Ready to Find Your Dream Smartphone?',
    readyToShopDesc: 'Start shopping today and discover the perfect smartphone for your needs',
    startShoppingBtn: 'Start Shopping',
    
    // Payment
    payment: 'Payment',
    paymentSuccess: 'Payment Successful',
    paymentFailed: 'Payment Failed',
    verifying: 'Verifying payment...',
    paymentError: 'Payment verification failed',
    returnToCart: 'Return to Cart',
    orderComplete: 'Order Complete!',
    thankYou: 'Thank you for your purchase!',
    orderNumber: 'Order Number',
    continueShoppingBtn: 'Continue Shopping',
    goHome: 'Go to Home',
    
    // Common
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    price: 'Price',
    condition: 'Condition',
    brand: 'Brand',
    or: 'or',
    submit: 'Submit',
    cancel: 'Cancel',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Sell Page
    sellYourPhone: 'Sell Your Smartphone to Pluto',
    sellDesc: 'Get the best value for your device. Fill out the form below and we will provide you with a competitive quote within 24 hours.',
    bestPrices: 'Best Prices',
    bestPricesDesc: 'We offer competitive prices based on current market value',
    freePickup: 'Free Pickup',
    freePickupDesc: 'We will arrange free pickup from your location',
    quickProcess: 'Quick Process',
    quickProcessDesc: 'Fast evaluation and payment within 24-48 hours',
    deviceInfo: 'Device Information',
    deviceInfoDesc: 'Please provide detailed information about your smartphone',
    model: 'Model',
    storageSell: 'Storage',
    colorSell: 'Color',
    expectedPrice: 'Expected Price (THB)',
    descSell: 'Description',
    contactSell: 'Contact Information',
    emailSell: 'Email',
    phoneSell: 'Phone Number',
    
    // About Page
    aboutPluto: 'About Pluto',
    aboutDesc: 'Pluto is a trusted online smartphone marketplace serving customers across Thailand. We provide high-quality new and pre-owned smartphones at fair prices with exceptional service.',
    ourMission: 'Our Mission',
    missionDesc: 'We are committed to making cutting-edge smartphone technology accessible to everyone by offering high-quality products, excellent service, and fair pricing to ensure our customers get the best experience possible.',
    whyChoose: 'Why Choose Pluto?',
    technologyExperts: 'Technology Experts',
    expertsDesc: 'Expert team ready to provide consultation and assistance in product selection',
    userCommunity: 'User Community',
    communityDesc: 'Large user community ready to share experiences and provide recommendations',
    diverseProducts: 'Diverse Products',
    diverseDesc: 'Wide selection of smartphones from all major brands, both new and pre-owned',
    satisfiedCustomers: 'Satisfied Customers',
    productsInStock: 'Products in Stock',
    yearsExperience: 'Years of Experience',
    ourTeam: 'Our Team',
    teamDesc: 'Expert team of technology and customer service professionals ready to assist you 24/7',
    expertTeam: 'Expert Team',
    specialists: 'Technology and customer service specialists',
    contactAbout: 'Contact Information',
    businessHours: 'Business Hours',
    addressAbout: 'Address',
    faq: 'Frequently Asked Questions',
    warrantyQuestion: 'Do products come with warranty?',
    warrantyAnswer: 'New products come with manufacturer warranty, while used products have store warranty coverage.',
    shippingQuestion: 'How long does shipping take?',
    shippingAnswer: 'Delivery within 1-3 business days for Bangkok and 3-5 business days for other provinces.',
    sendMessage: 'Send us a Message',
    fullName: 'Full Name',
    subject: 'Subject',
    message: 'Message',
  },
  th: {
    // Navigation
    home: 'หน้าแรก',
    shop: 'ช็อป',
    sell: 'ขาย',
    about: 'เกี่ยวกับ',
    contact: 'ติดต่อ',
    
    // Products
    firstHand: 'มือถือใหม่',
    secondHand: 'มือถือมือสอง',
    addToCart: 'เพิ่มลงตะกร้า',
    buyNow: 'ซื้อเลย',
    new: 'ใหม่',
    used: 'มือสอง',
    
    // Cart
    cart: 'ตะกร้า',
    checkout: 'ชำระเงิน',
    total: 'รวม',
    items: 'รายการ',
    wishlist: 'รายการโปรด',
    clearCart: 'ล้างตะกร้า',
    orderSummary: 'สรุปคำสั่งซื้อ',
    subtotal: 'ยังไม่รวมภาษี',
    shipping: 'ค่าจัดส่ง',
    free: 'ฟรี',
    tax: 'ภาษี',
    continueShopping: 'ช็อปต่อ',
    cartEmpty: 'ตะกร้าของคุณว่างเปล่า',
    startShopping: 'เริ่มช็อปปิ้งและเพิ่มสินค้าลงในตะกร้าของคุณ',
    wishlistEmpty: 'รายการโปรดของคุณว่างเปล่า',
    addToWishlist: 'เพิ่มสินค้าที่คุณชอบลงในรายการโปรด',
    
    // Hero
    heroTitle: 'สมาร์ทโฟนพรีเมียมในราคาที่ดีที่สุด',
    heroSubtitle: 'ค้นพบสมาร์ทโฟนล่าสุดและดีที่สุด อุปกรณ์ใหม่และมือสองที่ผ่านการรับรองพร้อมประกัน',
    shopNow: 'ช็อปเลย',
    nowOpen: '🔥 เปิดใหม่!',
    learnMore: 'เรียนรู้เพิ่มเติม',
    happyCustomers: '50,000+ ลูกค้าพึงพอใจ',
    
    // Features
    qualityGuarantee: 'การรับประกันคุณภาพ',
    qualityDesc: 'สินค้าทุกชิ้นผ่านการตรวจสอบ',
    freeShipping: 'จัดส่งฟรี',
    freeShippingDesc: 'จัดส่งฟรีทั่วประเทศ',
    support247: 'บริการ 24/7',
    supportDesc: 'ให้บริการตลอด 24 ชั่วโมง',
    
    // Shop
    featuredProducts: 'สินค้าแนะนำ',
    featuredDesc: 'เลือกสรรสมาร์ทโฟนคุณภาพสูงจากแบรนด์ชั้นนำ',
    viewAll: 'ดูทั้งหมด',
    priceRange: 'ช่วงราคา',
    allPrices: 'ราคาทั้งหมด',
    allBrands: 'ยี่ห้อทั้งหมด',
    noProducts: 'ไม่พบสินค้า',
    shopDesc: 'ค้นพบสมาร์ทโฟนคุณภาพสูงจากแบรนด์ชั้นนำ ทั้งใหม่และมือสอง',
    
    // Product Details
    back: 'กลับ',
    specifications: 'ข้อมูลจำเพาะ',
    descProduct: 'รายละเอียด',
    features: 'คุณสมบัติ',
    
    // Sort Options
    sortName: 'ชื่อ',
    sortPriceLow: 'ราคา: ต่ำไปสูง',
    sortPriceHigh: 'ราคา: สูงไปต่ำ',
    sortBrand: 'ยี่ห้อ',
    
    // CTA
    readyToShop: 'พร้อมหาสมาร์ทโฟนในฝันแล้วหรือยัง?',
    readyToShopDesc: 'เริ่มช็อปปิ้งวันนี้และค้นพบสมาร์ทโฟนที่เหมาะกับคุณที่สุด',
    startShoppingBtn: 'เริ่มช็อปปิ้ง',
    
    // Payment
    payment: 'การชำระเงิน',
    paymentSuccess: 'ชำระเงินสำเร็จ',
    paymentFailed: 'ชำระเงินไม่สำเร็จ',
    verifying: 'กำลังตรวจสอบการชำระเงิน...',
    paymentError: 'การตรวจสอบการชำระเงินล้มเหลว',
    returnToCart: 'กลับไปที่ตะกร้า',
    orderComplete: 'คำสั่งซื้อเสร็จสมบูรณ์!',
    thankYou: 'ขอบคุณสำหรับการสั่งซื้อ!',
    orderNumber: 'หมายเลขคำสั่งซื้อ',
    continueShoppingBtn: 'ช็อปต่อ',
    goHome: 'ไปหน้าแรก',
    
    // Common
    search: 'ค้นหา',
    filter: 'กรอง',
    sort: 'เรียง',
    price: 'ราคา',
    condition: 'สภาพ',
    brand: 'ยี่ห้อ',
    or: 'หรือ',
    submit: 'ส่ง',
    cancel: 'ยกเลิก',
    loading: 'กำลังโหลด...',
    error: 'เกิดข้อผิดพลาด',
    success: 'สำเร็จ',
    
    // Sell Page
    sellYourPhone: 'ขายสมาร์ทโฟนของคุณกับ Pluto',
    sellDesc: 'รับราคาที่ดีที่สุดสำหรับอุปกรณ์ของคุณ กรอกแบบฟอร์มด้านล่างและเราจะให้ราคากับคุณภายใน 24 ชั่วโมง',
    bestPrices: 'ราคาดีที่สุด',
    bestPricesDesc: 'เรามีราคาที่แข่งขันได้ตามมูลค่าตลาดปัจจุบัน',
    freePickup: 'รับสินค้าฟรี',
    freePickupDesc: 'เราจะจัดการรับสินค้าฟรีจากที่ของคุณ',
    quickProcess: 'กระบวนการรวดเร็ว',
    quickProcessDesc: 'ประเมินและจ่ายเงินรวดเร็วภายใน 24-48 ชั่วโมง',
    deviceInfo: 'ข้อมูลอุปกรณ์',
    deviceInfoDesc: 'กรุณาระบุข้อมูลรายละเอียดเกี่ยวกับสมาร์ทโฟนของคุณ',
    model: 'รุ่น',
    storageSell: 'ความจุ',
    colorSell: 'สี',
    expectedPrice: 'ราคาที่คาดหวัง (บาท)',
    descSell: 'รายละเอียด',
    contactSell: 'ข้อมูลติดต่อ',
    emailSell: 'อีเมล',
    phoneSell: 'เบอร์โทรศัพท์',
    
    // About Page
    aboutPluto: 'เกี่ยวกับ Pluto',
    aboutDesc: 'Pluto คือแพลตฟอร์มซื้อขายสมาร์ทโฟนออนไลน์ที่ได้รับความไว้วางใจจากลูกค้าทั่วประเทศไทย เราให้บริการสมาร์ทโฟนคุณภาพสูงทั้งใหม่และมือสองในราคาที่เป็นธรรม',
    ourMission: 'พันธกิจของเรา',
    missionDesc: 'เราตั้งใจที่จะทำให้เทคโนโลยีสมาร์ทโฟนที่ทันสมัยเข้าถึงได้ง่ายสำหรับทุกคน ด้วยการนำเสนอผลิตภัณฑ์คุณภาพสูง บริการที่เป็นเลิศ และราคาที่เป็นธรรม',
    whyChoose: 'ทำไมต้องเลือก Pluto?',
    technologyExperts: 'ผู้เชี่ยวชาญด้านเทคโนโลยี',
    expertsDesc: 'ทีมงานผู้เชี่ยวชาญพร้อมให้คำปรึกษาและช่วยเหลือในการเลือกสินค้า',
    userCommunity: 'ชุมชนผู้ใช้งาน',
    communityDesc: 'ชุมชนผู้ใช้งานขนาดใหญ่ที่พร้อมแบ่งปันประสบการณ์และให้คำแนะนำ',
    diverseProducts: 'สินค้าหลากหลาย',
    diverseDesc: 'มีสมาร์ทโฟนให้เลือกมากมายจากทุกแบรนด์ดัง ทั้งใหม่และมือสอง',
    satisfiedCustomers: 'ลูกค้าที่พึงพอใจ',
    productsInStock: 'สินค้าในสต็อก',
    yearsExperience: 'ปีของประสบการณ์',
    ourTeam: 'ทีมงานของเรา',
    teamDesc: 'ทีมงานผู้เชี่ยวชาญด้านเทคโนโลยีและบริการลูกค้าที่พร้อมช่วยเหลือคุณตลอด 24 ชั่วโมง',
    expertTeam: 'ทีมผู้เชี่ยวชาญ',
    specialists: 'ผู้เชี่ยวชาญด้านเทคโนโลยีและบริการลูกค้า',
    contactAbout: 'ข้อมูลติดต่อ',
    businessHours: 'เวลาทำการ',
    addressAbout: 'ที่อยู่',
    faq: 'คำถามที่พบบ่อย',
    warrantyQuestion: 'สินค้ามีการรับประกันหรือไม่?',
    warrantyAnswer: 'สินค้าใหม่มีการรับประกันจากบริษัทผู้ผลิต ส่วนสินค้ามือสองมีการรับประกันจากร้านค้า',
    shippingQuestion: 'ใช้เวลาจัดส่งนานแค่ไหน?',
    shippingAnswer: 'จัดส่งภายใน 1-3 วันทำการสำหรับกรุงเทพฯ และ 3-5 วันทำการสำหรับต่างจังหวัด',
    sendMessage: 'ส่งข้อความถึงเรา',
    fullName: 'ชื่อ-นามสกุล',
    subject: 'หัวข้อ',
    message: 'ข้อความ',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('th');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};