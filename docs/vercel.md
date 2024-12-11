# Vercel Deployment Documentation

## Overview
Documentation for Vercel deployment configuration and management for the Denver Contractors project.

## Project Configuration

### Build Settings
- **Framework Preset**: Next.js
- **Node.js Version**: 18.x
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Environment Variables
Required environment variables in Vercel project settings:
```plaintext
GOOGLE_PLACES_API_KEY=
MONGODB_URI=
MONGODB_DB=
NEXT_PUBLIC_BASE_URL=
```

## Deployment Configuration

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "headers": {
        "Access-Control-Allow-Origin": "*"
      }
    }
  ]
}
```

### Build Optimizations
- **Image Optimization**: Enabled
- **Static Generation**: Used for static pages
- **Incremental Static Regeneration**: Enabled for dynamic content
- **Edge Functions**: Not currently used

## Deployment Process

### Production Deployments
1. Push to main branch triggers automatic deployment
2. Build process runs
3. Automatic preview deployment
4. Production deployment after preview approval

### Preview Deployments
- Created for all pull requests
- Unique URL for testing
- Environment variables from development settings

## Monitoring & Analytics

### Error Tracking
- Runtime errors logged in Vercel dashboard
- Build errors in deployment logs
- Custom error boundaries for React components

### Performance Monitoring
- Web Vitals tracking
- Edge network performance
- API route performance

## Security

### Headers Configuration
```typescript
// next.config.mjs
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
];
```

### SSL/TLS Configuration
- Automatic HTTPS
- TLS 1.2+ required
- HTTP/2 enabled

## Domain Configuration
- Custom domain setup
- Automatic SSL certificates
- DNS configuration

## Caching Strategy
- **Static Assets**: Edge caching
- **API Routes**: Custom cache headers
- **SSG Pages**: ISR when needed

## Best Practices
1. Use environment variables for sensitive data
2. Implement proper error boundaries
3. Monitor build times and sizes
4. Use preview deployments for testing
5. Keep dependencies updated

## Troubleshooting

### Common Issues
1. Build failures
2. Environment variable issues
3. API timeouts
4. Edge function errors

### Solutions
1. Check build logs
2. Verify environment variables
3. Review deployment settings
4. Check API endpoint configuration

## Related Files
- `vercel.json`
- `next.config.mjs`
- `.env.local`

## Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/solutions/nextjs)
- [Edge Network Documentation](https://vercel.com/docs/edge-network/overview)
How to Build a Fullstack App with Next.js, Prisma, and Vercel Postgres
Create a fullstack application with Next.js, Prisma, Vercel Postgres, and deploy to Vercel
Last updated on May 8, 2023
Databases & CMS
Build, Deployment & Git

Prisma is a next-generation ORM that can be used to access a database in Node.js and TypeScript applications. In this guide, you'll learn how to implement a sample fullstack blogging application using the following technologies:
Next.js as the React framework
Next.js API Routes for server-side API routes as the backend
Prisma as the ORM for migrations and database access
Vercel Postgres as the database
NextAuth.js for authentication via GitHub (OAuth)
TypeScript as the programming language
Vercel for deployment
You'll take advantage of the flexible rendering capabilities of Next.js and at the end, you will deploy the app to Vercel.
Prerequisites
To successfully finish this guide, you'll need:
Node.js
A Vercel Account (to set up a free Postgres database and deploy the app)
A GitHub Account (to create an OAuth app)
Step 1: Set up your Next.js starter project
Navigate into a directory of your choice and run the following command in your terminal to set up a new Next.js project with the pages router:
npx create-next-app --example https://github.com/prisma/blogr-nextjs-prisma/tree/main blogr-nextjs-prisma
Create and download the starter project from the repo into a new folder.
You can now navigate into the directory and launch the app:
cd blogr-nextjs-prisma && npm run dev
Start the Next.js application at https://localhost:3000.
Here's what it looks like at the moment:

Current state of the application.
The app currently displays hardcoded data that's returned from getStaticProps in the index.tsx file. Over the course of the next few sections, you'll change this so that the data is returned from an actual database.
Step 2: Set up your Vercel Postgres database
For the purpose of this guide, we'll use a free Postgres database hosted on Vercel. First, push the repo you cloned in Step 1 to our own GitHub and deploy it to Vercel to create a Vercel project.
Once you have a Vercel project, select the Storage tab, then select the Connect Database button. Under the Create New tab, select Postgres and then the Continue button.
To create a new database, do the following in the dialog that opens:
Enter sample_postgres_db (or any other name you wish) under Store Name. The name can only contain alphanumeric letters, "_" and "-" and can't exceed 32 characters.
Select a region. We recommend choosing a region geographically close to your function region (defaults to US East) for reduced latency.
Click Create.
Our empty database is created in the region specified. Because you created the Postgres database in a project, we automatically created and added the following environment variables to the project for you.
After running npm i -g vercel@latest to install the Vercel CLI, pull down the latest environment variables to get your local project working with the Postgres database.
vercel env pull .env
Pull down all the required environment variables locally from the Vercel project
We now have a fully functioning Vercel Postgres database and have all the environment variables to run it locally and on Vercel.
Step 3: Setup Prisma and create the database schema
Next, you will set up Prisma and connect it to your PostgreSQL database. Start by installing the Prisma CLI via npm:
npm install prisma --save-dev
Install the Prisma CLI.
You'll now create the tables in your database using the Prisma CLI.
To do this, create a prisma folder and add a file called schema.prisma, your main Prisma configuration file that will contain your database schema.
Add the following model definitions to your schema.prisma so that it looks like this:
// schema.prisma


generator client {
 provider = "prisma-client-js"
}


datasource db {
 provider = "postgresql"
 url = env("POSTGRES_PRISMA_URL") // uses connection pooling
 directUrl = env("POSTGRES_URL_NON_POOLING") // uses a direct connection
}


model Post {
 id        String     @default(cuid()) @id
 title     String
 content   String?
 published Boolean @default(false)
 author    User?   @relation(fields: [authorId], references: [id])
 authorId  String?
}


model User {
 id            String       @default(cuid()) @id
 name          String?
 email         String?   @unique
 createdAt     DateTime  @default(now()) @map(name: "created_at")
 updatedAt     DateTime  @updatedAt @map(name: "updated_at")
 posts         Post[]
 @@map(name: "users")
}
The Prisma schema.
Note: You're occasionally using `@map`and`@@map`to map some field and model names to different column and table names in the underlying database. This is because NextAuth.js has some special requirements for calling things in your database a certain way.
This Prisma schema defines two models, each of which will map to a table in the underlying database: User and Post. Notice that there's also a relation (one-to-many) between the two models, via the author field on Post and the posts field on User.
To actually create the tables in your database, you now can use the following command of the Prisma CLI:
npx prisma db push
Create the tables in your database based on your Prisma schema.
You should see the following output:
Environment variables loaded from /Users/nikolasburk/Desktop/nextjs-guide/blogr-starter/.env.development.local
Prisma schema loaded from prisma/schema.prisma


🚀  Your database is now in sync with your schema. Done in 2.10s
Output from pushing your Prisma schema to your database.
Congratulations, the tables have been created! Go ahead and add some initial dummy data using Prisma Studio. Run the following command:
npx prisma studio
Open Prisma Studio, a GUI for modifying your database.
Use Prisma Studio's interface to create a new User and Post record and connect them via their relation fields.

Create a new `User` record

Create a new `Post` record and connect it to the `User` record
Step 4. Install and generate Prisma Client
Before you can access your database from Next.js using Prisma, you first need to install Prisma Client in your app. You can install it via npm as follows:
npm install @prisma/client
Install the Prisma Client package.
Because Prisma Client is tailored to your own schema, you need to update it every time your Prisma schema file is changing by running the following command:
npx prisma generate
Regenerate your Prisma Schema.
You'll use a single PrismaClient instance that you can import into any file where it's needed. The instance will be created in a prisma.ts file inside the lib/ directory. Go ahead and create the missing directory and file:
mkdir lib && touch lib/prisma.ts
Create a new folder for the Prisma library.
Now, add the following code to this file:
lib/prisma.ts
import { PrismaClient } from '@prisma/client';


let prisma: PrismaClient;


if (process.env.NODE_ENV === 'production') {
 prisma = new PrismaClient();
} else {
 if (!global.prisma) {
   global.prisma = new PrismaClient();
 }
 prisma = global.prisma;
}


export default prisma;
Create a connection to your Prisma Client.
Now, whenever you need access to your database you can import the prisma instance into the file where it's needed.
Step 5. Update the existing views to load data from the database
The blog post feed that's implemented in pages/index.tsx and the post detail view in pages/p/[id].tsx are currently returning hardcoded data. In this step, you'll adjust the implementation to return data from the database using Prisma Client.
Open pages/index.tsx and add the following code right below the existing import declarations:
pages/index.tsx
import prisma from '../lib/prisma';
Import your Prisma Client.
Your prisma instance will be your interface to the database when you want to read and write data in it. You can for example create a new User record by calling prisma.user.create() or retrieve all the Post records from the database with prisma.post.findMany(). For an overview of the full Prisma Client API, visit the Prisma docs.
Now you can replace the hardcoded feed object in getStaticProps inside index.tsx with a proper call to the database:
index.tsx
export const getStaticProps: GetStaticProps = async () => {
 const feed = await prisma.post.findMany({
   where: { published: true },
   include: {
     author: {
       select: { name: true },
     },
   },
 });
 return {
   props: { feed },
   revalidate: 10,
 };
};
Find all published posts in your database.
The two things to note about the Prisma Client query:
A where filter is specified to include only Post records where published is true
The name of the author of the Post record is queried as well and will be included in the returned objects
Before running the app, head over to /pages/p/[id].tsx and adjust the implementation there as well to read the correct Post record from the database.
This page uses getServerSideProps (SSR) instead of getStaticProps (SSG). This is because the data is dynamic, it depends on the id of the Post that's requested in the URL. For example, the view on route /p/42 displays the Post where the id is 42.
Like before, you first need to import Prisma Client on the page:
pages/p/[id].tsx
import prisma from '../../lib/prisma';
Import your Prisma Client.
Now you can update the implementation of getServerSideProps to retrieve the proper post from the database and make it available to your frontend via the component's props:
pages/p/[id].tsx
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
 const post = await prisma.post.findUnique({
   where: {
     id: String(params?.id),
   },
   include: {
     author: {
       select: { name: true },
     },
   },
 });
 return {
   props: post,
 };
};
Find a specific post based on the ID.
That's it! If your app is not running any more, you can restart it with the following command:
npm run dev
Start your application at http://localhost:3000.
Otherwise, save the files and open the app at http://localhost:3000 in your browser. The Post record will be displayed as follows:

Your newly published post.
You can also click on the post to navigate to its detail view.
Step 6. Set up GitHub authentication with NextAuth
In this step, you will add GitHub authentication to the app. Once that functionality is available, you'll add more features to the app, such that authenticated users can create, publish and delete posts via the UI.
As a first step, go ahead and install the NextAuth.js library in your app:
npm install next-auth@4 @next-auth/prisma-adapter
Install the NextAuth library and the NextAuth Prisma Adapter.
Next, you need to change your database schema to add the missing tables that are required by NextAuth.
To change your database schema, you can manually make changes to your Prisma schema and then run the prisma db push command again. Open schema.prisma and adjust the models in it to look as follows:
// schema.prisma


model Post {
 id        String  @id @default(cuid())
 title     String
 content   String?
 published Boolean @default(false)
 author    User?@relation(fields:[authorId], references:[id])
 authorId  String?}


model Account {
 id                 String  @id @default(cuid())
 userId             String  @map("user_id")
 type               String
 provider           String
 providerAccountId  String  @map("provider_account_id")
 refresh_token      String?
 access_token       String?
 expires_at         Int?
 token_type         String?
 scope              String?
 id_token           String?
 session_state      String?
 oauth_token_secret String?
 oauth_token        String?


 user User @relation(fields:[userId], references:[id], onDelete: Cascade)


 @@unique([provider, providerAccountId])}


model Session {
 id           String   @id @default(cuid())
 sessionToken String   @unique@map("session_token")
 userId       String   @map("user_id")
 expires      DateTime
 user         User     @relation(fields:[userId], references:[id], onDelete: Cascade)}


model User {
 id            String    @id @default(cuid())
 name          String?
 email         String?@unique
 emailVerified DateTime?
 image         String?
 posts         Post[]
 accounts      Account[]
 sessions      Session[]}


model VerificationToken {
 id         Int      @id @default(autoincrement())
 identifier String
 token      String   @unique
 expires    DateTime


 @@unique([identifier, token])}
}
Updated Prisma schema.
To learn more about these models, visit the NextAuth.js docs.
Now you can adjust your database schema by creating the actual tables in the database. Run the following command:
npx prisma db push
Update the tables in your database based on your Prisma schema.
Since you're using GitHub authentication, you also need to create a new OAuth app on GitHub. First, log into your GitHub account. Then, navigate to Settings, then open to Developer Settings, then switch to OAuth Apps.

Create a new OAuth application inside GitHub.
Clicking on the Register a new application (or New OAuth App) button will redirect you to a registration form to fill out some information for your app. The Authorization callback URL should be the Next.js /api/auth route: http://localhost:3000/api/auth.
An important thing to note here is that the Authorization callback URL field only supports a single URL, unlike e.g. Auth0, which allows you to add additional callback URLs separated with a comma. This means if you want to deploy your app later with a production URL, you will need to set up a new GitHub OAuth app.

Ensure your Authorization callback URL is correct.
Click on the Register application button, and then you will be able to find your newly generated Client ID and Client Secret. Copy and paste this info into the .env file in the root directory as the GITHUB_ID and GITHUB_SECRET env vars. Also set the NEXTAUTH_URL to the same value of the Authorization callback URL thar you configured on GitHub: http://localhost:3000/api/auth
# .env


# GitHub OAuth
GITHUB_ID=6bafeb321963449bdf51
GITHUB_SECRET=509298c32faa283f28679ad6de6f86b2472e1bff
NEXTAUTH_URL=http://localhost:3000/api/auth
The completed .env file.
You will also need to persist a user's authentication state across the entire application. Make a quick change in your application's root file _app.tsx and wrap your current root component with a SessionProvider from the next-auth/react package. Open the file and replace its current contents with the following code:
_app.tsx
import { SessionProvider } from 'next-auth/react';
import { AppProps } from 'next/app';


const App = ({ Component, pageProps }: AppProps) => {
 return (
   <SessionProvider session={pageProps.session}>
     <Component {...pageProps} />
   </SessionProvider>
 );
};


export default App;
Wrap your application with the NextAuth SessionProvider.
Step 7. Add Log In functionality
The login button and some other UI components will be added to the Header.tsx file. Open the file and paste the following code into it:
Header.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';


const Header: React.FC = () => {
 const router = useRouter();
 const isActive: (pathname: string) => boolean = (pathname) =>
   router.pathname === pathname;


 const { data: session, status } = useSession();


 let left = (
   <div className="left">
     <Link href="/">
       <a className="bold" data-active={isActive('/')}>
         Feed
       </a>
     </Link>
     <style jsx>{`
       .bold {
         font-weight: bold;
       }


       a {
         text-decoration: none;
         color: var(--geist-foreground);
         display: inline-block;
       }


       .left a[data-active='true'] {
         color: gray;
       }


       a + a {
         margin-left: 1rem;
       }
     `}</style>
   </div>
 );


 let right = null;


 if (status === 'loading') {
   left = (
     <div className="left">
       <Link href="/">
         <a className="bold" data-active={isActive('/')}>
           Feed
         </a>
       </Link>
       <style jsx>{`
         .bold {
           font-weight: bold;
         }


         a {
           text-decoration: none;
           color: var(--geist-foreground);
           display: inline-block;
         }


         .left a[data-active='true'] {
           color: gray;
         }


         a + a {
           margin-left: 1rem;
         }
       `}</style>
     </div>
   );
   right = (
     <div className="right">
       <p>Validating session ...</p>
       <style jsx>{`
         .right {
           margin-left: auto;
         }
       `}</style>
     </div>
   );
 }


 if (!session) {
   right = (
     <div className="right">
       <Link href="/api/auth/signin">
         <a data-active={isActive('/signup')}>Log in</a>
       </Link>
       <style jsx>{`
         a {
           text-decoration: none;
           color: var(--geist-foreground);
           display: inline-block;
         }


         a + a {
           margin-left: 1rem;
         }


         .right {
           margin-left: auto;
         }


         .right a {
           border: 1px solid var(--geist-foreground);
           padding: 0.5rem 1rem;
           border-radius: 3px;
         }
       `}</style>
     </div>
   );
 }


 if (session) {
   left = (
     <div className="left">
       <Link href="/">
         <a className="bold" data-active={isActive('/')}>
           Feed
         </a>
       </Link>
       <Link href="/drafts">
         <a data-active={isActive('/drafts')}>My drafts</a>
       </Link>
       <style jsx>{`
         .bold {
           font-weight: bold;
         }


         a {
           text-decoration: none;
           color: var(--geist-foreground);
           display: inline-block;
         }


         .left a[data-active='true'] {
           color: gray;
         }


         a + a {
           margin-left: 1rem;
         }
       `}</style>
     </div>
   );
   right = (
     <div className="right">
       <p>
         {session.user.name} ({session.user.email})
       </p>
       <Link href="/create">
         <button>
           <a>New post</a>
         </button>
       </Link>
       <button onClick={() => signOut()}>
         <a>Log out</a>
       </button>
       <style jsx>{`
         a {
           text-decoration: none;
           color: var(--geist-foreground);
           display: inline-block;
         }


         p {
           display: inline-block;
           font-size: 13px;
           padding-right: 1rem;
         }


         a + a {
           margin-left: 1rem;
         }


         .right {
           margin-left: auto;
         }


         .right a {
           border: 1px solid var(--geist-foreground);
           padding: 0.5rem 1rem;
           border-radius: 3px;
         }


         button {
           border: none;
         }
       `}</style>
     </div>
   );
 }


 return (
   <nav>
     {left}
     {right}
     <style jsx>{`
       nav {
         display: flex;
         padding: 2rem;
         align-items: center;
       }
     `}</style>
   </nav>
 );
};


export default Header;
Allow the user to log in through the Header.
Here's an overview of how the header is going to render:
If no user is authenticated, a Log in button will be shown.
If a user is authenticated, My drafts, New Post and Log out buttons will be shown.
You can already run the app to validate that this works by running npm run dev, you'll find that the Log in button is now shown. However, if you click it, it does navigate you to http://localhost:3000/api/auth/signin but Next.js is going to render a 404 page for you.
That's because NextAuth.js requires you to set up a specific route for authentication. You'll do that next.
Create a new directory and a new file in the pages/api directory:
mkdir -p pages/api/auth && touch pages/api/auth/[...nextauth].ts
Create a new directory and API route.
In this new pages/api/auth/[...nextauth].ts file, you now need to add the following boilerplate to configure your NextAuth.js setup with your GitHub OAuth credentials and the Prisma adapter:
pages/api/auth/[...nextauth].ts
import { NextApiHandler } from 'next';
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GitHubProvider from 'next-auth/providers/github';
import prisma from '../../../lib/prisma';


const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options);
export default authHandler;


const options = {
 providers: [
   GitHubProvider({
     clientId: process.env.GITHUB_ID,
     clientSecret: process.env.GITHUB_SECRET,
   }),
 ],
 adapter: PrismaAdapter(prisma),
 secret: process.env.SECRET,
};
Set up NextAuth, including the Prisma Adapter.
Once the code is added, you can navigate to http://localhost:3000/api/auth/signin again. This time, the Sign in with GitHub button is shown.

Sign in with GitHub using NextAuth.
If you click it, you're forwarded to GitHub, where you can authenticate with your GitHub credentials. Once the authentication is done, you'll be redirected back into the app.
Note: If you're seeing an error and could not be authenticated, stop the app and re-run it with npm run dev.
The header layout has now changed to display the buttons for authenticated users.

The Header displaying a log out button.
Step 8. Add new post functionality
In this step, you'll implement a way for a user to create a new post. The user can use this feature by clicking the New post button once they're authenticated.
The button already forwards to the /create route, however, this currently leads to a 404 because that route is not implemented yet.
To fix that, create a new file in the pages directory that's called create.tsx:
touch pages/create.tsx
Create a new file for creating posts.
Now, add the following code to the newly created file:
pages/create.tsx
import React, { useState } from 'react';
import Layout from '../components/Layout';
import Router from 'next/router';


const Draft: React.FC = () => {
 const [title, setTitle] = useState('');
 const [content, setContent] = useState('');


 const submitData = async (e: React.SyntheticEvent) => {
   e.preventDefault();
   // TODO
   // You will implement this next ...
 };


 return (
   <Layout>
     <div>
       <form onSubmit={submitData}>
         <h1>New Draft</h1>
         <input
           autoFocus
           onChange={(e) => setTitle(e.target.value)}
           placeholder="Title"
           type="text"
           value={title}
         />
         <textarea
           cols={50}
           onChange={(e) => setContent(e.target.value)}
           placeholder="Content"
           rows={8}
           value={content}
         />
         <input disabled={!content || !title} type="submit" value="Create" />
         <a className="back" href="#" onClick={() => Router.push('/')}>
           or Cancel
         </a>
       </form>
     </div>
     <style jsx>{`
       .page {
         background: var(--geist-background);
         padding: 3rem;
         display: flex;
         justify-content: center;
         align-items: center;
       }


       input[type='text'],
       textarea {
         width: 100%;
         padding: 0.5rem;
         margin: 0.5rem 0;
         border-radius: 0.25rem;
         border: 0.125rem solid rgba(0, 0, 0, 0.2);
       }


       input[type='submit'] {
         background: #ececec;
         border: 0;
         padding: 1rem 2rem;
       }


       .back {
         margin-left: 1rem;
       }
     `}</style>
   </Layout>
 );
};


export default Draft;
A new component to create posts.
This page is wrapped by the Layout component so that it still includes the Header and any other generic UI components.
It renders a form with several input fields. When submitted, the (right now empty) submitData function is called. In that function, you need to pass the data from the React component to an API route which can then handle the actual storage of the new post data in the database.
Here's how you can implement the function:
pages/create.tsx
const submitData = async (e: React.SyntheticEvent) => {
 e.preventDefault();
 try {
   const body = { title, content };
   await fetch('/api/post', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(body),
   });
   await Router.push('/drafts');
 } catch (error) {
   console.error(error);
 }
};
Call your API route to create a post.
In this code, you're using the title and content properties that are extracted from the component state using useState and submit them via an HTTP POST request to the api/post API route.
Afterwards, you're redirecting the user to the /drafts page so that they can immediately see their newly created draft. If you run the app, the /create route renders the following UI:

Create a new draft.
Note however that the implementation doesn't quite work yet because neither api/post nor the /drafts route exist so far. You'll implement these next.
First, let's make sure your backend can handle the POST request that's submitted by the user. Thanks to the Next.js API routes feature, you don't have to "leave your Next.js app" to implement such functionality but instead you can add it to your pages/api directory.
Create a new directory called post with a new file called index.ts:
mkdir -p pages/api/post && touch pages/api/post/index.ts
Create a new API route to create a post.
Note: At this point, you could also have created a file called pages/api/post.ts` instead of taking the detour with an extra directory and an index.ts file. The reason why you're not doing it that way is because you'll need to add a dynamic route for HTTP DELETE requests at the api/post route later as well. In order to save some refactoring later, you're already structuring the files in the required way.
Now, add the following code to pages/api/post/index.ts:
pages/api/post/index.ts
import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';


