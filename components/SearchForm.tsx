import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";

interface SearchFormProps {
  suggestedSearches: string[];
  onSearch: (query: string) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ suggestedSearches, onSearch }) => {
  const [query, setQuery] = useState<string>("");
  const [suggestions] = useState<string[]>(suggestedSearches);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value === "") {
      setShowSuggestions(true); // Show suggestions if input is empty
    } else {
      setShowSuggestions(false); // Hide suggestions if input has text
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setQuery("");
    setShowSuggestions(false); // Hide suggestions after submitting
  };

  const handleFocus = () => {
    if (!query) {
      setShowSuggestions(true); // Show suggestions on focus only if query is empty
    }
  };

  const handleClear = () => {
    setQuery("");
    setShowSuggestions(true); // Show suggestions when input is cleared
  };

  // Hide suggestions when clicking outside the search form
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className="text-white w-full px-4 py-2 border border-gray-600 bg-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
          placeholder="Search legal docs or view suggestions"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-1/2 transform -translate-y-1/2 right-14 text-gray-600 hover:text-red-600"
          >
            ✕
          </button>
        )}
        <button
          type="submit"
          className={`absolute top-1/2 transform -translate-y-1/2 -right-14 w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300 ${
            !query && "opacity-50 bg-blue-300 cursor-not-allowed"
          }`}
          disabled={!query}
        >
          ➔
        </button>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute mt-2 w-full bg-gray-600 border border-gray-400 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
            <div className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold">Popular Searches</div>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-gray-100"
                onClick={() => {
                  setQuery(suggestion);
                  setShowSuggestions(false); // Hide suggestions after selecting
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchForm;
