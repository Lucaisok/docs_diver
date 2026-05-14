"use client";
import { useEffect, useState } from "react";
import { HeroSection } from "../Hero/HeroSection";
import { WorkspacesSection } from "../WorkspacesSection/WorkspacesSection";
import { GetWorkspacesByUserIdResult } from "@/src/server/queries/workspaces";

interface DashboardShellProps {
    workspaces: GetWorkspacesByUserIdResult["data"];
    workspacesError: string | null;
}

export const DashboardShell = ({ workspaces, workspacesError }: DashboardShellProps) => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        setIsModalVisible(false);
    }, [workspaces]);

    return (
        <>
            <HeroSection isModalVisible={isModalVisible} toggleModalVisibility={setIsModalVisible} />
            <WorkspacesSection workspaces={workspaces} error={workspacesError} />
        </>
    );
};
