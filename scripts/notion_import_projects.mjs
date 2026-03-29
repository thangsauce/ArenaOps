import fs from "node:fs/promises";
import path from "node:path";

const token = process.env.NOTION_TOKEN;
const parentPageId = process.env.NOTION_PARENT_PAGE_ID;

if (!token || !parentPageId) {
  console.error("Missing NOTION_TOKEN or NOTION_PARENT_PAGE_ID.");
  process.exit(1);
}

const notionVersion = "2022-06-28";
const projectSources = [
  {
    title: "Aromamor",
    dir: "/Users/thangle/Library/Mobile Documents/iCloud~md~obsidian/Documents/School Projects/Aromamor",
    homeFile: "Home.md",
  },
  {
    title: "DNA",
    dir: "/Users/thangle/Library/Mobile Documents/iCloud~md~obsidian/Documents/Personal Projects/DNA",
    homeFile: "00 - Index.md",
  },
];

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
  const linkPattern = /\[\[([^\]]+)\]\]|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkPattern.exec(markdown)) !== null) {
    if (match.index > lastIndex) {
      parts.push(textContent(markdown.slice(lastIndex, match.index)));
    }

    if (match[1]) {
      parts.push(textContent(match[1]));
    } else {
      const href = /^https?:\/\//.test(match[3]) ? match[3] : undefined;
      parts.push(textContent(match[2], href));
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < markdown.length) {
    parts.push(textContent(markdown.slice(lastIndex)));
  }

  return parts.length ? parts : [textContent("")];
}

function headingBlock(level, text) {
  const type = `heading_${level}`;
  return { object: "block", type, [type]: { rich_text: richTextFromInline(text) } };
}

function paragraphBlock(text) {
  return { object: "block", type: "paragraph", paragraph: { rich_text: richTextFromInline(text) } };
}

function listItemBlock(type, text, checked = false) {
  const payload = { rich_text: richTextFromInline(text) };
  if (type === "to_do") {
    payload.checked = checked;
  }
  return { object: "block", type, [type]: payload };
}

function codeBlock(language, text) {
  const supported = new Set([
    "abap","abc","agda","arduino","ascii art","assembly","bash","basic","bnf","c","c#","c++","clojure","coffeescript","coq","css","dart","dhall","diff","docker","ebnf","elixir","elm","erlang","f#","flow","fortran","gherkin","glsl","go","graphql","groovy","haskell","hcl","html","idris","java","javascript","json","julia","kotlin","latex","less","lisp","livescript","llvm ir","lua","makefile","markdown","markup","matlab","mathematica","mermaid","nix","notion formula","objective-c","ocaml","pascal","perl","php","plain text","powershell","prolog","protobuf","purescript","python","r","racket","reason","ruby","rust","sass","scala","scheme","scss","shell","smalltalk","solidity","sql","swift","toml","typescript","vb.net","verilog","vhdl","visual basic","webassembly","xml","yaml","java/c/c++/c#"
  ]);
  let normalized = !language || language === "text" ? "plain text" : ["bash", "sh", "shell"].includes(language) ? "bash" : language;
  if (!supported.has(normalized)) {
    normalized = "plain text";
  }
  return {
    object: "block",
    type: "code",
    code: { language: normalized, rich_text: [textContent(text.slice(0, 2000))] },
  };
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
      const body = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith("```")) {
        body.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push(codeBlock(fenceMatch[1], body.join("\n")));
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

    const todoMatch = line.match(/^- \[( |x)\]\s+(.*)$/i);
    if (todoMatch) {
      blocks.push(listItemBlock("to_do", todoMatch[2].trim(), todoMatch[1].toLowerCase() === "x"));
      i += 1;
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

    if (line.startsWith("> ")) {
      blocks.push({
        object: "block",
        type: "quote",
        quote: { rich_text: richTextFromInline(line.slice(2).trim()) },
      });
      i += 1;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      blocks.push({ object: "block", type: "divider", divider: {} });
      i += 1;
      continue;
    }

    const paragraphLines = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,3})\s+/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^- \[( |x)\]\s+/i.test(lines[i]) &&
      !/^-\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !lines[i].startsWith("|") &&
      !lines[i].startsWith("> ") &&
      !/^---+$/.test(lines[i].trim())
    ) {
      paragraphLines.push(lines[i]);
      i += 1;
    }

    blocks.push(paragraphBlock(paragraphLines.join(" ")));
  }

  return blocks;
}

async function listChildMap(pageId) {
  const data = await notion(`/v1/blocks/${pageId}/children?page_size=100`);
  const pages = new Map();
  for (const item of data.results) {
    if (item.type === "child_page") {
      pages.set(item.child_page.title, item.id);
    }
  }
  return pages;
}

async function createPage(parentId, title) {
  return notion("/v1/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parentId },
      properties: { title: { title: [textContent(title)] } },
    }),
  });
}

async function ensurePage(parentId, title) {
  const children = await listChildMap(parentId);
  const existingId = children.get(title);
  if (existingId) {
    return notion(`/v1/pages/${existingId}`);
  }
  return createPage(parentId, title);
}

async function appendChildren(blockId, blocks) {
  for (let i = 0; i < blocks.length; i += 100) {
    await notion(`/v1/blocks/${blockId}/children`, {
      method: "PATCH",
      body: JSON.stringify({ children: blocks.slice(i, i + 100) }),
    });
  }
}

async function ensureContent(pageId, markdown) {
  const children = await notion(`/v1/blocks/${pageId}/children?page_size=1`);
  if (children.results.length > 0) return;
  await appendChildren(pageId, markdownToBlocks(markdown));
}

async function importProject(project) {
  const projectPage = await ensurePage(parentPageId, project.title);
  const files = (await fs.readdir(project.dir))
    .filter((file) => file.endsWith(".md"))
    .sort((a, b) => {
      if (a === project.homeFile) return -1;
      if (b === project.homeFile) return 1;
      return a.localeCompare(b);
    });

  const created = [];
  for (const file of files) {
    const title = file.replace(/\.md$/, "");
    const page = await ensurePage(projectPage.id, title);
    const markdown = await fs.readFile(path.join(project.dir, file), "utf8");
    await ensureContent(page.id, markdown);
    created.push({ title, url: page.url });
  }

  return { title: project.title, url: projectPage.url, notes: created };
}

async function main() {
  await notion(`/v1/pages/${parentPageId}`);
  const results = [];
  for (const project of projectSources) {
    results.push(await importProject(project));
  }
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
