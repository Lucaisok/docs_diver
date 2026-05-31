import styles from "./AIUsagePanel.module.css";
import { SiteContent } from "@/src/lib/content";
import { AIUsagePanelLog } from "./types";
import { MetaSection } from "./components/MetaSection/MetaSection";
import { ChunksList } from "./components/ChunksList/ChunksList";
import { QASection } from "./components/QASection/QASection";

type AIUsagePanelProps = {
    log: AIUsagePanelLog | null;
};

export function AIUsagePanel({ log }: AIUsagePanelProps) {
    if (!log) {
        return (
            <div className={styles.panel}>
                <p className={styles.title}>{SiteContent.aiUsage}</p>
                <p className={styles.mutedText}>
                    {SiteContent.noAIRequestsYet}
                </p>
            </div>
        );
    }

    return (
        <div className={`${styles.panel} ${styles.panelContent}`}>
            <div>
                <MetaSection
                    model={log.model}
                    estimatedInputTokens={log.estimatedInputTokens}
                    estimatedOutputTokens={log.estimatedOutputTokens}
                    latencyMs={log.latencyMs}
                    avgSimilarity={log.avgSimilarity}
                />
            </div>
            <QASection question={log.question} answer={log.answer} />
            <ChunksList
                title={SiteContent.usedChunks}
                chunks={log.usedChunks}
                emptyMessage={SiteContent.noUsedChunks}
            />
            <ChunksList
                title={SiteContent.retrievedChunks}
                chunks={log.retrievedChunks}
                emptyMessage={SiteContent.noRetrievedChunks}
            />
        </div>
    );
}