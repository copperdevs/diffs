import { Button } from "@base-ui/react/button";
import { Field } from "@base-ui/react/field";
import { Input } from "@base-ui/react/input";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { type FileContents, MultiFileDiff } from "@pierre/diffs/react";
import { useMemo, useState } from "react";

const DIFF_THEMES = { dark: "pierre-dark", light: "pierre-light" } as const;

const DEFAULT_BEFORE = `export function greet(name: string) {
  if (!name) {
    throw new Error("missing name");
  }

  return \`Hello, \${name}!\`;
}

export function titleCase(value: string) {
  return value
    .split(" ")
    .map((part) => part.at(0)?.toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}`;

const DEFAULT_AFTER = `export function greet(name: string, punctuation = "!") {
  const trimmed = name?.trim();
  if (!trimmed) return "Hi there";

  const greeting = \`Hello, \${trimmed}\${punctuation}\`;
  return punctuation === "!"
    ? greeting
    : \`\${greeting} \${punctuation.repeat(2)}\`;
}

export function titleCase(value: string) {
  return value
    .split(/\\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toLocaleUpperCase() + part.slice(1))
    .join(" ");
}

export function formatList(items: string[]) {
  if (!items.length) return "empty";
  if (items.length === 1) return items[0];

  const [last, ...rest] = items.slice().reverse();
  return \`\${rest.reverse().join(", ")} and \${last}\`;
};`;

type DiffStyleValue = "unified" | "split";

function App() {
	const [leftName, setLeftName] = useState("before.ts");
	const [rightName, setRightName] = useState("after.ts");
	const [leftContent, setLeftContent] = useState(DEFAULT_BEFORE);
	const [rightContent, setRightContent] = useState(DEFAULT_AFTER);
	const [diffStyle, setDiffStyle] = useState<DiffStyleValue>("split");

	const oldFile: FileContents = useMemo(
		() => ({
			name: leftName.trim() || "before",
			contents: leftContent,
			lang: "text",
		}),
		[leftContent, leftName],
	);

	const newFile: FileContents = useMemo(
		() => ({
			name: rightName.trim() || "after",
			contents: rightContent,
			lang: "text",
		}),
		[rightContent, rightName],
	);

	const swapSides = () => {
		setLeftContent(rightContent);
		setRightContent(leftContent);
		setLeftName(rightName);
		setRightName(leftName);
	};

	const handleDiffStyleChange = (
		groupValue: DiffStyleValue[],
		_eventDetails: unknown,
	) => {
		const next = groupValue[0];
		if (next) {
			setDiffStyle(next);
		}
	};

	return (
		<div className="app-shell">
			<header className="app-header">
				<div className="app-title">
					<h1>Diff playground</h1>
				</div>
				<div className="app-actions">
					<ToggleGroup
						className="segmented-control"
						value={[diffStyle]}
						onValueChange={handleDiffStyleChange}
						aria-label="Diff view style"
					>
						<Toggle value="split" className="segment">
							Split
						</Toggle>
						<Toggle value="unified" className="segment">
							Unified
						</Toggle>
					</ToggleGroup>
					<Button
						className="ghost-button"
						type="button"
						onClick={swapSides}
					>
						Swap sides
					</Button>
				</div>
			</header>

			<div className="editor-grid">
				<div className="panel">
					<div className="panel-heading">
						<Field.Root className="field">
							<Field.Label
								className="field-label"
								htmlFor="before-name"
							>
								<span className="panel-title">Before</span>
							</Field.Label>
							<Input
								id="before-name"
								className="text-input"
								value={leftName}
								onValueChange={(value) => setLeftName(value)}
								placeholder="Filename"
								aria-label="Before filename"
							/>
						</Field.Root>
					</div>
					<textarea
						className="code-area"
						value={leftContent}
						onChange={(event) => setLeftContent(event.target.value)}
						rows={14}
						spellCheck="false"
						aria-label="Before content"
					/>
				</div>

				<div className="panel">
					<div className="panel-heading">
						<Field.Root className="field">
							<Field.Label
								className="field-label"
								htmlFor="after-name"
							>
								<span className="panel-title">After</span>
							</Field.Label>
							<Input
								id="after-name"
								className="text-input"
								value={rightName}
								onValueChange={(value) => setRightName(value)}
								placeholder="Filename"
								aria-label="After filename"
							/>
						</Field.Root>
					</div>
					<textarea
						className="code-area"
						value={rightContent}
						onChange={(event) =>
							setRightContent(event.target.value)
						}
						rows={14}
						spellCheck="false"
						aria-label="After content"
					/>
				</div>
			</div>

			<div className="diff-card">
				<div className="diff-inner">
					<MultiFileDiff
						oldFile={oldFile}
						newFile={newFile}
						options={{
							theme: DIFF_THEMES,
							themeType: "dark",
							diffStyle,
							diffIndicators: "bars",
							lineDiffType: "word-alt",
							disableLineNumbers: false,
							overflow: "scroll",
							disableFileHeader: false,
						}}
						style={{ height: "100%", width: "100%" }}
					/>
				</div>
			</div>
		</div>
	);
}

export default App;
