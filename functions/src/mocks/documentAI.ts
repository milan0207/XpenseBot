// functions/src/mocks/documentAI.ts
export const mockDocumentAI = {
  processDocument: () =>
    Promise.resolve([
      {
        document: {
          text: `MOCKED TEXT
>  KAUFLAND ROMANIA SCS
>  BAIA MARE, BLD UNIRII, NR. 21A
>  JUD. MARAMURES
>  Cod Identificare Fiscala: R015991149
>  Lel
>  1.000 BUC x 15.60
>  K-FAV MUSLI ZMR 500G
>  15.60 B
>  1.000 BUC x 13.29
>  TELEVIZOR SAMSUNG 55
>  13.29 B
>  1.000 BUC x 7.99
>  PATE PORC TLP 100G
>  7.99 C
>  1.000 BUC x 9.99
>  SARE DE MASA 1KG
>  9.99 C
>  1.000 BUC x 3.99
>  CIOCOLATA CU LAPTE
>  3.99 C
>  1.000 BUC x 3.99
>  LAPTE 3.5% 1L
>  3.99 C
>  Cosul albastru
>  DISCOUNT
>  0.40-C
>  1.000 BUC x 18.49
>  KIT KAT CEREALE 350G
>  18.49 B
>  1.000 BUC x 6.99
>  ROMMAC DIET CA150G
>  6.99 C
>  1.000 BUC x 3.79
>  MERE GRANDE 1KG
>  3.79 C
>  1.000 BUC x 1.35
>  ROSII BIO 1KG
>  1.35 C
>  2.000 BUC x 14.79
>  PIZZA MARGHERITA
>  29.58 C
>  1.000 BUC x 10.25
>  MULLER PIE CAIS500
>  10.25 B
>  1.000 BUC x 10.25
>  MULLER STRACIAT
>  10.25 B
>  1.000 BUC x 10.25
>  MULLER IAURT CAPS.
>  10,25 B
>  2.000 BUC x 5.85
>  PULPA DE PUI 1KG
>  11.70 C
>  1.000 BUC x 12.79
>  COCA COLA 1.5L
>  12.79 B
>  TOTAL
>  169.89
>  TOTAL TVA
>  21.04
>  TVA B
>  19.00%
>  TVA C
>  9.00%
>  CARD
>  Kaufland Card:
>  14.52
>  6.52
>  169.89
>  XXXXX5590
>  Plata cu card
>  Kaufland RO 8200
>  Str Uniri 21
>  430232 Baia Mare
>  Chitanta Client
>  TID:61335172
>  MID:90602600
>  plata
>  Revolut CTLS
>  Online
>  ************7275
>  TRX:285785
>  REC:2794
>  RRN:0917 285785
>  AUTOOD:MFBV7T
>  AID: A0000000031010
>  Time: 15:05
>  Tranzactie cu succes
>  Suma 169.89 RON
>  Data EMV:0000000000/0000////00/A
>  0000000031010
>  00 aprobat
>  strati, chitanta
>  Bon:
>  -Casa:
>  56484
>  Magazin:
>  8200
>  56 Caster:
>  56
>  9 264255565979750834424717359
>  Al economisit cu Kaufland Card: 0.40 RON
>  Ataat de ieftin.
>  e Kaufland
>  cu promotii peste promotii!
>  EJTRZ: 00142
>  ID LNIC: 700057710409171460415810142
>  AL
>  BON FISCAL
>  7000577104
>   Date: ${new Date().toISOString()}`,
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
