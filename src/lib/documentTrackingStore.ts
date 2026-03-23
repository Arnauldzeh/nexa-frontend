// ══════════════════════════════════════
// DOCUMENT TRACKING STORE (localStorage)
// Créé à chaque dépôt GED → visible dans Suivi (même projet, phase, dossier)
// ══════════════════════════════════════

export type TrackingSteps = {
  soumis: boolean; // déposé depuis la GED
  enRevue: boolean;
  approuve: boolean;
  rejete: boolean;
};

export type TrackedDocument = {
  id: string;
  lineageId: string;
  version: number;
  projectId: string;
  phase: string; // "etude" | "passation" | "execution"
  folderName: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadDate: string;
  uploadedBy: string;
  steps: TrackingSteps;
  rejectionReason?: string;
  trashedAt?: string;
  trashReason?: string;
  permanentDeleteReason?: string;
  deletedAt?: string;
};

const STORAGE_KEY = "edc_document_tracking";
const TRASH_KEY = "edc_document_tracking_trash";
const DELETED_KEY = "edc_document_tracking_deleted";

function normalizeDoc(d: TrackedDocument): TrackedDocument {
  const lineageId =
    d.lineageId ??
    `${d.projectId}|${d.phase}|${d.folderName}|${d.fileName}`;
  return {
    ...d,
    lineageId,
    version: d.version ?? 1,
    steps: {
      soumis: d.steps?.soumis ?? true,
      enRevue: d.steps?.enRevue ?? false,
      approuve: d.steps?.approuve ?? false,
      rejete: d.steps?.rejete ?? false,
    },
  };
}

function parseDocs(): TrackedDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const docs: TrackedDocument[] = JSON.parse(stored);
    return docs.map((d) => normalizeDoc(d));
  } catch {
    return [];
  }
}

function parseTrash(): TrackedDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(TRASH_KEY);
    if (!stored) return [];
    const docs: TrackedDocument[] = JSON.parse(stored);
    return docs.map((d) => normalizeDoc(d));
  } catch {
    return [];
  }
}

function saveDocs(docs: TrackedDocument[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch {
    console.error("Failed to save tracked documents");
  }
}

function saveTrash(docs: TrackedDocument[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TRASH_KEY, JSON.stringify(docs));
  } catch {
    console.error("Failed to save tracked documents trash");
  }
}

function saveDeleted(docs: TrackedDocument[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DELETED_KEY, JSON.stringify(docs));
  } catch {
    console.error("Failed to save tracked documents deleted archive");
  }
}

/** Garde une seule entrée par lignée (dernière version). */
function latestByLineage(docs: TrackedDocument[]): TrackedDocument[] {
  const m = new Map<string, TrackedDocument>();
  for (const d of docs) {
    const ex = m.get(d.lineageId);
    if (!ex || d.version > ex.version) m.set(d.lineageId, d);
  }
  return Array.from(m.values());
}

// ── READ ──
export function getTrackedDocuments(
  projectId?: string,
  phase?: string,
  folderName?: string,
): TrackedDocument[] {
  let docs = parseDocs();
  if (projectId)
    docs = docs.filter(
      (d) => d.projectId.toLowerCase() === projectId.toLowerCase(),
    );
  if (phase) docs = docs.filter((d) => d.phase === phase);
  if (folderName) docs = docs.filter((d) => d.folderName === folderName);
  return docs;
}

/** Même filtres que getTrackedDocuments, mais une seule version (la plus récente) par fichier logique. */
export function getTrackedDocumentsLatest(
  projectId?: string,
  phase?: string,
  folderName?: string,
): TrackedDocument[] {
  return latestByLineage(getTrackedDocuments(projectId, phase, folderName));
}

export function getTrashedDocuments(
  projectId?: string,
  phase?: string,
): TrackedDocument[] {
  let docs = parseTrash();
  if (projectId)
    docs = docs.filter(
      (d) => d.projectId.toLowerCase() === projectId.toLowerCase(),
    );
  if (phase) docs = docs.filter((d) => d.phase === phase);
  return docs;
}

