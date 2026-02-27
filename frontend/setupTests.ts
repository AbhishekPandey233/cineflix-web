import "@testing-library/jest-dom";
import React from "react";

// Lightweight mock for next/image so page/component tests can render in jsdom.
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    const { alt, fill, priority, ...rest } = props;
    return React.createElement("img", { alt, ...rest });
  },
}));