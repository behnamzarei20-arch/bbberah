import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("STAFF_ADMIN_ALLOWED_ORIGIN") ?? "https://behnamzarei20-arch.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const allowedPermissions = new Set([
  "dashboard.read",
  "users.read",
  "users.support",
  "loads.read",
  "loads.manage",
  "verification.read",
  "verification.review",
  "reports.read",
  "activity.read",
]);

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return reply(405, { error: "method_not_allowed" });

  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return reply(401, { error: "authentication_required" });

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const redirectTo = Deno.env.get("STAFF_INVITE_REDIRECT_URL");
  if (!url || !anonKey || !serviceKey || !redirectTo) {
    return reply(503, { error: "staff_invites_not_configured" });
  }

  const caller = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await caller.auth.getUser(token);
  if (userError || !userData.user) return reply(401, { error: "invalid_session" });

  const { data: isPrimary, error: roleError } = await caller.rpc("is_primary_admin");
  if (roleError || isPrimary !== true) return reply(403, { error: "primary_admin_only" });

  // Require a fully verified MFA session (AAL2) for staff security operations.
  // Password-only sessions must enroll/complete MFA before reaching this endpoint.
  const { data: assurance, error: assuranceError } =
    await caller.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assuranceError || assurance?.currentLevel !== "aal2") {
    return reply(403, { error: "mfa_required", required_assurance_level: "aal2" });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return reply(400, { error: "invalid_json" });
  }

  const action = body.action;
  if (action === "invite") {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const displayTitle = typeof body.display_title === "string" ? body.display_title.trim() : "";
    const permissions = Array.isArray(body.permissions) ? body.permissions : [];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return reply(400, { error: "valid_email_required" });
    }
    if (displayTitle.length < 2 || displayTitle.length > 80) {
      return reply(400, { error: "display_title_must_be_2_to_80_characters" });
    }
    if (!permissions.every((p) => typeof p === "string" && allowedPermissions.has(p)) ||
        new Set(permissions).size !== permissions.length) {
      return reply(400, { error: "invalid_permissions" });
    }

    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { invitation_kind: "staff" },
    });
    if (error || !data.user) {
      await admin.from("admin_staff_audit_log").insert({
        actor_id: userData.user.id,
        action: "invite_failed",
        target_email: email,
        display_title: displayTitle,
        permission_keys: permissions,
        details: { reason: error?.code ?? "invite_failed" },
      });
      return reply(400, { error: "invitation_failed_or_account_exists" });
    }

    const { error: permissionError } = await admin.from("admin_staff_permissions").insert({
      user_id: data.user.id,
      display_title: displayTitle,
      permissions,
      is_active: true,
      created_by: userData.user.id,
    });
    if (permissionError) {
      await admin.auth.admin.deleteUser(data.user.id);
      await admin.from("admin_staff_audit_log").insert({
        actor_id: userData.user.id,
        action: "invite_failed",
        target_user_id: data.user.id,
        target_email: email,
        display_title: displayTitle,
        permission_keys: permissions,
        details: { reason: "permission_record_failed" },
      });
      return reply(500, { error: "invitation_setup_failed" });
    }

    const { error: auditError } = await admin.from("admin_staff_audit_log").insert({
      actor_id: userData.user.id,
      target_user_id: data.user.id,
      action: "invite_created",
      target_email: email,
      display_title: displayTitle,
      permission_keys: permissions,
    });
    if (auditError) {
      await admin.from("admin_staff_permissions").delete().eq("user_id", data.user.id);
      await admin.auth.admin.deleteUser(data.user.id);
      return reply(500, { error: "invitation_audit_failed_and_invite_cancelled" });
    }
    return reply(201, { ok: true, staff_user_id: data.user.id });
  }

  if (action === "revoke") {
    const targetUserId = typeof body.user_id === "string" ? body.user_id : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetUserId)) {
      return reply(400, { error: "valid_user_id_required" });
    }
    const { data: staff, error: staffError } = await admin
      .from("admin_staff_permissions")
      .select("user_id,display_title,permissions,is_active")
      .eq("user_id", targetUserId)
      .maybeSingle();
    if (staffError || !staff) return reply(404, { error: "staff_account_not_found" });
    if (!staff.is_active) return reply(200, { ok: true, already_revoked: true });

    const { error: updateError } = await admin
      .from("admin_staff_permissions")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("user_id", targetUserId);
    if (updateError) return reply(500, { error: "permission_revocation_failed" });

    const { error: banError } = await admin.auth.admin.updateUserById(targetUserId, {
      ban_duration: "876000h",
    });
    if (banError) {
      // Fail closed for data access even if Auth ban fails: is_active=false
      // makes has_admin_permission return false. Report that login blocking failed.
      await admin.from("admin_staff_audit_log").insert({
        actor_id: userData.user.id,
        target_user_id: targetUserId,
        action: "staff_revoked",
        display_title: staff.display_title,
        permission_keys: staff.permissions,
        details: { auth_ban_failed: true },
      });
      return reply(207, { ok: true, data_access_revoked: true, sign_in_block_failed: true });
    }

    await admin.from("admin_staff_audit_log").insert({
      actor_id: userData.user.id,
      target_user_id: targetUserId,
      action: "staff_revoked",
      display_title: staff.display_title,
      permission_keys: staff.permissions,
    });
    return reply(200, { ok: true, data_access_revoked: true, sign_in_blocked: true });
  }

  return reply(400, { error: "action_must_be_invite_or_revoke" });
});
