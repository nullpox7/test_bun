import { GetStaticProps, GetStaticPaths } from 'next'
import Head from 'next/head'
import { PrismaClient } from '@prisma/client'
import { ParsedUrlQuery } from 'querystring'

const prisma = new PrismaClient()

type Post = {
  id: number
  title: string
  content: string
  author: {
    name: string
  }
  createdAt: string
}

type Props = {
  post: Post
}

export default function Post({ post }: Props) {
  return (
    <div className="container">
      <Head>
        <title>{post.title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>{post.title}</h1>
        <p className="author">By {post.author.name}</p>
        <p className="date">{new Date(post.createdAt).toLocaleDateString()}</p>
        <div className="content">{post.content}</div>
      </main>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        main {
          background-color: #f9f9f9;
          padding: 2rem;
          border-radius: 8px;
        }
        h1 {
          color: #333;
          margin-bottom: 0.5rem;
        }
        .author, .date {
          color: #666;
          margin-bottom: 1rem;
        }
        .content {
          line-height: 1.6;
        }
      `}</style>
    </div>
  )
}

interface Params extends ParsedUrlQuery {
  id: string
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await prisma.post.findMany({
    select: { id: true },
  })

  const paths = posts.map((post) => ({
    params: { id: post.id.toString() },
  }))

  return { paths, fallback: 'blocking' }
}

export const getStaticProps: GetStaticProps<Props, Params> = async ({ params }) => {
  const postId = params?.id

  if (!postId) {
    return { notFound: true }
  }

  const post = await prisma.post.findUnique({
    where: { id: parseInt(postId) },
    include: { author: { select: { name: true } } },
  })

  if (!post) {
    return { notFound: true }
  }

  return {
    props: {
      post: {
        ...post,
        createdAt: post.createdAt.toISOString(), // DateをISO文字列に変換
        updatedAt: post.updatedAt.toISOString(), // DateをISO文字列に変換
      },
    },
    revalidate: 60, // ISRを使用: 60秒ごとに再生成
  }
}