// functions/src/mocks/geminiAI.ts
export const mockGeminiAI = {
  getGenerativeModel: () => ({
    generateContent: () =>
      Promise.resolve({
        response: {
          text: () =>
            JSON.stringify({
              store_name: "KAUFLAND ROMANIA SCS",
              date: "2025-05-03",
              total_amount: 169.89,
              items: {
                electronics: ["TELEVIZOR SAMSUNG 55-13.29"],
                drinks: ["COCA COLA 1.5L-12.79"],
                vegetables_and_fruits: [
                  "MERE GRANDE 1KG-3.79",
                  "ROSII BIO 1KG-1.35",
                ],
                snacks: [
                  "K-FAV MUSLI ZMR 500G-15.60",
                  "KIT KAT CEREALE 350G-18.49",
                  "MULLER PIE CAIS500-10.25",
                  "MULLER STRACIAT-10.25",
                  "MULLER IAURT CAPS.-10.25",
                ],
                meat: ["PATE PORC TLP 100G-7.99", "PULPA DE PUI 1KG-11.70"],
                other: [
                  "SARE DE MASA 1KG-9.99",
                  "CIOCOLATA CU LAPTE-3.99",
                  "LAPTE 3.5% 1L-3.99",
                  "PIZZA MARGHERITA-29.58",
                ],
                discount: ["DISCOUNT-0.40"],
              },
            }),
        },
      }),
  }),
};
