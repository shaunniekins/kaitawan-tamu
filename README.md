
# Kaitawan Tamu

A fully functional Next.js project integrated with Supabase for authentication, leveraging Tailwind CSS for styling and NextUI for enhanced UI components. This project seamlessly supports both Client and Server Components across the Next.js stack.

## Features

- **Full Next.js Integration**  
  Works seamlessly across the entire Next.js stack:
  - **App Router**: Compatible with the latest routing paradigm in Next.js.
  - **Middleware**: Add custom logic at various stages of the request lifecycle.
  - **Client & Server Components**: Works flawlessly with both Next.js Client and Server Components.
  - It just works!
  
- **Supabase SSR**  
  Leverages the `supabase-ssr` package to configure Supabase Auth using cookies for seamless user session management across:
  - Client Components
  - Server Components
  - Route Handlers
  - Middleware

- **Tailwind CSS & NextUI Styling**  
  Enjoy responsive, customizable styles using [Tailwind CSS](https://tailwindcss.com) and pre-built components from [NextUI](https://nextui.org).

- **Easy Deployment**  
  Simplified deployment using the [Supabase Vercel Integration](#deploy-to-vercel), where environment variables are automatically configured.

## Deploy to Vercel

Deploy this project on Vercel, and you'll be guided through the process of setting up a Supabase account and project. After the installation of the Supabase integration, all necessary environment variables will be automatically assigned to your Vercel project for a fully functional deployment.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/)

The above button will:
1. Clone this repository to your GitHub account.
2. Set up a new Supabase project and automatically configure environment variables for deployment.

Alternatively, follow the steps below to set up and run the project locally.

## Clone and Run Locally

To run this project locally, follow these steps:

1. **Set up Supabase**  
   You will first need a Supabase project. Sign up or log in to create one via the [Supabase dashboard](https://database.new).

2. **Clone the repository**  
   Open your terminal and run the following command to clone the repository:

   ```bash
   git clone <repository-url>
   ```

3. **Navigate into the project directory**  
   Change into the project folder:

   ```bash
   cd <project-directory>
   ```

4. **Set up environment variables**  
   Create a `.env.local` file in the root directory and add the following environment variables:

   ```bash
   NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=<your-supabase-role-key>
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   MJ_APIKEY_PUBLIC=<your-mailjet-public-key>
   MJ_APIKEY_PRIVATE=<your-mailjet-private-key>
   MJ_EMAIL_REGISTERED=<your-mailjet-registered-email>
   NEXT_PUBLIC_GOOGLE_API_KEY=<your-google-api-key>
   ```

   These keys can be found in the Supabase project's **API settings**.

5. **Install dependencies**  
   Run the following command to install the necessary dependencies:

   ```bash
   npm install
   ```

6. **Start the development server**  
   Run the following command to start the Next.js development server:

   ```bash
   npm run dev
   ```

7. **Access the application**  
   Open your browser and navigate to `http://localhost:3000` to view the application running locally.
