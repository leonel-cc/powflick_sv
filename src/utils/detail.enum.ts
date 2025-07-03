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

export const Materials = [
  {
    name: 'LitePlay (+$0.00)',
    image:
      'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Materials/Basketball/RD%20JQ3018/IMG_5244-t8hEdNGNGFP9MHIi4WEmUn1Gm9xJt3.jpg',
  },
  {
    name: 'AeroDry (+$0.00)',
    image:
      'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Materials/Basketball/RD%20JQ3001/IMG_5131-RmGZI6UQy7xj65VEblS44FgcGHAJ37.jpg',
  },
  {
    name: 'ProMesh (+$2.99)',
    image:
      'https://5ogdqbzzrogmotoh.public.blob.vercel-storage.com/Materials/Basketball/RD%20YX3024/IMG_5217-X5GP8crncCAbKuzb6F0J82QyhnL6Bu.jpg',
    htmlString: `
  <section style="max-width: 600px; margin: auto;">
    <h2 style="font-size: 24px; font-weight: bold;">ProMesh™ Fabric</h2>
    <p style="font-style: italic; margin-bottom: 16px;">Diseñada para el alto rendimiento</p>
    <div style="margin-top: 20px;">
      <h3 style="font-size: 16px; font-weight: bold;">Tecnología de Tejido Cerrado</h3>
      <p style="margin-bottom: 12px;">Su estructura de punto fino mejora la retención de forma y proporciona una caída elegante sin comprometer la ventilación.</p>

      <h3 style="font-size: 16px; font-weight: bold;">Transpirabilidad Inteligente</h3>
      <p style="margin-bottom: 12px;">El diseño microperforado permite el paso del aire y reduce la acumulación de calor corporal, ideal para entrenamientos intensos o climas cálidos.</p>

      <h3 style="font-size: 16px; font-weight: bold;">Control Avanzado de Humedad</h3>
      <p style="margin-bottom: 12px;">La tecnología de absorción rápida expulsa el sudor más eficientemente que las telas de malla tradicionales, manteniéndote seco por más tiempo.</p>

      <h3 style="font-size: 16px; font-weight: bold;">Flexible + Ligera</h3>
      <p style="margin-bottom: 12px;">Alta elasticidad que se adapta al movimiento natural del cuerpo. ProMesh ofrece libertad sin perder estructura.</p>

      <h3 style="font-size: 16px; font-weight: bold;">Ideal para Uniformes Profesionales</h3>
      <p style="margin-bottom: 12px;">Una opción premium (+$2.99) pensada para jugadores que exigen rendimiento sin sacrificar confort.</p>
    </div>
    <div style="display: flex; margin-top: 10px;">
      <img src="/assets/images/detail/materials.png" alt="icono 1" style="height: 50px; width: full;" />
    </div>
  </section>
`,
  },
];

export const Technique = [
  {
    name: 'Default Sublimated',
    image:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/technique/PARTES_BUILDER_TECHNIQU-DEFAULT-BFlPXX67lxxbdBdzXFwqZQcSdvMEu1.png',
    description: 'Standard Logo Included',
  },
  {
    name: 'Heat Press Technique',
    image:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/technique/PARTES_BUILDER_TECHNIQU-HEAT%20PRESS-8cCeZkjVG7wYJLwAWmXGF5zPm4rQOa.png',
    description: 'Looking to add this premium detail? Talk to us',
    link: 'https://powflick.com/contact',
  },
  {
    name: 'Stitch Embroidery',
    image:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/technique/PARTES_BUILDER_TECHNIQU-38-x1QWPiNl8basCNuPmPY0hMY15SAs0H.png',
    description: 'Looking to add this premium detail? Talk to us',
    link: 'https://powflick.com/contact',
  },
  {
    name: 'Embroidery Logo',
    image:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/technique/PARTES_BUILDER_TECHNIQU-Embroidery%20logo-39-pHTxdkDcEfTVTqR200B6m6qdarCF2F.png',
    description: 'Looking to add this premium detail? Talk to us',
    link: 'https://powflick.com/contact',
  },
  {
    name: 'Heat Press Logo',
    image:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/technique/PARTES_BUILDER_TECHNIQU-Embroidery%20logo-40-aM203Cwp80MMKm4DbD52DuSraZRffA.png',
    description: 'Looking to add this premium detail? Talk to us',
    link: 'https://powflick.com/contact',
  },
];


