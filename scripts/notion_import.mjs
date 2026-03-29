import fs from "node:fs/promises";
import path from "node:path";

const token = process.env.NOTION_TOKEN;
const parentPageId = process.env.NOTION_PARENT_PAGE_ID;

if (!token || !parentPageId) {
  console.error("Missing NOTION_TOKEN or NOTION_PARENT_PAGE_ID.");
  process.exit(1);
}

const baseDir = "/Users/thangle/School Projects/ArenaOps/docs/notion-import";
const markdownDir = path.join(baseDir, "markdown");
const todoCsv = path.join(baseDir, "todo.csv");
const notionVersion = "2022-06-28";

async function notion(pathname, options = {}) {
  const response = await fetch(`https://api.notion.com${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": notionVersion,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(data)}`);
  }

  return data;
}

function textContent(content, href) {
  return {
    type: "text",
    text: {
      content: content.slice(0, 2000),
      ...(href ? { link: { url: href } } : {}),
    },
  };
}

function richTextFromInline(markdown) {
  const parts = [];
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkPattern.exec(markdown)) !== null) {
    if (match.index > lastIndex) {
      parts.push(textContent(markdown.slice(lastIndex, match.index)));
    }
    const href = /^https?:\/\//.test(match[2]) ? match[2] : undefined;
    parts.push(textContent(match[1], href));
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < markdown.length) {
    parts.push(textContent(markdown.slice(lastIndex)));
  }

  return parts.length ? parts : [textContent("")];
}

function paragraphBlock(text) {
  return {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: richTextFromInline(text),
    },
  };
}

function headingBlock(level, text) {
  const type = `heading_${level}`;
  return {
    object: "block",
    type,
    [type]: {
      rich_text: richTextFromInline(text),
    },
  };
}

function listItemBlock(kind, text) {
  return {
    object: "block",
    type: kind,
    [kind]: {
      rich_text: richTextFromInline(text),
    },
  };
}

function codeBlock(language, text) {
  return {
    object: "block",
    type: "code",
    code: {
      language: normalizeLanguage(language),
      rich_text: [textContent(text.slice(0, 2000))],
    },
  };
}

function normalizeLanguage(language) {
  if (!language) return "plain text";
  if (language === "text") return "plain text";
  if (language === "bash" || language === "sh" || language === "shell") return "bash";
  return language;
}

function markdownToBlocks(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      blocks.push(headingBlock(headingMatch[1].length, headingMatch[2].trim()));
      i += 1;
      continue;
    }

    const fenceMatch = line.match(/^```([\w+-]*)\s*$/);
    if (fenceMatch) {
      const language = fenceMatch[1] || "plain text";
      const body = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        body.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) {
        i += 1;
      }
      blocks.push(codeBlock(language, body.join("\n")));
      continue;
    }

    if (line.startsWith("|")) {
      const tableLines = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i += 1;
      }
      blocks.push(codeBlock("plain text", tableLines.join("\n")));
      continue;
    }

    const bulletMatch = line.match(/^-\s+(.*)$/);
    if (bulletMatch) {
      blocks.push(listItemBlock("bulleted_list_item", bulletMatch[1].trim()));
      i += 1;
      continue;
    }

    const numberedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (numberedMatch) {
      blocks.push(listItemBlock("numbered_list_item", numberedMatch[1].trim()));
      i += 1;
      continue;
    }

    const paragraphLines = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].match(/^(#{1,3})\s+/) &&
      !lines[i].match(/^```/) &&
      !lines[i].match(/^-\s+/) &&
      !lines[i].match(/^\d+\.\s+/) &&
      !lines[i].startsWith("|")
    ) {
      paragraphLines.push(lines[i]);
      i += 1;
    }

    blocks.push(paragraphBlock(paragraphLines.join(" ")));
  }

  return blocks;
}

async function appendChildren(blockId, blocks) {
  for (let i = 0; i < blocks.length; i += 100) {
    await notion(`/v1/blocks/${blockId}/children`, {
      method: "PATCH",
      body: JSON.stringify({
        children: blocks.slice(i, i + 100),
      }),
    });
  }
}

async function listExistingChildren(parentId) {
  const data = await notion(`/v1/blocks/${parentId}/children?page_size=100`);
  const pages = new Map();
  const databases = new Map();

  for (const result of data.results) {
    if (result.type === "child_page") {
      pages.set(result.child_page.title, result.id);
    }
    if (result.type === "child_database") {
      databases.set(result.child_database.title, result.id);
    }
  }

  return { pages, databases };
}

async function createDocPage(parentId, title, markdown, existingPageId) {
  const blocks = markdownToBlocks(markdown);
  const page = existingPageId
    ? await notion(`/v1/pages/${existingPageId}`)
    : await notion("/v1/pages", {
        method: "POST",
        body: JSON.stringify({
          parent: { type: "page_id", page_id: parentId },
          properties: {
            title: {
              title: [textContent(title)],
            },
          },
        }),
      });

  const pageChildren = await notion(`/v1/blocks/${page.id}/children?page_size=1`);
  if (pageChildren.results.length === 0) {
    await appendChildren(page.id, blocks);
  }
  return page;
}

function parseCsvLine(line) {
  const out = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      out.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  out.push(current);
  return out;
}

async function createTodoDatabase(parentId, csvText, existingDbId) {
  const rows = csvText.trim().split("\n").map(parseCsvLine);
  const [, ...items] = rows;

  const db = existingDbId
    ? await notion(`/v1/databases/${existingDbId}`)
    : await notion("/v1/databases", {
        method: "POST",
        body: JSON.stringify({
          parent: { type: "page_id", page_id: parentId },
          title: [
            {
              type: "text",
              text: {
                content: "Todo",
              },
            },
          ],
          properties: {
            Task: { title: {} },
            Area: { select: {} },
            Status: { select: {} },
            Done: { checkbox: {} },
          },
        }),
      });

  if (existingDbId) {
    return db;
  }

  for (const [task, area, status, done] of items) {
    await notion("/v1/pages", {
      method: "POST",
      body: JSON.stringify({
        parent: { database_id: db.id },
        properties: {
          Task: {
            title: [textContent(task)],
          },
          Area: {
            select: { name: area },
          },
          Status: {
            select: { name: status },
          },
          Done: {
            checkbox: done === "true",
          },
        },
      }),
    });
  }

  return db;
}

async function main() {
  await notion(`/v1/pages/${parentPageId}`);
  const existingChildren = await listExistingChildren(parentPageId);

  const files = (await fs.readdir(markdownDir))
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => {
      if (a === "ArenaOps.md") return -1;
      if (b === "ArenaOps.md") return 1;
      return a.localeCompare(b);
    });

  const createdPages = [];
  for (const file of files) {
    const fullPath = path.join(markdownDir, file);
    const markdown = await fs.readFile(fullPath, "utf8");
    const title = file.replace(/\.md$/, "");
    const page = await createDocPage(parentPageId, title, markdown, existingChildren.pages.get(title));
    createdPages.push({ title, url: page.url });
  }

  const csvText = await fs.readFile(todoCsv, "utf8");
  const todoDb = await createTodoDatabase(parentPageId, csvText, existingChildren.databases.get("Todo"));

  console.log(
    JSON.stringify(
      {
        parentPageId,
        createdPages,
        todoDatabaseUrl: todoDb.url,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
