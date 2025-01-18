import { useEffect, useRef } from 'react';
import { sanitizeString } from '@/lib/utils';

interface DocumentViewProps {
  document: {
    metadata: {
      title: string;
      plaintiff: string;
      defendant: string;
      date: string;
      topic: string;
      outcome: string;
      pageContent: string;
    };
    content: string;
  };
  quote: string;
  onBack: () => void;
}

export default function DocumentView({ document, quote, onBack }: DocumentViewProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const highlight = contentRef.current.querySelector('.highlight');
      if (highlight) {
        highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [quote]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200">
      {/* Header Section */}
      <div className="p-4 bg-gray-800 shadow-md fixed w-full z-10">
        <button onClick={onBack} className="border rounded-xl px-3 py-2 text-gray-900 hover:text-gray-500 bg-white">
          &larr; Back to search
        </button>
        <h1 className="mt-5 text-2xl font-bold text-indigo-300">{document.metadata.title}</h1>
        <div className="mt-4">
          <span className="font-semibold text-indigo-300">Topic:</span> {document.metadata.topic}
        </div>
        <div className="mt-1">
          <span className="font-semibold text-indigo-300">Verdict:</span> {document.metadata.outcome}
        </div>
        <div className="mt-1">
          <span className="font-semibold text-indigo-300 mb-10">Year:</span> {new Date(document.metadata.date).toLocaleDateString()}
        </div>
      </div>

      {/* Content Section */}
      <div className="mt-24 p-5 overflow-auto flex-1" style={{ paddingTop: '120px' }} ref={contentRef}>
        <div
          className="mt-5 prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizeString(document.metadata.pageContent) }}
        />
      </div>
    </div>
  );
}