// POST /api/post
// Required fields in body: title
// Optional fields in body: content
export default async function handle(req, res) {
 const { title, content } = req.body;


 const session = await getSession({ req });
 const result = await prisma.post.create({
   data: {
     title: title,
     content: content,
     author: { connect: { email: session?.user?.email } },
   },
 });
 res.json(result);
}
Update the API route to modify the database using the Prisma Client.
This code implements the handler function for any requests coming in at the /api/post/ route. The implementation does the following: First it extracts the title and cotent from the body of the incoming HTTP POST request. After that, it checks whether the request is coming from an authenticated user with the getSession helper function from NextAuth.js. And finally, it uses Prisma Client to create a new Post record in the database.
You can now test this functionality by opening the app, making sure you're authenticated and create a new post with title and content:

Testing creating a new post via the API Route.
Once you click Create, the Post record will be added to the database. Note that the /drafts route that you're being redirected to right after the creation still renders a 404, that will be fixed soon. However, if you run Prisma Studio again with npx prisma studio, you'll see that the new Post record has been added to the database.
Step 9. Add drafts functionality
In this step, you'll add a new page to the app that allows an authenticated user to view their current drafts.
This page can't be statically rendered because it depends on a user who is authenticated. Pages like this that get their data dynamically based on an authenticated users are a great use case for server-side rendering (SSR) via getServerSideProps.
First, create a new file in the pages directory and call it drafts.tsx:
touch pages/drafts.tsx
Create a new page for your drafts.
Next, add the following code to that file:
pages/drafts.tsx
import React from 'react';
import { GetServerSideProps } from 'next';
import { useSession, getSession } from 'next-auth/react';
import Layout from '../components/Layout';
import Post, { PostProps } from '../components/Post';
import prisma from '../lib/prisma';


