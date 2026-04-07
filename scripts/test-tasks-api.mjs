/**
 * 任务 API 集成测试（需已启动：npm run dev）
 * 用法: node scripts/test-tasks-api.mjs
 * 可选: API_BASE_URL=https://xxx.com node scripts/test-tasks-api.mjs
 */

const BASE = (process.env.API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

let passed = 0;
let failed = 0;

function pass(msg) {
  passed += 1;
  console.log(`  ✓ ${msg}`);
}

function fail(msg, detail) {
  failed += 1;
  console.error(`  ✗ ${msg}`);
  if (detail !== undefined) console.error("    ", typeof detail === "string" ? detail : JSON.stringify(detail, null, 2));
}

async function req(method, path, { body, headers } = {}) {
  const url = `${BASE}${path}`;
  const init = {
    method,
    headers: { ...headers },
  };
  if (body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  const res = await fetch(url, init);
  const text = await res.text();
  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { _parseError: true, _raw: text.slice(0, 200) };
    }
  }
  return { status: res.status, json, text };
}

function assert(cond, okMsg, badDetail) {
  if (cond) pass(okMsg);
  else fail(okMsg, badDetail);
}

async function main() {
  console.log(`\n任务 API 测试  base=${BASE}\n`);

  // --- GET /api/tasks ---
  const list1 = await req("GET", "/api/tasks");
  assert(list1.status === 200, `GET /api/tasks → 200`, list1);
  assert(Array.isArray(list1.json?.data), `GET /api/tasks 返回 data 数组`, list1.json);

  // --- POST /api/tasks ---
  const title = `脚本测试 ${Date.now()}`;
  const created = await req("POST", "/api/tasks", { body: { title, status: "pending" } });
  assert(created.status === 201, `POST /api/tasks → 201`, created);
  const task = created.json?.data;
  assert(task?.id && task.title === title, `POST 返回任务含 id 与 title`, created.json);
  const id = task?.id;

  // --- GET 列表应包含新任务（倒序，新任务通常在前）---
  const list2 = await req("GET", "/api/tasks");
  assert(list2.status === 200, `GET /api/tasks（创建后）→ 200`, list2);
  const hasNew = list2.json?.data?.some((t) => t.id === id);
  assert(hasNew, `列表中包含新建任务 id`, { id, count: list2.json?.data?.length });

  // --- POST /api/tasks/breakdown（需 .env.local 中 DEEPSEEK_API_KEY；库表需有 parent_id）---
  const bd = await req("POST", "/api/tasks/breakdown", {
    body: {
      taskId: id,
      taskName: "整理本周工作并写简短周报",
    },
  });
  if (bd.status === 200) {
    const d = bd.json?.data;
    assert(d?.parent?.id === id, `breakdown 返回 parent.id`, bd.json);
    assert(Array.isArray(d?.steps) && d.steps.length >= 3 && d.steps.length <= 5, `steps 为 3–5 条`, d?.steps);
    assert(
      Array.isArray(d?.subtasks) && d.subtasks.length === d.steps.length,
      `subtasks 数量与 steps 一致`,
      { sub: d?.subtasks?.length, steps: d?.steps?.length }
    );
    const allParentOk = d.subtasks.every((s) => s.parent_id === id);
    assert(allParentOk, `子任务 parent_id 均为父任务 id`, d?.subtasks);
  } else {
    fail(
      `POST /api/tasks/breakdown → 200（当前 ${bd.status}，请检查 DEEPSEEK_API_KEY、网关与表字段 parent_id）`,
      bd.json ?? bd.text
    );
  }

  // --- breakdown 校验：缺 taskId ---
  const bdBad = await req("POST", "/api/tasks/breakdown", { body: {} });
  assert(bdBad.status === 400, `POST breakdown 无 taskId → 400`, bdBad.json);

  // --- breakdown 校验：父任务不存在 ---
  const bd404 = await req("POST", "/api/tasks/breakdown", {
    body: { taskId: "00000000-0000-4000-8000-000000000000" },
  });
  assert(bd404.status === 404, `POST breakdown 无效 taskId → 404`, bd404.json);

  // --- PATCH /api/tasks/[id]（与 lib/validation 一致：pending | in_progress | completed）---
  const patched = await req("PATCH", `/api/tasks/${id}`, {
    body: { status: "completed" },
  });
  assert(patched.status === 200, `PATCH /api/tasks/[id] → 200`, patched);
  assert(patched.json?.data?.status === "completed", `状态已更新为 completed`, patched.json);

  // --- DELETE /api/tasks/[id] ---
  const deleted = await req("DELETE", `/api/tasks/${id}`);
  assert(deleted.status === 204, `DELETE /api/tasks/[id] → 204`, { status: deleted.status, text: deleted.text });

  // --- DELETE 再次应 404 ---
  const delAgain = await req("DELETE", `/api/tasks/${id}`);
  assert(delAgain.status === 404, `DELETE 已删任务 → 404`, delAgain.json);

  // --- PATCH 无效 UUID → 400 ---
  const badUuid = await req("PATCH", "/api/tasks/not-a-uuid", { body: { status: "completed" } });
  assert(badUuid.status === 400, `PATCH 非法 id → 400`, badUuid.json);

  // --- POST 非法 JSON ---
  const badJson = await fetch(`${BASE}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  const badJsonStatus = badJson.status;
  const badJsonText = await badJson.text();
  assert(badJsonStatus === 400, `POST 非法 JSON → 400`, badJsonText);

  // --- POST 校验失败 ---
  const badBody = await req("POST", "/api/tasks", { body: { title: "" } });
  assert(badBody.status === 400, `POST 空 title → 400`, badBody.json);

  console.log(`\n结果: 通过 ${passed}  失败 ${failed}\n`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
