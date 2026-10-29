// this keeps track of the actions the user wanted to do before they were asked to signup.

let pending: (() => void) | null = null

export function setPendingAction(fn: () => void) {
    pending = fn
}

// Returns the saved action and forgets it (so it can only ever run once).
export function takePendingAction() {
    const fn = pending
    pending = null
    return fn
}

export function clearPendingAction() {
    pending = null
}

// A real sign-out normally wipes the half-finished host listing (the next person on the phone must not see it).
// But "use another account" during publishing signs out ON PURPOSE and must keep the draft. Call
// keepDraftOnNextSignOut() right before signOut(); the auth provider reads the flag once and clears it.
let keepDraft = false

export function keepDraftOnNextSignOut() {
    keepDraft = true
}

export function consumeKeepDraft() {
    const k = keepDraft
    keepDraft = false
    return k
}