export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
 const session = await getSession({ req });
 if (!session) {
   res.statusCode = 403;
   return { props: { drafts: [] } };
 }


 const drafts = await prisma.post.findMany({
   where: {
     author: { email: session.user.email },
     published: false,
   },
   include: {
     author: {
       select: { name: true },
     },
   },
 });
 return {
   props: { drafts },
 };
};


type Props = {
 drafts: PostProps[];
};


const Drafts: React.FC<Props> = (props) => {
 const { data: session } = useSession();


 if (!session) {
   return (
     <Layout>
       <h1>My Drafts</h1>
       <div>You need to be authenticated to view this page.</div>
     </Layout>
   );
 }


 return (
   <Layout>
     <div className="page">
       <h1>My Drafts</h1>
       <main>
         {props.drafts.map((post) => (
           <div key={post.id} className="post">
             <Post post={post} />
           </div>
         ))}
       </main>
     </div>
     <style jsx>{`
       .post {
         background: var(--geist-background);
         transition: box-shadow 0.1s ease-in;
       }


       .post:hover {
         box-shadow: 1px 1px 3px #aaa;
       }


       .post + .post {
         margin-top: 2rem;
       }
     `}</style>
   </Layout>
 );
};


export default Drafts;
Update the Draft page to show a list of drafts.
In this React component, you're rendering a list of "drafts" of the authenticated user. The drafts are retrieved from the database during server-side rendering, because the database query with Prisma Client is executed in getServerSideProps. The data is then made available to the React component via its props.
If you now navigate to the My drafts section of the app, you'll see the unpublished post that you created before:

