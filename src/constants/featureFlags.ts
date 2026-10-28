// Flip to false to hide the map picker. The location page then lets people continue without a pin.
export const MAPS_ENABLED = true;

// Turn this ON only after you have loaded places into Supabase (see the GeoNames guide).
//   ON : the "Area" field searches your places table; hosts pick a place or add a new one.
//   OFF: hosts type the area by hand (tap-to-fill suggestions for Kenya).
export const GAZETTEER_ENABLED = true;

// Which sign-in methods actually work. The sign-in sheet shows ALL of them; a method that is `false`
// is shown with a "coming soon" note and its Continue button stays off. When you finish setting one up,
// flip it to true and it just starts working.
//   google : works now.
//   email  : needs the Supabase email template to contain {{ .Token }} (so the email carries a 6 digit code).
//   phone  : needs an SMS provider (Twilio, etc.) set up under Supabase > Authentication > Providers > Phone.
//   apple  : needs "Sign in with Apple" set up AND its button wired in sign-in.tsx (not written yet).
export const AUTH_METHODS = {
    google: true,
    email: false,
    phone: false,
    apple: false,
} as const;