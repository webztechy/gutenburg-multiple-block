console.log("Grid Gallery Running....");

import { registerBlockType } from "@wordpress/blocks";
import metadata from "./block.json";
import Edit from "./edit";
import Save from "./save";

import "./style.scss";
import "./editor.scss";

registerBlockType(metadata.name, {
  edit: Edit,
  save: Save,
});

// export default {
//   name: metadata.name,
//   settings: {
//     ...metadata,
//     edit: Edit,
//     save: Save,
//   },
// };
