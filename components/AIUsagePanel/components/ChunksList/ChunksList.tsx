import { SiteContent } from "@/src/lib/content";
import { RetrievedChunkLog } from "../../types";
import styles from "./ChunksList.module.css";

type ChunksListProps = {
    title: string;
    chunks: RetrievedChunkLog[] | null;
    emptyMessage: string;
};

export function ChunksList({ title, chunks, emptyMessage }: ChunksListProps) {
    return (
        <div>
            <p className={styles.chunksTitle}>{title}</p>
            {chunks && chunks.length > 0 ? (
                <div className={styles.chunksList}>
                    {chunks.map((chunk) => (
                        <div
                            key={`${chunk.documentName}-${chunk.chunkIndex}`}
                            className={styles.chunkCard}
                        >
                            <p className={styles.chunkTitle}>
                                [{SiteContent.source} {chunk.sourceNumber}] {chunk.documentName}
                            </p>
                            <p className={styles.chunkMeta}>
                                {SiteContent.chunk} {chunk.chunkIndex} · {SiteContent.similarity}{" "}
                                {chunk.similarity.toFixed(3)}
                            </p>
                            <p className={styles.chunkExcerpt}>
                                {chunk.excerpt}...
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className={styles.mutedText}>{emptyMessage}</p>
            )}
        </div>
    );
}
