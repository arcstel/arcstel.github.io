(function () {
  "use strict";

  var SKILLS = {
    "IAM & IGA": ["SailPoint Identity Governance & Administration (IGA)", "One Identity Manager", "Active Directory (AD)", "Entra ID / Azure AD Admin Center", "Role-Based Access Control (RBAC)", "Attribute-Based Access Control (ABAC)", "Joiner-Mover-Leaver (JML) Lifecycle", "Entitlement Management", "SSO / MFA"],
    "Identity Operations": ["User Provisioning", "Deprovisioning", "Access Request Fulfillment", "Access Reviews", "Recertification", "Least-Privilege Enforcement", "Segregation of Duties (SoD)", "Audit Evidence & Reporting", "Process Documentation / SOPs"],
    "PAM & Governance": ["Privileged Access Management (PAM)", "Privileged Account Administration", "Access Governance", "Compliance Controls", "Audit Readiness", "Identity Data Quality & Hygiene"],
    "Platforms": ["ServiceNow", "Imprivata", "Voalte Admin Console", "Citrix Workspace", "Infor Lawson (PeopleSoft)", "Microsoft 365 / O365 Admin", "IBM AS400", "Active Directory", "Azure / Entra ID"],
    "Security & Compliance": ["SOX", "HIPAA", "GDPR", "NCQA", "NIST-Aligned Controls", "Risk Management", "Least Privilege"],
    "Scripting & Reporting": ["PowerShell", "SQL Fundamentals", "Excel (Pivot Tables, Lookups)", "Data Analytics & Reporting", "Google Data Analytics", "IBM Cybersecurity Analyst"],
    "Languages": ["Persian / Farsi — Intermediate", "Russian — Basic"]
  };

  var EXPERIENCE = [
    {
      role: "IAM Analyst I", company: "Novant Health", period: "Sep 2025 – Jul 2026", current: true,
      bullets: [
        "Manage core Identity & Access Management operations — user lifecycle, role-based access control, and data integrity — across a large enterprise healthcare network.",
        "Completed advanced SailPoint Identity Governance & Administration (IGA) training; support automated provisioning, compliance controls, and access certifications.",
        "Administer and configure application permissions, aligning access with security policy and clinical workflow requirements.",
        "Resolve identity and access issues through ServiceNow and documented SOPs, supporting timely, audit-ready access changes."
      ]
    },
    {
      role: "IAM Security Analyst", company: "New Hanover (Novant Health) via TEKsystems", period: "2022 – Sep 2025",
      bullets: [
        "Performed regular user access audits across enterprise systems to enforce least privilege and maintain compliance with corporate security policy.",
        "Partnered with technical and clinical teams on provisioning and directory integrations for Voalte, Imprivata, Citrix Workspace, Dimensions, One Identity Manager, and Active Directory.",
        "Contributed to Privileged Access Management (PAM) initiatives and optimized access-request processes before and after high-stakes migration go-lives.",
        "Delivered technical training and documentation to drive adoption of new access processes and IAM platforms."
      ]
    },
    {
      role: "Tier 3 Analyst (IAM Security Analyst)", company: "Billings Clinic", period: "2021 – 2022",
      bullets: [
        "Primary technical escalation point for enterprise identity and access management operations.",
        "Managed administration, user provisioning, and role governance within the SailPoint IGA platform and ServiceNow.",
        "Oversaw daily administration across Microsoft O365 Admin Center, Azure Active Directory, Infor Lawson (PeopleSoft), Voalte Admin Console, and Imprivata."
      ]
    },
    {
      role: "IT Triage / Tier 1 Support (IT Associate)", company: "Billings Clinic", period: "2019 – 2021",
      bullets: [
        "Provided overnight and weekend Service Desk coverage, triaging complex technical issues under tight timelines.",
        "Executed daily IBM AS400 backups and maintained SmartCall Coastal pager support networks.",
        "Provisioned, imaged, and deployed clinical medical devices; delivered dedicated floor and phone support."
      ]
    },
    {
      role: "Cyber Security Intern", company: "Mossé Cyber Security Institute", period: "2018 – 2019",
      bullets: ["Practical experience in cybersecurity operations, threat analysis, and risk management frameworks."]
    },
    {
      role: "Licensed Practical Nurse (LPN) — Healthcare & Clinical", company: "Various Facilities", period: "2014 – 2020",
      bullets: ["Delivered patient care across hospice, geriatric, LTC, acute, mental health, and correctional settings under NCQA standards."]
    },
    {
      role: "Hospital Corpsman (HN) — USS Portsmouth (SSN-707)", company: "U.S. Navy — Veteran", period: "Military Service",
      bullets: ["Crewman and Operations"]
    }
  ];

  var EDUCATION = [
    { icon: "🎓", title: "B.S. in Cybersecurity", school: "Western Governors University", meta: "In Progress · 129 credit hours completed", progress: 86 },
    { icon: "🩺", title: "Diploma in Nursing (LPN)", school: "Chester Career College", meta: "2014 – 2016" },
    { icon: "💊", title: "A.A.S. in Pharmacy Technician", school: "Richmond School for Science & Health Technology", meta: "2013 – 2014" }
  ];

  var CERTS = [
    { cat: "ISC²", items: ["SSCP — Systems Security Certified Practitioner", "Certified in Cybersecurity (CC)", "Associate of ISC²"] },
    { cat: "CompTIA", items: ["Security+ CE", "CySA+ CE", "Network+ CE", "A+ CE", "CSAP Stackable", "CSIS Stackable"] },
    { cat: "SailPoint", items: ["Identity Security Leader Credential"] },
    { cat: "Cisco", items: ["CCNA — Introduction to Networks", "CCNA — Enterprise Networking, Security & Automation", "CyberOps Associate"] },
    { cat: "Linux Foundation", items: ["LFS203 Linux for Cloud Technicians", "LFS207 Linux System Administration", "LFS253 Containers Fundamentals", "LFS258 Kubernetes Fundamentals", "LFS261 DevOps & SRE"] },
    { cat: "Other", items: ["LPI Linux Essentials", "MITRE ATT&CK (AttackIQ)", "Google Data Analytics", "IBM Cybersecurity Analyst"] },
    { cat: "Healthcare", items: ["Licensed Practical Nurse (LPN) — Active", "CPHT Pharmacy Technician (Lapsed)"] }
  ];

  var LANG_COLORS = { TypeScript: "#3178c6", JavaScript: "#f1e05a", HTML: "#e34c26", CSS: "#563d7c", Python: "#3572A5", Shell: "#89e051", Rust: "#dea584", Go: "#00ADD8" };
  var FALLBACK_REPOS = [
    { name: "spiritdeck", description: "Interactive card-deck experience.", language: "TypeScript", stargazers_count: 0, html_url: "https://github.com/arcstel/spiritdeck", updated_at: "" },
    { name: "Skulley", description: "Interactive map of the 22 bones of the skull.", language: "HTML", stargazers_count: 0, html_url: "https://github.com/arcstel/Skulley", updated_at: "" },
    { name: "Cranial-nerves", description: "Interactive cranial nerve explorer.", language: "HTML", stargazers_count: 0, html_url: "https://github.com/arcstel/Cranial-nerves", updated_at: "" },
    { name: "periodic-map", description: "Interactive periodic table.", language: "HTML", stargazers_count: 0, html_url: "https://github.com/arcstel/periodic-map", updated_at: "" }
  ];

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------------------------------------------------------------- skills */
  var skillState = { cat: null, q: "" };

  function renderSkills() {
    var groups = document.getElementById("skillGroups");
    var cats = document.getElementById("skillCats");
    cats.innerHTML = "";
    Object.keys(SKILLS).forEach(function (c) {
      var el = document.createElement("span");
      el.className = "chip"; el.setAttribute("data-filter", "cat"); el.textContent = c;
      el.addEventListener("click", function () {
        skillState.cat = skillState.cat === c ? null : c;
        Array.prototype.forEach.call(cats.children, function (x) { x.classList.toggle("active", x.textContent === skillState.cat); });
        paintSkills();
      });
      cats.appendChild(el);
    });

    groups.innerHTML = "";
    Object.keys(SKILLS).forEach(function (cat) {
      var sec = document.createElement("div");
      sec.className = "skill-cat"; sec.setAttribute("data-cat", cat);
      var h = document.createElement("h4"); h.textContent = cat; sec.appendChild(h);
      var tags = document.createElement("div"); tags.className = "skill-tags";
      SKILLS[cat].forEach(function (s) {
        var t = document.createElement("span");
        t.className = "chip"; t.setAttribute("data-skill", s.toLowerCase()); t.textContent = s;
        tags.appendChild(t);
      });
      sec.appendChild(tags); groups.appendChild(sec);
    });
    paintSkills();
  }

  function paintSkills() {
    var q = skillState.q.toLowerCase();
    Array.prototype.forEach.call(document.querySelectorAll(".skill-cat"), function (sec) {
      var catOk = !skillState.cat || sec.getAttribute("data-cat") === skillState.cat;
      var anyVisible = false;
      Array.prototype.forEach.call(sec.querySelectorAll(".chip"), function (chip) {
        var ok = catOk && (!q || chip.getAttribute("data-skill").indexOf(q) >= 0);
        chip.style.display = ok ? "" : "none";
        if (ok) anyVisible = true;
      });
      sec.style.display = anyVisible ? "" : "none";
    });
  }

  /* ------------------------------------------------------------- timeline */
  function renderTimeline() {
    var box = document.getElementById("timeline");
    box.innerHTML = EXPERIENCE.map(function (e) {
      return '<div class="tl-item">' +
        '<h3>' + esc(e.role) + (e.current ? ' <span class="badge sev-critical" style="vertical-align:middle">Current</span>' : "") + '</h3>' +
        '<div class="tl-meta"><span class="company">' + esc(e.company) + '</span> · ' + esc(e.period) + '</div>' +
        '<ul>' + e.bullets.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>" +
        '</div>';
    }).join("");
  }

  /* ------------------------------------------------------------ education */
  function renderEducation() {
    document.getElementById("eduGrid").innerHTML = EDUCATION.map(function (e) {
      return '<div class="card edu-card"><div class="edu-icon">' + e.icon + '</div><div style="flex:1">' +
        '<h3>' + esc(e.title) + '</h3>' +
        '<div class="meta">' + esc(e.school) + '</div>' +
        '<div class="meta" style="margin-top:4px">' + esc(e.meta) + '</div>' +
        (e.progress ? '<div class="progress"><i style="width:' + e.progress + '%"></i></div>' : "") +
        '</div></div>';
    }).join("");
  }

  /* --------------------------------------------------------- certifications */
  function renderCerts() {
    document.getElementById("certGrid").innerHTML = CERTS.map(function (c) {
      return '<div class="cert-cat"><h4>' + esc(c.cat) + '</h4><div class="cert-list">' +
        c.items.map(function (i) { return '<span class="cert">' + esc(i) + '</span>'; }).join("") +
        '</div></div>';
    }).join("");
  }

  /* --------------------------------------------------------------- repos */
  function repoCard(r) {
    var color = LANG_COLORS[r.language] || "#8fa3bd";
    var updated = r.updated_at ? new Date(r.updated_at).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "";
    var el = document.createElement("div");
    el.className = "card repo";
    el.innerHTML =
      '<h3>' + esc(r.name) + '</h3>' +
      '<p class="desc">' + esc(r.description || "No description yet.") + '</p>' +
      '<div class="foot">' +
        (r.language ? '<span class="lang"><i style="background:' + color + '"></i>' + esc(r.language) + '</span>' : "") +
        '<span>★ ' + (r.stargazers_count || 0) + '</span>' +
        (updated ? '<span>updated ' + updated + '</span>' : "") +
      '</div>' +
      '<a class="btn btn-sm" href="' + esc(r.html_url) + '" target="_blank" rel="noopener">View repo ↗</a>';
    return el;
  }

  function renderRepos(repos) {
    var grid = document.getElementById("repoGrid");
    grid.innerHTML = "";
    repos.slice(0, 8).forEach(function (r) { grid.appendChild(repoCard(r)); });
  }

  function loadRepos() {
    fetch("https://api.github.com/users/arcstel/repos?per_page=100&sort=updated")
      .then(function (r) { if (!r.ok) throw new Error("gh"); return r.json(); })
      .then(function (data) {
        if (!Array.isArray(data) || !data.length) throw new Error("empty");
        var repos = data.filter(function (r) { return !r.fork; });
        renderRepos(repos.sort(function (a, b) { return new Date(b.updated_at) - new Date(a.updated_at); }));
      })
      .catch(function () { renderRepos(FALLBACK_REPOS); });
  }

  /* --------------------------------------------------------- typing effect */
  function typeLine() {
    var el = document.getElementById("termLine");
    if (!el) return;
    var cmds = ["provision --jml --dry-run", "collect-evidence --framework hipaa", "review --least-privilege", "sync --sailpoint --entra-id"];
    var i = 0, j = 0, text = "";
    function step() {
      if (j <= cmds[i].length) { el.textContent = cmds[i].slice(0, j++); setTimeout(step, 55); }
      else { setTimeout(function () { j = 0; i = (i + 1) % cmds.length; el.textContent = ""; step(); }, 1600); }
    }
    step();
  }

  /* -------------------------------------------------------------- reveal */
  function reveal() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  }

  function init() {
    document.getElementById("year").textContent = new Date().getFullYear();
    renderSkills(); renderTimeline(); renderEducation(); renderCerts(); loadRepos(); typeLine(); reveal();
    var search = document.getElementById("skillSearch");
    search.addEventListener("input", function () { skillState.q = this.value.trim(); paintSkills(); });
    var toggle = document.getElementById("navToggle"), links = document.getElementById("navLinks");
    toggle.addEventListener("click", function () { links.classList.toggle("open"); });
    links.addEventListener("click", function (e) { if (e.target.tagName === "A") links.classList.remove("open"); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
