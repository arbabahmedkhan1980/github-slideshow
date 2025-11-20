import Link from "next/link";
import { Project } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type ProjectWithRelations = Project & {
  bathroomTypes: { id: string; name: string; instanceCount: number }[];
  floors: { id: string }[];
};

type Props = {
  projects: ProjectWithRelations[];
};

export const ProjectList = ({ projects }: Props) => {
  if (!projects.length) {
    return (
      <Card className="p-8 text-center text-slate-500">
        <p>No projects yet. Create one to get started.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {projects.map((project) => {
        const typeCount = project.bathroomTypes.reduce(
          (sum, type) => sum + (type.instanceCount ?? 0),
          0
        );
        return (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="transition hover:border-brand hover:shadow-md">
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {project.name}
                  </h3>
                  <span className="text-xs uppercase tracking-wide text-brand">
                    {project.clientName ?? "Internal"}
                  </span>
                </div>
                <dl className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <dt className="text-slate-500">Floors</dt>
                    <dd className="text-slate-900 font-semibold">
                      {project.floors.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Bathroom types</dt>
                    <dd className="text-slate-900 font-semibold">
                      {project.bathroomTypes.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Instances</dt>
                    <dd className="text-slate-900 font-semibold">{typeCount}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};
