/*
 * Identity Attack Path Analyzer - synthetic IAM environment + analysis engine.
 * All data is fabricated. No real identities, systems, or employer data.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.IAM = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /* ---------------------------------------------------------------- utils */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function sample(rng, arr, n) {
    var copy = arr.slice(), out = [];
    n = Math.min(n, copy.length);
    for (var i = 0; i < n; i++) out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
    return out;
  }

  /* ----------------------------------------------------------- catalogs */
  var RISK_WEIGHT = { low: 1, medium: 3, high: 6, critical: 10 };

  var APPS = [
    { id: "app-ad", name: "Active Directory (Tier 0)", short: "AD Tier-0", crown: true, criticality: "critical" },
    { id: "app-aws", name: "AWS Production", short: "AWS Prod", crown: true, criticality: "critical" },
    { id: "app-payroll", name: "Workday Payroll", short: "Payroll", crown: true, criticality: "critical" },
    { id: "app-ora", name: "Oracle Financials", short: "Oracle Fin", crown: true, criticality: "high" },
    { id: "app-epic", name: "Epic EHR", short: "Epic EHR", crown: true, criticality: "critical" },
    { id: "app-azure", name: "Azure Subscription", short: "Azure", crown: true, criticality: "high" },
    { id: "app-sqldw", name: "Enterprise Data Warehouse", short: "Data Warehouse", crown: false, criticality: "high" },
    { id: "app-sf", name: "Salesforce", short: "Salesforce", crown: false, criticality: "medium" },
    { id: "app-snow", name: "ServiceNow", short: "ServiceNow", crown: false, criticality: "medium" },
    { id: "app-o365", name: "Microsoft 365", short: "M365", crown: false, criticality: "medium" },
    { id: "app-ghe", name: "GitHub Enterprise", short: "GitHub Ent", crown: false, criticality: "medium" },
    { id: "app-imprivata", name: "Imprivata SSO", short: "Imprivata", crown: false, criticality: "high" }
  ];

  var ENTITLEMENTS = [
    { id: "ent-ad-da", name: "Domain Admin", app: "app-ad", risk: "critical" },
    { id: "ent-ad-tier0", name: "Tier-0 Admin", app: "app-ad", risk: "critical" },
    { id: "ent-ad-gpo", name: "Edit Group Policy", app: "app-ad", risk: "high" },
    { id: "ent-ad-resetpw", name: "Reset User Password", app: "app-ad", risk: "medium" },
    { id: "ent-ad-helpdesk", name: "Helpdesk Delegation", app: "app-ad", risk: "medium" },
    { id: "ent-aws-admin", name: "AdministratorAccess", app: "app-aws", risk: "critical" },
    { id: "ent-aws-iam", name: "IAM Modify", app: "app-aws", risk: "high" },
    { id: "ent-aws-ec2", name: "EC2 Full Access", app: "app-aws", risk: "high" },
    { id: "ent-aws-s3r", name: "S3 Read", app: "app-aws", risk: "low" },
    { id: "ent-azure-owner", name: "Subscription Owner", app: "app-azure", risk: "critical" },
    { id: "ent-azure-contrib", name: "Contributor", app: "app-azure", risk: "high" },
    { id: "ent-pay-read", name: "Payroll Read", app: "app-payroll", risk: "low" },
    { id: "ent-pay-write", name: "Payroll Write", app: "app-payroll", risk: "high" },
    { id: "ent-pay-approve", name: "Payroll Approve", app: "app-payroll", risk: "high" },
    { id: "ent-ora-post", name: "AP Post Journal", app: "app-ora", risk: "high" },
    { id: "ent-ora-vendor", name: "Vendor Master Edit", app: "app-ora", risk: "high" },
    { id: "ent-epic-admin", name: "EHR Admin Console", app: "app-epic", risk: "critical" },
    { id: "ent-epic-clin", name: "Clinical Record Access", app: "app-epic", risk: "medium" },
    { id: "ent-epic-rx", name: "ePrescribe", app: "app-epic", risk: "high" },
    { id: "ent-sf-admin", name: "Salesforce Admin", app: "app-sf", risk: "high" },
    { id: "ent-sqldw-rw", name: "DW Read/Write", app: "app-sqldw", risk: "high" },
    { id: "ent-snow-admin", name: "ServiceNow Admin", app: "app-snow", risk: "high" },
    { id: "ent-o365-ga", name: "Global Administrator", app: "app-o365", risk: "critical" },
    { id: "ent-o365-mailbox", name: "Mailbox Full Access", app: "app-o365", risk: "high" },
    { id: "ent-ghe-owner", name: "Org Owner", app: "app-ghe", risk: "high" },
    { id: "ent-imp-admin", name: "Imprivata Admin", app: "app-imprivata", risk: "high" }
  ];

  var ROLES = [
    { id: "role-domain-admin", name: "Domain Administrator", dept: "IT Infrastructure", ents: ["ent-ad-da", "ent-ad-tier0", "ent-ad-gpo"] },
    { id: "role-helpdesk", name: "Help Desk Technician", dept: "IT Support", ents: ["ent-ad-resetpw", "ent-ad-helpdesk", "ent-o365-mailbox"] },
    { id: "role-cloud-eng", name: "Cloud Engineer", dept: "Cloud Platform", ents: ["ent-aws-ec2", "ent-aws-s3r", "ent-aws-iam", "ent-azure-contrib"] },
    { id: "role-cloud-admin", name: "Cloud Platform Admin", dept: "Cloud Platform", ents: ["ent-aws-admin", "ent-azure-owner", "ent-aws-iam"] },
    { id: "role-payroll-spec", name: "Payroll Specialist", dept: "Finance", ents: ["ent-pay-read", "ent-pay-write"] },
    { id: "role-payroll-approver", name: "Payroll Approver", dept: "Finance", ents: ["ent-pay-approve", "ent-pay-read"] },
    { id: "role-ap-clerk", name: "Accounts Payable Clerk", dept: "Finance", ents: ["ent-ora-post"] },
    { id: "role-ap-manager", name: "Accounts Payable Manager", dept: "Finance", ents: ["ent-ora-post", "ent-ora-vendor"] },
    { id: "role-ehr-admin", name: "EHR Systems Administrator", dept: "Clinical Informatics", ents: ["ent-epic-admin", "ent-epic-clin"] },
    { id: "role-nurse", name: "Registered Nurse", dept: "Nursing", ents: ["ent-epic-clin", "ent-epic-rx"] },
    { id: "role-physician", name: "Physician", dept: "Medical Staff", ents: ["ent-epic-clin", "ent-epic-rx"] },
    { id: "role-sf-admin", name: "Salesforce Administrator", dept: "Revenue Ops", ents: ["ent-sf-admin"] },
    { id: "role-dba", name: "Database Administrator", dept: "Data Services", ents: ["ent-sqldw-rw"] },
    { id: "role-snow-admin", name: "ServiceNow Administrator", dept: "IT Service Mgmt", ents: ["ent-snow-admin"] },
    { id: "role-o365-admin", name: "M365 Administrator", dept: "IT Infrastructure", ents: ["ent-o365-ga", "ent-o365-mailbox"] },
    { id: "role-ghe-owner", name: "GitHub Org Owner", dept: "Engineering", ents: ["ent-ghe-owner"] },
    { id: "role-security-analyst", name: "Security Analyst", dept: "Security", ents: ["ent-snow-admin", "ent-imp-admin"] },
    { id: "role-contractor-basic", name: "Contractor Baseline", dept: "External", ents: ["ent-o365-mailbox", "ent-epic-clin"] },
    { id: "role-intern", name: "Intern Read-Only", dept: "External", ents: ["ent-aws-s3r"] }
  ];

  var GROUPS = [
    { id: "grp-ad-admins", name: "AD-Admins", roles: ["role-domain-admin"] },
    { id: "grp-helpdesk", name: "HelpDesk-Tier2", roles: ["role-helpdesk"] },
    { id: "grp-cloud", name: "Cloud-Engineers", roles: ["role-cloud-eng"] },
    { id: "grp-cloud-admin", name: "Cloud-Platform-Admins", roles: ["role-cloud-admin"] },
    { id: "grp-payroll", name: "Payroll-Team", roles: ["role-payroll-spec"] },
    { id: "grp-payroll-appr", name: "Payroll-Approvers", roles: ["role-payroll-approver"] },
    { id: "grp-ap", name: "AP-Team", roles: ["role-ap-clerk"] },
    { id: "grp-ap-mgr", name: "AP-Managers", roles: ["role-ap-manager"] },
    { id: "grp-ehr-admin", name: "EHR-Admins", roles: ["role-ehr-admin"] },
    { id: "grp-nursing", name: "All-Nursing", roles: ["role-nurse"] },
    { id: "grp-providers", name: "Medical-Staff", roles: ["role-physician"] },
    { id: "grp-sales", name: "RevenueOps", roles: ["role-sf-admin"] },
    { id: "grp-dba", name: "Database-Admins", roles: ["role-dba"] },
    { id: "grp-snow", name: "ITSM-Admins", roles: ["role-snow-admin"] },
    { id: "grp-o365", name: "M365-Admins", roles: ["role-o365-admin"] },
    { id: "grp-eng", name: "Engineering-Guild", roles: ["role-ghe-owner"] },
    { id: "grp-security", name: "Security-Ops", roles: ["role-security-analyst"] },
    { id: "grp-contractors", name: "Contractors", roles: ["role-contractor-basic"] },
    { id: "grp-interns", name: "Interns", roles: ["role-intern"] }
  ];

  // Toxic pairs = segregation-of-duties conflicts (same identity must not hold both).
  var SOD_PAIRS = [
    { a: "ent-ad-da", b: "ent-ad-resetpw", label: "Admin + Password Reset (Tier-0 takeover)" },
    { a: "ent-pay-write", b: "ent-pay-approve", label: "Payroll Write + Approve (fraud)" },
    { a: "ent-ora-post", b: "ent-ora-vendor", label: "Post Journal + Vendor Master (AP fraud)" },
    { a: "ent-aws-admin", b: "ent-aws-iam", label: "Full Admin + IAM Modify (persistence)" },
    { a: "ent-o365-ga", b: "ent-o365-mailbox", label: "Global Admin + Mailbox Access (exfil)" },
    { a: "ent-epic-admin", b: "ent-epic-rx", label: "EHR Admin + ePrescribe (clinical fraud)" }
  ];

  var FIRST = ["Avery","Jordan","Riley","Casey","Morgan","Taylor","Quinn","Reese","Dakota","Skyler","Cameron","Rowan","Emerson","Finley","Hayden","Parker","Sawyer","Blake","Drew","Ellis","Harper","Kendall","Lane","Marlowe","Noor","Omar","Priya","Rafael","Sofia","Tariq","Ursula","Viktor","Wren","Yusuf","Zara","Maya","Leo","Iris","Nadia","Caleb"];
  var LAST = ["Alvarez","Bennett","Cho","Delgado","Erickson","Fontaine","Gallagher","Hassan","Ibrahim","Jensen","Kowalski","Laurent","Mercer","Nakamura","Okafor","Petrov","Quintero","Rasmussen","Singh","Tanaka","Underwood","Vargas","Whitfield","Xu","Yates","Zimmerman","Ashford","Boone","Castillo","Duarte","Ellison","Franco"];
  var DEPTS = ["Finance","Nursing","Medical Staff","IT Infrastructure","Cloud Platform","IT Support","Clinical Informatics","Security","Revenue Ops","Data Services","IT Service Mgmt","Engineering","External"];

  var TITLES = {
    "IT Infrastructure": ["Systems Engineer","Directory Services Admin","Infrastructure Lead"],
    "IT Support": ["Help Desk Technician","Desktop Support Analyst"],
    "Cloud Platform": ["Cloud Engineer","Platform SRE"],
    "Finance": ["Payroll Specialist","Accounts Payable Clerk","Financial Analyst"],
    "Clinical Informatics": ["EHR Analyst","Clinical Systems Admin"],
    "Nursing": ["Registered Nurse","Charge Nurse"],
    "Medical Staff": ["Physician","Hospitalist"],
    "Revenue Ops": ["Salesforce Admin","Revenue Analyst"],
    "Data Services": ["Database Administrator","Data Engineer"],
    "IT Service Mgmt": ["ServiceNow Admin","ITSM Analyst"],
    "Security": ["Security Analyst","IAM Analyst"],
    "Engineering": ["Software Engineer","DevOps Engineer"],
    "External": ["Contractor","Consultant"]
  };

  var GROUP_BY_DEPT = {
    "Finance": ["grp-ap", "grp-payroll"],
    "Nursing": ["grp-nursing"],
    "Medical Staff": ["grp-providers"],
    "IT Infrastructure": ["grp-o365", "grp-helpdesk"],
    "Cloud Platform": ["grp-cloud"],
    "IT Support": ["grp-helpdesk"],
    "Clinical Informatics": ["grp-ehr-admin"],
    "Security": ["grp-security"],
    "Revenue Ops": ["grp-sales"],
    "Data Services": ["grp-dba"],
    "IT Service Mgmt": ["grp-snow"],
    "Engineering": ["grp-eng"],
    "External": ["grp-contractors"]
  };

  function build(seed) {
    var rng = mulberry32(seed || 1337);
    var nodes = [], links = [];
    var byId = {};

    function addNode(n) { n.links = []; nodes.push(n); byId[n.id] = n; return n; }

    APPS.forEach(function (a) {
      addNode({ id: a.id, type: "app", label: a.short, full: a.name, crown: !!a.crown, criticality: a.criticality });
    });
    ENTITLEMENTS.forEach(function (e) {
      addNode({ id: e.id, type: "entitlement", label: e.name, app: e.app, risk: e.risk, weight: RISK_WEIGHT[e.risk] });
    });
    ROLES.forEach(function (r) {
      addNode({ id: r.id, type: "role", label: r.name, dept: r.dept });
    });
    GROUPS.forEach(function (g) {
      addNode({ id: g.id, type: "group", label: g.name });
    });

    function link(source, target, kind) {
      var l = { source: source, target: target, kind: kind || "access" };
      links.push(l);
      if (byId[source]) byId[source].links.push({ to: target, kind: l.kind });
    }

    // group -> role (grants)
    GROUPS.forEach(function (g) {
      g.roles.forEach(function (r) { link(g.id, r, "grants"); });
    });
    // role -> entitlement (provides)
    ROLES.forEach(function (r) {
      r.ents.forEach(function (e) { link(r.id, e, "provides"); });
    });
    // entitlement -> app (grantsAccessTo)
    ENTITLEMENTS.forEach(function (e) { link(e.id, e.app, "grantsAccessTo"); });

    // ---- users
    var users = [];
    var userCount = 58;
    var usedNames = {};
    for (var i = 0; i < userCount; i++) {
      var name;
      do { name = pick(rng, FIRST) + " " + pick(rng, LAST); } while (usedNames[name]);
      usedNames[name] = 1;
      var dept = pick(rng, DEPTS);
      var isContractor = dept === "External" || rng() < 0.08;
      var type = isContractor ? "contractor" : (rng() < 0.06 ? "service" : "employee");
      var uid = "usr-" + String(i + 1).padStart(3, "0");
      var u = addNode({
        id: uid,
        type: "user",
        label: name,
        dept: isContractor ? "External" : dept,
        title: pick(rng, TITLES[dept] || TITLES["IT Support"]),
        kind: type,
        manager: null,
        lastLoginDays: rng() < 0.12 ? (90 + Math.floor(rng() * 200)) : Math.floor(rng() * 60),
        mfa: rng() > 0.18,
        status: rng() < 0.06 ? "disabled" : "enabled",
        createdDaysAgo: 180 + Math.floor(rng() * 2200)
      });
      users.push(u);
      // group memberships (1-3)
      var pool = (GROUP_BY_DEPT[u.dept] || ["grp-helpdesk"]).slice();
      // occasional risky cross-membership
      if (rng() < 0.12) pool.push(pick(rng, GROUPS.filter(function (g) { return g.id !== "grp-contractors"; }).map(function (g) { return g.id; })));
      var groups = sample(rng, pool, 1 + Math.floor(rng() * 2));
      groups.forEach(function (g) { link(uid, g, "memberOf"); });
    }

    // managers: designate 6 lead users
    var managers = sample(rng, users, 6).map(function (m) { m.isManager = true; return m.id; });
    users.forEach(function (u) {
      if (u.kind === "employee" && rng() < 0.85) u.manager = pick(rng, managers.filter(function (m) { return m !== u.id; }));
      else u.manager = null;
    });

    // ---- deliberate risk scenarios (deterministic, illustrative)
    function findUser(pred) { return users.find(pred); }
    function assignRole(u, roleId) { if (u) link(u.id, roleId, "assignedRole"); }
    function assignEnt(u, entId) { if (u) link(u.id, entId, "directGrant"); }

    // 1) Dormant + privileged directory admin (no sign-in for ~6 months)
    var d1 = users[2];
    d1.dept = "IT Infrastructure"; d1.title = "Directory Services Admin";
    d1.lastLoginDays = 187; d1.mfa = true; d1.status = "enabled"; d1.manager = managers[0];
    assignRole(d1, "role-domain-admin");

    // 2) Contractor with cloud admin (over-provisioned external identity)
    var d2 = findUser(function (u) { return u.kind === "contractor"; });
    if (d2) { d2.dept = "Cloud Platform"; d2.title = "Platform Consultant"; assignRole(d2, "role-cloud-admin"); }

    // 3) SoD: AP clerk also granted vendor-master edit
    var d3 = findUser(function (u) { return u.dept === "Finance"; });
    if (d3) { d3.title = "Accounts Payable Clerk"; assignRole(d3, "role-ap-clerk"); assignEnt(d3, "ent-ora-vendor"); }

    // 4) SoD: payroll write + approve on one identity
    var d4 = findUser(function (u) { return u.dept === "Finance" && u !== d3; });
    if (d4) { assignRole(d4, "role-payroll-spec"); assignRole(d4, "role-payroll-approver"); }

    // 5) MFA gap: privileged M365 admin with MFA disabled
    var d5 = findUser(function (u) { return u.kind === "employee" && u.mfa; });
    if (d5) { d5.mfa = false; d5.dept = "IT Infrastructure"; d5.title = "Infrastructure Lead"; assignRole(d5, "role-o365-admin"); }

    // 6) Orphaned: enabled, no manager, sitting in AD-Admins
    var d6 = users[7];
    d6.manager = null; d6.status = "enabled"; d6.lastLoginDays = 14; d6.kind = "employee";
    link(d6.id, "grp-ad-admins", "memberOf");

    // 7) Help desk account that reaches a crown jewel in a short path
    var d7 = users[10];
    d7.dept = "IT Support"; d7.title = "Help Desk Technician";
    d7.mfa = true; d7.lastLoginDays = 2; d7.status = "enabled";
    link(d7.id, "grp-helpdesk", "memberOf");

    // 8) Cloud engineer with direct high-risk grant
    var d8 = users[15];
    d8.dept = "Cloud Platform"; d8.title = "Cloud Engineer";
    d8.mfa = true; d8.lastLoginDays = 1; d8.status = "enabled";
    link(d8.id, "grp-cloud", "memberOf");
    assignEnt(d8, "ent-aws-admin");

    return { nodes: nodes, links: links, byId: byId, users: users, apps: APPS, sod: SOD_PAIRS };
  }

  /* ------------------------------------------------------- graph analysis */
  function buildAdjacency(env) {
    var adj = {};
    env.nodes.forEach(function (n) { adj[n.id] = []; });
    env.links.forEach(function (l) {
      if (adj[l.source]) adj[l.source].push({ to: l.target, kind: l.kind });
    });
    return adj;
  }

  function bfsPath(adj, source, target) {
    if (source === target) return [source];
    var prev = {}; prev[source] = null;
    var q = [source];
    while (q.length) {
      var cur = q.shift();
      var ns = adj[cur] || [];
      for (var i = 0; i < ns.length; i++) {
        var next = ns[i].to;
        if (prev[next] === undefined) {
          prev[next] = { from: cur, kind: ns[i].kind };
          if (next === target) {
            var path = [target], steps = [];
            var node = target;
            while (prev[node]) { steps.unshift(prev[node].kind); node = prev[node].from; path.unshift(node); }
            return { nodes: path, kinds: steps };
          }
          q.push(next);
        }
      }
    }
    return null;
  }

  function reachable(adj, source) {
    var seen = {}; seen[source] = true; var q = [source];
    while (q.length) {
      var cur = q.shift();
      (adj[cur] || []).forEach(function (e) { if (!seen[e.to]) { seen[e.to] = true; q.push(e.to); } });
    }
    return seen;
  }

  function entitlementsFor(env, adj, userId) {
    var reach = reachable(adj, userId);
    return env.nodes.filter(function (n) { return n.type === "entitlement" && reach[n.id]; });
  }

  function crownJewelsFor(env, adj, userId) {
    var reach = reachable(adj, userId);
    return env.nodes.filter(function (n) { return n.type === "app" && n.crown && reach[n.id]; });
  }

  function riskScore(ents) {
    return ents.reduce(function (s, e) { return s + (e.weight || RISK_WEIGHT[e.risk] || 1); }, 0);
  }

  /* ------------------------------------------------------------- findings */
  function analyze(env) {
    var adj = buildAdjacency(env);
    var findings = [];
    var fid = 0;
    function add(f) { f.id = "F" + String(++fid).padStart(3, "0"); findings.push(f); }

    var userEnts = {}, userCrown = {};
    env.users.forEach(function (u) {
      var ents = entitlementsFor(env, adj, u.id);
      userEnts[u.id] = ents;
      userCrown[u.id] = crownJewelsFor(env, adj, u.id);
      u.riskScore = riskScore(ents);
      u.entCount = ents.length;
      u.crownCount = userCrown[u.id].length;
      u.privCount = ents.filter(function (e) { return e.risk === "high" || e.risk === "critical"; }).length;
    });

    // Dormant privileged accounts
    env.users.forEach(function (u) {
      if (u.status === "enabled" && u.lastLoginDays >= 90 && u.privCount > 0) {
        add({
          category: "Dormant Account", severity: u.privCount >= 2 ? "critical" : "high", user: u.id,
          title: "Dormant privileged account: " + u.label,
          detail: "No sign-in for " + u.lastLoginDays + " days yet retains " + u.privCount + " high/critical entitlement(s).",
          nodes: [u.id].concat(userEnts[u.id].map(function (e) { return e.id; }))
        });
      }
    });

    // Orphaned / no manager
    env.users.forEach(function (u) {
      if (u.status === "enabled" && !u.manager && u.kind === "employee" && u.privCount > 0) {
        add({
          category: "Orphaned Account", severity: "high", user: u.id,
          title: "Orphaned account: " + u.label,
          detail: "Enabled identity with privileged access but no assigned manager to attest ownership.",
          nodes: [u.id].concat(userEnts[u.id].map(function (e) { return e.id; }))
        });
      }
    });

    // MFA gap on privileged access
    env.users.forEach(function (u) {
      if (u.status === "enabled" && !u.mfa && u.privCount > 0) {
        add({
          category: "MFA Gap", severity: "critical", user: u.id,
          title: "MFA gap: " + u.label,
          detail: "Privileged access without multi-factor authentication (" + u.privCount + " high/critical entitlement(s)).",
          nodes: [u.id].concat(userEnts[u.id].map(function (e) { return e.id; }))
        });
      }
    });

    // Privilege creep
    env.users.forEach(function (u) {
      if (u.privCount >= 4) {
        add({
          category: "Privilege Creep", severity: u.privCount >= 6 ? "critical" : "high", user: u.id,
          title: "Privilege creep: " + u.label,
          detail: u.privCount + " high/critical entitlements accumulated (risk score " + u.riskScore + ").",
          nodes: [u.id].concat(userEnts[u.id].map(function (e) { return e.id; }))
        });
      }
    });

    // SoD conflicts (per identity holding both sides of a toxic pair)
    env.users.forEach(function (u) {
      var held = {}; userEnts[u.id].forEach(function (e) { held[e.id] = true; });
      SOD_PAIRS.forEach(function (p) {
        if (held[p.a] && held[p.b]) {
          add({
            category: "SoD Conflict", severity: "critical", user: u.id,
            title: "Segregation-of-duties conflict: " + u.label,
            detail: p.label + " — holds both " + byIdLabel(env, p.a) + " and " + byIdLabel(env, p.b) + ".",
            nodes: [u.id, p.a, p.b]
          });
        }
      });
    });

    // Direct grants bypassing role-based approval
    env.links.forEach(function (l) {
      if (l.kind === "directGrant") {
        var e = env.byId[l.target], u = env.byId[l.source];
        if (e && u && (e.risk === "high" || e.risk === "critical")) {
          add({
            category: "Direct Grant", severity: "high", user: u.id,
            title: "Direct entitlement grant: " + u.label + " → " + e.label,
            detail: "Entitlement assigned directly to the identity, bypassing role-based approval and review.",
            nodes: [l.source, l.target]
          });
        }
      }
    });

    // Over-provisioned contractors
    env.users.forEach(function (u) {
      if (u.kind === "contractor" && u.privCount >= 2) {
        add({
          category: "Contractor Over-Provisioning", severity: "high", user: u.id,
          title: "Over-provisioned contractor: " + u.label,
          detail: "External identity holds " + u.privCount + " high/critical entitlements.",
          nodes: [u.id].concat(userEnts[u.id].map(function (e) { return e.id; }))
        });
      }
    });

    // Stale roles (no members)
    var roleMembers = {};
    env.links.forEach(function (l) {
      if (l.kind === "assignedRole" || l.kind === "grants") {
        var t = env.byId[l.target];
        if (t && t.type === "role") roleMembers[l.target] = (roleMembers[l.target] || 0) + 1;
      }
    });
    env.nodes.filter(function (n) { return n.type === "role"; }).forEach(function (r) {
      if (!roleMembers[r.id]) {
        add({ category: "Stale Role", severity: "medium", role: r.id, title: "Stale role: " + r.label, detail: "Role has no assigned members and no group grants — candidate for decommission.", nodes: [r.id] });
      }
    });

    // Crown-jewel exposure via short path (<=4 hops)
    env.users.forEach(function (u) {
      if (u.status !== "enabled") return;
      userCrown[u.id].forEach(function (app) {
        var p = bfsPath(adj, u.id, app.id);
        if (p && p.nodes.length <= 4) {
          add({
            category: "Crown Jewel Exposure", severity: app.criticality === "critical" ? "critical" : "high", user: u.id,
            title: "Short path to " + app.full,
            detail: u.label + " reaches a " + app.criticality + " system in " + (p.nodes.length - 1) + " hops.",
            nodes: p.nodes, path: p
          });
        }
      });
    });

    var sevRank = { critical: 0, high: 1, medium: 2, low: 3 };
    var catRank = { "MFA Gap": 0, "SoD Conflict": 1, "Direct Grant": 2, "Contractor Over-Provisioning": 3, "Orphaned Account": 4, "Dormant Account": 5, "Privilege Creep": 6, "Crown Jewel Exposure": 7, "Stale Role": 8 };
    findings.sort(function (a, b) {
      var s = sevRank[a.severity] - sevRank[b.severity];
      if (s) return s;
      return (catRank[a.category] || 9) - (catRank[b.category] || 9);
    });

    var stats = {
      identities: env.users.length,
      enabled: env.users.filter(function (u) { return u.status === "enabled"; }).length,
      privileged: env.users.filter(function (u) { return u.privCount > 0; }).length,
      dormant: env.users.filter(function (u) { return u.lastLoginDays >= 90 && u.status === "enabled"; }).length,
      orphaned: env.users.filter(function (u) { return !u.manager && u.kind === "employee" && u.status === "enabled"; }).length,
      noMfa: env.users.filter(function (u) { return !u.mfa && u.status === "enabled"; }).length,
      crown: env.apps.filter(function (a) { return a.crown; }).length,
      findings: findings.length,
      critical: findings.filter(function (f) { return f.severity === "critical"; }).length,
      high: findings.filter(function (f) { return f.severity === "high"; }).length,
      medium: findings.filter(function (f) { return f.severity === "medium"; }).length,
      sod: findings.filter(function (f) { return f.category === "SoD Conflict"; }).length
    };

    return { env: env, adj: adj, findings: findings, stats: stats, userEnts: userEnts, userCrown: userCrown };
  }

  function byIdLabel(env, id) { var n = env.byId[id]; return n ? n.label : id; }

  function toEvidenceCSV(result) {
    var lines = ["finding_id,severity,category,identity,title,detail"];
    result.findings.forEach(function (f) {
      var id = f.user || f.role || "n/a";
      var who = result.env.byId[id] ? result.env.byId[id].label : id;
      lines.push([f.id, f.severity, f.category, q(who), q(f.title), q(f.detail)].join(","));
    });
    return lines.join("\n");
    function q(s) { return '"' + String(s).replace(/"/g, '""') + '"'; }
  }

  function toEvidenceJSON(result) {
    return JSON.stringify({
      generated: new Date().toISOString(),
      note: "Synthetic demonstration data - Identity Attack Path Analyzer",
      stats: result.stats,
      findings: result.findings.map(function (f) {
        var id = f.user || f.role || null;
        return {
          id: f.id, severity: f.severity, category: f.category,
          identity: id && result.env.byId[id] ? result.env.byId[id].label : id,
          title: f.title, detail: f.detail, path: f.path ? f.path.nodes : f.nodes
        };
      })
    }, null, 2);
  }

  return {
    build: build,
    analyze: analyze,
    buildAdjacency: buildAdjacency,
    bfsPath: bfsPath,
    reachable: reachable,
    entitlementsFor: entitlementsFor,
    crownJewelsFor: crownJewelsFor,
    toEvidenceCSV: toEvidenceCSV,
    toEvidenceJSON: toEvidenceJSON,
    RISK_WEIGHT: RISK_WEIGHT,
    SOD_PAIRS: SOD_PAIRS
  };
});
