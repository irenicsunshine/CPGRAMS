# CPGRAMS (Centralized Public Grievance Redress and Monitoring System)

## Overview

CPGRAMS is a comprehensive grievance handling platform designed to streamline the process of receiving, managing, and resolving public grievances. This web application provides an intuitive interface for citizens to submit complaints and for administrators to efficiently track and process these grievances.

## Features

- **User Authentication**: Secure login system for citizens and administrators
- **Grievance Submission**: Intuitive form for citizens to submit detailed grievances
- **Dashboard**: Comprehensive overview of grievances for administrators
- **AI-Powered Analysis**: Smart categorization and prioritization of grievances
- **Voice Interaction**: ElevenLabs integration for voice-based interactions
- **PDF Generation**: Export grievances and reports as PDF documents
- **Real-time Updates**: Track the status of grievances in real-time
- **Advanced Search**: Quickly find specific grievances using various filters
- **Responsive Design**: Optimized for both desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd grm-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp template.env .env.local
   ```
   Edit `.env.local` with your API keys and configuration.

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Technology Stack

- **Frontend**: React 19, Next.js 15.3.2
- **Styling**: Tailwind CSS, Radix UI components
- **AI Integration**: AI SDK with Anthropic and Google Vertex
- **Voice Features**: ElevenLabs
- **PDF Generation**: html2pdf.js, react-to-pdf
- **State Management**: React Context API
- **Build Tool**: Turbopack

## Project Structure

- `/app`: Core application pages and API routes
- `/components`: Reusable UI components
- `/lib`: Utility functions and shared logic
- `/public`: Static assets
- `/utils`: Helper functions

## Deployment

This application is optimized for deployment on Vercel, but can be deployed to any platform that supports Next.js applications.

```bash
npm run build
npm run start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions about the application, please open an issue in the repository or contact the project maintainers.
