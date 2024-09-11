import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type PostData = {
  title: string
  content: string
  authorId: number
}

// 投稿作成の関数
async function createPost(req, res) {
  const { title, content, authorId } = req.body;

  // ユーザーが存在するか確認
  const user = await prisma.user.findUnique({
    where: { id: authorId },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // 投稿を作成
  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId, // 有効なauthorIdを使用
      createdAt: new Date(),
    },
  });

  return res.json(post);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { title, content, authorId }: PostData = req.body

      // バリデーション
      if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' })
      }

      // 投稿を作成
      const newPost = await createPost(req, res)

      res.status(201).json(newPost)
    } catch (error) {
      console.error('Error creating post:', error)
      res.status(500).json({ message: 'Error creating post' })
    }
  } else if (req.method === 'GET') {
    try {
      // すべての投稿を取得
      const posts = await prisma.post.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      })

      res.status(200).json(posts)
    } catch (error) {
      console.error('Error fetching posts:', error)
      res.status(500).json({ message: 'Error fetching posts' })
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}