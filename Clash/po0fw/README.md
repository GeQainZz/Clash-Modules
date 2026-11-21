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

- `network-changed` 事件在切换网络时触发。
- cron 每 10 分钟尝试一次。
- 面板刷新立即尝试一次，可查看白名单、出口网段与固定槽位。
- 成功状态发生变化时通知，持续相同的成功状态保持安静，失败会通知。
- API 地址沿用上游的 `https://124.221.69.228/api/firewall/<token>/add`。请求指定 `policy: DIRECT`，模块也包含该 IP 的直连规则，用于登记当前网络的出口。

Clash 官方文档注明，定时和网络变化脚本在应用打开且已连接时运行。因此切网后可打开 Clash 并刷新一次面板，尤其是锁屏或长时间放在后台后。实际锁屏与后台调度需要在你的设备上验证。

## 常见状态

- 未配置 token，回模块「设置」填写完整 token。
- 防火墙未启用，在 po0 控制台确认该机器的防火墙开关。
- 槽位冲突，同一网段已经绑定其他槽位，去 po0 控制台检查并调整原记录。
- 网络请求失败，在模块详情查看脚本是否已下载，在「活动 → 日志」查看 `Script Aborted` 或 `Script Timeout`。本脚本的面板与通知会隐藏 token，但客户端 HTTP 请求日志可能含 API 路径，分享日志前请遮住 token。

普通 Clash Verge Rev 的配置扩展脚本需要配合系统任务才能完成这种定时联网功能。本文件面向带有模块、事件脚本和面板功能的 Clash Apple 客户端。

## 来源与验证

适配自 [w0ven/po0fw](https://github.com/w0ven/po0fw) 的共享脚本与 Surge 模块，上游快照为 `0664fde919707512e310d09231a4900607d46f25`。保留上游加白、槽位、重试和状态显示逻辑，修改了直连请求选项、存储键前缀及输出中的 token 隐藏。授权见 [MIT License](LICENSE)。

已在模拟的 Clash Surge 模块脚本环境检查 token 参数、多 token、固定槽位、超时单位、DIRECT 请求、重试、重复成功静默和错误显示。没有用真实 token 调用加白 API。需要在 Clash 中填 token 并手动刷新完成实际验证。

[Clash 模块、脚本与触发机制文档](https://clash.md/guide/modules)
