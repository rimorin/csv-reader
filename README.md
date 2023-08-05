CSV Invoice Reader

Working Demo: https://csv-reader-khaki.vercel.app/

## Description

This is a web application that allows users to upload invoice CSV file and view the data in a table. The application is built with Next.js and uses Upload.IO to upload files to the cloud and Redis to cache the API response.

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
- [FlowBite CSS](https://flowbite.com) - Wrapper framework for Tailwind CSS
- [Upload.IO](https://upload.io/) - File upload API service that includes CDN
- [Redis](https://redis.io/) - In-memory data structure store for API caching
- [React Table](https://react-table.tanstack.com/) - Table library for React that includes pagination.

## System Design

- Next.js is used for both frontend and backend development. The frontend is rendered on the server and the backend is exposed as an API. This allows for source code to be centered in one repository and for the frontend and backend to be deployed together.

- Flowbite CSS is used as a wrapper for Tailwind CSS. This allows for the frontend to be developed faster and for the frontend to be responsive.

- Upload.IO SDK is used to upload files to the cloud. This allows for the frontend to be lightweight and for the backend upload mechanism to be stateless. The frontend uploads the file to Upload.IO and then sends the file ID to the backend. A file url is then generated and sent back to the frontend.

- Redis cloud is used to cache the API response. This allows for the API to be faster and more scalable. The API will first check if the file url with its parameters such as page, limit and filter is in the cache. If it is, then the API will return the cached response. If it is not, then the API will process the file and then cache the response.

- React Table is used to display the data in a table. It includes mechanisms for pagination. The frontend will send the page, limit and filter parameters to the backend. The backend will then process the file and return the data. The frontend will then display the data in a table.

## Deploy on Production

The easiest way to deploy this project is to use the [Vercel Platform](https://vercel.com/import?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Step 1:
Create an account with [Upload.io](https://upload.io/upload-js/get-started) and get an API key.

Step 2:
Create an account with [Redis Labs](https://redis.com/try-free/) and create a Redis cloud database. Get the host, port, username and password.

Step 3:
Create a new project on Vercel and import the git repository. Configure the following environment variables:

- `NEXT_PUBLIC_UPLOAD_IO_API_KEY` - Upload.IO API key
- `REDIS_HOST` - Cloud Redis host
- `REDIS_PORT` - Redis port
- `REDIS_USERNAME` - Redis username
- `REDIS_PASSWORD` - Redis password

Step 4:
Deploy the project. Vercel will automatically deploy the frontend and backend. The frontend will be deployed on the Vercel CDN and the backend will be deployed on the Vercel serverless platform.

## Future Improvements

- Add integration tests
- Add more detailed tests for backend
- Sorting for table
- Column based filtering for table
