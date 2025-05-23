import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

const TooltipDemo = () => {
	return (
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger asChild>
					<button className="IconButton">
						+
					</button>
				</Tooltip.Trigger>
				<Tooltip.Portal>
					<Tooltip.Content className="TooltipContent" sideOffset={5}>
						Add to library
						<Tooltip.Arrow className="TooltipArrow" />
					</Tooltip.Content>
				</Tooltip.Portal>
			</Tooltip.Root>
		</Tooltip.Provider>
	);
};

export default TooltipDemo;
