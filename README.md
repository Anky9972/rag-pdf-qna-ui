# 📄 PDF Q&A - AI-Powered Document Intelligence Platform

<div align="center">

![PDF Q&A](https://img.shields.io/badge/PDF%20Q%26A-AI%20Powered-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14.2.16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.9-38B2AC?style=for-the-badge&logo=tailwind-css)

**Transform static documents into interactive conversations**

*Upload, analyze, and get cited answers with real-time insights and performance monitoring*

[🚀 Live Demo](#) • [📖 Documentation](#installation) • [🔧 API Reference](#api-routes) • [💬 Support](#support)

</div>

---

## ✨ Features

### 🧠 **AI-Powered Intelligence**
- **Smart Document Processing**: Lightning-fast PDF upload with OCR and intelligent content extraction
- **Conversational AI**: Chat with your documents using advanced RAG (Retrieval-Augmented Generation)
- **Contextual Responses**: Get accurate, cited answers with source references
- **Multi-Document Support**: Query across multiple PDFs simultaneously

### 📊 **Analytics & Monitoring**
- **Real-time Dashboard**: Performance metrics and usage analytics
- **System Health Monitoring**: Track processing times, success rates, and system status
- **Query Analytics**: Understand user behavior and document engagement
- **Prometheus Metrics**: Built-in monitoring with exportable metrics

### 🎯 **User Experience**
- **Modern UI/UX**: Clean, responsive design with dark/light theme support
- **Interactive Features**: Drag-and-drop uploads, real-time search, and filtering
- **Mobile Optimized**: Seamless experience across all devices
- **Authentication**: Secure user management with session handling

### ⚡ **Performance**
- **Fast Processing**: Optimized document ingestion and query responses
- **Efficient Storage**: Smart caching and data management
- **Scalable Architecture**: Built for high-volume document processing
- **Background Tasks**: Non-blocking uploads and processing

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **npm** or **pnpm** or **yarn**
- **Python Backend** (FastAPI server running on port 8000)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/rag-pdf-qna-ui.git
   cd rag-pdf-qna-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_APP_NAME="PDF Q&A"
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

---

## 🏗️ Project Structure

```
rag-pdf-qna-ui/
├── 📁 app/                     # Next.js 14 App Router
│   ├── 📁 (auth)/             # Authentication routes
│   ├── 📁 api/                # API route handlers
│   ├── 📁 chat/               # Chat interface
│   ├── 📁 dashboard/          # Analytics dashboard
│   ├── 📁 documents/          # Document management
│   ├── 📁 monitoring/         # System monitoring
│   └── 📄 layout.tsx          # Root layout
├── 📁 components/             # React components
│   ├── 📁 ui/                 # Shadcn/ui components
│   ├── 📁 auth/               # Authentication components
│   ├── 📁 chat/               # Chat-specific components
│   ├── 📁 documents/          # Document management components
│   └── 📁 analytics/          # Dashboard components
├── 📁 hooks/                  # Custom React hooks
├── 📁 lib/                    # Utility functions
└── 📁 public/                 # Static assets
```

---

## 🎮 Usage Guide

### 📤 **Uploading Documents**

1. **Navigate to Documents** (`/documents`)
2. **Upload PDFs** using drag-and-drop or file picker
3. **Wait for Processing** - documents are automatically indexed
4. **Start Chatting** - your documents are ready for queries!

### 💬 **Chatting with Documents**

1. **Go to Chat** (`/chat`)
2. **Select Documents** from your library
3. **Ask Questions** - natural language queries work best
4. **Get Cited Answers** - responses include source references
5. **Continue Conversations** - maintain context across queries

### 📊 **Monitoring & Analytics**

- **Dashboard** (`/dashboard`) - View usage statistics and performance metrics
- **Monitoring** (`/monitoring`) - Real-time system health and status
- **Metrics** (`/metrics`) - Prometheus-compatible metrics endpoint

---

## 🛠️ Technical Stack

### **Frontend**
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 4.1.9
- **Components**: Radix UI primitives
- **State Management**: SWR for data fetching
- **Animations**: Framer Motion
- **Icons**: Lucide React

### **UI Components**
- **Design System**: Custom components built on Radix UI
- **Theme**: Next-themes for dark/light mode
- **Forms**: React Hook Form with Zod validation
- **Toast Notifications**: Radix UI Toast
- **Charts**: Recharts for data visualization

### **Development Tools**
- **Linting**: ESLint with Next.js configuration
- **Package Manager**: npm/pnpm/yarn support
- **Build Tool**: Next.js built-in bundler
- **Analytics**: Vercel Analytics integration

---

## 🔧 API Routes

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh session

### Documents
- `GET /api/documents` - List user documents
- `POST /api/upload_pdf` - Upload new PDF
- `DELETE /api/documents/[id]` - Delete document
- `GET /api/documents/[id]` - Get document details

### Chat & Queries
- `POST /api/query` - Submit chat query
- `GET /api/conversations` - List conversations
- `POST /api/conversations/create` - Start new conversation
- `GET /api/conversations/[id]/messages` - Get conversation history

### Analytics & Monitoring
- `GET /api/analytics/dashboard` - Dashboard metrics
- `GET /api/health` - System health check
- `GET /api/metrics` - Prometheus metrics
- `GET /api/stats` - Usage statistics

---

## 🎨 Customization

### **Theming**
The application supports comprehensive theming through CSS variables and Tailwind CSS:

```css
/* Light theme */
--background: 0 0% 100%;
--foreground: 224 71.4% 4.1%;
--primary: 262.1 83.3% 57.8%;
--primary-foreground: 210 20% 98%;
```

### **Component Styling**
All components use the `cn()` utility for conditional classes:

```tsx
import { cn } from "@/lib/utils"

<Button className={cn("default-styles", {
  "active-styles": isActive,
  "disabled-styles": disabled
})} />
```

### **Configuration**
Modify `tailwind.config.js` and `components.json` for design system customization.

---

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
npm i -g vercel
vercel --prod
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### **Environment Variables**
Set these in your deployment platform:
```env
NEXT_PUBLIC_API_URL=your-backend-url
NEXT_PUBLIC_APP_NAME="PDF Q&A"
NODE_ENV=production
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Setup**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with conventional commits: `git commit -m 'feat: add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### **Code Standards**
- **TypeScript**: Strict mode enabled
- **ESLint**: Follow the configured rules
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Use semantic commit messages

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Next.js](https://nextjs.org/)** - The React framework for production
- **[Radix UI](https://www.radix-ui.com/)** - Low-level UI primitives
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide](https://lucide.dev/)** - Beautiful & consistent icon library
- **[SWR](https://swr.vercel.app/)** - Data fetching for React

---

## 📞 Support

- **📧 Email**: support@pdfqna.com
- **💬 Discord**: [Join our community](https://discord.gg/pdfqna)
- **🐛 Issues**: [GitHub Issues](https://github.com/your-username/rag-pdf-qna-ui/issues)
- **📖 Docs**: [Full Documentation](https://docs.pdfqna.com)

---

<div align="center">

**Made with ❤️ for the developer community**

[⭐ Star us on GitHub](https://github.com/your-username/rag-pdf-qna-ui) • [🐦 Follow on Twitter](https://twitter.com/pdfqna)

</div>