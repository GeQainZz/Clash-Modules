# po0 防火墙自动加白 · Clash

适用于 clash.md 的 Clash iPhone / iPad / Mac 模块功能。它会调用 po0 API，把当前公网 IPv4 的 `/24` 网段加入对应机器的防火墙白名单。

## 导入与填写

1. 在 Clash「配置库 → 模块 → 添加模块」粘贴 [模块直链](https://raw.githubusercontent.com/GeQainZz/Clash-Modules/po0-firewall-clash/Clash/po0fw/po0-firewall-whitelist.sgmodule)。也可在手机浏览器打开 [导入 Clash](clash://install-module?url=https%3A%2F%2Fraw.githubusercontent.com%2FGeQainZz%2FClash-Modules%2Fpo0-firewall-clash%2FClash%2Fpo0fw%2Fpo0-firewall-whitelist.sgmodule)。
2. 进入模块详情的「设置」，在 `tokens` 填 po0 控制台机器详情中提供的防火墙 API token。
3. 单台可填 `pgnfw_xxx`，多台用英文逗号分隔，例如 `pgnfw_xxx,pgnfw_yyy`。这里的 xxx / yyy 是示例，替换为你的完整 token。
4. 如需固定槽位，填 `pgnfw_xxx@0`，支持服务端的 `@0` 至 `@4`。同一机器上，不同设备不要填写同一个固定槽位，新的出口会替换该槽位原来的网段。手机可直接填写 token，沿用服务端的轮换策略。
5. 保持 Clash 已连接，在模块详情「面板」里点刷新。首次成功会显示出口网段和白名单信息，再到 po0 控制台确认该网段已登记。

token 在你设备的模块参数中填写。本仓库文件不含你的 token。生成的模块没有需要解密的 HTTPS 网站，无需为它安装 MitM 证书。

## 触发与结果

- Clash 前台运行且已连接时，`network-changed` 事件在切换网络时尝试加白，cron 每 10 分钟尝试一次。
- 「po0 防火墙加白」面板刷新会立即尝试一次，可查看白名单、出口网段与固定槽位。
- 1.0.1 新增「po0 最近执行记录」只读面板，显示最近 6 次执行的开始时间、来源和结果。刷新这个记录面板不会调用加白 API，也不会覆盖定时和切网记录。
- 定时、切网、加白面板分别保留最近 6 条记录。开始时先写入，完成后补写结果；出现「未记录完成」可能是尚在执行、超时或被系统暂停。脚本开始之前的下载或调度失败不会留下本脚本的记录。
- 记录按脚本名称区分来源；在客户端手动「立即运行」定时或切网脚本，也会记在对应来源。脚本不能判断这次执行发生在前台还是锁屏期间，时间显示为设备本地时间。
- 成功状态发生变化时通知，持续相同的成功状态保持安静，失败会通知。
- API 地址沿用上游的 `https://124.221.69.228/api/firewall/<token>/add`。请求指定 `policy: DIRECT`，模块也包含该 IP 的直连规则，用于登记当前网络的出口。

## 锁屏与后台限制

Clash 官方文档注明，定时和网络变化脚本在应用打开且已连接时运行。当前公开源码进入后台会取消前台计时器，并通过 iOS 的 `BGAppRefreshTaskRequest` 申请补跑；具体是否包含该实现取决于你安装的客户端版本。iOS 决定何时给主应用后台执行时间，不能保证每 10 分钟运行，也不能保证锁屏切网立即加白。VPN 隧道保持连接不等于主应用的脚本持续调度，修改模块 cron 间隔无法解除这个限制。

要验证：更新模块到 1.0.1，先刷新加白面板，记下锁屏开始和结束时间。过 20–30 分钟再打开「最近执行记录」，查看是否存在锁屏时间范围内的定时记录。打开 Clash 后才出现的记录只能说明恢复后执行了。没有通知不能证明没有执行，因为相同成功状态会保持静默。

临时需要联网时，打开 Clash 刷新加白面板即可。也可以按 [po0 官方 iOS 快捷指令方案](https://github.com/w0ven/po0fw/tree/main/ios) 建立独立触发：

1. 新建快捷指令「po0 加白」，添加「获取 URL 内容」。URL 填 `https://124.221.69.228/api/firewall/pgnfw_你的token/add`，方法设为 `POST`；如需固定槽位，在末尾加 `?slot=0`。多台机器分别添加请求。
2. 手动运行一次并允许联网，在 po0 控制台核对当前公网 IPv4 的 `/24` 已登记。
3. 在「自动化」添加连接 Wi-Fi（任意网络）、打开指定 App 等触发，设为「立即运行」，执行这个快捷指令。若系统提供「允许锁定时运行」，在快捷指令隐私设置中打开。

快捷指令使用另一条触发路径，可补足 Wi-Fi 连接和打开 App 的场景；它不保证每次蜂窝公网 IP 变化都触发，也不是严格每 10 分钟后台轮询。Clash 模块中的 API IP 直连规则应保持启用，以登记本机出口。

更新：在 Clash 模块列表长按此模块，选择「更新」，确认版本为 1.0.1，并检查两个脚本文件已下载。保留原有 tokens 设置；无需重复导入一个副本。

## 常见状态

- 未配置 token，回模块「设置」填写完整 token。
- 防火墙未启用，在 po0 控制台确认该机器的防火墙开关。
- 槽位冲突，同一网段已经绑定其他槽位，去 po0 控制台检查并调整原记录。
- 网络请求失败，在模块详情查看脚本是否已下载，在「活动 → 日志」查看 `Script Aborted` 或 `Script Timeout`。本脚本的面板与通知会隐藏 token，但客户端 HTTP 请求日志可能含 API 路径，分享日志前请遮住 token。

普通 Clash Verge Rev 的配置扩展脚本需要配合系统任务才能完成这种定时联网功能。本文件面向带有模块、事件脚本和面板功能的 Clash Apple 客户端。

## 来源与验证

适配自 [w0ven/po0fw](https://github.com/w0ven/po0fw) 的共享脚本与 Surge 模块，上游快照为 `0664fde919707512e310d09231a4900607d46f25`。保留上游加白、槽位、重试和状态显示逻辑，修改了直连请求选项、存储键前缀及输出中的 token 隐藏，并加入执行记录。授权见 [MIT License](LICENSE)。

已在模拟的 Clash Surge 模块脚本环境检查 token 参数、多 token、固定槽位、超时单位、DIRECT 请求、重试、重复成功静默、错误显示、按来源保存记录及只读面板。没有用真实 token 调用加白 API，也未在 iOS 真机验证锁屏调度。需要在 Clash 中填 token 并手动刷新完成实际验证。

[Clash 模块、脚本与触发机制文档](https://clash.md/guide/modules)

[Clash 主应用脚本调度源码](https://github.com/ProjectClash/Clash-Client/blob/main/apple/ClashClient/Sources/SystemIntegration/ModuleAppScriptDriver.swift) · [Apple 后台任务时间说明](https://developer.apple.com/documentation/backgroundtasks/bgtaskrequest/earliestbegindate) · [Apple 快捷指令自动化触发](https://support.apple.com/guide/shortcuts/setting-triggers-apde31e9638b/ios)
