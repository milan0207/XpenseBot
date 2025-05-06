// functions/src/mocks/geminiAI.ts
export const mockGeminiAI = {
  models: {
    generateContent: () =>
      Promise.resolve({
        text: `{
  "id": 1,
  "store_name": "Kaufland",
  "date": "2024-09-26",
  "total_amount": 279.78,
  "currency": "RON",
  "items": [
    {
      "id": 1,
      "name": "TON ULEI MASL.C160G",
      "category": "kitchen",
      "price": 15.49,
      "quantity": "160G"
    },
    {
      "id": 2,
      "name": "KLC BATON ALUNE 30G",
      "category": "snacks",
      "price": 0.99,
      "quantity": "30G"
    },
    {
      "id": 3,
      "name": "KLC BATON MAR 30G",
      "category": "snacks",
      "price": 0.99,
      "quantity": "30G"
    },
    {
      "id": 4,
      "name": "KLC BATON CAPSUNI 30G",
      "category": "snacks",
      "price": 0.99,
      "quantity": "30G"
    },
    {
      "id": 5,
      "name": "KLC BATON CAISE 30G",
      "category": "snacks",
      "price": 0.99,
      "quantity": "30G"
    },
    {
      "id": 6,
      "name": "C.TON ULEI MASL3X65G",
      "category": "kitchen",
      "price": 36.99,
      "quantity": "3X65G"
    },
    {
      "id": 7,
      "name": "CODITE SPULLE 500G",
      "category": "other",
      "price": 7.99,
      "quantity": "500G"
    },
    {
      "id": 8,
      "name": "PASTE CUS A250G",
      "category": "other",
      "price": 3.79,
      "quantity": "250G"
    },
    {
      "id": 9,
      "name": "HRANA CAINI 10KG",
      "category": "other",
      "price": 86.89,
      "quantity": "10KG"
    },
    {
      "id": 10,
      "name": "SNICKERS 3PACK 150G",
      "category": "snacks",
      "price": 9.25,
      "quantity": "150G"
    },
    {
      "id": 11,
      "name": "DR SNACK CAJU",
      "category": "snacks",
      "price": 17.49,
      "quantity": "100G"
    },
    {
      "id": 12,
      "name": "CHIO CHIPS CASC 170G",
      "category": "snacks",
      "price": 8.79,
      "quantity": "170G"
    },
    {
      "id": 13,
      "name": "MILKA BISCUITI 150G",
      "category": "snacks",
      "price": 5.79,
      "quantity": "150G"
    },
    {
      "id": 14,
      "name": "SOLE CREMA UNT 200G",
      "category": "dairy",
      "price": 7.45,
      "quantity": "200G"
    },
    {
      "id": 15,
      "name": "MULLER PIE CAIS 500",
      "category": "dairy",
      "price": 10.25,
      "quantity": "500G"
    },
    {
      "id": 16,
      "name": "ALMETTE SMANTANA 250G",
      "category": "dairy",
      "price": 11.10,
      "quantity": "250G"
    },
    {
      "id": 17,
      "name": "COVAL CASC DALIA 400G",
      "category": "dairy",
      "price": 22.99,
      "quantity": "400G"
    },
    {
      "id": 18,
      "name": "MULLER STRACIAT.",
      "category": "dairy",
      "price": 10.25,
      "quantity": "500G"
    },
    {
      "id": 19,
      "name": "OD. PALOMA CHERRY",
      "category": "other",
      "price": 7.99,
      "quantity": "1L"
    }
  ]
}`,
      }),
  },
};
