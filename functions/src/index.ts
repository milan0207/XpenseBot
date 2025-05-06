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
if (process.env.FUNCTIONS_EMULATOR === "true") {// if true mock, if false live
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
        const prompt = `Parse this Romanian 
      receipt text meticulously. Follow these rules:

      1. Correct any typos in product names
      2. Use EXACTLY these categories In the category field of the
      3. find out what type of currency is used in the receipt and
       use it in the currency field
      JSON CHOSE ONE from here and label it based on the product name:
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
        "id": 1,
        "store_name": "[Corrected store name]",
        "date": "YYYY-MM-DD",
        "total_amount": 123.45,
        "currency": "currency1",
        "items": [
          {
            "id": 1,
            "name": "example1",
            "category": "category1",
            "price": 8.99,
          },
          {
            "id": 2,
            "name": "example2",
            "category": "category1",
            "price": 25.50,
          },
          {
            "id": 3,
            "name": "example1",
            "category": "category1",
            "price": 4.99,
          },
          {
            "id": 4,
            "name": "example1",
            "category": "category1",
            "price": 5.99,
          },
          {
            "id": 5,
            "name": "example1",
            "category": "category1",
            "price": 7.50,
          }
      ]
      }
      the example has now ended, from here on you should parse the text:
      Receipt text:
      ${extractedText}

      Important:
      - Prices MUST have 2 decimal places
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
