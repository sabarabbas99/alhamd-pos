export const INITIAL_SETTINGS = {
  storeName: 'Alhamd Super Store',
  tagline: 'Karyāna & General Store',
  phone: '0300-1234567',
  whatsapp: '03001234567',
  address: 'Main Bazaar, Mohalla Karyāna Market',
  receiptNote: 'Tashreef aawri ka shukriya! Sauda tabdeel ya wapis 3 din me ba-shart-e-parchi.',
  printerWidth: '58mm', // '58mm' or '80mm'
};

export const INITIAL_CATEGORIES = [
  'All',
  'Oil & Ghee',
  'Daalein & Chawal',
  'Chai & Doodh',
  'Masalay',
  'Soap & Surf',
  'Biscuits & Snacks',
  'Beverages',
  'Miscellaneous'
];

export const INITIAL_PRODUCTS = [
  // Oil & Ghee
  { id: 'p1', name: 'Dalda Cooking Oil 1L Pouch', category: 'Oil & Ghee', barcode: '8961001001', purchasePrice: 480, salePrice: 520, stock: 24, minStock: 6, unit: 'pouch' },
  { id: 'p2', name: 'Dalda Banaspati Ghee 1kg Pouch', category: 'Oil & Ghee', barcode: '8961001002', purchasePrice: 490, salePrice: 530, stock: 18, minStock: 6, unit: 'pouch' },
  { id: 'p3', name: 'Sufi Banaspati Ghee 1kg', category: 'Oil & Ghee', barcode: '8961001003', purchasePrice: 470, salePrice: 510, stock: 4, minStock: 5, unit: 'pouch' }, // Low stock!
  { id: 'p4', name: 'Habib Cooking Oil 1L', category: 'Oil & Ghee', barcode: '8961001004', purchasePrice: 495, salePrice: 535, stock: 15, minStock: 5, unit: 'pouch' },
  
  // Daalein & Chawal
  { id: 'p5', name: 'Chini (Sugar) 1kg', category: 'Daalein & Chawal', barcode: '8962002001', purchasePrice: 140, salePrice: 155, stock: 85, minStock: 20, unit: 'kg' },
  { id: 'p6', name: 'Aata (Flour) Fine 10kg Bag', category: 'Daalein & Chawal', barcode: '8962002002', purchasePrice: 1100, salePrice: 1220, stock: 12, minStock: 4, unit: 'bag' },
  { id: 'p7', name: 'Super Basmati Rice (Chawal) 1kg', category: 'Daalein & Chawal', barcode: '8962002003', purchasePrice: 310, salePrice: 360, stock: 40, minStock: 10, unit: 'kg' },
  { id: 'p8', name: 'Dal Chana (Chickpeas) 1kg', category: 'Daalein & Chawal', barcode: '8962002004', purchasePrice: 240, salePrice: 280, stock: 3, minStock: 6, unit: 'kg' }, // Low stock!
  { id: 'p9', name: 'Dal Moong Dhuli 1kg', category: 'Daalein & Chawal', barcode: '8962002005', purchasePrice: 280, salePrice: 320, stock: 15, minStock: 5, unit: 'kg' },
  { id: 'p10', name: 'Dal Masoor Sabut 1kg', category: 'Daalein & Chawal', barcode: '8962002006', purchasePrice: 290, salePrice: 340, stock: 12, minStock: 5, unit: 'kg' },
  { id: 'p11', name: 'Safaid Chanay (Kabuli) 1kg', category: 'Daalein & Chawal', barcode: '8962002007', purchasePrice: 330, salePrice: 380, stock: 2, minStock: 5, unit: 'kg' }, // Low stock!

  // Chai & Doodh
  { id: 'p12', name: 'Tapal Danedar Tea 430g', category: 'Chai & Doodh', barcode: '8963003001', purchasePrice: 650, salePrice: 710, stock: 20, minStock: 5, unit: 'pack' },
  { id: 'p13', name: 'Lipton Yellow Label 380g', category: 'Chai & Doodh', barcode: '8963003002', purchasePrice: 620, salePrice: 680, stock: 14, minStock: 4, unit: 'pack' },
  { id: 'p14', name: 'EveryDay Dry Milk Powder 375g', category: 'Chai & Doodh', barcode: '8963003003', purchasePrice: 530, salePrice: 580, stock: 16, minStock: 4, unit: 'pack' },
  { id: 'p15', name: 'Olpers Milk 1 Litre Tetra Pack', category: 'Chai & Doodh', barcode: '8963003004', purchasePrice: 260, salePrice: 285, stock: 36, minStock: 12, unit: 'pack' },
  { id: 'p16', name: 'MilkPak 1 Litre Tetra Pack', category: 'Chai & Doodh', barcode: '8963003005', purchasePrice: 260, salePrice: 285, stock: 3, minStock: 12, unit: 'pack' }, // Low stock!

  // Masalay
  { id: 'p17', name: 'National Biryani Masala Double Pack', category: 'Masalay', barcode: '8964004001', purchasePrice: 110, salePrice: 130, stock: 45, minStock: 10, unit: 'pack' },
  { id: 'p18', name: 'Shan Chicken Biryani Masala', category: 'Masalay', barcode: '8964004002', purchasePrice: 115, salePrice: 135, stock: 38, minStock: 10, unit: 'pack' },
  { id: 'p19', name: 'Surkh Mirch Powder (Red Chilli) 200g', category: 'Masalay', barcode: '8964004003', purchasePrice: 190, salePrice: 230, stock: 22, minStock: 5, unit: 'pack' },
  { id: 'p20', name: 'Haldi Powder (Turmeric) 200g', category: 'Masalay', barcode: '8964004004', purchasePrice: 160, salePrice: 195, stock: 18, minStock: 5, unit: 'pack' },
  { id: 'p21', name: 'National Namak (Salt) 800g', category: 'Masalay', barcode: '8964004005', purchasePrice: 55, salePrice: 70, stock: 50, minStock: 15, unit: 'pack' },

  // Soap & Surf
  { id: 'p22', name: 'Surf Excel Washing Powder 1kg', category: 'Soap & Surf', barcode: '8965005001', purchasePrice: 540, salePrice: 590, stock: 25, minStock: 6, unit: 'pack' },
  { id: 'p23', name: 'Ariel Complete Washing Powder 1kg', category: 'Soap & Surf', barcode: '8965005002', purchasePrice: 550, salePrice: 600, stock: 20, minStock: 6, unit: 'pack' },
  { id: 'p24', name: 'Bonus Tristar Detergent 1kg', category: 'Soap & Surf', barcode: '8965005003', purchasePrice: 270, salePrice: 300, stock: 35, minStock: 8, unit: 'pack' },
  { id: 'p25', name: 'Lux Beauty Soap 140g', category: 'Soap & Surf', barcode: '8965005004', purchasePrice: 135, salePrice: 155, stock: 40, minStock: 10, unit: 'bar' },
  { id: 'p26', name: 'Lifebuoy Total Soap 130g', category: 'Soap & Surf', barcode: '8965005005', purchasePrice: 120, salePrice: 140, stock: 2, minStock: 8, unit: 'bar' }, // Low stock!
  { id: 'p27', name: 'Vim Dishwash Bar Large', category: 'Soap & Surf', barcode: '8965005006', purchasePrice: 75, salePrice: 90, stock: 28, minStock: 8, unit: 'bar' },

  // Biscuits & Snacks
  { id: 'p28', name: 'Sooper Biscuit Family Pack', category: 'Biscuits & Snacks', barcode: '8966006001', purchasePrice: 110, salePrice: 130, stock: 30, minStock: 8, unit: 'pack' },
  { id: 'p29', name: 'Rio Biscuit Strawberry Half Roll', category: 'Biscuits & Snacks', barcode: '8966006002', purchasePrice: 42, salePrice: 50, stock: 45, minStock: 10, unit: 'pack' },
  { id: 'p30', name: 'Lays Masala Large', category: 'Biscuits & Snacks', barcode: '8966006003', purchasePrice: 85, salePrice: 100, stock: 22, minStock: 6, unit: 'pack' },

  // Beverages
  { id: 'p31', name: 'Coca Cola 1.5 Litre Bottle', category: 'Beverages', barcode: '8967007001', purchasePrice: 165, salePrice: 190, stock: 24, minStock: 6, unit: 'bottle' },
  { id: 'p32', name: 'Sprite 1.5 Litre Bottle', category: 'Beverages', barcode: '8967007002', purchasePrice: 165, salePrice: 190, stock: 18, minStock: 6, unit: 'bottle' },
];

