import { NextResponse } from 'next/server'
import { requireAdmin } from '@/libs/auth/admin'
import { prisma } from '@/libs/prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')))
  const search = searchParams.get('search') || ''
  const type = searchParams.get('type') || 'all' // 'all' | 'forum' | 'system'

  const where: any = {}
  if (search) where.content = { contains: search }
  if (type === 'forum') where.masterKey = null
  if (type === 'system') where.masterKey = { not: null }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        _count: { select: { comments: true, reactions: true } },
      },
    }),
    prisma.post.count({ where }),
  ])

  return NextResponse.json({ success: true, posts, total, page, pageSize })
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin()
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { postId } = await request.json()
  if (!postId) {
    return NextResponse.json({ success: false, message: 'postId required' }, { status: 400 })
  }

  // Verify post exists before deleting
  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) {
    return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 })
  }

  await prisma.post.delete({ where: { id: postId } })

  return NextResponse.json({ success: true })
}
