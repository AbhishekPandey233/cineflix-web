import { render, screen } from "@testing-library/react";
import AboutPage from "@/app/about/page";

describe("AboutPage", () => {
  it("renders heading", () => {
    render(<AboutPage />);

    expect(screen.getByText("About CineFlix")).toBeInTheDocument();
  });

  it("renders help and support section", () => {
    render(<AboutPage />);

    expect(screen.getByText("Help & Support")).toBeInTheDocument();
  });
});
