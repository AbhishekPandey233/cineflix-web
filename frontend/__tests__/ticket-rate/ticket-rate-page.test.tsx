import TicketRateRedirect from "@/app/ticket-rate/page";
import { redirect } from "next/navigation";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("TicketRateRedirect", () => {
  it("redirects to history", () => {
    TicketRateRedirect();

    expect(redirect).toHaveBeenCalledWith("/history");
  });
});
