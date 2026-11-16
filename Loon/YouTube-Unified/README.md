# YouTube 集中增强 · 可莉去广告版

在 Clash iOS 的「配置库 → 模块」添加 [插件直链](https://raw.githubusercontent.com/GeQainZz/Clash-Modules/youtube-clash-compat/Loon/YouTube-Unified/YouTube-Unified.lpx)。通过同一条链接安装过的用户，长按旧模块选择「更新」，确认详情显示 1.0.3。只启用一份 YouTube 去广告模块，并让 Clash 的 HTTPS 解密和证书处于就绪状态。

1.0.3 直接调用可莉去广告插件的原脚本处理 `initplayback`、`log_event` 及播放响应。普通 `browse` 响应仍由可莉处理。只有带歌词标记的 `browse` 响应交给独立翻译引擎。字幕和歌词均默认译为简体中文。

画质功能使用 RuCu6 的播放请求代码，在匹配的 `videoplayback` 请求里提高画质偏好。可莉继续负责初始化，因此能否选中最高画质取决于播放路径及可用的格式。Music 歌词文本通过 Google 翻译。

已检查脚本规则无重叠及 GitHub 链接可下载。当前环境无法直接下载可莉站点的文件，脚本地址和规则由可读取的官方链接镜像核对，实际播放以 Clash 上的测试为准。若模块详情显示可莉脚本下载失败，先恢复你手机上原本可用的可莉去广告插件。

[可莉去广告原插件](https://kelee.one/Tool/Loon/Lpx/YouTube_remove_ads.lpx) · [RuCu6 画质核心](https://rucu6.pages.dev/Plugins/youtube_gholts.lpx) · [DualSubs 翻译引擎](https://github.com/DualSubs/Universal) · [Apache-2.0](LICENSE-Apache-2.0.txt)
