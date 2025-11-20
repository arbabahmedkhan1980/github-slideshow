import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getProjectById } from "@/server/projects/queries";
import { AddFloorForm } from "@/features/floors/add-floor-form";
import { UploadPlanForm } from "@/features/floors/upload-plan-form";
import { ManualBathroomForm } from "@/features/bathrooms/manual-bathroom-form";
import { GroupBathroomsButton } from "@/features/bathrooms/group-bathrooms-button";
import { RunCostButton } from "@/features/costing/run-cost-button";
import { SpecConfigForm } from "@/features/costing/spec-config-form";
import { GenerateProposalButton } from "@/features/projects/generate-proposal-button";
import { formatCurrency, formatDimension } from "@/lib/utils";

type Params = {
  params: { projectId: string };
};

export default async function ProjectPage({ params }: Params) {
  const project = await getProjectById(params.projectId);

  if (!project) {
    notFound();
  }

  const floors = project.floors;

  return (
    <AppShell
      title={project.name}
      actions={
        <div className="flex gap-3">
          <GroupBathroomsButton projectId={project.id} />
          <GenerateProposalButton
            projectId={project.id}
            projectName={project.name}
          />
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-slate-900">Floors</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {floors.map((floor) => (
                <div key={floor.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {floor.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        Bathrooms detected: {floor.bathroomInstances.length}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Upload plan
                      </p>
                      <UploadPlanForm floorId={floor.id} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Manual bathrooms
                      </p>
                      <ManualBathroomForm
                        projectId={project.id}
                        floors={floors.map((f) => ({ id: f.id, name: f.name }))}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {!floors.length && (
                <p className="text-sm text-slate-500">
                  No floors yet. Use the form on the right to add one.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-slate-900">
                Bathroom types
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.bathroomTypes.map((type) => {
                const snapshot = type.costSnapshots[0];
                return (
                  <div
                    key={type.id}
                    className="rounded-lg border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">
                          {type.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatDimension(type.lengthMm, type.widthMm)} · Qty{" "}
                          {type.instanceCount}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Cost per pod</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {snapshot
                            ? formatCurrency(snapshot.costPerPod)
                            : "TBD"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <SpecConfigForm
                        bathroomTypeId={type.id}
                        defaultRateProfileId={
                          type.config?.rateProfileId ?? project.rateProfileId ?? undefined
                        }
                      />
                      <div className="flex flex-col gap-4">
                        <RunCostButton bathroomTypeId={type.id} />
                        {snapshot && (
                          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                            <p>Total cost: {formatCurrency(snapshot.totalCost)}</p>
                            <p>
                              Cost / sqft: {formatCurrency(snapshot.costPerSqft)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {!project.bathroomTypes.length && (
                <p className="text-sm text-slate-500">
                  Group bathrooms once they are detected to create types.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">
                Add a floor
              </h3>
            </CardHeader>
            <CardContent>
              <AddFloorForm projectId={project.id} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">
                Project summary
              </h3>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p>Client: {project.clientName ?? "Internal"}</p>
              <p>Floors: {project.floors.length}</p>
              <p>Bathrooms detected: {project.floors.reduce((sum, floor) => sum + floor.bathroomInstances.length, 0)}</p>
              <p>Types: {project.bathroomTypes.length}</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
