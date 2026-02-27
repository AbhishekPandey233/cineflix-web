import { render, screen } from "@testing-library/react";
import ClientShell from "@/app/ClientShell";

jest.mock("@/app/(navigation)/Header", () => {
  const HeaderMock = () => <div>HeaderMock</div>;
  HeaderMock.displayName = "HeaderMock";
  return HeaderMock;
});

jest.mock("@/app/(navigation)/Footer", () => {
  const FooterMock = () => <div>FooterMock</div>;
  FooterMock.displayName = "FooterMock";
  return FooterMock;
});

const usePathnameMock = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

describe("ClientShell", () => {
  it("hides header on admin routes", () => {
    usePathnameMock.mockReturnValue("/admin/users");

    render(
      <ClientShell>
        <div>Content</div>
      </ClientShell>
    );

    expect(screen.queryByText("HeaderMock")).not.toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("shows footer on /home", () => {
    usePathnameMock.mockReturnValue("/home");

    render(
      <ClientShell>
        <div>Content</div>
      </ClientShell>
    );

    expect(screen.getByText("HeaderMock")).toBeInTheDocument();
    expect(screen.getByText("FooterMock")).toBeInTheDocument();
  });

  it("does not show footer on non-footer route", () => {
    usePathnameMock.mockReturnValue("/login");

    render(
      <ClientShell>
        <div>Content</div>
      </ClientShell>
    );

    expect(screen.getByText("HeaderMock")).toBeInTheDocument();
    expect(screen.queryByText("FooterMock")).not.toBeInTheDocument();
  });
});
