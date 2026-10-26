import { Directory, File, Paths } from "expo-file-system";

// The photo picker hands back files in the CACHE folder, which the phone may empty at any time.
// The draft is saved on the phone, so a picked photo is copied into the app's DOCUMENT folder
// (it stays until we delete it). Install with:  npx expo install expo-file-system

const folder = () => new Directory(Paths.document, "draft-photos");

const extensionOf = (uri: string) => {
    const ext = (uri.split("?")[0].split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return ext && ext.length <= 5 ? ext : "jpg";
};

// Copies a picked photo into the document folder and returns its new uri.
// If the copy fails we fall back to the original uri, so the host is never blocked.
export function keepPhoto(uri: string, id: string): string {
    try {
        const dir = folder();
        if (!dir.exists) dir.create({ intermediates: true });
        const target = new File(dir, `${id}.${extensionOf(uri)}`);
        if (target.exists) target.delete();
        new File(uri).copy(target);
        return target.uri;
    } catch (e) {
        console.warn("keepPhoto: could not copy, using the original file", e);
        return uri;
    }
}

// Deletes one kept photo (only files inside our folder are touched).
export function discardPhoto(uri?: string) {
    try {
        if (!uri || !uri.includes("/draft-photos/")) return;
        const f = new File(uri);
        if (f.exists) f.delete();
    } catch (e) {
        console.warn("discardPhoto failed", e);
    }
}

// Deletes every kept photo. Called by resetDraft(): after publishing, on discard, on sign-out.
export function clearDraftPhotos() {
    try {
        const dir = folder();
        if (dir.exists) dir.delete();
    } catch (e) {
        console.warn("clearDraftPhotos failed", e);
    }
}
