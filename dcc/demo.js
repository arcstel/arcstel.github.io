/*
 * Interactive demo backend for Directory Control Center.
 *
 * The real console talks to a FastAPI service over LDAP. For a zero-infrastructure
 * showcase, this file installs an in-memory directory and intercepts /api requests,
 * so the exact same UI runs entirely in the browser with fabricated data.
 *
 * No network calls leave the page. State resets on refresh.
 */
(function () {
  "use strict";

  var BASE = "DC=example,DC=local";
  var REALM = "example.local";

  function nowIso() { return new Date().toISOString(); }

  function user(sam, name, title, dept, opts) {
    opts = opts || {};
    var dn = "CN=" + name + ",OU=People," + BASE;
    return {
      dn: dn, type: "user", name: name, sam: sam,
      upn: sam + "@" + REALM, mail: opts.mail || (sam + "@" + REALM),
      title: title, department: dept, description: dept,
      enabled: opts.enabled !== false,
      passwordNeverExpires: !!opts.never,
      locked: !!opts.locked,
      lastLogonDays: opts.days === undefined ? 1 : opts.days,
      pwdLastSetDays: 30,
      memberOf: opts.groups || [],
      whenCreated: "2024-01-01T00:00:00+00:00",
      isService: !!opts.svc
    };
  }

  var users = [
    user("jdoe", "John Doe", "Directory Services Admin", "IT", { days: 2, groups: ["CN=Tier0-Admins,OU=Groups," + BASE] }),
    user("mchen", "Maya Chen", "Systems Engineer", "IT", { days: 1, groups: ["CN=Tier0-Admins,OU=Groups," + BASE] }),
    user("rpatel", "Ravi Patel", "Cloud Engineer", "IT", { days: 210 }),
    user("asmith", "Amy Smith", "Payroll Specialist", "Finance", { days: 4, groups: ["CN=Finance-Team,OU=Groups," + BASE] }),
    user("dkhan", "Dara Khan", "Accounts Payable Clerk", "Finance", { days: 165, groups: ["CN=Finance-Team,OU=Groups," + BASE] }),
    user("lnguyen", "Linh Nguyen", "Registered Nurse", "Nursing", { days: 3, groups: ["CN=Nursing,OU=Groups," + BASE] }),
    user("obrown", "Omar Brown", "Physician", "Nursing", { days: 1, groups: ["CN=Nursing,OU=Groups," + BASE] }),
    user("tsmith", "Tom Smith", "Help Desk Technician", "IT Support", { days: 2, groups: ["CN=HelpDesk,OU=Groups," + BASE] }),
    user("kdavis", "Kim Davis", "Help Desk Technician", "IT Support", { enabled: false, days: 420, groups: ["CN=HelpDesk,OU=Groups," + BASE] }),
    user("cjones", "Chris Jones", "Platform Consultant", "External", { days: 240, groups: ["CN=Contractors,OU=Groups," + BASE] }),
    user("mlee", "Morgan Lee", "Security Consultant", "External", { enabled: false, days: 300, groups: ["CN=Contractors,OU=Groups," + BASE] }),
    user("kpatel", "Kiran Patel", "Treasury Analyst", "Finance", { days: 12, never: true }),
    user("svc-backup", "Backup Service", "Service Account", "Service", { never: true, svc: true }),
    user("svc-monitor", "Monitoring Service", "Service Account", "Service", { never: true, svc: true }),
    user("svc-web", "Web App Pool", "Service Account", "Service", { never: true, svc: true })
  ];

  function dnOf(sam) {
    var u = users.filter(function (x) { return x.sam === sam; })[0];
    return u ? u.dn : null;
  }

  function group(name, sams, desc, priv) {
    var members = sams.map(dnOf).filter(Boolean);
    return {
      dn: "CN=" + name + ",OU=Groups," + BASE, type: "group", name: name, sam: name,
      description: desc, memberCount: members.length, members: members, security: true,
      privileged: !!priv, whenCreated: "2024-01-01T00:00:00+00:00"
    };
  }

  var groups = [
    group("Tier0-Admins", ["jdoe", "mchen"], "Privileged directory administration", true),
    group("HelpDesk", ["tsmith", "kdavis"], "Tier 1/2 support", false),
    group("Finance-Team", ["asmith", "dkhan", "kpatel"], "Finance and payroll", false),
    group("Nursing", ["lnguyen", "obrown"], "Clinical staff", false),
    group("Contractors", ["cjones", "mlee"], "External contractors", false)
  ];

  var ous = [
    { dn: "OU=People," + BASE, type: "ou", name: "People", description: "Staff accounts", whenCreated: "2024-01-01T00:00:00+00:00" },
    { dn: "OU=Groups," + BASE, type: "ou", name: "Groups", description: "Security groups", whenCreated: "2024-01-01T00:00:00+00:00" },
    { dn: "OU=ServiceAccounts," + BASE, type: "ou", name: "ServiceAccounts", description: "Non-human identities", whenCreated: "2024-01-01T00:00:00+00:00" },
    { dn: "OU=Contractors," + BASE, type: "ou", name: "Contractors", description: "External identities", whenCreated: "2024-01-01T00:00:00+00:00" },
    { dn: "OU=Disabled," + BASE, type: "ou", name: "Disabled", description: "Offboarded accounts", whenCreated: "2024-01-01T00:00:00+00:00" }
  ];

  var computers = [
    { dn: "CN=DC1,OU=Domain Controllers," + BASE, type: "computer", name: "DC1", dns: "dc1.example.local", os: "Samba", osVersion: "4.x", enabled: true, lastLogonDays: 0, whenCreated: "2024-01-01T00:00:00+00:00" },
    { dn: "CN=WKS-0142,OU=Workstations," + BASE, type: "computer", name: "WKS-0142", dns: "wks-0142.example.local", os: "Windows 11", osVersion: "10.0.22631", enabled: true, lastLogonDays: 3, whenCreated: "2024-03-01T00:00:00+00:00" },
    { dn: "CN=WKS-0098,OU=Workstations," + BASE, type: "computer", name: "WKS-0098", dns: "wks-0098.example.local", os: "Windows 10", osVersion: "10.0.19045", enabled: false, lastLogonDays: 140, whenCreated: "2023-06-01T00:00:00+00:00" }
  ];

  function paginate(items, q, page, size, fields) {
    if (q) {
      var needle = q.toLowerCase();
      items = items.filter(function (i) {
        return fields.some(function (f) { return String(i[f] == null ? "" : i[f]).toLowerCase().indexOf(needle) >= 0; });
      });
    }
    items = items.slice().sort(function (a, b) {
      return String(a.name || a.sam || "").toLowerCase().localeCompare(String(b.name || b.sam || "").toLowerCase());
    });
    var total = items.length;
    var start = Math.max(0, (page - 1) * size);
    return { total: total, page: page, size: size, items: items.slice(start, start + size) };
  }

  function getObject(dn) {
    var pools = [users, groups, ous, computers];
    for (var p = 0; p < pools.length; p++) {
      for (var i = 0; i < pools[p].length; i++) {
        if (pools[p][i].dn.toLowerCase() === String(dn).toLowerCase()) {
          var copy = Object.assign({}, pools[p][i]);
          copy.raw = Object.assign({}, pools[p][i]);
          return copy;
        }
      }
    }
    return { dn: dn, type: "object", name: dn, raw: {} };
  }

  function governance() {
    var findings = [];
    var fid = 0;
    var privileged = {};
    groups.forEach(function (g) { if (g.privileged) g.members.forEach(function (m) { privileged[m] = true; }); });

    function add(sev, cat, obj, detail) {
      fid++;
      findings.push({ id: "G" + String(fid).padStart(3, "0"), severity: sev, category: cat, dn: obj.dn, name: obj.name || obj.sam, detail: detail });
    }
    users.forEach(function (u) {
      if (!u.enabled) add("medium", "Disabled Account", u, "Account is disabled but still present in the directory.");
      if (u.enabled && u.lastLogonDays != null && u.lastLogonDays > 90 && !u.isService)
        add("high", "Dormant Account", u, "No interactive sign-in for " + u.lastLogonDays + " days while enabled.");
      if (u.enabled && u.lastLogonDays == null && !u.isService)
        add("low", "Never Logged In", u, "Account has never recorded an interactive logon.");
      if (u.passwordNeverExpires && !u.isService)
        add("medium", "Password Never Expires", u, "Interactive account flagged password-never-expires.");
      if (u.locked) add("high", "Locked Out", u, "Account is currently locked out (possible lockout attack).");
      if (u.isService && u.passwordNeverExpires)
        add("low", "Service Account", u, "Service account with non-expiring password — verify ownership and rotation.");
      if (privileged[u.dn]) add("critical", "Privileged Identity", u, "Member of a privileged administrative group.");
    });

    var byCat = {};
    findings.forEach(function (f) { byCat[f.category] = (byCat[f.category] || 0) + 1; });
    var rank = { critical: 0, high: 1, medium: 2, low: 3 };
    findings.sort(function (a, b) { return (rank[a.severity] - rank[b.severity]) || a.category.localeCompare(b.category); });

    return {
      summary: {
        users: users.length, groups: groups.length,
        enabled: users.filter(function (u) { return u.enabled; }).length,
        disabled: users.filter(function (u) { return !u.enabled; }).length,
        privileged: users.filter(function (u) { return privileged[u.dn]; }).length,
        findings: findings.length,
        critical: findings.filter(function (f) { return f.severity === "critical"; }).length,
        high: findings.filter(function (f) { return f.severity === "high"; }).length,
        by_category: byCat
      },
      findings: findings
    };
  }

  /* ------------------------------------------------------------- mutations */
  function createUser(p) {
    var sam = (p.sam || "").trim();
    if (!sam) throw new Error("sAMAccountName is required");
    if (users.some(function (u) { return u.sam.toLowerCase() === sam.toLowerCase(); })) throw new Error("Account already exists: " + sam);
    var name = ((p.givenName || "") + " " + (p.surname || "")).trim() || sam;
    var ou = p.ou || ("OU=People," + BASE);
    var u = user(sam, name, p.title || "", p.department || "", { days: null, groups: [] });
    u.dn = "CN=" + name + "," + ou;
    u.mail = p.mail || (sam + "@" + REALM);
    u.description = p.description || p.department || "";
    users.push(u);
    return { dn: u.dn, sam: sam };
  }

  function createGroup(p) {
    var name = (p.name || "").trim();
    if (!name) throw new Error("Group name is required");
    var ou = p.ou || ("OU=Groups," + BASE);
    groups.push({
      dn: "CN=" + name + "," + ou, type: "group", name: name, sam: name,
      description: p.description || "", memberCount: 0, members: [], security: true,
      privileged: false, whenCreated: nowIso()
    });
    return { dn: "CN=" + name + "," + ou, name: name };
  }

  function createOU(p) {
    var name = (p.name || "").trim();
    if (!name) throw new Error("OU name is required");
    var parent = p.parent || BASE;
    var dn = "OU=" + name + "," + parent;
    ous.push({ dn: dn, type: "ou", name: name, description: p.description || "", whenCreated: nowIso() });
    return { dn: dn, name: name };
  }

  function deleteObject(dn) {
    [users, groups, ous, computers].forEach(function (pool) {
      for (var i = pool.length - 1; i >= 0; i--) {
        if (pool[i].dn.toLowerCase() === String(dn).toLowerCase()) pool.splice(i, 1);
      }
    });
    return { deleted: dn };
  }

  function setEnabled(dn, enabled) {
    users.forEach(function (u) { if (u.dn.toLowerCase() === String(dn).toLowerCase()) u.enabled = !!enabled; });
    return { dn: dn, enabled: !!enabled };
  }

  function setPassword(dn, password) {
    if (!password || password.length < 8) throw new Error("Password must be at least 8 characters");
    return { dn: dn, updated: "password" };
  }

  function groupMember(groupDn, memberDn, add) {
    groups.forEach(function (g) {
      if (g.dn.toLowerCase() !== String(groupDn).toLowerCase()) return;
      if (add && g.members.indexOf(memberDn) < 0) g.members.push(memberDn);
      if (!add) g.members = g.members.filter(function (m) { return m !== memberDn; });
      g.memberCount = g.members.length;
    });
    return { group: groupDn, member: memberDn, action: add ? "add" : "remove" };
  }

  function moveObject(dn, targetDn) {
    var rdn = String(dn).split(",")[0];
    [users, groups, ous, computers].forEach(function (pool) {
      pool.forEach(function (o) { if (o.dn.toLowerCase() === String(dn).toLowerCase()) o.dn = rdn + "," + targetDn; });
    });
    return { moved: dn, to: targetDn, new_dn: rdn + "," + targetDn };
  }

  /* -------------------------------------------------------------- routing */
  function route(method, pathname, params, body) {
    var p = pathname.replace(/^\/api/, "");
    var m = (method || "GET").toUpperCase();

    if (p === "/health") return [200, { ok: true, mode: "mock", uri: "in-browser demo", base_dn: BASE }];
    if (p === "/domain") return [200, { base_dn: BASE, uri: "in-browser demo", netbios: "EXAMPLE", user_count: users.length, group_count: groups.length }];
    if (p === "/governance") return [200, governance()];

    if (m === "GET") {
      if (p === "/users") return [200, paginate(users, params.q || "", +params.page || 1, +params.size || 50, ["name", "sam", "mail", "title", "department"])];
      if (p === "/groups") return [200, paginate(groups, params.q || "", +params.page || 1, +params.size || 50, ["name", "sam", "description"])];
      if (p === "/ous") return [200, paginate(ous, params.q || "", +params.page || 1, +params.size || 50, ["name", "description"])];
      if (p === "/computers") return [200, paginate(computers, params.q || "", +params.page || 1, +params.size || 50, ["name", "dns", "os"])];
      if (p === "/object") return [200, getObject(params.dn)];
    }

    if (m === "POST") {
      if (p === "/users") return [201, createUser(body || {})];
      if (p === "/groups") return [201, createGroup(body || {})];
      if (p === "/ous") return [201, createOU(body || {})];
      if (p === "/actions/password") return [200, setPassword(body.dn, body.password)];
      if (p === "/actions/enable") return [200, setEnabled(body.dn, body.enabled)];
      if (p === "/actions/member") return [200, groupMember(body.group_dn, body.member_dn, body.add !== false)];
      if (p === "/actions/move") return [200, moveObject(body.dn, body.target_dn)];
      if (p === "/actions/delete") return [200, deleteObject(body.dn)];
    }

    throw new Error("Demo backend: no route for " + m + " " + pathname);
  }

  var realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : input.url;
    var parsed;
    try { parsed = new URL(url, window.location.origin); } catch (e) { return realFetch(input, init); }
    if (parsed.pathname.indexOf("/api") !== 0) return realFetch(input, init);

    var params = {};
    parsed.searchParams.forEach(function (v, k) { params[k] = v; });
    var body = null;
    if (init && init.body) { try { body = JSON.parse(init.body); } catch (e) { body = null; } }

    try {
      var out = route(init && init.method, parsed.pathname, params, body);
      return Promise.resolve(new Response(JSON.stringify(out[1]), {
        status: out[0],
        headers: { "Content-Type": "application/json" }
      }));
    } catch (e) {
      return Promise.resolve(new Response(JSON.stringify({ detail: e.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }));
    }
  };

  /* --------------------------------------------------------------- banner */
  function banner() {
    document.title = "Directory Control Center — Interactive Demo";
    var style = document.createElement("style");
    style.textContent =
      ".demo-banner{position:fixed;left:18px;bottom:18px;z-index:200;display:flex;gap:10px;align-items:center;" +
      "background:rgba(11,15,26,.94);border:1px solid rgba(56,189,248,.5);border-radius:999px;padding:8px 14px;" +
      "font:600 12px/1.2 var(--mono,monospace);color:#93a4c0;backdrop-filter:blur(6px);box-shadow:0 10px 30px -12px rgba(0,0,0,.9)}" +
      ".demo-banner b{color:#38bdf8}.demo-banner i{width:8px;height:8px;border-radius:50%;background:#34d399;display:inline-block}" +
      ".demo-banner a{color:#38bdf8;text-decoration:none}";
    document.head.appendChild(style);
    var b = document.createElement("div");
    b.className = "demo-banner";
    b.innerHTML = "<i></i><span><b>DEMO</b> · simulated directory · resets on refresh</span>" +
      "<a href='../index.html'>← portfolio</a>";
    document.body.appendChild(b);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", banner);
  else banner();
})();