Completed drafts page.
Step 10. Add Publish functionality
To "move" the draft to the public feed view, you need to be able to "publish" it – that is, setting the published field of a Post record to true. This functionality will be implemented in the post detail view that currently lives in pages/p/[id].tsx.
The functionality will be implemented via an HTTP PUT request that'll be sent to a api/publish route in your "Next.js backend". Go ahead and implement that route first.
Create a new directory inside the pages/api directory called publish. Then create a new file called [id].ts in the new directory:
mkdir -p pages/api/publish && touch pages/api/publish/[id].ts
Create a new API route to publish a post.
Now, add the following code to the newly created file:
pages/api/publish/[id].ts
import prisma from '../../../lib/prisma';


// PUT /api/publish/:id
export default async function handle(req, res) {
 const postId = req.query.id;
 const post = await prisma.post.update({
   where: { id: postId },
   data: { published: true },
 });
 res.json(post);
}
Update the API route to modify the database using the Prisma Client.
This is the implementation of an API route handler which retrieves the ID of a Post from the URL and then uses Prisma Client's update method to set the published field of the Post record to true.
Next, you'll implement the functionality on the frontend in the pages/p/[id].tsx file. Open up the file and replace its contents with the following:
pages/p/[id].tsx
import React from 'react';
import { GetServerSideProps } from 'next';
import ReactMarkdown from 'react-markdown';
import Router from 'next/router';
import Layout from '../../components/Layout';
import { PostProps } from '../../components/Post';
import { useSession } from 'next-auth/react';
import prisma from '../../lib/prisma';


