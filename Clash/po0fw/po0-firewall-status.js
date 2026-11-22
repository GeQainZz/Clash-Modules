// po0fw Clash 1.0.1. Read-only: refreshing this panel does not register an IP.
(function () {
  var labels = { cron: "定时脚本", network: "切网脚本", panel: "加白面板" };
  var runs = [];
  ["cron", "network", "panel"].forEach(function (source) {
    try {
      var items = JSON.parse($persistentStore.read("po0_clash_fw_runs_" + source) || "[]");
      if (Array.isArray(items)) {
        items.forEach(function (item) {
          if (item && typeof item.startedAt === "number" && isFinite(item.startedAt)) {
            item.source = source;
            runs.push(item);
          }
        });
      }
    } catch (e) {}
  });
  runs.sort(function (a, b) { return b.startedAt - a.startedAt; });
  function localTime(value) {
    var d = new Date(value);
    function pad(n) { return n < 10 ? "0" + n : String(n); }
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate())
      + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }
  var content = runs.slice(0, 6).map(function (run) {
    var state = run.finishedAt == null ? "未记录完成，可能仍在执行、超时或被暂停"
      : run.ok ? "成功" : "失败";
    var summary = String(run.summary || "").replace(/pgnfw_[A-Za-z0-9_-]+/g, "pgnfw_[已隐藏]");
    return labels[run.source] + " · " + localTime(run.startedAt) + " · " + state
      + (summary ? "\n" + summary : "");
  }).join("\n\n");
  $done({
    title: "po0 最近执行记录",
    content: (content || "暂无记录；请更新模块并刷新一次加白面板。")
      + "\n\n此面板只读。记录不区分前后台，手动运行定时/切网脚本也记在对应来源。",
  });
})();
