import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { replaceProjectSection, updateProfileProjects } from "./update-profile-projects.mjs";

const START = "<!-- PROJECTS:START -->";
const END = "<!-- PROJECTS:END -->";
const fixture = `Before\n\n${START}\nold content\n${END}\n\nAfter\n`;

test("replacing the project section preserves all surrounding content", () => {
  assert.equal(
    replaceProjectSection(fixture, "new content"),
    `Before\n\n${START}\nnew content\n${END}\n\nAfter\n`,
  );
});

test("repeated updates are identical and do not append blank lines", () => {
  const first = replaceProjectSection(fixture, "new content");
  assert.equal(replaceProjectSection(first, "new content"), first);
});

test("a section at the end of the file does not gain a trailing newline", () => {
  assert.equal(replaceProjectSection(`${START}\nold\n${END}`, "new"), `${START}\nnew\n${END}`);
});

for (const [name, content] of [
  ["both missing", "No markers"],
  ["start missing", END],
  ["end missing", START],
  ["duplicate start", `${START}${START}${END}`],
  ["duplicate end", `${START}${END}${END}`],
  ["reversed", `${END}${START}`],
]) {
  test(`invalid project markers: ${name}`, () => {
    assert.throws(() => replaceProjectSection(content, "new"), /marker/);
  });
}

async function createReadme(t, content = fixture) {
  const directory = await mkdtemp(join(tmpdir(), "profile-projects-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const readmePath = join(directory, "README.md");
  await writeFile(readmePath, content);
  return readmePath;
}

function fetchRepository(name) {
  return Promise.resolve({
    name,
    html_url: `https://github.com/cndichengyu/${name}`,
    stargazers_count: 3,
    forks_count: 1,
    pushed_at: "2026-09-05T00:00:00Z",
  });
}

test("the updater succeeds without changing a current README", async (t) => {
  const readmePath = await createReadme(t);
  assert.equal(await updateProfileProjects({ readmePath, fetchRepository }), true);
  const first = await readFile(readmePath, "utf8");
  assert.equal(await updateProfileProjects({ readmePath, fetchRepository }), false);
  assert.equal(await readFile(readmePath, "utf8"), first);
  assert.ok(first.startsWith("Before\n\n"));
  assert.ok(first.endsWith("\n\nAfter\n"));
  assert.ok(first.includes('href="https://github.com/cndichengyu/NetSessionTester-iOS">Net&#8203;Session&#8203;Tester-&#8203;iOS</a>'));
  assert.ok(first.includes("<br><sub>★ 3 · ⑂ 1 · 更新于 2026-09-05</sub>"));
});

test("invalid markers fail before requesting data and leave the file untouched", async (t) => {
  const readmePath = await createReadme(t, "No markers\n");
  await assert.rejects(updateProfileProjects({
    readmePath,
    fetchRepository() { throw new Error("unexpected network request"); },
  }), /marker/);
  assert.equal(await readFile(readmePath, "utf8"), "No markers\n");
});

test("a failed data request leaves the README untouched", async (t) => {
  const readmePath = await createReadme(t);
  await assert.rejects(updateProfileProjects({
    readmePath,
    fetchRepository() { return Promise.reject(new Error("GitHub API unavailable")); },
  }), /GitHub API unavailable/);
  assert.equal(await readFile(readmePath, "utf8"), fixture);
});
