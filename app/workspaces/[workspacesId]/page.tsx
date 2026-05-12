import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkspacePage() {
    return (
        <AppShell>
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        React Native Architecture Docs
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Ask questions across indexed technical documents.
                    </p>
                </div>

                <Button>Upload PDF</Button>
            </div>

            <div className="grid min-h-[calc(100vh-180px)] gap-6 lg:grid-cols-[1fr_320px]">
                <Card className="flex min-h-[650px] flex-col surface soft-panel">
                    <CardHeader className="border-b">
                        <CardTitle>Chat</CardTitle>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col p-0">
                        <div className="flex-1 p-6">
                            <div className="max-w-3xl rounded-lg border bg-muted/40 p-4 text-sm">
                                <p className="font-medium">Ask your first question</p>
                                <p className="mt-1 text-muted-foreground">
                                    Once documents are indexed, answers will include citations
                                    from your sources.
                                </p>
                            </div>
                        </div>

                        <div className="border-t p-4">
                            <div className="flex gap-2">
                                <input
                                    disabled
                                    placeholder="Ask a question about your documents..."
                                    className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm"
                                />
                                <Button disabled>Ask</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="min-h-[650px]">
                    <CardHeader className="border-b">
                        <CardTitle>Documents</CardTitle>
                    </CardHeader>

                    <CardContent className="p-4">
                        <div className="rounded-lg border border-dashed p-6 text-center">
                            <p className="font-medium">No documents yet</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Upload PDFs to build this workspace.
                            </p>
                            <Button className="mt-4 w-full">Upload PDF</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}