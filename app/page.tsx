/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import SearchForm from "@/components/SearchForm";
import DocumentView from "@/components/DocumentView";
import { type Document } from "./types/document";
import { sanitizeString } from "@/lib/utils";
import { AlertView } from "@/components/AlertView";
import Link from "next/link";

interface SearchResult {
  metadata: Document["metadata"];
  content: string;
}

const runBootstrapProcedure = async (
  setErrorMessage: (message: string) => void
) => {
  const response = await fetch("/api/bootstrap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.json();
    console.log(body);
    setErrorMessage(
      `Bootstrap failed: ${body?.message || "Unknown error occurred"}`
    );
    throw new Error(`API request failed with status ${response.status}`);
  }
};

const checkAndBootstrapIndex = async (
  setIsBootstrapping: (isBootstrapping: boolean) => void,
  setIsIndexReady: (isIndexReady: boolean) => void,
  setErrorMessage: (message: string) => void
) => {
  setIsBootstrapping(true);
  try {
    await runBootstrapProcedure(setErrorMessage);
    setIsIndexReady(true);
  } catch (error) {
    console.error(error);
  } finally {
    setIsBootstrapping(false);
  }
};

const handleSearch = async (
  query: string,
  setResults: (results: SearchResult[]) => void,
  setIsSearching: (isSearching: boolean) => void,
  setErrorMessage: (message: string) => void
) => {
  setIsSearching(true);
  const response = await fetch("/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const body = await response.json();
    console.log(body);
    setErrorMessage("Search failed: Unable to find the searched content");
  }

  const { results } = await response.json();
  setResults(results);
  setIsSearching(false);
};

const suggestedSearches = [
  "Cases about personal freedoms being violated",
  "Cases involving a US President",
  "Cases involving guns",
  "Cases where Nixon was the defendant",
  "How much power does the commerce clause give Congress?",
  "Cases about personal rights or congressional overreach?",
  "Cases involving the ability to pay for an attorney",
  "Cases about the right to remain silent",
  "Landmark cases that shaped freedom of speech laws",
  "Cases where defendant was found with a gun",
  "What cases involved personal rights or congressional overreach?",
  "Cases where the judge expressed grave concern",
];

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [isIndexReady, setIsIndexReady] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<SearchResult | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    checkAndBootstrapIndex(
      setIsBootstrapping,
      setIsIndexReady,
      setErrorMessage
    );
  }, []);

  const clearResults = () => {
    setQuery("");
    setResults([]);
    setErrorMessage(null);
  };

  if (selectedDocument) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-white flex flex-col">
        <DocumentView
          document={selectedDocument}
          quote={selectedDocument.metadata.pageContent}
          onBack={() => setSelectedDocument(null)}
        />
        <footer className="text-sm bg-gray-900 text-gray-400 text-center py-4 mt-auto">
          &copy; 2025{" "}
          <Link
            href="https://vaibhavkesarwani.vercel.app/"
            target="_blank"
            className="bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text"
          >
            Vaibhav Kesarwani.
          </Link>{" "}
          All Rights Reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-white flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        {errorMessage && <AlertView />}

        <div className="flex flex-col items-center w-full mb-8">
          {isBootstrapping && (
            <div className="flex items-center space-x-3 bg-gray-700 p-4 rounded-lg shadow-sm">
              <p className="text-gray-300">Processing legal documents...</p>
              <div className="spinner border-4 border-t-transparent border-indigo-600 rounded-full w-5 h-5 animate-spin"></div>
            </div>
          )}
        </div>

        {isIndexReady && !isBootstrapping && (
          <div className="w-full">
            <h1 className="text-4xl font-bold text-center mb-3">
              Legal Document Search
            </h1>
            <p className="text-center text-gray-300 text-lg mb-8">
              Use natural language to explore legal documents and precedents
            </p>

            <div className="max-w-3xl mx-auto mb-12">
              <SearchForm
                suggestedSearches={suggestedSearches}
                onSearch={(query: string) => {
                  handleSearch(
                    query,
                    setResults,
                    setIsSearching,
                    setErrorMessage
                  );
                  setQuery(query);
                }}
              />
            </div>

            {isSearching && (
              <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-3 bg-gray-800 p-3 rounded-lg shadow-sm">
                  <p className="text-gray-400">Searching documents...</p>
                  <div className="spinner border-3 border-t-transparent border-indigo-700 rounded-full w-4 h-4 animate-spin"></div>
                </div>
              </div>
            )}

            {results.length > 0 && query && (
              <div className="flex justify-between items-center mb-8 bg-gray-700 p-4 rounded-lg shadow-sm">
                <p>
                  Found {results.length} result{results.length > 1 ? "s" : ""}{" "}
                  for{" "}
                  <span className="font-semibold text-indigo-400">
                    &quot;{query}&quot;
                  </span>
                </p>
                <button
                  onClick={clearResults}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                  aria-label="Clear results"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result, index) => (
                <Card
                  key={index}
                  className="bg-gray-800 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                  onClick={() => setSelectedDocument(result)}
                >
                  <CardContent className="p-6">
                    <h2 className="text-gray-200 text-xl font-semibold mb-3">
                      {result.metadata.title}
                    </h2>
                    <blockquote className="relative p-4 mb-4 bg-gray-800 rounded-lg">
                      <p className="line-clamp-4 italic text-gray-200">
                        {sanitizeString(result.metadata.pageContent)}
                      </p>
                    </blockquote>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="font-medium w-20 text-indigo-300">
                          Topic:
                        </span>
                        <span className="truncate text-gray-200">
                          {result.metadata.topic}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium w-20 text-indigo-300">
                          Verdict:
                        </span>
                        <span className="truncate text-gray-200">
                          {result.metadata.outcome}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium w-20 text-indigo-300">
                          Date:
                        </span>
                        <span className="text-gray-200">
                          {new Date(result.metadata.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      <footer className="text-sm bg-gray-900 text-gray-400 text-center py-4 mt-auto">
        &copy; 2025{" "}
        <Link
          href="https://vaibhavkesarwani.vercel.app/"
          target="_blank"
          className="bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text"
        >
          Vaibhav Kesarwani.
        </Link>{" "}
        All Rights Reserved.
      </footer>
    </div>
  );
}
