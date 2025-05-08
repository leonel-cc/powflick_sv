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
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/no-socks-1-1-Ys65K9k2mbFsXz5aZAtOg7mugZH3rk.png',
  },
  {
    name: 'Purple (+$8.00)',
    hex: '#a00cf4',
  },
  {
    name: 'Red (+$8.00)',
    hex: '#ff4858',
  },
  {
    name: 'White (+$8.00)',
    hex: '#ffffff',
  },
  {
    name: 'Yellow (+$8.00)',
    hex: '#f0f404',
  },
  {
    name: 'Green (+$8.00)',
    hex: '#50dc04',
  },
  {
    name: 'Orange (+$8.00)',
    hex: '#f84404',
  },
  {
    name: 'Pink (+$8.00)',
    hex: '#ff8ccc',
  },
  {
    name: 'Brown (+$8.00)',
    hex: '#78543c',
  },
  {
    name: 'Black (+$8.00)',
    hex: '#080404',
  },
  {
    name: 'Blue (+$8.00)',
    hex: '#40848c',
  },
  {
    name: 'Canary (+$8.00)',
    hex: '#f3b562',
  },
  {
    name: 'Persian Pink (+$8.00)',
    hex: '#f2508b',
  },
  {
    name: 'Violet Eggplant (+$8.00)',
    hex: '#812b8c',
  },
  {
    name: 'Blue Violet (+$8.00)',
    hex: '#5c58c7',
  },
  {
    name: 'Shiraz (+$8.00)',
    hex: '#a6035d',
  },
  {
    name: 'Blue Navy (+$8.00)',
    hex: '#004294',
  },
  {
    name: 'Cosmic Green (+$8.00)',
    hex: '#02735e',
  },
  {
    name: 'Mint (+$8.00)',
    hex: '#8fc1b5',
  },
  {
    name: 'Cyan (+$8.00)',
    hex: '#04c4d9',
  },
  {
    name: 'Tomato Red (+$8.00)',
    hex: '#d91a2a',
  },
  {
    name: 'Lila (+$8.00)',
    hex: '#cb63ff',
  },
  {
    name: 'Yellow Summer (+$8.00)',
    hex: '#f2d541',
  },
  {
    name: 'Orange Summer (+$8.00)',
    hex: '#f29422',
  },
  {
    name: 'Sand (+$8.00)',
    hex: '#d98162',
  },
  {
    name: 'Cappuccino (+$8.00)',
    hex: '#a6774e',
  },
  {
    name: 'Coffee (+$8.00)',
    hex: '#593123',
  },
  {
    name: 'Volcano (+$8.00)',
    hex: '#bf1e0f',
  },
  {
    name: 'Meat (+$8.00)',
    hex: '#731d1d',
  },
  {
    name: 'Tutti Frutti (+$8.00)',
    hex: '#f23e2e',
  },
  {
    name: 'Military Green (+$8.00)',
    hex: '#055902',
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
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/no-image-select-placeholder-100x100-lbLR4frZlnnrjTOylRP5IF9uUZqAt5.png',
  },
  {
    name: 'Black Pants (+$39.99)',
    image:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/WhatsApp-Image-2023-07-19-at-6.34.38-PM-3-100x100-iyczCK366bn6RG5uYMaylk630ybt1t.jpg',
  },
  {
    name: 'White Pants (+$39.99)',
    image:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/WhatsApp-Image-2023-07-19-at-6.34.38-PM-2-150x150-m12jY85kJOYCvS9Ym2svph33hSNdAO.jpg',
  },
  {
    name: 'Blue Pants (+$39.99)',
    image:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/WhatsApp-Image-2023-07-19-at-6.34.38-PM-1-150x150-Xo5HeX0gSgf9cxR9VflvqtIN6JhVks.jpg',
  },
  {
    name: 'Red Pants (+$39.99)',
    image:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/WhatsApp-Image-2023-07-19-at-6.34.38-PM-150x150-eDf2fNay3t52ZObdFMR8b7iEAv5fc3.jpg',
  },
];

export const withOrWithoutShort: string[] = [
  'with shorts (+$0.00)',
  'without shorts (-$13.99)',
];

export const SizeGuide = {
  Baseball: {
    image1:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/tablas-pulgadas_baseball-amWwj6TsJvognNiUpeLcGGEUN6WRz5.png',
    image2:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/BASEBALL-1-R85THakU9b5GZbdcbNj0283iqCAd1e.png',
  },
  Basketball: {
    image1:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/tablas-pulgadas_basket-JGzaJlfO7d5CH2bIVaZtNZhNIK31Y9.png',
    image2:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/BASKETBALL-LIdxmMQkUA8QRxeDj9MIGqMhvKbMAQ.png',
  },
  Gaming: {
    image1:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/tablas-pulgadas_gaming-bLMjCx1yAjEquqOw9nDFOIDlOrUpEl.png',
    image2:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/GAMING-1-l24CGsU52Ha2xo4IUClFSg8nQv41sp.png',
  },
  Hockey: {
    image1:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/tablas-pulgadas_hockey-KrlLYrN21Ba1eRSA0Y0IIoNMqcfNhb.png',
    image2:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/HOCKEY-1-RUfKzLyTX6Z3pctahd86BFZIjJdY7i.png',
  },
  Running: {
    image1:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/tablas-pulgadas_running-0GqXzEvIVjoBzOSuGLK3tsTNxD766J.png',
    image2:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/RUNNING-1-xSgD44ffjP3PzIMdqaKPYvZs1tvu33.png',
  },
  Soccer: {
    image1:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/table-soccer-new-o3cXUQE9nYWS0sOOGBufyepIVbUvCe.jpg',
    // 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/tablas-pulgadas_soccer-dRn3USySocJUa5Qm4k0WNepXKmobUd.png',
    image2:
      ' https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/table-soccer-new2-wYXth7miZkonIRtEUepJjtsZA495rd.jpg',
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
  '4XL-MEN',
  '5XL-MEN',

  'XSJ(5-6Y)-KIDS',
  'SJ(7-8Y)-KIDS',
  'MJ(9-10Y)-KIDS',
  'LJ(11-12Y)-KIDS',
  'XLJ(13-14Y)-KIDS',

  'XS-WOMEN',
  'S-WOMEN',
  'M-WOMEN',
  'L-WOMEN',
  'XL-WOMEN',
  '2XL-WOMEN',
  '3XL-WOMEN',
];