export const getServerSideProps: GetServerSideProps = async ({ params }) => {
 const post = await prisma.post.findUnique({
   where: {
     id: String(params?.id),
   },
   include: {
     author: {
       select: { name: true, email: true },
     },
   },
 });
 return {
   props: post,
 };
};


async function publishPost(id: string): Promise<void> {
 await fetch(`/api/publish/${id}`, {
   method: 'PUT',
 });
 await Router.push('/');
}


const Post: React.FC<PostProps> = (props) => {
 const { data: session, status } = useSession();
 if (status === 'loading') {
   return <div>Authenticating ...</div>;
 }
 const userHasValidSession = Boolean(session);
 const postBelongsToUser = session?.user?.email === props.author?.email;
 let title = props.title;
 if (!props.published) {
   title = `${title} (Draft)`;
 }


 return (
   <Layout>
     <div>
       <h2>{title}</h2>
       <p>By {props?.author?.name || 'Unknown author'}</p>
       <ReactMarkdown children={props.content} />
       {!props.published && userHasValidSession && postBelongsToUser && (
         <button onClick={() => publishPost(props.id)}>Publish</button>
       )}
     </div>
     <style jsx>{`
       .page {
         background: var(--geist-background);
         padding: 2rem;
       }


       .actions {
         margin-top: 2rem;
       }


       button {
         background: #ececec;
         border: 0;
         border-radius: 0.125rem;
         padding: 1rem 2rem;
       }


       button + button {
         margin-left: 1rem;
       }
     `}</style>
   </Layout>
 );
};


export default Post;
Update the Post component to handle publishing via the API Route.
This code adds the publishPost function to the React component which is responsible for sending the HTTP PUT request to the API route you just implemented. The render function of the component is also adjusted to check whether the user is authenticated, and if that's the case, it'll display the Publish button in the post detail view as well:

The publish button shown for a post.
If you click the button, you will be redirected to the public feed and the post will be displayed there!
Note: Once the app is deployed to production, the feed will be updated at most every 10 seconds when it receives a request. That's because you're using static site generation (SSG) via getStaticProps to retrieve the data for this view with Incremental Static Regeneration. If you want data to be updated "immediately", consider using On-Demand Incremental Static Regeneration.
Step 11. Add Delete functionality
The last piece of functionality you'll implement in this guide is to enable users to delete existing Post records. You'll follow a similar approach as for the "publish" functionality by first implementing the API route handler on the backend, and then adjust your frontend to make use of the new route!
Create a new file in the pages/api/post directory and call it [id].ts:
touch pages/api/post/[id].ts
Create a new API route to delete a post.
Now, add the following code to it:
pages/api/post/[id].ts
import prisma from '../../../lib/prisma';


// DELETE /api/post/:id
export default async function handle(req, res) {
 const postId = req.query.id;
 if (req.method === 'DELETE') {
   const post = await prisma.post.delete({
     where: { id: postId },
   });
   res.json(post);
 } else {
   throw new Error(
     `The HTTP ${req.method} method is not supported at this route.`,
   );
 }
}
Update the API route to modify the database using the Prisma Client.
This code handles HTTP DELETE requests that are coming in via the /api/post/:id URL. The route handler then retrieves the id of the Post record from the URL and uses Prisma Client to delete this record in the database.
To make use of this feature on the frontend, you again need to adjust the post detail view. Open pages/p/[id].tsx and insert the following function right below the publishPost function:
pages/p/[id].tsx
async function deletePost(id: string): Promise<void> {
 await fetch(`/api/post/${id}`, {
   method: 'DELETE',
 });
 Router.push('/');
}
Update the Post component to handle deleting via the API Route.
Now, you can follow a similar approach with the Delete button as you did with the Publish button and render it only if the user is authenticated. To achieve this, you can add this code directly in the return part of the Post component right below where the Publish button is rendered:
// pages/p/[id].tsx
{
 !props.published && userHasValidSession && postBelongsToUser && (
   <button onClick={() => publishPost(props.id)}>Publish</button>
 );
}
{
 userHasValidSession && postBelongsToUser && (
   <button onClick={() => deletePost(props.id)}>Delete</button>
 );
}
Logic to determine whether to show the publish and delete buttons.
You can now try out the new functionality by creating a new draft, navigating to its detail view and then clicking the newly appearing Delete button:

