import {
	type FileContents,
	MultiFileDiff,
	type SupportedLanguages,
} from "@pierre/diffs/react";
import {
	Box,
	Button,
	Card,
	Flex,
	Grid,
	SegmentedControl,
	Select,
	Separator,
	Switch,
	Text,
	TextArea,
	TextField,
} from "@radix-ui/themes";
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

	return (
		<Box
			p="4"
			style={{
				height: "100dvh",
				display: "flex",
				flexDirection: "column",
				gap: "16px",
			}}
		>
			<Flex align="center" justify="between">
				<Flex gap="2" align="baseline">
					<Text weight="bold" size="6">
						Diff playground
					</Text>
					<Text color="gray" size="2">
						Paste code on the left and right, then tune how the diff
						renders.
					</Text>
				</Flex>
				<Flex gap="4" align="center">
					<SegmentedControl.Root
						value={diffStyle}
						onValueChange={(value) =>
							setDiffStyle(value as DiffStyleValue)
						}
					>
						<SegmentedControl.Item value="split">
							Split
						</SegmentedControl.Item>
						<SegmentedControl.Item value="unified">
							Unified
						</SegmentedControl.Item>
					</SegmentedControl.Root>
					<Button variant="ghost" onClick={swapSides}>
						Swap sides
					</Button>
				</Flex>
			</Flex>

			<Grid columns="1fr 1fr" gap="3">
				<Card>
					<Flex direction="column" gap="3">
						<Flex direction="column" gap="1">
							<Text weight="medium">Before</Text>
							<TextField.Root
								value={leftName}
								onChange={(event) =>
									setLeftName(event.target.value)
								}
								placeholder="Filename"
							/>
						</Flex>
						<TextArea
							value={leftContent}
							onChange={(event) =>
								setLeftContent(event.target.value)
							}
							rows={14}
							style={{ fontFamily: "var(--code-font-family)" }}
						/>
					</Flex>
				</Card>

				<Card>
					<Flex direction="column" gap="3">
						<Flex direction="column" gap="1">
							<Text weight="medium">After</Text>
							<TextField.Root
								value={rightName}
								onChange={(event) =>
									setRightName(event.target.value)
								}
								placeholder="Filename"
							/>
						</Flex>
						<TextArea
							value={rightContent}
							onChange={(event) =>
								setRightContent(event.target.value)
							}
							rows={14}
							style={{ fontFamily: "var(--code-font-family)" }}
						/>
					</Flex>
				</Card>
			</Grid>

			<Card style={{ flex: 1, minHeight: "320px", padding: 0 }}>
				<Box p="0" style={{ height: "100%", overflow: "auto" }}>
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
				</Box>
			</Card>
		</Box>
	);
}

export default App;