export const Neck = [
  {
    name: 'Crew Neck (+$0.00)',
    image:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/neck/PARTES_BUILDER_CREW%20NECK-8FzE2P9mmvNhEmaavKsr8KBxlF03W4.png',
  },
  {
    name: 'Classic V-Neck (+$0.00)',
    image:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/neck/PARTES_BUILDER_CLASSIC%20V%20NECK-Dp5L38Zu8reAZCz5zgub8UNEmfEJk7.png',
  },
  {
    name: 'V-Neck Sports Collar (+$2.99)',
    image:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/neck/PARTES_BUILDER_V-%20NECK%20SPORTS-ScxDbFA3mASGV2VKYxMa6uLq7XCfMu.png',
  },
  {
    name: 'Polo Collar (+$2.99)',
    image:
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/neck/PARTES_BUILDER_POLO%20COLLAR-tLqEXGDAnXmee28UkdqILYPJ5mIMjN.png',
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
      'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-WHITOUT-6i7FaoPso5v7VmiFfPQM6oTMh1DmNT.png',
  },
  {
    name: 'Purple (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-PURPLE-fbmuuJq4NJ0VW09WCTyaVX9ti8fePc.png',
  },
  {
    name: 'Red (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-RED-DESqUaq00uYROUDxbTR1F2yii50f0N.png',
  },
  {
    name: 'White (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-WHITE-GUTXEzf62OSg2QIOxt4dz6DkgcHGp8.png',
  },
  {
    name: 'Yellow (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-YELLOW-DDeJ502i35H5EMUkNEXHps5fE62Ayj.png',
  },
  {
    name: 'Green (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-GREEN-lpkaU6GGgkDjhCrKdx8X9OPf7j2nSs.png',
  },
  {
    name: 'Orange (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-ORANGE-M2VhFH4A71cCblVYyz3bvyQXRGcb2q.png',
  },
  {
    name: 'Pink (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-PINK-8UJRolNiuw3uvOc17a2V1JntSZVWdi.png',
  },
  {
    name: 'Brown (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-BROWN-5rHLIFpl0i363dZGoqb533MqLEbEV4.png',
  },
  {
    name: 'Black (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-BLACK-caseSXJIEWHNAnkc9jz1YGSDdsFSMk.png',
  },
  {
    name: 'Blue (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-BLUE-Abzf7QwY1zocysv5JaKdoFLa6NwW6a.png',
  },
  {
    name: 'Canary (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-CANARY-NITHlebvSQGcdbenhJL3ADOyeHs3Fo.png',
  },
  {
    name: 'Persian Pink (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-PERSIAN%20PINK-aOeuduwNgy2GKIoAgzafZLe6Av8SHL.png',
  },
  {
    name: 'Violet Eggplant (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-VIOLET%20EGGPLANT-rqKyoxVlCgGQNEueiJ90fGacGBVKG4.png',
  },
  {
    name: 'Blue Violet (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-BLUE%20VIOLET-2j0nfIXfCoZhCubNVTWwaraHVbmROo.png',
  },
  {
    name: 'Shiraz (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-SHIRAZ-50L1SeBtvUcob6WLK1NC3bZoeTKfsL.png',
  },
  {
    name: 'Blue Navy (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-BLUE%20NAVY-2jiUAqCSaz2nT3xxykVSIPjyRRQTMB.png',
  },
  {
    name: 'Cosmic Green (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-COSMIC%20GREEN-J69FtPVMOFeHFXHJu3SzJeMYaIDe2E.png',
  },
  {
    name: 'Mint (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-MINT-Fuwzd9xK5xDiz7OsJ4Chl1tzgr2ZMA.png',
  },
  {
    name: 'Cyan (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-CYAN-hZf4t0gG6u3zg98LVzklF1oId4i7fV.png',
  },
  {
    name: 'Tomato Red (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-TOMATO%20RED-CxQmJmWFaDsuHUmEFsolaGl54yif9u.png',
  },
  {
    name: 'Lila (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-LILA-thetg2ckTW5pkNkcR7EVK9z3szLNIg.png',
  },
  {
    name: 'Yellow Summer (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-YELLOW%20SUMMER-TPRK4vdvAwkOUMhsdB0ZheTdY9pgxS.png',
  },
  {
    name: 'Orange Summer (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-ORANGE%20SUMER-GLWc3nxnYJSpgrADqNy2AsdSz7LnYE.png',
  },
  {
    name: 'Sand (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-SAND-iymYD6YaaI2lBNcu3h2KMMlD5wcjNi.png',
  },
  {
    name: 'Cappuccino (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-CAPPUCCINO-Cb5ZfAkkwj2mhdspqG9ygNf27PW35v.png',
  },
  {
    name: 'Coffee (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-COFFE-94llcwfQSX95OFD3HKdu96NiramNtY.png',
  },
  {
    name: 'Volcano (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-VOLCANO-dE42vcaGbpzVyB66bQiK7JyGN9RZT9.png',
  },
  {
    name: 'Meat (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-MEAT-QF9DqRSAFyyFDsOtt202h2NEbapQwK.png',
  },
  {
    name: 'Tutti Frutti (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-TUTTI%20FRUTTI-bwcXcwdHkaalaNhVITVttnGesZG7ep.png',
  },
  {
    name: 'Military Green (+$8.00)',
    image: 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/socks/PARTES_BUILDER_SOCKS-MILITARY%20GREEN-rwfWFhOGIQeXgusYprRYlgNLUJQaRq.png',
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
    // shorts.unshift({
    //   name: 'No Shorts (-$13.99)',
    //   image:
    //     'https://ideasjersey.com/wp-content/uploads/2024/01/240_F_616809410_J9aoPiy5GhsZYPXzDr2Cd0BHVBO8Rwtf-1.jpg',
    // });

    // Hacemos que los demás shorts sean gratis
    shorts.forEach((short, index) => {
      short.name = short.name.replace('(+$13.99)', '(+$0.00)');
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

// export const SizeGuide = {
//   Baseball: {
//     image1:
//       'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/tablas-pulgadas_baseball-amWwj6TsJvognNiUpeLcGGEUN6WRz5.png',
//     image2:
//       'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/BASEBALL-1-R85THakU9b5GZbdcbNj0283iqCAd1e.png',
//   },
//   Basketball: {
//     image1:
//       'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/tablas-pulgadas_basket-JGzaJlfO7d5CH2bIVaZtNZhNIK31Y9.png',
//     image2:
//       'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/BASKETBALL-LIdxmMQkUA8QRxeDj9MIGqMhvKbMAQ.png',
//   },
//   Gaming: {
//     image1:
//       'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/tablas-pulgadas_gaming-bLMjCx1yAjEquqOw9nDFOIDlOrUpEl.png',
//     image2:
//       'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/GAMING-1-l24CGsU52Ha2xo4IUClFSg8nQv41sp.png',
//   },
//   Hockey: {
//     image1:
//       'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/tablas-pulgadas_hockey-KrlLYrN21Ba1eRSA0Y0IIoNMqcfNhb.png',
//     image2:
//       'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/HOCKEY-1-RUfKzLyTX6Z3pctahd86BFZIjJdY7i.png',
//   },
//   Running: {
//     image1:
//       'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/tablas-pulgadas_running-0GqXzEvIVjoBzOSuGLK3tsTNxD766J.png',
//     image2:
//       'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/RUNNING-1-xSgD44ffjP3PzIMdqaKPYvZs1tvu33.png',
//   },
//   Soccer: {
//     image1:
//       'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/table-soccer-new-o3cXUQE9nYWS0sOOGBufyepIVbUvCe.jpg',
//     // 'https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/tablas-pulgadas_soccer-dRn3USySocJUa5Qm4k0WNepXKmobUd.png',
//     image2:
//       ' https://sbvajd9r07chtxp5.public.blob.vercel-storage.com/Images-Detail/table-soccer-new2-wYXth7miZkonIRtEUepJjtsZA495rd.jpg',
//     //   'https://app.ideasjersey.com/wp-content/uploads/2023/12/Y0mQi1nnIGwqOLu8SKrGBaRafpjlO7FQJ8mgcdsPZek.png',
//   },
// };

// export const ShippingTypes =
//   'We take pride in creating all of our custom uniforms to order within 15 business days in China. Once your order has been shipped, our team will provide you with a tracking number. Since each uniform is made specifically for you, we cannot accept returns or exchanges.';

// export const PaymentMethods = {
//   text: "Secure payments worldwide. You can trust us with your credit card, whether you're in the USA or abroad.",
// };

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
