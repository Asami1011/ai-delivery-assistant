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
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function renderMarkdown(content: string) {
  const normalized = content.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const htmlParts: string[] = [];

  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];
  let codeBuffer: string[] = [];
  let inCodeBlock = false;

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) {
      return;
    }

    htmlParts.push(`<p>${renderInline(paragraphBuffer.join(" ").trim())}</p>`);
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (listBuffer.length === 0) {
      return;
    }

    htmlParts.push(
      `<ul>${listBuffer.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`,
    );
    listBuffer = [];
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

    if (listMatch) {
      flushParagraph();
      listBuffer.push(listMatch[1].trim());
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
