import { prisma } from "@/db/client";

export const getProjects = () => {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      floors: true,
      bathroomTypes: true
    }
  });
};

export const getProjectById = (projectId: string) => {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      floors: {
        include: {
          bathroomInstances: true
        }
      },
      bathroomTypes: {
        include: {
          config: true,
          costSnapshots: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      }
    }
  });
};
