export enum Sport {
  Baseball = 'Baseball',
  Basketball = 'Basketball',
  Hockey = 'Hockey',
  Running = 'Running',
  Gaming = 'Gaming',
  Soccer = 'Soccer',
}

export const sportsConfig = {
  Baseball: { neck: false, socks: true, shorts: false, pants: true },
  Basketball: { neck: false, socks: true, shorts: true, pants: false },
  Hockey: { neck: true, socks: true, shorts: true, pants: false },
  Running: { neck: false, socks: true, shorts: true, pants: false },
  Gaming: { neck: true, socks: true, shorts: true, pants: false },
  Soccer: { neck: true, socks: true, shorts: true, pants: false },
};

export const Materials = {
  Baseball: [
    {
      name: 'RDHL3138',
      image:
        'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Materials/Baseball/RD%20HL3138/IMG_5140-9wcKuwPhkkAvdbXCW3krlVKkpRjD5j.jpg',
    },
    {
      name: 'RDJQ5089 (+$2.99)',
      image:
        'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Materials/Baseball/RD%20JQ5089/IMG_5560-C9qjmqPr1O84bx42lD3FVsuh3ZcnpU.jpg',
    },
  ],
  Basketball: [
    {
      name: 'RDJQ3018',
      image:
        'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Materials/Basketball/RD%20JQ3018/IMG_5244-t8hEdNGNGFP9MHIi4WEmUn1Gm9xJt3.jpg',
    },
    {
      name: 'RDJQ3001 (+$2.99)',
      image:
        'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Materials/Basketball/RD%20JQ3001/IMG_5131-RmGZI6UQy7xj65VEblS44FgcGHAJ37.jpg',
    },
    {
      name: 'RDYX3024 (+$2.99)',
      image:
        'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Materials/Basketball/RD%20YX3024/IMG_5217-X5GP8crncCAbKuzb6F0J82QyhnL6Bu.jpg',
    },
  ],
  Gaming: [
    {
      name: 'RDCWT556',
      image:
        'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Materials/Gaming/RD%20CWT-556/IMG_5533-OyYqJIr93LOT7wmWPK9yHskz12ge4A.jpg',
    },
    {
      name: 'RDJQ3001 (+$2.99)',
      image:
        'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Materials/Gaming/RD%20JQ3001/IMG_5131-8miSoqRbLim8cGaueRrrKnEchIO7DA.jpg',
    },
    {
      name: 'RDJQ5089 (+$2.99)',
      image:
        'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Materials/Gaming/RD%20JQ5089/IMG_5560-MgCly2uJda1CXxwqBYRdapZDmttUtc.jpg',
    },
  ],
  Hockey: [
    {
      name: 'RDJQ3001',
      image:
        'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Materials/Hockey/RD%20JQ3001/IMG_5131-Crsn6lR6vCSuLpCPtfCghWnGlKBYq2.jpg',
    },
    {
      name: 'RDYX2034: (+$2.99)',
      image:
        'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Materials/Hockey/RD%20YX2034/IMG_5197-dAMFdO9hJFd6AH5QwziK3txaOO38Kb.jpg',
    },
    {
      name: 'RD08HT: (+$2.99)',
      image:
        'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Materials/Hockey/RD%2008HT/IMG_5160-UXGB1MtQNP4DdgU62IRAzZNQ5bZM9A.jpg',
    },
  ],
  Running: [
    {
      name: 'RDCWT556',
      image:
        'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Materials/Running/RD%20CWT-556/IMG_5533-oJhLmJEoLtvMnHQXjN0zJvWWE7bOT7.jpg',
    },
    {
      name: 'RDJQ3001 (+$2.99)',
      image:
        'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Materials/Running/RD%20JQ3001/IMG_5131-VR2JXlRCQlRSODJMGUyyDplfLtF221.jpg',
    },
    {
      name: 'RDJQ3018 (+$2.99)',
      image:
        'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Materials/Running/RD%20JQ3018/IMG_5244-DsqZk1CyiZZsasPRT1ykU6NQpcVOPk.jpg',
    },
  ],
  Soccer: [
    {
      name: 'RDCWT556',
      image:
        'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Materials/Soccer/RD%20CWT-556/IMG_5533-SQI0rGILc2cEtE7hkCgSo9glH8di4r.jpg',
    },
    {
      name: 'RDJQ3001 (+$2.99)',
      image:
        'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Materials/Soccer/RD%20JQ3001/IMG_5131-LZMY4jw0ORE6DGavHwGGVXqIvfWRx2.jpg',
    },
    {
      name: 'RDJQ5089 (+$2.99)',
      image:
        'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Materials/Soccer/RD%20JQ5089/IMG_5560-Vf9elkwytAjJzf28Qrbr84zZI6u5Po.jpg',
    },
  ],
};

