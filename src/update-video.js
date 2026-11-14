// Feature "video": confirmation modal before opening a video.
// Owns: skipVideoWarning, videoPrompt.

export const SKIP_VIDEO_WARNING_KEY = "aikido.skipVideoWarning";

export const initialModel = {
  skipVideoWarning: false, // persisted preference: open videos without the confirmation
  videoPrompt: null, // { url, dontAsk } while the confirmation modal is open
};

export const updateHandler = {
  AskVideo: (model, msg) => [{ ...model, videoPrompt: { url: msg.url, dontAsk: false } }, []],

  SetDontAsk: (model, msg) => [{ ...model, videoPrompt: { ...model.videoPrompt, dontAsk: msg.checked } }, []],

  CancelVideo: (model) => [{ ...model, videoPrompt: null }, []],

  ConfirmVideo(model) {
    const { url, dontAsk } = model.videoPrompt;
    const save = dontAsk ? [{ type: "SaveSkipVideoWarning" }] : [];
    return [{ ...model, videoPrompt: null, skipVideoWarning: model.skipVideoWarning || dontAsk }, [...save, { type: "OpenUrl", url }]];
  },
};

// Effects of the feature: opening the video, remembering the preference.
export const effectHandler = ({ open, storage }) => ({
  OpenUrl: ({ url }) => open?.(url, "_blank", "noopener"),
  SaveSkipVideoWarning: () => {
    try {
      storage?.setItem(SKIP_VIDEO_WARNING_KEY, "1");
    } catch {
      // Storage unavailable (private mode): the preference only lasts for this visit.
    }
  },
});
