// src/features/video.js

// Feature "video": confirmation modal before opening a video.
// Standalone feature (see src/framework/combine.js): its model, update, view and effects are all here.
import { h } from "../framework/vdom.js";
import { to } from "../framework/combine.js";

export const SKIP_VIDEO_WARNING_KEY = "aikido.skipVideoWarning";

export const initialModel = {
  skipWarning: false, // persisted preference: open videos without the confirmation
  prompt: null, // { url, dontAsk } while the confirmation modal is open
};

const messages = {
  AskVideo: (model, msg) => [{ ...model, prompt: { url: msg.url, dontAsk: false } }, []],

  SetDontAsk: (model, msg) => [{ ...model, prompt: { ...model.prompt, dontAsk: msg.checked } }, []],

  CancelVideo: (model) => [{ ...model, prompt: null }, []],

  ConfirmVideo(model) {
    const { url, dontAsk } = model.prompt;
    const save = dontAsk ? [{ type: "SaveSkipVideoWarning" }] : [];
    return [{ ...model, prompt: null, skipWarning: model.skipWarning || dontAsk }, [...save, { type: "OpenUrl", url }]];
  },
};

// Click handler for a video link: asks for confirmation first (to be used by the other views).
export const askVideo = (url) => (event) => {
  event.preventDefault?.();
  return to("video", { type: "AskVideo", url });
};

// Link to a video: it asks for confirmation first, unless the user chose not to be asked again.
export const videoLink = (root, url, id) =>
  h("a", { id, className: "video", href: url, target: "_blank", rel: "noopener", onClick: root.video.skipWarning ? null : askVideo(url) }, "▶ Voir la vidéo");

// The modal, with the messages of this feature only (the root view embeds it).
function view(model) {
  const { prompt } = model;
  return prompt && h("div", { id: "video-modal", className: "modal-backdrop" },
    h("div", { className: "modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "video-modal-text" },
      h("p", { id: "video-modal-text" }, "Attention la technique de la vidéo n'est peut-être pas exactement celle attendue lors de votre passage. Voulez-vous vraiment aller voir cette vidéo ?"),
      h("label", { className: "field" },
        h("input", { type: "checkbox", id: "video-dont-ask", checked: prompt.dontAsk, onChange: (event) => ({ type: "SetDontAsk", checked: event.target.checked }) }),
        " Ne plus afficher ce message"),
      h("div", { className: "buttons" },
        h("button", { id: "video-confirm", onClick: { type: "ConfirmVideo" } }, "Voir la vidéo"),
        h("button", { id: "video-cancel", className: "secondary", onClick: { type: "CancelVideo" } }, "Annuler"))));
}

export const video = {
  name: "video",
  init: ({ skipVideoWarning = false } = {}) => [{ ...initialModel, skipWarning: skipVideoWarning }, []],
  update(model, msg) {
    if (!messages[msg.type]) throw new Error(`Unknown message : ${msg.type}`);
    return messages[msg.type](model, msg);
  },
  view,
  // Opening the video, remembering the preference.
  effects: ({ open, storage }) => ({
    OpenUrl: ({ url }) => open?.(url, "_blank", "noopener"),
    SaveSkipVideoWarning: () => {
      try {
        storage?.setItem(SKIP_VIDEO_WARNING_KEY, "1");
      } catch {
        // Storage unavailable (private mode): the preference only lasts for this visit.
      }
    },
  }),
};
