export type SkippedRecord = {
    name: string;
    reason: string;
};

export type DuplicateRecord = {
    name: string;
    whatsapp: string;
};

export type SyncResult = {
    success: boolean;
    message: string;
    stats: {
        totalFetched: number;
        inserted: number;
        updated: number;
    };
    skippedRecords: SkippedRecord[];
    duplicateRecords: DuplicateRecord[];
};