export const Neck = [
  {
    name: 'Default',
    image:
      'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Necks/1--kkpMVScGCp2BrAdMiiXTOZp5S1koPj.png',
  },
  {
    name: 'Neck #2 (+$2.99)',
    image:
      'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Necks/2--tMJwR61nrHgpwcKLydZ6do6lVTwScN.png',
  },
  {
    name: 'Neck #3 (+$2.99)',
    image:
      'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Necks/3--FpN2rq7TXxCop3ZcgPkKI5lkNn6Xjt.png',
  },
  {
    name: 'Neck #4 (+$2.99)',
    image:
      'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Necks/polo-itnuJjevoNNi1j9OMZxIa7DFSNRu4O.png',
  },
];

export const defaultImage = {
  Basketball:
    'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Products/Default/basket-khDDtw6VHhzhOH45wgabr7hwwjbZQn.png',
  Baseball:
    'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Products/Default/beisbol-rcLfLr4mMeLpNin3FPUf5nMLfGryKk.png',
  Soccer:
    'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Products/Default/futbol-4HElqO6RihjLcLZ17Rb3IYSO9rzC2l.png',
  Gaming:
    'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Products/Default/gamer-GAFIDP2mm6dDwN5A4mDw06YoOivPgt.png',
  Hockey:
    'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Products/Default/hockey-l6vgwwLQSnpBr69O7eQYhlUsPT4cEc.png',
};

export const Socks = [
  {
    name: 'No Socks (+$0.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/no-socks-1-1.png',
  },
  {
    name: 'Purple (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-970ff2ff.png',
  },
  {
    name: 'Red (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-ff4858ff.png',
  },
  {
    name: 'White (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-ffffffff.png',
  },
  {
    name: 'Yellow (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-eaf205ff.png',
  },
  {
    name: 'Green (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-49d907ff.png',
  },
  {
    name: 'Orange (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-f24607ff.png',
  },
  {
    name: 'Pink (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-fc8dcaff.png',
  },
  {
    name: 'Brown (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-73513dff.png',
  },
  {
    name: 'Black (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-000000ff.png',
  },
  {
    name: 'Blue (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-3f858cff.png',
  },
  {
    name: 'Canary (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-f3b562ff.png',
  },
  {
    name: 'Persian Pink (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-f2508bff.png',
  },
  {
    name: 'Violet Eggplant (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-812b8cff.png',
  },
  {
    name: 'Blue Violet (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-5c58c7ff.png',
  },
  {
    name: 'Shiraz (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-a6035dff.png',
  },
  {
    name: 'Blue Navy (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-004294ff.png',
  },
  {
    name: 'Cosmic Green (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-02735eff.png',
  },
  {
    name: 'Mint (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-8fc1b5ff.png',
  },
  {
    name: 'Cyan (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-04c4d9ff-1.png',
  },
  {
    name: 'Tomato Red (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-d91a2aff-2.png',
  },
  {
    name: 'Lila (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-cb63ffff.png',
  },
  {
    name: 'Yellow Summer (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-f2d541ff.png',
  },
  {
    name: 'Orange Summer (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-f29422ff.png',
  },
  {
    name: 'Sand (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-d98162ff.png',
  },
  {
    name: 'Cappuccino (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-a6774eff.png',
  },
  {
    name: 'Coffee (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-593123ff.png',
  },
  {
    name: 'Volcano (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-bf1e0fff.png',
  },
  {
    name: 'Meat (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-731d1dff.png',
  },
  {
    name: 'Tutti Frutti (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-f23e2eff.png',
  },
  {
    name: 'Military Green (+$8.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/02/20x20-055902ff.png',
  },
];

export const Shorts = (sport: string) => {
  const shorts = [
    {
      name: 'Black (+$13.99)',
      image:
        'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/SHORTS_NEGRO-HnqIJKb07vfTyb5tLa9lfcNjIKDrzN.png',
    },
    {
      name: 'Red (+$13.99)',
      image:
        'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/SHORTS_ROJO-LcWAg4eqooJQCRywjZn3gT5A8zXtUU.png',
    },
    {
      name: 'Green (+$13.99)',
      image:
        'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/SHORTS_VERDE-LlY2F7N9ub9FhGMNC6SVWuYXDfCKEJ.png',
    },
    {
      name: 'White (+$13.99)',
      image:
        'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/SHORTS_BLANCO-yhVl7NABJAhwu95yF5M2OOrTAIhCAD.png',
    },
    {
      name: 'Blue (+$13.99)',
      image:
        'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/SHORTS_AZUL-y14X80vYqwcP7ZJ7KwWG7Rddq9fecR.png',
    },
    {
      name: 'Yellow (+$13.99)',
      image:
        'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/SHORTS_AMARILL-2QN9neWzqnlzVOftR3rO9zGdIlLrke.png',
    },
    {
      name: 'Lime (+$13.99)',
      image:
        'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/SHORTS_LIMA-ONF8fY62GVwuQlBI65Jh7tQZ5reK7v.png',
    },
  ];

  // Si el deporte es Hockey, "No Shorts" es gratis, los demás cuestan $13.99.
  // Si es otro deporte, "No Shorts" cuesta -$13.99 y los demás son gratis.
  if (sport === 'Hockey') {
    shorts.unshift({
      name: 'No Shorts (+$0.00)',
      image:
        'https://ideasjersey.com/wp-content/uploads/2024/01/240_F_616809410_J9aoPiy5GhsZYPXzDr2Cd0BHVBO8Rwtf-1.jpg',
    });
  } else {
    shorts.unshift({
      name: 'No Shorts (-$13.99)',
      image:
        'https://ideasjersey.com/wp-content/uploads/2024/01/240_F_616809410_J9aoPiy5GhsZYPXzDr2Cd0BHVBO8Rwtf-1.jpg',
    });

    // Hacemos que los demás shorts sean gratis
    shorts.forEach((short, index) => {
      if (index !== 0) short.name = short.name.replace('(+$13.99)', '(+$0.00)');
    });
  }

  return shorts; // Esto es importante para que la función devuelva el array
};

