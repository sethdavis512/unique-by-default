import type { User, Entry, Mood } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Entry } from "@prisma/client";

export function getEntry({
  id,
  userId,
}: Pick<Entry, "id"> & {
  userId: User["id"];
}) {
  return prisma.entry.findFirst({
    select: { id: true, body: true, title: true, moods: true },
    where: { id, userId },
  });
}

export function getEntryListItems({ userId }: { userId: User["id"] }) {
  return prisma.entry.findMany({
    where: { userId },
    select: { id: true, title: true, body: true, createdAt: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createEntry({
  body,
  title,
  userId,
  moodArr,
}: Pick<Entry, "body" | "title"> & {
  userId: User["id"];
  moodArr: { id: string }[]
}) {
  return prisma.entry.create({
    data: {
      title,
      body,
      moods: {
        connect: moodArr
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function updateEntry({
  id,
  title,
  body,
}: Pick<Entry, "id"> & { title: string; body: string }) {
  return prisma.entry.update({
    where: {
      id,
    },
    data: {
      title,
      body,
    }
  });
}

export function deleteEntry({
  id,
  userId,
}: Pick<Entry, "id"> & { userId: User["id"] }) {
  return prisma.entry.deleteMany({
    where: { id, userId },
  });
}
