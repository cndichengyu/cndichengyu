import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const START_MARKER = "<!-- PROJECTS:START -->";
const END_MARKER = "<!-- PROJECTS:END -->";

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
  // GitHub strips wbr tags; zero-width spaces retain optional wrapping.
  const name = repo.name.replace(/([a-z][a-z0-9])([A-Z])/g, "$1&#8203;$2").replace(/-/g, "-&#8203;");
  return `    <td width="50%" valign="top">\n      <img src="./assets/${project.icon}" width="48" height="48" alt=""><br>\n      <sub>${project.label}</sub>\n      <h3><a href="${repo.html_url}">${name}</a></h3>\n      <p>${project.summary}</p>\n      <p>${project.tags.map(tag => `<code>${tag}</code>`).join(" ")}<br><sub>${stats}</sub></p>\n    </td>`;
}

export function replaceProjectSection(readme, content) {
  if (readme.split(START_MARKER).length !== 2 || readme.split(END_MARKER).length !== 2) {
    throw new Error("README must contain exactly one project start marker and one project end marker");
  }
  const start = readme.indexOf(START_MARKER);
  const end = readme.indexOf(END_MARKER);
  if (end < start) throw new Error("README project end marker must follow the start marker");
  return `${readme.slice(0, start)}${START_MARKER}\n${content}\n${END_MARKER}${readme.slice(end + END_MARKER.length)}`;
}

export async function updateProfileProjects({ readmePath = "README.md", fetchRepository = getRepo } = {}) {
  const readme = await readFile(readmePath, "utf8");
  replaceProjectSection(readme, "");
  const repos = await Promise.all(projects.map(project => fetchRepository(project.repo)));
  const rows = [];
  for (let index = 0; index < projects.length; index += 2) {
    rows.push(`  <tr>\n${card(projects[index], repos[index])}\n${card(projects[index + 1], repos[index + 1])}\n  </tr>`);
  }
  const generated = `<table>\n${rows.join("\n")}\n</table>`;
  const updated = replaceProjectSection(readme, generated);
  if (updated === readme) return false;
  await writeFile(readmePath, updated);
  return true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await updateProfileProjects();
}
