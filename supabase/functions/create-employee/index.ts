import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Método não permitido." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authorization = request.headers.get("Authorization");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: "Configuração do servidor incompleta." }, 500);
    }

    if (!authorization) {
      return json({ error: "Sessão não informada." }, 401);
    }

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const token = authorization.replace(/^Bearer\s+/i, "");
    const { data: userData, error: userError } = await authClient.auth.getUser(token);

    if (userError || !userData.user) {
      return json({ error: "Sessão inválida ou expirada." }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: requesterProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    if (profileError || requesterProfile?.role !== "administrador") {
      return json({ error: "Somente administradores podem criar funcionários." }, 403);
    }

    const body = await request.json();
    const nome = typeof body.nome === "string" ? body.nome.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!nome || !email || password.length < 6) {
      return json({ error: "Informe nome, e-mail e uma senha com pelo menos 6 caracteres." }, 400);
    }

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome },
    });

    if (createError || !created.user) {
      const duplicate = createError?.message.toLowerCase().includes("already") ||
        createError?.message.toLowerCase().includes("registered");
      return json(
        { error: duplicate ? "Já existe um usuário com este e-mail." : createError?.message ?? "Não foi possível criar o usuário." },
        400,
      );
    }

    const { error: updateError } = await adminClient
      .from("profiles")
      .update({ nome, role: "funcionario" })
      .eq("id", created.user.id);

    if (updateError) {
      await adminClient.auth.admin.deleteUser(created.user.id);
      return json({ error: "O perfil não pôde ser definido como funcionário." }, 500);
    }

    return json({
      message: "Funcionário criado com sucesso.",
      employee: { id: created.user.id, nome, email, role: "funcionario" },
    }, 201);
  } catch {
    return json({ error: "Não foi possível processar a solicitação." }, 500);
  }
});
