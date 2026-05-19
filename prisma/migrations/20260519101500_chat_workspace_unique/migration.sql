-- Keep only one chat per workspace before adding a unique index.
-- We keep the most recently updated chat and delete older duplicates.
WITH ranked_chats AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY "workspaceId"
            ORDER BY "updatedAt" DESC, "createdAt" DESC, id DESC
        ) AS row_num
    FROM "Chat"
)
DELETE FROM "Chat"
WHERE id IN (
    SELECT id
    FROM ranked_chats
    WHERE row_num > 1
);

-- Enforce one chat per workspace at the database level.
CREATE UNIQUE INDEX "Chat_workspaceId_key" ON "Chat"("workspaceId");
