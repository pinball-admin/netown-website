import { prisma } from '@/libs/prisma/client'

export interface TerritoryWithInfo {
  teamCode: string
  claimedBy: {
    id: string
    name: string
    displayName: string | null
    avatarUrl: string | null
  } | null
  claimedAt: Date | null
  memberCount: number
}

export interface TerritoryDetail extends TerritoryWithInfo {
  members: Array<{
    id: string
    userId: string
    name: string
    displayName: string | null
    avatarUrl: string | null
    joinedAt: Date
  }>
}

export async function getTerritories(): Promise<TerritoryWithInfo[]> {
  const territories = await prisma.territory.findMany({
    orderBy: { teamCode: 'asc' },
    include: {
      claimedBy: {
        select: { id: true, name: true, displayName: true, avatarUrl: true },
      },
      _count: { select: { members: true } },
    },
  })

  return territories.map((t) => ({
    teamCode: t.teamCode,
    claimedBy: t.claimedBy,
    claimedAt: t.claimedAt,
    memberCount: t._count.members,
  }))
}

export async function getTerritory(teamCode: string): Promise<TerritoryDetail | null> {
  const territory = await prisma.territory.findUnique({
    where: { teamCode },
    include: {
      claimedBy: {
        select: { id: true, name: true, displayName: true, avatarUrl: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, displayName: true, avatarUrl: true },
          },
        },
        orderBy: { joinedAt: 'asc' },
      },
      _count: { select: { members: true } },
    },
  })

  if (!territory) return null

  return {
    teamCode: territory.teamCode,
    claimedBy: territory.claimedBy,
    claimedAt: territory.claimedAt,
    memberCount: territory._count.members,
    members: territory.members.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name,
      displayName: m.user.displayName,
      avatarUrl: m.user.avatarUrl,
      joinedAt: m.joinedAt,
    })),
  }
}

export async function claimTerritory(userId: string, teamCode: string) {
  // Check if user already owns a territory
  const existingClaim = await prisma.territory.findFirst({
    where: { claimedById: userId },
  })
  if (existingClaim) {
    throw new Error('You already own a territory')
  }

  // Check if user is already a member of another territory
  const existingMembership = await prisma.territoryMember.findFirst({
    where: { userId },
  })
  if (existingMembership) {
    throw new Error('You are already a member of another territory')
  }

  // Check if territory exists and is unclaimed
  const territory = await prisma.territory.findUnique({ where: { teamCode } })
  if (!territory) {
    throw new Error('Territory not found')
  }
  if (territory.claimedById) {
    throw new Error('This territory is already claimed')
  }

  // Claim the territory
  return prisma.territory.update({
    where: { teamCode },
    data: {
      claimedById: userId,
      claimedAt: new Date(),
    },
  })
}

export async function unclaimTerritory(userId: string, teamCode: string) {
  const territory = await prisma.territory.findUnique({ where: { teamCode } })
  if (!territory) throw new Error('Territory not found')
  if (territory.claimedById !== userId) throw new Error('Only the territory owner can unclaim')

  // Delete all members first, then unclaim
  await prisma.$transaction([
    prisma.territoryMember.deleteMany({ where: { territoryId: territory.id } }),
    prisma.territory.update({
      where: { teamCode },
      data: { claimedById: null, claimedAt: null },
    }),
  ])

  return true
}

export async function joinTerritory(userId: string, teamCode: string) {
  const territory = await prisma.territory.findUnique({ where: { teamCode } })
  if (!territory) throw new Error('Territory not found')
  if (!territory.claimedById) throw new Error('This territory has not been claimed yet')
  if (territory.claimedById === userId) throw new Error('You own this territory')

  // Check if user already has a membership
  const existingMembership = await prisma.territoryMember.findFirst({
    where: { userId },
  })
  if (existingMembership) {
    throw new Error('You are already a member of another territory')
  }

  // Check for duplicate
  const duplicate = await prisma.territoryMember.findUnique({
    where: { territoryId_userId: { territoryId: territory.id, userId } },
  })
  if (duplicate) throw new Error('Already a member of this territory')

  return prisma.territoryMember.create({
    data: { territoryId: territory.id, userId },
  })
}

export async function leaveTerritory(userId: string, teamCode: string) {
  const territory = await prisma.territory.findUnique({ where: { teamCode } })
  if (!territory) throw new Error('Territory not found')

  if (territory.claimedById === userId) {
    throw new Error('Territory owner cannot leave. Use unclaim instead.')
  }

  const membership = await prisma.territoryMember.findUnique({
    where: { territoryId_userId: { territoryId: territory.id, userId } },
  })
  if (!membership) throw new Error('You are not a member of this territory')

  await prisma.territoryMember.delete({ where: { id: membership.id } })
  return true
}

export async function getUserTerritory(userId: string) {
  // Check if user owns a territory
  const owned = await prisma.territory.findFirst({
    where: { claimedById: userId },
    include: { _count: { select: { members: true } } },
  })
  if (owned) {
    return {
      teamCode: owned.teamCode,
      role: 'owner' as const,
      memberCount: owned._count.members,
    }
  }

  // Check if user is a member
  const membership = await prisma.territoryMember.findFirst({
    where: { userId },
    include: {
      territory: {
        include: { _count: { select: { members: true } } },
      },
    },
  })
  if (membership) {
    return {
      teamCode: membership.territory.teamCode,
      role: 'member' as const,
      memberCount: membership.territory._count.members,
    }
  }

  return null
}

export async function getPopularTerritories(limit = 5) {
  const territories = await prisma.territory.findMany({
    where: { claimedById: { not: null } },
    include: {
      claimedBy: {
        select: { id: true, name: true, displayName: true, avatarUrl: true },
      },
      _count: { select: { members: true } },
    },
    orderBy: { members: { _count: 'desc' } },
    take: limit,
  })

  return territories.map((t) => ({
    teamCode: t.teamCode,
    claimedBy: t.claimedBy,
    memberCount: t._count.members,
  }))
}
