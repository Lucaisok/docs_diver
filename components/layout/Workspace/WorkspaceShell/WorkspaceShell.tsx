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
import { UIMessage } from "ai";

interface WorkspaceShellProps {
    workspaceId: string;
    workspace: WorkspaceDetails;
    initialMessages: UIMessage[];
    messagesError?: string | null;
}

export const WorkspaceShell = ({ workspace, workspaceId, initialMessages, messagesError }: WorkspaceShellProps) => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    return <>
        <Hero workspaceName={workspace.name} documentsNumber={workspace._count.documents} openModal={() => setIsModalVisible(true)} />
        <div className={styles.layout}>
            <ChatSection workspaceId={workspaceId} initialMessages={initialMessages} messagesError={messagesError} />
            <DocumentsSection documents={workspace.documents} openModal={() => setIsModalVisible(true)} />
        </div>
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