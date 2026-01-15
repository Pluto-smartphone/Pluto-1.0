// Minimal Thai administrative divisions dataset (sample). Replace/extend with full dataset as needed.
export type Subdistrict = { nameTh: string; nameEn: string; postalCode: string };
export type District = { nameTh: string; nameEn: string; subdistricts: Subdistrict[] };
export type Province = { nameTh: string; nameEn: string; districts: District[] };

export const thaiAddress: Province[] = [
  {
    nameTh: 'กรุงเทพมหานคร',
    nameEn: 'Bangkok',
    districts: [
      {
        nameTh: 'เขตปทุมวัน',
        nameEn: 'Pathum Wan',
        subdistricts: [
          { nameTh: 'ลุมพินี', nameEn: 'Lumphini', postalCode: '10330' },
          { nameTh: 'ปทุมวัน', nameEn: 'Pathum Wan', postalCode: '10330' },
          { nameTh: 'รองเมือง', nameEn: 'Rong Mueang', postalCode: '10330' },
          { nameTh: 'วังใหม่', nameEn: 'Wang Mai', postalCode: '10330' }
        ]
      },
      {
        nameTh: 'เขตคลองเตย',
        nameEn: 'Khlong Toei',
        subdistricts: [
          { nameTh: 'คลองตัน', nameEn: 'Khlong Tan', postalCode: '10110' },
          { nameTh: 'คลองตันเหนือ', nameEn: 'Khlong Tan Nuea', postalCode: '10110' },
          { nameTh: 'พระโขนง', nameEn: 'Phra Khanong', postalCode: '10110' }
        ]
      }
    ]
  },
  {
    nameTh: 'เชียงใหม่',
    nameEn: 'Chiang Mai',
    districts: [
      {
        nameTh: 'อำเภอเมืองเชียงใหม่',
        nameEn: 'Mueang Chiang Mai',
        subdistricts: [
          { nameTh: 'ศรีภูมิ', nameEn: 'Si Phum', postalCode: '50200' },
          { nameTh: 'พระสิงห์', nameEn: 'Phra Sing', postalCode: '50200' },
          { nameTh: 'สุเทพ', nameEn: 'Suthep', postalCode: '50200' }
        ]
      }
    ]
  }
];
