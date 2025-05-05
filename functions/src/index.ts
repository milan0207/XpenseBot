// import { processReceipt } from "./receiptProcessing";

// // Test with proper error handling
// processReceipt("D:\\Egyetem\\Egyetem_3.2\\Allamvizsga\\TestKepek\\test6.jpg")
//   .then((text) => {
//     console.log("--- EXTRACTED TEXT ---");
//     console.log(text);
//   })
//   .catch((err) => {
//     console.error("!!! PROCESSING FAILED !!!");
//     console.error(err.message);
//   });

import * as functions from "firebase-functions/v1";
// eslint-disable-next-line max-len
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { initializeApp, cert } from "firebase-admin/app";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { mockDocumentAI } from "./mocks/documentAI";
import { GoogleGenAI } from "@google/genai";
import { mockGeminiAI } from "./mocks/geminiAI";

let client: DocumentProcessorServiceClient;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require("../keys/firebase-service-account.json");
// eslint-disable-next-line max-len
const key = fs.readFileSync(path.resolve(__dirname, "../keys/geminiKey.txt"), "utf-8").trim();
let ai: any;

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "xpensebot-f15ac.appspot.com",
});
if (process.env.FUNCTIONS_EMULATOR === "false") {// if true mock, if false live
  console.log("Using mocked Document AI client (emulator mode)");
  client = mockDocumentAI as unknown as DocumentProcessorServiceClient;
  ai= mockGeminiAI;
} else {
  client = new DocumentProcessorServiceClient({
    keyFilename: "./keys/firebase-service-account.json",
  });
  ai = new GoogleGenAI({ apiKey: key });
}

const storage = getStorage();

export const processUploadedImage = functions.storage
  .object()
  .onFinalize(async (object) => {
    if (!object.name || !object.contentType?.startsWith("image/")) return null;
    // Checking if the file is already in the processed folder
    if (object.name.startsWith("processed/")) {
      console.log(
        "File is already in processed folder, skipping:",
        object.name
      );
      return null;
    }

    const filePath = object.name;
    const bucket = storage.bucket(object.bucket);

    // 1. Create a temporary file path
    // Generate a safe file name by replacing invalid characters
    const safeFileName = path.basename(filePath).replace(/[^a-zA-Z0-9.]/g, "_");
    const tempFilePath = path.join(os.tmpdir(), safeFileName);

    try {
      // 2. Download the file to a temporary location
      console.log(`Starting download: ${filePath} -> ${tempFilePath}`);
      await bucket.file(filePath).download({ destination: tempFilePath });

      if (!fs.existsSync(tempFilePath)) {
        throw new Error(`File not found after download: ${tempFilePath}`);
      }

      // 3. Document AI api call
      const [result] = await client.processDocument({
        // eslint-disable-next-line max-len
        name: "projects/xpensebot-f15ac/locations/us/processors/876ebbf16c3f55a8",
        rawDocument: {
          content: fs.readFileSync(tempFilePath).toString("base64"),
          mimeType: object.contentType || "application/octet-stream",
        },
      });

      const extractedText = result.document?.text || "No text found";
      // Gemini parsing
      let parsedResponse = "";
      if (extractedText !== "No text found") {
      const prompt = `Parse this Romanian receipt text meticulously. Follow these rules:

      1. Correct any typos in product names
      2. Extract quantities with units (e.g., 1KG, 500ML, 2 buc)
      3. Use EXACTLY these categories:
        - alcoholDrinks
        - bakery
        - bathroom
        - beauty
        - car
        - cleaning
        - dairy
        - drinks
        - electronics
        - health
        - kitchen
        - meat
        - snacks
        - vegetables_and_fruits
        - other

      Format response as JSON, this is just an example,
       do not include these products:

      {
        "store_name": "[Corrected store name]",
        "date": "YYYY-MM-DD",
        "total_amount": 123.45,
        "items": {
          "alcoholDrinks": ["example1-8.99-500ML", "example2-25.50-750ML"],
          "bakery": ["example1-4.99-1KG"],
          "bathroom": ["example1-5.99-1 buc"],
          "dairy": ["example1-7.50-1L", "example2-12.30-200G"],
          "vegetables_and_fruits": [example1-3.79-1KG", "example2-6.50-500G"],
          "meat": ["example1-15.99-1KG"],
          "snacks": ["example1-7.99-150G"],
          "other": ["example1-12.00-2 buc"]
        }
      }
      the example has now ended, from here on you should parse the text:
      Receipt text:
      ${extractedText}

      Important:
      - Prices MUST have 2 decimal places
      - Quantity format: [number][unit] (e.g., 1KG, 500ML, 2 buc)
      - If quantity missing, use "1 buc"
      - Never invent prices or products!`;
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });
        console.log(response.text);
        parsedResponse = response.text || "No response text available";
      }

      // 5. Save results to Firestore
      // path: uploads/{userId}/{file}
      const firestore = getFirestore();
      console.log("Saving results to Firestore");
      console.log("Parsed response:", parsedResponse);
      const userId = filePath.split("/")[1];
      await firestore.collection("documentResults").add({
        userId,
        originalFile: filePath,
        parsedResponse: parsedResponse,
        processedAt: Timestamp.now(),
      });

      // 4. Moving to processed folder
      await bucket
        .file(filePath)
        .move(`processed/${userId}/${path.basename(filePath)}`);

      console.log("Successfully processed:", filePath);
      console.log("Extracted text:", extractedText);
      return null;
    } catch (error) {
      console.error("Error processing file:", filePath, error);
      throw error;
    } finally {
      // Deleting the temporary file
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log("Temporary file deleted:", tempFilePath);
      }
    }
  });
