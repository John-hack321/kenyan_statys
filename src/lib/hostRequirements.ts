import type { User } from "@supabase/supabase-js";
import type { BecomeAHostVentureDraft } from "@/app_state/ventureFlowStore";
import { toE164 } from "@/constants/schemas/venture";

export type RequirementKey = "account" | "email" | "phone" | "identity" | "publish";

export type Requirement = {
    key: RequirementKey;
    title: string;
    detail: string;
    done: boolean;
};

// What still has to happen before the listing can go live, worked out from the ACCOUNT, not the draft.
//   Google sign-in   -> email is already verified, phone still to do
//   email sign-up    -> email verified by the confirmation link, phone still to do
//   phone sign-up    -> phone verified, email still to do (when phone sign-in exists)
// The draft only supplies what to verify. It never decides whether something IS verified.
// `identityVerified` will come from the host_identity table once the ID check exists.
export function getHostRequirements(
    user: User | null,
    draft: BecomeAHostVentureDraft,
    identityVerified = false
): Requirement[] {
    const accountEmail = user?.email ?? "";
    const draftEmail = draft.contactEmail ?? "";
    const emailDone = !!user?.email_confirmed_at;
    const phoneDone = !!user?.phone_confirmed_at;
    const draftPhone = draft.contactPhone?.number ? toE164(draft.contactPhone.country, draft.contactPhone.number) : "";

    // if the host signed in with a different email than the one they typed, the account's email wins
    const emailName = accountEmail || draftEmail || "your email";
    const emailDiffers = !!accountEmail && !!draftEmail && accountEmail.toLowerCase() !== draftEmail.toLowerCase();

    const account: Requirement = {
        key: "account",
        title: "Account created",
        detail: user ? "You're signed in." : "Sign in or create an account.",
        done: !!user,
    };
    const email: Requirement = {
        key: "email",
        title: "Confirm your email",
        detail: emailDone
            ? `${emailName} is confirmed.`
            : `We'll send a confirmation link to ${emailName}.`,
        done: emailDone,
    };
    const phone: Requirement = {
        key: "phone",
        title: "Confirm your phone",
        detail: phoneDone
            ? `${user?.phone ?? draftPhone} is confirmed.`
            : draftPhone
                ? `We'll text a code to ${draftPhone}.`
                : "Add your phone number.",
        done: phoneDone,
    };
    const identity: Requirement = {
        key: "identity",
        title: "Confirm your ID",
        detail: identityVerified ? "Your ID is confirmed." : "A quick check, done once.",
        done: identityVerified,
    };
    const publish: Requirement = {
        key: "publish",
        title: "Publish your listing",
        detail: "Goes live as soon as the steps above are done.",
        done: false,
    };

    // a note the page can show when the two emails differ
    if (emailDiffers && !emailDone) email.detail += ` (You typed ${draftEmail}; your account uses ${accountEmail}.)`;
    if (emailDiffers && emailDone) email.detail += ` (You typed ${draftEmail}, but your account uses this one.)`;

    return [account, email, phone, identity, publish];
}

// "Publish" unlocks only when everything before it is done
export const canPublish = (reqs: Requirement[]) => reqs.filter((r) => r.key !== "publish").every((r) => r.done);
