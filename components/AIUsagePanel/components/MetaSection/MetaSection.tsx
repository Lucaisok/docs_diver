import { SiteContent } from "@/src/lib/content";
import { AIUsagePanelLog } from "../../types";
import styles from "./MetaSection.module.css";

type MetaSectionProps = Pick<
    AIUsagePanelLog,
    "model" | "estimatedInputTokens" | "estimatedOutputTokens" | "latencyMs" | "avgSimilarity"
>;

export function MetaSection({ model, estimatedInputTokens, estimatedOutputTokens, latencyMs, avgSimilarity }: MetaSectionProps) {
    return (
        <div className={styles.meta}>
            <p>
                <span className={styles.metaLabel}>{SiteContent.modelLabel}</span> {model}
            </p>
            <p>
                <span className={styles.metaLabel}>{SiteContent.inputTokensLabel}</span>{" "}
                {estimatedInputTokens ?? SiteContent.notAvailable}
            </p>
            <p>
                <span className={styles.metaLabel}>{SiteContent.outputTokensLabel}</span>{" "}
                {estimatedOutputTokens ?? SiteContent.notAvailable}
            </p>
            <p>
                <span className={styles.metaLabel}>{SiteContent.latencyLabel}</span>{" "}
                {latencyMs !== null ? `${(latencyMs / 1000).toFixed(2)}s` : SiteContent.notAvailable}
            </p>
            <p>
                <span className={styles.metaLabel}>{SiteContent.avgSimilarityLabel}</span>{" "}
                {avgSimilarity !== null ? avgSimilarity.toFixed(3) : SiteContent.notAvailable}
            </p>
        </div>
    );
}
