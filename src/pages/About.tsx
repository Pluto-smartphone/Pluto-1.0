import React from 'react';
import { Shield, Award, Users, Smartphone, Mail, MapPin, Clock, Facebook, Instagram } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const LineIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
  </svg>
);

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61587945652923',
    icon: Facebook
  },
  {
    label: 'Line',
    href: 'https://lin.ee/7rN8H7B',
    icon: LineIcon
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/pluto.mobileshop/',
    icon: Instagram
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@pluto_station69?lang=en',
    icon: TikTokIcon
  }
];

const About: React.FC = () => {
  const { t, language } = useLanguage();
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
      title: language === 'th' ? 'สินค้ามีคุณภาพ' : t('diverseProducts'),
      description: language === 'th'
        ? 'มีสมาร์ทโฟนที่มีคุณภาพให้เลือกอย่างมากมาย ทั้งใหม่และมือสอง'
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

          <div className="max-w-5xl mx-auto">
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
                  <Card className="hover-lift min-w-0" style={{ animationDelay: '0.3s' }}>
                    <CardContent className="p-6">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Instagram className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="mb-3 font-semibold text-foreground">
                            {language === 'th' ? 'โซเชียลมีเดีย' : 'Social Media'}
                          </h4>
                          <div className="grid grid-cols-4 gap-3">
                            {socialLinks.map((social) => (
                              <a
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={social.label}
                                title={social.label}
                                className="flex aspect-square min-h-11 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              >
                                <social.icon className="h-5 w-5" />
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
