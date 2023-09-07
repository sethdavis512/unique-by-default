import type { User, Entry } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Entry } from "@prisma/client";

export function getEntry({
  id,
  userId,
}: Pick<Entry, "id"> & {
  userId: User["id"];
}) {
  return prisma.entry.findFirst({
    select: { id: true, body: true, title: true },
    where: { id, userId },
  });
}

export function getAllMoods() {
  return prisma.mood.findMany();
}

export function createEntry({
  body,
  title,
  userId,
}: Pick<Entry, "body" | "title"> & {
  userId: User["id"];
}) {
  return prisma.entry.create({
    data: {
      title,
      body,
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
