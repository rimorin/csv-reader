CSV Invoice Reader

## Getting Started

1. Clone the repo
2. Install dependencies
3. Configure the following environment variables
   - `NEXT_PUBLIC_UPLOAD_IO_API_KEY` - Upload.IO API key
   - `REDIS_HOST` - Local or Cloud Redis host
   - `REDIS_PORT` - Redis port
   - `REDIS_USERNAME` - Redis username
   - `REDIS_PASSWORD` - Redis password
4. Run the development server

```bash
git clone
cd csv-invoice-reader
npm install
npm run dev
# or
yarn
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technologies Used

- [Next.js](https://nextjs.org/) - React Framework for frontend and backend development
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Upload.IO](https://upload.io/) - File upload API service that includes CDN
- [Redis](https://redis.io/) - In-memory data structure store for API caching
- [React Table](https://react-table.tanstack.com/) - Table library for React that includes pagination.

## Deploy on Vercel

The easiest way to deploy this project is to use the [Vercel Platform](https://vercel.com/import?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).
