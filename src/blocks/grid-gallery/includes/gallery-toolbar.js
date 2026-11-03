import { BlockControls } from "@wordpress/block-editor";

import { ToolbarDropdownMenu, ToolbarGroup } from "@wordpress/components";

export function GalleryToolbar({ setAttributes, columns }) {
  return (
    <BlockControls>
      <ToolbarGroup>
        <ToolbarDropdownMenu
          icon="screenoptions"
          label="Gap"
          controls={[
            {
              title: "10",
              onClick: () => setAttributes({ gap: 10 }),
            },
            {
              title: "20",
              onClick: () => setAttributes({ gap: 20 }),
            },
            {
              title: "30",
              onClick: () => setAttributes({ gap: 30 }),
            },
            {
              title: "40",
              onClick: () => setAttributes({ gap: 40 }),
            },
            {
              title: "50",
              onClick: () => setAttributes({ gap: 50 }),
            },
          ]}
        />

        <ToolbarDropdownMenu
          icon="columns"
          label="Gallery Columns"
          controls={[
            {
              title: "2 Columns",
              onClick: () => setAttributes({ columns: 2 }),
            },
            {
              title: "3 Columns",
              onClick: () => setAttributes({ columns: 3 }),
            },
            {
              title: "4 Columns",
              onClick: () => setAttributes({ columns: 4 }),
            },
            {
              title: "5 Columns",
              onClick: () => setAttributes({ columns: 5 }),
            },
            {
              title: "6 Columns",
              onClick: () => setAttributes({ columns: 6 }),
            },
          ]}
        />
      </ToolbarGroup>
    </BlockControls>
  );
}

/* 
<ToolbarDropdownMenu
    icon="grid-view"
    label={__("Gallery Layout", R3MI_BLOCK_SLUG_GRID)}
    controls={[
        {
            title: __("Grid", R3MI_BLOCK_SLUG_GRID),
            icon: "grid-view",
            isActive: layout === "grid",
            onClick: () => setAttributes({ layout: "grid" }),
        },
        {
            title: __("Masonry", R3MI_BLOCK_SLUG_GRID),
            icon: "screenoptions",
            isActive: layout === "masonry",
            onClick: () => setAttributes({ layout: "masonry" }),
        },
    ]}
/> */
