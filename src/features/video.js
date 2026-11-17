// src/features/video.js

// Feature "video": confirmation modal before opening a video.
// Standalone feature (see framework/elmer/feature.js): its model, update, view and effects are all here.
import { cmd, defineFeature, h, to } from "../../framework/elmer/index.js";

export const SKIP_VIDEO_WARNING_KEY = "aikido.skipVideoWarning";

export const feature = defineFeature({
  name: "video",
  initialState: {
    skipWarning: false, // persisted preference: open videos without the confirmation
    prompt: null, // { url, dontAsk } while the confirmation modal is open
  },
  init: ({ skipVideoWarning = false } = {}, model) => ({ ...model, skipWarning: skipVideoWarning }),
  messages: {
    AskVideo: askVideoMessage,
    SetDontAsk: setDontAskMessage,
    CancelVideo: cancelVideoMessage,
    ConfirmVideo: confirmVideoMessage
  },
  view,
  views: { link: videoLinkView },
  effects: ({ open, storage }) => ({
    OpenUrl: ({ url }) => open?.(url, "_blank", "noopener"),
    SaveSkipVideoWarning: () => saveSkipWarning(storage),
  }),
});

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

// Link to a video: it asks for confirmation first, unless the user chose not to be asked again.
function videoLinkView(root, url, id) {
  return h("a", { id, className: "video", href: url, target: "_blank", rel: "noopener", onClick: root.video.skipWarning ? null : askVideo(url) }, "▶ Voir la vidéo");
}

// return Msg
function askVideoMessage(model, { url }) {
  return { ...model, prompt: { url, dontAsk: false } };
}

// return Msg
function setDontAskMessage(model, { checked }) {
  return { ...model, prompt: { ...model.prompt, dontAsk: checked } };
}

// return Msg
function cancelVideoMessage(model) {
  return { ...model, prompt: null };
}

// return Msg
function confirmVideoMessage(model) {
  const { url, dontAsk } = model.prompt;
  const commands = dontAsk ? [cmd("SaveSkipVideoWarning"), cmd("OpenUrl", { url })] : cmd("OpenUrl", { url });
  return [{ ...model, prompt: null, skipWarning: model.skipWarning || dontAsk }, commands];
}

// Remembers the preference.
function saveSkipWarning(storage) {
  try {
    storage?.setItem(SKIP_VIDEO_WARNING_KEY, "1");
  } catch {
    // Storage unavailable (private mode): the preference only lasts for this visit.
  }
}

// Click handler for a video link: asks for confirmation first (to be used by the other views).
function askVideo(url) {
  return (event) => {
    event.preventDefault?.();
    return to("video", { type: "AskVideo", url });
  };
}
