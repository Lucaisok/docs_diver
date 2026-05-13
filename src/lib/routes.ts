export const routes = {
    home: "/",
    dashboard: "/dashboard",
    workspace: (workspaceId: string) => `/workspaces/${workspaceId}`,
};