export const INITIAL_CUSTOMERS = [
  {
    id: 'c1',
    name: 'Chaudhry Rashid',
    phone: '03009876543',
    address: 'Makan # 45, Gali # 3',
    balance: 3450, // Udhaar due
    history: [
      { date: '2026-09-28', type: 'bill', billNo: 'INV-1001', amount: 2450, note: 'Ration Saman (Chini, Aata, Ghee)' },
      { date: '2026-09-30', type: 'payment', amount: 1000, note: 'Cash Wasooli' },
      { date: '2026-10-01', type: 'bill', billNo: 'INV-1014', amount: 2000, note: 'Surf, Soap aur Chai' }
    ]
  },
  {
    id: 'c2',
    name: 'Haji Aslam Sahab',
    phone: '03124567890',
    address: 'Near Jamia Masjid',
    balance: 1820,
    history: [
      { date: '2026-09-29', type: 'bill', billNo: 'INV-1005', amount: 1820, note: 'Ghee 2kg + Daal Chana' }
    ]
  },
  {
    id: 'c3',
    name: 'Bhai Kamran (Tailor)',
    phone: '03217654321',
    address: 'Tailor Shop, Market Chawk',
    balance: 950,
    history: [
      { date: '2026-10-01', type: 'bill', billNo: 'INV-1022', amount: 950, note: 'Chai Patti aur Doodh' }
    ]
  },
  {
    id: 'c4',
    name: 'Master Tariq',
    phone: '03331122334',
    address: 'School Wali Gali',
    balance: 0, // Cleared
    history: [
      { date: '2026-09-25', type: 'bill', billNo: 'INV-0985', amount: 3200, note: 'Mahana Ration' },
      { date: '2026-09-30', type: 'payment', amount: 3200, note: 'Poora Hisaab Clear Kiya' }
    ]
  }
];

export const INITIAL_INVOICES = [
  {
    id: 'INV-1040',
    date: '2026-10-02 11:30 AM',
    customerName: 'Walk-in Customer',
    customerId: null,
    paymentMode: 'cash',
    items: [
      { name: 'Dalda Cooking Oil 1L Pouch', price: 520, qty: 2, total: 1040 },
      { name: 'Chini (Sugar) 1kg', price: 155, qty: 3, total: 465 },
      { name: 'Tapal Danedar Tea 430g', price: 710, qty: 1, total: 710 }
    ],
    subtotal: 2215,
    discount: 15,
    grandTotal: 2200,
    paidAmount: 2200,
    profit: 260
  }
];