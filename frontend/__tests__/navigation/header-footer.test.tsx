import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "@/app/(navigation)/Header";
import Footer from "@/app/(navigation)/Footer";

const getMock = jest.fn();
const postMock = jest.fn();
const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    defaults: { baseURL: "http://localhost:5000" },
    get: (...args: unknown[]) => getMock(...args),
    post: (...args: unknown[]) => postMock(...args),
  },
}));

describe("Header and Footer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Footer renders brand and contact info", () => {
    render(<Footer />);

    expect(screen.getByText("CineFlix")).toBeInTheDocument();
    expect(screen.getByText("support@cineflix.com")).toBeInTheDocument();
  });

  it("Header shows login buttons when not authenticated", async () => {
    getMock.mockRejectedValueOnce(new Error("unauthorized"));
    render(<Header />);

    expect(await screen.findByRole("link", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument();
  });

  it("Header shows Profile button when authenticated", async () => {
    getMock.mockResolvedValueOnce({ data: { data: { _id: "u1" } } });
    render(<Header />);

    expect(await screen.findByRole("button", { name: "Open profile panel" })).toBeInTheDocument();
  });

  it("opens profile drawer on profile button click", async () => {
    const user = userEvent.setup();
    getMock.mockResolvedValueOnce({ data: { data: { _id: "u1" } } });
    getMock.mockResolvedValueOnce({ data: { data: { name: "User", email: "user@test.com" } } });

    render(<Header />);

    await user.click(await screen.findByRole("button", { name: "Open profile panel" }));

    expect(await screen.findByText("Your Profile")).toBeInTheDocument();
  });
});
