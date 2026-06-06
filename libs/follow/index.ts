// Follow System - Prisma/PostgreSQL backed
// Handles user follow/unfollow, follow status, and follower/following lists

import { prisma } from '@/libs/prisma/client'

/**
 * Follow a user
 */
export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error('Cannot follow yourself')
  }

  // Check if the target user exists
  const targetUser = await prisma.user.findUnique({ where: { id: followingId } })
  if (!targetUser) {
    throw new Error('User not found')
  }

  // Check if already following
  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  })

  if (existing) {
    throw new Error('Already following this user')
  }

  const follow = await prisma.follow.create({
    data: { followerId, followingId },
  })

  return follow
}

/**
 * Unfollow a user
 */
export async function unfollowUser(followerId: string, followingId: string) {
  try {
    await prisma.follow.delete({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    })
    return true
  } catch {
    return false
  }
}

/**
 * Check if user A is following user B
 */
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  })
  return !!follow
}

/**
 * Get the list of users that a user is following
 */
export async function getFollowing(userId: string, limit: number = 50) {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          name: true,
          displayName: true,
          avatarUrl: true,
          role: true,
          candyBalance: true,
          totalPredictions: true,
          correctPredictions: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return follows.map(f => ({
    ...f.following,
    displayName: f.following.displayName || f.following.name,
    followedAt: f.createdAt,
    accuracy: f.following.totalPredictions > 0
      ? Math.round((f.following.correctPredictions / f.following.totalPredictions) * 100)
      : 0,
  }))
}

/**
 * Get the list of users following a user (followers)
 */
export async function getFollowers(userId: string, limit: number = 50) {
  const follows = await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: {
          id: true,
          name: true,
          displayName: true,
          avatarUrl: true,
          role: true,
          candyBalance: true,
          totalPredictions: true,
          correctPredictions: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return follows.map(f => ({
    ...f.follower,
    displayName: f.follower.displayName || f.follower.name,
    followedAt: f.createdAt,
    accuracy: f.follower.totalPredictions > 0
      ? Math.round((f.follower.correctPredictions / f.follower.totalPredictions) * 100)
      : 0,
  }))
}

/**
 * Get follower and following counts
 */
export async function getFollowCounts(userId: string) {
  const [followersCount, followingCount] = await Promise.all([
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
  ])
  return { followersCount, followingCount }
}
