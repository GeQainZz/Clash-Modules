# YouTube 集中增强 · Veyrn

在 iPhone 或 iPad 上打开 [一键导入 Loon](https://www.nsloon.com/openloon/import?plugin=https%3A%2F%2Fraw.githubusercontent.com%2FGeQainZz%2FClash-Modules%2Fyoutube-clash-compat%2FLoon%2FYouTube-Unified%2FYouTube-Unified.lpx)，或把 [插件直链](https://raw.githubusercontent.com/GeQainZz/Clash-Modules/youtube-clash-compat/Loon/YouTube-Unified/YouTube-Unified.lpx) 粘贴到 Loon 的插件页面。

Clash iOS / iPadOS 1.0.13 及以上可在「配置库 → 模块 → 添加模块」粘贴同一条插件直链，或打开 [导入 Clash](clash://install-module?url=https%3A%2F%2Fraw.githubusercontent.com%2FGeQainZz%2FClash-Modules%2Fyoutube-clash-compat%2FLoon%2FYouTube-Unified%2FYouTube-Unified.lpx)。已装过的模块长按更新。确认模块开启、「HTTPS 解密」开启，且 Clash 自己的模块证书显示就绪。

适用于 Loon 3.5.1（998）及以上。启用前关闭 `youtube_gholts.lpx`、`YouTube_remove_ads.lpx`、`YouTubeSubtitlesTranslation.lpx` 及其他重复的 YouTube 脚本。在 Loon 中开启脚本、复写、MitM、MitM over HTTP/2 和 QUIC 回退保护，并确认 Loon 证书已受信任。重新打开 YouTube 和 YouTube Music。

默认自动选择最高画质，YouTube 字幕译为简体中文，YouTube Music 歌词保留原文并附简体中文。Music 歌词翻译会将歌词文本发送到 Google 翻译。画质依赖视频可用格式，字幕和歌词翻译需要有原文。整合版仍沿用画质核心的后台播放行为。

1.0.2 增加 Clash 缺少 Web Streams 压缩接口时的 gzip 处理，已用模拟的 Clash API 验证加密播放响应仍可移除广告。

已在模拟环境覆盖最高画质、字幕、歌词、去广告和规则匹配。请在自己的设备上验证播放效果。

## 来源

- 播放、画质和广告处理基于 [RuCu6 的 Loon 插件](https://rucu6.pages.dev/Plugins/youtube_gholts.lpx) 和 [gholts 的 YouTube Enhance](https://github.com/gholts/surge/blob/main/modules/youtube-enhance.sgmodule)，后者注明基于 [Maasea 的 Apache-2.0 代码](https://github.com/Maasea/sgmodule)。
- 字幕轨道选择参考可莉插件所用的 Maasea / VirgilClyne 逻辑。整合脚本单独修改字幕字段，并保留未识别的播放响应字段。
- Music 歌词沿用 VirgilClyne 的 [DualSubs Universal v1.4 引擎](https://github.com/DualSubs/Universal/blob/main/archive/js/v1.4/Translate.response.js)。GitHub 版从上游项目的归档取源码，并只在歌词分支启用引擎。
- [Apache-2.0 许可证](LICENSE-Apache-2.0.txt)
