import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-semibold tracking-tight">
          AI Technical Knowledge Workspace
        </h1>

        <p className="mt-6 text-lg text-muted-foreground">
          Upload technical documents, search them semantically, and get
          citation-based AI answers.
        </p>

        <div className="mt-8">
          <Button asChild className="primary-glow">
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}