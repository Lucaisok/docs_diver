import Modal from "@/components/Modal/Modal";
import { Hero } from "./Hero";
import { SiteContent } from "@/src/lib/content";
import { CreateWorkspaceForm } from "../../Workspace/CreateWorkspaceForm/CreateWorkspaceForm";

interface HeroSectionProps {
    isModalVisible: boolean;
    toggleModalVisibility: (value: boolean) => void;
}

export const HeroSection = ({ isModalVisible, toggleModalVisibility }: HeroSectionProps) => {

    return (
        <>
            <Hero openModal={() => toggleModalVisibility(true)} />
            <Modal
                isOpen={isModalVisible}
                onClose={() => toggleModalVisibility(false)}
                title={SiteContent.newWorkspace}
                description={SiteContent.workspacesDescription}
            >
                <CreateWorkspaceForm />
            </Modal>
        </>
    );
};