The Delete button showing on the post page.
Step 12. Deploy to Vercel
In this final step, you're going to deploy the app to Vercel from a GitHub repo.
Before you can deploy, you need to:
Create another OAuth app on GitHub
Create a new GitHub repo and push your project to it
To start with the OAuth app, go back to step "Step 5. Set up GitHub authentication with NextAuth" and follow the steps to create another OAuth app via the GitHub UI.
This time, the Authorization Callback URL needs to match the domain of your future Vercel deployment which will be based on the Vercel project name. As a Vercel project name, you will choose blogr-nextjs-prisma prepended with your first and lastname: FIRSTNAME-LASTNAME-blogr-nextjs-prisma. For example, if you're called "Jane Doe", your project name should be jane-doe-blogr-nextjs-prisma.
Note: Prepending your first and last name is required to ensure the uniqueness of your deployment URL.
The Authorization Callback URL must therefore be set to https://FIRSTNAME-LASTNAME-blogr-nextjs-prisma.vercel.app/api/auth. Once you created the application, adjust your .env file and set the Client ID as the GITHUB_ID env var and a Client secret as the GITHUB_SECRET env var. The NEXTAUTH_URL env var needs to be set to the same value as the Authorization Callback URL on GitHub: https://FIRSTNAME-LASTNAME-blogr-nextjs-prisma.vercel.app/api/auth.

Update the Authorization callback URL.
Next, create a new GitHub repository with the same name, e.g. jane-doe-blogr-nextjs-prisma. Now, copy the three terminal commands from the bottom section that says ...or push an existing repository from the command line, it should look similar to this:
git remote add origin git@github.com:janedoe/jane-doe-blogr-nextjs-prisma.git
git branch -M main
git push -u origin main
Push to an existing repository.
You now should have your new repository ready at https://github.com/GITHUB_USERNAME/FIRSTNAME-LASTNAME-blogr-nextjs-prisma, e.g. https://github.com/janedoe/jane-doe-blogr-nextjs-prisma.
With the GitHub repo in place, you can now import it to Vercel in order to deploy the app:

Deploy
Now, provide the URL of your GitHub repo in the text field:

Import a git repository to Vercel.
Click Continue. The next screen requires you to set the environment variables for your production deployment:

Add environment variables to Vercel.
Here's what you need to provide:
GITHUB_ID: Set this to the Client ID of the GitHub OAuth app you just created
GITHUB_SECRET: Set this to the Client Secret of the GitHub OAuth app you just created
NEXTAUTH_URL: Set this to the Authorization Callback URL of the GitHub OAuth app you just created
SECRET: Set this to your own strong secret. This was not needed in development as NextAuth.js will generate one if not provided. However, you will need to provide your own value for production otherwise you will receive an error.
You'll also need to link your Vercel postgres database to this Vercel project so that all your database environment variables are automatically added. Once all environment variables are set, hit Deploy. Your app is now being deployed to Vercel. Once it's ready, Vercel will show you the following success screen:

Your application deployed to Vercel.
You can click the Visit button to view the deployed version of your fullstack app 🎉
vercel build
Learn how to build a Vercel Project locally or in your own CI environment using the vercel build CLI command.
The vercel build command can be used to build a Vercel Project locally or in your own CI environment. Build artifacts are placed into the .vercel/output directory according to the Build Output API.
When used in conjunction with the vercel deploy --prebuilt command, this allows a Vercel Deployment to be created without sharing the Vercel Project's source code with Vercel.
This command can also be helpful in debugging a Vercel Project by receiving error messages for a failed build locally, or by inspecting the resulting build artifacts to get a better understanding of how Vercel will create the Deployment.
It is recommended to run the vercel pull command before invoking vercel build to ensure that you have the most recent Project Settings and Environment Variables stored locally.
Usage
terminal
vercel build
Using the vercel build command to build a Vercel Project.
Unique Options
These are options that only apply to the vercel build command.
Production
The --prod option can be specified when you want to build the Vercel Project using Production Environment Variables. By default, the Preview Environment Variables will be used.
terminal
vercel build --prod
Using the vercel build command with the --prod option.
Yes
The --yes option can be used to bypass the confirmation prompt and automatically pull environment variables and Project Settings if not found locally.
terminal
vercel build --yes
Using the vercel build command with the --yes option.
Global Options
The following global options can be passed when using the vercel build command:
--cwd
--debug
--global-config
--help
--local-config
--no-color
--scope
--token
For more information on global options and their usage, refer to the options section.
Related guides
How can I use the Vercel CLI for custom workflows?


How do I generate a “sitemap.xml” for my Next.js app on Vercel?
Guidance on how to generate a "sitemap.xml" at build time and runtime.
Last updated on January 12, 2024
Frameworks