export const Pants = [
  {
    name: 'None (+$0.00)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/01/no-image-select-placeholder-100x100.png',
  },
  {
    name: 'Black Pants (+$39.99)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/01/WhatsApp-Image-2023-07-19-at-6.34.38-PM-3-100x100.jpeg',
  },
  {
    name: 'White Pants (+$39.99)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/01/WhatsApp-Image-2023-07-19-at-6.34.38-PM-2-150x150.jpeg',
  },
  {
    name: 'Blue Pants (+$39.99)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/01/WhatsApp-Image-2023-07-19-at-6.34.38-PM-1-150x150.jpeg',
  },
  {
    name: 'Red Pants (+$39.99)',
    image:
      'https://ideasjersey.com/wp-content/uploads/2024/01/WhatsApp-Image-2023-07-19-at-6.34.38-PM-150x150.jpeg',
  },
];

export const withOrWithoutShort: string[] = [
  'with shorts (+$0.00)',
  'without shorts (-$13.99)',
];

export const SizeGuide = {
  Baseball: {
    image1:
      'https://ideasjersey.com/wp-content/uploads/2024/02/tablas-pulgadas_baseball.png',
    image2: 'https://ideasjersey.com/wp-content/uploads/2024/02/BASEBALL-1.png',
  },
  Basketball: {
    image1:
      'https://ideasjersey.com/wp-content/uploads/2024/02/tablas-pulgadas_basket.png',
    image2: 'https://ideasjersey.com/wp-content/uploads/2024/02/BASKETBALL.png',
  },
  Gaming: {
    image1:
      'https://ideasjersey.com/wp-content/uploads/2024/02/tablas-pulgadas_gaming.png',
    image2: 'https://ideasjersey.com/wp-content/uploads/2024/02/GAMING-1.png',
  },
  Hockey: {
    image1:
      'https://ideasjersey.com/wp-content/uploads/2024/02/tablas-pulgadas_hockey.png',
    image2: 'https://ideasjersey.com/wp-content/uploads/2024/02/HOCKEY-1.png',
  },
  Running: {
    image1:
      'https://ideasjersey.com/wp-content/uploads/2024/02/tablas-pulgadas_running.png',
    image2: 'https://ideasjersey.com/wp-content/uploads/2024/02/RUNNING-1.png',
  },
  Soccer: {
    image1:
      'https://ideasjersey.com/wp-content/uploads/2024/02/tablas-pulgadas_soccer.png',
    // image2:
    //   'https://app.ideasjersey.com/wp-content/uploads/2023/12/Y0mQi1nnIGwqOLu8SKrGBaRafpjlO7FQJ8mgcdsPZek.png',
  },
};

export const ShippingTypes =
  'We take pride in creating all of our custom uniforms to order within 15 business days in China. Once your order has been shipped, our team will provide you with a tracking number. Since each uniform is made specifically for you, we cannot accept returns or exchanges.';

export const PaymentMethods = {
  text: "Secure payments worldwide. You can trust us with your credit card, whether you're in the USA or abroad.",
};

export const SizeType = [
  'XS-MEN',
  'S-MEN',
  'M-MEN',
  'L-MEN',
  'XL-MEN',
  '2XL-MEN',
  '3XL-MEN',
  '4-KIDS',
  '6-KIDS',
  '8-KIDS',
  '10-KIDS',
  '12-KIDS',
  '14-KIDS',
  '16-KIDS',
  'L6-WOMEN',
  'L8-WOMEN',
  'L10-WOMEN',
  'L12-WOMEN',
  'L14-WOMEN',
  'L16-WOMEN',
  'L18-WOMEN',
];
