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