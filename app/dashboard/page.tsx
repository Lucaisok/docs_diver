import { AppShell } from "@/components/AppShell/AppShell";
import { HeroSection } from "@/components/layout/Dashboard/Hero/HeroSection";
import { WorkspacesSection } from "@/components/layout/Dashboard/WorkspacesSection/WorkspacesSection";

export default async function DashboardPage() {
    return (
        <AppShell>
            <HeroSection />
            <WorkspacesSection />
        </AppShell>
    );
}