"use client";
import { useEffect, useState, type ReactElement } from "react";
import { HeroSection } from "../Hero/HeroSection";
import { WorkspacesSection } from "../WorkspacesSection/WorkspacesSection";
import { GetWorkspacesByUserIdResult } from "@/src/server/queries/workspaces";

interface DashboardShellProps {
    workspaces: GetWorkspacesByUserIdResult["data"];
    workspacesError: string | null;
}

export const DashboardShell = ({ workspaces, workspacesError }: DashboardShellProps) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const WorkspacesSectionWithCreate = WorkspacesSection as unknown as (props: {
        workspaces: GetWorkspacesByUserIdResult["data"];
        error: string | null;
        onCreateWorkspace: () => void;
    }) => ReactElement;

    useEffect(() => {
        setIsModalVisible(false);
    }, [workspaces]);

    return (
        <>
            <HeroSection isModalVisible={isModalVisible} toggleModalVisibility={setIsModalVisible} />
            <WorkspacesSectionWithCreate
                workspaces={workspaces}
                error={workspacesError}
                onCreateWorkspace={() => setIsModalVisible(true)}
            />
        </>
    );
};
