import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload, Smartphone, DollarSign, Package } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { z } from 'zod';

const sellFormSchema = z.object({
  brand: z.string().min(1, "Brand is required").max(50, "Brand must be less than 50 characters"),
  model: z.string().min(1, "Model is required").max(100, "Model must be less than 100 characters"),
  condition: z.enum(['new', 'excellent', 'good', 'fair'], { required_error: "Condition is required" }),
  price: z.string().min(1, "Price is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 999999,
    "Price must be a positive number up to 999,999"
  ),
  storage: z.string().max(20).optional(),
  color: z.string().max(50).optional(),
  description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
  contactEmail: z.string().min(1, "Email is required").email("Invalid email address").max(255),
  contactPhone: z.string().max(20, "Phone number must be less than 20 characters").optional()
});

const Sell: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    condition: '',
    price: '',
    storage: '',
    color: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    images: [] as File[]
  });

  const brands = [
    'Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 
    'Sony', 'LG', 'Motorola', 'Nokia', 'Other'
  ];

  const conditions = [
    { value: 'new', label: 'Brand New' },
    { value: 'excellent', label: 'Excellent (Like New)' },
    { value: 'good', label: 'Good (Minor Wear)' },
    { value: 'fair', label: 'Fair (Noticeable Wear)' }
  ];

  const storageOptions = [
    '64GB', '128GB', '256GB', '512GB', '1TB'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files].slice(0, 5) }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      const validationResult = sellFormSchema.safeParse({
        brand: formData.brand,
        model: formData.model,
        condition: formData.condition,
        price: formData.price,
        storage: formData.storage || undefined,
        color: formData.color || undefined,
        description: formData.description || undefined,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone || undefined
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: firstError.message,
        });
        setIsSubmitting(false);
        return;
      }

      // Validate images
      if (formData.images.length === 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please upload at least one image",
        });
        setIsSubmitting(false);
        return;
      }

      // Validate image sizes (max 5MB each)
      const maxSize = 5 * 1024 * 1024; // 5MB
      const oversizedImage = formData.images.find(img => img.size > maxSize);
      if (oversizedImage) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Each image must be less than 5MB",
        });
        setIsSubmitting(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Success!",
        description: "Your smartphone listing has been submitted for review. We'll contact you within 24 hours.",
      });

      // Reset form
      setFormData({
        brand: '',
        model: '',
        condition: '',
        price: '',
        storage: '',
        color: '',
        description: '',
        contactEmail: '',
        contactPhone: '',
        images: []
      });

      // Redirect to shop page
      setTimeout(() => navigate('/shop'), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.brand && formData.model && formData.condition && 
                     formData.price && formData.contactEmail;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {t('sellYourPhone')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('sellDesc')}
            </p>
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center hover-lift">
              <CardHeader>
                <DollarSign className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">{t('bestPrices')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('bestPricesDesc')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover-lift">
              <CardHeader>
                <Package className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">{t('freePickup')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('freePickupDesc')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover-lift">
              <CardHeader>
                <Smartphone className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">{t('quickProcess')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('quickProcessDesc')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('deviceInfo')}</CardTitle>
              <CardDescription>
                {t('deviceInfoDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Device Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="brand">{t('brand')} *</Label>
                    <Select value={formData.brand} onValueChange={(value) => handleInputChange('brand', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('language') === 'th' ? 'เลือกยี่ห้อ' : 'Select brand'} />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map(brand => (
                          <SelectItem key={brand} value={brand.toLowerCase()}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="model">{t('model')} *</Label>
                    <Input
                      id="model"
                      placeholder={t('language') === 'th' ? 'เช่น iPhone 15 Pro, Galaxy S24' : 'e.g., iPhone 15 Pro, Galaxy S24'}
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="condition">{t('condition')} *</Label>
                    <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('language') === 'th' ? 'เลือกสภาพ' : 'Select condition'} />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map(condition => (
                          <SelectItem key={condition.value} value={condition.value}>
                            {condition.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="storage">{t('storageSell')}</Label>
                    <Select value={formData.storage} onValueChange={(value) => handleInputChange('storage', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('language') === 'th' ? 'เลือกความจุ' : 'Select storage'} />
                      </SelectTrigger>
                      <SelectContent>
                        {storageOptions.map(storage => (
                          <SelectItem key={storage} value={storage.toLowerCase()}>
                            {storage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="color">{t('colorSell')}</Label>
                    <Input
                      id="color"
                      placeholder={t('language') === 'th' ? 'เช่น Space Black, White' : 'e.g., Space Black, White'}
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">{t('expectedPrice')} *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder={t('language') === 'th' ? 'กรอกราคาที่คาดหวัง' : 'Enter expected price'}
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">{t('descSell')}</Label>
                  <Textarea
                    id="description"
                    placeholder={t('language') === 'th' ? 'อธิบายสภาพ อุปกรณ์เสริมที่มีพร้อม กล่องเดิม ฯลฯ' : 'Describe the condition, any accessories included, original box, etc.'}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Images */}
                <div>
                  <Label>{t('language') === 'th' ? 'รูปภาพอุปกรณ์ (สูงสุด 5 ภาพ)' : 'Device Photos (Max 5)'}</Label>
                  <div className="mt-2">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">{t('language') === 'th' ? 'คลิกเพื่ออัปโหลด' : 'Click to upload'}</span> {t('language') === 'th' ? 'รูปภาพอุปกรณ์' : 'device photos'}
                          </p>
                          <p className="text-xs text-muted-foreground">{t('language') === 'th' ? 'PNG, JPG หรือ JPEG (สูงสุด 5 ไฟล์)' : 'PNG, JPG or JPEG (MAX. 5 files)'}</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={formData.images.length >= 5}
                        />
                      </label>
                    </div>
                    
                    {formData.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {formData.images.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={() => removeImage(index)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">{t('contactSell')}</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="contactEmail">{t('emailSell')} *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder={t('language') === 'th' ? 'your.email@example.com' : 'your.email@example.com'}
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="contactPhone">{t('phoneSell')}</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        placeholder="+66 12 345 6789"
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={!isFormValid || isSubmitting}
                  >
                    {isSubmitting ? (t('language') === 'th' ? 'กำลังส่ง...' : 'Submitting...') : (t('language') === 'th' ? 'ส่งเพื่อประเมินราคา' : 'Submit for Evaluation')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/shop')}
                  >
                    {t('cancel')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Sell;