// ── CREATE (dépôt GED) : instance Suivi avec statut « Déposé » ──
export function addTrackedDocument(
  doc: Omit<TrackedDocument, "id" | "lineageId" | "version" | "steps">,
): TrackedDocument {
  const lineageId = `${doc.projectId}|${doc.phase}|${doc.folderName}|${doc.fileName}`;
  const docs = parseDocs();
  const versions = docs
    .filter((d) => d.lineageId === lineageId)
    .map((d) => d.version);
  const nextVersion = (versions.length > 0 ? Math.max(...versions) : 0) + 1;
  const newDoc: TrackedDocument = {
    ...doc,
    id: `TD-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    lineageId,
    version: nextVersion,
    steps: { soumis: true, enRevue: false, approuve: false, rejete: false },
  };
  docs.push(newDoc);
  saveDocs(docs);
  return newDoc;
}

// ── UPDATE by id (sync GED Valider / Rejeter) ──
export function updateTrackedDocumentStep(
  docId: string,
  step: keyof TrackingSteps,
  value: boolean,
): void {
  const docs = parseDocs();
  const doc = docs.find((d) => d.id === docId);
  if (doc) {
    doc.steps[step] = value;
    if (step === "approuve" && value) {
      doc.steps.rejete = false;
      doc.steps.enRevue = false;
    }
    if (step === "rejete" && value) {
      doc.steps.approuve = false;
      doc.steps.enRevue = false;
    }
    saveDocs(docs);
  }
}

/** Après validation GED : document approuvé côté suivi */
export function markTrackedDocumentApproved(docId: string): void {
  const docs = parseDocs();
  const doc = docs.find((d) => d.id === docId);
  if (doc) {
    doc.steps = { soumis: true, enRevue: false, approuve: true, rejete: false };
    saveDocs(docs);
  }
}

/** Après rejet GED */
export function markTrackedDocumentRejected(docId: string): void {
  const docs = parseDocs();
  const doc = docs.find((d) => d.id === docId);
  if (doc) {
    doc.steps = { soumis: true, enRevue: false, approuve: false, rejete: true };
    saveDocs(docs);
  }
}

export function rejectTrackedDocumentWithReason(
  docId: string,
  reason: string,
): void {
  const docs = parseDocs();
  const doc = docs.find((d) => d.id === docId);
  if (!doc) return;
  doc.steps = { soumis: true, enRevue: false, approuve: false, rejete: true };
  doc.rejectionReason = reason.trim();
  saveDocs(docs);
}

export function rollbackApprovalWithNewVersion(
  docId: string,
): TrackedDocument | null {
  const docs = parseDocs();
  const current = docs.find((d) => d.id === docId);
  if (!current) return null;

  current.steps = { ...current.steps, approuve: false, enRevue: false };

  const nextVersion =
    Math.max(
      ...docs
        .filter((d) => d.lineageId === current.lineageId)
        .map((d) => d.version),
    ) + 1;

  const newVersion: TrackedDocument = {
    ...current,
    id: `TD-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    version: nextVersion,
    uploadDate: new Date().toISOString(),
    steps: { soumis: true, enRevue: true, approuve: false, rejete: false },
    rejectionReason: undefined,
  };

  docs.push(newVersion);
  saveDocs(docs);
  return newVersion;
}

// ── DELETE (suppression fichier GED) ──
export function removeTrackedDocument(docId: string): void {
  const docs = parseDocs().filter((d) => d.id !== docId);
  saveDocs(docs);
}

export function moveTrackedDocumentToTrash(docId: string, reason: string): void {
  const docs = parseDocs();
  const idx = docs.findIndex((d) => d.id === docId);
  if (idx === -1) return;
  const [doc] = docs.splice(idx, 1);
  const trash = parseTrash();
  trash.push({
    ...doc,
    trashedAt: new Date().toISOString(),
    trashReason: reason.trim(),
  });
  saveDocs(docs);
  saveTrash(trash);
}

export function restoreTrackedDocumentFromTrash(docId: string): void {
  const trash = parseTrash();
  const idx = trash.findIndex((d) => d.id === docId);
  if (idx === -1) return;
  const [doc] = trash.splice(idx, 1);
  const docs = parseDocs();
  docs.push({
    ...doc,
    trashedAt: undefined,
    trashReason: undefined,
  });
  saveTrash(trash);
  saveDocs(docs);
}

export function permanentlyDeleteFromTrash(docId: string, reason: string): void {
  const trash = parseTrash();
  const idx = trash.findIndex((d) => d.id === docId);
  if (idx === -1) return;
  const [doc] = trash.splice(idx, 1);
  saveTrash(trash);

  const deleted =
    typeof window === "undefined"
      ? []
      : JSON.parse(localStorage.getItem(DELETED_KEY) || "[]");
  deleted.push({
    ...doc,
    permanentDeleteReason: reason.trim(),
    deletedAt: new Date().toISOString(),
  });
  saveDeleted(deleted);
}

export function removeTrackedDocumentByFile(
  projectId: string,
  phase: string,
  folderName: string,
  fileName: string,
): void {
  const docs = parseDocs().filter(
    (d) =>
      !(
        d.projectId.toLowerCase() === projectId.toLowerCase() &&
        d.phase === phase &&
        d.folderName === folderName &&
        d.fileName === fileName
      ),
  );
  saveDocs(docs);
}

// ── STATS dossier ──
export function getFolderTrackingStats(
  projectId: string,
  phase: string,
  folderName: string,
): { total: number; approved: number; pct: number } {
  const docs = getTrackedDocumentsLatest(projectId, phase, folderName);
  const total = docs.length;
  const approved = docs.filter((d) => d.steps.approuve).length;
  return {
    total,
    approved,
    pct: total > 0 ? Math.round((approved / total) * 100) : 0,
  };
}
