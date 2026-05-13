"use client";
import Modal from "@/components/Modal/Modal";
import { Hero } from "./Hero";
import { SiteContent } from "@/src/lib/content";
import { CreateWorkspaceForm } from "../../Workspace/CreateWorkspaceForm/CreateWorkspaceForm";
import { useState } from "react";

export const HeroSection = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    return (
        <>
            <Hero openModal={() => setIsModalVisible(true)} />
            <Modal
                isOpen={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                title={SiteContent.newWorkspace}
                description={SiteContent.workspacesDescription}
            >
                <CreateWorkspaceForm />
            </Modal>
        </>
    );
};