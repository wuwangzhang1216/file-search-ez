# API Key Setup Guide

## 获取 Gemini API Key

1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 点击 "Create API Key" 或 "Get API Key"
3. 复制生成的 API key

## 设置 API Key

### 方法 1: 使用环境变量 (推荐)

编辑 `.env.local` 文件：

```bash
VITE_GEMINI_API_KEY=你的_API_KEY_这里
```

然后重启开发服务器：

```bash
npm run dev
```

### 方法 2: 应用内输入

1. 启动应用后，点击 "Select Gemini API Key to Begin" 按钮
2. 在弹出的提示框中输入你的 API Key
3. 点击确定

> **注意**: 方法 2 输入的 API Key 不会被保存，每次刷新页面都需要重新输入。推荐使用方法 1。

## 故障排除

### API Key 无效

如果看到 "API key not valid" 错误：
- 确认你的 API Key 已启用 Gemini API
- 检查 API Key 没有多余的空格
- 在 [AI Studio](https://aistudio.google.com/app/apikey) 中验证 API Key 状态

### 环境变量未加载

如果设置了 `.env.local` 但仍提示输入 API Key：
- 确认文件名是 `.env.local` (注意前面的点)
- 确认变量名是 `VITE_GEMINI_API_KEY` (不是 `GEMINI_API_KEY`)
- 重启开发服务器 (`Ctrl+C` 然后 `npm run dev`)
