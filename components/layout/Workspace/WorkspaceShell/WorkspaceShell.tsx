"use client";
import { ChatSection } from "../ChatSection/ChatSection";
import { DocumentsSection } from "../DocumentsSection/DocumentsSection";
import { Hero } from "../HeroSection/Hero";
import Modal from "@/components/Modal/Modal";
import { useEffect, useState } from "react";
import { WorkspaceDetails } from "@/src/types/workspace";
import styles from "./workspaceShell.module.css";
import { SiteContent } from "@/src/lib/content";
import { InitialMessage } from "@/src/types/message";
import { AIRequestLogs } from "@/src/types/aiReqLogs";
import { AIUsagePanel } from "@/components/AIUsagePanel/AIUsagePanel";
import { fetchLatestAIRequestLog } from "@/src/server/queries/ai-request-logs";
import { WorkspaceSettingsModal } from "../HeroSection/WorkspaceSettingsModal";

interface WorkspaceShellProps {
    workspaceId: string;
    workspace: WorkspaceDetails;
    initialMessages: InitialMessage[];
    messagesError?: string | null;
    requestLogs: AIRequestLogs | null;
    userId: string;
}

export const WorkspaceShell = ({ workspace, workspaceId, initialMessages, messagesError, requestLogs: initialRequestLogs, userId }: WorkspaceShellProps) => {
    const [isWorkspaceModalVisible, setIsWorkspaceModalVisible] = useState(false);
    const [isDocumentsModalVisible, setIsDocumentsModalVisible] = useState(false);
    const [isUsageModalVisible, setIsUsageModalVisible] = useState(false);
    const [requestLogs, setRequestLogs] = useState<AIRequestLogs | null>(initialRequestLogs);
    const [documentsCount, setDocumentsCount] = useState(workspace._count.documents);

    useEffect(() => {
        setDocumentsCount(workspace._count.documents);
    }, [workspace._count.documents]);

    const handleNewAnswer = async () => {
        const latestLogs = await fetchLatestAIRequestLog(workspaceId, userId);
        setRequestLogs(latestLogs);
    };

    const handleUploadSuccess = () => {
        setDocumentsCount((currentCount) => {
            if (currentCount === 0) {
                setIsDocumentsModalVisible(false);
            }

            return currentCount + 1;
        });
    };

    return <>
        <Hero
            workspaceName={workspace.name}
            documentsCount={documentsCount}
            openWorkspaceModal={() => setIsWorkspaceModalVisible(true)}
            openDocumentsModal={() => setIsDocumentsModalVisible(true)}
            openUsageModal={() => setIsUsageModalVisible(true)}
        />
        <div className={styles.layout}>
            <ChatSection
                workspaceId={workspaceId}
                hasDocuments={documentsCount > 0}
                initialMessages={initialMessages}
                messagesError={messagesError}
                onNewAnswer={handleNewAnswer}
                onUploadSuccess={handleUploadSuccess}
            />
        </div>
        <Modal
            isOpen={isDocumentsModalVisible}
            onClose={() => setIsDocumentsModalVisible(false)}
            title={SiteContent.documents}
        >
            <DocumentsSection workspaceId={workspaceId} documents={workspace.documents} onUploadSuccess={handleUploadSuccess} />
        </Modal>
        <Modal
            isOpen={isUsageModalVisible}
            onClose={() => setIsUsageModalVisible(false)}
            title={SiteContent.aiUsage}
            description={SiteContent.aiUsageDescription}
        >
            <AIUsagePanel log={requestLogs} />
        </Modal>
        <WorkspaceSettingsModal
            isOpen={isWorkspaceModalVisible}
            workspaceId={workspaceId}
            workspaceName={workspace.name}
            onClose={() => setIsWorkspaceModalVisible(false)}
        />
    </>;
};