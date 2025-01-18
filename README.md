`Cannot host Due to the high maxDuration of 300`

# Leagal Search App

⚖️ Legal Search is an innovative platform that enables users to search and explore legal cases worldwide, providing efficient access to case laws, legal precedents, and comprehensive research tools.

The **Legal Document Search** is a web application that allows users to efficiently explore and search through a collection of legal documents using natural language queries. This app is designed to assist legal professionals, researchers, and anyone interested in legal precedents by providing an easy-to-use interface to search for relevant cases, rulings, and legal concepts.

The application leverages a robust backend index of legal documents, which can be dynamically updated and searched in real-time. Users can search for specific cases, statutes, or legal issues, and view detailed results with metadata, including topic, verdict, and date.

<br />

![alt text](public/Readme_image/front.png)

## Key Features:
- **Natural Language Search:** Users can search for cases or legal content using plain language queries.
- **Bootstrap Procedure:** The app ensures that the legal document index is pre-processed and ready for searching.
- **Search Results Display:** Displays a list of relevant documents with metadata such as title, topic, verdict, and date.
- **Document Preview:** Click on a result to view the full document and quote section.
- **Suggested Searches:** The app provides a list of suggested search queries to guide users in exploring specific legal topics.
- **Error Handling:** Displays informative error messages when the search or bootstrap procedure fails.

## Technologies Used:
- **Frontend:** Next js, TypeScript, Tailwind CSS
- **Backend:** Node.js with custom API routes for search and bootstrap procedures
- **API keys:** Pinecone, voyage (stored laws)

## How It Works:
- **Bootstrap:** The application initializes the legal document index, ensuring it's ready for searching.
- **Search:** Users can input queries, and the app fetches relevant documents from the index, displaying the results.
- **API Fetching:** When user  search the cases it fetch the data from `pinecone` with the help of API.
- **Display Results:** The search results show important metadata and a brief snippet of each document.
- **Document View:** Users can view the full document by clicking on a result.

## Future Improvements:
- Enhance search algorithms to include more advanced filtering and sorting options.
- Allow for more detailed document views with full-text search and annotations.
- Improve error handling and performance for larger datasets.

## Installation:
1. Clone the repository:
>```bash
>git clone https://github.com/Vaibhav-kesarwani/Legal-search.git
>```
2. Install dependencies:
>```bash
>pnpm i
>or
>npm i
>```

3. Setting Up API Keys:
>1. **Create a `.env` file:** In the root directory of your project, create a `.env` file. This file will store your sensitive environment variables such as API keys and configuration values.
>2. **Get API Keys:** You will need API keys from the following services:
>> - **Pinecone:** Follow the instructions to obtain the Pinecone API key by visiting [Pinecone's Quickstart Guide.](https://docs.pinecone.io/guides/get-started/quickstart)
>> - **VoyageAI:** Follow the instructions to obtain the VoyageAI API key by visiting [VoyageAI API Key & Installation Guide.](https://docs.voyageai.com/docs/api-key-and-installation)
>3. **Store API Keys in `.env` file:** Once you have the keys, add them to your `.env` file. It should look like this:
>>>```bash
>>>PINECONE_API_KEY=your_pinecone_api_key_here
>>>VOYAGE_API_KEY=your_voyageai_api_key_here
>>>```

4. Run the development server:
>```bash
>pnpm run dev
>or
>npm run dev
>```

Visit `http://localhost:300` to view the app.

## Contributing
Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

- Fork the repository & Star the repository
- Create a new branch (git checkout -b feature)
- Make your changes
- Commit your changes (git commit -am 'Add new feature')
- Push to the branch (git push origin feature)
- Create a new Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](https://github.com/Vaibhav-kesarwani/Legal-search/blob/main/LICENSE) file for details.
