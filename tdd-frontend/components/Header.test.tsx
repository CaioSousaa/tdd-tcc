import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter, usePathname } from "next/navigation";
import Header from "./Header";

jest.mock("@/lib/axios");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));
jest.mock("./NotificationCenter", () => () => <div data-testid="notification-center" />);

const mockPush = jest.fn();

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  (usePathname as jest.Mock).mockReturnValue("/tasks");
  jest.clearAllMocks();
  Storage.prototype.removeItem = jest.fn();
});

describe("RF15 - Header: Menu do Usuário", () => {
  it("renderiza o NotificationCenter", () => {
    render(<Header />);
    expect(screen.getByTestId("notification-center")).toBeInTheDocument();
  });

  it("renderiza o link ou botão de configurações", () => {
    render(<Header />);
    expect(
      screen.getByRole("link", { name: /configura/i }) ||
      screen.getByRole("button", { name: /configura/i })
    ).toBeTruthy();
  });

  it("renderiza o botão de logout", () => {
    render(<Header />);
    expect(screen.getByTitle(/sair/i)).toBeInTheDocument();
  });

  it("logout remove o token do localStorage e redireciona para /", () => {
    render(<Header />);

    fireEvent.click(screen.getByTitle(/sair/i));

    expect(localStorage.removeItem).toHaveBeenCalledWith("token");
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("não renderiza o header nas páginas de login e registro", () => {
    (usePathname as jest.Mock).mockReturnValue("/");

    const { container } = render(<Header />);
    expect(container.firstChild).toBeNull();
  });
});
