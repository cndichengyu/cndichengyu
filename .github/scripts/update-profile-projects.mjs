import { readFile, writeFile } from "node:fs/promises";

const token = process.env.GITHUB_TOKEN;
const projects = [
  { repo: "DiskThings", label: "DESKTOP TOOL", icon: "diskthings.png", summary: "macOS 原生外置硬盘管理工具，集中查看设备与健康信息。", tags: ["Swift", "SwiftUI", "macOS"] },
  { repo: "NetSessionTester-iOS", label: "MOBILE TOOL", icon: "netsessiontester.png", summary: "网络诊断工具的 iOS 原生移植，覆盖 TCP、Ping、DNS、NAT 与路由探测。", tags: ["Swift", "SwiftUI", "iOS"] },
  { repo: "fnos-aria2", label: "NAS APPLICATION", icon: "aria2-turbo.png", summary: "为飞牛 fnOS 封装的 Aria2 下载应用，支持 JSON-RPC 与 x86 / ARM 双架构。", tags: ["Shell", "Aria2", "fnOS"] },
  { repo: "go-learning-tutorial", label: "LEARNING NOTES", icon: "go-notes.png", summary: "系统化的 Go 语言学习教程，从基础语法走向并发、Web 开发与项目实践。", tags: ["Go", "Markdown", "Learning"] },
];

async function getRepo(repo) {
  const response = await fetch(`https://api.github.com/repos/cndichengyu/${repo}`, {
    headers: { Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!response.ok) throw new Error(`${repo}: GitHub API ${response.status}`);
  return response.json();
}

function card(project, repo) {
  const stats = `★ ${repo.stargazers_count} · ⑂ ${repo.forks_count} · 更新于 ${repo.pushed_at.slice(0, 10)}`;
  return `    <td width="50%" valign="top">\n      <img src="./assets/${project.icon}" width="48" height="48" alt=""><br>\n      <sub>${project.label}</sub>\n      <h3><a href="${repo.html_url}">${repo.name}</a></h3>\n      <p>${project.summary}</p>\n      <p>${project.tags.map(tag => `<code>${tag}</code>`).join(" ")} · ${stats}</p>\n    </td>`;
}

const repos = await Promise.all(projects.map(project => getRepo(project.repo)));
const rows = [];
for (let index = 0; index < projects.length; index += 2) {
  rows.push(`  <tr>\n${card(projects[index], repos[index])}\n${card(projects[index + 1], repos[index + 1])}\n  </tr>`);
}
const generated = `<!-- PROJECTS:START -->\n<table>\n${rows.join("\n")}\n</table>\n<!-- PROJECTS:END -->\n`;
const readme = await readFile("README.md", "utf8");
const updated = readme.replace(/<!-- PROJECTS:START -->[\s\S]*?<!-- PROJECTS:END -->/, generated);
if (updated === readme) throw new Error("README project markers not found");
await writeFile("README.md", updated);
