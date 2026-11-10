import { createClient } from "npm:@supabase/supabase-js@2";

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const generate_six_digit_code = () => {} // I will come up with the logic for generating the six digit code later on man . 

Deno.server(async (req) => {

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (req.method !== "post") return json({error : "method not allowed"}, 405) // this make the fuction to only accept post request 

  // since we will need to access the data for things such as weriting the code into the database . 
  // "admin" talks to the database with the service role: it BYPASSES RLS. Only this server code has it.
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // ---- 1. Who is calling? The app sends the user's login token in the Authorization header.
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, ""); // extract the token from the auth headers.
  if (!token) return json({ error: "unauthorized" }, 401);
  const { data: auth, error: authError } = await admin.auth.getUser(token); // this is just a supabase function to call the auth api and get the user data
  if (authError || !auth.user) return json({ error: "unauthorized" }, 401); // if there is an error or the user is not found, return unauthorized
  const user = auth.user;

  // first I need to check if the number is already confirmed so that we don't confirm it twice 
  const {data : row , row : rowError} = await admin
  .from("host_private")
  .select("confirmed_at") //NOTE FOR AI :  I am not sure yet where to add the confirmed row either in a new table or by adding tot he host private ( though thte host private table has two = > email and phone so how will we know which one is for which one ? )
  .eq("user_id", user.id)
  .maybesingle()
  if (rowError) {
      console.error("send otp : reading host private tables  failed", rowError.message);
      return json({ error: "database_error" }, 500);
  }
  if (!row) return json({ error: "no host private table." }, 404);

  // do row checks to look if the nubmer is verified if it is there is no need of cointuinign 
  // I still dont know how we are structuring our db thus I cannot yet write the functions . 

  const otp = generate_six_digit_code()

  // write otp code to the databse 

  // send otp code to the user 
  // as of now we will just log the code to the console and copy it to the app for dev mode . untill we implement one . 
  console.log(otp)

  


})