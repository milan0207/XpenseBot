// functions/src/mocks/documentAI.ts
export const mockDocumentAI = {
  processDocument: () =>
    Promise.resolve([
      {
        document: {
          text: "MOCKED TEXT\nTermék: Teszt termék\nÖsszeg: 1000 Ft",
          pages: [
            {
              layout: {
                textAnchor: { content: "Mock adatok" },
                confidence: 0.95,
              },
            },
          ],
        },
      },
    ]),
};