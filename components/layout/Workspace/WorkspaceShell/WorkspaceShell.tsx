"use client";
import { ChatSection } from "../ChatSection/ChatSection";
import { DocumentsSection } from "../DocumentsSection/DocumentsSection";
import { Hero } from "../HeroSection/Hero";
import Modal from "@/components/Modal/Modal";
import { UploadDocumentForm } from "../UploadDocumentForm/UploadDocumentForm";
import { useState } from "react";
import { WorkspaceDetails } from "@/src/types/workspace";
import styles from "./workspaceShell.module.css";
import { SiteContent } from "@/src/lib/content";
import { InitialMessage } from "@/src/types/message";
import { AIRequestLogs } from "@/src/types/aiReqLogs";
import { AIUsagePanel } from "@/components/AIUsagePanel/AIUsagePanel";
import { fetchLatestAIRequestLog } from "@/src/server/queries/ai-request-logs";

interface WorkspaceShellProps {
    workspaceId: string;
    workspace: WorkspaceDetails;
    initialMessages: InitialMessage[];
    messagesError?: string | null;
    requestLogs: AIRequestLogs | null;
    userId: string;
}

export const WorkspaceShell = ({ workspace, workspaceId, initialMessages, messagesError, requestLogs: initialRequestLogs, userId }: WorkspaceShellProps) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isUsageModalVisible, setIsUsageModalVisible] = useState(false);
    const [requestLogs, setRequestLogs] = useState<AIRequestLogs | null>(initialRequestLogs);

    const handleNewAnswer = async () => {
        const latestLogs = await fetchLatestAIRequestLog(workspaceId, userId);
        setRequestLogs(latestLogs);
    };

    return <>
        <Hero
            workspaceName={workspace.name}
            openUsageModal={() => setIsUsageModalVisible(true)}
        />
        <div className={styles.layout}>
            <ChatSection
                workspaceId={workspaceId}
                hasDocuments={workspace._count.documents > 0}
                initialMessages={initialMessages}
                messagesError={messagesError}
                onNewAnswer={handleNewAnswer}
            />
            <DocumentsSection documents={workspace.documents} openModal={() => setIsModalVisible(true)} />
        </div>
        <Modal
            isOpen={isUsageModalVisible}
            onClose={() => setIsUsageModalVisible(false)}
            title={SiteContent.aiUsage}
            description={SiteContent.aiUsageDescription}
        >
            <AIUsagePanel log={requestLogs} />
        </Modal>
        <Modal
            isOpen={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            title={SiteContent.uploadPDF}
            description={SiteContent.uploadPDFDescription}
        >
            <UploadDocumentForm workspaceId={workspaceId} onSuccess={() => setIsModalVisible(false)} />
        </Modal>
    </>;
};