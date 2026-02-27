import { ReactElement } from "react";
import { render } from "@testing-library/react";

export const renderUI = (ui: ReactElement) => render(ui);
