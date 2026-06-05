import { prisma } from '@/libs/prisma/client'

const SYSTEM_EMAIL = 'system@football.netown.cn'

const FOOTBALL_IMAGES = [
  'https://images.unsplash.com/photo-1489944440615?w=800',
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
  'https://images.unsplash.com/photo-1431324155629?w=800',
]

export const MASTER_POST_KEYS = [
  'master-beckham_chen',
  'master-zidane_gao',
  'master-batistuta_zhang',
  'master-shearer_zhang',
  'master-ronaldo_silva',
] as const

/** Resolve UI id (cuid or master-*) to a database Post id for comments. */
export async function resolvePostId(postId: string): Promise<string | null> {
  if (!postId.startsWith('master-')) {
    const post = await prisma.post.findUnique({ where: { id: postId } })
    return post ? post.id : null
  }

  const existing = await prisma.post.findUnique({
    where: { masterKey: postId },
  })
  if (existing) return existing.id

  let systemUser = await prisma.user.findUnique({
    where: { email: SYSTEM_EMAIL },
  })
  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        email: SYSTEM_EMAIL,
        name: 'Netown AI Experts',
        role: 'system',
        candyBalance: 0,
      },
    })
  }

  const created = await prisma.post.create({
    data: {
      userId: systemUser.id,
      content: `AI Expert discussion thread: ${postId.replace('master-', '').replace('_', ' ')}`,
      imageUrl: FOOTBALL_IMAGES[Math.floor(Math.random() * FOOTBALL_IMAGES.length)],
      masterKey: postId,
    },
  })
  return created.id
}
