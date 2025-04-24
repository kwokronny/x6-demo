import {
  CSSObject,
  defineConfig,
  presetUno,
  transformerDirectives,
} from "unocss";

let spacing: Record<string, string> = {};
for (let i = 1; i <= 6; i++) {
  spacing[`m${i}`] = `${i * 8}px`;
}

let fontSize: Record<string, [string, CSSObject]> = {
  //display[large|middle|small]
  dl: ["57px", { "line-height": "64px", "font-weight": 400 }],
  dm: ["45px", { "line-height": "52px", "font-weight": 400 }],
  ds: ["36px", { "line-height": "44px", "font-weight": 400 }],
  //header[large|middle|small]
  hl: ["32px", { "line-height": "40px", "font-weight": 400 }],
  hm: ["28px", { "line-height": "36px", "font-weight": 400 }],
  hs: ["24px", { "line-height": "32px", "font-weight": 400 }],
  //title[large|middle|small]
  tl: ["22px", { "line-height": "28px", "font-weight": 400 }],
  tm: ["16px", { "line-height": "24px", "font-weight": 500 }],
  ts: ["14px", { "line-height": "20px", "font-weight": 500 }],
  //label[large|middle|small]
  ll: ["14px", { "line-height": "20px", "font-weight": 500 }],
  lm: ["12px", { "line-height": "16px", "font-weight": 500 }],
  ls: ["11px", { "line-height": "16px", "font-weight": 500 }],
  //body[large|middle|small]
  bl: ["16px", { "line-height": "24px", "font-weight": 400 }],
  bm: ["14px", { "line-height": "20px", "font-weight": 400 }],
  bs: ["12px", { "line-height": "16px", "font-weight": 400 }],
};

export default defineConfig({
  presets: [presetUno()],
  transformers: [transformerDirectives()],
  // ...UnoCSS options
  theme: {
    spacing,
    fontSize,
    colors: {
      brand: {
        DEFAULT: "#67d9be",
        900: "#F0FBF8",
      },
      "sec-brand": "#f1bf4e",
      success: "#27ae60",
      warning: "#FDB10C",
      danger: "#F03D3D",
      info: "#42454c",
      info3: "#56CCF2",
      info4: "#93CE6A",
      info5: "#ECD400",
      info6: "#9B51E0",
      primary: "#2B394C",
      regular: "#707070",
      secondary: "#989dab",
      placeholder: "#c2cfE0",
      border: "#DFE5EB",
    },
    borderRadius: {
      sm: "8px",
      lg: "16px",
    },
    boxShadow: {
      node: "0px 6px 18px 0px rgba(0, 0, 0, 0.06)",
      btn: "0px 3px 6px 0px rgba(0, 0, 0, 0.12)",
    },
  },
  shortcuts: [
    {
      btn: "text-center rounded-full py-[10px] px-m2 text-ll",
      "btn-outline":
        "b-1 b-solid b-border bg-white text-brand cursor-pointer hover:( bg-brand text-white b-brand )",
    },
  ],
});
