import * as React from "react";
import * as Toolbar from "@radix-ui/react-toolbar";
import {
	StrikethroughIcon,
	AlignLeftIcon,
	AlignCenterIcon,
	AlignRightIcon,
	BoldIcon,
	ItalicIcon,
} from "lucide-react";
import "./styles.css";

const ToolbarDemo = () => (
	<Toolbar.Root className="ToolbarRoot" aria-label="Formatting options">
		<Toolbar.ToggleGroup type="multiple" aria-label="Text formatting">
			<Toolbar.ToggleItem
				className="ToolbarToggleItem"
				value="bold"
				aria-label="Bold"
			>
				<BoldIcon />
			</Toolbar.ToggleItem>
			<Toolbar.ToggleItem
				className="ToolbarToggleItem"
				value="italic"
				aria-label="Italic"
			>
				<ItalicIcon />
			</Toolbar.ToggleItem>
			<Toolbar.ToggleItem
				className="ToolbarToggleItem"
				value="strikethrough"
				aria-label="Strike through"
			>
				<StrikethroughIcon />
			</Toolbar.ToggleItem>
		</Toolbar.ToggleGroup>
		<Toolbar.Separator className="ToolbarSeparator" />
		<Toolbar.ToggleGroup
			type="single"
			defaultValue="center"
			aria-label="Text alignment"
		>
			<Toolbar.ToggleItem
				className="ToolbarToggleItem"
				value="left"
				aria-label="Left aligned"
			>
				<AlignLeftIcon />
			</Toolbar.ToggleItem>
			<Toolbar.ToggleItem
				className="ToolbarToggleItem"
				value="center"
				aria-label="Center aligned"
			>
				<AlignCenterIcon />
			</Toolbar.ToggleItem>
			<Toolbar.ToggleItem
				className="ToolbarToggleItem"
				value="right"
				aria-label="Right aligned"
			>
				<AlignRightIcon />
			</Toolbar.ToggleItem>
		</Toolbar.ToggleGroup>
		<Toolbar.Separator className="ToolbarSeparator" />
		<Toolbar.Link
			className="ToolbarLink"
			href="#"
			target="_blank"
			style={{ marginRight: 10 }}
		>
			Edited 2 hours ago
		</Toolbar.Link>
		<Toolbar.Button className="ToolbarButton" style={{ marginLeft: "auto" }}>
			Share
		</Toolbar.Button>
	</Toolbar.Root>
);

export default ToolbarDemo;
