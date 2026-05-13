import { AppShell } from "@/components/AppShell/AppShell";
import { ChatSection } from "@/components/layout/Workspace/ChatSection/ChatSection";
import { DocumentsSection } from "@/components/layout/Workspace/DocumentsSection/DocumentsSection";
import { Hero } from "@/components/layout/Workspace/HeroSection/Hero";
import styles from "./page.module.css";

export default function WorkspacePage() {
    return (
        <AppShell>
            <Hero />
            <div className={styles.layout}>
                <ChatSection />
                <DocumentsSection />
            </div>
        </AppShell>
    );
}