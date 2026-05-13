import React, { useState } from 'react';
import { Shield, Award, Users, Smartphone, Mail, MapPin, Clock, Send, MessageCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const About: React.FC = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject) {
      toast({
        title: language === 'th' ? 'เลือกหัวข้อ' : 'Select a subject',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-contact', {
        body: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
      });

      if (error) {
        const msg = (data as { error?: string })?.error || error.message;
        throw new Error(msg);
      }

      if ((data as { error?: string })?.error) {
        throw new Error((data as { error: string }).error);
      }

      toast({
        title: language === 'th' ? 'ส่งข้อความเรียบร้อยแล้ว' : 'Message sent',
        description:
          language === 'th'
            ? 'เราได้รับข้อความของคุณแล้ว จะติดต่อกลับทางอีเมล'
            : 'We received your message and will reply by email.',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: language === 'th' ? 'ส่งไม่สำเร็จ' : 'Could not send',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const features = [
    {
      icon: Shield,
      title: language === 'th' ? 'การรับประกันคุณภาพ' : t('qualityGuarantee'),
      description: language === 'th' 
        ? 'สินค้าทุกชิ้นผ่านการตรวจสอบคุณภาพอย่างเข้มงวดและมาพร้อมการรับประกัน'
        : t('qualityDesc')
    },
    {
      icon: Award,
      title: language === 'th' ? 'ผู้เชี่ยวชาญด้านเทคโนโลยี' : t('technologyExperts'),
      description: language === 'th'
        ? 'ทีมงานผู้เชี่ยวชาญพร้อมให้คำปรึกษาและช่วยเหลือในการเลือกสินค้า'
        : t('expertsDesc')
    },
    {
      icon: Users,
      title: language === 'th' ? 'ชุมชนผู้ใช้งาน' : t('userCommunity'),
      description: language === 'th'
        ? 'ชุมชนผู้ใช้งานขนาดใหญ่ที่พร้อมแบ่งปันประสบการณ์และให้คำแนะนำ'
        : t('communityDesc')
    },
    {
      icon: Smartphone,
      title: language === 'th' ? 'สินค้าหลากหลาย' : t('diverseProducts'),
      description: language === 'th'
        ? 'มีสมาร์ทโฟนให้เลือกมากมายจากทุกแบรนด์ดัง ทั้งใหม่และมือสอง'
        : t('diverseDesc')
    }
  ];

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t('aboutPluto')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('aboutDesc')}
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16 animate-slide-up">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 md:p-12">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                {t('ourMission')}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('missionDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            {t('whyChoose')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover-lift animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="animate-fade-in">
                <div className="text-4xl font-bold text-primary mb-2">50,000+</div>
                <p className="text-muted-foreground">
                  {t('satisfiedCustomers')}
                </p>
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
                <p className="text-muted-foreground">
                  {t('productsInStock')}
                </p>
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="text-4xl font-bold text-primary mb-2">5+</div>
                <p className="text-muted-foreground">
                  {t('yearsExperience')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            {t('ourTeam')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            {t('teamDesc')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover-lift">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {t('expertTeam')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('specialists')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div id="contact" className="scroll-mt-20">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('contact')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === 'th'
                ? 'มีคำถามหรือต้องการความช่วยเหลือ? ทีมงานของเราพร้อมให้บริการคุณ'
                : 'Have questions or need assistance? Our team is ready to help you.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="animate-slide-up">
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  {t('contactAbout')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    {
                      icon: Mail,
                      title: t('emailSell'),
                      content: 'pluto.th.business@gmail.com',
                      description: language === 'th' ? 'ตอบกลับภายใน 24 ชั่วโมง' : 'Reply within 24 hours'
                    },
                    {
                      icon: MapPin,
                      title: t('addressAbout'),
                      content: language === 'th' ? 'กรุงเทพมหานคร ประเทศไทย' : 'Bangkok, Thailand',
                      description: language === 'th' ? 'สำนักงานใหญ่' : 'Head Office'
                    },
                    {
                      icon: Clock,
                      title: t('businessHours'),
                      content: language === 'th' ? 'จันทร์-ศุกร์ 9:00-18:00' : 'Mon-Fri 9:00-18:00',
                      description: language === 'th' ? 'เสาร์-อาทิตย์ 10:00-16:00' : 'Sat-Sun 10:00-16:00'
                    }
                  ].map((info, index) => (
                    <Card key={index} className="hover-lift min-w-0" style={{ animationDelay: `${index * 0.1}s` }}>
                      <CardContent className="p-6">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <info.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="mb-1 font-semibold text-foreground">
                              {info.title}
                            </h4>
                            {info.icon === Mail ? (
                              <a
                                href={`mailto:${info.content}`}
                                className="mb-1 block break-all text-left text-sm font-medium text-primary underline-offset-2 hover:underline sm:text-base"
                              >
                                {info.content}
                              </a>
                            ) : (
                              <p className="mb-1 break-words text-primary font-medium [overflow-wrap:anywhere]">
                                {info.content}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                              {info.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* FAQ Section */}
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h4 className="text-xl font-bold text-foreground mb-4">
                  {t('faq')}
                </h4>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <h5 className="font-medium text-foreground mb-2">
                        {t('warrantyQuestion')}
                      </h5>
                      <p className="text-sm text-muted-foreground">
                        {t('warrantyAnswer')}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h5 className="font-medium text-foreground mb-2">
                        {t('shippingQuestion')}
                      </h5>
                      <p className="text-sm text-muted-foreground">
                        {t('shippingAnswer')}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    {t('sendMessage')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">
                          {t('fullName')}
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder={language === 'th' ? 'กรอกชื่อ-นามสกุล' : 'Enter your full name'}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">
                          {t('emailSell')}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder={language === 'th' ? 'กรอกอีเมล' : 'Enter your email'}
                          required
                        />
                      </div>
                    </div>

                      <div>
                        <Label htmlFor="subject">
                          {t('subject')}
                        </Label>
                      <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'th' ? 'เลือกหัวข้อ' : 'Select a subject'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">
                            {language === 'th' ? 'สอบถามทั่วไป' : 'General Inquiry'}
                          </SelectItem>
                          <SelectItem value="support">
                            {language === 'th' ? 'ขอความช่วยเหลือ' : 'Technical Support'}
                          </SelectItem>
                          <SelectItem value="order">
                            {language === 'th' ? 'สถานะคำสั่งซื้อ' : 'Order Status'}
                          </SelectItem>
                          <SelectItem value="return">
                            {language === 'th' ? 'การคืนสินค้า' : 'Product Return'}
                          </SelectItem>
                          <SelectItem value="partnership">
                            {language === 'th' ? 'ความร่วมมือ' : 'Partnership'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="message">
                        {t('message')}
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder={language === 'th' ? 'กรอกข้อความของคุณ...' : 'Enter your message...'}
                        rows={5}
                        required
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full gradient-primary shadow-red" disabled={isSending}>
                      {isSending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {language === 'th' ? 'ส่งข้อความ' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="mt-12 animate-slide-up">
            <Card>
              <CardContent className="p-0">
                <div className="h-64 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      {language === 'th' ? 'แผนที่สำนักงาน' : 'Office Location'}
                    </h4>
                    <p className="text-muted-foreground">
                      {language === 'th' ? 'กรุงเทพมหานคร ประเทศไทย' : 'Bangkok, Thailand'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
  );
};

export default About;