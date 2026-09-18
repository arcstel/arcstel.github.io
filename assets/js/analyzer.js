(function () {
  "use strict";

  var result = IAM.analyze(IAM.build(20260918));
  var env = result.env;
  var nodes = env.nodes;
  var links = env.links;
  var adj = result.adj;
  var findings = result.findings;

  var svg = d3.select("#graph");
  var W = 900, H = 640;
  var tooltip = d3.select("#tooltip");
  var zoom = d3.zoom().scaleExtent([0.15, 4]).on("zoom", function (ev) { root.attr("transform", ev.transform); });

  var state = {
    selected: null,
    activeFinding: null,
    path: null,
    types: {},
    sevs: {},
    query: ""
  };

  var COLORS = {
    user: "#4f8cff", group: "#3ddc97", role: "#f5b544",
    entitlement: "#ff6b6b", app: "#35d0e0"
  };
  var SEV_COLOR = { critical: "#ff6b6b", high: "#f5b544", medium: "#4f8cff", low: "#8fa3bd" };
  var TYPE_LABEL = { user: "Identity", group: "Group", role: "Role", entitlement: "Entitlement", app: "System" };
  var LAYER = { user: 0, group: 1, role: 2, entitlement: 3, app: 4 };
  var LAYER_X = [0.05, 0.30, 0.52, 0.74, 0.96];

  function radius(d) {
    if (d.type === "app") return d.crown ? 13 : 10;
    if (d.type === "group") return 9;
    if (d.type === "role") return 8;
    if (d.type === "user") return 6;
    return 4.5;
  }

  /* ------------------------------------------------------------- stat strip */
  function renderStats() {
    var s = result.stats;
    var items = [
      { label: "Identities", value: s.identities, cls: "" },
      { label: "Elevated Access", value: s.privileged, cls: "warn" },
      { label: "Dormant ≥90d", value: s.dormant, cls: "alert" },
      { label: "No MFA", value: s.noMfa, cls: "alert" },
      { label: "SoD Conflicts", value: s.sod, cls: "alert" },
      { label: "Crown Jewels", value: s.crown, cls: "ok" },
      { label: "Findings", value: s.findings, cls: "warn" }
    ];
    d3.select("#statStrip").html("");
    items.forEach(function (it) {
      d3.select("#statStrip").append("div").attr("class", "stat " + it.cls)
        .html("<b>" + it.value + "</b><span>" + it.label + "</span>");
    });
  }

  /* --------------------------------------------------------------- chips */
  function renderChips() {
    var tc = d3.select("#typeChips").html("");
    ["user", "group", "role", "entitlement", "app"].forEach(function (t) {
      tc.append("span").attr("class", "chip").attr("data-filter", "type").datum(t)
        .html('<i class="dot" style="background:' + COLORS[t] + '"></i>' + TYPE_LABEL[t])
        .on("click", function () { state.types[t] = !state.types[t]; d3.select(this).classed("active", state.types[t]); apply(); });
    });
    var sc = d3.select("#sevChips").html("");
    ["critical", "high", "medium"].forEach(function (s) {
      sc.append("span").attr("class", "chip").attr("data-filter", "sev").datum(s)
        .html('<i class="dot" style="background:' + SEV_COLOR[s] + '"></i>' + s[0].toUpperCase() + s.slice(1))
        .on("click", function () { state.sevs[s] = !state.sevs[s]; d3.select(this).classed("active", state.sevs[s]); renderFindings(); });
    });
  }

  /* --------------------------------------------------------------- selects */
  function renderSelects() {
    var src = d3.select("#sourceSelect");
    src.selectAll("option").data(env.users).enter().append("option")
      .attr("value", function (d) { return d.id; })
      .text(function (d) { return d.label + " · " + d.dept; });
    var tgt = d3.select("#targetSelect");
    tgt.selectAll("option").data(env.apps).enter().append("option")
      .attr("value", function (d) { return d.id; })
      .text(function (d) { return (d.crown ? "★ " : "") + d.name; });
    src.property("value", "usr-011");
    tgt.property("value", "app-ad");
  }

  /* --------------------------------------------------------------- graph */
  var defs, root, linkSel, nodeSel, sim, appRingSel;

  function buildGraph() {
    svg.selectAll("*").remove();
    defs = svg.append("defs");
    defs.append("marker").attr("id", "arrow").attr("viewBox", "0 -5 10 10")
      .attr("refX", 19).attr("refY", 0).attr("markerWidth", 6).attr("markerHeight", 6)
      .attr("orient", "auto").append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", "#2b3b52");

    root = svg.append("g");

    linkSel = root.append("g").attr("class", "links").selectAll("line")
      .data(links).enter().append("line").attr("class", "link");

    nodeSel = root.append("g").attr("class", "nodes").selectAll("g")
      .data(nodes).enter().append("g")
      .attr("class", "node")
      .call(d3.drag().on("start", dragStart).on("drag", drag).on("end", dragEnd))
      .on("click", function (ev, d) { ev.stopPropagation(); selectNode(d); })
      .on("mouseover", showTip).on("mousemove", moveTip).on("mouseout", hideTip);

    nodeSel.append("circle").attr("r", radius).attr("fill", function (d) { return COLORS[d.type]; })
      .attr("opacity", function (d) { return d.status === "disabled" ? 0.4 : 1; });

    appRingSel = nodeSel.filter(function (d) { return d.type === "app"; })
      .append("circle").attr("class", function (d) { return "app-ring" + (d.criticality === "critical" ? " crit" : ""); })
      .attr("r", function (d) { return radius(d) + 5; });

    nodeSel.append("text").attr("dy", function (d) { return -radius(d) - 5; }).attr("text-anchor", "middle")
      .text(function (d) { return d.label; })
      .attr("opacity", function (d) { return d.type === "app" || d.type === "role" || d.type === "group" ? 1 : 0; });

    sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(function (d) { return d.id; })
        .distance(function (d) { return d.kind === "grantsAccessTo" ? 80 : 55; }).strength(0.35))
      .force("charge", d3.forceManyBody().strength(function (d) { return d.type === "app" ? -460 : -165; }))
      .force("x", d3.forceX(function (d) { return LAYER_X[LAYER[d.type]] * W; }).strength(0.7))
      .force("y", d3.forceY(H / 2).strength(0.05))
      .force("collide", d3.forceCollide().radius(function (d) { return radius(d) + 9; }))
      .on("tick", tick);

    svg.call(zoom);
    svg.on("click", function () { state.selected = null; state.activeFinding = null; state.path = null; clearSelectionUI(); apply(); renderInspector(); });
  }

  function tick() {
    linkSel.attr("x1", function (d) { return d.source.x; }).attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; }).attr("y2", function (d) { return d.target.y; });
    nodeSel.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
  }

  function dragStart(ev, d) { if (!ev.active) sim.alphaTarget(0.25).restart(); d.fx = d.x; d.fy = d.y; }
  function drag(ev, d) { d.fx = ev.x; d.fy = ev.y; }
  function dragEnd(ev, d) { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }

  /* ------------------------------------------------------------- tooltip */
  function showTip(ev, d) {
    var html = "<b>" + d.label + "</b>";
    if (d.type === "user") html += "<div class='t'>" + d.title + " · " + d.dept + "</div><div class='t'>" + (d.kind || "employee") + " · " + d.status + " · " + d.lastLoginDays + "d since login" + (d.mfa ? "" : " · no MFA") + "</div><div class='t'>risk " + d.riskScore + " · " + d.crownCount + " crown jewel(s)</div>";
    else if (d.type === "entitlement") html += "<div class='t'>" + d.risk.toUpperCase() + " risk · " + env.byId[d.app].name + "</div>";
    else if (d.type === "role") html += "<div class='t'>Role · " + d.dept + "</div>";
    else if (d.type === "group") html += "<div class='t'>Access group</div>";
    else if (d.type === "app") html += "<div class='t'>" + (d.crown ? "CROWN JEWEL · " : "") + d.criticality + " criticality</div>";
    tooltip.html(html).style("opacity", 1);
    moveTip(ev);
  }
  function moveTip(ev) {
    var x = ev.clientX + 14, y = ev.clientY + 14;
    var tw = tooltip.node().offsetWidth, th = tooltip.node().offsetHeight;
    if (x + tw > window.innerWidth - 10) x = ev.clientX - tw - 14;
    if (y + th > window.innerHeight - 10) y = ev.clientY - th - 14;
    tooltip.style("left", x + "px").style("top", y + "px");
  }
  function hideTip() { tooltip.style("opacity", 0); }

  /* --------------------------------------------------------- selection UI */
  function clearSelectionUI() {
    d3.select("#inspectorPane").classed("hidden", true);
    switchTab("findings");
  }
  function switchTab(name) {
    d3.selectAll(".tab").classed("active", function () { return this.getAttribute("data-tab") === name; });
    d3.select("#findingsPane").classed("hidden", name !== "findings");
    d3.select("#inspectorPane").classed("hidden", name !== "inspector");
  }

  function selectNode(d) {
    state.selected = d;
    state.activeFinding = null;
    state.path = null;
    d3.select("#pathResult").html('<span class="dim">Node selected. Use Find path to trace access.</span>');
    renderFindings();
    renderInspector();
    apply();
  }

  /* -------------------------------------------------------------- filters */
  function activeTypes() {
    var on = Object.keys(state.types).filter(function (k) { return state.types[k]; });
    return on.length ? on : null;
  }

  /* ------------------------------------------------------------ highlight */
  function apply() {
    var hl = null; // Set of node ids to keep bright
    var pathIds = null, pathLinkKeys = null;
    var types = activeTypes();

    if (state.path) {
      pathIds = {}; state.path.nodes.forEach(function (id) { pathIds[id] = 1; });
      pathLinkKeys = {};
      for (var i = 0; i < state.path.nodes.length - 1; i++) pathLinkKeys[state.path.nodes[i] + ">" + state.path.nodes[i + 1]] = 1;
      hl = pathIds;
    } else if (state.activeFinding) {
      hl = {}; state.activeFinding.nodes.forEach(function (id) { hl[id] = 1; });
    } else if (state.selected) {
      hl = { }; hl[state.selected.id] = 1;
      if (state.selected.type === "user") {
        var reach = IAM.reachable(adj, state.selected.id);
        Object.keys(reach).forEach(function (k) { hl[k] = 1; });
      } else if (state.selected.type === "app") {
        env.users.forEach(function (u) { if (IAM.reachable(adj, u.id)[state.selected.id]) hl[u.id] = 1; });
      }
    }

    nodeSel.classed("dim", function (d) {
      if (types && types.indexOf(d.type) < 0) return true;
      if (hl && !hl[d.id]) return true;
      if (state.query && !matchesQuery(d)) return true;
      return false;
    }).classed("hl", function (d) { return !!(hl && hl[d.id]); });

    nodeSel.select("text").attr("opacity", function (d) {
      var isDim = d3.select(this.parentNode).classed("dim");
      if (isDim) return 0;
      if (hl && hl[d.id]) return 1;
      return (d.type === "app" || d.type === "role" || d.type === "group") ? 1 : 0;
    });

    linkSel.attr("class", "link")
      .classed("dim", function (d) {
        if (types && (types.indexOf(d.source.type) < 0 || types.indexOf(d.target.type) < 0)) return true;
        if (hl && !(hl[d.source.id] && hl[d.target.id])) return true;
        return false;
      })
      .classed("path", function (d) { return !!(state.path && pathLinkKeys && pathLinkKeys[d.source.id + ">" + d.target.id]); })
      .classed("hl", function (d) { return !!(hl && !state.path && hl[d.source.id] && hl[d.target.id]); });
  }

  function matchesQuery(d) {
    var q = state.query.toLowerCase();
    return (d.label || "").toLowerCase().indexOf(q) >= 0 ||
      (d.dept || "").toLowerCase().indexOf(q) >= 0 ||
      d.type.indexOf(q) >= 0 ||
      (d.id || "").indexOf(q) >= 0;
  }

  /* -------------------------------------------------------------- findings */
  function renderFindings() {
    d3.select("#findingCount").text(findings.length);
    var sevOn = Object.keys(state.sevs).filter(function (k) { return state.sevs[k]; });
    var list = findings.filter(function (f) {
      if (sevOn.length && sevOn.indexOf(f.severity) < 0) return false;
      return true;
    });
    var box = d3.select("#findingList").html("");
    if (!list.length) { box.html('<div class="empty"><span class="big">✓</span>No findings match the current filters.</div>'); return; }
    list.forEach(function (f) {
      box.append("div").attr("class", "finding sev-border-" + f.severity)
        .classed("active", state.activeFinding && state.activeFinding.id === f.id)
        .html('<div class="row"><span class="badge sev-' + f.severity + '">' + f.severity + '</span><span class="cat">' + f.category + '</span></div>' +
          '<h4>' + esc(f.title) + '</h4><p>' + esc(f.detail) + '</p>')
        .on("click", function () { focusFinding(f); });
    });
  }

  function focusFinding(f) {
    state.activeFinding = f;
    state.path = f.path || null;
    state.selected = f.user ? env.byId[f.user] : (f.role ? env.byId[f.role] : null);
    renderFindings();
    renderInspector();
    apply();
    if (f.nodes && f.nodes.length) zoomToNodes(f.nodes); else if (state.selected) zoomToNodes([state.selected.id]);
  }

  /* ------------------------------------------------------------- inspector */
  function renderInspector() {
    var pane = d3.select("#inspector");
    var d = state.selected;
    if (!d) {
      pane.html('<div class="empty"><span class="big">◎</span>Select a node to inspect its access, risk, and findings.<br><br>Tip: click an identity, then <b>Find path</b> to trace it to a crown-jewel system.</div>');
      return;
    }
    if (state.activeFinding) {
      pane.html("");
      pane.append("span").attr("class", "badge sev-" + state.activeFinding.severity).text(state.activeFinding.severity);
      pane.append("h3").style("margin-top", "10px").text(state.activeFinding.title);
      pane.append("p").attr("class", "sub").text(state.activeFinding.category);
      pane.append("p").text(state.activeFinding.detail);
      if (d) pane.append("button").attr("class", "btn btn-sm").text("Inspect identity → " + d.label).on("click", function () { state.activeFinding = null; renderInspector(); renderFindings(); apply(); });
      return;
    }
    if (d.type === "user") return renderUserInspector(pane, d);
    if (d.type === "app") return renderAppInspector(pane, d);
    if (d.type === "entitlement") {
      var app = env.byId[d.app];
      pane.html("<h3>" + esc(d.label) + "</h3><p class='sub'>Entitlement · " + d.risk.toUpperCase() + " risk · " + app.name + "</p>");
      var holders = env.users.filter(function (u) { return IAM.reachable(adj, u.id)[d.id]; });
      pane.append("p").text(holders.length + " identities reach this entitlement (" + holders.filter(function (u) { return u.status === "enabled"; }).length + " enabled).");
      var ul = pane.append("div").attr("class", "mini-list");
      holders.slice(0, 12).forEach(function (u) {
        ul.append("div").attr("class", "mini-item").html("<span>" + esc(u.label) + "</span><span class='t'>" + u.dept + "</span>")
          .on("click", function () { selectNode(u); zoomToNodes([u.id, d.id]); });
      });
      return;
    }
    if (d.type === "role" || d.type === "group") {
      var members = env.users.filter(function (u) { return IAM.reachable(adj, u.id)[d.id]; });
      pane.html("<h3>" + esc(d.label) + "</h3><p class='sub'>" + TYPE_LABEL[d.type] + (d.dept ? " · " + d.dept : "") + "</p>");
      pane.append("p").text(members.length + " identities inherit this " + TYPE_LABEL[d.type].toLowerCase() + ".");
      var list = pane.append("div").attr("class", "mini-list");
      members.slice(0, 14).forEach(function (u) {
        list.append("div").attr("class", "mini-item").html("<span>" + esc(u.label) + "</span><span class='t'>risk " + u.riskScore + "</span>")
          .on("click", function () { selectNode(u); zoomToNodes([u.id, d.id]); });
      });
      return;
    }
  }

  function renderUserInspector(pane, u) {
    pane.html("");
    pane.append("h3").text(u.label);
    pane.append("p").attr("class", "sub").text(u.title + " · " + u.dept + " · " + (u.kind || "employee"));
    pane.append("dl").attr("class", "kv").html(
      row("Status", u.status) + row("Last login", u.lastLoginDays + "d ago") + row("MFA", u.mfa ? "Enabled" : "✗ Disabled") +
      row("Manager", u.manager && env.byId[u.manager] ? env.byId[u.manager].label : "— none —") +
      row("Entitlements", u.entCount) + row("Crown jewels", u.crownCount)
    );
    var pct = Math.min(100, u.riskScore * 3);
    var col = u.riskScore >= 25 ? "var(--red)" : u.riskScore >= 12 ? "var(--amber)" : "var(--green)";
    pane.append("div").html("<div class='mono' style='font-size:12px;color:var(--muted)'>Risk score <b style='color:" + col + "'>" + u.riskScore + "</b></div><div class='riskbar'><i style='width:" + pct + "%;background:" + col + "'></i></div>");

    var mine = findings.filter(function (f) { return f.user === u.id; });
    pane.append("div").style("margin-top", "16px").html("<div class='mono' style='font-size:11.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em'>Findings (" + mine.length + ")</div>");
    var fbox = pane.append("div").attr("class", "mini-list").style("margin-top", "8px");
    if (!mine.length) fbox.append("div").attr("class", "mini-item").html("<span class='t'>No findings for this identity</span>");
    mine.slice(0, 6).forEach(function (f) {
      fbox.append("div").attr("class", "mini-item").html("<span><span class='badge sev-" + f.severity + "'>" + f.severity[0].toUpperCase() + "</span> " + esc(f.category) + "</span>")
        .on("click", function () { focusFinding(f); });
    });

    var ents = result.userEnts[u.id] || [];
    pane.append("div").style("margin-top", "16px").html("<div class='mono' style='font-size:11.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em'>Reachable entitlements (" + ents.length + ")</div>");
    var ebox = pane.append("div").attr("class", "mini-list").style("margin-top", "8px");
    ents.slice(0, 12).forEach(function (e) {
      ebox.append("div").attr("class", "mini-item").html("<span>" + esc(e.label) + "</span><span class='badge sev-" + (e.risk === "critical" ? "critical" : e.risk === "high" ? "high" : "low") + "'>" + e.risk + "</span>");
    });

    var crowns = result.userCrown[u.id] || [];
    if (crowns.length) {
      pane.append("div").style("margin-top", "16px").html("<div class='mono' style='font-size:11.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em'>Crown-jewel reach</div>");
      var cbox = pane.append("div").attr("class", "mini-list").style("margin-top", "8px");
      crowns.forEach(function (app) {
        cbox.append("div").attr("class", "mini-item").html("<span>★ " + esc(app.full) + "</span><span class='t'>trace →</span>")
          .on("click", function () { d3.select("#sourceSelect").property("value", u.id); d3.select("#targetSelect").property("value", app.id); trace(); });
      });
    }
    pane.append("button").attr("class", "btn btn-sm btn-primary").style("margin-top", "16px").text("Trace to crown jewel").on("click", function () {
      if (crowns.length) { d3.select("#sourceSelect").property("value", u.id); d3.select("#targetSelect").property("value", crowns[0].id); trace(); }
    });
  }

  function renderAppInspector(pane, app) {
    var reachers = env.users.filter(function (u) { return IAM.reachable(adj, u.id)[app.id]; });
    var enabled = reachers.filter(function (u) { return u.status === "enabled"; });
    var privileged = enabled.filter(function (u) { return u.privCount > 0; });
    pane.html("<h3>" + (app.crown ? "★ " : "") + esc(app.full) + "</h3><p class='sub'>System · " + app.criticality + " criticality" + (app.crown ? " · CROWN JEWEL" : "") + "</p>");
    pane.append("p").text(reachers.length + " identities can reach this system (" + enabled.length + " enabled, " + privileged.length + " with privileged access).");
    var list = pane.append("div").attr("class", "mini-list");
    enabled.sort(function (a, b) { return b.riskScore - a.riskScore; }).slice(0, 14).forEach(function (u) {
      list.append("div").attr("class", "mini-item").html("<span>" + esc(u.label) + "</span><span class='t'>risk " + u.riskScore + (u.mfa ? "" : " · no MFA") + "</span>")
        .on("click", function () { selectNode(u); d3.select("#sourceSelect").property("value", u.id); d3.select("#targetSelect").property("value", app.id); trace(); });
    });
  }

  function row(k, v) { return "<dt>" + k + "</dt><dd>" + esc(String(v)) + "</dd>"; }

  /* ----------------------------------------------------------- path trace */
  function trace() {
    var s = d3.select("#sourceSelect").property("value");
    var t = d3.select("#targetSelect").property("value");
    var p = IAM.bfsPath(adj, s, t);
    var out = d3.select("#pathResult");
    if (!p) {
      state.path = null; state.selected = env.byId[s]; state.activeFinding = null;
      out.html('<span style="color:var(--amber)">No access path from ' + esc(env.byId[s].label) + " to " + esc(env.byId[t].label) + ".</span>");
      apply(); renderInspector();
      return;
    }
    state.path = p;
    state.selected = env.byId[s];
    state.activeFinding = null;
    var chain = p.nodes.map(function (id) {
      var n = env.byId[id];
      var kind = n.type === "app" ? "★ " : "";
      return '<span class="node">' + kind + esc(n.label) + "</span>";
    }).join(' <span class="arrow">→</span> ');
    var hops = p.nodes.length - 1;
    var sev = hops <= 3 ? "var(--red)" : hops <= 4 ? "var(--amber)" : "var(--green)";
    out.html('<span class="mono" style="color:' + sev + '">' + hops + " hop" + (hops === 1 ? "" : "s") + '</span> &nbsp; ' + chain);
    renderInspector(); apply(); zoomToNodes(p.nodes);
  }

  function simulate() {
    var candidates = env.users.filter(function (u) {
      return u.status === "enabled" && (result.userCrown[u.id] || []).some(function (a) { return a.criticality === "critical"; });
    });
    if (!candidates.length) return;
    var u = candidates[Math.floor(Math.random() * candidates.length)];
    var targets = (result.userCrown[u.id] || []).filter(function (a) { return a.criticality === "critical"; });
    var t = targets[Math.floor(Math.random() * targets.length)];
    d3.select("#sourceSelect").property("value", u.id);
    d3.select("#targetSelect").property("value", t.id);
    trace();
  }

  function zoomToNodes(ids) {
    var sel = nodes.filter(function (n) { return ids.indexOf(n.id) >= 0 && typeof n.x === "number"; });
    if (!sel.length) return;
    var xs = sel.map(function (n) { return n.x; }), ys = sel.map(function (n) { return n.y; });
    var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
    var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    var dx = Math.max(maxX - minX, 60), dy = Math.max(maxY - minY, 60);
    var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    var scale = Math.max(0.4, Math.min(2.2, 0.62 * Math.min(W / dx, H / dy)));
    svg.transition().duration(650).call(zoom.transform, d3.zoomIdentity.translate(W / 2, H / 2).scale(scale).translate(-cx, -cy));
  }

  /* ------------------------------------------------------------- exports */
  function download(name, text, type) {
    var blob = new Blob([text], { type: type });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  /* --------------------------------------------------------------- wiring */
  function reset() {
    state.selected = null; state.activeFinding = null; state.path = null;
    state.types = {}; state.sevs = {}; state.query = "";
    d3.select("#searchInput").property("value", "");
    d3.selectAll(".chip[data-filter]").classed("active", false);
    d3.select("#pathResult").html('<span class="dim">Select an identity and a target system, then trace the shortest access path.</span>');
    renderFindings(); renderInspector(); apply();
    svg.transition().duration(600).call(zoom.transform, d3.zoomIdentity);
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function init() {
    W = document.querySelector(".graph-card svg").clientWidth || 900;
    renderStats(); renderChips(); renderSelects(); buildGraph();
    renderFindings(); renderInspector(); apply();

    d3.select("#traceBtn").on("click", trace);
    d3.select("#simulateBtn").on("click", simulate);
    d3.select("#resetBtn").on("click", reset);
    d3.select("#csvBtn").on("click", function () { download("iam-access-evidence.csv", IAM.toEvidenceCSV(result), "text/csv"); });
    d3.select("#jsonBtn").on("click", function () { download("iam-access-evidence.json", IAM.toEvidenceJSON(result), "application/json"); });
    d3.select("#searchInput").on("input", function () { state.query = this.value.trim(); apply(); });
    d3.select("#tabFindings").on("click", function () { switchTab("findings"); });
    d3.select("#tabInspector").on("click", function () { switchTab("inspector"); });
    d3.select("#year").text(new Date().getFullYear());
    d3.select("#navToggle").on("click", function () { d3.select("#navLinks").classed("open", !d3.select("#navLinks").classed("open")); });

    window.addEventListener("resize", function () { W = document.querySelector(".graph-card svg").clientWidth || 900; sim.force("x", d3.forceX(function (d) { return LAYER_X[LAYER[d.type]] * W; }).strength(0.7)); sim.alpha(0.3).restart(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
