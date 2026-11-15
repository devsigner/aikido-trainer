// Card of a technique, shared by the draw and program views.
import { h } from "./framework/vdom.js";
import { askVideo } from "./update-video.js";

// Key and class of the animated card: a new key replaces the element and restarts the animation.
export const slideProps = ({ direction, count }) => ({ key: count, className: direction ? `card slide-${direction}` : "card" });

// The `prefix` is used to generate the element ids.
export const card = (prefix, { waza = "", attack = "", technique = "", form = "", badges = "", note = "", video = "", warnVideo = false }, id = prefix, extra = {}) =>
  h("div", { id, className: "card", ...extra },
    h("div", { id: `${prefix}-waza`, className: "waza" }, waza),
    h("div", { id: `${prefix}-attack`, className: "attack" }, attack),
    h("div", { id: `${prefix}-technique`, className: "technique" }, technique),
    h("div", { id: `${prefix}-form`, className: "form" }, form),
    h("div", { id: `${prefix}-badges`, className: "badges" }, badges),
    h("div", { id: `${prefix}-note`, className: "note" }, note),
    video ? h("a", { id: `${prefix}-video`, className: "video", href: video, target: "_blank", rel: "noopener", onClick: warnVideo ? askVideo(video) : null }, "▶ Voir la vidéo") : null,
  );
