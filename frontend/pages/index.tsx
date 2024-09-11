import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type Post = {
  id: string
  title: string
  date: string
  excerpt: string
}

type HomeProps = {
  posts: Post[]
}

export default function Home({ posts }: HomeProps) {
  return (
    <div className="container">
      <Head>
        <title>My Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">Welcome to My Blog</h1>

        <Link href="/admin/create-post" legacyBehavior>
          <a className="create-post-link">Create New Post</a>
        </Link>

        <div className="posts">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <Link href={`/posts/${post.id}`}>
                <h2>{post.title}</h2>
              </Link>
              <p className="date">{post.date}</p>
              <p className="excerpt">{post.excerpt}</p>
            </div>
          ))}
        </div>
      </main>

      <footer>
        <p>© 2024 My Blog</p>
      </footer>

      <style jsx>{`
        .create-post-link {
          margin-bottom: 2rem;
          font-size: 1.2rem;
          color: #0070f3;
          text-decoration: underline;
        }
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
          text-align: center;
        }
        .posts {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .post-card {
          margin: 1rem;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
          width: 100%;
          max-width: 800px;
        }
        .post-card:hover,
        .post-card:focus,
        .post-card:active {
          color: #0070f3;
          border-color: #0070f3;
        }
        .post-card h2 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }
        .post-card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }
        .date {
          color: #666;
          font-size: 1rem;
        }
      `}</style>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      createdAt: true, // 日付を取得
      content: true, // 内容を取得
    },
  });

  // 日付と抜粋を整形
  const formattedPosts = posts.map((post) => ({
    id: post.id.toString(),
    title: post.title,
    date: post.createdAt.toISOString().split('T')[0], // YYYY-MM-DD形式
    excerpt: post.content.substring(0, 100) + '...', // 抜粋を作成
  }));

  return {
    props: {
      posts: formattedPosts,
    },
  };
}