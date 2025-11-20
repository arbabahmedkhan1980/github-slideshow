import { AppShell } from "@/components/app-shell";
import { getProjects } from "@/server/projects/queries";
import { ProjectList } from "@/features/projects/project-list";
import { CreateProjectForm } from "@/features/projects/create-project-form";

export default async function HomePage() {
  const projects = await getProjects();

  return (
    <AppShell
      title="Projects"
      actions={<div className="text-sm text-slate-500">Upload PDFs, detect bathrooms, and estimate pods in minutes.</div>}
    >
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <section>
          <ProjectList projects={projects} />
        </section>
        <aside>
          <CreateProjectForm />
        </aside>
      </div>
    </AppShell>
  );
}