In this article, we will show you how to generate a sitemap for your Next.js application on Vercel.
Generating the Sitemap with Next.js
The Next.js App Router has built in support for generating sitemaps. You can use the sitemap.(js|ts) file convention to programmatically generate a sitemap by exporting a default function that returns an array of URLs. If using TypeScript, a Sitemap type is available.
app/sitemap.ts
import { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap {
 return [
   {
     url: 'https://acme.com',
     lastModified: new Date(),
     changeFrequency: 'yearly',
     priority: 1,
   },
   {
     url: 'https://acme.com/about',
     lastModified: new Date(),
     changeFrequency: 'monthly',
     priority: 0.8,
   },
   {
     url: 'https://acme.com/blog',
     lastModified: new Date(),
     changeFrequency: 'weekly',
     priority: 0.5,
   },
 ]
}
Creating a sitemap with the Next.js App Router
This will generate the following sitemap.xml file during next build:
sitemap.xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
 <url>
   <loc>https://acme.com</loc>
   <lastmod>2023-04-06T15:02:24.021Z</lastmod>
   <changefreq>yearly</changefreq>
   <priority>1</priority>
 </url>
 <url>
   <loc>https://acme.com/about</loc>
   <lastmod>2023-04-06T15:02:24.021Z</lastmod>
   <changefreq>monthly</changefreq>
   <priority>0.8</priority>
 </url>
 <url>
   <loc>https://acme.com/blog</loc>
   <lastmod>2023-04-06T15:02:24.021Z</lastmod>
   <changefreq>weekly</changefreq>
   <priority>0.5</priority>
 </url>
</urlset>
Next.js on Vercel
Vercel is the native Next.js platform, designed to enhance the Next.js experience.
Next.js is a fullstack React framework for the web, maintained by Vercel.
While Next.js works when self-hosting, deploying to Vercel is zero-configuration and provides additional enhancements for scalability, availability, and performance globally.
Getting started
To get started with Next.js on Vercel:
If you already have a project with Next.js, install Vercel CLI and run the vercel command from your project's root directory
Clone one of our Next.js example repos to your favorite git provider and deploy it on Vercel with the button below:

Deploy our Next.js template, or view a live example.
Deploy
Live Example
Or, choose a template from Vercel's marketplace:
Get started in minutes
Deploy a new Next.js project with a template
View All Templates

Next.js App Router Playground
Examples of many Next.js App Router features.

Image Gallery Starter
An image gallery built on Next.js and Cloudinary.

Next.js Boilerplate
Get started with Next.js and React in seconds.
Vercel deployments can integrate with your git provider to generate preview URLs for each pull request you make to your Next.js project.
Incremental Static Regeneration
Incremental Static Regeneration (ISR) allows you to create or update content without redeploying your site. ISR has three main benefits for developers: better performance, improved security, and faster build times.
When self-hosting, (ISR) is limited to a single region workload. Statically generated pages are not distributed closer to visitors by default, without additional configuration or vendoring of a CDN. By default, self-hosted ISR does not persist generated pages to durable storage. Instead, these files are located in the Next.js cache (which expires).
To enable ISR with Next.js in the app router, add an options object with a revalidate property to your fetch requests:
Next.js (/app)
Next.js (/pages)
apps/example/page.tsx
TypeScript
TypeScriptJavaScript
await fetch('https://api.vercel.app/blog', {  next: { revalidate: 10 }, // Seconds});
To summarize, using ISR with Next.js on Vercel:
Better performance with our global Edge Network
Zero-downtime rollouts to previously statically generated pages
Framework-aware infrastructure enables global content updates in 300ms
Generated pages are both cached and persisted to durable storage
Learn more about Incremental Static Regeneration (ISR)
Server-Side Rendering (SSR)
Server-Side Rendering (SSR) allows you to render pages dynamically on the server. This is useful for pages where the rendered data needs to be unique on every request. For example, checking authentication or looking at the location of an incoming request.
On Vercel, you can server-render Next.js applications in either the Node.js runtime (default) with Serverless Functions or the Edge runtime with Edge Functions. This allows you to pick the best rendering strategy on a per-page basis.
To summarize, SSR with Next.js on Vercel:
Scales to zero when not in use
Scales automatically with traffic increases
Has zero-configuration support for Cache-Control headers, including stale-while-revalidate
Framework-aware infrastructure enables switching rendering between Edge/Node.js runtimes
Learn more about SSR
Streaming
Vercel supports streaming in Next.js projects with any of the following:
Route Handlers
Vercel Functions
React Server Components
Streaming data allows you to fetch information in chunks rather than all at once, speeding up Function responses. You can use streams to improve your app's user experience and prevent your functions from failing when fetching large files.
See the streaming quickstart to start streaming with Next.js on Vercel.
Streaming with loading and Suspense
In Next.js 13 (using the app directory), you can use the loading file convention or a Suspense component to show an instant loading state from the server while the content of a route segment loads.
The loading file provides a way to show a loading state for a whole route or route-segment, instead of just particular sections of a page. This file affects all its child elements, including layouts and pages. It continues to display its contents until the data fetching process in the route segment completes.
The following example demonstrates a basic loading file:
loading.tsx
TypeScript
TypeScriptJavaScript
export default function Loading() {  return <p>Loading...</p>;}
Learn more about loading in the Next.js docs.
The Suspense component, introduced in React 18, enables you to display a fallback until components nested within it have finished loading. Using Suspense is more granular than showing a loading state for an entire route, and is useful when only sections of your UI need a loading state.
You can specify a component to show during the loading state with the fallback prop on the Suspense component as shown below:
app/dashboard/page.tsx
TypeScript
TypeScriptJavaScript
import { Suspense } from 'react';import { PostFeed, Weather } from './components'; export default function Posts() {  return (    <section>      <Suspense fallback={<p>Loading feed...</p>}>        <PostFeed />      </Suspense>      <Suspense fallback={<p>Loading weather...</p>}>        <Weather />      </Suspense>    </section>  );}
To summarize, using Streaming with Next.js on Vercel:
Speeds up Function response times, improving your app's user experience
Allows you to fetch large data without exceeding Edge and Serverless Function file size limits
Display initial loading UI with incremental updates from the server as new data becomes available
Learn more about Streaming with Vercel Functions.
Partial Prerendering
Next.js 14 introduces Partial Prerendering as an experimental feature. It is currently not suitable for production environments and is incompatible with the Edge Runtime .
Partial Prerendering (PPR) is an experimental feature in Next.js 14 that allows the static portions of a page to be pre-generated and served from the cache, while the dynamic portions are streamed in a single HTTP request.
When a user visits a route:
A static route shell is served immediately, this makes the initial load fast.
The shell leaves holes where dynamic content will be streamed in to minimize the perceived overall page load time.
The async holes are loaded in parallel, reducing the overall load time of the page.
This approach is useful for pages like dashboards, where unique, per-request data coexists with static elements such as sidebars or layouts. This is different from how your application behaves today, where entire routes are either fully static or dynamic.
See the Partial Prerendering docs to learn more.
Image Optimization
Image Optimization helps you achieve faster page loads by reducing the size of images and using modern image formats.
When deploying to Vercel, images are automatically optimized on demand, keeping your build times fast while improving your page load performance and Core Web Vitals.
When self-hosting, Image Optimization uses the default Next.js server for optimization. This server manages the rendering of pages and serving of static files.
To use Image Optimization with Next.js on Vercel, import the next/image component into the component you'd like to add an image to, as shown in the following example:
Next.js (/app)
Next.js (/pages)
components/ExampleComponent.tsx
TypeScript
TypeScriptJavaScript
import Image from 'next/image' interface ExampleProps {  name: string;} const ExampleComponent = (props: ExampleProps) : => {  return (    <>      <Image        src="example.png"        alt="Example picture"        width={500}        height={500}      />      <span>{props.name}</span>    </>  )}
To summarize, using Image Optimization with Next.js on Vercel:
Zero-configuration Image Optimization when using next/image
Helps your team ensure great performance by default
Keeps your builds fast by optimizing images on-demand
Requires No additional services needed to procure or set up
Learn more about Image Optimization
Font Optimization
next/font enables built-in automatic self-hosting for any font file. This means you can optimally load web fonts with zero layout shift, thanks to the underlying CSS size-adjust property.
This also allows you to use all Google Fonts with performance and privacy in mind. CSS and font files are downloaded at build time and self-hosted with the rest of your static files. No requests are sent to Google by the browser.
Next.js (/app)
Next.js (/pages)
app/layout.tsx
TypeScript
TypeScriptJavaScript
import { Inter } from 'next/font/google'; // If loading a variable font, you don't need to specify the font weightconst inter = Inter({  subsets: ['latin'],  display: 'swap',}); export default function RootLayout({  children,}: {  children: React.ReactNode;}) {  return (    <html lang="en" className={inter.className}>      <body>{children}</body>    </html>  );}
To summarize, using Font Optimization with Next.js on Vercel:
Enables built-in, automatic self-hosting for font files
Loads web fonts with zero layout shift
Allows for CSS and font files to be downloaded at build time and self-hosted with the rest of your static files
Ensures that no requests are sent to Google by the browser
Learn more about Font Optimization
Open Graph Images
Dynamic social card images (using the Open Graph protocol) allow you to create a unique image for every page of your site. This is useful when sharing links on the web through social platforms or through text message.
The Vercel OG image generation library allows you generate fast, dynamic social card images using Next.js API Routes.
On Vercel, your Next.js API Routes using Vercel OG are automatically optimized using Vercel Edge Functions and WebAssembly. This enables social card images to be generated faster, cheaper, and more scalable than self-hosted Next.js.
The following example demonstrates using OG image generation in both the Next.js Pages and App Router:
Next.js (/app)
Next.js (/pages)
app/api/og/route.tsx
TypeScript
TypeScriptJavaScript
import { ImageResponse } from 'next/og';// App router includes @vercel/og.// No need to install it. export const runtime = 'edge'; export async function GET(request: Request) {  return new ImageResponse(    (      <div        style={{          fontSize: 128,          background: 'white',          width: '100%',          height: '100%',          display: 'flex',          textAlign: 'center',          alignItems: 'center',          justifyContent: 'center',        }}      >        Hello world!      </div>    ),    {      width: 1200,      height: 600,    },  );}
To see your generated image, run npm run dev in your terminal and visit the /api/og route in your browser (most likely http://localhost:3000/api/og).
To summarize, the benefits of using Vercel OG with Next.js include:
Instant, dynamic social card images without needing headless browsers
Generated images are automatically cached on the Vercel Edge Network
Image generation is co-located with the rest of your frontend codebase
Learn more about OG Image Generation
Middleware
Middleware is code that executes before a request is processed. Because Middleware runs before the cache, it's an effective way of providing personalization to statically generated content.
When deploying middleware with Next.js on Vercel, you get access to built-in helpers that expose each request's geolocation information. You also get access to the NextRequest and NextResponse objects, which enable rewrites, continuing the middleware chain, and more.
See the Middleware API docs for more information.
To summarize, Middleware with Next.js on Vercel:
Runs using Edge Middleware which are deployed globally
Replaces needing additional services for customizable routing rules
Helps you achieve the best performance for serving content globally
Learn more about Edge Middleware
Draft Mode
Draft Mode enables you to view draft content from your Headless CMS immediately, while still statically generating pages in production.
See our Draft Mode docs to learn how to use it with Next.js.
Self-hosting Draft Mode
When self-hosting, every request using Draft Mode hits the Next.js server, potentially incurring extra load or cost. Further, by spoofing the cookie, malicious users could attempt to gain access to your underlying Next.js server.
Draft Mode security
Deployments on Vercel automatically secure Draft Mode behind the same authentication used for Preview Comments. In order to enable or disable Draft Mode, the viewer must be logged in as a member of the Team. Once enabled, Vercel's Edge Network will bypass the ISR cache automatically and invoke the underlying Serverless Function.
Enabling Draft Mode in Preview Deployments
You and your team members can toggle Draft Mode in the Vercel Toolbar in production, localhost, and Preview Deployments. When you do so, the toolbar will become purple to indicate Draft Mode is active.
The Vercel toolbar when Draft Mode is enabled.
Users outside your Vercel team cannot toggle Draft Mode.
To summarize, the benefits of using Draft Mode with Next.js on Vercel include:
Easily server-render previews of static pages
Adds additional security measures to prevent malicious usage
Integrates with any headless provider of your choice
You can enable and disable Draft Mode in the comments toolbar on Preview Deployments
Learn more about Draft Mode
Web Analytics
Vercel's Web Analytics features enable you to visualize and monitor your application's performance over time. The Analytics tab in your project's dashboard offers detailed insights into your website's visitors, with metrics like top pages, top referrers, and user demographics.
To use Web Analytics, navigate to the Analytics tab of your project dashboard on Vercel and select Enable in the modal that appears.
To track visitors and page views, we recommend first installing our @vercel/analytics package by running the terminal command below in the root directory of your Next.js project:
pnpm
yarn
npm
pnpm i @vercel/analytics
Then, follow the instructions below to add the Analytics component to your app either using the pages directory or the app directory.
The Analytics component is a wrapper around the tracking script, offering more seamless integration with Next.js, including route support.
Add the following code to the root layout:
Next.js (/app)
Next.js (/pages)
app/layout.tsx
TypeScript
TypeScriptJavaScript
import { Analytics } from '@vercel/analytics/next'; export default function RootLayout({  children,}: {  children: React.ReactNode;}) {  return (    <html lang="en">      <head>        <title>Next.js</title>      </head>      <body>        {children}        <Analytics />      </body>    </html>  );}
To summarize, Web Analytics with Next.js on Vercel:
Enables you to track traffic and see your top-performing pages
Offers you detailed breakdowns of visitor demographics, including their OS, browser, geolocation, and more
Learn more about Web Analytics
Speed Insights
You can see data about your project's Core Web Vitals performance in your dashboard on Vercel. Doing so will allow you to track your web application's loading speed, responsiveness, and visual stability so you can improve the overall user experience.
On Vercel, you can track your Next.js app's Core Web Vitals in your project's dashboard.
reportWebVitals
If you're self-hosting your app, you can use the useWebVitals hook to send metrics to any analytics provider. The following example demonstrates a custom WebVitals component that you can use in your app's root layout file:
app/_components/web-vitals.tsx
TypeScript
TypeScriptJavaScript
'use client'; import { useReportWebVitals } from 'next/web-vitals'; export function WebVitals() {  useReportWebVitals((metric) => {    console.log(metric);  });}
You could then reference your custom WebVitals component like this:
app/layout.ts
TypeScript
TypeScriptJavaScript
import { WebVitals } from './_components/web-vitals'; export default function Layout({ children }) {  return (    <html>      <body>        <WebVitals />        {children}      </body>    </html>  );}
Next.js uses Google's web-vitals library to measure the Web Vitals metrics available in reportWebVitals.
To summarize, tracking Web Vitals with Next.js on Vercel:
Enables you to track traffic performance metrics, such as First Contentful Paint, or First Input Delay
Enables you to view performance analytics by page name and URL for more granular analysis
Shows you a score for your app's performance on each recorded metric, which you can use to track improvements or regressions
Learn more about Speed Insights
Service integrations
Vercel has partnered with popular service providers, such as MongoDB and Sanity, to create integrations that make using those services with Next.js easier. There are many integrations across multiple categories, such as Commerce, Databases, and Logging.
To summarize, Integrations on Vercel:
Simplify the process of connecting your preferred services to a Vercel project
Help you achieve the optimal setup for a Vercel project using your preferred service
Configure your environment variables for you
Learn more about Integrations
More benefits
See our Frameworks documentation page to learn about the benefits available to all frameworks when you deploy on Vercel.
More resources
Learn more about deploying Next.js projects on Vercel with the following resources:


