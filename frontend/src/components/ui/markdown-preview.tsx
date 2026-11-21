type MarkdownPreviewProps = {
  content: string;
};

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInline(text: string) {
  return escapeHtml(text)
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

type LabeledLine = {
  label: string;
  value: string;
};

const reasonLabelParents: Record<string, string> = {
  "優先度の理由": "優先度",
  "見積理由": "想定工数",
};

function parseLabeledLine(line: string): LabeledLine | null {
  const match = line.match(/^([^:：]+)([:：]\s*)(.+)$/);

  if (!match) {
    return null;
  }

  return {
    label: match[1].trim(),
    value: match[3].trim(),
  };
}

function renderLabeledLineGroups(lines: string[]) {
  const groups: LabeledLine[][] = [];

  for (const line of lines) {
    const parsed = parseLabeledLine(line);

    if (!parsed) {
      groups.push([{ label: "", value: line }]);
      continue;
    }

    const expectedParent = reasonLabelParents[parsed.label];
    const currentGroup = groups.at(-1);
    const currentPrimaryLabel = currentGroup?.[0]?.label;

    if (expectedParent && currentGroup && currentPrimaryLabel === expectedParent) {
      currentGroup.push(parsed);
      continue;
    }

    groups.push([parsed]);
  }

  return `<ul>${groups
    .map((group) => {
      const [primary, ...secondary] = group;

      if (!primary.label) {
        return `<li>${renderInline(primary.value)}</li>`;
      }

      const primaryItem = `<strong>${renderInline(primary.label)}</strong>: ${renderInline(
        primary.value,
      )}`;

      if (secondary.length === 0) {
        return `<li>${primaryItem}</li>`;
      }

      const nestedItems = secondary
        .map(
          (item) =>
            `<li><strong>${renderInline(item.label)}</strong>: ${renderInline(item.value)}</li>`,
        )
        .join("");

      return `<li>${primaryItem}<ul>${nestedItems}</ul></li>`;
    })
    .join("")}</ul>`;
}

function renderMarkdown(content: string) {
  const normalized = content.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const htmlParts: string[] = [];

  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let codeBuffer: string[] = [];
  let inCodeBlock = false;

  const isLabeledLine = (line: string) =>
    /^[^\s:：][^:：]{0,30}[:：]\s*.+$/.test(line) &&
    !/^(https?:\/\/|#{1,3}\s|[-*]\s|\d+\.\s)/.test(line);

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) {
      return;
    }

    if (paragraphBuffer.every((line) => isLabeledLine(line))) {
      htmlParts.push(renderLabeledLineGroups(paragraphBuffer));
      paragraphBuffer = [];
      return;
    }

    htmlParts.push(`<p>${renderInline(paragraphBuffer.join(" ").trim())}</p>`);
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (listBuffer.length === 0 || listType === null) {
      return;
    }

    if (listType === "ul" && listBuffer.every((item) => isLabeledLine(item))) {
      htmlParts.push(renderLabeledLineGroups(listBuffer));
      listBuffer = [];
      listType = null;
      return;
    }

    htmlParts.push(
      `<${listType}>${listBuffer.map((item) => `<li>${renderInline(item)}</li>`).join("")}</${listType}>`,
    );
    listBuffer = [];
    listType = null;
  };

  const flushCode = () => {
    if (codeBuffer.length === 0) {
      return;
    }

    htmlParts.push(`<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`);
    codeBuffer = [];
  };

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("```")) {
      flushParagraph();
      flushList();

      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }

      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    if (trimmedLine === "") {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = trimmedLine.match(/^(#{1,3})\s+(.*)$/);

    if (headingMatch) {
      flushParagraph();
      flushList();

      const level = headingMatch[1].length;
      htmlParts.push(`<h${level}>${renderInline(headingMatch[2].trim())}</h${level}>`);
      continue;
    }

    const listMatch = trimmedLine.match(/^[-*]\s+(.*)$/);
    const orderedListMatch = trimmedLine.match(/^\d+\.\s+(.*)$/);

    if (listMatch) {
      flushParagraph();
      if (listType === "ol") {
        flushList();
      }
      listType = "ul";
      listBuffer.push(listMatch[1].trim());
      continue;
    }

    if (orderedListMatch) {
      flushParagraph();
      if (listType === "ul") {
        flushList();
      }
      listType = "ol";
      listBuffer.push(orderedListMatch[1].trim());
      continue;
    }

    paragraphBuffer.push(trimmedLine);
  }

  flushParagraph();
  flushList();
  flushCode();

  return htmlParts.join("");
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const html = renderMarkdown(content);

  return (
    <div
      className="markdown-preview prose prose-neutral max-w-none text-sm leading-7"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
