# Jaisu

Jaisu is a modern, web-based AI toolkit designed to enhance productivity. It features a conversational AI chat assistant and a powerful on-device text extractor (OCR) for images, all wrapped in a clean, responsive, and intuitive user interface built with React and Tailwind CSS.

## Features

- **Unified Platform:** A central home page to access all available AI tools.
- **Responsive Design:** A seamless experience across desktop and mobile devices.

### AI Chat Assistant
- **Intelligent Conversations:** Engage in dynamic conversations with an AI powered by GPT-3.5-Turbo via the Puter.com API.
- **Conversation Management:** Create new chats and switch between multiple conversation threads.
- **Markdown Support:** Renders AI responses in Markdown, including syntax highlighting for code blocks.
- **Streaming-like UI:** Displays a "Thinking..." status while fetching responses for better user feedback.

### Text Extractor (OCR)
- **Image-to-Text:** Upload an image (PNG, JPG, etc.) and extract its text content directly in your browser.
- **On-Device Processing:** Utilizes Tesseract.js for fast, private, and secure text recognition without sending images to a server.
- **Text Analytics:** Instantly get detailed statistics on the extracted text, including character, word, sentence, and paragraph counts.
- **Organized Interface:** A tabbed view to easily switch between the extracted text, statistics, and language information.

## Tech Stack

- **Framework:** React
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **AI Chat:** Puter.com API
- **OCR:** Tesseract.js
- **Markdown Rendering:** React Markdown, Remark GFM, Rehype Highlight

## Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

- Node.js (v18.x or later)
- npm, pnpm, or yarn

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/sudhaanshuu/jaisu.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd jaisu
    ```
3.  Install NPM packages:
    ```sh
    npm install
    ```

### Running the Application

To start the development server, run the following command:

```sh
npm run dev
```

Open your browser and navigate to the local URL provided (usually `http://localhost:5173`).

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Starts the Vite development server with Hot Module Replacement.
- `npm run build`: Bundles the app for production into the `dist` folder.
- `npm run lint`: Lints the source code using ESLint to identify and fix problems.
- `npm run preview`: Serves the production build locally to preview the final app.
