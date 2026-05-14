"use client";
import { useEffect, useState } from "react";
import { HeroSection } from "../Hero/HeroSection";
import { WorkspacesSection } from "../WorkspacesSection/WorkspacesSection";
import { getWorkspacesByUserId } from "@/src/server/queries/workspaces";

interface DashboardShellProps {
    workspaces: Awaited<ReturnType<typeof getWorkspacesByUserId>>;
}

export const DashboardShell = ({ workspaces }: DashboardShellProps) => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        setIsModalVisible(false);
    }, [workspaces]);

    return (
        <>
            <HeroSection isModalVisible={isModalVisible} toggleModalVisibility={setIsModalVisible} />
            <WorkspacesSection workspaces={workspaces} />
        </>
    );
};
