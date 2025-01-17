/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { VoyageEmbeddings } from "@langchain/community/embeddings/voyage";
import { v4 as uuidv4 } from "uuid";
import path from "path";

import { createIndexIfNecessary, pineconeIndexHasVectors } from "./pinecone";

import { type Document } from "../types/document";
import { promises as fs } from "fs";

const readMetadata = async (): Promise<Document["metadata"][]> => {
  try {
    const filePath = path.resolve(process.cwd(), "docs/db.json");
    const data = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(data);
    return parsed.documents || [];
  } catch (error) {
    console.warn("Could not read metadata from db.json:", error);
    return [];
  }
};

// Prepare metadata for upsert to Pinecone - Langchain's PDF loader adds some
// fields that we want to remove before upserting to Pinecone, because Pinecone
// requires that metadata is a string, number or array (not an object)
const flattenMetadata = (metadata: any): Document["metadata"] => {
  const flatMetadata = { ...metadata };
  if (flatMetadata.pdf) {
    if (flatMetadata.pdf.pageCount) {
      flatMetadata.totalPages = flatMetadata.pdf.pageCount;
    }
    delete flatMetadata.pdf;
  }
  if (flatMetadata.loc) {
    delete flatMetadata.loc;
  }
  return flatMetadata;
};

// Function to batch upserts
const batchUpserts = async (
  index: any,
  vectors: any[],
  batchSize: number = 50
) => {
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    console.log(`Upserting batch ${i + 1} of ${batch.length} vectors...`);
    await index.upsert(batch);
  }
};

export const initiateBootstrapping = async (targetIndex: string) => {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `http://localhost:${process.env.PORT}`;

  // Initiate a POST request with fetch to the /ingest endpoint, in order to begin
  // chunking, embedding and upserting documents that will form the knowledge base
  const response = await fetch(`${baseUrl}/api/ingest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ targetIndex }),
  });
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
};

// Add content validation function
const isValidContent = (content: string): boolean => {
  if (!content || typeof content !== "string") return false;
  const trimmed = content.trim();
  return trimmed.length > 0 && trimmed.length < 8192; // Voyage typically has a max token limit
};

export const handleBootstrapping = async (targetIndex: string) => {
  try {
    console.log(
      `Running bootstrapping procedure against Pinecone index: ${targetIndex}`
    );

    await createIndexIfNecessary(targetIndex);
    const hasVectors = await pineconeIndexHasVectors(targetIndex);

    if (hasVectors) {
      console.log(
        "Pinecone index already exists and has vectors in it - returning early"
      );
      return NextResponse.json({ success: true }, { status: 200 });
    }

    console.log("Loading documents and metadata...");

    const docsPath = path.resolve(process.cwd(), "docs/");
    const loader = new DirectoryLoader(docsPath, {
      ".pdf": (filePath: string) => new PDFLoader(filePath),
    });

    const documents = await loader.load();
    if (documents.length === 0) {
      console.warn("No PDF documents found in docs directory");
      return NextResponse.json(
        { error: "No documents found" },
        { status: 400 }
      );
    }

    const metadata = await readMetadata();

    // Merge metadata and validate documents
    const validDocuments = documents.filter((doc) =>
      isValidContent(doc.pageContent)
    );
    validDocuments.forEach((doc) => {
      const fileMetadata = metadata.find(
        (meta) => meta.filename === path.basename(doc.metadata.source)
      );
      if (fileMetadata) {
        doc.metadata = {
          ...doc.metadata,
          ...fileMetadata,
          pageContent: doc.pageContent,
        };
      }
    });

    console.log(`Found ${validDocuments.length} valid documents`);

    // Split into smaller chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splits = await splitter.splitDocuments(validDocuments);
    console.log(`Created ${splits.length} chunks`);

    // Process in smaller batches
    const BATCH_SIZE = 5; // Reduced batch size
    for (let i = 0; i < splits.length; i += BATCH_SIZE) {
      const batch = splits.slice(i, i + BATCH_SIZE);
      console.log(
        `Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(
          splits.length / BATCH_SIZE
        )}`
      );

      // Filter and prepare batch
      const validBatch = batch.filter((split) =>
        isValidContent(split.pageContent)
      );
      if (validBatch.length === 0) {
        console.log("Skipping batch - no valid content");
        continue;
      }

      const castedBatch: Document[] = validBatch.map((split) => ({
        pageContent: split.pageContent.trim(),
        metadata: {
          ...flattenMetadata(split.metadata as Document["metadata"]),
          id: uuidv4(),
          pageContent: split.pageContent.trim(),
        },
      }));

      try {
        // Generate embeddings
        const voyageEmbeddings = new VoyageEmbeddings({
          apiKey: process.env.VOYAGE_API_KEY,
          inputType: "document",
          modelName: "voyage-law-2",
        });

        const pageContents = castedBatch.map((split) => split.pageContent);
        console.log(`Generating embeddings for ${pageContents.length} chunks`);

        const embeddings = await voyageEmbeddings.embedDocuments(pageContents);

        if (!embeddings || embeddings.length !== pageContents.length) {
          console.error("Invalid embeddings response", {
            expected: pageContents.length,
            received: embeddings?.length,
          });
          continue;
        }

        // Create vectors
        const vectors = castedBatch.map((split, index) => ({
          id: split.metadata.id!,
          values: embeddings[index],
          metadata: split.metadata,
        }));

        // Upsert to Pinecone
        const pc = new Pinecone({
          apiKey: process.env.PINECONE_API_KEY!,
        });

        const index = pc.Index(targetIndex);
        await batchUpserts(index, vectors, 2);

        // Add delay between batches
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(
          `Error processing batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
          {
            error: error instanceof Error ? error.message : "Unknown error",
            batchSize: castedBatch.length,
          }
        );
        continue;
      }
    }

    console.log("Bootstrap procedure completed successfully.");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error during bootstrap procedure:", {
      message: error.message,
      cause: error.cause?.message,
      stack: error.stack,
    });

    if (error.code === "UND_ERR_CONNECT_TIMEOUT") {
      return NextResponse.json(
        { error: "Operation timed out - please try again" },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Bootstrap procedure failed" },
      { status: 500 }
    );
  }
};