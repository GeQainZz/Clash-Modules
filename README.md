# Clash Modules

适用于支持 Surge 风格模块及 HTTPS 解密的 Clash 客户端的个人模块集合。

## TikTok 评论接口检测 V1

文件：[`TikTok/TikTok_Comment_Probe.sgmodule`](TikTok/TikTok_Comment_Probe.sgmodule)

[Raw 模块地址](https://raw.githubusercontent.com/GeQainZz/Clash-Modules/main/TikTok/TikTok_Comment_Probe.sgmodule)

此模块仅添加三个候选 TikTok API 域名到 MITM 范围，**不会自动翻译评论，也不包含 JavaScript 脚本**。其作用是辅助检查评论请求是否能够被客户端捕获；域名不保证覆盖当前 TikTok 使用的接口。

### 使用步骤

1. 在 Clash 中导入上述 Raw 模块地址（或下载文件后导入）。
2. 按客户端说明启用 HTTPS 解密并信任证书。
3. 打开 TikTok 评论区，在 Clash 的请求记录中寻找 `comment/list` 等接口。
4. 如遇 TikTok 无法联网或评论无法加载，立即关闭此模块和相应 HTTPS 解密设置。

> 注意：不要公开分享包含 Cookie、Token、Authorization 或完整请求参数的日志。HTTPS 解密可能与应用的证书校验机制不兼容。

## 后续计划

- TikTok 评论自动翻译：待确认接口与客户端脚本能力后开发，当前未实现。
- YouTube / X / 去广告模块：按需添加。
