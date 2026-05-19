import { SiteContent } from "@/src/lib/content";

interface ErrorAreaProps {
    messagesError?: string | null;
    chatError: string | null;
}
export const ErrorArea = ({ messagesError, chatError }: ErrorAreaProps) => {
    return <>
        {messagesError ? (
            <p>
                {SiteContent.messagesLoadWarning}
            </p>
        ) : null}
        {chatError ? (
            <p>
                {chatError}
            </p>
        ) : null}
    </>;
};